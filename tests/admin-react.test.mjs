import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("ERP modules cover operations, CRM, WBS, governance, people, finance and evidence", () => {
  const admin = read("src/content/admin.ts");
  for (const token of ["services", "inquiries", "leads", "opportunities", "projects", "daily-work", "approvals", "attendance", "leave", "timesheets", "budgets", "expenses", "evaluations", "audit-logs"]) {
    assert.match(admin, new RegExp(`key: "${token}"`));
  }
});

test("core ERP write workflows call Worker APIs", () => {
  const pages = read("src/admin/pages.tsx");
  for (const endpoint of ["/api/erp/projects", "/api/erp/wbs", "/api/erp/daily-reports", "/api/erp/daily-logs", "/api/erp/approvals", "/api/erp/evaluations/scores", "/api/admin/media"]) {
    assert.match(pages, new RegExp(escapeRegExp(endpoint)));
  }
});

test("evaluation UI is evidence-first and server-finalized", () => {
  const pages = read("src/admin/pages.tsx");
  assert.match(pages, /평가 근거/);
  assert.match(pages, /evidences\?cycleId/);
  assert.match(pages, /\/finalize/);
});

test("admin permission helper defines every protected module and canonical UX helpers", () => {
  const helper = read("src/lib/permissions.ts");
  const admin = read("src/content/admin.ts");
  assert.match(helper, /PROTECTED_ADMIN_SCREEN_COUNT\s*=\s*35/);
  for (const token of ["hasPermission", "hasAnyPermission", "hasAllPermissions", "canAccessModule", "canUseAction", "isUnauthorizedError", "isForbiddenError"]) {
    assert.match(helper, new RegExp(`export function ${token}`));
  }
  const moduleKeys = [...admin.matchAll(/key: "([^"]+)"/g)].map((match) => match[1]);
  const permissionKeys = [...helper.matchAll(/"([^"]+)":\s*\{/g)].map((match) => match[1]);
  assert.equal(moduleKeys.length, 34);
  for (const key of moduleKeys) {
    assert.ok(permissionKeys.includes(key), `missing permission contract for ${key}`);
  }
});

test("admin permission helper covers representative PM, team lead, finance and evaluator UX", () => {
  const helper = read("src/lib/permissions.ts");
  for (const token of ["project.read", "wbs.update", "attendance.manage", "leave.manage", "timesheet.review", "budget.manage", "expense.manage", "evaluation.score", "evaluation.finalize"]) {
    assert.match(helper, new RegExp(escapeRegExp(token)));
  }
});

test("admin shell applies permission-aware navigation and route-level forbidden UX", () => {
  const shell = read("src/admin/AdminShell.tsx");
  for (const token of ["canAccessModule", "ForbiddenState", "isUnauthorizedError", "AdminUserProvider"]) {
    assert.match(shell, new RegExp(token));
  }
  assert.match(shell, /adminModules\.filter\(\(module\) => canAccessModule\(user, module\.key\)\)/);
  assert.match(shell, /!canAccessModule\(user, activeModule\.key\)/);
});

test("admin pages map 401 and 403 separately and hide permission-gated actions", () => {
  const pages = read("src/admin/pages.tsx");
  for (const token of ["useAdminUser", "canUseAction", "isForbiddenError", "isUnauthorizedError", "permissionDeniedMessage", "ForbiddenState"]) {
    assert.match(pages, new RegExp(token));
  }
  for (const action of ["projects\", \"write", "daily-work\", \"write", "approvals\", \"approve", "evaluations\", \"approve", "site-content\", \"write", "media\", \"write"]) {
    assert.match(pages, new RegExp(escapeRegExp(action)));
  }
});

test("permission UX documentation covers all protected screens and UI error policy", () => {
  const matrix = read("PERMISSION_UX_MATRIX.md");
  const policy = read("UI_ERROR_POLICY.md");
  assert.match(matrix, /Protected screens:\s*35/);
  assert.match(matrix, /Forbidden supported:\s*35/);
  for (const route of ["/admin/dashboard", "/admin/projects", "/admin/approvals", "/admin/evaluations", "/admin/settings"]) {
    assert.match(matrix, new RegExp(escapeRegExp(route)));
  }
  for (const status of ["401", "403", "404", "409", "429", "500", "network error"]) {
    assert.match(policy, new RegExp(status));
  }
});
