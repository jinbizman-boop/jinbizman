# P2-002 Transaction Boundary Audit

## 1. Baseline

| Item | Value |
|---|---|
| Audit date | 2026-08-14 |
| Scope | AUDIT ONLY, read-only Production data scan and source review |
| Repository | `jinbizman-boop/jinbizman` |
| Branch | `main` |
| Git HEAD / origin | `efea95e1f4c7562fab5f8ad19d77cbc3522103db` |
| Worker | `jinbizman` |
| Worker version at audit start | `a2fbaf79-cfd8-4d92-9856-a4374d6d7715` |
| Production URL | `https://www.jinbizman.com` |
| Database | `neondb` |
| Schema | `public` |
| Public base tables | 72 |
| Applied migrations | 001 through 015 |
| Latest migration | `015_timesheets_wbs_required.sql` |

No DB write, migration, Worker source change, Worker config change, manual deploy, DNS change, or production login was performed for this audit.

Source of Truth:

- `C:/Users/Telos_PC_17/Desktop/개인 프로젝트/03. 홈페이지/JINBIZ_MANAGEMENT_FullStack_Function_Performance_Requirements_v2.0_FINAL_20260812.pdf`
- `C:/Users/Telos_PC_17/Desktop/개인 프로젝트/03. 홈페이지/JINBIZ_MANAGEMENT_Complete_Development_Master_Plan_v2.0_FINAL_20260812.pdf`

The master plan places Phase 2 under DB Integrity & Performance and explicitly calls for transaction/idempotency audit before core ERP E2E work. The requirements document defines the core data chain as Inquiry -> Lead -> Opportunity -> Project -> WBS -> Daily Report/Log -> Approval -> Evaluation Evidence and requires DB-backed, not screen-only, completion.

## 2. DB Access Pattern

Worker runtime DB access is centralized through `worker/lib/db.ts`:

| Pattern | Current state |
|---|---|
| Driver | `@neondatabase/serverless` `neon(env.DATABASE_URL)` |
| Worker transaction helper | Not present |
| Worker `BEGIN` / `COMMIT` / `ROLLBACK` usage | 0 |
| Explicit Pool/client transaction | Present only in scripts such as `scripts/migrate.mjs` and `scripts/create-admin.mjs`, not request routes |
| Atomic multi-write pattern currently used | Single SQL statement with CTEs |
| Non-atomic pattern currently used | Sequential independent `await sql\`...\`` calls |

`writeAuditLog()` catches and logs audit insert errors internally. Therefore business writes are not rolled back when global audit insert fails.

`sendInquiryNotification()` runs through `ctx.waitUntil(...)`; email delivery and `email_delivery_logs` are intentionally post-commit / best-effort and cannot roll back the public inquiry insert.

## 3. Write Route Inventory

Current source/API contract inventory:

| Metric | Count |
|---|---:|
| Total API contracts | 128 |
| Total write contracts | 67 |
| POST contracts | 49 |
| PATCH contracts | 16 |
| PUT contracts | 2 |
| DELETE contracts | 0 |
| Core multi-table / multi-step business flows audited | 11 |
| Routes needing explicit transaction or stronger single-statement guard | 8 |
| Routes with current partial commit risk | 4 |
| Routes with current concurrency/idempotency risk | 6 |

## 4. Transaction Matrix

| Flow | Route | Tables | Transaction Needed | Current Transaction | Atomic | Partial Commit Risk | Concurrency Risk | Audit Coupling | Idempotency | Severity | Recommended Action |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Inquiry -> Lead | `POST /api/admin/inquiries/:id/convert` | `inquiries`, `leads`, `audit_logs` | YES | Business update uses one CTE statement; audit separate | PARTIAL | LOW for inquiry/lead half-complete; audit best-effort | YES: `NOT EXISTS` without a unique `leads.inquiry_id` constraint can race | Audit separate and non-blocking | PARTIAL | P1 | Add conversion idempotency guard, preferably unique `leads.inquiry_id` or conditional transaction batch |
| Lead -> Opportunity | Current source exposes read routes only | `leads`, `opportunities` | YES when implemented | No write route currently present | NOT APPLICABLE | NOT APPLICABLE | NOT APPLICABLE | NOT APPLICABLE | NOT IMPLEMENTED | P2 | Re-audit when conversion route is implemented |
| Opportunity -> Project | Current source exposes read routes only | `opportunities`, `projects`, `project_members` | YES when implemented | No dedicated opportunity conversion write route currently present | NOT APPLICABLE | NOT APPLICABLE | NOT APPLICABLE | NOT APPLICABLE | NOT IMPLEMENTED | P2 | Re-audit when conversion route is implemented |
| Project creation | `POST /api/erp/projects` | `projects`, `project_members`, `audit_logs` | YES | Sequential independent statements | NO | YES: project may persist before owner member insert or audit | LOW: project code uniqueness handles duplicate code, not owner-member atomicity | Audit separate and non-blocking | PARTIAL | P1 | Convert project + owner member creation to one CTE statement or explicit transaction |
| WBS creation | `POST /api/erp/wbs` | `wbs_tasks`, `audit_logs` | NO for current single-task create | Single insert, audit separate | YES for business row | LOW audit-only | LOW | Audit separate and non-blocking | NONE | P2 | No P2-002 remediation unless template expansion is added |
| Daily report submit | `POST /api/erp/daily-reports` | `daily_reports`, `daily_report_items`, `audit_logs` | YES | One CTE statement for report upsert, item delete, item insert; audit separate | YES for business rows | LOW audit-only | PARTIAL: repeated submit is upsert by user/date/project | Audit separate and non-blocking | PARTIAL | P2 | Keep CTE; add targeted transaction test coverage |
| Daily log submit | `POST /api/erp/daily-logs` | `daily_logs`, `daily_log_items`, `wbs_tasks`, `audit_logs` | YES | One CTE statement for log upsert, item refresh, WBS progress update; audit separate | YES for business rows | LOW audit-only | PARTIAL: repeated submit is upsert by user/date/project | Audit separate and non-blocking | PARTIAL | P2 | Keep CTE; add targeted WBS progress regression tests |
| Approval create | `POST /api/erp/approvals` | `approval_documents`, `approval_lines`, `audit_logs` | YES | One CTE statement for document and lines; audit separate | YES for business rows | LOW audit-only | LOW | Audit separate and non-blocking | NONE | P2 | Keep CTE; add route-level failure coverage |
| Approval action | `POST /api/erp/approvals/:id/actions` | `approval_actions`, `approval_lines`, `approval_documents`, optional `wbs_tasks`, `audit_logs` | YES | REMEDIATED in Batch 1 with one guarded CTE statement | YES | CLOSED: action insert, line status, document status, and optional WBS approval marker are one statement | CLOSED: `approval_lines` update requires `line_status = 'pending'`; second concurrent action returns no mutation result | Audit separate and non-blocking per policy | PARTIAL | REMEDIATED | Batch 1 complete; keep regression tests |
| Evaluation score | `POST /api/erp/evaluations/scores` | `evaluation_scores`, `audit_logs` | NO for current single score upsert | Single upsert, audit separate | YES for business row | LOW audit-only | LOW: unique upsert by cycle/evaluatee/evaluator/item | Audit separate and non-blocking | YES | P2 | No transaction remediation required |
| Evaluation finalize | `POST /api/erp/evaluations/cycles/:id/finalize` | `evaluation_cycles`, reads `evaluation_evidences`, `evaluation_scores`, `audit_logs` | YES for read-check-update consistency | Sequential read counts then update | PARTIAL | LOW for single updated table; audit-only partial | YES: evidence/scores readiness is checked before update and can race with concurrent data changes | Audit separate and non-blocking | NONE | P1 | Fold readiness predicates into conditional `UPDATE ... WHERE EXISTS(...)` or transaction |
| Expense create | `POST /api/erp/expenses` | `expense_requests`, `audit_logs` | NO for current single request insert | Single insert, audit separate | YES for business row | LOW audit-only | LOW | Audit separate and non-blocking | NONE | P2 | No P2-002 remediation required |
| Expense / budget status update | `PATCH /api/erp/expenses/:id` | `expense_requests`, `project_budgets`, `audit_logs` | YES | One CTE statement for expense + budget update, but uses stale `before.status` from a prior SELECT | PARTIAL | LOW for SQL statement itself; business amount can diverge under race | YES: concurrent status updates can double-increment `spent_amount` / `committed_amount` because `UPDATE expense_requests` lacks expected-status predicate | Audit separate and non-blocking | NONE | P0 | Add compare-and-set status transition guard and budget update in one atomic statement/transaction |
| Leave request submit | `POST /api/erp/leave` | `leave_requests`, reads `leave_balances`, `audit_logs` | PARTIAL | Balance checked before insert; request insert single statement | PARTIAL | LOW audit-only | YES: remaining balance is read before insert and can race with concurrent leave requests | Audit separate and non-blocking | NONE | P1 | Move balance guard into conditional insert or transaction when leave approval volume increases |
| Leave decision | `PATCH /api/erp/leave/:id` | `leave_requests`, `leave_balances`, `audit_logs` | YES | One CTE statement for request + balance update, but uses prior `before.status` and balance read | PARTIAL | LOW for SQL statement itself; balance can diverge under race | YES: concurrent approvals can both pass pre-check and increment `used_days` | Audit separate and non-blocking | NONE | P1 | Add expected-status predicate and balance condition to the atomic update |
| Timesheet submit | `POST /api/erp/timesheets` | `timesheets`, `audit_logs` | NO for current single-table upsert | Single upsert, audit separate | YES for business row | LOW audit-only | LOW: unique upsert by user/project/WBS/date | Audit separate and non-blocking | YES | P2 | No transaction remediation required after P2-001 Batch 1 |
| Timesheet review | `PATCH /api/erp/timesheets/:id` | `timesheets`, `audit_logs` | NO for current single-table update | Single update, audit separate | YES for business row | LOW audit-only | PARTIAL: review has no expected prior status predicate | Audit separate and non-blocking | NONE | P2 | Add state-transition predicate in later workflow hardening |
| CMS content/news publish | `PATCH /api/admin/contents/:id`, `PATCH /api/admin/news/:id`, translation upserts | CMS rows, `audit_logs`; DB triggers enforce locale publish preconditions | NO for current single-row publish/update | Single row/upsert, audit separate | YES for business row | LOW audit-only | LOW | Audit separate and non-blocking | Upsert for translations | P2 | No transaction remediation required |
| Service create/bootstrap | `POST /api/admin/services` | `services`, `service_domains`, `service_content_types`, `audit_logs` | YES | Initial service + canonical domain CTE; default content types and extra domains inserted sequentially | NO | YES: service may persist without full default content types/domains | LOW: service code/domain uniqueness constrains duplicates | Audit separate and non-blocking | PARTIAL | P1 | Convert service bootstrap inserts to one statement/transaction |
| Service update/domain sync | `PATCH /api/admin/services/:id` | `services`, `service_domains`, `audit_logs` | YES when domain changes | Sequential update service, optional canonical domain update | NO when domain changes | YES: service domain can drift from canonical domain | LOW | Audit separate and non-blocking | NONE | P1 | Merge service/domain update into one statement/transaction |
| Service deployment request | `POST /api/admin/service-deployments` | `service_deployments`, `audit_logs` | NO for current request-only implementation | Single insert, audit separate | YES for business row | LOW audit-only | LOW | Audit separate and non-blocking | NONE | P2 | Re-audit if service state update is added |
| Public inquiry + notification | `POST /api/public/inquiries` | `inquiries`, async `email_delivery_logs` | NO; notification should be post-commit | Inquiry insert then `ctx.waitUntil(...)` notification | YES for inquiry | None for inquiry; email log best-effort | LOW | No global audit; domain email log best-effort | Resend idempotency key includes inquiry id/request id | P2 | Keep separated; future queue belongs to Phase 4/5 |

## 5. Core Flow Audit

| Core flow | Status | Evidence |
|---|---|---|
| Inquiry -> Lead | PARTIAL | Business mutation is single CTE; duplicate conversion race remains because uniqueness is not enforced on `leads.inquiry_id` |
| Lead -> Opportunity | NOT APPLICABLE | No current write route found; read inventory only |
| Opportunity -> Project | NOT APPLICABLE | No current conversion write route found; project creation itself is audited separately |
| Project / WBS | PARTIAL | Project + owner membership is sequential; WBS single create is safe for current scope |
| Approval | REMEDIATED/PARTIAL | Approval create uses CTE; approval action was remediated in Batch 1 with one guarded CTE mutation. Audit remains best-effort per policy |
| Expense / Budget | GAP | Status and budget update share a statement, but stale pre-read status creates double-spend / double-count race |
| Leave | PARTIAL | Decision uses CTE, but stale pre-read status and balance checks allow concurrent approval risk |
| Timesheet | PASS/PARTIAL | Submit uses validated WBS and unique upsert; review lacks expected-status guard but does not span tables |
| Evaluation finalize | PARTIAL | Finalize readiness checks are outside the update statement |
| CMS publish | PASS | Single-row updates/upserts plus DB trigger preconditions; audit is best-effort |
| Service deployment | PASS for current request-only route | Single `service_deployments` insert; no service state mutation in current route |

## 6. Production Consistency Scan

Read-only Production scan results:

| Metric | Count |
|---|---:|
| Converted inquiries without lead | 0 |
| Duplicate leads per inquiry | 0 |
| Lead converted flag without timestamp | 0 |
| Opportunity project link missing | 0 |
| Projects without member | 0 |
| Submitted approvals without lines | 0 |
| Approved approvals with pending required lines | 0 |
| Rejected approvals without reject action | 0 |
| Duplicate approval actions per line/user | 0 |
| Expense budget/project mismatch | 0 |
| Negative budget amounts | 0 |
| Budget spent drift from paid expenses | 0 |
| Approved leave without balance | 0 |
| Leave balance used-days drift | 0 |
| Timesheet WBS/project mismatch | 0 |
| Finalized evaluation without evidence | 0 |
| Finalized evaluation without scores | 0 |
| Evaluation score without evidence for same cycle/user | 0 |
| Daily reports without items | 0 |
| Daily logs without items | 0 |
| Email delivery logs for missing inquiry | 0 |

Current production data corruption detected: 0.

## 7. Test Coverage

| Area | Existing coverage | Missing coverage |
|---|---|---|
| API route inventory | `tests/worker/api-contract.test.mjs` checks current route/migration contract counts | Does not assert transaction boundaries |
| Audit redaction/high-risk route presence | `tests/worker/audit.test.mjs` checks audit helper and high-risk audit documentation | Does not inject audit failure or verify rollback/commit behavior |
| Timesheets | `tests/worker/timesheets.test.mjs` covers valid WBS, missing/null WBS, project/WBS mismatch helper | Does not test DB transaction behavior |
| Approval action | High-risk route appears in audit matrix tests | Missing duplicate concurrent action and partial failure tests |
| Expense/budget | Audit matrix coverage only | Missing concurrent status-transition and budget amount race tests |
| Evaluation finalize | High-risk route appears in audit matrix tests | Missing read-check-update race test |
| Project/service bootstrap | Audit route coverage only | Missing failure injection between sequential writes |
| Leave decision | High-risk route appears in audit matrix tests | Missing concurrent approval / balance race test |

## 8. Gaps

| ID | Severity | Status | Area | Evidence | Recommended action |
|---|---|---|---|---|---|
| P2-002-GAP-001 | P0 | REMEDIATED / VERIFIED | Approval action atomicity/idempotency | Batch 1 added `applyApprovalActionAtomic()`; action insert, pending-line update, document status update, and optional WBS marker now run in one guarded SQL CTE statement | Closed by `fix: make approval actions atomic` |
| P2-002-GAP-002 | P0 | GAP | Expense/budget concurrency | `expenseUpdateRoute` updates expense and budget in one CTE but uses `before.status` from a prior SELECT and lacks expected-status predicate | Add compare-and-set status transition and budget update guard |
| P2-002-GAP-003 | P1 | GAP | Project creation bootstrap | Project row and owner `project_members` row are sequential | Use CTE/transaction for project + owner member |
| P2-002-GAP-004 | P1 | GAP | Service create/update bootstrap | Service/default content types/domains and service/domain update are sequential | Use CTE/transaction for service bootstrap and domain sync |
| P2-002-GAP-005 | P1 | PARTIAL | Leave decision concurrency | Approval/balance checks happen before CTE and do not guard expected status in update | Move status/balance predicates into atomic update |
| P2-002-GAP-006 | P1 | PARTIAL | Evaluation finalize readiness | Evidence/score readiness is read before cycle finalization update | Use conditional update with `EXISTS` predicates or transaction |
| P2-002-GAP-007 | P1 | PARTIAL | Inquiry conversion idempotency | Business CTE is atomic, but `NOT EXISTS` lacks a DB unique guarantee for `leads.inquiry_id` | Add conversion idempotency constraint/guard in a later batch |
| P2-002-GAP-008 | P1 | TEST_GAP | Transaction failure/race coverage | Existing tests do not simulate partial failure or concurrent duplicate writes | Add targeted transaction/concurrency tests before remediation |
| P2-002-GAP-009 | P2 | PARTIAL | Audit coupling | Audit writes are best-effort and not in business transaction | Keep policy if intentional; document as non-blocking audit behavior |
| P2-002-GAP-010 | P2 | PARTIAL | Notification coupling | Public inquiry email notification is asynchronous and best-effort | Keep separated; future queue/idempotency belongs to Phase 4/5 |

Gap counts:

- P0: 1
- P1: 6
- P2: 2
- Total: 9

## 9. P0/P1/P2 Classification

P0 classification is limited to transaction gaps that can corrupt core approval or financial state even when current production data is clean:

- Expense/budget status update can double-count committed/spent budget amounts under concurrent status transitions.

P1 items are important but either not currently corrupting data, are recoverable, or affect setup/finalization paths that can be remediated after the P0 batch.

P2 items are documented behavior or later operational hardening candidates.

## 10. P2-002 Exit Criteria

| Criterion | Status |
|---|---|
| All major write flows audited | PASS |
| Transaction requirement classified | PASS |
| Partial commit risk identified | PASS |
| Concurrency risk identified | PASS |
| Audit coupling identified | PASS |
| Idempotency status identified | PASS |
| Production inconsistency read-only scan complete | PASS |
| P0/P1/P2 gap classification complete | PASS |
| DB write | 0 |
| Migration | 0 |
| Source code change | 0 |
| Secret exposure | 0 |

## 11. Final Verdict

P2-002 audit scope: PASS.

This does not mean transaction remediation is complete. It means transaction boundaries and gaps are identified well enough to start the next remediation step.

Current production data corruption detected by read-only scans: 0.

Next recommended fix batch after Batch 1: Phase 2 - P2-002 Remediation Batch 2, because one P0 transaction gap remains.

## 12. Remediation Batch 1 Addendum - 2026-08-14

Approval action remediation updated `POST /api/erp/approvals/:id/actions` to call `applyApprovalActionAtomic()` from `worker/lib/approval-actions.ts`.

Batch 1 evidence:

| Evidence | Status |
|---|---|
| Action + line + document mutation is one SQL CTE statement | PASS |
| Optional WBS approval marker is inside the same SQL statement | PASS |
| Pending line guard uses `line_status = 'pending'` in the mutation predicate | PASS |
| Duplicate/concurrent second action returns no mutation result | PASS |
| Route maps lost race to `409 CONFLICT` | PASS |
| Audit remains post-commit best-effort per `AUDIT_POLICY.md` | PASS |
| Migration | 0 |
| Production approval business write | 0 |
| Production approval inconsistency scan after remediation | 0 |

Remaining P2-002 gap counts after Batch 1 target state:

- P0: 1
- P1: 6
- P2: 2

Next recommended fix batch: Phase 2 - P2-002 Remediation Batch 2, Expense / Budget Atomic Transition.
