import type { Env } from "../types";

export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function ok<T>(data: T, init: ResponseInit = {}): Response {
  return json({ success: true, data }, init);
}

export function fail(code: string, message: string, status = 400, details?: unknown): Response {
  return json({ success: false, error: { code, message, ...(details === undefined ? {} : { details }) } }, { status });
}

export function corsHeaders(request: Request, env: Env): Headers {
  const origin = request.headers.get("origin") ?? "";
  const allowed = (env.ADMIN_ALLOWED_ORIGINS || "").split(",").map((value) => value.trim()).filter(Boolean);
  const headers = new Headers({
    "access-control-allow-methods": "GET,POST,PATCH,PUT,OPTIONS",
    "access-control-allow-headers": "content-type,authorization,x-request-id,idempotency-key",
    "access-control-max-age": "86400",
    "vary": "Origin"
  });
  if (origin && allowed.includes(origin)) {
    headers.set("access-control-allow-origin", origin);
    headers.set("access-control-allow-credentials", "true");
  }
  return headers;
}

export function withCors(response: Response, request: Request, env: Env): Response {
  const headers = new Headers(response.headers);
  corsHeaders(request, env).forEach((value, key) => headers.set(key, value));
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
