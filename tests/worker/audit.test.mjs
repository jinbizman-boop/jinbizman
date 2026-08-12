import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

function functionBody(source, name) {
  const marker = `export async function ${name}`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `${name} is missing`);
  const next = source.indexOf("\nexport ", start + marker.length);
  return source.slice(start, next === -1 ? source.length : next);
}

test("audit helper redacts secrets before writing audit JSON", async () => {
  const audit = await read("worker/lib/audit.ts");
  assert.match(audit, /SENSITIVE_AUDIT_KEYS/);
  for (const key of [
    "password",
    "password_hash",
    "refreshToken",
    "accessToken",
    "JWT_SECRET",
    "DATABASE_URL",
    "api_key",
    "Authorization",
    "cookie",
    "private_key",
  ]) {
    assert.match(audit, new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }
  assert.match(audit, /sanitizeAuditPayload/);
  assert.match(audit, /JSON\.stringify\(sanitizeAuditPayload\(input\.before/);
  assert.match(audit, /JSON\.stringify\(sanitizeAuditPayload\(input\.after/);
  assert.match(audit, /JSON\.stringify\(sanitizeAuditPayload\(input\.metadata/);
});

test("audit helper stores DB-compatible API scope instead of RBAC vocabulary", async () => {
  const audit = await read("worker/lib/audit.ts");
  assert.match(audit, /type AuditLogScope = "public" \| "admin" \| "erp" \| "system"/);
  assert.match(audit, /function inferAuditScope/);
  assert.match(audit, /path\.startsWith\("\/api\/system\/"\)/);
  assert.match(audit, /path\.startsWith\("\/api\/erp\/"\)/);
  assert.match(audit, /path\.startsWith\("\/api\/admin\/"\)/);
  assert.doesNotMatch(audit, /input\.scope \?\? "global"/);
});

test("admin operation high-risk writes have global audit entries", async () => {
  const adminOps = await read("worker/routes/admin-operations.ts");
  const expected = new Map([
    ["codeGroupsRoute", "common_code_group.create"],
    ["commonCodeCreateRoute", "common_code.create"],
    ["approvalTemplatesRoute", "approval_template.create"],
    ["approvalTemplateStepCreateRoute", "approval_template_step.create"],
    ["projectIssueCreateRoute", "project_issue.create"],
    ["projectMeetingCreateRoute", "project_meeting.create"],
    ["serviceDeploymentsRoute", "service_deployment.request"],
    ["serviceDomainCreateRoute", "service_domain.upsert"],
    ["siteBannersRoute", "site_banner.create"],
    ["siteNavigationRoute", "site_navigation.create"],
    ["knowledgeTemplatesRoute", "knowledge_template.create"],
  ]);

  for (const [handler, actionType] of expected) {
    const body = functionBody(adminOps, handler);
    assert.match(body, /writeAuditLog/);
    assert.match(body, new RegExp(actionType.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("high-risk audit documentation exists and includes coverage matrix and policy", async () => {
  await access("AUDIT_MATRIX.md");
  await access("AUDIT_POLICY.md");
  const matrix = await read("AUDIT_MATRIX.md");
  const policy = await read("AUDIT_POLICY.md");

  for (const token of [
    "Before",
    "After",
    "Status/Error",
    "Domain Log",
    "Global Audit",
    "Secret redaction",
  ]) {
    assert.match(matrix + "\n" + policy, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }

  for (const route of [
    "/api/admin/services",
    "/api/admin/inquiries/:id/convert",
    "/api/erp/wbs/:id",
    "/api/erp/approvals/:id/actions",
    "/api/erp/evaluations/cycles/:id/finalize",
    "/api/erp/leave/:id",
    "/api/erp/timesheets/:id",
    "/api/erp/expenses/:id",
    "/api/system/settings/:key",
  ]) {
    assert.match(matrix, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
