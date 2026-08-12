import type { AuthUser, Env, JwtPayload } from "../types";
import { getSql } from "./db";
import { verifyJwt } from "./crypto";

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function getCookieToken(request: Request): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  const session = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("jinbiz_session="));
  return session ? decodeURIComponent(session.slice("jinbiz_session=".length)) : null;
}

function getAuthToken(request: Request): string | null {
  const path = new URL(request.url).pathname;
  const bearer = getBearerToken(request);
  const cookie = getCookieToken(request);
  return path.startsWith("/api/v1/") ? bearer : (cookie ?? bearer);
}

export async function getAuthUser(request: Request, env: Env): Promise<AuthUser | null> {
  const token = getAuthToken(request);
  if (!token || !env.JWT_SECRET) return null;
  const payload = await verifyJwt<JwtPayload & Record<string, unknown>>(token, env.JWT_SECRET);
  if (!payload) return null;
  if (payload.token_type === "refresh") return null;
  if (payload.token_type !== undefined && payload.token_type !== "access") return null;
  const userId = Number(payload.sub);
  if (!Number.isInteger(userId) || userId <= 0) return null;
  const sql = getSql(env);
  if (payload.token_type === "access" && payload.session_id) {
    const sessionRows = await sql`
      SELECT id
      FROM auth_sessions
      WHERE session_jti = ${String(payload.session_id)}
        AND user_id = ${userId}
        AND revoked_at IS NULL
        AND expires_at > now()
      LIMIT 1
    `;
    if (!sessionRows[0]) return null;
  }
  const rows = await sql`
    SELECT u.id, u.email::text AS email, u.name, u.status, u.department_id,
           COALESCE(array_agg(DISTINCT r.code) FILTER (WHERE r.code IS NOT NULL), ARRAY[]::text[]) AS roles,
           COALESCE(array_agg(DISTINCT p.code) FILTER (WHERE p.code IS NOT NULL), ARRAY[]::text[]) AS permissions
    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    LEFT JOIN roles r ON r.id = ur.role_id
    LEFT JOIN role_permissions rp ON rp.role_id = ur.role_id
    LEFT JOIN permissions p ON p.id = rp.permission_id
    WHERE u.id = ${userId} AND u.status = 'active'
    GROUP BY u.id, u.email, u.name, u.status, u.department_id
    LIMIT 1
  `;
  if (!rows[0]) return null;
  return {
    id: Number(rows[0].id),
    email: String(rows[0].email),
    name: String(rows[0].name),
    status: String(rows[0].status),
    departmentId: rows[0].department_id === null || rows[0].department_id === undefined ? null : Number(rows[0].department_id),
    roles: Array.isArray(rows[0].roles) ? rows[0].roles.map(String) : [],
    permissions: Array.isArray(rows[0].permissions) ? rows[0].permissions.map(String) : []
  };
}

export function hasPermission(user: AuthUser, permission: string): boolean {
  return user.permissions.includes(permission);
}
