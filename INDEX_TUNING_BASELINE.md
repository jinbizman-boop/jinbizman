# P2-005 Index Tuning / EXPLAIN Baseline

## 1. Baseline

- Repository: jinbizman-boop/jinbizman
- Branch: main
- Baseline commit: 8228d0bd2003490547abd15d14549f697abb4623
- Worker: jinbizman
- Production Worker at baseline check: d9d2228a-e569-4e30-8520-69374d27092d
- Production database/schema: neondb/public
- Tables: 72
- Migrations: 001-015
- Latest migration: 015_timesheets_wbs_required.sql
- Indexes: 422
- Scope: EXPLAIN and analysis only

## 2. Methodology

This baseline used the 15 P2-005 candidates recorded in `QUERY_CATALOG.md`.

Safety controls:

- `EXPLAIN` only.
- `ANALYZE` disabled.
- Production writes: 0.
- Index DDL: 0.
- Migration: 0.
- Worker/source behavior change: 0.
- Bind values were non-sensitive placeholders.

Production catalog reads used `pg_catalog`, `information_schema`, and `pg_indexes`. Current Production data is intentionally small, so sequential scans were interpreted with current row estimates and future capacity targets, not as automatic index gaps.

## 3. Capacity Assumptions

The following v2 capacity targets are design benchmarks, not current Production volume:

- Named ERP users: 250
- Concurrent users: 50
- Projects: 10,000
- WBS tasks: 500,000
- Audit/login events: 5,000,000
- Public peak: 100 RPS
- ERP write peak: 20 RPS

## 4. Existing Index Summary

Current candidate-table index inventory highlights:

- `wbs_tasks`: 13 indexes, including assignee/status/due-date and project/status/due-date indexes.
- `todo_items`: user/status/due index plus unique WBS/user partial index.
- `approval_documents`: status/requester/submitted, project/service/status, submitted, created, requester, project, service indexes. No direct updated-at ordering index.
- `audit_logs`: created-at, actor/created-at, target, request, scope/created-at, project/action/created-at, service/action/created-at indexes.
- `news_posts`: status, published-at, category/status/published-at, slug indexes. No pinned/published public list index.
- `news_post_translations`: locale/status/published-at and slug/locale indexes.
- `evaluation_evidences`: cycle/user/occurred and cycle indexes.
- `evaluation_scores`: cycle/evaluatee/item and evaluator/cycle indexes.
- `timesheets`: user/date and project/date indexes.
- `expense_requests`: project/status/date and requester/date indexes. No direct global expense-date ordering index.
- `project_resource_allocations`: user/month index plus project/user/month unique index.
- `service_content_items`: service/status/published and service/status indexes.
- `integrations` and `email_templates`: unique code/code-locale indexes; config lists are small.
- `attachments`: primary key plus target/created indexes.

Redundant existing indexes were observed on some final/pre-final pairs, for example news slug and translation slug/locale variants, audit project/scope final variants, and attachment target/created variants. P2-005 remediation should not add broad duplicate indexes.

## 5. HIGH Query Plans

| Query ID | Route/flow | Plan evidence | Existing index | Classification | Notes |
| --- | --- | --- | --- | --- | --- |
| Q-ERP-006 | Todo WBS sync | `ModifyTable` insert with `Index Scan` on `ix_final_wbs_tasks_assignee_status_due_date`; conflict arbiter `ux_todo_items_wbs_user`; list uses `ix_todo_items_user_status_due` plus final Sort | WBS assignee/status/due and todo user/status/due | QUERY_REWRITE_CANDIDATE | Indexes exist. Main risk is read-path WBS sync and expression sort, not a missing obvious index. |
| Q-ADM-001 | Admin dashboard counts | Result with 5 InitPlan aggregates; current Seq Scan on projects/WBS/users, Index Only on submitted approvals, Bitmap on open inquiries | Component indexes exist | QUERY_REWRITE_CANDIDATE | Current seq scans are expected at tiny scale; target-scale dashboard should consider summary/cache/split strategy. |
| Q-ADM-003 | Project list WBS aggregate | Seq Scan on WBS and projects, Hash Join, Hash Aggregate, Sort by project updated_at | WBS project indexes exist | QUERY_REWRITE_CANDIDATE | Aggregating 500,000 WBS rows per list is the concern; index alone is unlikely to fully solve it. |
| Q-SYS-001 | Audit logs list | Current Seq Scan + Sort on audit_logs, Hash Join users | `ix_audit_logs_created_at` exists | EXISTING_INDEX_SUFFICIENT | Current empty/small table causes seq scan. At 5M target, existing created-at index should be evaluated before adding more. |
| Q-PUB-001 | Public locales | Append over news base/translations with Seq Scans, Hash Aggregate; predicate inside count filter | status/published indexes exist but not used by current shape | QUERY_REWRITE_CANDIDATE | Query scans before grouping; rewrite/filter/caching is better than adding another index first. |
| Q-ERP-014 | Evaluation readiness/finalize | Index Only Scan on evidences; Bitmap/Index on scores; readiness distinct adds small Sort | cycle/user and cycle/evaluatee indexes | EXISTING_INDEX_SUFFICIENT | Existing cycle-prefix indexes cover the readiness/finalize count paths. |

## 6. MEDIUM Query Plans

| Query ID | Route/flow | Plan evidence | Existing index | Classification | Notes |
| --- | --- | --- | --- | --- | --- |
| Q-PUB-003/Q-PUB-004 | Public news list | Base and localized lists use status/locale indexes, then Sort by pinned/published or coalesced published date | status and locale/status indexes | INDEX_RECOMMENDED | Public path and sort key are not fully aligned with existing indexes. |
| Q-PUB-005/Q-PUB-006 | Public news detail | Base detail uses lower-slug index; localized detail uses slug/locale and PK joins | slug indexes | EXISTING_INDEX_SUFFICIENT | No new index recommended. |
| Q-ERP-009 | Timesheet list | Bitmap on `ix_timesheets_user_date`, PK joins, final Sort by work_date/id | user/date, project/date | DEFER_UNTIL_SCALE | Existing index is close. Add id ordering only if P2-005/production scale proves sort cost. |
| Q-ERP-012 | Expense list | Global shape sorts by expense_date/id; existing paths start with requester or project/status | requester/date, project/status/date | INDEX_RECOMMENDED | Finance/global list lacks a direct date/id ordering index. |
| Q-ADM-005 | Approval inbox/detail | Global list Seq Scan + Sort by updated_at; detail uses PK joins | status/submitted and created indexes | INDEX_RECOMMENDED | No direct updated-at index for approval list. Detail path is already covered. |
| Q-ERP-010 | Resource allocation cap check | Index Scan on `ix_project_resource_allocations_user_month`, project exclusion filter | user/month | EXISTING_INDEX_SUFFICIENT | Existing index matches the selective predicate. |

## 7. LOW Query Plans

| Query ID | Route/flow | Plan evidence | Existing index | Classification | Notes |
| --- | --- | --- | --- | --- | --- |
| Q-CMS-001 | CMS/service content admin | Seq Scans, Hash Joins, Sort by service/type/item sort | service/status indexes exist | DEFER_UNTIL_SCALE | Admin-only bounded catalog path. |
| Q-SYS-004 | Integrations/email templates | Seq Scan + Sort on small config tables | unique code/code-locale indexes | NO_CHANGE | Current behavior is acceptable for bounded config tables. |
| Q-ADM-010 | Media/service lookup | Service lookup uses service PK; attachment lookup uses target/created index and PK exists | PK and target indexes | NO_CHANGE | No new index needed. |

## 8. Seq Scan Interpretation

Sequential scans appeared in several plans because Production data is currently very small or empty. These were not treated as automatic gaps.

Seq scan cases requiring no immediate index:

- `users` in dashboard/detail joins: current one-row table.
- `integrations`, `email_templates`: bounded config tables.
- `service_content_items` admin list: low-frequency admin path.
- `audit_logs`: current empty/small table despite existing created-at index.

Seq scan cases that remain performance concerns:

- Q-ADM-001 dashboard count over future WBS/project scale.
- Q-ADM-003 project/WBS aggregate under 500,000 WBS target.
- Q-PUB-001 public locale aggregate because the query shape scans before filtering.

## 9. Sort/Filter Risk

Sort-heavy candidates:

- Q-ERP-006 todo list: expression sort after indexed user lookup.
- Q-ADM-003 project list: aggregate then sort by project updated_at.
- Q-SYS-001 audit list: sort by created_at in current tiny-table plan.
- Q-PUB-003/Q-PUB-004 public news list: sort by pinned/published.
- Q-ERP-009 timesheet list: sort by work_date/id after user filter.
- Q-ERP-012 expense list: sort by expense_date/id.
- Q-ADM-005 approval list: sort by updated_at.
- Q-CMS-001 content admin list: sort by service/type/item order.

The strongest index-aligned sort gaps are public news list, approval list, and expense global list.

## 10. Partial Index Candidates

Partial indexes were considered but not selected as the primary baseline recommendation.

- Public news often filters `status = 'published'`, but `published_at <= now()` cannot be used as a stable partial predicate.
- Approval inbox includes multiple status/scope modes, so an updated-at full index is simpler and less brittle than a pending-only partial index.
- Expense list can include all statuses for finance readers, so a global date/id index is more generally useful than a status partial index.

## 11. Redundant Index Check

Proposed candidates were checked against current `pg_indexes`.

Not proposed because already covered or near-covered:

- `audit_logs(created_at DESC)`: exists.
- `evaluation_evidences(cycle_id, user_id, occurred_at DESC)`: exists.
- `evaluation_scores(cycle_id, evaluatee_user_id, evaluation_item_id)`: exists.
- `project_resource_allocations(user_id, allocation_month)`: exists.
- public news detail slug indexes: exist.
- media/service point lookup indexes: exist.

Observed duplicate-looking existing indexes should be reviewed in a later cleanup, but this baseline does not recommend dropping indexes.

## 12. N+1 / Query Rewrite Cases

| Query ID | Case | Why index is not the first fix |
| --- | --- | --- |
| Q-ERP-006 | Todo WBS sync on read | Planning uses existing indexes; the read path performs an upsert from WBS tasks. A rewrite or background sync strategy may be safer than adding another index. |
| Q-ADM-001 | Dashboard aggregates | Multiple large-table counts may need summary/cache or split endpoints at target scale. |
| Q-ADM-003 | Project/WBS aggregate | Per-list aggregation over all WBS rows is likely a query-shape issue at 500,000 tasks. |
| Q-PUB-001 | Public locale aggregate | Predicate inside aggregate filter limits index usefulness. Rewrite/caching should be evaluated before indexing. |

## 13. Proposed Index Candidates

| Candidate ID | Query ID | Table | Columns | Predicate | Include | Reason | Current index gap | Expected benefit | Write cost | Priority | Migration recommended |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IDX-P2-005-001 | Q-PUB-003/Q-PUB-004 | news_posts | status, is_pinned DESC, published_at DESC | none | none | Public news list filters status and orders by pinned/published. | Existing indexes did not align with `is_pinned DESC, published_at DESC`; migration `016_news_posts_list_index.sql` adds `ix_news_posts_status_pinned_published_at`. | BEFORE used `ix_news_posts_status` plus Sort; AFTER uses the composite index with no Sort. | Low to medium; news writes are admin-frequency. | P1 | APPLIED / VERIFIED |
| IDX-P2-005-002 | Q-ADM-005 | approval_documents | updated_at DESC | none | none | Approval list orders by updated_at and currently sorts after scan. | Existing indexes covered created/submitted/status, not updated_at list order; migration `017_approval_documents_updated_at_index.sql` adds `ix_approval_documents_updated_at`. | Current 0-row table still plans Seq Scan + Sort; the index structurally supports the actual recency order for scale. | Medium; approval state changes update this column. | P1 | APPLIED / VERIFIED |
| IDX-P2-005-003 | Q-ERP-012 | expense_requests | expense_date DESC, id DESC | none | none | Finance/global expense list orders by expense_date/id. | Existing indexes started with requester or project/status; migration `018_expense_requests_expense_date_id_index.sql` adds `ix_expense_requests_expense_date_id`. | Current 0-row table still plans Sort after joins; the index structurally supports the actual expense date/id order for scale. | Low to medium; expense creates touch this index, while status-only transitions generally do not change the indexed columns. | P1 | APPLIED / VERIFIED |

No P0 index candidate was found.

## 14. Deferred Candidates

| Query ID | Deferred reason |
| --- | --- |
| Q-ERP-009 | Timesheet list has a close user/date index. Add `(user_id, work_date DESC, id DESC)` only if scale proves current final sort is material. |
| Q-CMS-001 | CMS/content admin list is low-frequency and bounded. Existing service/status indexes are enough until content volume grows. |
| Q-SYS-001 | Audit list already has created-at index. Re-check with realistic data before adding filter-specific indexes. |

## 15. No-Change Queries

| Query ID | Reason |
| --- | --- |
| Q-PUB-005/Q-PUB-006 | Slug detail paths use exact slug/locale indexes and PK joins. |
| Q-ERP-010 | Resource allocation cap check uses user/month index. |
| Q-SYS-004 | Config tables are bounded and low-frequency. |
| Q-ADM-010 | Media/service point lookups use existing indexes. |
| Q-ERP-014 | Evaluation count/readiness paths use cycle-prefix indexes. |

## 16. Risk / Write Amplification

Write cost assessment:

- IDX-P2-005-001: low to medium. News writes are low-frequency admin operations. Applied in P2-005 Remediation Batch 1.
- IDX-P2-005-002: medium. Approval document status/actions update `updated_at`; index adds write overhead to a workflow table. Applied in P2-005 Remediation Batch 2.
- IDX-P2-005-003: low to medium. Expense creates touch the recency key, while status-only transitions generally do not change `expense_date` or `id`. Applied in P2-005 Remediation Batch 3.

None of the proposed candidates target extremely high-write telemetry tables. `audit_logs` was intentionally excluded because it already has created-at indexes and high write volume would make extra audit indexes expensive.

## 17. P2-005 Remediation Plan

Recommended remediation batch:

1. Add the three P1 candidate indexes in separate approved batches.
2. Re-run EXPLAIN for Q-PUB-003/Q-PUB-004, Q-ADM-005, and Q-ERP-012.
3. Do not address query-rewrite candidates in the index remediation batch.
4. Keep P2 deferred candidates open for later scale validation.

Queries that should move to later query-structure work instead of index DDL:

- Q-ERP-006 todo sync/list.
- Q-ADM-001 dashboard counts.
- Q-ADM-003 project/WBS aggregate.
- Q-PUB-001 public locale aggregate.

## 18. Exit Criteria

| Criterion | Status | Evidence |
| --- | --- | --- |
| HIGH 6 EXPLAIN complete | PASS | Q-ERP-006, Q-ADM-001, Q-ADM-003, Q-SYS-001, Q-PUB-001, Q-ERP-014. |
| MEDIUM 6 EXPLAIN complete | PASS | Q-PUB-003/004, Q-PUB-005/006, Q-ERP-009, Q-ERP-012, Q-ADM-005, Q-ERP-010. |
| LOW 3 EXPLAIN complete | PASS | Q-CMS-001, Q-SYS-004, Q-ADM-010. |
| Current/future scale separated | PASS | Current small data noted; v2 capacity targets used for risk. |
| Existing index mapping complete | PASS | Candidate table indexes reviewed from `pg_indexes`. |
| Seq scan overreaction avoided | PASS | Current small-table seq scans were not treated as automatic gaps. |
| Sort/filter risk analyzed | PASS | Sort-heavy candidates identified and reduced to 3 index candidates. |
| Redundant index check complete | PASS | Existing duplicate/near-covered indexes excluded from proposals. |
| Migration candidates minimized | PASS | 3 P1 candidate indexes only. |
| DB write | PASS | 0. |
| Index change | PASS | 0. |
| Migration | PASS | 0. |
| Code change | PASS | 0. |
| Secret exposure | PASS | No secret values recorded. |

## 19. Verdict

P2-005 Index Tuning / EXPLAIN Baseline: PASS.

Remediation required: YES. Three P1 index candidates should move to P2-005 Index Tuning Remediation Batch 1. Four query-rewrite candidates should stay out of index DDL remediation and be handled in a later query-structure/caching batch.

## 20. P2-005 Remediation Batch 1 - 2026-08-14

Target: IDX-P2-005-001 for Q-PUB-003/Q-PUB-004 public news listing.

Actual source query reconfirmed:

- Base locale `GET /api/public/news` filters `news_posts.status = 'published'` and `published_at <= now()`.
- Results are ordered by `is_pinned DESC, published_at DESC`.
- Localized listing still joins translations and orders by pinned plus localized/base published timestamp; the `news_posts` side remains aligned with the new base-table prefix.

Production precheck:

- `news_posts` rows before migration: 0.
- Public indexes before migration: 422.
- Existing equivalent index: none.

BEFORE EXPLAIN for the base public news list:

- Plan: Limit -> Sort -> Index Scan.
- Index: `ix_news_posts_status`.
- Sort key: `is_pinned DESC, published_at DESC`.
- Cost: 8.17..8.18.
- Estimated rows: 1.
- Actual rows: 0.
- Execution time: 0.055 ms.

Migration:

- `016_news_posts_list_index.sql`
- `CREATE INDEX ix_news_posts_status_pinned_published_at ON news_posts (status, is_pinned DESC, published_at DESC);`
- Partial: no.
- Other candidate indexes created: 0.

AFTER EXPLAIN for the same base public news list:

- Plan: Limit -> Index Scan.
- Index: `ix_news_posts_status_pinned_published_at`.
- Sort: none.
- Cost: 0.14..8.16.
- Estimated rows: 1.
- Actual rows: 0.
- Execution time: 0.056 ms.

Interpretation:

- Current-scale runtime comparison is not meaningful because Production currently has 0 `news_posts` rows.
- The new index is structurally correct and planner-selected for the actual predicate/order shape.
- Final classification: VERIFIED_BENEFICIAL for plan shape, with current-scale timing neutral.
- Remaining recommended candidates: IDX-P2-005-002 and IDX-P2-005-003.

## 21. P2-005 Remediation Batch 2 - 2026-08-14

Target: IDX-P2-005-002 for Q-ADM-005 approval document recency listing.

Actual source query reconfirmed:

- `GET /api/admin/approvals` and `GET /api/erp/approvals` both use `adminApprovalsRoute`.
- The list query selects from `approval_documents d`, applies permission/scope visibility predicates, and orders by `updated_at DESC LIMIT 200`.
- There is no current status/project/service/requester filter parameter in the list route, so the original single-column recency candidate remains the correct minimal candidate.

Production precheck:

- `approval_documents` rows before migration: 0.
- Public indexes before migration: 423.
- Existing equivalent index: none.

BEFORE EXPLAIN for the representative global approval list:

- Plan: Limit -> Sort -> Seq Scan.
- Sort key: `updated_at DESC`.
- Cost: 12.85..13.02.
- Estimated rows: 70.
- Actual rows: 0.
- Execution time: 0.054 ms.

Migration:

- `017_approval_documents_updated_at_index.sql`
- `CREATE INDEX ix_approval_documents_updated_at ON approval_documents (updated_at DESC);`
- Other candidate indexes created: 0.
- `expense_requests` index changes: 0.

AFTER EXPLAIN for the same representative query:

- Plan: Limit -> Sort -> Seq Scan.
- Sort key: `updated_at DESC`.
- Cost: 12.85..13.02.
- Estimated rows: 70.
- Actual rows: 0.
- Execution time: 0.040 ms.

Interpretation:

- Current-scale runtime and planner choice are not meaningful because Production currently has 0 `approval_documents` rows.
- The new index is structurally correct for the actual `ORDER BY updated_at DESC LIMIT 200` path.
- Write amplification is medium because approval decisions update `approval_documents.updated_at`.
- Final classification: VERIFIED_STRUCTURALLY_CORRECT.
- Remaining recommended candidate: IDX-P2-005-003.

## 22. P2-005 Remediation Batch 3 - 2026-08-14

Target: IDX-P2-005-003 for Q-ERP-012 expense request recency listing.

Actual source query reconfirmed:

- `GET /api/erp/expenses` uses `expenseListRoute`.
- The list query selects from `expense_requests e`, joins requester/project/budget names, applies permission/scope visibility predicates, and orders by `e.expense_date DESC, e.id DESC LIMIT 300`.
- There is no current status/project/budget/requester/date-range filter parameter in the list route, so the original date/id recency candidate remains the correct minimal candidate.
- `id DESC` is the actual source tie-breaker for stable ordering when multiple rows share the same `expense_date`.

Production precheck:

- `expense_requests` rows before migration: 0.
- Public indexes before migration: 424.
- Existing equivalent index: none.

BEFORE EXPLAIN for the representative global expense list:

- Plan: Limit -> Sort -> Hash Left Join.
- Sort key: `e.expense_date DESC, e.id DESC`.
- Cost: 36.65..36.87.
- Estimated rows: 90.
- Actual rows: not captured for the joined plan.

Migration:

- `018_expense_requests_expense_date_id_index.sql`
- `CREATE INDEX ix_expense_requests_expense_date_id ON expense_requests (expense_date DESC, id DESC);`
- Other candidate indexes created: 0.
- `approval_documents` and `news_posts` index changes: 0.

AFTER EXPLAIN for the same representative query:

- Plan: Limit -> Sort -> Hash Left Join.
- Sort key: `e.expense_date DESC, e.id DESC`.
- Cost: 36.65..36.87.
- Estimated rows: 90.
- Actual rows: not captured for the joined plan.

Interpretation:

- Current-scale planner choice is not meaningful because Production currently has 0 `expense_requests` rows.
- The new index is structurally correct for the actual `ORDER BY e.expense_date DESC, e.id DESC LIMIT 300` path.
- Write amplification is low to medium because expense creates touch the recency key, while status-only transitions generally do not update the indexed columns.
- Final classification: VERIFIED_STRUCTURALLY_CORRECT.
- Remaining recommended index candidates: 0.
