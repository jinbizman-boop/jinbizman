# P2-004 Query Inventory

## 1. Baseline

- Repository: jinbizman-boop/jinbizman
- Branch: main
- Baseline commit: 19a15f1dde70559f047906b2ce6c43dd0c8838ee
- Phase 1: COMPLETE
- P2-001: COMPLETE
- P2-002: P0 remediation complete
- P2-003: P0 remediation complete
- Worker: jinbizman
- Production Worker version at audit start: f8d274f5-3ff8-4162-9134-9af121f3f120
- Production database/schema: neondb/public
- Production tables: 72
- Production migrations: 001-015
- Production indexes: 422
- Source of Truth: JINBIZ MANAGEMENT v2.0 function/performance requirements and v2.0 development master plan.

## 2. Methodology

This inventory is analysis-only. It does not modify SQL, indexes, migrations, Worker source, or Production data.

Inputs used:

- Actual API contract registry in `tests/fixtures/api-contracts.mjs`.
- Worker source under `worker/index.ts`, `worker/routes/*`, and `worker/lib/*`.
- Source SQL templates using Neon tagged SQL.
- Read-only Production catalog statistics from `pg_catalog` and `information_schema`.
- P2-001 constraint/index evidence.

Scope:

- Public, Auth, Admin, ERP, and System routes.
- All POST, PATCH, PUT, and read routes that execute DB queries.
- Query family inventory rather than a one-row-per-template dump for readability.

Raw extraction summary:

- API contracts: 128
- Unique API paths: 96
- Methods: GET 61, POST 49, PATCH 16, PUT 2, DELETE 0
- Unique paths without direct DB query: 1 (`GET /api/system/business-domains`)
- Direct SQL templates extracted from Worker source: 173
- SQL templates by leading operation: SELECT 99, INSERT 46, UPDATE 20, WITH/CTE 8
- Write contracts: 67

Frequency classes are estimated from route role and expected product use. They are not telemetry counts.

Capacity targets used for risk classification are design benchmarks, not current Production volume:

- Named ERP users: 250
- Concurrent users: 50
- Projects: 10,000
- WBS tasks: 500,000
- Audit/login events: 5,000,000
- Public peak: 100 RPS
- ERP write peak: 20 RPS

Index mapping is conservative. This document uses `LIKELY_SUPPORTED`, `PARTIALLY_SUPPORTED`, and `NO_OBVIOUS_SUPPORT`; it does not claim that PostgreSQL will choose a given index without P2-005 EXPLAIN evidence.

## 3. API Query Summary

| Area | Route coverage | DB-backed summary | Main query shape |
| --- | ---: | --- | --- |
| Public | 9 query families | published services, localized news/content, inquiry create, media lookup | SELECT, INSERT |
| Auth | 6 query families | login, me, mobile sessions, refresh, logout, rate limit, login events | SELECT, INSERT, UPDATE, UPSERT |
| Admin | 10 query families | dashboard, operations summary, CRM, projects, WBS, approvals, CMS, users, media, login events | SELECT, aggregates, INSERT, UPDATE |
| ERP | 15 query families | projects, WBS, daily work, approvals, todos, attendance, leave, timesheets, budgets, expenses, goals, evaluation | SELECT, INSERT, UPDATE, guarded CTE |
| System | 5 query families | audit logs, settings, codes, integrations, health | SELECT, INSERT, UPDATE |

## 4. Public Queries

| Query ID | Route | Operation | Primary tables | Filters and sort | Pagination | Frequency | Index mapping | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Q-PUB-001 | `GET /api/public/locales` | published locale discovery | news_posts, news_post_translations | published/status, translation status | bounded by locale cardinality | HIGH | PARTIALLY_SUPPORTED | P1: public aggregate/UNION candidate at 100 RPS target |
| Q-PUB-002 | `GET /api/public/services` | active service list | services | status = active, order service_name | none, bounded catalog | HIGH | PARTIALLY_SUPPORTED | P2: order support should be confirmed |
| Q-PUB-003 | `GET /api/public/news` | news list base locale | news_posts | status, category, published_at, created_at | page/limit | HIGH | LIKELY_SUPPORTED | P2-005 candidate |
| Q-PUB-004 | `GET /api/public/news` | news list localized | news_post_translations, news_posts | locale, status, category, published_at | page/limit | HIGH | LIKELY_SUPPORTED | P2-005 candidate |
| Q-PUB-005 | `GET /api/public/news/:slug` | news detail base | news_posts | lower(slug), status, published_at | single row | HIGH | LIKELY_SUPPORTED | LOW |
| Q-PUB-006 | `GET /api/public/news/:slug` | news detail localized | news_post_translations, news_posts | lower(slug), locale, status, published_at | single row | HIGH | LIKELY_SUPPORTED | LOW |
| Q-PUB-007 | `GET /api/public/site-pages/:pageKey` | page/content lookup | service_content_items, service_translations, services | service_code, type_code, slug, status, locale | single/few rows | HIGH | LIKELY_SUPPORTED | LOW |
| Q-PUB-008 | `POST /api/public/inquiries` | inquiry create | inquiries | insert with request metadata | not applicable | MEDIUM | primary/write path | P1 duplicate-submit risk tracked in P2-003 |
| Q-PUB-009 | `GET /api/public/media/:id` | media fetch | media_assets | id/status | single row | MEDIUM | LIKELY_SUPPORTED | LOW |

## 5. Auth Queries

| Query ID | Route | Operation | Primary tables | Filters and sort | Pagination | Frequency | Index mapping | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Q-AUTH-001 | auth login/refresh guarded paths | rate limit upsert | api_rate_limits | key/window | not applicable | HIGH | LIKELY_SUPPORTED | LOW |
| Q-AUTH-002 | `POST /api/auth/login`, `POST /api/v1/auth/login` | user credential lookup | users | email canonical lookup | single row | HIGH | LIKELY_SUPPORTED | LOW |
| Q-AUTH-003 | login write paths | failed count/reset and login event | users, login_events | user id, event type, created_at | not applicable | HIGH | LIKELY_SUPPORTED | LOW |
| Q-AUTH-004 | `GET /api/auth/me`, `GET /api/v1/auth/me` | authenticated user and RBAC | users, user_roles, roles, role_permissions, permissions | user id, active role/permission filters | single user set | HIGH | LIKELY_SUPPORTED | LOW |
| Q-AUTH-005 | session validation | active session lookup | auth_sessions | session_jti, user_id, revoked_at, expires_at | single row | HIGH | LIKELY_SUPPORTED | LOW |
| Q-AUTH-006 | `POST /api/v1/auth/refresh`, logout | mobile session rotation/revoke | auth_sessions | refresh hash, session_jti, revoked_at | single row/action | MEDIUM | LIKELY_SUPPORTED | LOW |

## 6. Admin Queries

| Query ID | Route | Operation | Primary tables | Filters and sort | Pagination | Frequency | Index mapping | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Q-ADM-001 | `GET /api/admin/dashboard` | summary counts | projects, wbs_tasks, approval_documents, inquiries, users | status filters | aggregate only | MEDIUM | PARTIALLY_SUPPORTED | P1: COUNT aggregate hotspot at target scale |
| Q-ADM-002 | inquiry admin routes | list/update/convert | inquiries, leads | status, assigned_user_id, created_at | hard limit 200 | MEDIUM | LIKELY_SUPPORTED | P1 duplicate conversion tracked separately |
| Q-ADM-003 | project admin list | project list with WBS aggregate | projects, wbs_tasks | status, owner, service, group by project | hard limit/list | MEDIUM | PARTIALLY_SUPPORTED | P1: WBS aggregate over 500k target |
| Q-ADM-004 | WBS admin list | WBS by project | wbs_tasks | project_id, parent_task_id, status, due_date, sort_order | bounded by project | MEDIUM | LIKELY_SUPPORTED | LOW |
| Q-ADM-005 | approval admin | list/detail | approval_documents, approval_lines, approval_actions | status, requester, approver, submitted/completed dates | list/detail | MEDIUM | LIKELY_SUPPORTED | P2-005 candidate for inbox |
| Q-ADM-006 | CMS/service/news admin | list/upsert | services, content, translations, news | status, locale, slug, service_id, updated_at | hard limits | LOW | PARTIALLY_SUPPORTED | P2: low-frequency admin optimization |
| Q-ADM-007 | user/RBAC admin | list/upsert | users, departments, roles, permissions, joins | status, department, role code | bounded | LOW | LIKELY_SUPPORTED | LOW |
| Q-ADM-008 | `GET /api/admin/operations-summary` | operational aggregates | CRM, projects, approvals, finance, workforce | status/date filters | aggregate only | MEDIUM | PARTIALLY_SUPPORTED | P1: dashboard-style aggregate candidate |
| Q-ADM-009 | login event admin | security event list | login_events | email/user/type/created_at | limited list | LOW | LIKELY_SUPPORTED | P2-005 candidate only at 5M event target |
| Q-ADM-010 | media admin | upload/list/update | media_assets | id/status/created_at | list/detail | LOW | PARTIALLY_SUPPORTED | LOW |

## 7. CRM Queries

| Query ID | Route | Operation | Primary tables | Filters and sort | Pagination | Frequency | Index mapping | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Q-CRM-001 | inquiry list/create/update | public/admin inquiry | inquiries | status, assigned_user_id, locale, created_at | limit 200/admin | MEDIUM | LIKELY_SUPPORTED | P1 duplicate public submit policy gap remains from P2-003 |
| Q-CRM-002 | inquiry to lead conversion | conversion action | inquiries, leads, audit_logs | inquiry id, status, converted_at | not applicable | LOW | PARTIALLY_SUPPORTED | duplicate guard should be retained; P2-005 not primary |
| Q-CRM-003 | lead list/update | lead pipeline | leads, users, inquiries | status, owner_user_id, service_id, created_at | list | MEDIUM | LIKELY_SUPPORTED | LOW |
| Q-CRM-004 | opportunity list/update/project conversion | opportunity pipeline | opportunities, projects, project_members | stage, owner_user_id, expected_close_date | list | MEDIUM | PARTIALLY_SUPPORTED | transaction already audited; EXPLAIN lower priority |

## 8. Project/WBS Queries

| Query ID | Route | Operation | Primary tables | Filters and sort | Pagination | Frequency | Index mapping | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Q-ERP-001 | project create/update/list | project management | projects, project_members | status, service_id, owner_user_id, dates | list/detail | MEDIUM | LIKELY_SUPPORTED | P2-005 via Q-ADM-003 aggregate |
| Q-ERP-002 | WBS create/update/list | WBS hierarchy/tasks | wbs_tasks, dependencies, templates | project_id, parent_task_id, assignee/reviewer/approver, status, due_date | project-bound | HIGH | LIKELY_SUPPORTED | HIGH scale target; included through WBS/todo candidates |
| Q-ERP-006 | todo routes | my task sync/list | todo_items, wbs_tasks | user_id, status, due_date, WBS assignee | limited list | VERY_HIGH | PARTIALLY_SUPPORTED | P1: GET route performs WBS-to-todo upsert side effect |

## 9. Daily Work Queries

| Query ID | Route | Operation | Primary tables | Filters and sort | Pagination | Frequency | Index mapping | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Q-ERP-003 | daily reports | create/read report with items | daily_reports, daily_report_items, wbs_tasks | user_id, project_id, report_date, wbs_task_id | list/detail | HIGH | PARTIALLY_SUPPORTED | P1 duplicate retry policy from P2-003; P2-005 medium |
| Q-ERP-004 | daily logs/progress | create/read log and WBS progress | daily_logs, daily_log_items, wbs_tasks | user_id, project_id, log_date, wbs_task_id | list/detail | HIGH | PARTIALLY_SUPPORTED | P1 duplicate retry policy from P2-003; P2-005 medium |

## 10. Approval Queries

| Query ID | Route | Operation | Primary tables | Filters and sort | Pagination | Frequency | Index mapping | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Q-ERP-005 | approvals routes | create/action/inbox/detail | approval_documents, approval_lines, approval_actions | status, requester, approver, project_id, service_id, submitted_at | list/detail | HIGH | LIKELY_SUPPORTED | P0 transaction gap already remediated; P2-005 medium |

## 11. Workplace Queries

| Query ID | Route | Operation | Primary tables | Filters and sort | Pagination | Frequency | Index mapping | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Q-ERP-007 | attendance | list/punch/correction | attendance_records, attendance_corrections | user_id, work_date, status | recent list | HIGH | PARTIALLY_SUPPORTED | P1 double-punch policy gap remains from P2-003 |
| Q-ERP-008 | leave | balance, request, decision | leave_balances, leave_requests | user_id, year, status, date range | list 100 | MEDIUM | LIKELY_SUPPORTED | P0 double deduction remediated; low query risk |
| Q-ERP-009 | timesheets | list/create/review | timesheets, users, projects, wbs_tasks | user_id, project_id, wbs_task_id, work_date, status | list | HIGH | LIKELY_SUPPORTED | P2-005 medium |
| Q-ERP-010 | resource allocations | list/upsert/cap check | project_resource_allocations | user_id, project_id, allocation_month | list/upsert | MEDIUM | PARTIALLY_SUPPORTED | P1: allocation sum check candidate |

## 12. Finance Queries

| Query ID | Route | Operation | Primary tables | Filters and sort | Pagination | Frequency | Index mapping | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Q-ERP-011 | project budgets | list/upsert | project_budgets, projects | project_id, category | list/upsert | MEDIUM | LIKELY_SUPPORTED | LOW |
| Q-ERP-012 | expense routes | list/create/transition | expense_requests, project_budgets, users, projects | project_id, budget_id, requester_user_id, status, expense_date | list | HIGH | LIKELY_SUPPORTED | P0 transaction gap remediated; P2-005 medium |

## 13. Evaluation Queries

| Query ID | Route | Operation | Primary tables | Filters and sort | Pagination | Frequency | Index mapping | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Q-ERP-014 | evaluation routes | cycle/items/evidence/scores/finalize/readiness | evaluation_cycles, evaluation_items, evaluation_scores, evaluation_evidences, feedbacks | cycle_id, evaluatee_user_id, evaluator_user_id, project_id, service_id | list/detail | MEDIUM | PARTIALLY_SUPPORTED | P1: readiness/finalize count subqueries need EXPLAIN |

## 14. CMS/News/Service Queries

| Query ID | Route | Operation | Primary tables | Filters and sort | Pagination | Frequency | Index mapping | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Q-CMS-001 | service/content admin | service/content CRUD | services, service_domains, service_content_items, translations | service_code, slug, locale, status, sort_order | list/detail | LOW | PARTIALLY_SUPPORTED | P2 |
| Q-CMS-002 | news admin/public | news CRUD/list/detail | news_posts, news_post_translations | status, locale, category, slug, published_at | list/detail | HIGH public, LOW admin | LIKELY_SUPPORTED | public list/detail in P2-005 |
| Q-CMS-003 | navigation/banners | CMS config | site_banners, site_navigation_items | status, locale, sort_order | bounded | MEDIUM public | PARTIALLY_SUPPORTED | LOW |

## 15. System/Audit Queries

| Query ID | Route | Operation | Primary tables | Filters and sort | Pagination | Frequency | Index mapping | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Q-SYS-001 | `GET /api/system/audit-logs` | audit list | audit_logs | actor_user_id, target_type, target_id, request_id, status, created_at | max 100 | LOW now, HIGH target | LIKELY_SUPPORTED | P1: 5M-row EXPLAIN candidate |
| Q-SYS-002 | system settings | settings list/update | system_settings | key/category | bounded | LOW | LIKELY_SUPPORTED | P2 small config |
| Q-SYS-003 | common codes | code groups/codes | common_code_groups, common_codes | group, code, active | bounded | LOW | LIKELY_SUPPORTED | LOW |
| Q-SYS-004 | integrations/email templates | config list/update | integrations, email_templates | provider/status/key | unbounded small config | LOW | PARTIALLY_SUPPORTED | P2: add caps if growth appears |
| Q-SYS-005 | `GET /api/health` | health DB time | no business table | current DB time | single row | HIGH | not applicable | LOW |

## 16. N+1 Risks

No broad per-row database loop was found in the main list routes. Most detail hydration uses joins, bounded follow-up queries, or grouped aggregates.

Observed risks:

| Risk | Query/flow | Classification | Notes |
| --- | --- | --- | --- |
| Todo sync side effect on read | Q-ERP-006 | P1 | The route seeds todo_items from WBS tasks during list handling. This is not a classic N+1 loop, but it is a high-frequency read route with write-like synchronization and WBS-scale sensitivity. |
| Service bootstrap helper loops | Q-CMS-001 | P2 | Low-frequency admin/bootstrap behavior may perform repeated catalog writes. Not a P2-004 hotspot unless catalog size grows. |
| Detail hydration with multiple bounded queries | Q-ADM-005, Q-ERP-014 | P2 | Approval and evaluation detail paths use multiple queries but not row-per-row loops. EXPLAIN should focus on the individual query shapes. |

## 17. Unbounded/Pagination Risks

Pagination or caps are present on the major high-growth lists through explicit limits or API security max limits. Risk remains where fixed caps substitute for true paging.

| Risk | Query/flow | Classification | Notes |
| --- | --- | --- | --- |
| Admin fixed limit 200 | Q-ADM-002, Q-ADM-006, Q-ERP-015 | P2 | Operationally bounded but not full cursor pagination. |
| Small config unbounded lists | Q-SYS-002, Q-SYS-003, Q-SYS-004 | P2 | Acceptable for current bounded configuration tables; should be capped if user-generated growth is introduced. |
| Aggregate scans | Q-ADM-001, Q-ADM-008 | P1 | Limits do not apply to COUNT/SUM aggregate cost. |

## 18. Existing Index Mapping

Summary:

- Auth paths are generally well supported by unique email/session/refresh identifiers and RBAC join indexes.
- Public news/detail paths have obvious support through status/published and lower slug indexes.
- Approval inbox/action paths have obvious status/approver/requester support after previous remediation work.
- WBS scale paths have several project/status/assignee/due-date indexes, but dashboard/todo aggregate shapes need EXPLAIN.
- Audit/log paths have created_at, actor, target, and request indexes, but 5M-row target requires baseline plans.
- Resource allocation cap-check is only partially supported by the user/month index shape.

Representative mapping:

| Query family | Support | Evidence |
| --- | --- | --- |
| Q-AUTH-002 | LIKELY_SUPPORTED | unique/canonical user email lookup. |
| Q-AUTH-005/Q-AUTH-006 | LIKELY_SUPPORTED | session identifier and refresh-hash indexes. |
| Q-PUB-003/Q-PUB-004 | LIKELY_SUPPORTED | news status/category/published and translation locale/status/published indexes. |
| Q-PUB-005/Q-PUB-006 | LIKELY_SUPPORTED | lower slug uniqueness for base and localized detail. |
| Q-ADM-001 | PARTIALLY_SUPPORTED | component filters indexed, aggregate cost unknown. |
| Q-ADM-003 | PARTIALLY_SUPPORTED | project/WBS indexes exist, group aggregate cost unknown. |
| Q-ERP-006 | PARTIALLY_SUPPORTED | todo user/status/due and WBS assignee/status/due indexes exist; sync statement needs plan. |
| Q-ERP-009 | LIKELY_SUPPORTED | timesheet user/date, project/date, unique entry support. |
| Q-ERP-010 | PARTIALLY_SUPPORTED | allocation user/month index helps, project exclusion/sum still needs plan. |
| Q-SYS-001 | LIKELY_SUPPORTED | audit created_at/actor/target/request indexes exist; large-row plan still required. |

## 19. Candidate Hotspots

Candidate hotspots were selected from high expected frequency, large growth targets, multi-table joins, aggregate cost, missing/partial index support, read-path write side effects, and public RPS sensitivity.

Primary hotspot themes:

- Public localized content/news queries under public peak traffic.
- Dashboard and operations summary aggregates.
- WBS and todo synchronization under the 500,000 WBS target.
- Audit/log/event list queries under the 5,000,000 event target.
- Evaluation readiness/finalize count checks.
- Resource allocation cap checks.

## 20. P2-005 EXPLAIN Candidate Set

| Priority | Query ID | Reason | Current index support | Scale trigger |
| --- | --- | --- | --- | --- |
| HIGH | Q-ERP-006 | Read route performs WBS-to-todo synchronization and list lookup. | PARTIALLY_SUPPORTED | 500,000 WBS tasks |
| HIGH | Q-ADM-001 | Dashboard COUNT aggregate over core tables. | PARTIALLY_SUPPORTED | dashboards and management home |
| HIGH | Q-ADM-003 | Project list with WBS aggregate/grouping. | PARTIALLY_SUPPORTED | 10,000 projects, 500,000 WBS tasks |
| HIGH | Q-SYS-001 | Audit list at large log retention target. | LIKELY_SUPPORTED | 5,000,000 audit/login rows |
| HIGH | Q-PUB-001 | Published locale aggregate on public path. | PARTIALLY_SUPPORTED | 100 RPS public peak |
| HIGH | Q-ERP-014 | Evaluation readiness/finalize count subqueries. | PARTIALLY_SUPPORTED | evaluation cycles with many scores/evidences |
| MEDIUM | Q-PUB-003/Q-PUB-004 | Public news listing. | LIKELY_SUPPORTED | public news traffic |
| MEDIUM | Q-PUB-005/Q-PUB-006 | Public slug detail lookup. | LIKELY_SUPPORTED | public detail traffic |
| MEDIUM | Q-ERP-009 | Timesheet list joins user/project/WBS. | LIKELY_SUPPORTED | daily workforce usage |
| MEDIUM | Q-ERP-012 | Expense list joins requester/project/budget. | LIKELY_SUPPORTED | finance workflow usage |
| MEDIUM | Q-ADM-005 | Approval inbox/detail. | LIKELY_SUPPORTED | approval inbox usage |
| MEDIUM | Q-ERP-010 | Resource allocation cap sum. | PARTIALLY_SUPPORTED | month/user planning |
| LOW | Q-CMS-001 | CMS/service admin lists. | PARTIALLY_SUPPORTED | low-frequency admin |
| LOW | Q-SYS-004 | Integrations/email template list. | PARTIALLY_SUPPORTED | small config tables |
| LOW | Q-ADM-010 | Media admin/public lookup. | PARTIALLY_SUPPORTED | media growth dependent |

Candidate counts:

- HIGH: 6
- MEDIUM: 6
- LOW: 3
- Total: 15

## 21. Gaps

P0:

- 0. No current query issue was found that directly indicates Production data damage or immediate service failure.

P1:

| Gap ID | Query/flow | Gap | Recommended next action |
| --- | --- | --- | --- |
| P2-004-GAP-001 | Q-ERP-006 | Todo list route includes WBS-to-todo synchronization on read path; plan and cost unknown at WBS target scale. | P2-005 EXPLAIN baseline and possible query/index/refactor decision. |
| P2-004-GAP-002 | Q-ADM-001 | Dashboard aggregate COUNT patterns may scan large tables at target scale. | P2-005 EXPLAIN dashboard aggregate queries. |
| P2-004-GAP-003 | Q-ADM-003 | Project list WBS aggregate/grouping is sensitive to 500,000 WBS target. | P2-005 EXPLAIN and index review. |
| P2-004-GAP-004 | Q-SYS-001 | Audit/log listing must be verified against 5,000,000-row retention target. | P2-005 EXPLAIN audit/log filters and order. |
| P2-004-GAP-005 | Q-ERP-014 | Evaluation readiness/finalize count checks need plan validation. | P2-005 EXPLAIN count subqueries. |
| P2-004-GAP-006 | Q-PUB-001 | Public locale aggregate/UNION is on a public traffic path. | P2-005 EXPLAIN and cache/materialization review if needed. |
| P2-004-GAP-007 | Q-ERP-010 | Resource allocation cap-check sum is partially indexed and should be baseline-tested. | P2-005 EXPLAIN allocation sum. |

P2:

| Gap ID | Query/flow | Gap | Recommended next action |
| --- | --- | --- | --- |
| P2-004-GAP-008 | Q-SYS-002/Q-SYS-004 | Small config lists are intentionally unbounded today. | Add caps only if config tables become user-growth tables. |
| P2-004-GAP-009 | Q-CMS-001 | Low-frequency service bootstrap/helper loops are not primary hotspots. | Keep as low-priority optimization note. |
| P2-004-GAP-010 | Admin fixed-limit lists | Some admin lists use hard caps instead of full cursor pagination. | Product/UX pagination improvement later. |

Total gaps: 10

## 22. Exit Criteria

| Criterion | Status | Evidence |
| --- | --- | --- |
| Actual DB queries inventoried | PASS | 173 source SQL templates grouped into query families. |
| API route to query mapping complete | PASS | 128 contracts and 96 unique paths reviewed. |
| Major filter/sort/pagination recorded | PASS | Query family tables record filters, sort, and pagination/caps. |
| N+1 risk audited | PASS | No broad row-loop query found; read-path sync and low-frequency loops recorded. |
| Unbounded risk audited | PASS | Config/admin fixed-cap risks recorded. |
| Existing index mapping completed | PASS | 422 Production indexes reviewed and mapped conservatively. |
| Production table size/row estimate captured | PASS | Read-only pg_catalog statistics captured. |
| Hotspot candidate set selected | PASS | 15 P2-005 candidates prioritized. |
| P0/P1/P2 gap classification | PASS | P0 0, P1 7, P2 3. |
| Code change | PASS | 0 intended code changes. |
| DB write | PASS | 0. |
| Migration | PASS | 0. |
| Index change | PASS | 0. |
| Secret exposure | PASS | No secret values recorded. |

## 23. Verdict

P2-004 Query Inventory: PASS.

Meaning: current API SQL/query patterns, filter/sort/pagination behavior, existing index support, growth-risk hotspots, and P2-005 EXPLAIN candidate queries have been inventoried. This does not mean indexes are fully tuned; it means P2-005 has a bounded, evidence-based starting set.

Next recommended step: Phase 2 - P2-005 Index Tuning / EXPLAIN Baseline.

## 24. P2-005 EXPLAIN Baseline Result

P2-005 baseline artifact: `INDEX_TUNING_BASELINE.md`.

EXPLAIN coverage:

- HIGH: 6 / 6
- MEDIUM: 6 / 6
- LOW: 3 / 3
- Total: 15 / 15

Final classification:

| Classification | Count | Query IDs |
| --- | ---: | --- |
| INDEX_REQUIRED | 0 | none |
| INDEX_RECOMMENDED | 3 | Q-PUB-003/Q-PUB-004, Q-ADM-005, Q-ERP-012 |
| EXISTING_INDEX_SUFFICIENT | 4 | Q-SYS-001, Q-ERP-014, Q-PUB-005/Q-PUB-006, Q-ERP-010 |
| DEFER_UNTIL_SCALE | 2 | Q-ERP-009, Q-CMS-001 |
| QUERY_REWRITE_CANDIDATE | 4 | Q-ERP-006, Q-ADM-001, Q-ADM-003, Q-PUB-001 |
| NO_CHANGE | 2 | Q-SYS-004, Q-ADM-010 |

Proposed P1 index candidates for the next remediation batch:

| Candidate ID | Query ID | Table | Columns | Status |
| --- | --- | --- | --- | --- |
| IDX-P2-005-001 | Q-PUB-003/Q-PUB-004 | news_posts | status, is_pinned DESC, published_at DESC | APPLIED / VERIFIED in migration 016 |
| IDX-P2-005-002 | Q-ADM-005 | approval_documents | updated_at DESC | APPLIED / VERIFIED in migration 017 |
| IDX-P2-005-003 | Q-ERP-012 | expense_requests | expense_date DESC, id DESC | PROPOSED |

P2-005 baseline verdict: PASS.

## 25. P2-005 Remediation Batch 1 Result

Applied candidate:

| Candidate ID | Query ID | Table | Migration | Result |
| --- | --- | --- | --- | --- |
| IDX-P2-005-001 | Q-PUB-003/Q-PUB-004 | news_posts | `016_news_posts_list_index.sql` | APPLIED / VERIFIED |

Evidence summary:

- Actual `GET /api/public/news` base query filters `status = 'published'` and `published_at <= now()`, then orders by `is_pinned DESC, published_at DESC`.
- Existing equivalent index before migration: none.
- BEFORE EXPLAIN: `ix_news_posts_status` plus explicit Sort.
- AFTER EXPLAIN: `ix_news_posts_status_pinned_published_at` with no explicit Sort.
- Production rows changed: 0.

Remaining recommended candidates:

| Candidate ID | Query ID | Table | Status |
| --- | --- | --- | --- |
| IDX-P2-005-003 | Q-ERP-012 | expense_requests | PROPOSED |

## 26. P2-005 Remediation Batch 2 Result

Applied candidate:

| Candidate ID | Query ID | Table | Migration | Result |
| --- | --- | --- | --- | --- |
| IDX-P2-005-002 | Q-ADM-005 | approval_documents | `017_approval_documents_updated_at_index.sql` | APPLIED / VERIFIED |

Evidence summary:

- Actual approval list routes are `GET /api/admin/approvals` and `GET /api/erp/approvals`.
- Both routes share `adminApprovalsRoute`, which orders by `updated_at DESC LIMIT 200`.
- Existing equivalent index before migration: none.
- BEFORE EXPLAIN: Seq Scan plus explicit Sort on `updated_at DESC`.
- AFTER EXPLAIN: still Seq Scan plus Sort because Production has 0 rows; the index is structurally aligned for scale.
- Production rows changed: 0.

Remaining recommended candidates:

| Candidate ID | Query ID | Table | Status |
| --- | --- | --- | --- |
| IDX-P2-005-003 | Q-ERP-012 | expense_requests | PROPOSED |
