/**
 * Scan API client - handles all scan-related backend requests
 * Uses JWT bearer tokens from auth (auto-injected via request wrapper)
 * Requires user to be authenticated (protected endpoints)
 */

import { getSession } from "../../auth/cookies/sessionManager";
import { env } from "../../../config/env";
import type { ApiError, ScanStatus, ScanStreamEvent, Project, ScanSummary, ScanDetail, PagedResponse, ZapAlert, RiskMetric } from "../types";

const API_BASE = env.BACKEND_API_BASE_URL;

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

// ---- core request wrapper (with JWT injection) ----
async function request<TResponse>(
  path: string,
  opts: {
    method?: HttpMethod;
    body?: unknown;
    signal?: AbortSignal;
    headers?: Record<string, string>;
  } = {}
): Promise<TResponse> {
  const { method = "GET", body, signal, headers = {} } = opts;

  const finalHeaders: Record<string, string> = { ...headers };
  if (body !== undefined) finalHeaders["Content-Type"] = "application/json";

  const token = await getSession();
  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: finalHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
    credentials: "include",
  });

  if (res.status === 204) return undefined as unknown as TResponse;

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");

  if (!res.ok) {
    const message =
      (isJson && payload && (payload.detail || payload.message)) ||
      (typeof payload === "string" && payload) ||
      res.statusText ||
      "Request failed";
    const error: ApiError = {
      status: res.status,
      message: String(message),
      details: payload,
    };
    throw error;
  }

  return payload as TResponse;
}

// ---- Project Endpoints ----

/**
 * POST /user/proj
 * Save a new project (domain) for the current user
 */
export async function saveProject(proj: Project) {
  return request<Project>("/user/proj", { method: "POST", body: proj });
}

/**
 * GET /user/proj
 * Fetch all projects for the current user
 */
export async function getProjects(): Promise<Project[]> {
  return request<Project[]>("/user/proj");
}

/**
 * GET /proj/scans?id=<domain_id>
 * Fetch all scans for a given project
 */
export async function getProjectScans(id: number): Promise<ScanSummary[]> {
  return request<ScanSummary[]>(`/proj/scans?id=${id}`);
}

/**
 * GET /proj/{id}/last-scan
 * Fetch last scan of a given domain
 */
export async function getProjectLastScan(id: number): Promise<ScanDetail> {
  return request<ScanDetail>(`/proj/${id}/last-scan`);
}

/**
 * GET /proj/risk-metrics?id=<domain_id>
 * Fetch risk score time-series for a given project
 */
export async function getProjectRiskMetrics(id: number): Promise<RiskMetric[]> {
  return request<RiskMetric[]>(`/proj/risk-metrics?id=${id}`);
}

/**
 * PUT /user/proj
 * Update an existing project's title and description
 */
export async function updateProject(domainId: number, title: string, description: string): Promise<Project> {
  return request<Project>("/user/proj", { method: "PUT", body: { domain_id: domainId, title, description } });
}

/**
 * DELETE /user/proj?proj_id=<id>
 * Delete a project owned by the current user
 */
export async function deleteProject(domainId: number): Promise<void> {
  return request<void>(`/user/proj?proj_id=${domainId}`, { method: "DELETE" });
}

// ---- User Scan History ----

/**
 * POST /user/scan
 * Fetch paginated scan history for the current user
 */
export async function getUserScans(page: number = 1, size: number = 10): Promise<PagedResponse<ScanSummary>> {
  return request<PagedResponse<ScanSummary>>("/user/scan", { method: "POST", body: { page, size } });
}

/**
 * GET /scan/{scanId}
 * Fetch scan metadata for a single historical scan (no alerts blob).
 */
export async function getScanDetail(scanId: number): Promise<ScanDetail> {
  return request<ScanDetail>(`/scan/${scanId}`);
}

/**
 * GET /scan/{scanId}/alerts?page=1&size=20&risk=
 * Fetch a paginated page of ZAP alerts for a completed scan.
 * Optional risk filter: "High" | "Medium" | "Low" | "Informational"
 */
export async function getScanAlerts(
  scanId: number,
  page: number = 1,
  size: number = 20,
  risk?: string,
): Promise<PagedResponse<ZapAlert>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (risk) params.set("risk", risk);
  return request<PagedResponse<ZapAlert>>(`/scan/${scanId}/alerts?${params}`);
}

// ---- Active Scan Endpoints ----

/**
 * POST /scan/active
 * Starts a ZAP scan (spider + active scan) as a background task.
 * Returns immediately with { status: "spidering" }.
 * Poll /scan/status to track progress, then connect to /scan/stream to receive alerts.
 */
export async function startActiveScan(
  url: string,
  domainId?: number,
  zapUsername?: string,
  zapPassword?: string,
  useAjax?: boolean,
): Promise<{ status: string }> {
  const path = useAjax ? "/scan/active?useAjax=true" : "/scan/active";
  return request<{ status: string }>(path, {
    method: "POST",
    body: {
      url,
      domain_id: domainId ?? null,
      zap_username: zapUsername ?? null,
      zap_password: zapPassword ?? null,
    },
  });
}

/**
 * POST /scan/passive
 * Starts a ZAP passive scan (spider only, no active probing).
 * Returns immediately with { status: "spidering" }.
 */
export async function startPassiveScan(
  url: string,
  domainId?: number,
  zapUsername?: string,
  zapPassword?: string,
  useAjax?: boolean,
): Promise<{ status: string }> {
  const path = useAjax ? "/scan/passive?useAjax=true" : "/scan/passive";
  return request<{ status: string }>(path, {
    method: "POST",
    body: {
      url,
      domain_id: domainId ?? null,
      zap_username: zapUsername ?? null,
      zap_password: zapPassword ?? null,
    },
  });
}

/**
 * GET /scan/alerts/counts?url=<url>
 * Returns ZAP alert counts grouped by risk level for the given URL.
 * Keys: "High", "Medium", "Low", "Informational"
 */
export async function getAlertCounts(url: string): Promise<Record<string, number>> {
  return request<Record<string, number>>(`/scan/alerts/counts?url=${encodeURIComponent(url)}`);
}

/**
 * GET /scan/status
 * Returns the current state of the running scan.
 * status: "idle" | "spidering" | "scanning" | "done" | "error"
 * zap_scan_id and progress are only present when status === "scanning" or "done".
 */
export async function getScanStatus(): Promise<ScanStatus> {
  return request<ScanStatus>("/scan/status");
}

/**
 * GET /scan/stream
 * SSE stream of progress and alert events for the given ZAP scan.
 * Connect only after getScanStatus() returns status === "scanning".
 */
export async function* streamScanAlerts(
  zapScanId: string,
  url: string,
  signal?: AbortSignal,
): AsyncGenerator<ScanStreamEvent> {
  const token = await getSession();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const params = new URLSearchParams({ zap_scan_id: zapScanId, url });
  const res = await fetch(`${API_BASE}/scan/stream?${params}`, {
    method: "GET",
    headers,
    signal,
    credentials: "include",
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Stream failed: ${text}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (!json) continue;
      
      const event = JSON.parse(json) as ScanStreamEvent;
      if (event.type === "error") {
        throw new Error(event.message);
      }
      yield event;
    }
  }
}

/**
 * POST /scan/stop
 * Stops any running ZAP scan and spider tasks.
 */
export async function stopActiveScan(): Promise<{ message: string }> {
  return request<{ message: string }>("/scan/stop", { method: "POST" });
}

/**
 * POST /scan/active/clear
 * Clears all ZAP alerts from the current session.
 */
export async function clearAlerts(): Promise<{ message: string }> {
  return request<{ message: string }>("/scan/active/clear", { method: "POST" });
}