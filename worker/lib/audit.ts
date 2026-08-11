import type { AuthUser, Env } from "../types";
import { getSql } from "./db";
import { getClientIpHash, getRequestId, getUserAgent } from "./request";

export interface AuditInput {
  actionType: string;
  targetType: string;
  targetId?: number | null;
  scope?: "global" | "service" | "project" | "team" | "self";
  serviceId?: number | null;
  projectId?: number | null;
  before?: unknown;
  after?: unknown;
  statusCode?: number;
  errorCode?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

export async function writeAuditLog(request: Request, env: Env, actor: AuthUser | null, input: AuditInput): Promise<void> {
  try {
    const sql = getSql(env);
    const requestId = getRequestId(request);
    const ipHash = await getClientIpHash(request);
    const userAgent = getUserAgent(request);
    const beforeJson = JSON.stringify(input.before ?? {});
    const afterJson = JSON.stringify(input.after ?? {});
    const metadataJson = JSON.stringify(input.metadata ?? {});
    await sql`
      INSERT INTO audit_logs (
        request_id, actor_user_id, action_type, target_type, target_id, scope,
        service_id, project_id, before_json, after_json, ip_hash, user_agent,
        status_code, error_code, duration_ms, metadata_json
      ) VALUES (
        ${requestId}, ${actor?.id ?? null}, ${input.actionType}, ${input.targetType}, ${input.targetId ?? null}, ${input.scope ?? "global"},
        ${input.serviceId ?? null}, ${input.projectId ?? null}, ${beforeJson}::jsonb, ${afterJson}::jsonb, ${ipHash}, ${userAgent},
        ${input.statusCode ?? 200}, ${input.errorCode ?? ""}, ${input.durationMs ?? null}, ${metadataJson}::jsonb
      )
    `;
  } catch (error) {
    console.error("audit_log_write_failed", error instanceof Error ? error.message : error);
  }
}
