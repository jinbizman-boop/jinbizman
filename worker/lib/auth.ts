import type { AuthUser, Env, JwtPayload } from "../types";
import { getSql } from "./db";
import { verifyJwt } from "./crypto";

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (match?.[1]) return match[1];
  const cookie = request.headers.get("cookie") ?? "";
  const session = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("jinbiz_session="));
  return session ? decodeURIComponent(session.slice("jinbiz_session=".length)) : null;
}

export async function getAuthUser(request: Request, env: Env): Promise<AuthUser | null> {
  const token = getBearerToken(request);
  if (!token || !env.JWT_SECRET) return null;
  const payload = await verifyJwt<JwtPayload & Record<string, unknown>>(token, env.JWT_SECRET);
  if (!payload) return null;
  const userId = Number(payload.sub);
  if (!Number.isInteger(userId) || userId <= 0) return null;
  const sql = getSql(env);
  const rows = await sql`
    SELECT u.id, u.email::text AS email, u.name, u.status,
           COALESCE(array_agg(DISTINCT p.code) FILTER (WHERE p.code IS NOT NULL), ARRAY[]::text[]) AS permissions
    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    LEFT JOIN role_permissions rp ON rp.role_id = ur.role_id
    LEFT JOIN permissions p ON p.id = rp.permission_id
    WHERE u.id = ${userId} AND u.status = 'active'
    GROUP BY u.id, u.email, u.name, u.status
    LIMIT 1
  `;
  if (!rows[0]) return null;
  return {
    id: Number(rows[0].id),
    email: String(rows[0].email),
    name: String(rows[0].name),
    status: String(rows[0].status),
    permissions: Array.isArray(rows[0].permissions) ? rows[0].permissions.map(String) : []
  };
}

export function hasPermission(user: AuthUser, permission: string): boolean {
  return user.permissions.includes(permission);
}
