# P2-001 FK / UNIQUE / CHECK Audit

## 1. Baseline

| Item | Value |
|---|---|
| Audit date | 2026-08-13 |
| Scope | AUDIT ONLY, read-only Production catalog/data scan |
| Repository | `jinbizman-boop/jinbizman` |
| Branch | `main` |
| Git HEAD / origin | `43d952db73c72c3e25fe5ae8eea2720b90a9a7c3` |
| Worker | `jinbizman` |
| Worker version at audit start | `ce1dd364-08d9-4797-9de1-e08dfa7064ba` |
| Production URL | `https://www.jinbizman.com` |
| Database | `neondb` |
| Schema | `public` |
| PostgreSQL | PostgreSQL 18.4 |
| Public base tables | 72 |
| Applied migrations | 001 through 014 |
| Latest migration | `014_mobile_auth_sessions.sql` |

No DB write, migration, source-code change, Worker config change, DNS change, or production login was performed for this audit.

## 2. Schema Summary

Production catalog summary:

| Object | Count |
|---|---:|
| Public base tables | 72 |
| Primary keys | 72 |
| Foreign keys | 151 |
| UNIQUE constraints | 43 |
| CHECK constraints | 246 |
| NOT NULL columns | 669 |
| Indexes | 422 |
| Trigger constraints | 4 |
| User-defined enum types | 1 |
| Validated PK/FK/UNIQUE/CHECK constraints | 512 / 512 |
| Tables without primary key | 0 |

The single PostgreSQL enum is `user_status` with labels `active`, `invited`, `suspended`, `retired`. Other business status vocabularies are enforced primarily by CHECK constraints and Worker business rules.

## 3. FK Audit

All 151 Production foreign keys were inventoried from `pg_constraint`, including source table/columns, target table/columns, nullable source columns, delete rule, update rule, and child-side supporting index coverage.

Summary:

| FK area | Status | Evidence |
|---|---|---|
| 151/151 FK inventoried | PASS | `pg_constraint` read-only catalog scan |
| FK validation | PASS | 151/151 FK constraints validated |
| Core inquiry to project path | PASS | `leads.inquiry_id`, `opportunities.lead_id`, `opportunities.project_id`, and related service/user FKs present |
| Project to WBS | PASS | `wbs_tasks.project_id -> projects.id` present and NOT NULL |
| WBS self/parent/template/user relations | PASS/PARTIAL | Parent/template/user FKs present; optional role columns intentionally nullable |
| Daily reports/logs to WBS | PASS | `daily_report_items.wbs_task_id` and `daily_log_items.wbs_task_id` are NOT NULL FKs |
| Approval document/action graph | PASS | requester, project/service/WBS context, lines, and actions FKs present |
| Evaluation evidence/scoring graph | PASS/PARTIAL | cycle/user/project/service FKs present; polymorphic source typed by `source_type/source_id` remains application-guarded |
| Timesheets | PARTIAL | user/project FKs NOT NULL; `wbs_task_id` FK exists but is nullable |
| Expenses | PASS/PARTIAL | requester FK NOT NULL; project/budget/receipt/approval FKs exist but are optional by current schema |
| Mobile auth sessions | PASS | `auth_sessions.user_id` and `rotated_from_session_id` FKs present |

FK delete/update action pattern:

- Most update rules are `NO ACTION`.
- Domain-owned child rows commonly use `CASCADE`.
- Historical/audit/context links commonly use `SET NULL`.
- User references that must preserve accountability often use `RESTRICT` or nullable `SET NULL`.

Polymorphic references:

| Table | Columns | Classification | Status |
|---|---|---|---|
| `attachments` | `target_type`, `target_id` | POLYMORPHIC / APPLICATION-GUARDED | PARTIAL |
| `comments` | `target_type`, `target_id` | POLYMORPHIC / APPLICATION-GUARDED | PARTIAL |
| `notifications` | `related_type`, `related_id` | POLYMORPHIC / APPLICATION-GUARDED with pair CHECK | PARTIAL |
| `audit_logs` | `target_type`, `target_id` | POLYMORPHIC / AUDIT-GUARDED | NOT APPLICABLE for physical FK |
| `evaluation_evidences` | `source_type`, `source_id` | POLYMORPHIC / APPLICATION-GUARDED | PARTIAL |

These are not treated as automatic P0 gaps because physical FK enforcement is not always viable for polymorphic audit/content references. They remain candidates for Phase 2 application/data consistency review.

## 4. UNIQUE Audit

All 43 UNIQUE constraints were inventoried.

Representative enforced uniqueness:

| Invariant | DB enforcement | Status |
|---|---|---|
| User email unique | `users.email` | PASS |
| Role code unique | `roles.code` | PASS |
| Permission code unique | `permissions.code` | PASS |
| Department code unique | `departments.code` | PASS |
| Service code unique | `services.service_code` | PASS |
| Content type per service | `service_content_types.service_id,type_code` | PASS |
| Service content slug per service/type | `service_content_items.service_id,content_type_id,slug` | PASS |
| Service translation per item/locale | `service_translations.service_content_item_id,locale` | PASS |
| News post slug | `news_posts.slug` | PASS |
| News translation per post/locale | `news_post_translations.news_post_id,locale` | PASS |
| User role duplicate prevention | `user_roles.user_id,role_id` | PASS |
| Role permission duplicate prevention | `role_permissions.role_id,permission_id` | PASS |
| Project member duplicate prevention | `project_members.project_id,user_id` | PASS |
| WBS dependency pair duplicate prevention | `wbs_task_dependencies.task_id,depends_on_task_id` | PASS |
| Daily report duplicate policy | `daily_reports.user_id,report_date,project_id` | PASS |
| Daily log duplicate policy | `daily_logs.user_id,log_date,project_id` | PASS |
| Daily report/log item duplicate per WBS | report/log id + `wbs_task_id` | PASS |
| Leave balance per user/year | `leave_balances.user_id,balance_year` | PASS |
| Project budget category | `project_budgets.project_id,category_code` | PASS |
| Resource allocation | `project_resource_allocations.project_id,user_id,allocation_month` | PASS |
| Mobile session JTI | `auth_sessions.session_jti` | PASS |
| Refresh token hash | `auth_sessions.refresh_token_hash` | PASS |

Unique policy gaps:

| Gap | Status | Severity |
|---|---|---|
| `service_domains` enforces `service_id,locale`, but not global `domain,locale` or one canonical domain per service at DB level | PARTIAL | P1 |
| Translation slug uniqueness by locale is not directly constrained for `service_translations` / `news_post_translations`; current data has duplicate count 0 | PARTIAL | P1 |

## 5. CHECK Audit

All 246 CHECK constraints were inventoried.

Core invariant coverage:

| Invariant | DB enforcement | Status |
|---|---|---|
| WBS planned/actual progress 0..100 | `wbs_tasks_planned_progress_check`, `wbs_tasks_actual_progress_check` | PASS |
| WBS done requires actual progress 100 | `wbs_tasks_done_progress_chk` | PASS |
| WBS approval-required done guard | `wbs_tasks_requires_approval_done_chk` | PASS |
| WBS self dependency blocked | `wbs_task_dependencies_not_self_chk` | PASS |
| Daily log progress 0..100 | `daily_log_items_actual_progress_check` | PASS |
| Completed daily log requires progress 100 | `daily_log_items_completed_progress_chk` | PASS |
| Allocation percent 0..100 | `project_resource_allocations_allocation_percent_check` | PASS |
| Timesheet hours > 0 and <= 24 | `timesheets_hours_check` | PASS |
| Budget planned/committed/spent non-negative | `project_budgets_*_amount_check` | PASS |
| Expense supply/tax non-negative | `expense_requests_*_amount_check` and generated total | PASS |
| Date ranges | projects, evaluation cycles, leave requests, WBS date range checks | PASS |
| Leave requested days > 0 | `leave_requests_requested_days_check` | PASS |
| Evaluation score 0..100 | `evaluation_scores_score_check` | PASS |
| Evaluation item weight non-negative | `evaluation_items_weight_check` | PASS |
| Status vocabularies | users enum plus CHECK constraints across services, CMS, news, inquiries, leads, projects, WBS, approvals, evaluations, leave, timesheets, expenses, deployments | PASS |

Transition rules remain Worker business-rule scope per v2.0. DB CHECK constraints enforce vocabulary and selected invariants, not the full state-machine transition matrix.

## 6. NOT NULL Audit

NOT NULL coverage was audited for all columns, with special review for core required fields.

| Area | Status | Evidence |
|---|---|---|
| `users.email` / `users.status` | PASS | NOT NULL |
| `users.password_hash` | PASS/PARTIAL | nullable for invited users; `users_password_required_chk` requires hash outside invited status |
| `projects.code/name/status` | PASS | NOT NULL |
| `wbs_tasks.project_id/title/status` | PASS | NOT NULL |
| `daily_report_items.wbs_task_id` | PASS | NOT NULL |
| `daily_log_items.wbs_task_id` | PASS | NOT NULL |
| `approval_documents.requester_user_id/status` | PASS | NOT NULL |
| `evaluation_cycles` core fields | PASS | name/start/end/status NOT NULL |
| `evaluation_scores` user/item/score fields | PASS | NOT NULL |
| `timesheets.user_id/project_id/date/hours/status` | PASS | NOT NULL |
| `timesheets.wbs_task_id` | GAP | nullable despite WBS-linked time-record requirement |
| `expense_requests.requester/date/amount/status` | PASS | NOT NULL for requester/date/supply/tax/status |
| `auth_sessions.user_id/session_jti/refresh_token_hash/expires_at` | PASS | NOT NULL |

## 7. FK Index Coverage

Postgres does not automatically create child-side indexes for FKs. Production coverage:

| Metric | Count |
|---|---:|
| Total FKs | 151 |
| FKs with matching child-side leading index | 29 |
| FKs missing matching child-side leading index | 122 |

This is a performance/deletion/update-lock risk, not a current data-integrity violation. Index creation is remediation work and was not performed in this audit.

Highest-priority missing FK index groups:

- `wbs_tasks`: 6 missing of 7 FKs
- `expense_requests`: 5 missing of 5 FKs
- `timesheets`: 4 missing of 5 FKs
- `service_content_items`: 4 missing of 5 FKs
- `project_issues`: 4 missing of 4 FKs
- `approval_actions`, `approval_documents`, `approval_lines`: several workflow FK indexes missing
- `auth_sessions.user_id` and `auth_sessions.rotated_from_session_id`: missing child-side FK indexes

## 8. Business Invariant Matrix

| Invariant | DB enforcement | Application enforcement | Current status | Risk | Future action |
|---|---|---|---|---|---|
| User email unique | UNIQUE | Login/admin validation | PASS | Low | None |
| Role permission duplicate prevention | UNIQUE | Admin role APIs | PASS | Low | None |
| Service code unique | UNIQUE | Service admin validation | PASS | Low | None |
| Locale/content uniqueness | UNIQUE per item/locale; content slug unique per service/type | CMS validation | PASS/PARTIAL | Medium for public slug policy | Review locale slug policy |
| Project member duplicate prevention | UNIQUE | Project member API | PASS | Low | None |
| WBS progress 0..100 | CHECK | WBS validation | PASS | Low | None |
| WBS self dependency blocked | CHECK + FK | WBS dependency API | PASS | Low | None |
| Report/log item requires WBS | NOT NULL FK | Daily report/log APIs | PASS | Low | None |
| Duplicate daily report/log policy | UNIQUE user/date/project | Daily APIs | PASS | Low | None |
| Approval line/action relationship | FK + UNIQUE + status CHECK | Approval workflow APIs | PASS | Medium due some FK indexes | Add indexes in remediation |
| Evidence cycle/user/source consistency | FK + UNIQUE source tuple + source_type CHECK; source_id polymorphic | Evaluation APIs | PARTIAL | Medium | Source-id consistency review |
| Leave balance uniqueness | UNIQUE user/year | Leave APIs | PASS | Low | None |
| Timesheet WBS required | FK nullable; unique includes nullable WBS | Timesheet API currently expected to enforce | GAP | High | Make WBS required or document/guard alternate policy |
| Expense amount non-negative | CHECK/generated total | Expense APIs | PASS | Low | None |
| Budget amount non-negative | CHECK | Budget APIs | PASS | Low | None |
| Auth session JTI unique | UNIQUE | Mobile auth lifecycle | PASS | Low | None |
| Refresh token hash unique | UNIQUE | Mobile auth lifecycle | PASS | Low | None |

## 9. Production Data Violation Scan

Read-only data scan counts:

| Check | Count |
|---|---:|
| Duplicate user email groups | 0 |
| Duplicate role code groups | 0 |
| Duplicate permission code groups | 0 |
| Duplicate user role groups | 0 |
| Duplicate role permission groups | 0 |
| Duplicate service code groups | 0 |
| Duplicate project member groups | 0 |
| Duplicate WBS dependency groups | 0 |
| Self WBS dependencies | 0 |
| Invalid WBS progress rows | 0 |
| Invalid daily log progress rows | 0 |
| Invalid allocation percent rows | 0 |
| Invalid timesheet hours rows | 0 |
| Negative budget amount rows | 0 |
| Negative expense amount rows | 0 |
| Invalid leave requested days rows | 0 |
| Invalid evaluation score rows | 0 |
| Invalid evaluation weight rows | 0 |
| Invalid project date rows | 0 |
| Invalid evaluation cycle date rows | 0 |
| Invalid leave date rows | 0 |
| Active auth sessions | 0 |
| Invalid auth session JTI rows | 0 |
| Invalid refresh token hash rows | 0 |
| Remaining smoke users | 0 |
| Remaining smoke auth sessions | 0 |
| Timesheets missing WBS | 0 |
| Expenses missing project | 0 |
| Approval documents without project/service/WBS context | 0 |
| Evaluation evidences without project/service | 0 |
| Duplicate domain/locale groups | 0 |
| Duplicate canonical service-domain groups | 0 |
| Duplicate translation locale/slug groups | 0 |

Blocking integrity defects currently present in data: 0.

## 10. Migration-vs-Production Drift

Migration source review:

- Migration files: 14
- First migration: `001_core_org_auth.sql`
- Latest migration: `014_mobile_auth_sessions.sql`
- Source `CREATE TABLE` count: 71 project tables
- Production base table count: 72 including `schema_migrations`
- `schema_migrations` contains 001 through 014 in order

Drift assessment:

| Drift class | Status | Evidence |
|---|---|---|
| Missing migration | PASS | Production `schema_migrations` has 14/14 files |
| Migration order issue | PASS | Filenames ordered 001 through 014 |
| Source-only table | PASS | 71 migration-created project tables match Production project tables |
| Production-only table | PASS | `schema_migrations` is runner bookkeeping, expected |
| Invalid constraints | PASS | 512/512 PK/FK/UNIQUE/CHECK constraints validated |
| Constraint name drift | PARTIAL | Auto-generated names and ALTER-stage names differ by Postgres convention; no functional drift detected |

## 11. Gaps

| ID | Severity | Classification | Finding | Evidence |
|---|---|---|---|---|
| P2-001-GAP-001 | P0 | GAP | `timesheets.wbs_task_id` is nullable although v2.0 time/WBS linkage expects WBS-connected time records | Column nullable; current bad data count 0 |
| P2-001-GAP-002 | P1 | RISK | FK child-side index coverage is low: 122/151 FKs lack matching child-side leading index | Catalog index scan |
| P2-001-GAP-003 | P1 | PARTIAL | Polymorphic references are application-guarded and not physically FK-enforced | attachments/comments/notifications/audit/evaluation evidence target/source pairs |
| P2-001-GAP-004 | P1 | PARTIAL | Public/CMS translation slug uniqueness policy is not fully DB-constrained by locale slug | Current duplicate count 0; DB constrains post/item locale, not public locale slug |
| P2-001-GAP-005 | P1 | PARTIAL | `service_domains` canonical/global domain policy is not fully DB-constrained | Current duplicate count 0; DB enforces service/locale only |

## 12. P0/P1/P2 Classification

| Severity | Count | Items |
|---|---:|---|
| P0 | 1 | `P2-001-GAP-001` |
| P1 | 4 | `P2-001-GAP-002` through `P2-001-GAP-005` |
| P2 | 0 | None |
| Total | 5 | All are remediation candidates, not applied changes |

P0 is assigned because the schema permits a core business invariant violation even though current Production data has 0 violating rows.

## 13. P2-001 Exit Criteria

| Criterion | Status |
|---|---|
| 72/72 tables audited | PASS |
| FK 100% inventoried | PASS |
| UNIQUE 100% inventoried | PASS |
| CHECK 100% inventoried | PASS |
| NOT NULL core fields audited | PASS |
| FK index coverage calculated | PASS |
| Production data invariant scan completed | PASS |
| Migration/source drift checked | PASS |
| P0/P1/P2 gap classification completed | PASS |
| Actual DB write | 0 |
| Migration | 0 |
| Source code change | 0 |
| Secret exposure | 0 |

## 14. Final Verdict

P2-001 = PASS.

Meaning: all current Production constraint state and gaps were inventoried and classified so remediation can begin.

This does not mean the database constraints are perfect. It means the audit phase is complete and the next fix batch can be scoped safely.

## 15. Next Recommended Fix Batch

Because P0 constraint gap count is greater than 0, the next recommended step is:

Phase 2 - P2-001 Remediation Batch 1

Recommended Batch 1 scope:

1. Resolve the `timesheets.wbs_task_id` invariant: either make it NOT NULL with existing data precheck or formally document and enforce an alternate non-WBS timesheet policy.
2. Add focused child-side FK indexes for P0/high-churn auth, WBS, approval, timesheet, expense, and project paths.
3. Defer polymorphic reference hardening and CMS/domain slug policy to separate P1 batches unless product policy promotes them.

## 16. P2-001 Remediation Batch 1 Addendum - 2026-08-13

Batch 1 target: `timesheets.wbs_task_id` nullable P0 gap only.

| Item | Status | Evidence |
|---|---|---|
| Pre-migration null rows | VERIFIED | Production read-only count returned 0 |
| Migration source | VERIFIED | `015_timesheets_wbs_required.sql` sets `timesheets.wbs_task_id` NOT NULL |
| Application validation | VERIFIED | Timesheet create rejects missing/null WBS before DB insert |
| Project/WBS relation validation | VERIFIED | Timesheet create requires selected WBS task to belong to selected project |
| Table count | VERIFIED | 72 unchanged |
| P0 remaining after Batch 1 target state | 0 | `P2-001-GAP-001` remediated by migration 015 |
| P1 remaining | 4 | `P2-001-GAP-002` through `P2-001-GAP-005` remain deferred |
| P2 remaining | 0 | None |

Batch 1 does not create FK indexes, does not change polymorphic reference policy, and does not modify CMS/domain uniqueness policy.
