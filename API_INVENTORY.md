# JINBIZ MANAGEMENT Production API Inventory v2

## 1. Snapshot Metadata
- Date: 2026-08-12T15:16:45+09:00
- Git HEAD: 6e13881fe4db818eafa7b73da9d2d84afcccc127
- Worker: jinbizman
- Production URL: https://www.jinbizman.com
- Source of Truth: `JINBIZ_MANAGEMENT_FullStack_Function_Performance_Requirements_v2.0_FINAL_20260812.pdf`; `JINBIZ_MANAGEMENT_Complete_Development_Master_Plan_v2.0_FINAL_20260812.pdf`
- Baseline inputs: `BASELINE.md`; `DB_INVENTORY.md`
- Scope: P0-003 API inventory only. No source, DB, Cloudflare, deployment, commit, or push action was performed.

## 2. Summary
- Unique paths: 92
- Method+path contracts: 124
- GET: 60
- POST: 46
- PATCH: 16
- PUT: 2
- DELETE: 0
- OPTIONS: global catch-all returns 204 with CORS headers; not counted as endpoint contract.
- Public: 7
- Auth: 3
- Admin: 47
- ERP: 52
- System: 13
- Health: 2
- Auth protected: 113
- Permission protected: 111
- Scope/self guarded: 54
- Origin protected write contracts: 63
- Rate limited: 2
- Transactional writes: 7
- Audited writes: 50
- Async/external side effects: 3
- Referenced DB tables: 60
- Direct test coverage: 40
- No direct test found: 84
- Mobile-ready: 7
- Needs `/api/v1` or mobile auth review: 55
- Web-cookie-only/internal: 60

## 3. Global Request Pipeline
- Request ID: `getRequestId()` uses `x-request-id` or `crypto.randomUUID()`, then `withRequestId()` adds `x-request-id` to API responses.
- Path normalization: `worker/index.ts` removes trailing slash and maps empty path to `/`.
- Apex redirect: production `jinbizman.com` redirects to `https://www.jinbizman.com`.
- CORS: global `OPTIONS` returns 204 using `corsHeaders`; allowed origins come from `ADMIN_ALLOWED_ORIGINS`; wildcard origin is not emitted.
- Trusted write origin: non-GET/HEAD/OPTIONS writes under `/api/admin/`, `/api/erp/`, `/api/system/`, `/api/auth/` require an allowed Origin unless Bearer auth is present.
- Auth: `getAuthUser()` accepts Bearer token or `jinbiz_session` cookie, verifies JWT, reloads active user and aggregated permissions from DB.
- Permission: route-local `requirePermission()` uses `hasPermission(user, code)`. Worker code checks permission codes, not role names.
- Response: `ok(data)` returns `{ success: true, data }`; `fail(code,message,status,details?)` returns `{ success: false, error: { code, message, details? } }`.
- Security headers: CSP, HSTS in production, frame denial, nosniff, referrer policy, permissions policy.
- Global error handler: uncaught exceptions log `worker_error` with request id and return `INTERNAL_ERROR` 500.

## 4. Endpoint Inventory
Legend: `Flags` = `scope`, `origin`, `validation`, `access`, `txn`, `audit`, `rate`, `test`, `mobile`, `versioning`. Every row is production-exposed through `worker/index.ts`.

| Method | Path | Class | Handler / Source | Auth / Permission | DB tables | Flags |
|---|---|---|---|---|---|---|
| GET | `/api/health` | Health | `healthRoute` / `worker/routes/health.ts` | anonymous / none | health DB probe | public; GET; N/A; READ; txn N/A; audit NONE; rate NO; Direct; NOT-MOBILE-RELEVANT; KEEP-INTERNAL |
| GET | `/api/system/health` | Health | `healthRoute` / `worker/routes/health.ts` | anonymous / none | health DB probe | public; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; NOT-MOBILE-RELEVANT; KEEP-INTERNAL |
| GET | `/api/public/locales` | Public | `publicLocalesRoute` / `worker/routes/public.ts` | anonymous / none | `news_posts`, `news_post_translations` | public; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; MOBILE-READY; PUBLIC-STABLE |
| GET | `/api/public/services` | Public | `publicServicesRoute` / `worker/routes/public.ts` | anonymous / none | `services` | public; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; MOBILE-READY; PUBLIC-STABLE |
| GET | `/api/public/news` | Public | `publicNewsRoute` / `worker/routes/public.ts` | anonymous / none | `news_posts`, `news_post_translations` | public; GET; INLINE-QUERY; READ; txn N/A; audit NONE; rate NO; Direct; MOBILE-READY; PUBLIC-STABLE |
| GET | `/api/public/news/:slug` | Public | `publicNewsDetailRoute` / `worker/routes/public.ts` | anonymous / none | `news_posts`, `news_post_translations`, `services` | public; GET; INLINE-QUERY; READ; txn N/A; audit NONE; rate NO; Direct; MOBILE-READY; PUBLIC-STABLE |
| GET | `/api/public/site-pages/:pageKey` | Public | `publicSitePageRoute` / `worker/routes/public.ts` | anonymous / none | `services`, `service_content_types`, `service_content_items`, `service_translations` | public; GET; INLINE-QUERY; READ; txn N/A; audit NONE; rate NO; No direct; MOBILE-READY; PUBLIC-STABLE |
| GET | `/api/public/media/:id` | Public | `publicMediaRoute` / `worker/routes/media.ts` | anonymous / none | `attachments`, R2 bucket read | public; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; MOBILE-READY; PUBLIC-STABLE |
| POST | `/api/public/inquiries` | Public | `publicInquiryRoute` / `worker/routes/public.ts` | anonymous / none | `inquiries`, `api_rate_limits`, email side effect | public; Not Origin Protected; INLINE; WRITE; txn NO; audit DOMAIN-SPECIFIC; rate YES; Direct; MOBILE-READY; PUBLIC-STABLE |
| POST | `/api/auth/login` | Auth | `loginRoute` / `worker/routes/auth.ts` | anonymous / none | `users`, `api_rate_limits`, `login_events` | public; Origin Protected; INLINE; READ+WRITE; txn NO; audit DOMAIN-SPECIFIC; rate YES; Direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/auth/logout` | Auth | `logoutRoute` / `worker/routes/auth.ts` | authenticated / none | `login_events` | global/none; Origin Protected; N/A; WRITE; txn NO; audit DOMAIN-SPECIFIC; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| GET | `/api/auth/me` | Auth | `meRoute` / `worker/routes/auth.ts` | authenticated / none | `users`, `user_roles`, `role_permissions`, `permissions` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; Direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| GET | `/api/admin/dashboard` | Admin | `adminDashboardRoute` / `worker/routes/admin.ts` | permission / `project.read` | `projects`, `wbs_tasks`, `approval_documents`, `inquiries`, `users` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/services` | Admin | `adminServicesRoute` / `worker/routes/admin.ts` | permission / `service.read` | `services` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| POST | `/api/admin/services` | Admin | `adminServiceCreateRoute` / `worker/routes/admin-write.ts` | permission / `service.create` | `services`, `service_content_types`, `service_domains`, `audit_logs` | self/scope-based; Origin Protected; INLINE; READ+WRITE; txn YES; audit FULL; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| PATCH | `/api/admin/services/:id` | Admin | `adminServiceUpdateRoute` / `worker/routes/admin-write.ts` | permission / `service.update` | `services`, `service_domains`, `audit_logs` | global/none; Origin Protected; INLINE; READ+WRITE; txn NO; audit FULL; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/services/:id/content-types` | Admin | `adminContentTypesRoute` / `worker/routes/admin.ts` | permission / `content.read` | `service_content_types` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/services/:id/domains` | Admin | `adminServiceDomainsRoute` / `worker/routes/admin.ts` | permission / `service.read` | `service_domains` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/services/:id/changes` | Admin | `adminServiceChangesRoute` / `worker/routes/admin.ts` | permission / `service.read` | `service_change_logs`, `users` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| POST | `/api/admin/services/:id/domains` | Admin | `serviceDomainCreateRoute` / `worker/routes/admin-operations.ts` | permission / `service.update` | `service_domains` | global/none; Origin Protected; INLINE; WRITE; txn NO; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/contents` | Admin | `adminContentsRoute` / `worker/routes/admin.ts` | permission / `content.read` | `service_content_items`, `service_content_types`, `services` | global/none; GET; INLINE-QUERY; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| POST | `/api/admin/contents` | Admin | `adminContentCreateRoute` / `worker/routes/admin-write.ts` | permission / `content.create` | `service_content_items`, `audit_logs` | self/scope-based; Origin Protected; INLINE; WRITE; txn NO; audit FULL; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| PATCH | `/api/admin/contents/:id` | Admin | `adminContentUpdateRoute` / `worker/routes/admin-write.ts` | permission / `content.update` or `content.publish` | `service_content_items`, `audit_logs` | self/scope-based; Origin Protected; INLINE; READ+WRITE; txn NO; audit FULL; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| POST | `/api/admin/contents/:id/translations/:locale` | Admin | `adminTranslationUpsertRoute` / `worker/routes/admin-write.ts` | permission / `translation.update` or `translation.publish` | `service_content_items`, `service_translations`, `audit_logs` | global/none; Origin Protected; INLINE; READ+WRITE; txn NO; audit FULL; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| PATCH | `/api/admin/contents/:id/translations/:locale` | Admin | `adminTranslationUpsertRoute` / `worker/routes/admin-write.ts` | permission / `translation.update` or `translation.publish` | `service_content_items`, `service_translations`, `audit_logs` | global/none; Origin Protected; INLINE; READ+WRITE; txn NO; audit FULL; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| PUT | `/api/admin/contents/:id/translations/:locale` | Admin | `adminTranslationUpsertRoute` / `worker/routes/admin-write.ts` | permission / `translation.update` or `translation.publish` | `service_content_items`, `service_translations`, `audit_logs` | global/none; Origin Protected; INLINE; READ+WRITE; txn NO; audit FULL; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/news` | Admin | `adminNewsRoute` / `worker/routes/admin.ts` | permission / `news.read` | `news_posts` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| POST | `/api/admin/news` | Admin | `adminNewsCreateRoute` / `worker/routes/admin-write.ts` | permission / `news.create` | `news_posts`, `audit_logs` | self/scope-based; Origin Protected; INLINE; WRITE; txn NO; audit FULL; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| PATCH | `/api/admin/news/:id` | Admin | `adminNewsUpdateRoute` / `worker/routes/admin-write.ts` | permission / `news.update` or `news.publish` | `news_posts`, `audit_logs` | self/scope-based; Origin Protected; INLINE; READ+WRITE; txn NO; audit FULL; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| POST | `/api/admin/news/:id/translations/:locale` | Admin | `adminNewsTranslationUpsertRoute` / `worker/routes/admin-write.ts` | permission / `news.update` or `news.publish` | `news_posts`, `news_post_translations`, `audit_logs` | global/none; Origin Protected; INLINE; READ+WRITE; txn NO; audit FULL; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| PATCH | `/api/admin/news/:id/translations/:locale` | Admin | `adminNewsTranslationUpsertRoute` / `worker/routes/admin-write.ts` | permission / `news.update` or `news.publish` | `news_posts`, `news_post_translations`, `audit_logs` | global/none; Origin Protected; INLINE; READ+WRITE; txn NO; audit FULL; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| PUT | `/api/admin/news/:id/translations/:locale` | Admin | `adminNewsTranslationUpsertRoute` / `worker/routes/admin-write.ts` | permission / `news.update` or `news.publish` | `news_posts`, `news_post_translations`, `audit_logs` | global/none; Origin Protected; INLINE; READ+WRITE; txn NO; audit FULL; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/inquiries` | Admin | `adminInquiriesRoute` / `worker/routes/admin.ts` | permission / `inquiry.read` | `inquiries` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| PATCH | `/api/admin/inquiries/:id` | Admin | `adminInquiryUpdateRoute` / `worker/routes/admin.ts` | permission / `inquiry.update` | `inquiries`, `audit_logs` | global/none; Origin Protected; INLINE; READ+WRITE; txn NO; audit FULL; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| POST | `/api/admin/inquiries/:id/convert` | Admin | `adminInquiryConvertRoute` / `worker/routes/admin-write.ts` | permission / `lead.create` | `inquiries`, `leads`, `audit_logs` | self/scope-based; Origin Protected; INLINE; READ+WRITE; txn YES; audit FULL; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/leads` | Admin | `adminLeadsRoute` / `worker/routes/admin.ts` | permission / `inquiry.read` or `lead.update` or `opportunity.manage` | `leads`, `services`, `users` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/opportunities` | Admin | `adminOpportunitiesRoute` / `worker/routes/admin.ts` | permission / `opportunity.manage` | `opportunities`, `leads`, `services`, `users` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/projects` | Admin | `adminProjectsRoute` / `worker/routes/admin.ts` | permission / `project.read` | `projects`, `wbs_tasks` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/wbs` | Admin | `adminWbsRoute` / `worker/routes/admin.ts` | permission / `wbs.read` | `wbs_tasks` | global/none; GET; INLINE-QUERY; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/wbs-templates` | Admin | `adminWbsTemplatesRoute` / `worker/routes/admin.ts` | permission / `wbs.read` | `wbs_templates`, `wbs_template_items` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/approvals` | Admin | `adminApprovalsRoute` / `worker/routes/admin.ts` | permission / `approval.read` | `approval_documents` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/approvals/:id` | Admin | `adminApprovalDetailRoute` / `worker/routes/admin.ts` | permission / `approval.read` | `approval_documents`, `approval_lines`, `approval_actions`, `projects`, `services`, `users` | self/scope-based; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/evaluations` | Admin | `adminEvaluationsRoute` / `worker/routes/admin.ts` | permission / `evaluation.read` | `evaluation_cycles` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/evaluations/items` | Admin | `adminEvaluationItemsRoute` / `worker/routes/admin.ts` | permission / `evaluation.read` | `evaluation_items` | global/none; GET; INLINE-QUERY; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/departments` | Admin | `adminDepartmentsRoute` / `worker/routes/admin.ts` | permission / `user.read` | `departments`, `users` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; Direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| POST | `/api/admin/departments` | Admin | `departmentCreateRoute` / `worker/routes/admin-operations.ts` | permission / `system.update` | `departments`, `audit_logs` | global/none; Origin Protected; INLINE; WRITE; txn NO; audit FULL; rate NO; Direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/roles` | Admin | `adminRolesRoute` / `worker/routes/admin.ts` | permission / `role.read` | `roles`, `permissions`, `role_permissions`, `user_roles` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; Direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| POST | `/api/admin/roles` | Admin | `roleCreateRoute` / `worker/routes/admin-operations.ts` | permission / `system.update` | `roles`, `audit_logs` | global/none; Origin Protected; INLINE; WRITE; txn NO; audit FULL; rate NO; Direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/permissions` | Admin | `adminPermissionsRoute` / `worker/routes/admin.ts` | permission / `role.read` | `permissions` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/users` | Admin | `adminUsersRoute` / `worker/routes/admin.ts` | permission / `user.read` or `approval.create` or `evaluation.read` | `users`, `departments` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/login-events` | Admin | `adminLoginEventsRoute` / `worker/routes/admin.ts` | permission / `audit.read` | `login_events`, `users` | global/none; GET; N/A; READ; txn N/A; audit DOMAIN-SPECIFIC; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/operations-summary` | Admin | `adminOperationsSummaryRoute` / `worker/routes/admin.ts` | permission / `project.read` | `projects`, `wbs_tasks`, `approval_documents`, `inquiries`, `leads`, `evaluation_evidences`, `expense_requests`, `project_budgets` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| POST | `/api/admin/media` | Admin | `adminMediaUploadRoute` / `worker/routes/media.ts` | permission / `content.update` | `attachments`, `services`, R2 bucket | global/none; Origin Protected; INLINE(form-data); READ+WRITE; txn NO; audit NONE; rate NO; Direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/service-deployments` | Admin | `serviceDeploymentsRoute` / `worker/routes/admin-operations.ts` | permission / `service.read` | `service_deployments` | global/none; GET; INLINE-QUERY; READ; txn N/A; audit NONE; rate NO; Direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| POST | `/api/admin/service-deployments` | Admin | `serviceDeploymentsRoute` / `worker/routes/admin-operations.ts` | permission / `service.update` | `service_deployments` | self/scope-based; Origin Protected; INLINE; WRITE; txn NO; audit NONE; rate NO; Direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/site-banners` | Admin | `siteBannersRoute` / `worker/routes/admin-operations.ts` | permission / `content.read` | `site_banners` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; Direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| POST | `/api/admin/site-banners` | Admin | `siteBannersRoute` / `worker/routes/admin-operations.ts` | permission / `content.update` | `site_banners` | self/scope-based; Origin Protected; INLINE; WRITE; txn NO; audit NONE; rate NO; Direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/admin/site-navigation` | Admin | `siteNavigationRoute` / `worker/routes/admin-operations.ts` | permission / `content.read` | `site_navigation_items` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; Direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| POST | `/api/admin/site-navigation` | Admin | `siteNavigationRoute` / `worker/routes/admin-operations.ts` | permission / `content.update` | `site_navigation_items` | global/none; Origin Protected; INLINE; WRITE; txn NO; audit NONE; rate NO; Direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/erp/projects` | ERP | `adminProjectsRoute` / `worker/routes/admin.ts` | permission / `project.read` | `projects`, `wbs_tasks` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; Direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/projects` | ERP | `erpProjectCreateRoute` / `worker/routes/erp.ts` | permission / `project.create` | `projects`, `project_members`, `audit_logs` | self/scope-based; Origin Protected; INLINE; WRITE; txn NO; audit FULL; rate NO; Direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| GET | `/api/erp/wbs` | ERP | `adminWbsRoute` / `worker/routes/admin.ts` | permission / `wbs.read` | `wbs_tasks` | global/none; GET; INLINE-QUERY; READ; txn N/A; audit NONE; rate NO; Direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/wbs` | ERP | `erpWbsCreateRoute` / `worker/routes/erp.ts` | permission / `wbs.create` | `wbs_tasks`, `audit_logs` | self/scope-based; Origin Protected; INLINE; WRITE; txn NO; audit FULL; rate NO; Direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| PATCH | `/api/erp/wbs/:id` | ERP | `erpWbsUpdateRoute` / `worker/routes/erp.ts` | permission / `wbs.update` | `wbs_tasks`, `audit_logs` | global/none; Origin Protected; INLINE; READ+WRITE; txn NO; audit FULL; rate NO; Direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/daily-reports` | ERP | `erpDailyReportCreateRoute` / `worker/routes/erp.ts` | permission / `daily_report.create` | `daily_reports`, `daily_report_items`, `users`, `audit_logs` | self/scope-based; Origin Protected; INLINE; READ+WRITE; txn YES; audit FULL; rate NO; Direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/daily-logs` | ERP | `erpDailyLogCreateRoute` / `worker/routes/erp.ts` | permission / `daily_log.create` | `daily_logs`, `daily_log_items`, `users`, `wbs_tasks`, `audit_logs` | self/scope-based; Origin Protected; INLINE; READ+WRITE; txn YES; audit FULL; rate NO; Direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| GET | `/api/erp/approvals` | ERP | `adminApprovalsRoute` / `worker/routes/admin.ts` | permission / `approval.read` | `approval_documents` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; Direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| GET | `/api/erp/approvals/:id` | ERP | `adminApprovalDetailRoute` / `worker/routes/admin.ts` | permission / `approval.read` | `approval_documents`, `approval_lines`, `approval_actions`, `projects`, `services`, `users` | self/scope-based; GET; N/A; READ; txn N/A; audit NONE; rate NO; Direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/approvals` | ERP | `erpApprovalCreateRoute` / `worker/routes/erp.ts` | permission / `approval.create` | `approval_documents`, `approval_lines`, `audit_logs` | self/scope-based; Origin Protected; INLINE; READ+WRITE; txn YES; audit FULL; rate NO; Direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/approvals/:id/actions` | ERP | `erpApprovalActionRoute` / `worker/routes/erp.ts` | permission / `approval.act` | `approval_documents`, `approval_lines`, `approval_actions`, `wbs_tasks`, `audit_logs` | self/scope-based; Origin Protected; INLINE; READ+WRITE; txn NO; audit FULL; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| GET | `/api/erp/evaluations/cycles` | ERP | `adminEvaluationsRoute` / `worker/routes/admin.ts` | permission / `evaluation.read` | `evaluation_cycles` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/evaluations/cycles` | ERP | `erpEvaluationCycleCreateRoute` / `worker/routes/erp.ts` | permission / `evaluation.finalize` | `evaluation_cycles`, `audit_logs` | self/scope-based; Origin Protected; INLINE; WRITE; txn NO; audit FULL; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| GET | `/api/erp/evaluations/items` | ERP | `adminEvaluationItemsRoute` / `worker/routes/admin.ts` | permission / `evaluation.read` | `evaluation_items` | global/none; GET; INLINE-QUERY; READ; txn N/A; audit NONE; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| GET | `/api/erp/evaluations/evidences` | ERP | `erpEvaluationEvidenceRoute` / `worker/routes/erp.ts` | permission / `evaluation.read` | `evaluation_evidences` | global/none; GET; INLINE-QUERY; READ; txn N/A; audit NONE; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| GET | `/api/erp/evaluations/readiness` | ERP | `erpEvaluationReadinessRoute` / `worker/routes/erp.ts` | permission / `evaluation.read` | `evaluation_cycles`, `evaluation_evidences`, `evaluation_scores` | global/none; GET; INLINE-QUERY; READ; txn N/A; audit NONE; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/evaluations/scores` | ERP | `erpEvaluationScoreRoute` / `worker/routes/erp.ts` | permission / `evaluation.score` | `evaluation_scores`, `audit_logs` | self/scope-based; Origin Protected; INLINE; WRITE; txn NO; audit FULL; rate NO; Direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/evaluations/cycles/:id/finalize` | ERP | `erpEvaluationFinalizeRoute` / `worker/routes/erp.ts` | permission / `evaluation.finalize` | `evaluation_cycles`, `evaluation_evidences`, `evaluation_scores`, `audit_logs` | global/none; Origin Protected; N/A; READ+WRITE; txn NO; audit FULL; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| GET | `/api/erp/todos` | ERP | `todoListRoute` / `worker/routes/operations.ts` | permission / `todo.read` | `todo_items`, `projects`, `wbs_tasks` | self/scope-based; GET; N/A; READ+WRITE; txn N/A; audit NONE; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/todos` | ERP | `todoCreateRoute` / `worker/routes/operations.ts` | permission / `todo.create` | `todo_items`, `audit_logs` | self/scope-based; Origin Protected; INLINE; WRITE; txn NO; audit FULL; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| PATCH | `/api/erp/todos/:id` | ERP | `todoUpdateRoute` / `worker/routes/operations.ts` | permission / `todo.update` | `todo_items`, `audit_logs` | self/scope-based; Origin Protected; INLINE; READ+WRITE; txn NO; audit FULL; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| GET | `/api/erp/attendance` | ERP | `attendanceListRoute` / `worker/routes/operations.ts` | permission / `attendance.read` | `attendance_records`, `users` | self/scope-based; GET; N/A; READ; txn N/A; audit NONE; rate NO; Direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/attendance/punch` | ERP | `attendancePunchRoute` / `worker/routes/operations.ts` | permission / `attendance.punch` | `attendance_records`, `audit_logs` | self/scope-based; Origin Protected; INLINE; READ+WRITE; txn NO; audit FULL; rate NO; Direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/attendance/correction` | ERP | `attendanceCorrectionRoute` / `worker/routes/operations.ts` | permission / `attendance.read` | `attendance_records`, `audit_logs` | self/scope-based; Origin Protected; INLINE; WRITE; txn NO; audit FULL; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| PATCH | `/api/erp/attendance/:id/correction` | ERP | `attendanceCorrectionDecisionRoute` / `worker/routes/operations.ts` | permission / `attendance.manage` | `attendance_records`, `audit_logs` | self/scope-based; Origin Protected; INLINE; READ+WRITE; txn NO; audit FULL; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| GET | `/api/erp/leave` | ERP | `leaveSummaryRoute` / `worker/routes/operations.ts` | permission / `leave.read` | `leave_requests`, `leave_balances`, `users` | self/scope-based; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/leave` | ERP | `leaveCreateRoute` / `worker/routes/operations.ts` | permission / `leave.create` | `leave_requests`, `leave_balances`, `audit_logs` | self/scope-based; Origin Protected; INLINE; READ+WRITE; txn NO; audit FULL; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| PATCH | `/api/erp/leave/:id` | ERP | `leaveDecisionRoute` / `worker/routes/operations.ts` | permission / `leave.manage` | `leave_requests`, `leave_balances`, `audit_logs` | self/scope-based; Origin Protected; INLINE; READ+WRITE; txn YES; audit FULL; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/leave/balance` | ERP | `leaveBalanceUpsertRoute` / `worker/routes/operations.ts` | permission / `leave.manage` | `leave_balances`, `audit_logs` | self/scope-based; Origin Protected; INLINE; WRITE; txn NO; audit FULL; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| GET | `/api/erp/timesheets` | ERP | `timesheetListRoute` / `worker/routes/operations.ts` | permission / `timesheet.read`; `timesheet.review` for cross-user query | `timesheets`, `project_resource_allocations`, `projects`, `users`, `wbs_tasks` | self/scope-based; GET; INLINE-QUERY; READ; txn N/A; audit NONE; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/timesheets` | ERP | `timesheetCreateRoute` / `worker/routes/operations.ts` | permission / `timesheet.create` | `timesheets`, `wbs_tasks`, `audit_logs` | self/scope-based; Origin Protected; INLINE; READ+WRITE; txn NO; audit FULL; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| PATCH | `/api/erp/timesheets/:id` | ERP | `timesheetReviewRoute` / `worker/routes/operations.ts` | permission / `timesheet.review` | `timesheets`, `audit_logs` | self/scope-based; Origin Protected; INLINE; READ+WRITE; txn NO; audit FULL; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| GET | `/api/erp/expenses` | ERP | `expenseListRoute` / `worker/routes/operations.ts` | permission / `expense.read`; `expense.manage` for all-user scope | `expense_requests`, `project_budgets`, `projects`, `users` | self/scope-based; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/expenses` | ERP | `expenseCreateRoute` / `worker/routes/operations.ts` | permission / `expense.create` | `expense_requests`, `project_budgets`, `audit_logs` | self/scope-based; Origin Protected; INLINE; READ+WRITE; txn NO; audit FULL; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| PATCH | `/api/erp/expenses/:id` | ERP | `expenseUpdateRoute` / `worker/routes/operations.ts` | permission / `expense.manage` | `expense_requests`, `project_budgets`, `audit_logs` | self/scope-based; Origin Protected; INLINE; READ+WRITE; txn YES; audit FULL; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| GET | `/api/erp/budgets` | ERP | `budgetListRoute` / `worker/routes/operations.ts` | permission / `budget.read` | `project_budgets`, `projects` | global/none; GET; INLINE-QUERY; READ; txn N/A; audit NONE; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/budgets` | ERP | `budgetUpsertRoute` / `worker/routes/operations.ts` | permission / `budget.manage` | `project_budgets`, `audit_logs` | global/none; Origin Protected; INLINE; WRITE; txn NO; audit FULL; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/resource-allocations` | ERP | `allocationUpsertRoute` / `worker/routes/operations.ts` | permission / `project.member.manage` | `project_resource_allocations`, `audit_logs` | global/none; Origin Protected; INLINE; READ+WRITE; txn NO; audit FULL; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| GET | `/api/erp/goals` | ERP | `goalListRoute` / `worker/routes/operations.ts` | permission / `goal.read`; `goal.manage` for all-user scope | `goals`, `departments`, `projects`, `users` | self/scope-based; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/goals` | ERP | `goalCreateRoute` / `worker/routes/operations.ts` | permission / `goal.manage` | `goals`, `audit_logs` | self/scope-based; Origin Protected; INLINE; WRITE; txn NO; audit FULL; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| PATCH | `/api/erp/goals/:id` | ERP | `goalUpdateRoute` / `worker/routes/operations.ts` | permission / `goal.manage` | `goals`, `audit_logs` | self/scope-based; Origin Protected; INLINE; READ+WRITE; txn NO; audit FULL; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| GET | `/api/erp/knowledge` | ERP | `knowledgeListRoute` / `worker/routes/operations.ts` | permission / `knowledge.read` | `knowledge_documents`, `users` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; Direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/knowledge` | ERP | `knowledgeCreateRoute` / `worker/routes/operations.ts` | permission / `knowledge.manage` | `knowledge_documents`, `audit_logs` | self/scope-based; Origin Protected; INLINE; WRITE; txn NO; audit FULL; rate NO; Direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| GET | `/api/erp/board` | ERP | `boardListRoute` / `worker/routes/operations.ts` | permission / `board.read` | `board_posts`, `users` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/board` | ERP | `boardCreateRoute` / `worker/routes/operations.ts` | permission / `board.manage` | `board_posts`, `audit_logs` | self/scope-based; Origin Protected; INLINE; WRITE; txn NO; audit FULL; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| GET | `/api/erp/approval-templates` | ERP | `approvalTemplatesRoute` / `worker/routes/admin-operations.ts` | permission / `approval.read` | `approval_templates`, `approval_template_steps` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; Direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/approval-templates` | ERP | `approvalTemplatesRoute` / `worker/routes/admin-operations.ts` | permission / `approval.create` | `approval_templates` | self/scope-based; Origin Protected; INLINE; WRITE; txn NO; audit NONE; rate NO; Direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/approval-templates/:id/steps` | ERP | `approvalTemplateStepCreateRoute` / `worker/routes/admin-operations.ts` | permission / `approval.create` | `approval_template_steps` | self/scope-based; Origin Protected; INLINE; WRITE; txn NO; audit NONE; rate NO; No direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/project-issues` | ERP | `projectIssueCreateRoute` / `worker/routes/admin-operations.ts` | permission / `project.update` | `project_issues` | self/scope-based; Origin Protected; INLINE; WRITE; txn NO; audit NONE; rate NO; Direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/project-meetings` | ERP | `projectMeetingCreateRoute` / `worker/routes/admin-operations.ts` | permission / `project.update` | `project_meetings` | self/scope-based; Origin Protected; INLINE; WRITE; txn NO; audit NONE; rate NO; Direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| GET | `/api/erp/knowledge-templates` | ERP | `knowledgeTemplatesRoute` / `worker/routes/admin-operations.ts` | permission / `system.read` | `knowledge_templates` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; Direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| POST | `/api/erp/knowledge-templates` | ERP | `knowledgeTemplatesRoute` / `worker/routes/admin-operations.ts` | permission / `system.update` | `knowledge_templates` | self/scope-based; Origin Protected; INLINE; WRITE; txn NO; audit NONE; rate NO; Direct; NEEDS-MOBILE-AUTH; V1-CANDIDATE |
| GET | `/api/system/settings` | System | `systemSettingsRoute` / `worker/routes/system.ts` | permission / `system.read` | `system_settings` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| PATCH | `/api/system/settings/:key` | System | `systemSettingUpdateRoute` / `worker/routes/system.ts` | permission / `system.update` | `system_settings`, `audit_logs` | self/scope-based; Origin Protected; INLINE; READ+WRITE; txn NO; audit FULL; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/system/audit-logs` | System | `systemAuditLogsRoute` / `worker/routes/system.ts` | permission / `audit.read` | `audit_logs`, `users` | global/none; GET; INLINE-QUERY; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/system/business-domains` | System | `systemBusinessDomainsRoute` / `worker/routes/system.ts` | anonymous / none | none | public; GET; N/A; NONE; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/system/email-templates` | System | `emailTemplateListRoute` / `worker/routes/operations.ts` | permission / `email_template.read` | `email_templates` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| POST | `/api/system/email-templates` | System | `emailTemplateUpsertRoute` / `worker/routes/operations.ts` | permission / `email_template.manage` | `email_templates`, `audit_logs` | self/scope-based; Origin Protected; INLINE; WRITE; txn NO; audit FULL; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| PATCH | `/api/system/email-templates` | System | `emailTemplateUpsertRoute` / `worker/routes/operations.ts` | permission / `email_template.manage` | `email_templates`, `audit_logs` | self/scope-based; Origin Protected; INLINE; WRITE; txn NO; audit FULL; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/system/integrations` | System | `integrationListRoute` / `worker/routes/operations.ts` | permission / `integration.read` | `integrations` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| POST | `/api/system/integrations` | System | `integrationUpsertRoute` / `worker/routes/operations.ts` | permission / `integration.manage` | `integrations`, `audit_logs` | global/none; Origin Protected; INLINE; WRITE; txn NO; audit FULL; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| PATCH | `/api/system/integrations` | System | `integrationUpsertRoute` / `worker/routes/operations.ts` | permission / `integration.manage` | `integrations`, `audit_logs` | global/none; Origin Protected; INLINE; WRITE; txn NO; audit FULL; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| GET | `/api/system/code-groups` | System | `codeGroupsRoute` / `worker/routes/admin-operations.ts` | permission / `system.read` | `common_code_groups`, `common_codes` | global/none; GET; N/A; READ; txn N/A; audit NONE; rate NO; Direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| POST | `/api/system/code-groups` | System | `codeGroupsRoute` / `worker/routes/admin-operations.ts` | permission / `system.update` | `common_code_groups`, `common_codes` | self/scope-based; Origin Protected; INLINE; WRITE; txn NO; audit NONE; rate NO; Direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |
| POST | `/api/system/code-groups/:id/codes` | System | `commonCodeCreateRoute` / `worker/routes/admin-operations.ts` | permission / `system.update` | `common_codes` | global/none; Origin Protected; INLINE; WRITE; txn NO; audit NONE; rate NO; No direct; WEB-COOKIE-ONLY; KEEP-INTERNAL |

## 5. Error Code Catalog
- ACCOUNT_LOCKED
- CONFLICT
- FILE_SIZE_INVALID
- FILE_TYPE_INVALID
- FORBIDDEN
- FORBIDDEN_ORIGIN
- INTERNAL_ERROR
- INVALID_CREDENTIALS
- INVALID_JSON
- MEDIA_STORAGE_NOT_CONFIGURED
- NOT_FOUND
- PRECONDITION_FAILED
- RATE_LIMITED
- UNAUTHORIZED
- VALIDATION_ERROR

## 6. Permission Mapping
- Literal and dynamic permission codes observed: `approval.act`, `approval.create`, `approval.read`, `attendance.manage`, `attendance.punch`, `attendance.read`, `audit.read`, `board.manage`, `board.read`, `budget.manage`, `budget.read`, `content.create`, `content.publish`, `content.read`, `content.update`, `daily_log.create`, `daily_report.create`, `email_template.manage`, `email_template.read`, `evaluation.finalize`, `evaluation.read`, `evaluation.score`, `expense.create`, `expense.manage`, `expense.read`, `goal.manage`, `goal.read`, `inquiry.read`, `inquiry.update`, `integration.manage`, `integration.read`, `knowledge.manage`, `knowledge.read`, `lead.create`, `lead.update`, `leave.create`, `leave.manage`, `leave.read`, `news.create`, `news.publish`, `news.read`, `news.update`, `opportunity.manage`, `project.create`, `project.member.manage`, `project.read`, `project.update`, `role.read`, `service.create`, `service.read`, `service.update`, `system.read`, `system.update`, `timesheet.create`, `timesheet.read`, `timesheet.review`, `todo.create`, `todo.read`, `todo.update`, `translation.publish`, `translation.update`, `user.read`, `wbs.create`, `wbs.read`, `wbs.update`.
- Alternative permissions are used in `adminLeadsRoute`, `adminUsersRoute`, `timesheetListRoute`, `expenseListRoute`, and `goalListRoute`.
- Super admin behavior is permission-list based: the Worker checks permission codes, not role names.

## 7. Scope Mapping
- Centralized scope helper: NOT FOUND.
- Ad hoc self/scope guards observed in approvals detail/action, daily reports/logs, todos, attendance, leave, timesheets, expenses, goals, content/news actor fields, and several create/update handlers using `auth.id`.
- Global/no explicit row scope observed for many admin reads, CMS/service operations, system reads, budgets, and some project/WBS reads. This is inventory only, not a confirmed vulnerability finding.

## 8. DB Table Usage Matrix
- Referenced tables across API handlers: `approval_actions`, `approval_documents`, `approval_lines`, `approval_template_steps`, `approval_templates`, `api_rate_limits`, `attachments`, `attendance_records`, `audit_logs`, `board_posts`, `common_code_groups`, `common_codes`, `daily_log_items`, `daily_logs`, `daily_report_items`, `daily_reports`, `departments`, `email_delivery_logs`, `email_templates`, `evaluation_cycles`, `evaluation_evidences`, `evaluation_items`, `evaluation_scores`, `expense_requests`, `goals`, `inquiries`, `integrations`, `knowledge_documents`, `knowledge_templates`, `leads`, `leave_balances`, `leave_requests`, `login_events`, `news_post_translations`, `news_posts`, `opportunities`, `permissions`, `project_budgets`, `project_issues`, `project_meetings`, `project_members`, `project_resource_allocations`, `projects`, `role_permissions`, `roles`, `service_change_logs`, `service_content_items`, `service_content_types`, `service_deployments`, `service_domains`, `service_translations`, `services`, `site_banners`, `site_navigation_items`, `system_settings`, `timesheets`, `todo_items`, `user_roles`, `users`, `wbs_tasks`, `wbs_template_items`, `wbs_templates`.
- Unmapped API to DB: `systemBusinessDomainsRoute` is static in-code reference data; health checks DB indirectly through `healthRoute`.

## 9. Transaction Matrix
- Transactional write style found: single SQL CTE/statement atomicity, not an explicit transaction helper.
- Transactional writes counted: admin service create, inquiry conversion, daily report create, daily log create, approval create, leave decision, expense update.
- Multi-statement writes without explicit transaction helper are recorded as `NO` in the endpoint table.

## 10. Audit Coverage Matrix
- Full audit writes counted: 50 write contracts call `writeAuditLog` or write through audited helper behavior.
- Domain-specific logs: auth login/logout use `login_events`; public inquiry uses inquiry record and email notification path, not generic audit.
- No generic audit observed on several admin-operation setup writes such as service domains, site banners/navigation, approval template steps, project issues/meetings, and code groups/codes.

## 11. Rate Limit Matrix
- `POST /api/auth/login`: `consumeLoginRateLimit`, default `LOGIN_RATE_LIMIT_PER_10_MIN` 10.
- `POST /api/public/inquiries`: `consumePublicRateLimit`, default `PUBLIC_RATE_LIMIT_PER_10_MIN` 20.
- Rate-limit storage table: `api_rate_limits`; 10-minute rolling window logic in `worker/lib/rate-limit.ts`.

## 12. Mobile Reuse Matrix
- MOBILE-READY: public read APIs and public inquiry API: 7 contracts.
- NEEDS-MOBILE-AUTH / V1-CANDIDATE: auth and ERP JSON APIs: 55 contracts.
- WEB-COOKIE-ONLY / KEEP-INTERNAL: admin and system APIs: 60 contracts.
- NOT-MOBILE-RELEVANT: health endpoints: 2 contracts.

## 13. Test Coverage Matrix
- Direct endpoint or handler/string coverage found in `tests/admin-react.test.mjs`, `tests/browser_qa_erp.py`, `tests/browser_qa_public.py`, `tests/test_site.py`, and `tests/worker/config.test.mjs`.
- Direct coverage count: 40 contracts.
- No direct test found: 84 contracts. Many are currently covered only indirectly through UI/source-pattern tests or not covered.

## 14. Source vs v2.0 Document Drift
- Prefix model MATCH: current source exposes `/api/public`, `/api/auth`, `/api/admin`, `/api/erp`, `/api/system`, and health routes required by v2.0 direction.
- API versioning DOCUMENT-ONLY / FUTURE: no `/api/v1` route surface exists yet; existing ERP/auth routes are V1 candidates for mobile work in later phases.
- Scope model PARTIAL: v2.0 expects role/scope clarity; current source uses route-level permissions plus ad hoc self/manage checks, not a centralized scope abstraction.
- Transaction model PARTIAL: several multi-table writes use CTE atomic statements; no explicit transaction helper was found.
- Test coverage PARTIAL: direct test coverage exists for 40/124 contracts; broad endpoint contract tests are not complete.

## 15. Gap Candidates
### GAP-API-001
Type: P1 candidate
Endpoint: `/api/erp/*`, `/api/auth/*`
Observed: Mobile-useful APIs exist under unversioned cookie-oriented routes.
Expected: v2.0 mobile-ready API versioning review and mobile auth strategy.
Risk: Future mobile clients may couple to internal web contracts.
Suggested Review Phase: P1/P6

### GAP-API-002
Type: P1 candidate
Endpoint: protected admin/ERP/system routes
Observed: Permission checks are route-local and scope rules are ad hoc.
Expected: Central route metadata or reusable scope guard for service/project/team/self access.
Risk: Inconsistent authorization semantics across modules.
Suggested Review Phase: P1

### GAP-API-003
Type: P2 candidate
Endpoint: selected multi-table writes
Observed: Some multi-step writes do not use an explicit transaction helper.
Expected: Transaction strategy review for writes that must be atomic across tables/external side effects.
Risk: Partial writes if later statements fail.
Suggested Review Phase: P2

### GAP-API-004
Type: P1 candidate
Endpoint: selected setup/admin-operation writes
Observed: Some writes do not emit generic `audit_logs`.
Expected: Audit policy review for admin-operation setup writes.
Risk: Reduced traceability for configuration/content operations.
Suggested Review Phase: P1

### GAP-API-005
Type: P2 candidate
Endpoint: `GET /api/erp/todos`
Observed: Handler performs read plus synchronization/upsert behavior into `todo_items`.
Expected: Review whether GET should remain side-effecting or move sync to explicit write/system job.
Risk: Read requests can mutate operational state.
Suggested Review Phase: P2

## 16. Production Read-only Verification
- `GET https://www.jinbizman.com/api/health`: 200, `{ success: true, data.status: "ok", data.environment: "production", data.database: "connected" }`.
- `GET https://www.jinbizman.com/api/public/locales`: 200, success envelope with `defaultLocale` and locale list.
- `GET https://www.jinbizman.com/api/public/services`: 200, success envelope with list data.
- `GET https://www.jinbizman.com/api/public/news`: 200, success envelope with locale/items.
- `GET https://www.jinbizman.com/api/auth/me`: 401, `UNAUTHORIZED`, expected when unauthenticated.
- Production write calls: 0.

## 17. P0-003 Exit Criteria
- [x] Worker entrypoint 전체 분석
- [x] 모든 route path 추출
- [x] Method 전수
- [x] Dynamic route 전수
- [x] Handler mapping
- [x] Handler source file mapping
- [x] Auth requirement 전수
- [x] Permission requirement 전수
- [x] Scope 전수
- [x] Origin/CORS mapping
- [x] Validation mapping
- [x] Request contract classified
- [x] Response contract classified
- [x] Error code catalog
- [x] DB table mapping
- [x] DB access type
- [x] Transaction mapping
- [x] Audit mapping
- [x] Rate limit mapping
- [x] Async/external side effect mapping
- [x] Test coverage mapping
- [x] Mobile reuse classification
- [x] v1 migration classification
- [x] Source vs document drift
- [x] `API_INVENTORY.md` 생성
- [x] Source code write 0
- [x] DB write 0
- [x] Cloudflare config change 0
- [x] Production write request 0
