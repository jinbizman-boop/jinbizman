import type { Env, JwtPayload } from "../types";
import { getSql } from "../lib/db";
import { getAuthUser } from "../lib/auth";
import { signJwt, verifyPassword } from "../lib/crypto";
import { consumeLoginRateLimit } from "../lib/rate-limit";
import { fail, ok } from "../lib/response";
import { email, readJson, text } from "../lib/validation";
import { getClientIpHash, getRequestId, getUserAgent } from "../lib/request";

async function writeLoginEvent(
  request: Request,
  env: Env,
  input: { userId?: number | null; email: string; eventType: "success" | "failure" | "locked" | "logout"; metadata?: Record<string, unknown> }
): Promise<void> {
  try {
    const sql = getSql(env);
    await sql`
      INSERT INTO login_events (user_id, email, event_type, ip_hash, user_agent, request_id, metadata_json)
      VALUES (
        ${input.userId ?? null}, ${input.email}, ${input.eventType}, ${await getClientIpHash(request)}, ${getUserAgent(request)},
        ${getRequestId(request)}, ${JSON.stringify(input.metadata ?? {})}::jsonb
      )
    `;
  } catch (error) {
    console.error("login_event_write_failed", error instanceof Error ? error.message : error);
  }
}

export async function loginRoute(request: Request, env: Env): Promise<Response> {
  if (!(await consumeLoginRateLimit(request, env))) return fail("RATE_LIMITED", "로그인 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.", 429);
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const emailValue = email(body.email);
  const password = text(body.password, 256, true);
  if (!emailValue || !password) return fail("INVALID_CREDENTIALS", "이메일 또는 비밀번호를 확인해주세요.", 401);
  const sql = getSql(env);
  const rows = await sql`
    SELECT id, email::text AS email, name, password_hash, status, failed_login_count, locked_until
    FROM users WHERE email = ${emailValue} LIMIT 1
  `;
  const row = rows[0];
  const userId = row ? Number(row.id) : null;
  if (row?.locked_until && new Date(String(row.locked_until)).getTime() > Date.now()) {
    await writeLoginEvent(request, env, { userId, email: emailValue, eventType: "locked" });
    return fail("ACCOUNT_LOCKED", "로그인 실패가 반복되어 계정이 잠겼습니다. 잠시 후 다시 시도해주세요.", 423);
  }

  const valid = Boolean(row && row.status === "active" && row.password_hash && await verifyPassword(password, String(row.password_hash)));
  if (!valid) {
    if (row) {
      const current = Number(row.failed_login_count || 0) + 1;
      const shouldLock = current >= 5;
      await sql`
        UPDATE users SET
          failed_login_count = CASE WHEN ${shouldLock} THEN 0 ELSE failed_login_count + 1 END,
          locked_until = CASE WHEN ${shouldLock} THEN now() + interval '15 minutes' ELSE locked_until END,
          updated_at = now()
        WHERE id = ${Number(row.id)}
      `;
      await writeLoginEvent(request, env, { userId, email: emailValue, eventType: shouldLock ? "locked" : "failure", metadata: { failedCount: current } });
    } else {
      await writeLoginEvent(request, env, { email: emailValue, eventType: "failure", metadata: { unknownAccount: true } });
    }
    return fail("INVALID_CREDENTIALS", "이메일 또는 비밀번호를 확인해주세요.", 401);
  }

  const now = Math.floor(Date.now() / 1000);
  const ttl = Math.max(300, Number(env.SESSION_TTL_SECONDS || 3600));
  const payload: JwtPayload = { sub: String(row.id), email: String(row.email), name: String(row.name), iat: now, exp: now + ttl };
  const token = await signJwt(payload, env.JWT_SECRET);
  await sql`
    UPDATE users SET last_login_at = now(), failed_login_count = 0, locked_until = NULL, updated_at = now()
    WHERE id = ${Number(row.id)}
  `;
  await writeLoginEvent(request, env, { userId: Number(row.id), email: String(row.email), eventType: "success" });

  const response = ok({ expiresAt: new Date((now + ttl) * 1000).toISOString(), user: { id: Number(row.id), email: row.email, name: row.name } });
  const headers = new Headers(response.headers);
  const secure = env.APP_ENV === "production" ? "; Secure" : "";
  headers.append("set-cookie", `jinbiz_session=${encodeURIComponent(token)}; Path=/; Max-Age=${ttl}; HttpOnly; SameSite=Strict${secure}`);
  return new Response(response.body, { status: response.status, headers });
}

export async function logoutRoute(request: Request, env: Env): Promise<Response> {
  const user = await getAuthUser(request, env);
  if (user) await writeLoginEvent(request, env, { userId: user.id, email: user.email, eventType: "logout" });
  const response = ok({ loggedOut: true });
  const headers = new Headers(response.headers);
  const secure = env.APP_ENV === "production" ? "; Secure" : "";
  headers.append("set-cookie", `jinbiz_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict${secure}`);
  return new Response(response.body, { status: response.status, headers });
}

export async function meRoute(request: Request, env: Env): Promise<Response> {
  const user = await getAuthUser(request, env);
  return user ? ok(user) : fail("UNAUTHORIZED", "로그인이 필요합니다.", 401);
}
