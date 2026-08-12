import type { Env } from "../types";
import { getSql } from "./db";
import { sha256 } from "./crypto";
import { getClientIp } from "./request";
import { fail } from "./response";

export interface RateLimitPolicy {
  className: "AUTH" | "PUBLIC_WRITE" | "PROTECTED_WRITE" | "HIGH_RISK_WRITE";
  scope: string;
  maxRequests: number;
}

const RATE_LIMIT_WINDOW_SECONDS = 600;

export function rateLimitResponse(message = "Too many requests. Please try again later."): Response {
  const response = fail("RATE_LIMITED", message, 429);
  const headers = new Headers(response.headers);
  headers.set("retry-after", String(RATE_LIMIT_WINDOW_SECONDS));
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export async function consumeRateLimit(request: Request, env: Env, scope: string, maxRequests: number): Promise<boolean> {
  const forwarded = getClientIp(request);
  const key = await sha256(`${scope}:${forwarded}`);
  return consumeRateLimitKey(env, key, maxRequests);
}

export async function consumeApiRateLimit(request: Request, env: Env, policy: RateLimitPolicy, userId?: number | null): Promise<boolean> {
  const identity = userId && Number.isInteger(userId) && userId > 0 ? `user:${userId}` : `ip:${getClientIp(request)}`;
  const key = await sha256(`${policy.className}:${policy.scope}:${identity}`);
  return consumeRateLimitKey(env, key, policy.maxRequests);
}

async function consumeRateLimitKey(env: Env, key: string, maxRequests: number): Promise<boolean> {
  const max = Math.max(1, Math.trunc(maxRequests));
  const sql = getSql(env);
  const rows = await sql`
    INSERT INTO api_rate_limits (bucket_key, request_count, window_started_at, updated_at)
    VALUES (${key}, 1, now(), now())
    ON CONFLICT (bucket_key) DO UPDATE SET
      request_count = CASE
        WHEN api_rate_limits.window_started_at < now() - interval '10 minutes' THEN 1
        ELSE api_rate_limits.request_count + 1
      END,
      window_started_at = CASE
        WHEN api_rate_limits.window_started_at < now() - interval '10 minutes' THEN now()
        ELSE api_rate_limits.window_started_at
      END,
      updated_at = now()
    RETURNING request_count
  `;
  return Number(rows[0]?.request_count ?? max + 1) <= max;
}

export async function consumePublicRateLimit(request: Request, env: Env, scope: string): Promise<boolean> {
  return consumeRateLimit(request, env, scope, Math.max(1, Number(env.PUBLIC_RATE_LIMIT_PER_10_MIN || 20)));
}

export async function consumeLoginRateLimit(request: Request, env: Env): Promise<boolean> {
  return consumeRateLimit(request, env, "auth-login", Math.max(1, Number(env.LOGIN_RATE_LIMIT_PER_10_MIN || 10)));
}
