import type { Env } from "../types";
import { sha256 } from "./crypto";

export function getRequestId(request: Request): string {
  return request.headers.get("x-request-id")?.trim() || crypto.randomUUID();
}

export function getClientIp(request: Request): string {
  return request.headers.get("cf-connecting-ip")?.trim()
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
}

export async function getClientIpHash(request: Request): Promise<string> {
  return sha256(getClientIp(request));
}

export function getUserAgent(request: Request): string {
  return request.headers.get("user-agent")?.slice(0, 1000) || "unknown";
}

export function isTrustedWriteOrigin(request: Request, env: Env): boolean {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return true;
  if (/^Bearer\s+/i.test(request.headers.get("authorization") || "")) return true;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const allowed = env.ADMIN_ALLOWED_ORIGINS.split(",").map((value) => value.trim()).filter(Boolean);
  return allowed.includes(origin);
}
