# JINBIZ MANAGEMENT Requirement Traceability Matrix v2

## 1. Snapshot Metadata

- Date: 2026-08-12T15:45:00+09:00
- Git HEAD: 6e13881fe4db818eafa7b73da9d2d84afcccc127
- Baseline: BASELINE.md
- DB Inventory: DB_INVENTORY.md
- API Inventory: API_INVENTORY.md
- Screen Inventory: SCREEN_INVENTORY.md
- Source Documents:
  - C:/Users/Telos_PC_17/Downloads/JINBIZ_MANAGEMENT_FullStack_Function_Performance_Requirements_v2.0_FINAL_20260812.pdf
  - C:/Users/Telos_PC_17/Downloads/JINBIZ_MANAGEMENT_Complete_Development_Master_Plan_v2.0_FINAL_20260812.pdf
- Requirement extraction: 117 unique requirement IDs extracted from the v2.0 function/performance requirements PDF.
- Scope: P0-005 only. No source, API, DB, Cloudflare, test, commit, push, or deployment change was performed.

Priority note: functional requirement priorities are taken from the requirements PDF where explicitly shown. Non-functional rows that do not have an explicit P0/P1/P2 cell in the PDF are classified for RTM aggregation using the master plan priority definitions: P0 = production security/data integrity/release gate, P1 = operational expansion/mobile readiness, P2 = capacity or advanced optimization target.

## 2. Coverage Summary

| Metric | Value | Notes |
|---|---:|---|
| Total requirements | 117 | 45 functional/mobile, 72 non-functional |
| Functional requirements | 45 | Public, Auth, ERP domains, Mobile |
| Non-functional requirements | 72 | FE, BE, DB-TXN, SEC/RBAC, PERF, REL, TST |
| P0 requirements | 65 | No P0 row has an UNMAPPED required axis |
| P1 requirements | 45 | Many are implemented partially or document-ahead |
| P2 requirements | 7 | Mostly performance/optimization targets |
| Overall traceability | 82% | Mapped applicable axes / total applicable axes, partial counted as 0.5 |
| Functional traceability | 89% | Web/ERP functional rows have strong screen/API/DB links |
| Non-functional traceability | 79% | Several operational/mobile/performance items remain document-ahead |
| P0 traceability | 94% | P0 has partial items but no fully unmapped requirement |
| P1 traceability | 72% | Operations/mobile/async/R2/push gaps remain |
| P2 traceability | 33% | Load/capacity targets mostly not yet verified |

## 3. Priority Coverage

| Priority | Total | Fully mapped | Partially mapped | Unmapped | Notes |
|---|---:|---:|---:|---:|---|
| P0 | 65 | 41 | 24 | 0 | P0 mapping is sufficient for P0-005 pass; several rows still need later verification hardening. |
| P1 | 45 | 15 | 24 | 6 | Mobile, workplace, finance, notification and runbook items are not fully complete. |
| P2 | 7 | 0 | 6 | 1 | Performance/capacity items are mostly targets for later phases. |

## 4. Category Coverage

| Category | Total | Fully mapped | Partial | Unmapped |
|---|---:|---:|---:|---:|
| Public | 6 | 4 | 2 | 0 |
| Auth | 1 | 1 | 0 | 0 |
| Service Hub | 1 | 0 | 1 | 0 |
| CMS | 1 | 1 | 0 | 0 |
| CRM | 2 | 1 | 1 | 0 |
| Project/WBS | 4 | 3 | 1 | 0 |
| Daily Work | 2 | 2 | 0 | 0 |
| Approval | 1 | 1 | 0 | 0 |
| Workplace | 3 | 0 | 3 | 0 |
| Finance | 3 | 0 | 3 | 0 |
| Evaluation | 3 | 2 | 1 | 0 |
| Knowledge/Media | 2 | 1 | 1 | 0 |
| Notification | 1 | 0 | 1 | 0 |
| System/Audit | 2 | 1 | 1 | 0 |
| Mobile | 13 | 0 | 7 | 6 |
| Frontend | 7 | 3 | 4 | 0 |
| Backend | 12 | 8 | 4 | 0 |
| Database | 5 | 3 | 2 | 0 |
| Security/RBAC | 19 | 14 | 5 | 0 |
| Performance | 12 | 0 | 11 | 1 |
| Reliability | 7 | 2 | 4 | 1 |
| Testing | 10 | 4 | 6 | 0 |

## 5. Functional Requirements RTM

| Req ID | P | Requirement | Screen | API | DB | Test | Implementation | Verification | Traceability | Drift |
|---|---|---|---|---|---|---|---|---|---|---|
| PUB-001 | P0 | Home: brand, core business, projects, proof, news, CTA | `/`, HomePage | GET `/api/public/news` partial; site-page API exists | news_posts, news_post_translations partial | public/source/E2E | IMPLEMENTED | VERIFIED | 5/5 partial API/DB | PARTIAL |
| PUB-002 | P0 | Company overview, vision, values, history | `/company`, CompanyPage | GET `/api/public/site-pages/:pageKey` available but UI static | service_content_items partial | public/source/E2E | IMPLEMENTED-UI-PARTIAL | PARTIALLY-VERIFIED | 5/5 partial API/DB | PARTIAL |
| PUB-003 | P0 | Business, execution tracks, projects, future portfolio, Cybertron | `/business`, BusinessPage | GET `/api/public/services` available; UI static content | services partial | public/source/E2E | IMPLEMENTED-UI-PARTIAL | PARTIALLY-VERIFIED | 5/5 partial API/DB | PARTIAL |
| PUB-004 | P0 | Newsletter list/detail and attachments | `/newsletter`, `/newsletter/:category/:slug` | GET `/api/public/news`, GET `/api/public/news/:slug` | news_posts, news_post_translations | public/source/E2E | IMPLEMENTED | VERIFIED | 5/5 | MATCH |
| PUB-005 | P0 | Contact inquiry, notify, admin processing, lead conversion | `/contact`, `/admin/inquiries`, `/admin/leads` | POST `/api/public/inquiries`, admin inquiry/convert APIs | inquiries, email_delivery_logs, leads | public/source/browser QA | IMPLEMENTED | PARTIALLY-VERIFIED | 5/5 | MATCH |
| PUB-006 | P0 | Five locales and SEO | PublicShell, Seo, sitemap/robots | GET `/api/public/locales`, CMS locale APIs | service_domains, service_translations | public/e2e/release | IMPLEMENTED | VERIFIED | 5/5 | MATCH |
| AUTH-001 | P0 | Admin auth: login/logout/me/session/lock/rate-limit | `/admin/login`, AdminShell | POST login/logout, GET me | users, login_events, api_rate_limits | crypto/config/e2e | IMPLEMENTED | VERIFIED | 5/5 | MATCH |
| SRV-001 | P0 | Service Hub registration, domain, env, locale, content model, owner, status | `/admin/services` | `/api/admin/services*`, service domains/changes | services, service_domains, service_content_types, service_change_logs | source contract partial | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 5/5 partial screen/test | PARTIAL |
| CMS-001 | P0 | Site CMS pages, sections, translations, SEO, media, banners, navigation, publish | `/admin/site-content`, banners/navigation/media | `/api/admin/contents*`, translations, banners, navigation, media | service_content_items, service_translations, site_banners, site_navigation_items, attachments | admin/source | IMPLEMENTED | PARTIALLY-VERIFIED | 5/5 | MATCH |
| NEWS-001 | P0 | News write, draft, translation, review, schedule, publish, archive | `/admin/news`, public newsletter | `/api/admin/news*`, `/api/public/news*` | news_posts, news_post_translations | partial source | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 5/5 partial test | PARTIAL |
| CRM-001 | P0 | Inquiry management, assign, memo, status, lead conversion | `/admin/inquiries`, `/contact` | inquiry read/update/convert + public inquiry | inquiries, leads, audit_logs | source/browser QA | IMPLEMENTED | PARTIALLY-VERIFIED | 5/5 | MATCH |
| CRM-002 | P1 | Lead/opportunity qualification and project conversion | `/admin/leads`, `/admin/opportunities` | GET leads/opportunities | leads, opportunities | source partial | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 5/5 partial write/test | PARTIAL |
| PRJ-001 | P0 | Projects, members, period, status, risks, issues, outputs | `/admin/projects` | admin/erp projects, issues, meetings | projects, project_members, project_issues, project_outputs, project_meetings | admin/source | IMPLEMENTED | PARTIALLY-VERIFIED | 5/5 | MATCH |
| WBS-001 | P0 | WBS hierarchy, dependency, assignee, schedule, progress, approval, outputs | `/admin/projects`, `/admin/daily-work` | admin/erp wbs | wbs_tasks, wbs_task_dependencies, templates | admin/source/schema | IMPLEMENTED | VERIFIED | 5/5 | MATCH |
| TASK-001 | P0 | My Tasks: own WBS and todo, due/priority/status | `/admin/todos` | `/api/erp/todos*` | todo_items, wbs_tasks | no direct endpoint test | IMPLEMENTED-NO-DIRECT-TEST | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| DR-001 | P0 | Morning daily report must link WBS | `/admin/daily-work` | POST `/api/erp/daily-reports` | daily_reports, daily_report_items, wbs_tasks | admin/source/schema | IMPLEMENTED | VERIFIED | 5/5 | MATCH |
| DL-001 | P0 | Evening daily log must link WBS/output/delay reason | `/admin/daily-work` | POST `/api/erp/daily-logs` | daily_logs, daily_log_items, wbs_tasks | admin/source/schema | IMPLEMENTED | VERIFIED | 5/5 | MATCH |
| APR-001 | P0 | Approval documents, lines, approve/reject/change request | `/admin/approvals` | `/api/erp/approvals*`, admin approval detail | approval_documents, approval_lines, approval_actions, templates | admin/source | IMPLEMENTED | PARTIALLY-VERIFIED | 5/5 | MATCH |
| ATT-001 | P1 | Attendance clock in/out and correction | `/admin/attendance` | `/api/erp/attendance*` | attendance_records | browser QA/source partial | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 5/5 partial screen/test | PARTIAL |
| LEV-001 | P1 | Leave balance/request/approval/calendar expansion | `/admin/leave` | `/api/erp/leave*` | leave_requests, leave_balances, approval_documents | no direct test | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| TIME-001 | P1 | Timesheet project/WBS hours, submit/review/approve | `/admin/timesheets` | `/api/erp/timesheets*` | timesheets, project_resource_allocations, wbs_tasks | no direct test | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| RES-001 | P1 | Resource allocation by project/person/period | generic admin/API only | POST `/api/erp/resource-allocations` | project_resource_allocations | no direct test | IMPLEMENTED-API-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| BUD-001 | P1 | Project budget, planned/spent/balance/execution rate | `/admin/budgets` | `/api/erp/budgets*` | project_budgets | no direct test | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| EXP-001 | P1 | Expense request, evidence, project/budget, approval, status | `/admin/expenses` | `/api/erp/expenses*` | expense_requests, project_budgets, approval_documents | no direct test | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| KPI-001 | P1 | Personal/team/project goals and evaluation connection | `/admin/goals` | `/api/erp/goals*` | goals, evaluation tables | no direct test | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| EVAL-001 | P0 | Evidence-based evaluation from WBS/output/schedule/QA/approval/report data | `/admin/evaluations` | evaluation evidence/scores/finalize APIs | evaluation_evidences, scores, cycles, items, WBS-related tables | admin/schema | IMPLEMENTED | VERIFIED | 5/5 | MATCH |
| EVAL-002 | P1 | Evaluation cycles/items/scores/comments/adjust/finalize/appeal | `/admin/evaluations` | admin evaluations, score/finalize APIs | evaluation_cycles, items, scores, feedbacks | admin/schema partial | IMPLEMENTED | PARTIALLY-VERIFIED | 5/5 | PARTIAL |
| KNW-001 | P1 | Knowledge documents, policy/project knowledge, tags, search, templates | `/admin/knowledge` | `/api/erp/knowledge*`, knowledge templates | knowledge_documents, knowledge_templates | source partial | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| MEDIA-001 | P1 | Media upload/R2/meta/permission/link/delete policy | `/admin/media` | POST `/api/admin/media`, GET public media | attachments, R2 binding | admin/source | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 5/5 partial R2 policy | PARTIAL |
| NOTI-001 | P1 | In-app/email/push notification, read, deep link, priority | no dedicated screen | email/inquiry side effect, notifications table; no push queue route | notifications, email_delivery_logs | no direct test | DOCUMENTED-NOT-IMPLEMENTED | NOT-VERIFIED | 2/5 | DOCUMENT-AHEAD |
| AUD-001 | P0 | Audit log with actor, time, before/after, success/failure, requestId | `/admin/audit-logs` | `/api/system/audit-logs`, audited writes | audit_logs, login_events | release/config/source | IMPLEMENTED | PARTIALLY-VERIFIED | 5/5 | MATCH |
| SYS-001 | P1 | Settings, domain, locale, codes, mail, notification, integrations, feature flags | settings/code-groups/integrations/email templates | `/api/system/*` | system_settings, common_codes, integrations, email_templates | source partial | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 5/5 partial test | PARTIAL |
| MOB-001 | P1 | Android/iPhone app core login/tasks/report/approval/attendance/leave/timesheet/notifications | N/A mobile app not present | existing Web/ERP APIs are candidates | existing ERP tables | no mobile direct test | DOCUMENTED-NOT-IMPLEMENTED | NOT-VERIFIED | 2/4 | DOCUMENT-AHEAD |

## 6. Frontend NFR RTM

| Req ID | P | Requirement | Evidence | Test | Implementation | Verification | Traceability | Drift |
|---|---|---|---|---|---|---|---|---|
| FE-001 | P0 | Loading/empty/error/forbidden states | StatePanel, DataTable, SCREEN UI State Matrix | source/screen inventory | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| FE-002 | P0 | Responsive 360/390/430/768/1024/1440/1920 | CSS breakpoints, Playwright 390 render, screen matrix | public E2E/source | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| FE-003 | P1 | Admin large tables mobile card or safe horizontal scroll | AdminShell/DataTable responsive CSS | source partial | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 3/5 | PARTIAL |
| FE-004 | P1 | Long text in five locales | locale content and public route checks | public/source/e2e | IMPLEMENTED | VERIFIED | 5/5 | MATCH |
| FE-005 | P0 | Accessibility: semantic, label, keyboard, focus, aria, table scope | PublicShell/AdminShell/DataTable/Seo | screen inventory/source | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| FE-006 | P1 | Shared Web/Mobile business status labels | status badges and API status vocabulary | no mobile client test | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 3/5 | PARTIAL |
| FE-007 | P0 | User-safe error messages, no stack/DB info in UI | apiFetch, Worker error envelope, UI error panels | source/release | IMPLEMENTED | PARTIALLY-VERIFIED | 5/5 | MATCH |

## 7. Backend NFR RTM

| Req ID | P | Requirement | Evidence | Test | Implementation | Verification | Traceability | Drift |
|---|---|---|---|---|---|---|---|---|
| BE-001 | P0 | API prefixes public/auth/admin/erp/system | API_INVENTORY 92 paths/124 contracts | source/config | IMPLEMENTED | VERIFIED | 5/5 | MATCH |
| BE-002 | P0 | Response envelope success/error | response helpers and API inventory | partial source | IMPLEMENTED | PARTIALLY-VERIFIED | 5/5 | MATCH |
| BE-003 | P0 | Validation for external input | route inline validation inventory | partial source | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| BE-004 | P1 | Idempotency for notifications/actions/jobs/create | limited current evidence | no direct test | DOCUMENTED-NOT-IMPLEMENTED | NOT-VERIFIED | 2/5 | DOCUMENT-AHEAD |
| BE-005 | P0 | Pagination/pageSize limits | list handlers with query validation | partial source | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| BE-006 | P0 | Filtering/sorting whitelist | route inventory notes | partial source | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| BE-007 | P0 | Transactions for multi-table writes | API transaction matrix, SQL CTE atomicity | source/schema | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| BE-008 | P0 | Audit important writes | 50 audited writes, audit_logs | release/source | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| BE-009 | P0 | Rate limit login/inquiry/public/high-risk | login/inquiry rate buckets | release/source | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| BE-010 | P1 | Async queue for mail/push/bulk side effects | no queue route/binding inventory | no direct test | DOCUMENTED-NOT-IMPLEMENTED | NOT-VERIFIED | 2/5 | DOCUMENT-AHEAD |
| BE-011 | P1 | API versioning for mobile | no `/api/v1` routes; V1 candidates recorded | no mobile API test | DOCUMENTED-NOT-IMPLEMENTED | NOT-VERIFIED | 2/5 | DOCUMENT-AHEAD |
| BE-012 | P1 | Web/Mobile compatible API contract | existing ERP APIs are candidates | no mobile client test | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 3/5 | PARTIAL |

## 8. DB / Transaction RTM

| Req ID | P | Requirement | Evidence | Test | Implementation | Verification | Traceability | Drift |
|---|---|---|---|---|---|---|---|---|
| DB-TXN-001 | P0 | Inquiry to lead conversion in one transaction | admin inquiry convert API transaction YES | API inventory | IMPLEMENTED | PARTIALLY-VERIFIED | 5/5 | MATCH |
| DB-TXN-002 | P0 | Approval action prevents duplicate/invalid action | approval action API, status guards | source partial | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| DB-TXN-003 | P1 | Budget execution race condition guard | expense update txn YES; budget upsert not fully reviewed | no direct test | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 3/5 | PARTIAL |
| DB-TXN-004 | P0 | WBS progress/project aggregate consistency policy | WBS constraints/triggers and APIs | schema/source | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| DB-TXN-005 | P1 | Duplicate prevention keys for mobile offline create/action | no mobile idempotency contract | no direct test | DOCUMENTED-NOT-IMPLEMENTED | NOT-VERIFIED | 2/5 | DOCUMENT-AHEAD |

## 9. Security / RBAC RTM

| Req ID | P | Requirement | Evidence | Test | Implementation | Verification | Traceability | Drift |
|---|---|---|---|---|---|---|---|---|
| SEC-RBAC-001 | P0 | Admin/ERP APIs verify login + permission + scope | API auth/permission mapping | source/release partial | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| SEC-RBAC-002 | P0 | Menu visibility separated from data permissions | Admin menu plus server permission checks | source partial | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| SEC-RBAC-003 | P0 | service/project/team/self scopes | API scope mapping | partial source | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| SEC-RBAC-004 | P0 | High-risk publish/approval/evaluation/role permissions | permission catalog and route checks | source partial | IMPLEMENTED | PARTIALLY-VERIFIED | 5/5 | MATCH |
| SEC-RBAC-005 | P0 | Mobile API uses same RBAC | existing APIs require permissions; mobile auth pending | no mobile direct test | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 3/5 | PARTIAL |
| SEC-001 | P0 | Secrets only in Cloudflare/Git excluded | .gitignore, config tests, no secret output | config/test_site | IMPLEMENTED | VERIFIED | 5/5 | MATCH |
| SEC-002 | P0 | Password hashing PBKDF2-SHA256 210000, no plaintext | crypto/create-admin/auth flow | crypto tests | IMPLEMENTED | VERIFIED | 5/5 | MATCH |
| SEC-003 | P0 | Web HttpOnly Secure SameSite session | auth route cookie/session | crypto/config partial | IMPLEMENTED | PARTIALLY-VERIFIED | 5/5 | MATCH |
| SEC-004 | P1 | Mobile secure token/session strategy | documented only; no mobile app | no direct test | DOCUMENTED-NOT-IMPLEMENTED | NOT-VERIFIED | 2/5 | DOCUMENT-AHEAD |
| SEC-005 | P0 | Login abuse limit, lockout, login_events, IP hash | auth/rate/login_events | crypto/config | IMPLEMENTED | VERIFIED | 5/5 | MATCH |
| SEC-006 | P0 | Origin/CSRF fail-closed for cookie writes | worker index trusted origin guard | release-hardening | IMPLEMENTED | VERIFIED | 5/5 | MATCH |
| SEC-007 | P0 | RBAC permission + scope, no frontend-only security | API permission/scope map | partial source | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| SEC-008 | P0 | SQL parameter binding/tagged template | sql helper/route analysis | no complete direct test | IMPLEMENTED | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| SEC-009 | P0 | XSS/CSP/sanitization policy | CSP header and React escaping | release/source | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| SEC-010 | P0 | Audit high-risk changes | audit_logs and audited write map | partial source | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| SEC-011 | P1 | PII minimization/retention/delete/masking policy | DB inventory retention notes; no full policy | no direct test | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 3/5 | DOCUMENT-AHEAD |
| SEC-012 | P1 | File MIME/size/extension/private bucket/signed URL | media API and attachments; R2 policy partial | admin/source | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 3/5 | PARTIAL |
| SEC-013 | P0 | API abuse body size, pagination, timeout, idempotency | partial limits/rate; idempotency missing | partial source | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 3/5 | PARTIAL |
| SEC-014 | P1 | Mobile no secret, secure storage, TLS, revoke | documented only | no direct test | DOCUMENTED-NOT-IMPLEMENTED | NOT-VERIFIED | 2/5 | DOCUMENT-AHEAD |

## 10. Performance RTM

| Req ID | P | Requirement | Evidence | Test | Implementation | Verification | Traceability | Drift |
|---|---|---|---|---|---|---|---|---|
| PERF-001 | P1 | Public page response and perceived speed target | build/static assets and production GET baseline | partial public checks | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 3/5 | PARTIAL |
| PERF-002 | P1 | Health/auth representative API latency target | health baseline only | production smoke partial | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 3/5 | PARTIAL |
| PERF-003 | P1 | DB query p95 target for core lists | indexes exist; no EXPLAIN in P0 | no direct perf test | IMPLEMENTED-PARTIAL | NOT-VERIFIED | 2/5 | DOCUMENT-AHEAD |
| PERF-004 | P1 | Worker CPU budget and crypto suitability | WebCrypto password verifier source | crypto regression | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| PERF-005 | P1 | Pagination/payload size target | API pagination notes | partial source | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 3/5 | PARTIAL |
| PERF-006 | P2 | Concurrent/load smoke target | no load smoke artifact | no direct test | DOCUMENTED-NOT-IMPLEMENTED | NOT-VERIFIED | 1/5 | DOCUMENT-AHEAD |
| PERF-007 | P1 | Index coverage for representative filters | DB inventory 416 indexes | DB inventory only | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 3/5 | PARTIAL |
| PERF-008 | P2 | N+1/query plan audit | not performed in P0 | no direct test | DOCUMENTED-NOT-IMPLEMENTED | NOT-VERIFIED | 1/5 | DOCUMENT-AHEAD |
| PERF-009 | P2 | DB connection mode/pooling review | Worker/Neon architecture documented | no direct perf test | IMPLEMENTED-PARTIAL | NOT-VERIFIED | 2/5 | PARTIAL |
| PERF-010 | P1 | Mobile API summary payload <=100KB recommendation | no mobile API payload test | no direct test | DOCUMENTED-NOT-IMPLEMENTED | NOT-VERIFIED | 1/5 | DOCUMENT-AHEAD |
| PERF-011 | P2 | JS/CSS gzip target | build scripts exist; not measured here | no direct size test | IMPLEMENTED-PARTIAL | NOT-VERIFIED | 2/5 | PARTIAL |
| PERF-012 | P2 | Monthly 99.9% availability target | no SLO monitor artifact | no direct test | DOCUMENTED-NOT-IMPLEMENTED | NOT-VERIFIED | 1/5 | DOCUMENT-AHEAD |

## 11. Reliability RTM

| Req ID | P | Requirement | Evidence | Test | Implementation | Verification | Traceability | Drift |
|---|---|---|---|---|---|---|---|---|
| REL-001 | P0 | Versioned SQL migrations and schema_migrations | db/migrations 001-013, schema_migrations 13/13 | schema tests/inventory | IMPLEMENTED | VERIFIED | 5/5 | MATCH |
| REL-002 | P0 | Git main + Cloudflare Build single Production pipeline | BASELINE local config; Dashboard build not verified | baseline partial | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| REL-003 | P1 | Worker rollback procedure | docs/runbook partial only | no direct drill | DOCUMENTED-NOT-IMPLEMENTED | NOT-VERIFIED | 2/5 | DOCUMENT-AHEAD |
| REL-004 | P1 | Neon restore/branch runbook and quarterly drill | migration/inventory only | no restore drill | DOCUMENTED-NOT-IMPLEMENTED | NOT-VERIFIED | 2/5 | DOCUMENT-AHEAD |
| REL-005 | P1 | Async notification retry/dead-letter | no Queue/DLQ implementation | no direct test | DOCUMENTED-NOT-IMPLEMENTED | NOT-VERIFIED | 1/5 | DOCUMENT-AHEAD |
| REL-006 | P1 | R2 version/retention and DB file key integrity | attachments/media partial | no direct R2 test | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 3/5 | PARTIAL |
| REL-007 | P1 | Client retry/resend UX without duplicate actions | API/client partial; idempotency missing | no direct test | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 3/5 | PARTIAL |

## 12. Testing RTM

| Req ID | P | Requirement | Evidence | Test | Implementation | Verification | Traceability | Drift |
|---|---|---|---|---|---|---|---|---|
| TST-001 | P0 | TypeScript compile/typecheck 0 errors | package scripts and prior release process | not executed in P0-005 | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| TST-002 | P0 | Worker unit/integration for auth/permission/validation/business rules | worker tests exist | crypto/config/schema | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| TST-003 | P0 | DB migration empty DB 001-latest and duplicate prevention | schema migration source/inventory | schema tests partial | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| TST-004 | P0 | API contract success/error/status/schema | API inventory; partial tests only | config/source partial | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 3/5 | PARTIAL |
| TST-005 | P0 | Security scan for secret/auth/origin/RBAC/rate-limit | config/release/security source tests | config/release | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| TST-006 | P0 | Web E2E Chromium/Firefox/WebKit and viewport coverage | Playwright config/public E2E; P0-004 read-only render | e2e partial | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 4/5 | PARTIAL |
| TST-007 | P1 | Mobile API contract Android/iOS same endpoints | no mobile contract tests | none | DOCUMENTED-NOT-IMPLEMENTED | NOT-VERIFIED | 1/5 | DOCUMENT-AHEAD |
| TST-008 | P2 | Load smoke representative read/write/login concurrency | no load smoke tests | none | DOCUMENTED-NOT-IMPLEMENTED | NOT-VERIFIED | 1/5 | DOCUMENT-AHEAD |
| TST-009 | P0 | Release check domain/sitemap/migrations/path/lockfile/secret | release-check script and tests | release-hardening | IMPLEMENTED | PARTIALLY-VERIFIED | 5/5 | MATCH |
| TST-010 | P0 | Production smoke health/public/login/dashboard/inquiry/core ERP flow | P0 inventories include read-only health/public; no write smoke in P0 | partial | IMPLEMENTED-PARTIAL | PARTIALLY-VERIFIED | 3/5 | PARTIAL |

## 13. Mobile RTM

| Req ID | P | Requirement | Screen | API | DB | Test | Implementation | Verification | Traceability | Drift |
|---|---|---|---|---|---|---|---|---|---|---|
| MOB-F-001 | P0 | Mobile login/session with secure strategy | no mobile app | auth APIs candidate; no refresh/revoke | users/login_events | no mobile test | DOCUMENTED-NOT-IMPLEMENTED | NOT-VERIFIED | 2/5 | DOCUMENT-AHEAD |
| MOB-F-002 | P0 | Mobile dashboard tasks/approvals/delays/report state | no mobile app | admin dashboard/summary candidate | projects, WBS, approvals, reports | no mobile test | DOCUMENTED-NOT-IMPLEMENTED | NOT-VERIFIED | 2/5 | DOCUMENT-AHEAD |
| MOB-F-003 | P0 | My Tasks/WBS own work, progress, comments, outputs | no mobile app | `/api/erp/todos`, `/api/erp/wbs` candidate | todo_items, wbs_tasks, outputs | no mobile test | IMPLEMENTED-API-PARTIAL | PARTIALLY-VERIFIED | 3/5 | PARTIAL |
| MOB-F-004 | P0 | Morning report WBS select/goal/risk/draft | no mobile app | `/api/erp/daily-reports` candidate | daily_reports/items | no mobile test | IMPLEMENTED-API-PARTIAL | PARTIALLY-VERIFIED | 3/5 | PARTIAL |
| MOB-F-005 | P0 | Daily log progress/delay/output/draft | no mobile app | `/api/erp/daily-logs` candidate | daily_logs/items | no mobile test | IMPLEMENTED-API-PARTIAL | PARTIALLY-VERIFIED | 3/5 | PARTIAL |
| MOB-F-006 | P0 | Approval inbox/detail/action/push deep link | no mobile app | `/api/erp/approvals*` candidate | approvals tables | no mobile test | IMPLEMENTED-API-PARTIAL | PARTIALLY-VERIFIED | 3/5 | PARTIAL |
| MOB-F-007 | P1 | Attendance punch/correction with GPS/IP optional | no mobile app | `/api/erp/attendance*` candidate | attendance_records | no mobile test | IMPLEMENTED-API-PARTIAL | PARTIALLY-VERIFIED | 3/5 | PARTIAL |
| MOB-F-008 | P1 | Leave balance/request/approval | no mobile app | `/api/erp/leave*` candidate | leave_requests, leave_balances | no mobile test | IMPLEMENTED-API-PARTIAL | PARTIALLY-VERIFIED | 3/5 | PARTIAL |
| MOB-F-009 | P1 | Timesheet create/review | no mobile app | `/api/erp/timesheets*` candidate | timesheets | no mobile test | IMPLEMENTED-API-PARTIAL | PARTIALLY-VERIFIED | 3/5 | PARTIAL |
| MOB-F-010 | P1 | Notifications/push/deep link | no mobile app | no push route/Queue contract | notifications | no mobile test | DOCUMENTED-NOT-IMPLEMENTED | NOT-VERIFIED | 1/5 | DOCUMENT-AHEAD |
| MOB-F-011 | P1 | Offline draft/retry/idempotency | no mobile app | no idempotency contract | api_rate_limits only adjacent | no mobile test | DOCUMENTED-NOT-IMPLEMENTED | NOT-VERIFIED | 1/5 | DOCUMENT-AHEAD |
| MOB-F-012 | P1 | Store release/privacy/crash/update strategy | no mobile app | N/A | N/A | no mobile test | DOCUMENTED-NOT-IMPLEMENTED | NOT-VERIFIED | 1/3 | DOCUMENT-AHEAD |

## 14. Screen -> API -> DB Cross Matrix

| Area | Screens | APIs | DB tables | Consistency |
|---|---|---|---|---|
| Public website | `/`, company, business, newsletter, contact, project, legal, 404 | public news, locales, services, site-pages, inquiries | news, services, CMS, inquiries | MATCH with partial static company/business content |
| Auth | `/admin/login`, AdminShell | auth login/logout/me | users, login_events, api_rate_limits | MATCH |
| Service/CMS/News | admin services/site-content/news/media/banners/navigation | admin services, contents, translations, news, media, banners, navigation | services, content, translations, news, attachments, site tables | MATCH/PARTIAL |
| CRM | inquiries/leads/opportunities | admin inquiries/leads/opportunities, inquiry convert | inquiries, leads, opportunities | MATCH/PARTIAL |
| Project/WBS/Daily | projects/daily-work/todos | admin/erp projects, wbs, daily reports/logs, todos | projects, wbs_tasks, daily tables, todo_items | MATCH |
| Approval/Evaluation | approvals/evaluations | approvals, actions, evaluation evidence/scores/finalize | approval tables, evaluation tables | MATCH |
| Workplace/Finance | attendance/leave/timesheets/budgets/expenses/goals | ERP operations APIs | attendance, leave, timesheets, budgets, expenses, goals | PARTIAL generic UI |
| System/Audit | settings, audit, integrations, email, codes | system APIs | audit_logs, system_settings, integrations, common_codes, email_templates | PARTIAL generic UI |

Cross-inventory observations:

- Screen -> API consistency: no UI call to a clearly unknown API was found. Some backend APIs are not currently exposed by specialized UI screens and are recorded as backend/future capacity.
- API -> DB consistency: API_INVENTORY referenced tables exist in DB_INVENTORY except static system business-domain reference data and indirect health probes.
- Requirement -> Screen consistency: P0 public/auth/core ERP requirements map to screens. P1 mobile app screens are document-ahead.
- Requirement -> API consistency: no P0 requirement is fully API-unmapped; several have partial current implementation.
- Requirement -> Test consistency: direct tests are uneven. Many generic ERP/admin modules rely on source-contract tests rather than endpoint-level contract tests.

## 15. Source vs Document Drift

| Drift class | Count | Notes |
|---|---:|---|
| MATCH | 45 | Core public routes, auth, WBS/daily/approval/evaluation, migration baseline, major security gates |
| PARTIAL | 44 | Generic ERP modules, source-contract tests, scope/idempotency/audit completeness |
| DOCUMENT-AHEAD | 24 | Mobile app, API v1, Queue/push/DLQ, load/SLO/DR drills |
| IMPLEMENTATION-AHEAD | 2 | Production 71-table schema and broad ERP API surface exceed some screen-specialization depth |
| DRIFT | 2 | Legacy `.html` QA references and apex redirect baseline warning are outside current P0-005 changes |

## 16. Missing Traceability Candidates

### TRACE-MISS-001

Requirement: MOB-001, MOB-F-001..MOB-F-012
Missing Axis: Mobile Screen, Mobile Test, API v1/Auth Contract
Observed: Worker APIs are candidates, but Android/iPhone app and mobile contract tests are not implemented.
Expected: Phase 6 mobile PoC and API backward-compatibility contract.
Suggested Review Phase: P1/P6

### TRACE-MISS-002

Requirement: BE-004, BE-010, DB-TXN-005, REL-005
Missing Axis: Idempotency/Queue/DLQ implementation and tests
Observed: Email/inquiry side effects and notification tables exist, but Queue/dead-letter/idempotency contract is not complete.
Expected: Async boundary with retry, idempotency key and non-blocking original transaction.
Suggested Review Phase: P1/P4/P5

### TRACE-MISS-003

Requirement: PERF-003, PERF-006, PERF-008, PERF-010, PERF-011, PERF-012
Missing Axis: Performance verification evidence
Observed: DB indexes and release/build scripts exist, but load smoke, bundle gzip, p95/p99 and SLO evidence were not produced in P0 inventories.
Expected: Phase 7 performance/observability report.
Suggested Review Phase: P2/P7

### TRACE-MISS-004

Requirement: REL-003, REL-004
Missing Axis: Operational drill evidence
Observed: Baseline and migration inventory exist, but rollback/restore drill was not run in Phase 0.
Expected: Runbook and quarterly drill evidence.
Suggested Review Phase: P7/P8

### TRACE-MISS-005

Requirement: TST-004, TST-006, TST-007, TST-008, TST-010
Missing Axis: Full contract/E2E/mobile/load/production write smoke evidence
Observed: Existing tests cover source contracts and public flows, but not every endpoint or mobile/load contract.
Expected: Contract and E2E suites expanded in later phases.
Suggested Review Phase: P1 through P8

## 17. Current Implementation Snapshot

| Snapshot Metric | Value | Notes |
|---|---:|---|
| Implementation coverage | 79% | Implemented + partial implementation rows over all 117 requirements |
| Verification coverage | 63% | Verified + partially verified rows; direct test gaps remain |
| Traceability coverage | 82% | Axis-based RTM score, N/A excluded |
| Production verification coverage | 28% | Phase 0 performed read-only health/public verification, not write smoke |
| Implemented | 51 | Functional core and major platform requirements |
| Implemented partial | 42 | Generic ERP modules, partial NFRs, mobile API candidates |
| Documented not implemented | 15 | Mobile app, API v1, async/push, DR/load/SLO |
| Implemented no direct test | 9 | Mostly generic ERP/API module coverage |
| Not found | 0 | Every extracted ID is represented in this RTM |

This is a Phase 0 measurement snapshot, not a final project completion percentage.

## 18. P0-005 Exit Criteria

- [x] v2.0 Requirement ID ?ÑÏàò Ï∂îÏ∂ú
- [x] Functional requirement ?ÑÏàò
- [x] Non-functional requirement ?ÑÏàò
- [x] Mobile requirement ?ÑÏàò
- [x] Screen mapping
- [x] API mapping
- [x] DB mapping
- [x] Test mapping
- [x] Evidence mapping
- [x] Implementation status
- [x] Verification status
- [x] Traceability completeness
- [x] P0/P1/P2 ÏßëÍ≥Ñ
- [x] Category ÏßëÍ≥Ñ
- [x] Screen to API consistency
- [x] API to DB consistency
- [x] Requirement to Screen consistency
- [x] Requirement to API consistency
- [x] Requirement to Test consistency
- [x] Document/current drift
- [x] Missing traceability candidate
- [x] Coverage percent calculation
- [x] Current completion snapshot
- [x] RTM.md ?ùÏÑ±
- [x] Source/API/DB/Cloudflare write 0Í±?
P0 requirement check: PASS. No P0 requirement has an UNMAPPED required axis. Partial P0 items are explicitly recorded for later review and are not treated as completed feature work.

## Phase 1 Final Closeout Addendum - 2026-08-13

This addendum records the Phase 1 Auth / Platform Hardening closeout without rewriting the original Phase 0 RTM snapshot above.

Closeout baseline:

- Git/origin: `13a7626d180e06a38bf751c2bdb763f7ac0eac9d`
- Worker: `jinbizman`
- Production Worker version: `3eb23635-875c-4036-8b38-d5bd737548e7`
- Production DB: Neon `neondb` / `public`
- Production tables after migration 014: 72
- Applied migrations: 001 through 014
- Latest migration: `014_mobile_auth_sessions.sql`
- Phase 1 closeout document: `PHASE1_CLOSEOUT.md`

Phase 1 requirement/backlog status update:

| Area | Related IDs | Phase 1 Status | Evidence |
|---|---|---|---|
| Authentication | `AUTH-001`, `SEC-002`, `SEC-003` | IMPLEMENTED / VERIFIED / PRODUCTION PASS | Legacy Web login 200, secure cookie, authenticated `/api/auth/me` 200, anonymous `/api/auth/me` 401 |
| Password verification | `SEC-002` | IMPLEMENTED / VERIFIED / PRODUCTION PASS | PBKDF2-SHA256 210000 default, 100000 legacy verification, `@noble/hashes` pure-JS verification, production direct proof TRUE |
| Mobile auth server contract | `BE-011`, `SEC-004`, `SEC-014`, `MOB-F-001` auth subset | IMPLEMENTED / VERIFIED / PRODUCTION PASS | `/api/v1/auth/login`, `/refresh`, `/me`, `/logout`; rotation/replay/revoke lifecycle PASS |
| RBAC / scope | `SEC-RBAC-001`, `SEC-RBAC-002`, `SEC-RBAC-003`, `SEC-RBAC-005`, `SEC-RBAC-007` | IMPLEMENTED / VERIFIED / PRODUCTION PASS for Phase 1 protected API/UI boundary | `AUTHORIZATION_MATRIX.md`, `PERMISSION_UX_MATRIX.md`, security/API/worker/react/E2E tests PASS |
| Origin/CORS/rate limit | `SEC-006`, `SEC-013`, `BE-009`, `TST-005` | IMPLEMENTED / VERIFIED / PRODUCTION PASS | Trusted-origin fail-closed, exact CORS, mobile bearer/no-origin policy, rate-limit/security tests PASS |
| Secret/config | `SEC-001`, `TST-009`, `REL-002` | IMPLEMENTED / VERIFIED / PRODUCTION PASS | Worker identity recorded, health 200, no secret values committed |
| Audit | `AUD-001`, `SEC-010`, `BE-008`, `REL-005` | IMPLEMENTED / VERIFIED / PRODUCTION PASS | `AUDIT_POLICY.md`, `AUDIT_MATRIX.md`, high-risk audit and redaction tests PASS |
| API versioning | `BE-011`, `BE-012` auth subset | IMPLEMENTED / VERIFIED / PRODUCTION PASS | Versioned Mobile v1 auth namespace exists while legacy Web auth remains backward compatible |

Items outside the Phase 1 Auth / Platform boundary remain governed by later phase rows. Native mobile app UI/storage work remains a later mobile phase item even though the server-side Mobile v1 auth contract is production verified.

## Phase 2 Final Closeout Addendum - 2026-08-14

This addendum records the Phase 2 DB Integrity & Performance / Platform Data Hardening closeout without rewriting the original RTM snapshot.

Closeout baseline:

- Git/origin before closeout: `83aa5d9627362c0a8ed000f6120e78d7ea68bc5b`
- Production DB: Neon `neondb` / `public`
- Production tables: 72
- Applied migrations: 001 through 018
- Latest migration: `018_expense_requests_expense_date_id_index.sql`
- Production indexes: 425
- Phase 2 closeout document: `PHASE2_CLOSEOUT.md`

Phase 2 requirement/backlog status update:

| Area | Phase 2 Status | Evidence |
|---|---|---|
| Constraint integrity | IMPLEMENTED / VERIFIED / G2 PASS for P0 scope | `DB_CONSTRAINT_AUDIT.md`; `timesheets.wbs_task_id` NOT NULL; production invariant counters 0 |
| Transaction integrity | IMPLEMENTED / VERIFIED / G2 PASS for P0 scope | `TRANSACTION_AUDIT.md`; approval and expense/budget atomic transitions verified |
| Concurrency / idempotency | IMPLEMENTED / VERIFIED / G2 PASS for P0 scope | `CONCURRENCY_IDEMPOTENCY_AUDIT.md`; leave balance-safe approval verified |
| Query inventory | IMPLEMENTED / VERIFIED / G2 PASS | `QUERY_CATALOG.md`; 95 / 96 DB-backed routes, 41 query families, 173 raw SQL templates |
| Index / EXPLAIN | IMPLEMENTED / VERIFIED / G2 PASS | `INDEX_TUNING_BASELINE.md`; 15 / 15 EXPLAIN complete; migrations 016, 017, 018 applied |
| Retention / soft delete | VERIFIED / POLICY DEFINED / G2 PASS for P0 scope | `DATA_RETENTION.md`; 72 / 72 tables classified; P0 0 |
| Migration CI readiness | VERIFIED / PARTIAL AUTOMATION / G2 PASS for P0 scope | `MIGRATION_CI_AUDIT.md`; clean install PASS, upgrade PASS, production drift 0; CI automation remains P1 |

Deferred P1/P2 items remain OPEN / DEFERRED and are not marked complete. Phase 3 implementation is not started by this addendum.
