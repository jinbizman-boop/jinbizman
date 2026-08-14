# P2-003 Concurrency / Idempotency Audit

## 1. Baseline

- Repository: `jinbizman-boop/jinbizman`
- Branch: `main`
- Audit baseline HEAD / origin: `5337a451a595bb9e38f5cc339a5e87c46c688cd4`
- Phase 1: COMPLETE
- P2-001: COMPLETE
- P2-002: P0 remediation complete
- Production DB: Neon Postgres `neondb` / `public`
- Production tables: 72
- Migrations: 001-015
- Worker: `jinbizman`
- User-provided Worker baseline: `83401d4c-2098-4570-812f-af0dd59be4b5`
- Read-only production health: 200 / database connected

Source of truth:

- `JINBIZ_MANAGEMENT_FullStack_Function_Performance_Requirements_v2.0_FINAL_20260812.pdf`
- `JINBIZ_MANAGEMENT_Complete_Development_Master_Plan_v2.0_FINAL_20260812.pdf`

Scope:

- AUDIT ONLY.
- Code change: 0
- DB write: 0
- Migration: 0
- Production business action: 0
- Production login/smoke: 0
- Manual Worker deploy: 0

## 2. Route Inventory

Source registry: `tests/fixtures/api-contracts.mjs`.

- Current API contracts: 128
- Unique paths: 96
- Write contracts audited: 67
- Write methods: POST 49, PATCH 16, PUT 2, DELETE 0

Idempotency guard summary:

| Guard class | Count | Meaning |
|---|---:|---|
| Class A - natural/state idempotency | 21 | Single resource update, publish update, logout, punch/review/update-style operation, or guarded state transition |
| Class B - DB uniqueness/upsert guarded | 18 | `ON CONFLICT`, unique natural key, or unique session/action identifier prevents duplicate rows |
| Class C - explicit `Idempotency-Key` recommended | 7 | Current retry/double-click can create duplicate high- or medium-value records |
| Class D - retry-unsafe by design | 9 | Creates distinct business records on every call unless caller disables retry or supplies future idempotency |
| Class E - async event dedupe required | 2 | Email/notification side effects need event-level dedupe when queue/retry is introduced |

Current explicit API idempotency support:

- `Idempotency-Key` is CORS-allowed in `worker/lib/response.ts`.
- No route-level idempotency store, TTL, request fingerprint, or response replay implementation exists.
- Inquiry email uses provider-side `idempotency-key` in `worker/lib/email.ts`, scoped to the created inquiry and request id. This does not dedupe duplicate inquiry records.

## 3. Core Flow Audit

| Flow | Route | Operation | Duplicate Risk | Concurrency Risk | Current Guard | Unique Constraint | Idempotency Key | Retry Safe | Production Duplicate Count | Severity | Recommended Action |
|---|---|---|---|---|---|---|---|---|---:|---|---|
| Public inquiry | `POST /api/public/inquiries` | anonymous create + email side effect | duplicate inquiry/email on retry | low write race, medium duplicate | public rate limit only | none for message/email tuple | none | no | 0 | P1 | Add request fingerprint or optional idempotency key for form submit |
| Inquiry to lead | `POST /api/admin/inquiries/:id/convert` | convert inquiry, create lead | duplicate lead if conversion races | yes; `NOT EXISTS` without unique `leads.inquiry_id` | single CTE, no DB uniqueness | index only on `leads.inquiry_id` | none | partial | 0 | P1 | Add DB unique/guarded conversion remediation |
| Approval action | `POST /api/erp/approvals/:id/actions` | approve/reject/request changes | duplicate action replay | remediated | guarded single CTE on pending line | approval line unique per approver/document | not required | yes by state guard | 0 | PASS | State guard sufficient; no explicit key required |
| Expense/budget transition | `PATCH /api/erp/expenses/:id` | status transition + budget effect | duplicate status transition | remediated | guarded single CTE on DB current status | budget relation checked in CTE | not required | yes by state guard | 0 | PASS | State guard sufficient; no explicit key required |
| Expense create | `POST /api/erp/expenses` | create financial request | duplicate expense record on retry | low insert race, high business duplicate | validation only | none for canonical expense tuple | none | no | 0 | P1 | Add explicit idempotency for mobile/offline expense create |
| Daily report | `POST /api/erp/daily-reports` | report header + items | repeated submit overwrites same user/date/project | item replacement race possible but single CTE | `ON CONFLICT (user_id, report_date, project_id)` | yes | not required | yes, last-write-wins | 0 | PASS | Document last-write-wins; no explicit key required unless offline conflict policy changes |
| Daily log | `POST /api/erp/daily-logs` | log header/items + WBS progress | repeated submit overwrites same user/date/project | item/progress replacement race possible but single CTE | `ON CONFLICT (user_id, log_date, project_id)` | yes | not required | yes, last-write-wins | 0 | PASS | Document last-write-wins; no explicit key required unless offline conflict policy changes |
| Timesheet create | `POST /api/erp/timesheets` | create/update work entry | repeated submit overwrites same user/project/WBS/date | low; upsert natural key | `ON CONFLICT (user_id, project_id, wbs_task_id, work_date)` | yes | not required | yes, last-write-wins | 0 | PASS | No new idempotency key required |
| Timesheet review | `PATCH /api/erp/timesheets/:id` | approve/reject timesheet | duplicate review audit/rewrite | stale review can overwrite without expected status | pre-read then update by id | none | none | partial | n/a | P2 | Later state-guard improvement if review state machine becomes stricter |
| Attendance punch | `POST /api/erp/attendance/punch` | clock-in/out | double punch | mostly blocked by user/date unique and prechecks | unique user/date + conflict handling | `attendance_records_user_date_uk` | not required | partial | n/a | PASS | Existing natural key adequate |
| Attendance correction | `POST /api/erp/attendance/correction` | request correction | repeated request overwrites reason | low | update same attendance record | `attendance_records_user_date_uk` | not required | yes, last-write-wins | n/a | PASS | Accept current overwrite semantics |
| Attendance correction decision | `PATCH /api/erp/attendance/:id/correction` | approve/reject correction | duplicate decision audit/rewrite | stale pre-read; update lacks `correction_status='requested'` predicate | pre-read state only | none | none | partial | n/a | P1 | Add conditional update guard in later batch |
| Leave request | `POST /api/erp/leave` | create leave request | duplicate/overlap leave request | retry can create duplicate leave | balance precheck only | no unique overlap constraint | none | no | 0 | P1 | Define overlap/deduplication policy and add explicit key or natural guard |
| Leave decision | `PATCH /api/erp/leave/:id` | approve/reject/cancel + balance deduction | duplicate approval can double-deduct annual balance | yes; status and balance checks are stale pre-reads | CTE updates by id, no status predicate | balance unique user/year only | none | no | 0 | P0 | Remediate with guarded atomic decision CTE and race-loser 409 |
| Leave balance upsert | `POST /api/erp/leave/balance` | set annual balance | repeat replaces grant/adjustment | low | `ON CONFLICT (user_id, balance_year)` | yes | not required | yes | 0 | PASS | Existing upsert adequate |
| Evaluation score | `POST /api/erp/evaluations/scores` | score upsert | repeat overwrites same evaluator/item | low | `ON CONFLICT` | `evaluation_scores_cycle_evale_evalr_item_uk` | not required | yes | n/a | PASS | Existing upsert adequate |
| Evaluation finalize | `POST /api/erp/evaluations/cycles/:id/finalize` | finalize cycle | duplicate finalize | stale readiness pre-read, but repeated finalize is mostly idempotent | update by id only | none | none | partial | 0 | P1 | Add status predicate/readiness CTE in future transaction/concurrency batch |
| Notification/email | async from inquiry and future events | side-effect delivery | duplicate notification/email per repeated event | retry/provider risk | provider idempotency only for inquiry email | no event key table | none | partial | 0 | P2 | Queue/event idempotency in future async work |
| CMS content/news publish | PATCH/PUT translation/content/news routes | publish/update content | repeated publish | low | single-row update/upsert; `published_at` uses `COALESCE` | slug/locale uniques | not required | yes | n/a | PASS | Existing guard adequate |
| Service deployment request | `POST /api/admin/service-deployments` | record deployment request | duplicate request/history on retry | low current external side effect: none in route | insert only | none for service/env/version/source | none | no | n/a | P1 | Add request/source-ref idempotency before external deploy side effects |
| Project create | `POST /api/erp/projects` | create project + owner member | duplicate blocked if same code; generated/different code duplicate possible | sequential member insert from P2-002 remains | project code unique; member unique | `projects_code_uk`, `project_members_project_user_uk` | none | partial | 0 | P1 | Transaction/idempotency remediation for create bootstrap |
| WBS create | `POST /api/erp/wbs` | create task | duplicate task on retry | low/medium | insert only | no natural task key | none | no | n/a | P1 | Add optional client operation id for template/offline task creation |
| Resource allocation | `POST /api/erp/resource-allocations` | allocation upsert | repeat overwrites same month allocation | percent total pre-read can race | `ON CONFLICT` plus pre-read cap | unique project/user/month | not required for duplicate; cap race remains | partial | 0 | P1 | Later atomic percentage cap guard |
| Budget upsert | `POST /api/erp/budgets` | budget category upsert | repeat overwrites budget | low | `ON CONFLICT (project_id, category_code)` | yes | not required | yes | 0 | PASS | Existing upsert adequate |
| Auth v1 lifecycle | `/api/v1/auth/*` | session create/refresh/logout | refresh replay | remediated in Phase 1 | unique JTI/hash and refresh rotation checks | yes | not required | yes | 0 | PASS | No P2-003 action |

## 4. Unique Constraint Mapping

| Domain | DB/natural guard | Current classification |
|---|---|---|
| Auth sessions | unique session JTI and refresh-token hash columns | DB uniqueness guarded |
| Role and permission mappings | `user_roles(user_id, role_id)`, `role_permissions(role_id, permission_id)` unique | DB uniqueness guarded |
| Project members | `project_members(project_id, user_id)` unique | DB uniqueness guarded |
| WBS dependencies | `wbs_task_dependencies(task_id, depends_on_task_id)` unique | DB uniqueness guarded |
| Daily reports | `daily_reports(user_id, report_date, project_id)` unique | Natural idempotency |
| Daily logs | `daily_logs(user_id, log_date, project_id)` unique | Natural idempotency |
| Timesheets | `timesheets(user_id, project_id, wbs_task_id, work_date)` unique | Natural idempotency |
| Attendance | `attendance_records(user_id, work_date)` unique | Natural idempotency |
| Leave balances | `leave_balances(user_id, balance_year)` unique | DB uniqueness guarded |
| Resource allocations | `project_resource_allocations(project_id, user_id, allocation_month)` unique | DB uniqueness guarded, but cap race remains |
| Project budgets | `project_budgets(project_id, category_code)` unique | DB uniqueness guarded |
| Service content translations | `service_translations(service_content_item_id, locale)` unique | DB uniqueness guarded |
| News translations | `news_post_translations(news_post_id, locale)` unique | DB uniqueness guarded |
| Inquiry conversion | no unique `leads.inquiry_id` | GAP |
| Public inquiry create | no natural duplicate key | GAP |
| Leave decision | no status predicate in update | GAP |

## 5. Idempotency Classes

Class A - natural/state idempotency:

- Approval action after Batch 1: state guard on `approval_lines.line_status='pending'`.
- Expense status transition after Batch 2: guarded DB current-status CTE.
- Daily report/log and timesheet create: natural key upsert, last-write-wins.
- CMS/news publish: repeated publish preserves `published_at`.

Class B - DB uniqueness based:

- Auth sessions, role/permission links, project members, WBS dependencies, leave balances, resource allocations, budgets, translations.

Class C - explicit idempotency recommended:

- Public inquiry create.
- Expense create.
- Approval document create.
- Leave request create.
- Service deployment request.
- Project/service bootstrap create.
- WBS task/template expansion create.

Class D - not idempotent by design / retry unsafe:

- Public inquiry, expense create, leave create, approval create, project issue/meeting create, board/knowledge create, media upload, WBS create, service deployment request.

Class E - async event dedupe required:

- Notification/email delivery when queue/retry/dead-letter infrastructure is introduced.

## 6. Production Duplicate Scan

All queries were read-only aggregate counts. No row values, PII, tokens, hashes, or business content were exported.

| Check | Count |
|---|---:|
| duplicate inquiry candidate groups | 0 |
| inquiry to lead duplicate groups | 0 |
| duplicate daily report groups | 0 |
| duplicate daily log groups | 0 |
| duplicate project member groups | 0 |
| duplicate WBS dependency groups | 0 |
| duplicate approval decision groups | 0 |
| duplicate auth session JTI groups | 0 |
| duplicate auth refresh hash groups | 0 |
| duplicate leave balance groups | 0 |
| duplicate resource allocation groups | 0 |
| duplicate budget groups | 0 |
| duplicate expense candidate groups | 0 |
| duplicate leave request candidate groups | 0 |
| duplicate timesheet groups | 0 |
| duplicate notification candidate groups | 0 |
| duplicate email delivery candidate groups | 0 |
| approved leave rows missing decision timestamp | 0 |

Current Production duplicate corruption detected: NO.

## 7. Test Coverage Audit

Covered:

- API registry duplicate route check.
- Mobile refresh replay / session uniqueness from Phase 1 auth coverage.
- Approval action guarded CTE, duplicate/stale no-result, and failure boundary tests.
- Expense/budget guarded CTE, stale no-result, budget/project guard, and failure boundary tests.
- Timesheet WBS required validation and project/WBS relation tests.
- Security tests assert CORS allows `idempotency-key`.

Missing / TEST_GAP:

- Public inquiry duplicate submission / retry behavior.
- Inquiry conversion concurrent duplicate lead test.
- Leave concurrent approval / replay double-deduction test.
- Leave request duplicate/overlap policy test.
- Attendance correction decision stale-state test.
- Evaluation finalize stale status/readiness test.
- Explicit idempotency-key storage/replay tests, because no route-level implementation exists.
- Notification/email duplicate event tests.
- Service deployment request duplicate source/version test.

## 8. Gaps

| Gap | Severity | Status | Evidence | Recommended action |
|---|---|---|---|---|
| P2-003-GAP-001 leave decision can double-deduct annual balance on duplicate/concurrent approval | P0 | GAP | `leaveDecisionRoute` checks status and balance before mutation, then updates `leave_requests` by id without an expected-status predicate; balance update uses stale pre-read `consumesAnnual` | P2-003 Remediation Batch 1: guarded atomic CTE with status predicate and race-loser 409 |
| P2-003-GAP-002 public inquiry create lacks application idempotency/dedupe | P1 | GAP | `POST /api/public/inquiries` inserts every valid request; email idempotency key is per created inquiry, not form submission | Add optional idempotency key or request fingerprint for public form submits |
| P2-003-GAP-003 inquiry conversion lacks DB uniqueness on `leads.inquiry_id` | P1 | PARTIAL | conversion uses `NOT EXISTS`, but `leads.inquiry_id` has index only | Add unique constraint/guarded remediation after validating data |
| P2-003-GAP-004 expense create can duplicate financial requests on mobile retry | P1 | GAP | expense transition is safe, but create is insert-only with no natural key/idempotency | Add explicit idempotency for expense create |
| P2-003-GAP-005 approval document create can duplicate document/lines on retry | P1 | GAP | approval create is one CTE but no request idempotency or natural key | Add explicit idempotency for create requests |
| P2-003-GAP-006 leave request duplicate/overlap policy is not DB- or app-enforced | P1 | POLICY_GAP | create inserts submitted leave after balance precheck; no natural key or overlap predicate | Define duplicate/overlap policy, then implement guard |
| P2-003-GAP-007 attendance correction decision has stale pre-read without update predicate | P1 | PARTIAL | decision checks `correction_status='requested'` before update, then updates by id | Add conditional update guard |
| P2-003-GAP-008 evaluation finalize readiness/status is pre-read before update | P1 | PARTIAL | finalize counts evidence/scores before update and updates by id | Move readiness/status into guarded CTE |
| P2-003-GAP-009 project/service bootstrap creates are not retry-safe across all side effects | P1 | GAP | project and service creation rely on code uniqueness but not request idempotency; side-effect rows are sequential | Address with transaction/idempotency in later create bootstrap batch |
| P2-003-GAP-010 resource allocation percentage cap can race | P1 | PARTIAL | total allocation is pre-read before upsert | Add atomic cap predicate |
| P2-003-GAP-011 service deployment request can duplicate requested history | P1 | GAP | insert-only request route; no external deploy side effect currently | Add source/version idempotency before external deploy integration |
| P2-003-GAP-012 async notification/email event dedupe is incomplete | P2 | PARTIAL | inquiry email has provider key, but no app event key/queue dedupe table | Defer to queue/idempotent event processing phase |
| P2-003-GAP-013 low-risk admin/editor creates are duplicate-by-design | P2 | NOT APPLICABLE | board/knowledge/media/project issue/meeting creates intentionally create new records | Keep UX double-click protection; no DB idempotency required unless policy changes |

Gap totals:

- P0: 1
- P1: 10
- P2: 2
- Total: 13

## 9. Backlog Mapping

P2-003 introduces one P0 remediation candidate:

- P2-003 Remediation Batch 1: Leave Decision Atomic State Guard

P1/P2 findings remain backlog items and must not be remediated as part of the audit.

## 10. Safety

- Production DB write: 0
- Migration: 0
- Source code change: 0
- Production business action: 0
- Production login/smoke: 0
- Manual deploy: 0
- DNS change: 0
- Secret exposure: 0

## 11. P2-003 Exit Criteria

| Criterion | Result |
|---|---|
| Important write routes audited | PASS |
| Duplicate risk classified | PASS |
| Concurrency risk classified | PASS |
| Natural/DB/state/idempotency guard mapping | PASS |
| Mobile retry risk audited | PASS |
| Async duplicate risk audited | PASS |
| Production duplicate scan completed | PASS |
| P0/P1/P2 gap classification | PASS |
| Test gap classification | PASS |
| DB write 0 | PASS |
| Migration 0 | PASS |
| Code change 0 | PASS |
| Secret exposure 0 | PASS |

## 12. Final Verdict

P2-003 audit-only scope: PASS.

Current Production duplicate corruption detected: NO.

P0 concurrency/idempotency gap identified: YES.

Next recommended work:

- Phase 2 - P2-003 Remediation Batch 1: Leave Decision Atomic State Guard
