import type { Env } from "./types";
import { getAuthUser } from "./lib/auth";
import { enforceApiBoundary } from "./lib/api-security";
import { getRequestId } from "./lib/request";
import { corsHeaders, fail, withCors } from "./lib/response";
import { healthRoute } from "./routes/health";
import { loginRoute, logoutRoute, meRoute, mobileLoginRoute, mobileLogoutRoute, mobileMeRoute, mobileRefreshRoute } from "./routes/auth";
import {
  publicInquiryRoute,
  publicLocalesRoute,
  publicNewsDetailRoute,
  publicNewsRoute,
  publicServicesRoute,
  publicSitePageRoute
} from "./routes/public";
import {
  adminApprovalDetailRoute,
  adminApprovalsRoute,
  adminContentTypesRoute,
  adminContentsRoute,
  adminDashboardRoute,
  adminDepartmentsRoute,
  adminEvaluationItemsRoute,
  adminEvaluationsRoute,
  adminInquiriesRoute,
  adminLeadsRoute,
  adminLoginEventsRoute,
  adminInquiryUpdateRoute,
  adminNewsRoute,
  adminOperationsSummaryRoute,
  adminOpportunitiesRoute,
  adminPermissionsRoute,
  adminProjectsRoute,
  adminRolesRoute,
  adminServiceChangesRoute,
  adminServiceDomainsRoute,
  adminServicesRoute,
  adminUsersRoute,
  adminWbsRoute,
  adminWbsTemplatesRoute
} from "./routes/admin";
import {
  adminContentCreateRoute,
  adminContentUpdateRoute,
  adminInquiryConvertRoute,
  adminNewsCreateRoute,
  adminNewsTranslationUpsertRoute,
  adminNewsUpdateRoute,
  adminServiceCreateRoute,
  adminServiceUpdateRoute,
  adminTranslationUpsertRoute
} from "./routes/admin-write";
import {
  erpApprovalActionRoute,
  erpApprovalCreateRoute,
  erpDailyLogCreateRoute,
  erpDailyReportCreateRoute,
  erpEvaluationCycleCreateRoute,
  erpEvaluationEvidenceRoute,
  erpEvaluationFinalizeRoute,
  erpEvaluationReadinessRoute,
  erpEvaluationScoreRoute,
  erpProjectCreateRoute,
  erpWbsCreateRoute,
  erpWbsUpdateRoute
} from "./routes/erp";
import {
  approvalTemplateStepCreateRoute,
  approvalTemplatesRoute,
  codeGroupsRoute,
  commonCodeCreateRoute,
  departmentCreateRoute,
  knowledgeTemplatesRoute,
  projectIssueCreateRoute,
  projectMeetingCreateRoute,
  roleCreateRoute,
  serviceDeploymentsRoute,
  serviceDomainCreateRoute,
  siteBannersRoute,
  siteNavigationRoute
} from "./routes/admin-operations";
import { adminMediaUploadRoute, publicMediaRoute } from "./routes/media";
import {
  systemAuditLogsRoute,
  systemBusinessDomainsRoute,
  systemSettingUpdateRoute,
  systemSettingsRoute
} from "./routes/system";
import {
  allocationUpsertRoute,
  attendanceCorrectionDecisionRoute,
  attendanceCorrectionRoute,
  attendanceListRoute,
  attendancePunchRoute,
  boardCreateRoute,
  boardListRoute,
  budgetListRoute,
  budgetUpsertRoute,
  emailTemplateListRoute,
  emailTemplateUpsertRoute,
  expenseCreateRoute,
  expenseListRoute,
  expenseUpdateRoute,
  goalCreateRoute,
  goalListRoute,
  goalUpdateRoute,
  integrationListRoute,
  integrationUpsertRoute,
  knowledgeCreateRoute,
  knowledgeListRoute,
  leaveBalanceUpsertRoute,
  leaveCreateRoute,
  leaveDecisionRoute,
  leaveSummaryRoute,
  timesheetCreateRoute,
  timesheetListRoute,
  timesheetReviewRoute,
  todoCreateRoute,
  todoListRoute,
  todoUpdateRoute
} from "./routes/operations";

function withRequestId(response: Response, requestId: string): Response {
  const headers = new Headers(response.headers);
  headers.set("x-request-id", requestId);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function withSecurityHeaders(response: Response, env: Env): Response {
  const headers = new Headers(response.headers);
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=()");
  headers.set("x-frame-options", "DENY");
  headers.set("cross-origin-opener-policy", "same-origin");
  headers.set("content-security-policy", "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:; connect-src 'self'; form-action 'self'; manifest-src 'self'; worker-src 'self'; frame-src 'none'; upgrade-insecure-requests");
  if (env.APP_ENV === "production") headers.set("strict-transport-security", "max-age=31536000; includeSubDomains; preload");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

async function route(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request, env) });

  const boundary = await enforceApiBoundary(request, env);
  if (boundary) return boundary;
  // Public and auth
  if ((path === "/api/health" || path === "/api/system/health") && request.method === "GET") return healthRoute(env);
  if (path === "/api/public/locales" && request.method === "GET") return publicLocalesRoute(env);
  if (path === "/api/public/services" && request.method === "GET") return publicServicesRoute(env);
  if (path === "/api/public/news" && request.method === "GET") return publicNewsRoute(request, env);
  const publicNewsMatch = path.match(/^\/api\/public\/news\/(.+)$/);
  if (publicNewsMatch && request.method === "GET") return publicNewsDetailRoute(request, env, decodeURIComponent(publicNewsMatch[1]));
  const sitePageMatch = path.match(/^\/api\/public\/site-pages\/(.+)$/);
  if (sitePageMatch && request.method === "GET") return publicSitePageRoute(request, env, decodeURIComponent(sitePageMatch[1]));
  if (path === "/api/public/inquiries" && request.method === "POST") return publicInquiryRoute(request, env, ctx);
  const publicMediaMatch = path.match(/^\/api\/public\/media\/(\d+)$/);
  if (publicMediaMatch && request.method === "GET") return publicMediaRoute(env, Number(publicMediaMatch[1]));
  if (path === "/api/auth/login" && request.method === "POST") return loginRoute(request, env);
  if (path === "/api/auth/me" && request.method === "GET") return meRoute(request, env);
  if (path === "/api/auth/logout" && request.method === "POST") return logoutRoute(request, env);
  if (path === "/api/v1/auth/login" && request.method === "POST") return mobileLoginRoute(request, env);
  if (path === "/api/v1/auth/refresh" && request.method === "POST") return mobileRefreshRoute(request, env);
  if (path === "/api/v1/auth/me" && request.method === "GET") return mobileMeRoute(request, env);
  if (path === "/api/v1/auth/logout" && request.method === "POST") return mobileLogoutRoute(request, env);

  // Existing admin reads
  if (path === "/api/admin/dashboard" && request.method === "GET") return adminDashboardRoute(request, env);
  if (path === "/api/admin/inquiries" && request.method === "GET") return adminInquiriesRoute(request, env);
  const inquiryMatch = path.match(/^\/api\/admin\/inquiries\/(\d+)$/);
  if (inquiryMatch && request.method === "PATCH") return adminInquiryUpdateRoute(request, env, Number(inquiryMatch[1]));
  const inquiryConvertMatch = path.match(/^\/api\/admin\/inquiries\/(\d+)\/convert$/);
  if (inquiryConvertMatch && request.method === "POST") return adminInquiryConvertRoute(request, env, Number(inquiryConvertMatch[1]));
  if (path === "/api/admin/projects" && request.method === "GET") return adminProjectsRoute(request, env);
  if (path === "/api/admin/wbs" && request.method === "GET") return adminWbsRoute(request, env);
  if (path === "/api/admin/approvals" && request.method === "GET") return adminApprovalsRoute(request, env);
  if (path === "/api/admin/evaluations" && request.method === "GET") return adminEvaluationsRoute(request, env);
  if (path === "/api/admin/services" && request.method === "GET") return adminServicesRoute(request, env);
  if (path === "/api/admin/news" && request.method === "GET") return adminNewsRoute(request, env);
  if (path === "/api/admin/contents" && request.method === "GET") return adminContentsRoute(request, env);
  if (path === "/api/admin/users" && request.method === "GET") return adminUsersRoute(request, env);
  if (path === "/api/admin/departments" && request.method === "GET") return adminDepartmentsRoute(request, env);
  if (path === "/api/admin/roles" && request.method === "GET") return adminRolesRoute(request, env);
  if (path === "/api/admin/permissions" && request.method === "GET") return adminPermissionsRoute(request, env);
  if (path === "/api/admin/login-events" && request.method === "GET") return adminLoginEventsRoute(request, env);
  if (path === "/api/admin/leads" && request.method === "GET") return adminLeadsRoute(request, env);
  if (path === "/api/admin/opportunities" && request.method === "GET") return adminOpportunitiesRoute(request, env);
  if (path === "/api/admin/wbs-templates" && request.method === "GET") return adminWbsTemplatesRoute(request, env);
  if (path === "/api/admin/operations-summary" && request.method === "GET") return adminOperationsSummaryRoute(request, env);
  const contentTypesMatch = path.match(/^\/api\/admin\/services\/(\d+)\/content-types$/);
  if (contentTypesMatch && request.method === "GET") return adminContentTypesRoute(request, env, Number(contentTypesMatch[1]));
  const serviceDomainsMatch = path.match(/^\/api\/admin\/services\/(\d+)\/domains$/);
  if (serviceDomainsMatch && request.method === "GET") return adminServiceDomainsRoute(request, env, Number(serviceDomainsMatch[1]));
  const serviceChangesMatch = path.match(/^\/api\/admin\/services\/(\d+)\/changes$/);
  if (serviceChangesMatch && request.method === "GET") return adminServiceChangesRoute(request, env, Number(serviceChangesMatch[1]));
  const approvalDetailMatch = path.match(/^\/api\/admin\/approvals\/(\d+)$/);
  if (approvalDetailMatch && request.method === "GET") return adminApprovalDetailRoute(request, env, Number(approvalDetailMatch[1]));
  if (path === "/api/admin/evaluations/items" && request.method === "GET") return adminEvaluationItemsRoute(request, env);

  // Admin writes
  if (path === "/api/admin/media" && request.method === "POST") return adminMediaUploadRoute(request, env);
  if (path === "/api/admin/services" && request.method === "POST") return adminServiceCreateRoute(request, env);
  const serviceMatch = path.match(/^\/api\/admin\/services\/(\d+)$/);
  if (serviceMatch && request.method === "PATCH") return adminServiceUpdateRoute(request, env, Number(serviceMatch[1]));
  if (path === "/api/admin/contents" && request.method === "POST") return adminContentCreateRoute(request, env);
  const contentMatch = path.match(/^\/api\/admin\/contents\/(\d+)$/);
  if (contentMatch && request.method === "PATCH") return adminContentUpdateRoute(request, env, Number(contentMatch[1]));
  const translationMatch = path.match(/^\/api\/admin\/contents\/(\d+)\/translations\/(ko|en|ja|fr|es)$/);
  if (translationMatch && ["POST", "PATCH", "PUT"].includes(request.method)) {
    return adminTranslationUpsertRoute(request, env, Number(translationMatch[1]), translationMatch[2]);
  }
  if (path === "/api/admin/news" && request.method === "POST") return adminNewsCreateRoute(request, env);
  const newsMatch = path.match(/^\/api\/admin\/news\/(\d+)$/);
  if (newsMatch && request.method === "PATCH") return adminNewsUpdateRoute(request, env, Number(newsMatch[1]));
  const newsTranslationMatch = path.match(/^\/api\/admin\/news\/(\d+)\/translations\/(ko|en|ja|fr|es)$/);
  if (newsTranslationMatch && ["POST", "PATCH", "PUT"].includes(request.method)) {
    return adminNewsTranslationUpsertRoute(request, env, Number(newsTranslationMatch[1]), newsTranslationMatch[2]);
  }

  // ERP reads/writes. Read endpoints intentionally alias the mature admin summaries.
  if (path === "/api/erp/projects" && request.method === "GET") return adminProjectsRoute(request, env);
  if (path === "/api/erp/projects" && request.method === "POST") return erpProjectCreateRoute(request, env);
  if (path === "/api/erp/wbs" && request.method === "GET") return adminWbsRoute(request, env);
  if (path === "/api/erp/wbs" && request.method === "POST") return erpWbsCreateRoute(request, env);
  const wbsMatch = path.match(/^\/api\/erp\/wbs\/(\d+)$/);
  if (wbsMatch && request.method === "PATCH") return erpWbsUpdateRoute(request, env, Number(wbsMatch[1]));
  if (path === "/api/erp/daily-reports" && request.method === "POST") return erpDailyReportCreateRoute(request, env);
  if (path === "/api/erp/daily-logs" && request.method === "POST") return erpDailyLogCreateRoute(request, env);
  if (path === "/api/erp/approvals" && request.method === "GET") return adminApprovalsRoute(request, env);
  const erpApprovalDetailMatch = path.match(/^\/api\/erp\/approvals\/(\d+)$/);
  if (erpApprovalDetailMatch && request.method === "GET") return adminApprovalDetailRoute(request, env, Number(erpApprovalDetailMatch[1]));
  if (path === "/api/erp/approvals" && request.method === "POST") return erpApprovalCreateRoute(request, env);
  const approvalActionMatch = path.match(/^\/api\/erp\/approvals\/(\d+)\/actions$/);
  if (approvalActionMatch && request.method === "POST") return erpApprovalActionRoute(request, env, Number(approvalActionMatch[1]));
  if (path === "/api/erp/evaluations/cycles" && request.method === "GET") return adminEvaluationsRoute(request, env);
  if (path === "/api/erp/evaluations/cycles" && request.method === "POST") return erpEvaluationCycleCreateRoute(request, env);
  if (path === "/api/erp/evaluations/evidences" && request.method === "GET") return erpEvaluationEvidenceRoute(request, env);
  if (path === "/api/erp/evaluations/items" && request.method === "GET") return adminEvaluationItemsRoute(request, env);
  if (path === "/api/erp/evaluations/readiness" && request.method === "GET") return erpEvaluationReadinessRoute(request, env);
  if (path === "/api/erp/evaluations/scores" && request.method === "POST") return erpEvaluationScoreRoute(request, env);
  const evaluationFinalizeMatch = path.match(/^\/api\/erp\/evaluations\/cycles\/(\d+)\/finalize$/);
  if (evaluationFinalizeMatch && request.method === "POST") return erpEvaluationFinalizeRoute(request, env, Number(evaluationFinalizeMatch[1]));

  // Workplace / collaboration / finance
  if (path === "/api/erp/todos" && request.method === "GET") return todoListRoute(request, env);
  if (path === "/api/erp/todos" && request.method === "POST") return todoCreateRoute(request, env);
  const todoMatch = path.match(/^\/api\/erp\/todos\/(\d+)$/);
  if (todoMatch && request.method === "PATCH") return todoUpdateRoute(request, env, Number(todoMatch[1]));

  if (path === "/api/erp/attendance" && request.method === "GET") return attendanceListRoute(request, env);
  if (path === "/api/erp/attendance/punch" && request.method === "POST") return attendancePunchRoute(request, env);
  if (path === "/api/erp/attendance/correction" && request.method === "POST") return attendanceCorrectionRoute(request, env);
  const attendanceCorrectionMatch = path.match(/^\/api\/erp\/attendance\/(\d+)\/correction$/);
  if (attendanceCorrectionMatch && request.method === "PATCH") return attendanceCorrectionDecisionRoute(request, env, Number(attendanceCorrectionMatch[1]));

  if (path === "/api/erp/leave" && request.method === "GET") return leaveSummaryRoute(request, env);
  if (path === "/api/erp/leave/balance" && request.method === "POST") return leaveBalanceUpsertRoute(request, env);
  if (path === "/api/erp/leave" && request.method === "POST") return leaveCreateRoute(request, env);
  const leaveMatch = path.match(/^\/api\/erp\/leave\/(\d+)$/);
  if (leaveMatch && request.method === "PATCH") return leaveDecisionRoute(request, env, Number(leaveMatch[1]));

  if (path === "/api/erp/timesheets" && request.method === "GET") return timesheetListRoute(request, env);
  if (path === "/api/erp/timesheets" && request.method === "POST") return timesheetCreateRoute(request, env);
  const timesheetMatch = path.match(/^\/api\/erp\/timesheets\/(\d+)$/);
  if (timesheetMatch && request.method === "PATCH") return timesheetReviewRoute(request, env, Number(timesheetMatch[1]));
  if (path === "/api/erp/resource-allocations" && request.method === "POST") return allocationUpsertRoute(request, env);

  if (path === "/api/erp/budgets" && request.method === "GET") return budgetListRoute(request, env);
  if (path === "/api/erp/budgets" && request.method === "POST") return budgetUpsertRoute(request, env);
  if (path === "/api/erp/expenses" && request.method === "GET") return expenseListRoute(request, env);
  if (path === "/api/erp/expenses" && request.method === "POST") return expenseCreateRoute(request, env);
  const expenseMatch = path.match(/^\/api\/erp\/expenses\/(\d+)$/);
  if (expenseMatch && request.method === "PATCH") return expenseUpdateRoute(request, env, Number(expenseMatch[1]));

  if (path === "/api/erp/goals" && request.method === "GET") return goalListRoute(request, env);
  if (path === "/api/erp/goals" && request.method === "POST") return goalCreateRoute(request, env);
  const goalMatch = path.match(/^\/api\/erp\/goals\/(\d+)$/);
  if (goalMatch && request.method === "PATCH") return goalUpdateRoute(request, env, Number(goalMatch[1]));

  if (path === "/api/erp/board" && request.method === "GET") return boardListRoute(request, env);
  if (path === "/api/erp/board" && request.method === "POST") return boardCreateRoute(request, env);
  if (path === "/api/erp/knowledge" && request.method === "GET") return knowledgeListRoute(request, env);
  if (path === "/api/erp/knowledge" && request.method === "POST") return knowledgeCreateRoute(request, env);

  if (path === "/api/system/integrations" && request.method === "GET") return integrationListRoute(request, env);
  if (path === "/api/system/integrations" && ["POST", "PATCH"].includes(request.method)) return integrationUpsertRoute(request, env);
  if (path === "/api/system/email-templates" && request.method === "GET") return emailTemplateListRoute(request, env);
  if (path === "/api/system/email-templates" && ["POST", "PATCH"].includes(request.method)) return emailTemplateUpsertRoute(request, env);

  // Remaining administration operations
  if (path === "/api/admin/departments" && request.method === "POST") return departmentCreateRoute(request, env);
  if (path === "/api/admin/roles" && request.method === "POST") return roleCreateRoute(request, env);
  if (path === "/api/system/code-groups" && ["GET", "POST"].includes(request.method)) return codeGroupsRoute(request, env);
  const commonCodeMatch = path.match(/^\/api\/system\/code-groups\/(\d+)\/codes$/);
  if (commonCodeMatch && request.method === "POST") return commonCodeCreateRoute(request, env, Number(commonCodeMatch[1]));
  if (path === "/api/erp/approval-templates" && ["GET", "POST"].includes(request.method)) return approvalTemplatesRoute(request, env);
  const approvalTemplateStepMatch = path.match(/^\/api\/erp\/approval-templates\/(\d+)\/steps$/);
  if (approvalTemplateStepMatch && request.method === "POST") return approvalTemplateStepCreateRoute(request, env, Number(approvalTemplateStepMatch[1]));
  if (path === "/api/erp/project-issues" && request.method === "POST") return projectIssueCreateRoute(request, env);
  if (path === "/api/erp/project-meetings" && request.method === "POST") return projectMeetingCreateRoute(request, env);
  if (path === "/api/admin/service-deployments" && ["GET", "POST"].includes(request.method)) return serviceDeploymentsRoute(request, env);
  const serviceDomainCreateMatch = path.match(/^\/api\/admin\/services\/(\d+)\/domains$/);
  if (serviceDomainCreateMatch && request.method === "POST") return serviceDomainCreateRoute(request, env, Number(serviceDomainCreateMatch[1]));
  if (path === "/api/admin/site-banners" && ["GET", "POST"].includes(request.method)) return siteBannersRoute(request, env);
  if (path === "/api/admin/site-navigation" && ["GET", "POST"].includes(request.method)) return siteNavigationRoute(request, env);
  if (path === "/api/erp/knowledge-templates" && ["GET", "POST"].includes(request.method)) return knowledgeTemplatesRoute(request, env);

  // System
  if (path === "/api/system/audit-logs" && request.method === "GET") return systemAuditLogsRoute(request, env);
  if (path === "/api/system/settings" && request.method === "GET") return systemSettingsRoute(request, env);
  const settingMatch = path.match(/^\/api\/system\/settings\/(.+)$/);
  if (settingMatch && request.method === "PATCH") return systemSettingUpdateRoute(request, env, decodeURIComponent(settingMatch[1]));
  if (path === "/api/system/business-domains" && request.method === "GET") return systemBusinessDomainsRoute();

  return fail("NOT_FOUND", "?붿껌??API 寃쎈줈瑜?李얠쓣 ???놁뒿?덈떎.", 404);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const requestId = getRequestId(request);
    try {
      const url = new URL(request.url);
      if (env.APP_ENV === "production" && url.hostname === "jinbizman.com") {
        url.hostname = "www.jinbizman.com";
        return Response.redirect(url.toString(), 301);
      }

      if ((url.pathname === "/admin" || url.pathname.startsWith("/admin/")) && url.pathname !== "/admin/login") {
        const user = await getAuthUser(request, env);
        if (!user) return Response.redirect(new URL("/admin/login", request.url).toString(), 302);
        const asset = await env.ASSETS.fetch(request);
        return withSecurityHeaders(withRequestId(asset, requestId), env);
      }
      if (!url.pathname.startsWith("/api/")) {
        const asset = await env.ASSETS.fetch(request);
        return withSecurityHeaders(withRequestId(asset, requestId), env);
      }
      const response = withCors(await route(request, env, ctx), request, env);
      return withSecurityHeaders(withRequestId(response, requestId), env);
    } catch (error) {
      console.error("worker_error", error instanceof Error ? { message: error.message, stack: error.stack, requestId } : { error, requestId });
      const response = withCors(fail("INTERNAL_ERROR", "?붿껌??泥섎━?섎뒗 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.", 500), request, env);
      return withSecurityHeaders(withRequestId(response, requestId), env);
    }
  }
} satisfies ExportedHandler<Env>;
