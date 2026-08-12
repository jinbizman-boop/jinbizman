import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";
import { signJwt, verifyJwt } from "../../worker/lib/crypto.ts";

test("v1 mobile auth routes are explicitly exposed without replacing legacy web auth", async () => {
  const index = await readFile("worker/index.ts", "utf8");
  const authRoutes = await readFile("worker/routes/auth.ts", "utf8");

  for (const route of [
    "/api/auth/login",
    "/api/auth/me",
    "/api/auth/logout",
    "/api/v1/auth/login",
    "/api/v1/auth/refresh",
    "/api/v1/auth/me",
    "/api/v1/auth/logout"
  ]) {
    assert.match(index, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  for (const handler of ["mobileLoginRoute", "mobileRefreshRoute", "mobileMeRoute", "mobileLogoutRoute"]) {
    assert.match(authRoutes, new RegExp(`export async function ${handler}`));
  }
});

test("mobile refresh tokens are hashed, rotated, revocable, and linked to device sessions", async () => {
  const migration = await readFile("db/migrations/014_mobile_auth_sessions.sql", "utf8");
  const authRoutes = await readFile("worker/routes/auth.ts", "utf8");

  assert.match(migration, /CREATE TABLE IF NOT EXISTS auth_sessions/i);
  assert.match(migration, /refresh_token_hash text NOT NULL/i);
  assert.doesNotMatch(migration, /refresh_token\s+text/i);
  for (const column of ["session_jti", "device_id", "platform", "app_version", "last_used_at", "expires_at", "revoked_at", "revoke_reason"]) {
    assert.match(migration, new RegExp(column, "i"));
  }

  assert.match(authRoutes, /sha256\(refreshToken\)/);
  assert.match(authRoutes, /token_type:\s*"refresh"/);
  assert.match(authRoutes, /token_type:\s*"access"/);
  assert.match(authRoutes, /revoke_reason = 'rotated'/);
  assert.match(authRoutes, /revoke_reason = 'logout'/);
  assert.match(authRoutes, /TOKEN_INVALID/);
  assert.match(authRoutes, /TOKEN_REVOKED/);
  assert.match(authRoutes, /ACCOUNT_INACTIVE/);
  assert.match(authRoutes, /INVALID_CREDENTIALS/);
  assert.match(authRoutes, /ACCOUNT_LOCKED/);
});

test("auth resolver rejects refresh tokens as bearer access and checks mobile session revocation", async () => {
  const auth = await readFile("worker/lib/auth.ts", "utf8");

  assert.match(auth, /path\.startsWith\("\/api\/v1\/"\) \? bearer : \(cookie \?\? bearer\)/);
  assert.match(auth, /payload\.token_type === "refresh"/);
  assert.match(auth, /payload\.token_type !== "access"/);
  assert.match(auth, /auth_sessions/);
  assert.match(auth, /revoked_at IS NULL/);
});

test("mobile JWT claims separate access and refresh token types", async () => {
  const now = Math.floor(Date.now() / 1000);
  const access = await signJwt({ sub: "1", iat: now, exp: now + 300, jti: "access-jti", session_id: "session-jti", token_type: "access" }, "test-secret-not-production");
  const refresh = await signJwt({ sub: "1", iat: now, exp: now + 3600, jti: "refresh-jti", session_id: "session-jti", token_type: "refresh" }, "test-secret-not-production");

  assert.equal((await verifyJwt(access, "test-secret-not-production"))?.token_type, "access");
  assert.equal((await verifyJwt(refresh, "test-secret-not-production"))?.token_type, "refresh");
  const expired = await signJwt({ sub: "1", iat: now - 600, exp: now - 1, jti: "expired", session_id: "session-jti", token_type: "access" }, "test-secret-not-production");
  assert.equal(await verifyJwt(expired, "test-secret-not-production"), null);
});
