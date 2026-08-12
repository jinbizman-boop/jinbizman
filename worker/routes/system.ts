import type { AuthUser, Env } from "../types";
import { getAuthUser, hasPermission } from "../lib/auth";
import { writeAuditLog } from "../lib/audit";
import { getSql } from "../lib/db";
import { fail, ok } from "../lib/response";
import { readJson, text } from "../lib/validation";

async function requirePermission(request: Request, env: Env, permission: string): Promise<AuthUser | Response> {
  const user = await getAuthUser(request, env);
  if (!user) return fail("UNAUTHORIZED", "로그인이 필요합니다.", 401);
  if (!hasPermission(user, permission)) return fail("FORBIDDEN", "이 작업을 수행할 권한이 없습니다.", 403);
  return user;
}

export async function systemAuditLogsRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "audit.read");
  if (auth instanceof Response) return auth;
  const url = new URL(request.url);
  const requestedLimit = Number(url.searchParams.get("limit") || 100);
  const limit = Number.isFinite(requestedLimit) ? Math.min(100, Math.max(1, Math.trunc(requestedLimit))) : 100;
  const sql = getSql(env);
  const rows = await sql`
    SELECT a.id, a.request_id, a.actor_user_id, u.name AS actor_name, a.action_type, a.target_type, a.target_id,
           a.scope, a.service_id, a.project_id, a.status_code, a.error_code, a.duration_ms, a.created_at
    FROM audit_logs a
    LEFT JOIN users u ON u.id = a.actor_user_id
    ORDER BY a.created_at DESC
    LIMIT ${limit}
  `;
  return ok({ items: rows, limit });
}

export async function systemSettingsRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "system.read");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const rows = await sql`
    SELECT setting_key, setting_value, description, is_secret_ref, updated_at
    FROM system_settings ORDER BY setting_key ASC
  `;
  return ok({ canonicalHost: "www.jinbizman.com", officialLocales: ["ko", "en", "ja", "fr", "es"], items: rows });
}

export async function systemSettingUpdateRoute(request: Request, env: Env, settingKey: string): Promise<Response> {
  const auth = await requirePermission(request, env, "system.update");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body || body.value === undefined) return fail("VALIDATION_ERROR", "설정 value가 필요합니다.", 422);
  const key = text(settingKey, 160, true);
  if (!key || key.startsWith("secret.")) return fail("FORBIDDEN", "비밀값은 환경 Secrets에서만 변경할 수 있습니다.", 403);
  const sql = getSql(env);
  const beforeRows = await sql`SELECT * FROM system_settings WHERE setting_key = ${key} LIMIT 1`;
  const jsonValue = JSON.stringify(body.value);
  const rows = await sql`
    INSERT INTO system_settings (setting_key, setting_value, description, updated_by)
    VALUES (${key}, ${jsonValue}::jsonb, ${text(body.description, 2000) ?? ""}, ${auth.id})
    ON CONFLICT (setting_key) DO UPDATE SET
      setting_value = EXCLUDED.setting_value,
      description = CASE WHEN EXCLUDED.description <> '' THEN EXCLUDED.description ELSE system_settings.description END,
      updated_by = EXCLUDED.updated_by,
      updated_at = now()
    RETURNING setting_key, setting_value, description, is_secret_ref, updated_at
  `;
  await writeAuditLog(request, env, auth, { actionType: "system.setting.update", targetType: "system_setting", before: beforeRows[0] ?? {}, after: rows[0], metadata: { settingKey: key } });
  return ok(rows[0]);
}

export function systemBusinessDomainsRoute(): Response {
  return ok({
    domains: [
      { code: "ai", label: "인공지능 사업군", moduleCode: "brain", moduleLabel: "사이버트론의 뇌" },
      { code: "materials", label: "신소재 사업군", moduleCode: "frame", moduleLabel: "사이버트론의 골격" },
      { code: "energy", label: "에너지 사업군", moduleCode: "heart", moduleLabel: "사이버트론의 심장" },
      { code: "defense", label: "국방기술 사업군", moduleCode: "shield", moduleLabel: "사이버트론의 방패" },
      { code: "welfare", label: "생활복지 사업군", moduleCode: "senses", moduleLabel: "사이버트론의 감각" }
    ]
  });
}
