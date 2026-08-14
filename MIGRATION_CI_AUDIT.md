# P2-007 Migration CI Audit

## 1. Baseline

| Item | Value |
|---|---|
| Repository | `jinbizman-boop/jinbizman` |
| Branch | `main` |
| Git HEAD audited | `7cb1db9d50acb76ac0bcf84c64f566eef5638a98` |
| Production Worker | `jinbizman` |
| Production Worker version | `3d4cb219-775b-45e8-a71e-57e52215b71b` |
| Production database / schema | `neondb` / `public` |
| Production tables | 72 |
| Production migrations | 001 through 018 |
| Production indexes | 425 |
| Scope | Audit and validation only |

No production migration, production schema write, new migration, existing migration edit, index change, Worker code change, production login, business action, DNS change, or manual Worker deploy was performed.

Temporary validation branch:

- Branch ID: `br-rapid-lab-a6pbgy3g`
- Branch name: `p2-007-migration-ci-audit`
- Parent branch: `br-autumn-silence-a62bx2oe`
- Scope: clean install, upgrade path, runner re-run, and failure-injection validation only
- Cleanup: branch deleted after validation

## 2. Migration Inventory

| # | Filename | Purpose | Main objects | Indexes | Data backfill | Destructive operation | Dependency | Re-run behavior | Rollback note |
|---:|---|---|---|---:|---|---|---|---|---|
| 001 | `001_core_org_auth.sql` | Core org/auth/RBAC | departments, users, roles, permissions, role mappings | 17 | No | No DML destructive operation | First migration | Runner skip after applied | Restore/branch rollback |
| 002 | `002_service_hub.sql` | Service hub | services, environments, connections, content types/items, change logs | 32 | No | No DML destructive operation | 001 users/RBAC | Runner skip after applied | Restore/branch rollback |
| 003 | `003_public_content.sql` | Public content and CRM | news_posts, inquiries, leads, opportunities | 29 | No | No DML destructive operation | 001/002 | Runner skip after applied | Restore/branch rollback |
| 004 | `004_projects_wbs.sql` | Project/WBS | projects, members, WBS templates/items/tasks/dependencies, outputs, issues | 34 | No | No DML destructive operation | 001/003 | Runner skip after applied | Restore/branch rollback |
| 005 | `005_daily_reports_logs.sql` | Daily report/log | daily_reports/items, daily_logs/items | 21 | No | No DML destructive operation | 001/004 | Runner skip after applied | Restore/branch rollback |
| 006 | `006_approvals.sql` | Approval workflow | approval_documents, lines, actions | 20 | No | No DML destructive operation | 001/002/004 | Runner skip after applied | Restore/branch rollback |
| 007 | `007_evaluations.sql` | Evaluation/KPI | evaluation cycles/items/evidences/scores/feedbacks | 25 | No | No DML destructive operation | 001/002/004 | Runner skip after applied | Restore/branch rollback |
| 008 | `008_domains_locales.sql` | Domains/localization | service_domains, service_translations, news_post_translations | 14 | No | No DML destructive operation | 002/003 | Runner skip after applied | Restore/branch rollback |
| 009 | `009_audit_notifications.sql` | Audit, attachments, notifications, rate limits | attachments, comments, notifications, audit_logs, api_rate_limits | 32 | No | No DML destructive operation | 001/002/004 | Runner skip after applied | Restore/branch rollback |
| 010 | `010_indexes_constraints.sql` | Cross-module constraints/indexes | no new table | 44 | No | No DML destructive operation | 001-009 | Runner skip after applied | Restore/branch rollback |
| 011 | `011_production_hardening.sql` | Production hardening | login_events, system_settings, email_delivery_logs; existing-table column additions | 12 | No | No DML destructive operation | 001-010 | Runner skip after applied | Restore/branch rollback |
| 012 | `012_workplace_operations.sql` | Workplace/finance/knowledge | todos, attendance, leave, allocations, timesheets, budgets, expenses, goals, board, knowledge, integrations, email templates | 19 | No | No DML destructive operation | 001/004/006/011 | Runner skip after applied | Restore/branch rollback |
| 013 | `013_remaining_admin_operations.sql` | Remaining admin modules | common codes, approval templates, meetings, deployments, banners, navigation, knowledge templates | 5 | No | No DML destructive operation | 001-012 | Runner skip after applied | Restore/branch rollback |
| 014 | `014_mobile_auth_sessions.sql` | Mobile auth sessions | auth_sessions | 3 | No | No DML destructive operation | 001 users | Runner skip after applied | Restore/branch rollback |
| 015 | `015_timesheets_wbs_required.sql` | Require WBS on timesheets | timesheets column nullability | 0 | No | `ALTER COLUMN ... SET NOT NULL`; no UPDATE/DELETE | 012 and precheck no NULL rows | Runner skip after applied | Restore/branch rollback |
| 016 | `016_news_posts_list_index.sql` | Public news listing index | no new table | 1 | No | No destructive operation | 003 news_posts | Runner skip after applied | Drop index only in rollback branch if needed |
| 017 | `017_approval_documents_updated_at_index.sql` | Approval recency index | no new table | 1 | No | No destructive operation | 006 approval_documents | Runner skip after applied | Drop index only in rollback branch if needed |
| 018 | `018_expense_requests_expense_date_id_index.sql` | Expense recency index | no new table | 1 | No | No destructive operation | 012 expense_requests | Runner skip after applied | Drop index only in rollback branch if needed |

Inventory coverage: 18 / 18 migration files.

## 3. Numbering / Continuity

| Check | Result |
|---|---|
| Number range | 001 through 018 |
| Missing number | None |
| Duplicate number | None |
| Filename convention | `NNN_description.sql` for all 18 files |
| Old migration rename evidence | None found in current tree |
| Later duplicate object recreation risk | No functional duplicate object found in final clean install |

Existing static tests also cover migration count/order and sentinel content in `tests/worker/schema.test.mjs`, `tests/worker/api-contract.test.mjs`, and `scripts/release-check.mjs`.

## 4. Migration Runner

Runner: `scripts/migrate.mjs`

Observed behavior:

- Requires `DATABASE_URL`.
- Creates `schema_migrations(filename text primary key, applied_at timestamptz default now())` if missing.
- Reads `db/migrations`.
- Selects files matching `^\d+_.*\.sql$`.
- Sorts filenames lexically.
- Checks `schema_migrations` before each file.
- Skips already-applied filenames.
- Strips optional leading `BEGIN;` and trailing `COMMIT;` from migration files.
- Wraps each file in a runner-owned `BEGIN` / `COMMIT`.
- Inserts `schema_migrations` row inside the same transaction as the schema change.
- Rolls back the file transaction on error and rethrows.
- Uses `@neondatabase/serverless` Pool with WebSocket constructor.

Policy:

- Runner-level idempotency is the current official project behavior.
- SQL-file-level idempotency is not universal and is not required by current runner policy.
- Directly executing migration SQL files twice remains an operator risk.

## 5. Clean Install

Temporary branch validation:

1. Dropped and recreated `public` schema on the temporary branch only.
2. Ran the official project runner with migrations 001 through 018.
3. Verified final schema sentinels.

Clean install result:

| Check | Result |
|---|---|
| Runner result | PASS |
| Final tables | 72 |
| Final migrations | 18 |
| Latest migration | `018_expense_requests_expense_date_id_index.sql` |
| Final indexes | 425 |
| `auth_sessions` exists | YES |
| `timesheets.wbs_task_id` nullable | NO |
| Index 016 exists | YES |
| Index 017 exists | YES |
| Index 018 exists | YES |

Clean-install schema evidence matched Production:

| Catalog item | Clean install | Production |
|---|---:|---:|
| Tables | 72 | 72 |
| Columns | 827 | 827 |
| Table constraints | 1182 | 1182 |
| Primary keys | 72 | 72 |
| Foreign keys | 151 | 151 |
| Unique constraints | 43 | 43 |
| Check constraints | 916 | 916 |
| Indexes | 425 | 425 |

Deterministic catalog hashes:

| Item | Clean install | Production | Match |
|---|---|---|---|
| Columns hash | `9f9a80f67d62ed790a90862a5fc7d43b` | `9f9a80f67d62ed790a90862a5fc7d43b` | YES |
| Constraints hash | `3cbe16b02c8ba592518c365f3f39c002` | `3cbe16b02c8ba592518c365f3f39c002` | YES |
| Indexes hash | `13141bbc91c4ea80f235df95c063d703` | `13141bbc91c4ea80f235df95c063d703` | YES |

## 6. Upgrade Paths

Upgrade validation used the temporary branch only. Each case reset the temporary schema, applied the baseline range, then applied the target upgrade range.

| Upgrade path | Result | Final latest migration |
|---|---|---|
| 013 to 014 | PASS | `014_mobile_auth_sessions.sql` |
| 014 to 015 | PASS | `015_timesheets_wbs_required.sql` |
| 015 to 016 | PASS | `016_news_posts_list_index.sql` |
| 016 to 017 | PASS | `017_approval_documents_updated_at_index.sql` |
| 017 to 018 | PASS | `018_expense_requests_expense_date_id_index.sql` |
| 013 to 018 sequential | PASS | `018_expense_requests_expense_date_id_index.sql` |

## 7. Re-run Safety

Official runner re-run after clean install:

- 001 through 018 all reported `skip`.
- Duplicate object creation: 0 observed.
- Duplicate `schema_migrations` insert: 0 observed.

Direct SQL re-run:

- Not guaranteed for every file.
- Many migration files use `CREATE TABLE IF NOT EXISTS`, but indexes, triggers, constraints, and `ALTER COLUMN SET NOT NULL` should not be manually replayed outside the runner.
- Direct file replay is classified as operational risk, not a P0 migration defect, because the official runner is re-run safe.

## 8. Failure / Transactionality

Failure-injection validation on the temporary branch:

- Injected a transaction that created a probe table, deliberately failed, and would have inserted a fake migration record only after the failing statement.
- Result: failure triggered.
- Probe table remained: NO.
- Fake migration marked applied: NO.

Runner transactionality:

- File-level transaction: YES.
- `schema_migrations` record is committed atomically with each file.
- Failed migration marked applied: NO in validation.
- Partial schema residue: NO in validation.

Migration transaction classification:

- 001 through 014 contain file-level `BEGIN`/`COMMIT` markers, which the runner strips and replaces with its own transaction.
- 015 through 018 are simple no-marker files and are still wrapped by the runner.
- No `CREATE INDEX CONCURRENTLY` was found.

## 9. Destructive SQL Audit

Actual destructive DML/DDL scan:

| Pattern | Result |
|---|---|
| `DROP TABLE` | 0 |
| `DROP COLUMN` | 0 |
| `TRUNCATE` | 0 |
| DML `DELETE FROM` | 0 |
| DML `UPDATE` backfill | 0 |
| `CREATE INDEX CONCURRENTLY` | 0 |
| `ALTER COLUMN ... SET NOT NULL` | 1, migration 015 |

Notes:

- `ON DELETE CASCADE` appears in FK definitions, but that is relational behavior rather than migration-time data deletion.
- Trigger declarations include `BEFORE UPDATE` / `AFTER UPDATE`, but no migration-time UPDATE backfill was found.
- Migration 015 is the only not-null enforcement migration. It was previously applied after a production precheck showed zero violating `timesheets.wbs_task_id IS NULL` rows.

## 10. Backward Compatibility

| Migration | Compatibility assessment |
|---|---|
| 014 | Additive `auth_sessions` table; backward compatible with legacy auth and required for mobile auth. |
| 015 | `timesheets.wbs_task_id` NOT NULL can reject old clients that send null; current Worker validation and P2-001 tests align with the requirement. |
| 016 | Index-only migration; backward compatible. |
| 017 | Index-only migration; backward compatible. |
| 018 | Index-only migration; backward compatible. |

General policy:

- Additive tables, columns, and indexes are backward compatible.
- Constraint tightening requires precheck and app-contract alignment.
- Worker rollback must not assume removal of already-applied DB objects.

## 11. Production Drift

Production checks were read-only.

Drift result:

- Clean install vs Production: PASS.
- Source vs Production: PASS at functional catalog level.
- Functional drift: 0 detected.

Sentinel checks:

- Production migrations: 18.
- Production latest migration: `018_expense_requests_expense_date_id_index.sql`.
- Production tables: 72.
- Production indexes: 425.
- `auth_sessions`: present.
- `timesheets.wbs_task_id`: NOT NULL.
- Indexes 016/017/018: present.

## 12. Rollback Strategy

Current strategy observed from project history and v2 source-of-truth direction:

- Code rollback: Git/Worker rollback.
- DB rollback: Neon restore/branch strategy.
- Migration rollback: backward-compatible forward migrations preferred; no down migrations are maintained today.
- Emergency recovery: restore/branch from Neon, then align Worker version.

Assessment:

- This strategy is consistent with the current migration style.
- It is not yet automated as a CI drill.
- No down migration files were added or requested in this audit.

## 13. Existing Test Coverage

Existing local/static coverage:

- `tests/worker/schema.test.mjs` checks 18 ordered migrations and sentinel contents.
- `tests/worker/api-contract.test.mjs` checks migration count/order and 014 through 018 sentinel files.
- `scripts/release-check.mjs` checks migration sequence continuity.

Executed during this audit:

- `node --test tests/worker/schema.test.mjs tests/worker/api-contract.test.mjs`
- Result: 17 / 17 PASS.

Coverage gaps:

- No checked-in script performs actual empty-DB clean install.
- No checked-in script performs 013 through 018 upgrade-path simulation.
- No checked-in script performs runner re-run skip validation against a temporary DB.
- No checked-in script performs migration failure-injection validation.

## 14. CI Integration

Repository CI status:

- `.github/workflows`: absent.
- Migration CI workflow: absent.
- Local migration runner exists: YES.
- Local static tests exist: YES.
- Automated temporary DB strategy in CI: absent.

CI readiness:

- Migration source quality is verified by this audit.
- Migration CI automation is not ready until a temporary DB/branch clean-install and upgrade test is wired into CI.
- Production `DATABASE_URL` must not be used for migration CI.
- A temporary Neon branch or isolated Postgres service should be used for CI.

## 15. Gaps

| Gap ID | Severity | Status | Evidence | Recommended action |
|---|---|---|---|---|
| P2-007-GAP-001 | P1 | GAP | `.github/workflows` is absent; migration clean-install/upgrade is not enforced in CI. | Add migration CI workflow using a temporary DB/branch. |
| P2-007-GAP-002 | P1 | GAP | Clean install, upgrade-path, re-run, and failure-injection validation are manual, not scripted in the repo. | Add a non-production migration validation script. |
| P2-007-GAP-003 | P1 | GAP | Rollback/restore strategy is documented conceptually, but no automated Neon restore/branch drill is present. | Add rollback readiness runbook and periodic restore drill. |
| P2-007-GAP-004 | P2 | RISK | Direct SQL-file replay is not universally idempotent; safety depends on runner-level `schema_migrations` skips. | Document operator rule: never replay SQL files directly on production. |
| P2-007-GAP-005 | P2 | TEST_GAP | Existing tests are static/sentinel checks and do not connect to a DB. | Extend test suite with optional non-production DB validation gate. |

## 16. P0/P1/P2

- P0: 0
- P1: 3
- P2: 2
- Total: 5

No migration correctness P0 was found.

## 17. Exit Criteria

| Criterion | Status |
|---|---|
| 001 through 018 inventory complete | PASS |
| Numbering continuous | PASS |
| Clean install PASS | PASS |
| Key upgrade paths PASS | PASS |
| Runner re-run safe | PASS |
| Failure behavior known | PASS |
| Destructive SQL audited | PASS |
| Backward compatibility audited | PASS |
| Production drift 0 | PASS |
| Rollback strategy documented | PASS |
| CI coverage identified | PASS |
| P0/P1/P2 gap classification | PASS |
| Production write | 0 |
| Existing migration modification | 0 |
| New migration | 0 |
| Secret in committed docs | 0 |

## 18. Verdict

P2-007 Migration CI Audit: PASS.

Clean install ready: YES.

Upgrade ready: YES.

Production drift: NO.

Migration CI ready: PARTIAL. Migration correctness is validated for this audit, but automated CI enforcement is not implemented.

## 19. Remediation Recommendation

P0 migration gap count is 0.

Next approved phase:

Phase 2 - Final Exit / G2 Closeout.
