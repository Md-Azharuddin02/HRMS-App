// Thin fetch client for the HRMS API. Holds the short-lived access token in memory only;
// the refresh token lives in an httpOnly cookie the browser sends to /auth/* by itself.

const BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "") + "/api/v1";

/** Expected API failure. `message` is safe to show to the user. */
export class ServiceError extends Error {
  constructor(message: string, readonly status = 0, readonly code = "") {
    super(message);
  }
}

let accessToken: string | null = null;
let onUnauthenticated: () => void = () => {};
let refreshHandler: () => Promise<boolean> = async () => false;

export const http = {
  setToken(token: string | null) {
    accessToken = token;
  },
  /** Called when the session can't be renewed (signed out elsewhere, expired). */
  onUnauthenticated(fn: () => void) {
    onUnauthenticated = fn;
  },
  /** How to get a fresh access token; registered by the auth service. */
  setRefreshHandler(fn: () => Promise<boolean>) {
    refreshHandler = fn;
  },
  get: <T>(path: string, query?: Record<string, string | number | undefined>) => request<T>("GET", withQuery(path, query)),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  delete: (path: string) => request<void>("DELETE", path),
};

function withQuery(path: string, query?: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([k, v]) => v !== undefined && v !== "" && params.set(k, String(v)));
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export async function request<T>(method: string, path: string, body?: unknown, retry = true): Promise<T> {
  let res: Response;
  try {
    res = await fetch(BASE + path, {
      method,
      credentials: path.startsWith("/auth/") ? "include" : "omit",
      headers: {
        "X-Requested-With": "fetch",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ServiceError("Can't reach the server. Check your connection and try again.");
  }

  if (res.status === 401 && retry && !path.startsWith("/auth/")) {
    // Access token expired: renew once (the auth service shares one refresh across callers), then replay.
    if (await refreshHandler()) return request<T>(method, path, body, false);
    onUnauthenticated();
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = data?.error;
    throw new ServiceError(err?.message ?? `Request failed (${res.status})`, res.status, err?.code ?? "");
  }
  return data as T;
}
