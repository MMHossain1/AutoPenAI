import { getSession } from "../../auth/cookies/sessionManager";
import { env } from "../../../config/env";
import type { AIChatStreamEvent, AISummaryResponse, ChatMessage, SummaryType } from "../types";
const API_BASE = env.BACKEND_API_BASE_URL

export async function storeSummary(
  scanId: number,
  summaryType: SummaryType,
  content: string,
): Promise<void> {
  const token = await getSession();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/ai/summary`, {
    method: "POST",
    headers,
    body: JSON.stringify({ scan_id: scanId, summary_type: summaryType, content }),
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to save summary: ${text}`);
  }
}

export async function getSavedSummary(
  scanId: number,
  summaryType: SummaryType,
): Promise<AISummaryResponse | null> {
  const token = await getSession();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const params = new URLSearchParams({ scan_id: String(scanId), summary_type: summaryType });
  const res = await fetch(`${API_BASE}/ai/summary?${params}`, { headers, credentials: "include" });

  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to fetch summary: ${text}`);
  }
  return res.json() as Promise<AISummaryResponse>;
}

export async function* streamSummary(
  url: string,
  summaryType: SummaryType,
  signal?: AbortSignal,
  scanId?: number,
): AsyncGenerator<AIChatStreamEvent> {
  const token = await getSession();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const body: Record<string, unknown> = { url, summary_type: summaryType };
  if (scanId != null) body.scan_id = scanId;

  const res = await fetch(`${API_BASE}/ai/sum`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal,
    credentials: "include",
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Summary failed: ${text}`);
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
      const event = JSON.parse(json) as AIChatStreamEvent;
      if (event.type === "error") {
        throw new Error(event.message || "Backend streamed an error event.");
      }
      yield event;
    }
  }
}

export async function* streamChat(
  url: string,
  messages: ChatMessage[],
  summaryType: SummaryType,
  signal?: AbortSignal
): AsyncGenerator<AIChatStreamEvent> {
  const token = await getSession();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({ url, messages, summary_type: summaryType }),
    signal,
    credentials: "include",
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Chat failed: ${text}`);
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
      const event = JSON.parse(json) as AIChatStreamEvent;
      if (event.type === "error") {
        throw new Error(event.message || "Backend streamed an error event.");
      }
      yield event;
    }
  }
}
