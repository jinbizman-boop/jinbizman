import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("wrangler routes /api and /admin through Worker while serving SPA dist", async () => {
  const text = await readFile("wrangler.jsonc", "utf8");
  assert.match(text, /"directory"\s*:\s*"\.\/dist"/);
  assert.match(text, /single-page-application/);
  assert.match(text, /"run_worker_first"\s*:\s*\[[^\]]*"\/api\/\*"[^\]]*"\/admin\/\*"[^\]]*\]/s);
});

test("secrets are examples only", async () => {
  const vars = await readFile(".dev.vars.example", "utf8");
  assert.match(vars, /^DATABASE_URL=/m); assert.match(vars, /^JWT_SECRET=/m); assert.doesNotMatch(vars, /npg_[A-Za-z0-9]+/);
});

test("React admin login has no hard-coded demo password and uses auth API", async () => {
  const login = await readFile("src/admin/AdminLoginPage.tsx", "utf8");
  const auth = await readFile("src/lib/auth.ts", "utf8");
  assert.doesNotMatch(login, /JINBIZ2026!|demo@example|password123/i); assert.match(auth, /api\/auth\/login/); assert.match(auth, /api\/auth\/logout/);
});

test("production seed path contains no embedded administrator password", async () => {
  const seedScript = await readFile("scripts/seed.mjs", "utf8"); assert.doesNotMatch(seedScript, /admin-user\.sql|001_demo_seed\.sql/);
  const adminCreator = await readFile("scripts/create-admin.mjs", "utf8"); assert.match(adminCreator, /ADMIN_PASSWORD/); assert.doesNotMatch(adminCreator, /jinbiz1234|JINBIZ2026/i);
  assert.match(adminCreator, /ADMIN_PASSWORD\.length < 8/);
  assert.match(adminCreator, /at least 8 characters/);
});

test("core React ERP workflows are wired to real write APIs", async () => {
  const page = await readFile("src/admin/pages.tsx", "utf8");
  for (const endpoint of ["/api/erp/projects","/api/erp/wbs","/api/erp/daily-reports","/api/erp/daily-logs","/api/erp/approvals","/api/erp/evaluations/scores"]) assert.match(page,new RegExp(endpoint.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
});

test("public inquiry React page uses Worker API and no browser mock storage", async () => {
  const page = await readFile("src/public/pages/ContactPage.tsx", "utf8"); assert.match(page,/api\/public\/inquiries/); assert.doesNotMatch(page,/localStorage|mock record|정적 데모/i);
});

test("operator start guide contains no fixed administrator password", async () => {
  const guide = await readFile("START_HERE.txt", "utf8"); assert.match(guide, /admin:create/); assert.doesNotMatch(guide, /JINBIZ2026!|비밀번호:\s*\S+/i);
});

test("React admin has explicit ready/empty/error/forbidden state contract", async () => {
  const state = await readFile("src/admin/components/StatePanel.tsx", "utf8"); for (const token of ["loading","empty","error","forbidden"]) assert.match(state,new RegExp(token));
});

test("browser QA source no longer depends on mock localStorage OCR or fake AI responses", async () => {
  const publicQa = await readFile("tests/browser_qa_public.py", "utf8"); const erpQa = await readFile("tests/browser_qa_erp.py", "utf8");
  assert.doesNotMatch(publicQa, /jinbiz_inquiries|contact_local_storage|정적 데모 문의/); assert.doesNotMatch(erpQa, /ocr_filled|chat_answered|1280000/);
});

test("remaining administration endpoints stay available after React migration", async () => {
  const index = await readFile("worker/index.ts", "utf8");
  for (const endpoint of ["/api/admin/departments","/api/admin/roles","/api/system/code-groups","/api/erp/approval-templates","/api/erp/project-issues","/api/erp/project-meetings","/api/admin/service-deployments","/api/admin/site-banners","/api/admin/site-navigation","/api/erp/knowledge-templates"]) assert.match(index,new RegExp(endpoint.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
});

test("React media library is wired to R2-backed Worker upload", async () => {
  const index = await readFile("worker/index.ts", "utf8"); const media = await readFile("worker/routes/media.ts", "utf8"); const page = await readFile("src/admin/pages.tsx", "utf8");
  assert.match(index,/\/api\/admin\/media/); assert.match(media,/MEDIA_BUCKET/); assert.match(media,/attachments/); assert.match(page,/FormData/); assert.match(page,/\/api\/admin\/media/);
});

test("production CSP does not depend on third-party font or image CDNs", async () => {
  const worker = await readFile("worker/index.ts", "utf8"); assert.doesNotMatch(worker,/cdn\.jsdelivr\.net/); assert.doesNotMatch(worker,/img-src[^;]*https:/); assert.match(worker,/font-src 'self' data:/);
});
