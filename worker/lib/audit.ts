import type { AuthUser, Env } from "../types";
import { getSql } from "./db";
import { getClientIpHash, getRequestId, getUserAgent } from "./request";

type AuditLogScope = "public" | "admin" | "erp" | "system";

export interface AuditInput {
  actionType: string;
  targetType: string;
  targetId?: number | null;
  scope?: AuditLogScope;
  serviceId?: number | null;
  projectId?: number | null;
  before?: unknown;
  after?: unknown;
  statusCode?: number;
  errorCode?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

const SENSITIVE_AUDIT_KEYS = [
  "password",
  "password_hash",
  "passwordHash",
  "refreshToken",
  "refresh_token",
  "accessToken",
  "access_token",
  "JWT_SECRET",
  "DATABASE_URL",
  "api_key",
  "apiKey",
  "authorization",
  "Authorization",
  "cookie",
  "private_key",
  "privateKey",
  "secret",
  "token",
  "credential",
  "credentials",
] as const;

const REDACTED = "[REDACTED]";

function isSensitiveAuditKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[-_\s]/g, "");
  return SENSITIVE_AUDIT_KEYS.some((sensitiveKey) => {
    const sensitive = sensitiveKey.toLowerCase().replace(/[-_\s]/g, "");
    return normalized === sensitive || normalized.includes(sensitive);
  });
}

export function sanitizeAuditPayload(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return {};
  if (depth > 6) return "[MAX_DEPTH]";
  if (Array.isArray(value)) return value.map((item) => sanitizeAuditPayload(item, depth + 1));
  if (typeof value !== "object") return value;

  const sanitized: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    sanitized[key] = isSensitiveAuditKey(key) ? REDACTED : sanitizeAuditPayload(child, depth + 1);
  }
  return sanitized;
}

function inferAuditScope(request: Request, explicitScope?: AuditLogScope): AuditLogScope {
  if (explicitScope) return explicitScope;
  const path = new URL(request.url).pathname;
  if (path.startsWith("/api/system/")) return "system";
  if (path.startsWith("/api/erp/")) return "erp";
  if (path.startsWith("/api/admin/")) return "admin";
  return "public";
}

export async function writeAuditLog(request: Request, env: Env, actor: AuthUser | null, input: AuditInput): Promise<void> {
  try {
    const sql = getSql(env);
    const requestId = getRequestId(request);
    const ipHash = await getClientIpHash(request);
    const userAgent = getUserAgent(request);
    const scope = inferAuditScope(request, input.scope);
    const beforeJson = JSON.stringify(sanitizeAuditPayload(input.before ?? {}));
    const afterJson = JSON.stringify(sanitizeAuditPayload(input.after ?? {}));
    const metadataJson = JSON.stringify(sanitizeAuditPayload(input.metadata ?? {}));
    await sql`
      INSERT INTO audit_logs (
        request_id, actor_user_id, action_type, target_type, target_id, scope,
        service_id, project_id, before_json, after_json, ip_hash, user_agent,
        status_code, error_code, duration_ms, metadata_json
      ) VALUES (
        ${requestId}, ${actor?.id ?? null}, ${input.actionType}, ${input.targetType}, ${input.targetId ?? null}, ${scope},
        ${input.serviceId ?? null}, ${input.projectId ?? null}, ${beforeJson}::jsonb, ${afterJson}::jsonb, ${ipHash}, ${userAgent},
        ${input.statusCode ?? 200}, ${input.errorCode ?? ""}, ${input.durationMs ?? null}, ${metadataJson}::jsonb
      )
    `;
  } catch (error) {
    console.error("audit_log_write_failed", error instanceof Error ? error.message : error);
  }
}
