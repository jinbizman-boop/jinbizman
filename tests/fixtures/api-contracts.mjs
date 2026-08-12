import { readFile } from "node:fs/promises";

export const EXPECTED_API_SUMMARY = Object.freeze({
  productionBaselineContracts: 124,
  phaseOneCurrentContracts: 128,
  uniquePaths: 96,
  methods: Object.freeze({
    GET: 61,
    POST: 49,
    PATCH: 16,
    PUT: 2,
    DELETE: 0,
  }),
});

const REGISTRY_LINES = `
GET /api/health
GET /api/system/health
GET /api/admin/approvals/:id
GET /api/admin/approvals
PATCH /api/admin/contents/:id/translations/:locale
POST /api/admin/contents/:id/translations/:locale
PUT /api/admin/contents/:id/translations/:locale
PATCH /api/admin/contents/:id
GET /api/admin/contents
POST /api/admin/contents
GET /api/admin/dashboard
GET /api/admin/departments
POST /api/admin/departments
GET /api/admin/evaluations/items
GET /api/admin/evaluations
POST /api/admin/inquiries/:id/convert
PATCH /api/admin/inquiries/:id
GET /api/admin/inquiries
GET /api/admin/leads
GET /api/admin/login-events
POST /api/admin/media
PATCH /api/admin/news/:id/translations/:locale
POST /api/admin/news/:id/translations/:locale
PUT /api/admin/news/:id/translations/:locale
PATCH /api/admin/news/:id
GET /api/admin/news
POST /api/admin/news
GET /api/admin/operations-summary
GET /api/admin/opportunities
GET /api/admin/permissions
GET /api/admin/projects
GET /api/admin/roles
POST /api/admin/roles
GET /api/admin/service-deployments
POST /api/admin/service-deployments
GET /api/admin/services/:id/changes
GET /api/admin/services/:id/content-types
GET /api/admin/services/:id/domains
POST /api/admin/services/:id/domains
PATCH /api/admin/services/:id
GET /api/admin/services
POST /api/admin/services
GET /api/admin/site-banners
POST /api/admin/site-banners
GET /api/admin/site-navigation
POST /api/admin/site-navigation
GET /api/admin/users
GET /api/admin/wbs-templates
GET /api/admin/wbs
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
POST /api/erp/approval-templates/:id/steps
GET /api/erp/approval-templates
POST /api/erp/approval-templates
POST /api/erp/approvals/:id/actions
GET /api/erp/approvals/:id
GET /api/erp/approvals
POST /api/erp/approvals
PATCH /api/erp/attendance/:id/correction
POST /api/erp/attendance/correction
POST /api/erp/attendance/punch
GET /api/erp/attendance
GET /api/erp/board
POST /api/erp/board
GET /api/erp/budgets
POST /api/erp/budgets
POST /api/erp/daily-logs
POST /api/erp/daily-reports
POST /api/erp/evaluations/cycles/:id/finalize
GET /api/erp/evaluations/cycles
POST /api/erp/evaluations/cycles
GET /api/erp/evaluations/evidences
GET /api/erp/evaluations/items
GET /api/erp/evaluations/readiness
POST /api/erp/evaluations/scores
PATCH /api/erp/expenses/:id
GET /api/erp/expenses
POST /api/erp/expenses
PATCH /api/erp/goals/:id
GET /api/erp/goals
POST /api/erp/goals
GET /api/erp/knowledge-templates
POST /api/erp/knowledge-templates
GET /api/erp/knowledge
POST /api/erp/knowledge
PATCH /api/erp/leave/:id
POST /api/erp/leave/balance
GET /api/erp/leave
POST /api/erp/leave
POST /api/erp/project-issues
POST /api/erp/project-meetings
GET /api/erp/projects
POST /api/erp/projects
POST /api/erp/resource-allocations
PATCH /api/erp/timesheets/:id
GET /api/erp/timesheets
POST /api/erp/timesheets
PATCH /api/erp/todos/:id
GET /api/erp/todos
POST /api/erp/todos
PATCH /api/erp/wbs/:id
GET /api/erp/wbs
POST /api/erp/wbs
POST /api/public/inquiries
GET /api/public/locales
GET /api/public/media/:id
GET /api/public/news/:param
GET /api/public/news
GET /api/public/services
GET /api/public/site-pages/:param
GET /api/system/audit-logs
GET /api/system/business-domains
POST /api/system/code-groups/:id/codes
GET /api/system/code-groups
POST /api/system/code-groups
GET /api/system/email-templates
PATCH /api/system/email-templates
POST /api/system/email-templates
GET /api/system/integrations
PATCH /api/system/integrations
POST /api/system/integrations
PATCH /api/system/settings/:key
GET /api/system/settings
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET /api/v1/auth/me
POST /api/v1/auth/refresh
`.trim().split("\n");

function classifyPath(path) {
  if (path === "/api/health" || path === "/api/system/health") return "Health";
  if (path.startsWith("/api/public/")) return "Public";
  if (path.startsWith("/api/auth/") || path.startsWith("/api/v1/auth/")) return "Auth";
  if (path.startsWith("/api/admin/")) return "Admin";
  if (path.startsWith("/api/erp/")) return "ERP";
  if (path.startsWith("/api/system/")) return "System";
  return "Unknown";
}

function authRequirement(path) {
  const classification = classifyPath(path);
  if (classification === "Health" || classification === "Public") return "anonymous";
  if (classification === "Auth") return path.endsWith("/me") || path.endsWith("/logout") ? "authenticated" : "anonymous";
  return "permission-protected";
}

function versionForPath(path) {
  return path.startsWith("/api/v1/") ? "v1" : "legacy";
}

function accessType(method) {
  return method === "GET" ? "READ" : "WRITE";
}

export const API_CONTRACTS = Object.freeze(REGISTRY_LINES.map((line) => {
  const [method, path] = line.split(" ");
  const classification = classifyPath(path);
  return Object.freeze({
    method,
    path,
    classification,
    auth: authRequirement(path),
    permission: classification === "Admin" || classification === "ERP" || classification === "System" ? "matrix" : "not-applicable",
    scope: classification === "Admin" || classification === "ERP" || classification === "System" ? "matrix" : "not-applicable",
    access: accessType(method),
    version: versionForPath(path),
  });
}));

function canonicalRegex(raw) {
  return raw
    .replace(/^\^/, "")
    .replace(/\$$/, "")
    .replace(/\\\//g, "/")
    .replace(/\(\\d\+\)/g, ":id")
    .replace(/\(\.\+\)/g, ":param")
    .replace(/\(ko\|en\|ja\|fr\|es\)/g, ":locale");
}

export async function parseWorkerIndexContracts(indexPath = "worker/index.ts") {
  const source = await readFile(indexPath, "utf8");
  const lines = source.split(/\r?\n/);
  const dynamicMatches = new Map();
  const contracts = [];

  for (const line of lines) {
    const match = line.match(/const\s+(\w+)\s*=\s*path\.match\(\/(\^.*\$)\/[a-z]*\)/);
    if (match) dynamicMatches.set(match[1], canonicalRegex(match[2]));
  }

  function add(method, path) {
    contracts.push({ method, path });
  }

  function addMethods(methodsSource, path) {
    const methods = [...methodsSource.matchAll(/"([A-Z]+)"/g)].map((match) => match[1]);
    for (const method of methods) add(method, path);
  }

  for (const line of lines) {
    let match = line.match(/\(path === "([^"]+)" \|\| path === "([^"]+)"\) && request\.method === "([A-Z]+)"/);
    if (match) {
      add(match[3], match[1]);
      add(match[3], match[2]);
    }

    match = line.match(/path === "([^"]+)" && request\.method === "([A-Z]+)"/);
    if (match) add(match[2], match[1]);

    match = line.match(/path === "([^"]+)" && \[([^\]]+)\]\.includes\(request\.method\)/);
    if (match) addMethods(match[2], match[1]);

    match = line.match(/if \((\w+) && request\.method === "([A-Z]+)"\)/);
    if (match && dynamicMatches.has(match[1])) add(match[2], dynamicMatches.get(match[1]));

    match = line.match(/if \((\w+) && \[([^\]]+)\]\.includes\(request\.method\)/);
    if (match && dynamicMatches.has(match[1])) addMethods(match[2], dynamicMatches.get(match[1]));
  }

  return [...new Map(contracts.map((contract) => [`${contract.method} ${contract.path}`, contract])).values()]
    .map((contract) => ({
      ...contract,
      path: contract.path === "/api/system/settings/:param" ? "/api/system/settings/:key" : contract.path,
    }))
    .sort((left, right) => `${left.method} ${left.path}`.localeCompare(`${right.method} ${right.path}`));
}

export function contractKey(contract) {
  return `${contract.method} ${contract.path}`;
}

export function concretePath(path) {
  return path
    .replace(/:id/g, "123")
    .replace(/:locale/g, "ko")
    .replace(/:key/g, "feature_flag")
    .replace(/:param/g, "sample");
}
