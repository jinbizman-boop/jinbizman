import type { Env, JwtPayload } from "../types";
import { getSql } from "../lib/db";
import { getAuthUser, getBearerToken } from "../lib/auth";
import { sha256, signJwt, verifyJwt, verifyPassword } from "../lib/crypto";
import { consumeLoginRateLimit, rateLimitResponse } from "../lib/rate-limit";
import { fail, ok } from "../lib/response";
import { email, oneOf, readJson, text } from "../lib/validation";
import { getClientIpHash, getRequestId, getUserAgent } from "../lib/request";

const MOBILE_PLATFORMS = ["ios", "android", "web", "unknown"] as const;

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

function accessTokenTtl(env: Env): number {
  return Math.min(Math.max(300, Number(env.SESSION_TTL_SECONDS || 3600)), 3600);
}

function refreshTokenTtl(env: Env): number {
  return Math.max(3600, Number(env.MOBILE_REFRESH_TTL_SECONDS || 60 * 60 * 24 * 30));
}

function publicUser(row: Record<string, unknown>) {
  return { id: Number(row.id), email: String(row.email), name: String(row.name) };
}

async function issueMobileTokens(
  request: Request,
  env: Env,
  sql: ReturnType<typeof getSql>,
  row: Record<string, unknown>,
  device: { deviceId: string; platform: string; appVersion: string },
  rotatedFromSessionId: number | null = null
) {
  const now = Math.floor(Date.now() / 1000);
  const accessTtl = accessTokenTtl(env);
  const refreshTtl = refreshTokenTtl(env);
  const sessionJti = crypto.randomUUID();
  const accessPayload: JwtPayload = {
    sub: String(row.id),
    iat: now,
    exp: now + accessTtl,
    jti: crypto.randomUUID(),
    session_id: sessionJti,
    token_type: "access"
  };
  const refreshPayload: JwtPayload = {
    sub: String(row.id),
    iat: now,
    exp: now + refreshTtl,
    jti: crypto.randomUUID(),
    session_id: sessionJti,
    token_type: "refresh"
  };
  const accessToken = await signJwt(accessPayload, env.JWT_SECRET);
  const refreshToken = await signJwt(refreshPayload, env.JWT_SECRET);
  await sql`
    INSERT INTO auth_sessions (
      user_id, session_jti, refresh_token_hash, device_id, platform, app_version,
      user_agent, ip_hash, expires_at, rotated_from_session_id
    ) VALUES (
      ${Number(row.id)}, ${sessionJti}, ${await sha256(refreshToken)}, ${device.deviceId},
      ${device.platform}, ${device.appVersion}, ${getUserAgent(request)}, ${await getClientIpHash(request)},
      to_timestamp(${now + refreshTtl}), ${rotatedFromSessionId}
    )
  `;
  return {
    accessToken,
    refreshToken,
    expiresIn: accessTtl,
    refreshExpiresIn: refreshTtl,
    tokenType: "Bearer",
    user: publicUser(row)
  };
}

async function findRefreshSession(env: Env, sql: ReturnType<typeof getSql>, refreshToken: string): Promise<{ payload: JwtPayload; session: Record<string, unknown> } | null> {
  const payload = await verifyJwt<JwtPayload & Record<string, unknown>>(refreshToken, env.JWT_SECRET);
  if (!payload || payload.token_type !== "refresh" || !payload.session_id) return null;
  const userId = Number(payload.sub);
  if (!Number.isInteger(userId) || userId <= 0) return null;
  const rows = await sql`
    SELECT s.*, u.email::text AS email, u.name, u.status AS user_status
    FROM auth_sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.session_jti = ${String(payload.session_id)}
      AND s.user_id = ${userId}
      AND s.refresh_token_hash = ${await sha256(refreshToken)}
      AND s.revoked_at IS NULL
      AND s.expires_at > now()
    LIMIT 1
  `;
  return rows[0] ? { payload, session: rows[0] } : null;
}

function requestRefreshToken(request: Request, body: Record<string, unknown> | null): string | null {
  const fromBody = text(body?.refreshToken, 4096, true);
  return fromBody || getBearerToken(request);
}

export async function loginRoute(request: Request, env: Env): Promise<Response> {
  if (!(await consumeLoginRateLimit(request, env))) return rateLimitResponse("Too many login requests. Please try again later.");
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "?щ컮瑜?JSON ?붿껌???꾩슂?⑸땲??");
  const emailValue = email(body.email);
  const password = text(body.password, 256, true);
  if (!emailValue || !password) return fail("INVALID_CREDENTIALS", "?대찓???먮뒗 鍮꾨?踰덊샇瑜??뺤씤?댁＜?몄슂.", 401);
  const sql = getSql(env);
  const rows = await sql`
    SELECT id, email::text AS email, name, password_hash, status, failed_login_count, locked_until
    FROM users WHERE email = ${emailValue} LIMIT 1
  `;
  const row = rows[0];
  const userId = row ? Number(row.id) : null;
  if (row?.locked_until && new Date(String(row.locked_until)).getTime() > Date.now()) {
    await writeLoginEvent(request, env, { userId, email: emailValue, eventType: "locked" });
    return fail("ACCOUNT_LOCKED", "濡쒓렇???ㅽ뙣媛 諛섎났?섏뼱 怨꾩젙???좉꼈?듬땲?? ?좎떆 ???ㅼ떆 ?쒕룄?댁＜?몄슂.", 423);
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
    return fail("INVALID_CREDENTIALS", "?대찓???먮뒗 鍮꾨?踰덊샇瑜??뺤씤?댁＜?몄슂.", 401);
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

export async function mobileLoginRoute(request: Request, env: Env): Promise<Response> {
  if (!(await consumeLoginRateLimit(request, env))) return rateLimitResponse("Too many login requests. Please try again later.");
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "A valid JSON request is required.");
  const emailValue = email(body.email);
  const password = text(body.password, 256, true);
  if (!emailValue || !password) return fail("INVALID_CREDENTIALS", "Check your email or password.", 401);
  const sql = getSql(env);
  const rows = await sql`
    SELECT id, email::text AS email, name, password_hash, status, failed_login_count, locked_until
    FROM users WHERE email = ${emailValue} LIMIT 1
  `;
  const row = rows[0];
  const userId = row ? Number(row.id) : null;
  if (row?.locked_until && new Date(String(row.locked_until)).getTime() > Date.now()) {
    await writeLoginEvent(request, env, { userId, email: emailValue, eventType: "locked" });
    return fail("ACCOUNT_LOCKED", "The account is temporarily locked.", 423);
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
      await writeLoginEvent(request, env, { userId, email: emailValue, eventType: shouldLock ? "locked" : "failure", metadata: { failedCount: current, transport: "mobile" } });
    } else {
      await writeLoginEvent(request, env, { email: emailValue, eventType: "failure", metadata: { unknownAccount: true, transport: "mobile" } });
    }
    return fail("INVALID_CREDENTIALS", "Check your email or password.", 401);
  }
  const device = {
    deviceId: text(body.deviceId, 160) ?? "",
    platform: oneOf(body.platform, MOBILE_PLATFORMS, "unknown") ?? "unknown",
    appVersion: text(body.appVersion, 80) ?? ""
  };
  const data = await issueMobileTokens(request, env, sql, row, device);
  await sql`
    UPDATE users SET last_login_at = now(), failed_login_count = 0, locked_until = NULL, updated_at = now()
    WHERE id = ${Number(row.id)}
  `;
  await writeLoginEvent(request, env, { userId: Number(row.id), email: String(row.email), eventType: "success", metadata: { transport: "mobile", platform: device.platform } });
  return ok(data);
}

export async function mobileRefreshRoute(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const refreshToken = requestRefreshToken(request, body);
  if (!refreshToken) return fail("UNAUTHORIZED", "A refresh token is required.", 401);
  const sql = getSql(env);
  const found = await findRefreshSession(env, sql, refreshToken);
  if (!found) return fail("TOKEN_INVALID", "The refresh token is invalid or expired.", 401);
  if (String(found.session.user_status) !== "active") return fail("ACCOUNT_INACTIVE", "The account is not active.", 403);
  await sql`
    UPDATE auth_sessions SET revoked_at = now(), revoke_reason = 'rotated', last_used_at = now()
    WHERE id = ${Number(found.session.id)}
  `;
  const device = {
    deviceId: String(found.session.device_id ?? ""),
    platform: oneOf(found.session.platform, MOBILE_PLATFORMS, "unknown") ?? "unknown",
    appVersion: String(found.session.app_version ?? "")
  };
  const data = await issueMobileTokens(request, env, sql, {
    id: found.session.user_id,
    email: found.session.email,
    name: found.session.name
  }, device, Number(found.session.id));
  return ok(data);
}

export async function mobileLogoutRoute(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const refreshToken = requestRefreshToken(request, body);
  if (!refreshToken) return fail("UNAUTHORIZED", "A refresh token is required.", 401);
  const payload = await verifyJwt<JwtPayload & Record<string, unknown>>(refreshToken, env.JWT_SECRET);
  if (!payload || payload.token_type !== "refresh" || !payload.session_id) return fail("TOKEN_INVALID", "The refresh token is invalid.", 401);
  const sql = getSql(env);
  const rows = await sql`
    UPDATE auth_sessions SET revoked_at = COALESCE(revoked_at, now()), revoke_reason = 'logout', last_used_at = now()
    WHERE session_jti = ${String(payload.session_id)}
      AND refresh_token_hash = ${await sha256(refreshToken)}
      AND revoked_at IS NULL
    RETURNING user_id
  `;
  if (!rows[0]) return fail("TOKEN_REVOKED", "The session is already revoked or invalid.", 401);
  await writeLoginEvent(request, env, { userId: Number(rows[0].user_id), email: "", eventType: "logout", metadata: { transport: "mobile" } });
  return ok({ loggedOut: true });
}

export async function mobileMeRoute(request: Request, env: Env): Promise<Response> {
  const user = await getAuthUser(request, env);
  return user ? ok(user) : fail("UNAUTHORIZED", "Authentication is required.", 401);
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
  return user ? ok(user) : fail("UNAUTHORIZED", "濡쒓렇?몄씠 ?꾩슂?⑸땲??", 401);
}
