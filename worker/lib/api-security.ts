import type { Env } from "../types";
import { getAuthUser } from "./auth";
import { consumeApiRateLimit, rateLimitResponse, type RateLimitPolicy } from "./rate-limit";
import { isTrustedWriteOrigin } from "./request";
import { fail } from "./response";

const GENERAL_JSON_MAX_BYTES = 256 * 1024;
const CMS_JSON_MAX_BYTES = 1024 * 1024;
const MEDIA_MAX_BYTES = 10 * 1024 * 1024;
const SAFE_INTEGER_MAX = Number.MAX_SAFE_INTEGER;

const OPTIONAL_BODY_PATHS = new Set([
  "/api/auth/logout",
  "/api/v1/auth/logout",
  "/api/v1/auth/refresh"
]);

const CMS_JSON_PATHS = [
  /^\/api\/admin\/contents(?:\/\d+)?$/,
  /^\/api\/admin\/contents\/\d+\/translations\/(ko|en|ja|fr|es)$/,
  /^\/api\/admin\/news(?:\/\d+)?$/,
  /^\/api\/admin\/news\/\d+\/translations\/(ko|en|ja|fr|es)$/,
  /^\/api\/erp\/knowledge$/,
  /^\/api\/erp\/knowledge-templates$/,
  /^\/api\/system\/email-templates$/
];

const HIGH_RISK_WRITE_PATHS = [
  /^\/api\/admin\/roles$/,
  /^\/api\/admin\/users$/,
  /^\/api\/admin\/service-deployments$/,
  /^\/api\/admin\/services\/\d+\/domains$/,
  /^\/api\/erp\/approvals\/\d+\/actions$/,
  /^\/api\/erp\/evaluations\/cycles\/\d+\/finalize$/,
  /^\/api\/erp\/attendance\/\d+\/correction$/,
  /^\/api\/erp\/leave\/\d+$/,
  /^\/api\/erp\/timesheets\/\d+$/,
  /^\/api\/erp\/expenses\/\d+$/,
  /^\/api\/system\/settings\/.+$/,
  /^\/api\/system\/integrations$/,
  /^\/api\/system\/email-templates$/,
  /^\/api\/system\/code-groups(?:\/\d+\/codes)?$/
];

const NUMERIC_ID_PATTERNS = [
  /^\/api\/public\/media\/([^/]+)$/,
  /^\/api\/admin\/inquiries\/([^/]+)(?:\/convert)?$/,
  /^\/api\/admin\/services\/([^/]+)(?:\/content-types|\/domains|\/changes)?$/,
  /^\/api\/admin\/approvals\/([^/]+)$/,
  /^\/api\/admin\/contents\/([^/]+)(?:\/translations\/(?:ko|en|ja|fr|es))?$/,
  /^\/api\/admin\/news\/([^/]+)(?:\/translations\/(?:ko|en|ja|fr|es))?$/,
  /^\/api\/erp\/wbs\/([^/]+)$/,
  /^\/api\/erp\/approvals\/([^/]+)(?:\/actions)?$/,
  /^\/api\/erp\/evaluations\/cycles\/([^/]+)\/finalize$/,
  /^\/api\/erp\/todos\/([^/]+)$/,
  /^\/api\/erp\/attendance\/([^/]+)\/correction$/,
  /^\/api\/erp\/leave\/([^/]+)$/,
  /^\/api\/erp\/timesheets\/([^/]+)$/,
  /^\/api\/erp\/expenses\/([^/]+)$/,
  /^\/api\/erp\/goals\/([^/]+)$/,
  /^\/api\/system\/code-groups\/([^/]+)\/codes$/,
  /^\/api\/erp\/approval-templates\/([^/]+)\/steps$/
];

type MethodSpec = { pattern: RegExp; methods: readonly string[] };

const METHOD_SPECS: MethodSpec[] = [
  { pattern: /^\/api\/(?:system\/)?health$/, methods: ["GET"] },
  { pattern: /^\/api\/public\/locales$/, methods: ["GET"] },
  { pattern: /^\/api\/public\/services$/, methods: ["GET"] },
  { pattern: /^\/api\/public\/news(?:\/[^/]+)?$/, methods: ["GET"] },
  { pattern: /^\/api\/public\/site-pages\/[^/]+$/, methods: ["GET"] },
  { pattern: /^\/api\/public\/inquiries$/, methods: ["POST"] },
  { pattern: /^\/api\/public\/media\/[^/]+$/, methods: ["GET"] },
  { pattern: /^\/api\/auth\/login$/, methods: ["POST"] },
  { pattern: /^\/api\/auth\/me$/, methods: ["GET"] },
  { pattern: /^\/api\/auth\/logout$/, methods: ["POST"] },
  { pattern: /^\/api\/v1\/auth\/login$/, methods: ["POST"] },
  { pattern: /^\/api\/v1\/auth\/refresh$/, methods: ["POST"] },
  { pattern: /^\/api\/v1\/auth\/me$/, methods: ["GET"] },
  { pattern: /^\/api\/v1\/auth\/logout$/, methods: ["POST"] },
  { pattern: /^\/api\/admin\/dashboard$/, methods: ["GET"] },
  { pattern: /^\/api\/admin\/(?:services|news|contents|departments|roles)$/, methods: ["GET", "POST"] },
  { pattern: /^\/api\/admin\/(?:projects|wbs|approvals|evaluations|users|permissions|login-events|leads|opportunities|wbs-templates|operations-summary)$/, methods: ["GET"] },
  { pattern: /^\/api\/admin\/inquiries$/, methods: ["GET"] },
  { pattern: /^\/api\/admin\/inquiries\/[^/]+$/, methods: ["PATCH"] },
  { pattern: /^\/api\/admin\/inquiries\/[^/]+\/convert$/, methods: ["POST"] },
  { pattern: /^\/api\/admin\/services\/[^/]+$/, methods: ["PATCH"] },
  { pattern: /^\/api\/admin\/services\/[^/]+\/(?:content-types|changes)$/, methods: ["GET"] },
  { pattern: /^\/api\/admin\/services\/[^/]+\/domains$/, methods: ["GET", "POST"] },
  { pattern: /^\/api\/admin\/approvals\/[^/]+$/, methods: ["GET"] },
  { pattern: /^\/api\/admin\/evaluations\/items$/, methods: ["GET"] },
  { pattern: /^\/api\/admin\/media$/, methods: ["POST"] },
  { pattern: /^\/api\/admin\/contents\/[^/]+$/, methods: ["PATCH"] },
  { pattern: /^\/api\/admin\/contents\/[^/]+\/translations\/(?:ko|en|ja|fr|es)$/, methods: ["POST", "PATCH", "PUT"] },
  { pattern: /^\/api\/admin\/news\/[^/]+$/, methods: ["PATCH"] },
  { pattern: /^\/api\/admin\/news\/[^/]+\/translations\/(?:ko|en|ja|fr|es)$/, methods: ["POST", "PATCH", "PUT"] },
  { pattern: /^\/api\/admin\/service-deployments$/, methods: ["GET", "POST"] },
  { pattern: /^\/api\/admin\/site-(?:banners|navigation)$/, methods: ["GET", "POST"] },
  { pattern: /^\/api\/erp\/(?:projects|wbs|approvals|evaluations\/cycles|todos|leave|timesheets|budgets|expenses|goals|board|knowledge|approval-templates|knowledge-templates)$/, methods: ["GET", "POST"] },
  { pattern: /^\/api\/erp\/attendance$/, methods: ["GET"] },
  { pattern: /^\/api\/erp\/wbs\/[^/]+$/, methods: ["PATCH"] },
  { pattern: /^\/api\/erp\/daily-(?:reports|logs)$/, methods: ["POST"] },
  { pattern: /^\/api\/erp\/approvals\/[^/]+$/, methods: ["GET"] },
  { pattern: /^\/api\/erp\/approvals\/[^/]+\/actions$/, methods: ["POST"] },
  { pattern: /^\/api\/erp\/evaluations\/(?:evidences|items|readiness)$/, methods: ["GET"] },
  { pattern: /^\/api\/erp\/evaluations\/scores$/, methods: ["POST"] },
  { pattern: /^\/api\/erp\/evaluations\/cycles\/[^/]+\/finalize$/, methods: ["POST"] },
  { pattern: /^\/api\/erp\/todos\/[^/]+$/, methods: ["PATCH"] },
  { pattern: /^\/api\/erp\/attendance\/(?:punch|correction)$/, methods: ["POST"] },
  { pattern: /^\/api\/erp\/attendance\/[^/]+\/correction$/, methods: ["PATCH"] },
  { pattern: /^\/api\/erp\/leave\/balance$/, methods: ["POST"] },
  { pattern: /^\/api\/erp\/leave\/[^/]+$/, methods: ["PATCH"] },
  { pattern: /^\/api\/erp\/timesheets\/[^/]+$/, methods: ["PATCH"] },
  { pattern: /^\/api\/erp\/resource-allocations$/, methods: ["POST"] },
  { pattern: /^\/api\/erp\/expenses\/[^/]+$/, methods: ["PATCH"] },
  { pattern: /^\/api\/erp\/goals\/[^/]+$/, methods: ["PATCH"] },
  { pattern: /^\/api\/erp\/project-(?:issues|meetings)$/, methods: ["POST"] },
  { pattern: /^\/api\/erp\/approval-templates\/[^/]+\/steps$/, methods: ["POST"] },
  { pattern: /^\/api\/system\/(?:integrations|email-templates)$/, methods: ["GET", "POST", "PATCH"] },
  { pattern: /^\/api\/system\/code-groups$/, methods: ["GET", "POST"] },
  { pattern: /^\/api\/system\/code-groups\/[^/]+\/codes$/, methods: ["POST"] },
  { pattern: /^\/api\/system\/audit-logs$/, methods: ["GET"] },
  { pattern: /^\/api\/system\/settings$/, methods: ["GET"] },
  { pattern: /^\/api\/system\/settings\/.+$/, methods: ["PATCH"] },
  { pattern: /^\/api\/system\/business-domains$/, methods: ["GET"] }
];

export function allowedMethodsForPath(path: string): readonly string[] | null {
  return METHOD_SPECS.find((spec) => spec.pattern.test(path))?.methods ?? null;
}

export function validatePositivePathId(path: string): Response | null {
  for (const pattern of NUMERIC_ID_PATTERNS) {
    const match = path.match(pattern);
    if (!match) continue;
    const value = Number(match[1]);
    if (!/^\d+$/.test(match[1]) || !Number.isSafeInteger(value) || value <= 0 || value > SAFE_INTEGER_MAX) {
      return fail("INVALID_PATH_PARAMETER", "A positive safe integer path id is required.", 400);
    }
  }
  return null;
}

function isWriteMethod(method: string): boolean {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method);
}

function isMediaUpload(path: string): boolean {
  return path === "/api/admin/media";
}

function bodyLimitForPath(path: string): number {
  if (isMediaUpload(path)) return MEDIA_MAX_BYTES;
  if (CMS_JSON_PATHS.some((pattern) => pattern.test(path))) return CMS_JSON_MAX_BYTES;
  return GENERAL_JSON_MAX_BYTES;
}

function contentLength(request: Request): number | null {
  const raw = request.headers.get("content-length");
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function hasJsonContentType(request: Request): boolean {
  return /\bapplication\/json\b/i.test(request.headers.get("content-type") ?? "");
}

function hasMultipartContentType(request: Request): boolean {
  return /\bmultipart\/form-data\b/i.test(request.headers.get("content-type") ?? "");
}

async function enforceBodyPolicy(request: Request, path: string): Promise<Response | null> {
  if (!["POST", "PUT", "PATCH"].includes(request.method)) return null;
  const length = contentLength(request);
  const maxBytes = bodyLimitForPath(path);
  if (length !== null && length > maxBytes) return fail("PAYLOAD_TOO_LARGE", "Request body is too large.", 413);
  if (isMediaUpload(path)) {
    return hasMultipartContentType(request) ? null : fail("UNSUPPORTED_MEDIA_TYPE", "multipart/form-data is required.", 415);
  }
  const contentType = request.headers.get("content-type");
  if (!contentType && OPTIONAL_BODY_PATHS.has(path)) return null;
  if (!hasJsonContentType(request)) return fail("UNSUPPORTED_MEDIA_TYPE", "application/json is required.", 415);
  if (OPTIONAL_BODY_PATHS.has(path) && length === 0) return null;
  try {
    await request.clone().json();
    return null;
  } catch {
    return fail("INVALID_JSON", "Malformed JSON request body.", 400);
  }
}

export function isHighRiskWrite(method: string, path: string): boolean {
  return isWriteMethod(method) && HIGH_RISK_WRITE_PATHS.some((pattern) => pattern.test(path));
}

export function classifyRateLimit(method: string, path: string, env?: Partial<Env>): RateLimitPolicy | null {
  if (method === "POST" && (path === "/api/auth/login" || path === "/api/v1/auth/login")) {
    return { className: "AUTH", scope: "auth-login", maxRequests: Math.max(1, Number(env?.LOGIN_RATE_LIMIT_PER_10_MIN || 10)) };
  }
  if (method === "POST" && path === "/api/v1/auth/refresh") {
    return { className: "AUTH", scope: "auth-refresh", maxRequests: Math.max(1, Number(env?.LOGIN_RATE_LIMIT_PER_10_MIN || 10)) };
  }
  if (method === "POST" && path === "/api/public/inquiries") {
    return { className: "PUBLIC_WRITE", scope: "public-inquiry", maxRequests: Math.max(1, Number(env?.PUBLIC_RATE_LIMIT_PER_10_MIN || 20)) };
  }
  if (isHighRiskWrite(method, path)) {
    return { className: "HIGH_RISK_WRITE", scope: "high-risk-write", maxRequests: Math.max(1, Number(env?.HIGH_RISK_RATE_LIMIT_PER_10_MIN || 30)) };
  }
  if (isWriteMethod(method) && (path.startsWith("/api/admin/") || path.startsWith("/api/erp/") || path.startsWith("/api/system/"))) {
    return { className: "PROTECTED_WRITE", scope: "protected-write", maxRequests: Math.max(1, Number(env?.PROTECTED_RATE_LIMIT_PER_10_MIN || 120)) };
  }
  return null;
}

function methodNotAllowed(methods: readonly string[]): Response {
  const response = fail("METHOD_NOT_ALLOWED", "The requested method is not allowed for this API path.", 405);
  const headers = new Headers(response.headers);
  headers.set("allow", methods.join(","));
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export async function enforceApiBoundary(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const methods = allowedMethodsForPath(path);
  if (methods && !methods.includes(request.method)) return methodNotAllowed(methods);
  const idError = validatePositivePathId(path);
  if (idError) return idError;
  const bodyError = await enforceBodyPolicy(request, path);
  if (bodyError) return bodyError;
  if (isWriteMethod(request.method)
      && (path.startsWith("/api/admin/") || path.startsWith("/api/erp/") || path.startsWith("/api/system/") || path.startsWith("/api/auth/"))
      && !isTrustedWriteOrigin(request, env)) {
    return fail("FORBIDDEN_ORIGIN", "Trusted origin is required for cookie-authenticated web writes.", 403);
  }
  const policy = classifyRateLimit(request.method, path, env);
  if (!policy) return null;
  if (policy.className === "AUTH" && path !== "/api/v1/auth/refresh") return null;
  if (policy.className === "PUBLIC_WRITE") return null;
  let userId: number | null = null;
  if (policy.className === "PROTECTED_WRITE" || policy.className === "HIGH_RISK_WRITE") {
    const user = await getAuthUser(request, env);
    userId = user?.id ?? null;
  }
  return await consumeApiRateLimit(request, env, policy, userId)
    ? null
    : rateLimitResponse("Too many requests. Please retry after the current rate-limit window.");
}
