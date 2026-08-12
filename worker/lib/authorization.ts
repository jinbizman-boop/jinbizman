import type { AuthUser } from "../types";

export type AuthorizationScope = "global" | "service" | "project" | "team" | "self" | "scope-based" | "none" | "not-applicable";

export type SqlExecutor = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Array<Record<string, unknown>>>;

const GLOBAL_SCOPE_BYPASS_PERMISSIONS = new Set(["system.update"]);
const GLOBAL_SCOPE_BYPASS_ROLES = new Set(["super_admin"]);

function failAuthorization(code: "UNAUTHORIZED" | "FORBIDDEN", message: string, status: 401 | 403): Response {
  return new Response(JSON.stringify({ success: false, error: { code, message } }), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function userHasPermission(user: AuthUser, permission: string): boolean {
  return user.permissions.includes(permission);
}

function userHasRole(user: AuthUser, role: string): boolean {
  return Array.isArray(user.roles) && user.roles.includes(role);
}

export function isAuthorizationFailure(value: unknown): value is Response {
  return value instanceof Response && (value.status === 401 || value.status === 403);
}

export function hasAnyPermission(user: AuthUser, permissions: string | string[]): boolean {
  const required = Array.isArray(permissions) ? permissions : [permissions];
  return required.some((permission) => userHasPermission(user, permission));
}

export function hasGlobalScopeBypass(user: AuthUser, additionalPermissions: string[] = []): boolean {
  if ([...GLOBAL_SCOPE_BYPASS_ROLES].some((role) => userHasRole(user, role))) return true;
  return [...GLOBAL_SCOPE_BYPASS_PERMISSIONS, ...additionalPermissions].some((permission) => userHasPermission(user, permission));
}

export function hasAnyRole(user: AuthUser, roles: string[] = []): boolean {
  return roles.some((role) => userHasRole(user, role));
}

export async function authorizePermission(user: AuthUser | null, permissions: string | string[]): Promise<AuthUser | Response> {
  if (!user) return failAuthorization("UNAUTHORIZED", "로그인이 필요합니다.", 401);
  if (!hasAnyPermission(user, permissions)) return failAuthorization("FORBIDDEN", "이 작업을 수행할 권한이 없습니다.", 403);
  return user;
}

export function assertSelfScope(user: AuthUser, resourceUserId: number | null | undefined, bypassPermission?: string): Response | null {
  if (!resourceUserId) return failAuthorization("FORBIDDEN", "접근 가능한 사용자 범위가 아닙니다.", 403);
  if (Number(resourceUserId) === user.id) return null;
  if (bypassPermission && userHasPermission(user, bypassPermission)) return null;
  if (hasGlobalScopeBypass(user)) return null;
  return failAuthorization("FORBIDDEN", "접근 가능한 사용자 범위가 아닙니다.", 403);
}

export async function assertProjectScope(
  sql: SqlExecutor,
  user: AuthUser,
  projectId: number | null | undefined,
  bypassPermissions: string[] = [],
  bypassRoles: string[] = []
): Promise<Response | null> {
  if (!projectId) return failAuthorization("FORBIDDEN", "접근 가능한 프로젝트 범위가 아닙니다.", 403);
  if (hasAnyRole(user, bypassRoles)) return null;
  if (hasGlobalScopeBypass(user, bypassPermissions)) return null;
  const rows = await sql`
    SELECT id
    FROM project_members
    WHERE project_id = ${projectId}
      AND user_id = ${user.id}
      AND is_active = TRUE
    LIMIT 1
  `;
  return rows[0] ? null : failAuthorization("FORBIDDEN", "접근 가능한 프로젝트 범위가 아닙니다.", 403);
}

export async function assertServiceScope(
  sql: SqlExecutor,
  user: AuthUser,
  serviceId: number | null | undefined,
  bypassPermissions: string[] = [],
  bypassRoles: string[] = []
): Promise<Response | null> {
  if (!serviceId) return failAuthorization("FORBIDDEN", "접근 가능한 서비스 범위가 아닙니다.", 403);
  if (hasAnyRole(user, bypassRoles)) return null;
  if (hasGlobalScopeBypass(user, bypassPermissions)) return null;
  const departmentId = user.departmentId ?? null;
  const rows = await sql`
    SELECT id
    FROM services
    WHERE id = ${serviceId}
      AND (
        operator_user_id = ${user.id}
        OR tech_owner_user_id = ${user.id}
        OR (${departmentId}::bigint IS NOT NULL AND owner_department_id = ${departmentId})
      )
    LIMIT 1
  `;
  return rows[0] ? null : failAuthorization("FORBIDDEN", "접근 가능한 서비스 범위가 아닙니다.", 403);
}

export async function assertTeamScope(
  sql: SqlExecutor,
  user: AuthUser,
  targetUserId: number | null | undefined,
  bypassPermissions: string[] = [],
  bypassRoles: string[] = []
): Promise<Response | null> {
  if (!targetUserId) return failAuthorization("FORBIDDEN", "접근 가능한 팀 범위가 아닙니다.", 403);
  if (Number(targetUserId) === user.id) return null;
  if (hasAnyRole(user, bypassRoles)) return null;
  if (hasGlobalScopeBypass(user, bypassPermissions)) return null;
  if (!user.departmentId) return failAuthorization("FORBIDDEN", "접근 가능한 팀 범위가 아닙니다.", 403);
  const rows = await sql`
    SELECT id
    FROM users
    WHERE id = ${targetUserId}
      AND department_id = ${user.departmentId}
      AND status = 'active'
    LIMIT 1
  `;
  return rows[0] ? null : failAuthorization("FORBIDDEN", "접근 가능한 팀 범위가 아닙니다.", 403);
}
