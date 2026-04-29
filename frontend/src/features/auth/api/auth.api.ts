// Auth API client using JWT tokens + secure httpOnly cookies.
// JWT access tokens: stored in-memory (XSS-safe), included in Authorisation headers.
// Refresh tokens: in httpOnly cookies (managed by backend), used for token refresh.

import { env } from "@/config/env";
const API_BASE = env.BACKEND_API_BASE_URL;

import type { ApiError, TokenOut, UserIn, UserPublic } from "../types";
import {
  clearSession,
  getSession,
  createSession
} from "../cookies/sessionManager";

// Re-export session utilities for convenience
export {
  getSession,
  clearSession,
  createSession,
  hasSession
} from "../cookies/sessionManager";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

// ---- core request wrapper ----
async function request<TResponse>(
  path: string,
  opts: {
    method?: HttpMethod;
    body?: unknown;
    formBody?: Record<string, string>;
    signal?: AbortSignal;
    headers?: Record<string, string>;
  } = {}
): Promise<TResponse> {
  const { method = "GET", body, formBody, signal, headers = {}} = opts;

  const finalHeaders: Record<string, string> = { ...headers };
  if (formBody !== undefined) {
    finalHeaders["Content-Type"] = "application/x-www-form-urlencoded";
  } else if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
  }

  // Add JWT bearer token if available
  const token = await getSession();
  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  let serialisedBody: BodyInit | undefined;
  if (formBody !== undefined) {
    serialisedBody = new URLSearchParams(formBody).toString();
  } else if (body !== undefined) {
    serialisedBody = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: finalHeaders,
    body: serialisedBody,
    signal,
    credentials: "include", // Send/receive httpOnly cookies + refresh tokens, required for session/persistent cookies
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
    const error = {
      status: res.status,
      message: String(message),
      details: payload,
    } as ApiError;
    throw error;
  }

  return payload as TResponse;
}

// async function safeRefresh(): Promise<boolean> {
//   try {
//     await refresh(); // backend uses persistent cookie to renew session cookies + JWT token
//     return true;
//   } catch {
//     return false;
//   }
// }

// ---- Auth endpoints ----

// POST /api/auth/register
export async function register(body: UserIn): Promise<UserPublic> {
  return request<UserPublic>("/register", { 
    method: "POST", 
    formBody: {username: body.username, password: body.password}
  });
}

// POST /api/auth/login
/* Backend should set:
   - session cookie (access/session) always
   - peristent cookie (refresh/remember) if rememberMe = true
*/
export async function login(body: UserIn): Promise<TokenOut> {
  const tokens = await request<TokenOut>("/login", {
    method: "POST",
    formBody: { username: body.username, password: body.password },
  });

  await createSession(tokens.token);

  return tokens;
}

// POST /api/auth/logout 
// Backend clears cookies and JWT token
export async function logout(): Promise<void> {
  try {
    await request<void>("/logout", { method: "POST" });
  } finally {
    clearSession(); // Clears both accessToken and sessionExpiry
  }
}

// GET /api/auth/me
export async function getMe(): Promise<UserPublic> {
  return request<UserPublic>("/me");
}

// POST /api/auth/refresh
// Backend uses persistet cookie to mind/extend session cookie
export async function refresh(): Promise<TokenOut> {
  return request<TokenOut>("/refresh", { method: "POST" });
}
