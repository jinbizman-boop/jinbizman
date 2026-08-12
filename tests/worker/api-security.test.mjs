import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("CORS uses exact origin allowlist with credentials and no wildcard", async () => {
  const response = await readFile("worker/lib/response.ts", "utf8");
  assert.match(response, /allowed\.includes\(origin\)/);
  assert.match(response, /access-control-allow-origin", origin/);
  assert.match(response, /access-control-allow-credentials", "true"/);
  assert.match(response, /"vary": "Origin"/);
  assert.match(response, /idempotency-key/i);
  assert.doesNotMatch(response, /access-control-allow-origin", "\*"/i);
});

test("origin policy fails closed for cookie writes and allows mobile bearer without Origin", async () => {
  const request = await readFile("worker/lib/request.ts", "utf8");
  const apiSecurity = await readFile("worker/lib/api-security.ts", "utf8");
  assert.match(request, /if \(\["GET", "HEAD", "OPTIONS"\]\.includes\(request\.method\)\) return true/);
  assert.match(request, /\^Bearer\\s\+/);
  assert.match(request, /if \(!origin\) return false/);
  assert.match(apiSecurity, /FORBIDDEN_ORIGIN/);
  assert.match(apiSecurity, /path\.startsWith\("\/api\/auth\/"\)/);
});

test("API boundary rejects unsupported methods, content types, malformed JSON, oversized JSON, and invalid ids", async () => {
  const apiSecurity = await readFile("worker/lib/api-security.ts", "utf8");
  const index = await readFile("worker/index.ts", "utf8");

  assert.match(index, /enforceApiBoundary/);
  assert.match(apiSecurity, /METHOD_NOT_ALLOWED/);
  assert.match(apiSecurity, /headers\.set\("allow", methods\.join\(","\)\)/);
  assert.match(apiSecurity, /UNSUPPORTED_MEDIA_TYPE/);
  assert.match(apiSecurity, /INVALID_JSON/);
  assert.match(apiSecurity, /PAYLOAD_TOO_LARGE/);
  assert.match(apiSecurity, /INVALID_PATH_PARAMETER/);
  assert.match(apiSecurity, /GENERAL_JSON_MAX_BYTES = 256 \* 1024/);
  assert.match(apiSecurity, /CMS_JSON_MAX_BYTES = 1024 \* 1024/);
  assert.match(apiSecurity, /MEDIA_MAX_BYTES = 10 \* 1024 \* 1024/);
});

test("mobile bearer auth boundary does not require browser Origin", async () => {
  const auth = await readFile("worker/lib/auth.ts", "utf8");
  const apiSecurity = await readFile("worker/lib/api-security.ts", "utf8");
  assert.match(auth, /path\.startsWith\("\/api\/v1\/"\) \? bearer : \(cookie \?\? bearer\)/);
  assert.doesNotMatch(apiSecurity, /path\.startsWith\("\/api\/v1\/"\)[\s\S]{0,200}FORBIDDEN_ORIGIN/);
});

test("rate limit policy classifies auth, public, protected, and high-risk writes", async () => {
  const apiSecurity = await readFile("worker/lib/api-security.ts", "utf8");
  const rateLimit = await readFile("worker/lib/rate-limit.ts", "utf8");
  const authRoutes = await readFile("worker/routes/auth.ts", "utf8");
  const publicRoutes = await readFile("worker/routes/public.ts", "utf8");

  assert.match(apiSecurity, /className: "AUTH", scope: "auth-refresh"/);
  assert.match(apiSecurity, /className: "PUBLIC_WRITE", scope: "public-inquiry"/);
  assert.match(apiSecurity, /className: "PROTECTED_WRITE", scope: "protected-write"/);
  assert.match(apiSecurity, /className: "HIGH_RISK_WRITE", scope: "high-risk-write"/);
  assert.match(apiSecurity, /HIGH_RISK_WRITE_PATHS/);
  assert.match(rateLimit, /retry-after/);
  assert.match(authRoutes, /rateLimitResponse/);
  assert.match(publicRoutes, /rateLimitResponse/);
});

test("pagination, sort injection, and security policy are documented", async () => {
  const system = await readFile("worker/routes/system.ts", "utf8");
  const routes = [
    await readFile("worker/routes/public.ts", "utf8"),
    await readFile("worker/routes/admin.ts", "utf8"),
    await readFile("worker/routes/operations.ts", "utf8"),
    system
  ].join("\n");
  assert.match(system, /Math\.min\(100, Math\.max\(1, Math\.trunc\(requestedLimit\)\)\)/);
  assert.doesNotMatch(routes, /ORDER BY\s+\$\{[^}]*searchParams/i);

  const policy = await readFile("API_SECURITY_POLICY.md", "utf8");
  for (const token of ["Cookie vs Bearer", "CORS Allowlist", "Rate Limit Classes", "Body Limits", "Pagination", "Retry-After"]) {
    assert.match(policy, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }
});
