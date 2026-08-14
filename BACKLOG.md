# JINBIZ MANAGEMENT Final Development Backlog v2

## 1. Snapshot Metadata

- Date: 2026-08-12T16:05:00+09:00
- Git HEAD: 6e13881fe4db818eafa7b73da9d2d84afcccc127
- Source documents:
  - C:/Users/Telos_PC_17/Downloads/JINBIZ_MANAGEMENT_FullStack_Function_Performance_Requirements_v2.0_FINAL_20260812.pdf
  - C:/Users/Telos_PC_17/Downloads/JINBIZ_MANAGEMENT_Complete_Development_Master_Plan_v2.0_FINAL_20260812.pdf
- Phase 0 inputs:
  - BASELINE.md
  - DB_INVENTORY.md
  - API_INVENTORY.md
  - SCREEN_INVENTORY.md
  - RTM.md
- Scope: P0-006 Gap Backlog only. No Phase 1 implementation, code change, DB change, Cloudflare change, commit, push, or deployment was performed.

Raw candidate sources:

| Source | Raw candidates |
|---|---:|
| DB_INVENTORY.md GAP-DB-* | 3 |
| API_INVENTORY.md GAP-API-* | 5 |
| SCREEN_INVENTORY.md GAP-UI-* | 5 |
| RTM.md TRACE-MISS-* | 5 |
| RTM partial/document-ahead/drift/no-direct-test rows | 74 |
| Raw total before merge | 92 |
| Root-cause backlog items after merge | 29 |

## 2. Backlog Summary

- Total: 29
- P0: 10
- P1: 16
- P2: 3
- Critical: 0
- High: 15
- Medium: 11
- Low: 3

Priority rules used:

- P0: production security, permission/scope, data integrity, core ERP E2E, high-risk write transaction/audit, release gate blocker.
- P1: important operational completion, mobile readiness, API versioning, observability, R2/Queue, responsive/accessibility depth, test coverage expansion.
- P2: optimization, non-blocking QA cleanup, long-term scale, or low-risk documentation distinction.

## 3. Phase Summary

| Phase | Backlog items | P0 | P1 | P2 |
|---|---:|---:|---:|---:|
| Phase 1 - Auth / Platform | 7 | 5 | 2 | 0 |
| Phase 2 - DB Integrity / Performance | 4 | 2 | 1 | 1 |
| Phase 3 - Core ERP E2E | 3 | 2 | 1 | 0 |
| Phase 4 - Operations | 4 | 0 | 4 | 0 |
| Phase 5 - CMS / Global | 3 | 1 | 1 | 1 |
| Phase 6 - Mobile | 3 | 0 | 3 | 0 |
| Phase 7 - SLO / DR | 3 | 0 | 2 | 1 |
| Phase 8 - Go-Live | 2 | 0 | 2 | 0 |

## 4. Dependency Graph

```text
GAP-P1-001 RBAC/scope contract
  -> GAP-P1-006 Forbidden UX
  -> GAP-P3-002 My Tasks/self-scope E2E
  -> GAP-P6-002 Mobile core workflows

GAP-P1-002 Auth/mobile boundary and API versioning strategy
  -> GAP-P6-001 Mobile app shell/auth PoC
  -> GAP-P6-002 Mobile core workflows
  -> GAP-P6-003 Mobile push/offline/store readiness

GAP-P1-004 Audit policy
  -> GAP-P3-001 Core ERP E2E evidence
  -> GAP-P4-002 Finance approval/budget controls
  -> GAP-P8-001 Production write smoke

GAP-P1-005 API contract test foundation
  -> GAP-P2-001 State and constraint matrix
  -> GAP-P2-002 Transaction/idempotency audit
  -> GAP-P3-001 Core ERP E2E evidence

GAP-P2-002 Transaction/idempotency audit
  -> GAP-P4-002 Finance approval/budget controls
  -> GAP-P4-003 Queue/idempotency foundation
  -> GAP-P6-003 Mobile offline retry

GAP-P4-003 Queue/idempotency foundation
  -> GAP-P5-002 R2/media lifecycle
  -> GAP-P6-003 Mobile push/offline/store readiness
  -> GAP-P7-001 Observability/SLO

GAP-P7-002 Rollback/restore runbook
  -> GAP-P8-001 Production write smoke
  -> GAP-P8-002 72h stabilization handoff
```

## 5. Phase 1 - Auth / Platform

### GAP-P1-001 - RBAC scope and permission contract audit

Priority: P0
Severity: HIGH
Primary Category: RBAC
Related Requirements: SEC-RBAC-001, SEC-RBAC-002, SEC-RBAC-003, SEC-RBAC-004, SEC-007, BE-003
Source Evidence: API_INVENTORY GAP-API-002; SCREEN_INVENTORY GAP-UI-001; RTM SEC-RBAC partial rows
Current State: Protected routes have route-local permission checks and ad hoc service/project/team/self scope behavior. Admin menu visibility is not permission-filtered after login.
Expected State: Every admin/ERP/system route has explicit permission and scope metadata; server checks are authoritative; UI visibility references the same permission vocabulary without becoming the security boundary.
Business Impact: Users can see modules they cannot use and operators cannot easily prove least-privilege behavior.
Technical Risk: Inconsistent route-local authorization semantics can regress as new routes are added.
Security Impact: Potential authorization ambiguity; no confirmed bypass in Phase 0.
Data Impact: Scope mistakes could expose or mutate wrong project/service/user data.
Affected Screens: AdminShell, all Admin/ERP module routes, especially services, projects, todos, approvals, operations modules.
Affected APIs: Protected `/api/admin/*`, `/api/erp/*`, `/api/system/*`.
Affected Tables: users, roles, permissions, user_roles, role_permissions plus scoped service/project/user tables.
Affected Tests: tests/admin-react.test.mjs, tests/worker/config.test.mjs, release-hardening tests; new permission/scope contract tests required.
Dependencies: None. This is the first Phase 1 item.
Recommended Phase: Phase 1 - Auth / Platform
Recommended Order: 1
Estimated Scope: M
Completion Criteria: Permission/scope matrix exists; route metadata or equivalent map covers 100% protected routes; representative cross-scope requests return 403; existing admin super_admin flows still pass.
Verification: npm run typecheck; npm test; targeted Worker permission/scope tests; npm run release:check; production smoke for login/me only after deploy.
Out of Scope: Mobile app UI, full role redesign, database role seed changes unless a confirmed mismatch requires a separate approved task.

### GAP-P1-002 - Web/mobile auth boundary and API versioning strategy

Priority: P1
Severity: HIGH
Primary Category: AUTH
Related Requirements: AUTH-001, BE-011, BE-012, SEC-004, SEC-014, MOB-001, MOB-F-001
Source Evidence: API_INVENTORY GAP-API-001; RTM TRACE-MISS-001; RTM BE-011, SEC-004, MOB rows
Current State: Auth and ERP APIs exist under unversioned Web-oriented routes. Cookie session works for Web; mobile access/refresh/revoke strategy and `/api/v1` contract are not implemented.
Expected State: Approved auth contract separates Web HttpOnly cookie from mobile secure-token strategy and defines versioning/backward compatibility before mobile build work starts.
Business Impact: Mobile work could couple to internal Web routes and require breaking changes later.
Technical Risk: Without versioning, store-released clients are hard to support.
Security Impact: Mobile tokens must avoid secret exposure and support revoke/expiry.
Data Impact: No direct DB change expected in first design pass; later device sessions may require migration.
Affected Screens: AdminLoginPage, future mobile login.
Affected APIs: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, future `/api/v1/*`.
Affected Tables: users, login_events, api_rate_limits; potential future device_sessions.
Affected Tests: tests/worker/crypto.test.mjs, tests/worker/config.test.mjs; future mobile contract tests.
Dependencies: GAP-P1-001 informs mobile permission model.
Recommended Phase: Phase 1 - Auth / Platform
Recommended Order: 2
Estimated Scope: M
Completion Criteria: AUTH_CONTRACT.md or equivalent approved; `/api/v1` migration policy defined; no existing Web auth regression; mobile token storage/revoke plan accepted.
Verification: source contract tests for auth routes; npm test; release-check; no secret values in docs or repo.
Out of Scope: Building the mobile app and implementing full refresh-token persistence.

### GAP-P1-003 - Origin, CORS, rate-limit, and API abuse policy hardening

Priority: P0
Severity: HIGH
Primary Category: SECURITY
Related Requirements: SEC-006, SEC-013, BE-009, TST-005
Source Evidence: RTM SEC-013 partial; API_INVENTORY rate limited 2 contracts; release-hardening origin test; RTM BE-009 partial
Current State: Login and public inquiry rate limits exist; trusted-origin fail-closed exists for cookie writes. High-risk write rate policy, body size limits, timeout/idempotency coverage are only partially traced.
Expected State: Rate-limit and abuse policy explicitly covers login, inquiry, public reads/search if used, and high-risk writes; body size and malformed request behavior are tested.
Business Impact: Abuse can degrade production availability or create operator noise.
Technical Risk: Route-by-route ad hoc limits become inconsistent.
Security Impact: Reduced brute-force and request-abuse exposure.
Data Impact: Prevents duplicate or excessive write attempts.
Affected Screens: Login, contact form, admin write forms.
Affected APIs: `/api/auth/login`, `/api/public/inquiries`, selected high-risk `/api/admin/*`, `/api/erp/*`, `/api/system/*` writes.
Affected Tables: api_rate_limits, login_events, audit_logs, domain write tables.
Affected Tests: release-hardening, worker config; new abuse/rate tests.
Dependencies: GAP-P1-005 API contract test foundation.
Recommended Phase: Phase 1 - Auth / Platform
Recommended Order: 3
Estimated Scope: M
Completion Criteria: Invalid origin write = 403; limit-exceeded login/inquiry = 429; configured limits documented; no public route loses expected GET behavior.
Verification: npm test; targeted Worker rate/origin tests; npm run release:check; production health/auth smoke.
Out of Scope: WAF/Bot Management procurement or Cloudflare plan upgrade.

### GAP-P1-004 - High-risk audit coverage policy

Priority: P0
Severity: HIGH
Primary Category: AUDIT
Related Requirements: AUD-001, SEC-010, BE-008, REL-005
Source Evidence: API_INVENTORY GAP-API-004; RTM BE-008 and SEC-010 partial; API_INVENTORY notes 50 audited writes and several setup writes without generic audit
Current State: Many writes use audit_logs, auth uses login_events, but selected setup/admin-operation writes lack generic audit.
Expected State: Audit policy classifies every write as FULL, DOMAIN-SPECIFIC, or explicitly exempt with reason; high-risk configuration/content/permission/approval/evaluation/finance writes are audited.
Business Impact: Operators need reliable after-the-fact traceability for production changes.
Technical Risk: Missing audit can hide regressions or complicate incident response.
Security Impact: Weakens accountability for high-risk changes.
Data Impact: Audit tables should capture before/after where practical without leaking secrets.
Affected Screens: Services, CMS, news, media, approval templates, code groups, integrations, settings, finance.
Affected APIs: Selected setup/admin-operation writes and all high-risk writes.
Affected Tables: audit_logs plus service/content/system/finance tables.
Affected Tests: New audit write tests; release-hardening.
Dependencies: GAP-P1-001 route metadata can include audit class.
Recommended Phase: Phase 1 - Auth / Platform
Recommended Order: 4
Estimated Scope: M
Completion Criteria: Audit matrix covers 100% write contracts; high-risk writes insert audit_logs or documented domain-specific logs; no secret/password/hash values are logged.
Verification: Worker integration tests for representative audited writes; npm test; SQL metadata check for audit rows in test DB.
Out of Scope: SIEM integration and long-term retention automation.

### GAP-P1-005 - API contract and security regression test foundation

Priority: P0
Severity: HIGH
Primary Category: TEST
Related Requirements: TST-002, TST-004, TST-005, TST-010, BE-002, BE-003
Source Evidence: API_INVENTORY direct test coverage 40/124 and no direct 84; RTM TRACE-MISS-005; RTM TST rows partial
Current State: Source-contract and selected Worker tests exist, but endpoint-level contract coverage is incomplete.
Expected State: Test harness covers success/error envelope, auth/permission failures, validation, key write guards, and production smoke boundaries for high-risk APIs.
Business Impact: Future changes can ship with hidden API regressions.
Technical Risk: Refactors across Worker routes are expensive without contract tests.
Security Impact: Auth/RBAC/origin/rate regressions may go unnoticed.
Data Impact: Write tests catch bad validation or transaction behavior before production.
Affected Screens: All API-connected screens.
Affected APIs: All public/auth/admin/erp/system APIs, with risk-based priority.
Affected Tables: Test DB or mocked DB representation for key tables.
Affected Tests: tests/worker/*, tests/test_site.py, tests/e2e/public.spec.ts.
Dependencies: GAP-P1-001, GAP-P1-003, GAP-P1-004 provide expected contracts.
Recommended Phase: Phase 1 - Auth / Platform
Recommended Order: 5
Estimated Scope: L
Completion Criteria: High-risk auth/RBAC/write APIs have direct tests; existing 40 direct tests do not regress; release gate runs contract suite.
Verification: npm run typecheck; npm test; python -m pytest -q tests/test_site.py; npm run release:check.
Out of Scope: Full load testing and mobile-device tests.

### GAP-P1-006 - Admin forbidden and permission-aware UX state

Priority: P1
Severity: MEDIUM
Primary Category: UI
Related Requirements: FE-001, FE-005, SEC-RBAC-002
Source Evidence: SCREEN_INVENTORY GAP-UI-002; SCREEN_INVENTORY Forbidden complete 0; RTM FE-001 partial
Current State: StatePanel supports forbidden, but no protected screen uses a dedicated forbidden state.
Expected State: 403 responses and missing permissions render a consistent forbidden state, not generic errors, while server remains authoritative.
Business Impact: Operators understand access limits without mistaking them for system failure.
Technical Risk: Generic error handling hides permission bugs.
Security Impact: Avoids leaking details while making denial clear.
Data Impact: None directly.
Affected Screens: AdminShell, ModulePage, specialized ERP pages.
Affected APIs: Any protected API returning 403.
Affected Tables: None directly.
Affected Tests: Admin UI state tests, e2e protected-route tests.
Dependencies: GAP-P1-001.
Recommended Phase: Phase 1 - Auth / Platform
Recommended Order: 6
Estimated Scope: S
Completion Criteria: Representative 403 renders forbidden UI; no stack/DB info exposed; keyboard/focus behavior remains accessible.
Verification: npm test; npm run test:e2e for protected route scenario where feasible.
Out of Scope: Redesigning admin layout.

### GAP-P1-007 - Production config, Worker build, and deploy identity verification

Priority: P0
Severity: MEDIUM
Primary Category: PRODUCTION
Related Requirements: REL-002, SEC-001, TST-009
Source Evidence: BASELINE Cloudflare dashboard/build values NOT VERIFIED; RTM REL-002 partial
Current State: Local config uses Worker name jinbizman and production health is good, but Cloudflare dashboard build settings and latest deployment metadata were not fully verified in P0-001 due CLI authentication state.
Expected State: Production build repository, branch, command, deploy command, Worker name, custom domain, and latest deployment commit are verified and recorded without exposing secrets.
Business Impact: Prevents accidental deployment to wrong Worker/environment.
Technical Risk: Misconfigured build pipeline can make future pushes non-production or stale.
Security Impact: Confirms secrets remain in Cloudflare and not in Git.
Data Impact: None directly.
Affected Screens: Production site globally.
Affected APIs: Production Worker globally.
Affected Tables: None.
Affected Tests: release-hardening, release-check, production smoke.
Dependencies: None; can run after P0 docs are accepted.
Recommended Phase: Phase 1 - Auth / Platform
Recommended Order: 7
Estimated Scope: XS
Completion Criteria: Build settings are verified; Worker name/domain/branch match; `/api/health` returns database connected after deploy; no secret values printed.
Verification: npx wrangler whoami; npx wrangler deployments/status where available; GET `/api/health`; git status.
Out of Scope: Changing Cloudflare settings unless a mismatch is explicitly approved.

## 6. Phase 2 - DB Integrity / Performance

### GAP-P2-001 - State vocabulary and DB/Worker/UI state matrix audit

Priority: P0
Severity: HIGH
Primary Category: DB
Related Requirements: DB-TXN-004, WBS-001, APR-001, EVAL-001, FE-006
Source Evidence: DB_INVENTORY GAP-DB-002; RTM DB-TXN-004 partial; master plan WP-STATE
Current State: Business statuses use varchar/text with CHECK constraints; users.status is the only enum. This may be intentional, but a full state matrix is not yet produced.
Expected State: Core objects have documented legal states, transitions, actors, guards, DB constraints, API validation, and UI labels.
Business Impact: Prevents inconsistent status meanings across Web, Worker, DB, and mobile.
Technical Risk: Future feature additions may bypass state guards.
Security Impact: State guards protect approval/evaluation/high-risk actions.
Data Impact: Reduces invalid transitions and stale state labels.
Affected Screens: Projects/WBS, daily work, approvals, evaluations, news/CMS, workplace/finance modules.
Affected APIs: WBS, approvals, evaluations, content/news, attendance/leave/timesheets/expenses.
Affected Tables: wbs_tasks, approval_documents, approval_lines, evaluation_cycles, news_posts, service_content_items, attendance_records, leave_requests, timesheets, expense_requests.
Affected Tests: New state transition tests; schema tests.
Dependencies: GAP-P1-005.
Recommended Phase: Phase 2 - DB Integrity / Performance
Recommended Order: 8
Estimated Scope: L
Completion Criteria: STATE_MATRIX.md covers core objects; illegal transition tests fail closed; DB CHECK/trigger/API validation agree for P0 workflows.
Verification: npm test; schema tests; targeted migration dry-run if DB changes are later approved.
Out of Scope: Converting every status to PostgreSQL enum by default.

### GAP-P2-002 - High-risk transaction and idempotency review

Priority: P0
Severity: HIGH
Primary Category: TRANSACTION
Related Requirements: BE-007, DB-TXN-001, DB-TXN-002, DB-TXN-003, DB-TXN-005, SEC-013
Source Evidence: API_INVENTORY GAP-API-003; RTM DB-TXN-002/003/005 partial or document-ahead; TRACE-MISS-002
Current State: Some writes use single-statement atomicity or explicit transaction-like behavior, but a uniform transaction/idempotency strategy is not complete.
Expected State: Inquiry conversion, approval action, daily report/log, budget/expense, content publish, and mobile retry-sensitive writes have explicit atomicity and duplicate-prevention policy.
Business Impact: Prevents duplicate approvals, partial writes, and double budget execution.
Technical Risk: Mixed patterns become fragile under concurrency.
Security Impact: Idempotency protects high-risk action replay.
Data Impact: Directly protects consistency of approval, finance, WBS, and mobile offline actions.
Affected Screens: Contact/admin inquiry, approvals, daily work, expenses, budgets, future mobile workflows.
Affected APIs: Inquiry convert, approval action, daily reports/logs, expense update, budget upsert, future idempotent mobile actions.
Affected Tables: inquiries, leads, approval tables, daily tables, project_budgets, expense_requests, audit_logs.
Affected Tests: Transaction integration tests; duplicate-action tests.
Dependencies: GAP-P1-005.
Recommended Phase: Phase 2 - DB Integrity / Performance
Recommended Order: 9
Estimated Scope: L
Completion Criteria: High-risk write matrix marks each route as explicit transaction/atomic statement/exempt; duplicate approval and duplicate expense tests pass.
Verification: npm test; DB integration tests against test database; targeted SQL consistency assertions.
Out of Scope: Production DB manual schema changes without migration.

### GAP-P2-003 - Side-effecting GET `/api/erp/todos` review

Priority: P1
Severity: MEDIUM
Primary Category: API
Related Requirements: BE-001, BE-003, TASK-001, SEC-013
Source Evidence: API_INVENTORY GAP-API-005; RTM TASK-001 implemented-no-direct-test
Current State: GET `/api/erp/todos` performs read plus synchronization/upsert behavior into todo_items.
Expected State: GET remains read-only, or the mutation is moved to an explicit write/system synchronization route with clear audit/idempotency semantics.
Business Impact: Avoids surprising data mutation during reads.
Technical Risk: Caches, retries, or health tooling may trigger writes unintentionally.
Security Impact: Reduces action ambiguity.
Data Impact: Prevents silent todo creation/update from read paths.
Affected Screens: `/admin/todos`, future mobile My Tasks.
Affected APIs: GET `/api/erp/todos`, possible future sync endpoint.
Affected Tables: todo_items, wbs_tasks, audit_logs.
Affected Tests: New My Tasks API contract tests.
Dependencies: GAP-P2-002.
Recommended Phase: Phase 2 - DB Integrity / Performance
Recommended Order: 10
Estimated Scope: M
Completion Criteria: GET todo route has documented read/write behavior; if changed, read calls do not mutate DB; tests prove behavior.
Verification: npm test; DB before/after assertion for GET route.
Out of Scope: Full My Tasks UX redesign.

### GAP-P2-004 - DB function ownership and targeted data count audit

Priority: P2
Severity: LOW
Primary Category: DOCUMENTATION
Related Requirements: DB inventory evidence, REL-001
Source Evidence: DB_INVENTORY GAP-DB-001 and GAP-DB-003
Current State: DB inventory distinguishes 63 public functions but includes citext extension functions; row counts are estimated to avoid production load.
Expected State: Later DB dictionary distinguishes extension-owned vs project-owned functions and uses exact counts only for safe, small, targeted tables.
Business Impact: Reduces confusion during DB audits.
Technical Risk: Low; mostly documentation precision.
Security Impact: None directly.
Data Impact: No data change.
Affected Screens: N/A.
Affected APIs: N/A.
Affected Tables: schema-wide metadata.
Affected Tests: DB inventory script/check.
Dependencies: None.
Recommended Phase: Phase 2 - DB Integrity / Performance
Recommended Order: 11
Estimated Scope: XS
Completion Criteria: DB dictionary marks extension functions separately; targeted exact count policy documented.
Verification: read-only information_schema/pg_catalog query; git diff docs only.
Out of Scope: Production-wide `count(*)` sweep.

## 7. Phase 3 - Core ERP E2E

### GAP-P3-001 - Core Inquiry to Evidence E2E regression suite

Priority: P0
Severity: HIGH
Primary Category: TEST
Related Requirements: CRM-001, PRJ-001, WBS-001, DR-001, DL-001, APR-001, EVAL-001, TST-010
Source Evidence: RTM TST-010 partial; master plan Phase 3 Core ERP E2E; API/UI inventory specialized flows
Current State: Core APIs/screens exist, but complete Inquiry -> Lead -> Opportunity -> Project -> WBS -> Report/Log -> Approval -> Evidence E2E is not fully verified by tests.
Expected State: A deterministic test or staged integration suite proves the full core flow without using production secrets.
Business Impact: This is the central ERP operating system flow.
Technical Risk: Multiple modules can regress independently.
Security Impact: Confirms authorization/audit across workflow.
Data Impact: Validates relational consistency and evidence generation.
Affected Screens: Contact, inquiries, leads/opportunities, projects, daily-work, approvals, evaluations.
Affected APIs: public inquiries, admin inquiry convert, projects, WBS, daily reports/logs, approvals, evaluations.
Affected Tables: inquiries, leads, opportunities, projects, wbs_tasks, daily tables, approval tables, evaluation tables, audit_logs.
Affected Tests: New E2E/integration test suite.
Dependencies: GAP-P1-005, GAP-P2-001, GAP-P2-002.
Recommended Phase: Phase 3 - Core ERP E2E
Recommended Order: 12
Estimated Scope: L
Completion Criteria: Core E2E creates isolated test data, asserts each state transition/table link, and cleans up or runs against disposable DB.
Verification: npm test; npm run test:e2e; integration DB checks.
Out of Scope: Mobile app implementation.

### GAP-P3-002 - My Tasks self-scope and WBS output coverage

Priority: P0
Severity: MEDIUM
Primary Category: WBS
Related Requirements: TASK-001, WBS-001, MOB-F-003
Source Evidence: RTM TASK-001 implemented-no-direct-test; API_INVENTORY todos route notes; SCREEN_INVENTORY `/admin/todos` generic module
Current State: My Tasks API/UI exists but direct endpoint test and richer workflow verification are missing.
Expected State: My Tasks returns only allowed user/scope items, links WBS/output/progress, and rejects cross-user mutation.
Business Impact: Daily execution depends on trustworthy task visibility.
Technical Risk: Scope bugs can affect task ownership and mobile readiness.
Security Impact: Self-scope enforcement.
Data Impact: Protects todo_items and WBS task updates.
Affected Screens: `/admin/todos`, future mobile My Tasks.
Affected APIs: `/api/erp/todos*`, `/api/erp/wbs*`.
Affected Tables: todo_items, wbs_tasks, project_outputs.
Affected Tests: New todo/WBS scope tests.
Dependencies: GAP-P1-001, GAP-P2-003.
Recommended Phase: Phase 3 - Core ERP E2E
Recommended Order: 13
Estimated Scope: M
Completion Criteria: Tests prove own-task read/update, forbidden cross-user update, WBS output link handling.
Verification: npm test; targeted Worker tests.
Out of Scope: Full mobile My Tasks UI.

### GAP-P3-003 - Core ERP specialized UI depth for read-heavy modules

Priority: P1
Severity: MEDIUM
Primary Category: UI
Related Requirements: CRM-002, TASK-001, PRJ-001, EVAL-002
Source Evidence: SCREEN_INVENTORY GAP-UI-003; RTM generic module partial rows
Current State: Many modules use generic ModulePage table/detail, which is functional for read/detail but not always workflow-complete.
Expected State: P0/P1 core modules that need action workflows have specialized screens or action components connected to APIs.
Business Impact: Operators need efficient workflows, not only data tables.
Technical Risk: Backend capability remains underused.
Security Impact: UI should reflect permissions/actions accurately.
Data Impact: Enables controlled writes through tested UI actions.
Affected Screens: leads, opportunities, todos, news, services, selected operations modules.
Affected APIs: Corresponding admin/ERP APIs.
Affected Tables: CRM, project/WBS, news/service, todo tables.
Affected Tests: UI action tests and source contracts.
Dependencies: GAP-P1-001, GAP-P1-006.
Recommended Phase: Phase 3 - Core ERP E2E
Recommended Order: 14
Estimated Scope: L
Completion Criteria: Identified core generic modules have action inventory, permission visibility, loading/empty/error/forbidden states, and direct tests.
Verification: npm test; npm run test:e2e for representative workflows.
Out of Scope: Low-use P2 advanced dashboards.

## 8. Phase 4 - Operations

### GAP-P4-001 - Workplace module workflow completion

Priority: P1
Severity: MEDIUM
Primary Category: WORKPLACE
Related Requirements: ATT-001, LEV-001, TIME-001, MOB-F-007, MOB-F-008, MOB-F-009
Source Evidence: RTM workplace partial rows; SCREEN_INVENTORY generic ModulePage rows
Current State: Attendance, leave and timesheet APIs/tables exist, but UI is largely generic and direct tests are limited.
Expected State: Attendance punch/correction, leave request/decision, and timesheet submit/review are usable as workflows with validation and permission checks.
Business Impact: Required for real employee operations.
Technical Risk: Partial UI increases manual workaround risk.
Security Impact: Self/manage scope must be enforced.
Data Impact: Work records, leave balances and timesheets must remain consistent.
Affected Screens: `/admin/attendance`, `/admin/leave`, `/admin/timesheets`.
Affected APIs: `/api/erp/attendance*`, `/api/erp/leave*`, `/api/erp/timesheets*`.
Affected Tables: attendance_records, leave_requests, leave_balances, timesheets.
Affected Tests: New operations workflow tests.
Dependencies: GAP-P1-001, GAP-P2-001.
Recommended Phase: Phase 4 - Operations
Recommended Order: 15
Estimated Scope: L
Completion Criteria: Each workplace module has create/decision/review flow as applicable; unauthorized cross-user access fails; relevant tests pass.
Verification: npm test; e2e/admin workflow tests.
Out of Scope: Native mobile UI.

### GAP-P4-002 - Finance, budget, expense, and approval consistency

Priority: P1
Severity: HIGH
Primary Category: FINANCE
Related Requirements: BUD-001, EXP-001, DB-TXN-003, APR-001
Source Evidence: RTM BUD/EXP partial; RTM DB-TXN-003 partial; API transaction matrix
Current State: Budget and expense APIs/tables exist, expense update is transactional, but full approval/budget concurrency flow is not verified.
Expected State: Expense approval updates budget consistently and duplicate/over-budget/race cases are tested.
Business Impact: Financial data must be trustworthy before operational use.
Technical Risk: Race conditions can produce wrong balances.
Security Impact: Finance manage permission must be scoped.
Data Impact: Directly affects project_budgets and expense_requests.
Affected Screens: `/admin/budgets`, `/admin/expenses`, `/admin/approvals`.
Affected APIs: `/api/erp/budgets*`, `/api/erp/expenses*`, approval APIs.
Affected Tables: project_budgets, expense_requests, approval_documents, audit_logs.
Affected Tests: Finance transaction tests.
Dependencies: GAP-P2-002, GAP-P1-004.
Recommended Phase: Phase 4 - Operations
Recommended Order: 16
Estimated Scope: M
Completion Criteria: Budget/expense approval scenario passes; duplicate expense decision prevented; audit logs capture high-risk changes.
Verification: npm test; DB integration tests for balances.
Out of Scope: Accounting export or external ERP integration.

### GAP-P4-003 - Queue, notification, retry, and idempotency foundation

Priority: P1
Severity: HIGH
Primary Category: QUEUE
Related Requirements: NOTI-001, BE-004, BE-010, REL-005, MOB-F-010, MOB-F-011
Source Evidence: RTM TRACE-MISS-002; RTM NOTI-001/BE-010/REL-005 document-ahead
Current State: Notification and email log tables exist and inquiry email side effects exist, but Queue/DLQ/retry/idempotency foundation is not complete.
Expected State: Notification side effects are async, retryable, idempotent, and do not roll back original business writes.
Business Impact: Operators need reliable notifications without breaking core workflows.
Technical Risk: Synchronous side effects can couple external failures to business writes.
Security Impact: Push/email payloads must avoid sensitive data.
Data Impact: Delivery logs and notification records must be consistent.
Affected Screens: Notifications future UI, contact, approvals, CMS/news, evaluations.
Affected APIs: Inquiry, approval, content publish, deployment, evaluation notification triggers.
Affected Tables: notifications, email_delivery_logs, audit_logs, domain tables.
Affected Tests: Async/idempotency tests.
Dependencies: GAP-P2-002.
Recommended Phase: Phase 4 - Operations
Recommended Order: 17
Estimated Scope: XL
Completion Criteria: Queue topics/payloads/retry/DLQ policy implemented or explicitly simulated; original transaction success does not depend on external delivery success; duplicate event IDs suppressed.
Verification: npm test; queue/local worker tests where possible; production smoke after deploy.
Out of Scope: Mobile push UI until Phase 6.

### GAP-P4-004 - PII retention, masking, and deletion policy

Priority: P1
Severity: MEDIUM
Primary Category: SECURITY
Related Requirements: SEC-011, REL-006, DB data protection requirements
Source Evidence: RTM SEC-011 document-ahead; DB_INVENTORY retention notes
Current State: DB inventory records retention hints, but complete PII minimization, masking, delete/archive policy is not implemented as an operational control.
Expected State: Data classes, retention periods, masking rules, and deletion/archive procedures are documented and linked to implementation tasks.
Business Impact: Required for responsible production operations.
Technical Risk: Ad hoc retention decisions become inconsistent.
Security Impact: Reduces privacy exposure.
Data Impact: Defines safe retention/deletion for inquiries, users, audit, attachments.
Affected Screens: Contact/admin CRM, users, audit, media.
Affected APIs: CRM/user/media/audit APIs.
Affected Tables: inquiries, users, audit_logs, attachments, email_delivery_logs.
Affected Tests: Data policy checks later.
Dependencies: GAP-P4-003 for notification logs and GAP-P5-002 for files.
Recommended Phase: Phase 4 - Operations
Recommended Order: 18
Estimated Scope: M
Completion Criteria: Data retention matrix exists; no deletion behavior implemented without approved migration/runbook; sensitive fields identified for masking.
Verification: document review; source scan for PII exposure; no secret/credential output.
Out of Scope: Legal policy authorship beyond technical inventory.

## 9. Phase 5 - CMS / Global

### GAP-P5-001 - Public CMS dynamic binding and news workflow completion

Priority: P0
Severity: MEDIUM
Primary Category: CMS
Related Requirements: PUB-001, PUB-002, PUB-003, PUB-006, CMS-001, NEWS-001
Source Evidence: RTM PUB/CMS/NEWS partial rows; SCREEN_INVENTORY public/company/business static API partial; API public site-pages exists
Current State: Public content renders correctly, but company/business/home sections are partly static while CMS/site-page APIs exist. News admin workflow is partially verified.
Expected State: Public CMS responsibilities are explicit: which sections are static brand source and which are CMS-driven; news draft/translation/review/publish/archive has tests.
Business Impact: Prevents content operations confusion after launch.
Technical Risk: Static/runtime split can drift from Service Hub model.
Security Impact: Publish permissions and audit must remain high-risk protected.
Data Impact: CMS content/translations/news records align with public site output.
Affected Screens: Home, company, business, newsletter, site-content, news.
Affected APIs: public site-pages/services/news, admin contents/news/translations.
Affected Tables: services, service_content_items, service_translations, news_posts, news_post_translations, audit_logs.
Affected Tests: CMS/news workflow tests.
Dependencies: GAP-P1-004, GAP-P1-005.
Recommended Phase: Phase 5 - CMS / Global
Recommended Order: 19
Estimated Scope: L
Completion Criteria: CMS ownership map exists; chosen CMS-driven public sections use APIs; news workflow tests cover translation/publish/archive states.
Verification: npm test; public E2E; release-check sitemap/canonical.
Out of Scope: Redesigning TELOS-derived visual layout.

### GAP-P5-002 - R2 media lifecycle and private/public file policy

Priority: P1
Severity: MEDIUM
Primary Category: R2
Related Requirements: MEDIA-001, SEC-012, REL-006
Source Evidence: RTM MEDIA/SEC-012/REL-006 partial; SCREEN_INVENTORY media upload implemented; API media tables/R2 noted
Current State: Media upload API and attachments table exist, but full MIME/size/extension, signed URL, retention/version policy is partial.
Expected State: Media policy distinguishes public-media and private-erp behavior, validates file metadata, and records object keys without exposing private files.
Business Impact: Enables CMS and ERP attachments safely.
Technical Risk: File lifecycle can drift from DB references.
Security Impact: Prevents unsafe file exposure.
Data Impact: Maintains attachments to R2 object integrity.
Affected Screens: Media, CMS/news, project outputs, expense receipts.
Affected APIs: `/api/admin/media`, `/api/public/media/:id`, future private file APIs.
Affected Tables: attachments, project_outputs, expense_requests.
Affected Tests: Media upload validation tests.
Dependencies: GAP-P4-004.
Recommended Phase: Phase 5 - CMS / Global
Recommended Order: 20
Estimated Scope: M
Completion Criteria: MIME/size/extension policy tested; public/private access behavior documented; attachment DB references verified.
Verification: npm test; R2/local mocked media tests; no real secrets in tests.
Out of Scope: Bulk media migration.

### GAP-P5-003 - Public fallback, alias, and legacy QA route cleanup

Priority: P2
Severity: LOW
Primary Category: SEO
Related Requirements: PUB-006, FE-001, TST-006
Source Evidence: SCREEN_INVENTORY GAP-UI-004/GAP-UI-005; RTM DRIFT 2
Current State: Legacy browser QA files reference `.html` routes; public 404 has no Seo; `/project/:slug` alias behavior is not explicitly documented.
Expected State: QA scripts use canonical React routes; fallback/alias SEO behavior is documented and tested.
Business Impact: Reduces confusion during release verification.
Technical Risk: Obsolete tests can validate wrong assumptions.
Security Impact: None direct.
Data Impact: None.
Affected Screens: Public fallback, project detail alias, QA routes.
Affected APIs: None.
Affected Tables: None.
Affected Tests: tests/browser_qa_public.py, tests/browser_qa_erp.py, tests/e2e/public.spec.ts.
Dependencies: GAP-P5-001.
Recommended Phase: Phase 5 - CMS / Global
Recommended Order: 21
Estimated Scope: S
Completion Criteria: Legacy `.html` QA references are removed or archived; canonical alias tests pass; public fallback SEO decision documented.
Verification: npm test; python -m pytest -q tests/test_site.py; npm run test:e2e.
Out of Scope: Adding new public pages.

## 10. Phase 6 - Mobile

### GAP-P6-001 - Expo mobile shell and secure auth PoC

Priority: P1
Severity: HIGH
Primary Category: MOBILE
Related Requirements: MOB-001, MOB-F-001, SEC-004, SEC-014, BE-011
Source Evidence: RTM TRACE-MISS-001; mobile rows document-ahead
Current State: No Android/iPhone app exists; Worker APIs are candidates.
Expected State: Expo/React Native PoC authenticates using approved mobile auth contract and does not connect directly to DB or store secrets.
Business Impact: Starts mobile readiness without duplicating ERP backend.
Technical Risk: Native auth/storage choices affect long-term compatibility.
Security Impact: Secure storage, TLS, revoke policy required.
Data Impact: No direct DB access from mobile.
Affected Screens: Mobile login shell.
Affected APIs: versioned auth API.
Affected Tables: users, login_events, future device_sessions if approved.
Affected Tests: Mobile auth contract tests.
Dependencies: GAP-P1-002.
Recommended Phase: Phase 6 - Mobile
Recommended Order: 22
Estimated Scope: L
Completion Criteria: Mobile PoC login succeeds against versioned/auth contract in non-production test environment; logout/revoke policy documented; no secrets in app source.
Verification: mobile contract tests; npm test for shared API contract; manual device/simulator smoke.
Out of Scope: Store submission.

### GAP-P6-002 - Mobile core ERP workflows

Priority: P1
Severity: HIGH
Primary Category: MOBILE
Related Requirements: MOB-F-002, MOB-F-003, MOB-F-004, MOB-F-005, MOB-F-006, MOB-F-007, MOB-F-008, MOB-F-009
Source Evidence: RTM mobile API-partial rows; API_INVENTORY 55 NEEDS-MOBILE-AUTH/V1 candidates
Current State: Backend APIs exist for several workflows, but no mobile screens or contract tests prove them.
Expected State: Mobile PoC covers dashboard, My Tasks/WBS, daily report/log, approval, attendance, leave and timesheet essentials.
Business Impact: Mobile becomes useful for daily operational work.
Technical Risk: Web-only assumptions may break mobile clients.
Security Impact: Same RBAC/scope rules apply to mobile.
Data Impact: Mobile writes must use same DB rules as Web.
Affected Screens: Future mobile dashboard/tasks/report/log/approval/workplace screens.
Affected APIs: versioned ERP APIs.
Affected Tables: projects, WBS, daily tables, approvals, attendance, leave, timesheets.
Affected Tests: Mobile API and UI PoC tests.
Dependencies: GAP-P6-001, GAP-P1-001, GAP-P3-001.
Recommended Phase: Phase 6 - Mobile
Recommended Order: 23
Estimated Scope: XL
Completion Criteria: Four core mobile flows pass PoC smoke; same API contract works on Android/iPhone; no backend breaking changes.
Verification: mobile smoke; API contract tests; production-safe read smoke after release candidate.
Out of Scope: Full parity with desktop ERP.

### GAP-P6-003 - Mobile push, offline retry, and store readiness

Priority: P1
Severity: MEDIUM
Primary Category: MOBILE
Related Requirements: MOB-F-010, MOB-F-011, MOB-F-012, NOTI-001, DB-TXN-005
Source Evidence: RTM mobile document-ahead rows; TRACE-MISS-001/002
Current State: Push/offline/store release process is document-ahead.
Expected State: Push/deep link/offline draft strategy uses idempotent APIs and store release artifacts are prepared.
Business Impact: Enables reliable field/mobile use.
Technical Risk: Offline retry can duplicate writes without idempotency.
Security Impact: Push payloads must avoid sensitive data.
Data Impact: Idempotency protects duplicate mobile writes.
Affected Screens: Mobile notification/offline/store release flows.
Affected APIs: notification/push and versioned write APIs.
Affected Tables: notifications, device/session future tables, domain write tables.
Affected Tests: Push/offline contract tests.
Dependencies: GAP-P4-003, GAP-P6-001.
Recommended Phase: Phase 6 - Mobile
Recommended Order: 24
Estimated Scope: L
Completion Criteria: Push/deep link/offline retry design approved; idempotency tests pass for at least one core write; store privacy checklist drafted.
Verification: mobile contract tests; no secret scan findings.
Out of Scope: Public app store production release until Phase 8.

## 11. Phase 7 - SLO / DR

### GAP-P7-001 - Observability, performance, and SLO evidence package

Priority: P1
Severity: HIGH
Primary Category: OBSERVABILITY
Related Requirements: PERF-001 through PERF-012, REL-005, TST-008
Source Evidence: RTM TRACE-MISS-003; PERF rows document-ahead/partial; master plan Phase 7
Current State: Production health and build exist; p95/p99, Worker CPU, DB latency, 5xx, bundle size, Queue failure and SLO evidence are not complete.
Expected State: SLO dashboard/report tracks representative API p95/p99, 5xx, DB latency, Worker CPU, login failures, queue failures and bundle size.
Business Impact: Operations can detect and react to degradation.
Technical Risk: Performance regressions remain invisible.
Security Impact: Login failure monitoring supports abuse detection.
Data Impact: DB latency and query observations inform safe scaling.
Affected Screens: Global production.
Affected APIs: Representative public/auth/admin/erp/system APIs.
Affected Tables: Operational logs/metrics; no direct schema change required initially.
Affected Tests: Load smoke, release-check, performance scripts.
Dependencies: GAP-P4-003 for queue metrics.
Recommended Phase: Phase 7 - SLO / DR
Recommended Order: 25
Estimated Scope: L
Completion Criteria: Performance report includes agreed thresholds or approved exceptions; small load smoke runs without unexpected 5xx; bundle size measured.
Verification: load smoke; npm run build; npm run release:check; production read smoke.
Out of Scope: Paid plan upgrade unless metrics justify it.

### GAP-P7-002 - Rollback, restore, and DR drill runbook

Priority: P1
Severity: HIGH
Primary Category: DR
Related Requirements: REL-003, REL-004, REL-006, Phase 7/8 master plan
Source Evidence: RTM TRACE-MISS-004; BASELINE Cloudflare deployment metadata partially not verified
Current State: Migration/source baselines exist, but rollback and Neon restore drills were not performed in Phase 0.
Expected State: Runbook proves Worker rollback, Git rollback, Neon branch/restore, admin login and core smoke recovery steps.
Business Impact: Reduces downtime during incidents.
Technical Risk: Unpracticed restore steps fail under pressure.
Security Impact: Secrets must not be exposed in runbook.
Data Impact: Restore plan protects production data.
Affected Screens: Production globally.
Affected APIs: Health/auth/core ERP smoke.
Affected Tables: All production DB via restore plan.
Affected Tests: DR drill checklist and smoke tests.
Dependencies: GAP-P1-007.
Recommended Phase: Phase 7 - SLO / DR
Recommended Order: 26
Estimated Scope: M
Completion Criteria: Rollback/restore runbook exists; at least one non-production drill records timings and outcomes; production restore not performed without approval.
Verification: runbook review; non-production restore drill; production read-only health check.
Out of Scope: Destructive production restore.

### GAP-P7-003 - Long-term capacity and query optimization backlog

Priority: P2
Severity: LOW
Primary Category: PERFORMANCE
Related Requirements: PERF-006, PERF-008, PERF-009, PERF-011, PERF-012
Source Evidence: RTM performance P2 rows; DB_INVENTORY index tuning explicitly out of P0-002 scope
Current State: Indexes exist, but EXPLAIN/N+1/load/capacity analysis is not performed.
Expected State: Representative queries and payloads are profiled after real workload patterns are known.
Business Impact: Avoids premature optimization while preserving a clear future path.
Technical Risk: Scale bottlenecks can emerge with usage.
Security Impact: None direct.
Data Impact: Query optimization should not alter schema without migration.
Affected Screens: High-volume list/dashboard pages.
Affected APIs: Representative read/list APIs.
Affected Tables: projects, WBS, approvals, inquiries, news, operations tables.
Affected Tests: Load/performance scripts.
Dependencies: GAP-P7-001.
Recommended Phase: Phase 7 - SLO / DR
Recommended Order: 27
Estimated Scope: M
Completion Criteria: Capacity profile identifies top queries/payloads; optimization tasks are separated into approved follow-up work.
Verification: EXPLAIN on non-production branch; load smoke; bundle size report.
Out of Scope: Speculative index creation in production.

## 12. Phase 8 - Go-Live

### GAP-P8-001 - Production write smoke and final release gate

Priority: P1
Severity: HIGH
Primary Category: PRODUCTION
Related Requirements: TST-010, Phase 8 master plan, Master Definition of Done
Source Evidence: RTM TST-010 partial; P0 read-only inventories did not perform production write smoke
Current State: Phase 0 verified read-only health/public/auth boundaries; write smoke was intentionally out of scope.
Expected State: Approved production smoke verifies login, inquiry, dashboard, core ERP write flow, audit, and rollback readiness without exposing secrets.
Business Impact: Final confidence before go-live or major handoff.
Technical Risk: Write-only failures can remain hidden until real use.
Security Impact: Confirms auth/RBAC/audit in production.
Data Impact: Must use controlled test records and cleanup/marking policy.
Affected Screens: Login, contact, dashboard, core ERP screens.
Affected APIs: public inquiry, auth, core ERP writes, audit reads.
Affected Tables: controlled production test rows across core flow.
Affected Tests: Production smoke checklist.
Dependencies: Phase 1-7 backlog items relevant to go-live.
Recommended Phase: Phase 8 - Go-Live
Recommended Order: 28
Estimated Scope: M
Completion Criteria: Go-live checklist 100%; health 200/database connected; controlled write smoke records traceable and audited; no unexpected 5xx.
Verification: npm run release:check; production smoke checklist; Cloudflare/Neon logs reviewed without secret output.
Out of Scope: Unapproved production data mutation before go-live window.

### GAP-P8-002 - 72h stabilization, owner handoff, and exact reference data verification

Priority: P1
Severity: MEDIUM
Primary Category: RELIABILITY
Related Requirements: REL-001, REL-002, REL-003, REL-004, TST-010
Source Evidence: RTM current production verification 28%; DB_INVENTORY GAP-DB-003; master plan Phase 8 72h monitoring
Current State: P0 recorded baseline and estimated row counts; no stabilization/handoff evidence yet.
Expected State: 72h monitoring tracks 5xx/login/inquiry/DB/queue/mobile crash as applicable; owners and runbooks are signed off; exact reference data counts are checked where safe.
Business Impact: Formalizes operational ownership.
Technical Risk: Issues after handoff can lack clear owner.
Security Impact: Owner handoff includes secret rotation policy.
Data Impact: Reference data integrity is verified without broad production count load.
Affected Screens: Production globally.
Affected APIs: Health/auth/inquiry/core ERP.
Affected Tables: roles, permissions, schema_migrations, key seed/reference tables.
Affected Tests: Go-live/stabilization checklist.
Dependencies: GAP-P8-001.
Recommended Phase: Phase 8 - Go-Live
Recommended Order: 29
Estimated Scope: M
Completion Criteria: 72h stabilization report records Critical 0; owners/runbooks approved; targeted exact counts match expected reference data.
Verification: production monitoring report; read-only DB reference queries; git status clean before final release tag.
Out of Scope: Broad production analytics rollout.

## 13. Test Gap Summary

- API direct test coverage is 40/124, with 84 contracts lacking direct endpoint tests. This is consolidated into GAP-P1-005 rather than creating 84 separate items.
- UI direct test coverage is 25/48 route entries. Common UI state and protected-route issues are consolidated into GAP-P1-006 and GAP-P3-003.
- Core ERP E2E is consolidated into GAP-P3-001.
- Mobile API tests are consolidated into GAP-P6-001 through GAP-P6-003.
- Load/performance tests are consolidated into GAP-P7-001 and GAP-P7-003.

## 14. Security Gap Summary

- No confirmed secret exposure was found in Phase 0.
- No confirmed auth bypass was found in Phase 0.
- Highest-risk security backlog is permission/scope consistency, high-risk audit coverage, origin/rate/api-abuse expansion, and mobile auth boundary.
- Phase 1 must not weaken hashing, RBAC, origin checks, cookie security, rate limits, or audit behavior to close gaps.

## 15. Mobile Gap Summary

Backend foundation:

- GAP-P1-002 defines Web/mobile auth and API versioning.
- GAP-P2-002 defines idempotency for retry-sensitive writes.
- GAP-P4-003 defines notification/queue/idempotency boundary.

Mobile app:

- GAP-P6-001 builds mobile auth PoC.
- GAP-P6-002 builds core workflow PoC.
- GAP-P6-003 prepares push/offline/store readiness.

## 16. Deferred / P2 Items

- GAP-P2-004 DB function ownership and targeted counts.
- GAP-P5-003 public fallback/alias and legacy QA cleanup.
- GAP-P7-003 long-term capacity/query optimization.
- Selected performance rows such as broad load/capacity and bundle optimization remain P2 until workload evidence requires escalation.

## 17. Phase 0 Completion Summary

| Phase 0 item | Artifact | Status |
|---|---|---|
| P0-001 | BASELINE.md | COMPLETE |
| P0-002 | DB_INVENTORY.md | COMPLETE |
| P0-003 | API_INVENTORY.md | COMPLETE |
| P0-004 | SCREEN_INVENTORY.md | COMPLETE |
| P0-005 | RTM.md | COMPLETE |
| P0-006 | BACKLOG.md | COMPLETE |

Phase 0 Exit Criteria:

- Current Git/Production/DB/API/UI baselines are documented.
- Requirement -> Screen -> API -> DB -> Test traceability is documented.
- P0 requirement traceability has no fully unmapped requirement.
- Gap backlog is root-cause merged and assigned to Phase 1 through Phase 8.
- Phase 1 first backlog item is selected: GAP-P1-001.

## 18. P0-006 Exit Criteria

- [x] Î™®Îì† gap candidate ?òÏßë
- [x] Ï§ëÎ≥µ ?úÍ±∞
- [x] root cause Í∏∞Ï? Î≥ëÌï©
- [x] category ?ïÏ†ï
- [x] P0/P1/P2 Í≥µÏãù ?ïÏ†ï
- [x] severity ?ïÏ†ï
- [x] requirement ?∞Í≤∞
- [x] screen/API/DB/test evidence ?∞Í≤∞
- [x] dependency Î∂ÑÏÑù
- [x] estimated scope
- [x] completion criteria
- [x] verification method
- [x] Phase 1~8 Î∞∞Ï†ï
- [x] Phase 1 ?ÅÏÑ∏ ?úÏÑú
- [x] Test gap ?µÌï©
- [x] UI gap ?µÌï©
- [x] API gap ?µÌï©
- [x] DB gap ?µÌï©
- [x] Mobile gap ?µÌï©
- [x] Operational gap ?µÌï©
- [x] Phase Exit mapping
- [x] summary ?´Ïûê Í≥ÑÏÇ∞
- [x] Phase 1 Ï≤??ëÏóÖ ?†Ï†ï
- [x] BACKLOG.md ?ùÏÑ±
- [x] source/API/DB/Cloudflare write 0

## Phase 1 Final Closeout Addendum - 2026-08-13

This addendum closes the Phase 1 Auth / Platform backlog items against production evidence. Phase 2 backlog items are not changed.

| Backlog item | Closeout status | Evidence |
|---|---|---|
| GAP-P1-001 RBAC scope and permission contract audit | IMPLEMENTED / VERIFIED / PRODUCTION PASS | `AUTHORIZATION_MATRIX.md`, `PERMISSION_UX_MATRIX.md`, worker/security/react/E2E gates PASS |
| GAP-P1-002 Web/mobile auth boundary and API versioning strategy | IMPLEMENTED / VERIFIED / PRODUCTION PASS | Legacy Web auth retained; `/api/v1/auth/*` mobile lifecycle PASS |
| GAP-P1-003 Origin, CORS, rate-limit, and API abuse policy hardening | IMPLEMENTED / VERIFIED / PRODUCTION PASS | Trusted-origin fail-closed, exact CORS, mobile bearer/no-origin, rate/security tests PASS |
| GAP-P1-004 High-risk audit coverage policy | IMPLEMENTED / VERIFIED / PRODUCTION PASS | `AUDIT_POLICY.md`; `AUDIT_MATRIX.md` FULL global audit 54, no identified high-risk unaudited writes |
| GAP-P1-005 API contract and security regression test foundation | IMPLEMENTED / VERIFIED / PRODUCTION PASS | API contract 7/7, security 29/29, worker 57/57, E2E 91/91 |
| GAP-P1-006 Admin forbidden and permission-aware UX state | IMPLEMENTED / VERIFIED / PRODUCTION PASS | `PERMISSION_UX_MATRIX.md`, React 31/31, E2E protected-route checks PASS |
| GAP-P1-007 Production config, Worker build, and deploy identity verification | IMPLEMENTED / VERIFIED / PRODUCTION PASS | Worker `jinbizman`, version `3eb23635-875c-4036-8b38-d5bd737548e7`, production health 200 |

Known deferred non-blocker: apex `https://jinbizman.com` currently returns 200 directly instead of canonical `www` redirect. This is deferred to Phase 5 SEO/Global or Phase 8 Domain/SSL/SEO verification and is not a Phase 1 Auth / Platform blocker.

## P2-001 Constraint Audit Result - 2026-08-13

Audit artifact: `DB_CONSTRAINT_AUDIT.md`.

P2-001 audit status: IMPLEMENTED / VERIFIED for audit-only scope.

Remediation remains open:

| Gap | Severity | Status | Required follow-up |
|---|---|---|---|
| P2-001-GAP-001 `timesheets.wbs_task_id` nullable despite WBS-linked time-record requirement | P0 | GAP | P2-001 Remediation Batch 1 |
| P2-001-GAP-002 122/151 FK constraints lack matching child-side leading index | P1 | RISK | Index remediation batch, no audit-time migration |
| P2-001-GAP-003 polymorphic target/source references are application-guarded | P1 | PARTIAL | Application/data consistency review |
| P2-001-GAP-004 translation public slug uniqueness policy not fully DB-constrained | P1 | PARTIAL | CMS slug policy batch |
| P2-001-GAP-005 service domain canonical/global policy not fully DB-constrained | P1 | PARTIAL | Domain policy batch |

Current Production data violations detected by P2-001 read-only scans: 0.

## P2-001 Remediation Batch 1 Result - 2026-08-13

Scope: only the P0 nullable timesheet WBS reference gap.

| Gap | Severity | Status | Evidence |
|---|---|---|---|
| P2-001-GAP-001 `timesheets.wbs_task_id` nullable despite WBS-linked time-record requirement | P0 | REMEDIATED / VERIFIED | Migration `015_timesheets_wbs_required.sql`; create validation rejects missing/null WBS; pre-migration null count 0 |
| P2-001-GAP-002 122/151 FK constraints lack matching child-side leading index | P1 | RISK | Deferred to P2-005 Index Tuning |
| P2-001-GAP-003 polymorphic target/source references are application-guarded | P1 | PARTIAL | Deferred application/data consistency review |
| P2-001-GAP-004 translation public slug uniqueness policy not fully DB-constrained | P1 | PARTIAL | Deferred CMS slug policy batch |
| P2-001-GAP-005 service domain canonical/global policy not fully DB-constrained | P1 | PARTIAL | Deferred domain policy batch |

Remaining P2-001 gap counts after Batch 1 target state:

- P0: 0
- P1: 4
- P2: 0

## P2-002 Transaction Audit Result - 2026-08-14

Audit artifact: `TRANSACTION_AUDIT.md`.

P2-002 audit status: IMPLEMENTED / VERIFIED for audit-only scope.

No DB write, migration, source code change, manual deploy, DNS change, or production login was performed.

Production read-only inconsistency scan detected current data corruption: 0.

Remediation remains open:

| Gap | Severity | Status | Required follow-up |
|---|---|---|---|
| P2-002-GAP-001 approval action is sequential across `approval_actions`, `approval_lines`, `approval_documents`, and optional `wbs_tasks` | P0 | GAP | P2-002 Remediation Batch 1 |
| P2-002-GAP-002 expense status/budget update uses stale pre-read status and lacks expected-status guard | P0 | GAP | P2-002 Remediation Batch 1 |
| P2-002-GAP-003 project creation persists project before owner member insert | P1 | GAP | Later transaction remediation batch |
| P2-002-GAP-004 service bootstrap/domain sync uses sequential writes | P1 | GAP | Later transaction remediation batch |
| P2-002-GAP-005 leave approval/balance checks are not fully guarded in the update predicate | P1 | PARTIAL | Later transaction/concurrency remediation |
| P2-002-GAP-006 evaluation finalize readiness is checked before the finalizing update | P1 | PARTIAL | Later transaction/concurrency remediation |
| P2-002-GAP-007 inquiry conversion CTE lacks a DB uniqueness guarantee for `leads.inquiry_id` | P1 | PARTIAL | Later idempotency/constraint remediation |
| P2-002-GAP-008 transaction failure/race test coverage is missing | P1 | TEST_GAP | Add targeted tests before remediation |
| P2-002-GAP-009 audit writes are best-effort and outside business transactions | P2 | PARTIAL | Keep or formalize policy |
| P2-002-GAP-010 public inquiry notification is async/best-effort | P2 | PARTIAL | Future queue/idempotency work |

Remaining P2-002 gap counts:

- P0: 2
- P1: 6
- P2: 2

## P2-002 Remediation Batch 1 Result - 2026-08-14

Scope: only P2-002-GAP-001 approval action atomicity/idempotency.

| Gap | Severity | Status | Evidence |
|---|---|---|---|
| P2-002-GAP-001 approval action is sequential across `approval_actions`, `approval_lines`, `approval_documents`, and optional `wbs_tasks` | P0 | REMEDIATED / VERIFIED | `applyApprovalActionAtomic()` runs action insert, pending-line update, document status update, and optional WBS marker in one guarded SQL CTE statement; duplicate/concurrent second action returns no mutation result |
| P2-002-GAP-002 expense status/budget update uses stale pre-read status and lacks expected-status guard | P0 | GAP | Remains open for P2-002 Remediation Batch 2 |
| P2-002-GAP-003 project creation persists project before owner member insert | P1 | GAP | Unchanged |
| P2-002-GAP-004 service bootstrap/domain sync uses sequential writes | P1 | GAP | Unchanged |
| P2-002-GAP-005 leave approval/balance checks are not fully guarded in the update predicate | P1 | PARTIAL | Unchanged |
| P2-002-GAP-006 evaluation finalize readiness is checked before the finalizing update | P1 | PARTIAL | Unchanged |
| P2-002-GAP-007 inquiry conversion CTE lacks a DB uniqueness guarantee for `leads.inquiry_id` | P1 | PARTIAL | Unchanged |
| P2-002-GAP-008 transaction failure/race test coverage is missing | P1 | TEST_GAP | Partially improved for approval action; broader transaction test gaps remain |
| P2-002-GAP-009 audit writes are best-effort and outside business transactions | P2 | PARTIAL | Policy unchanged |
| P2-002-GAP-010 public inquiry notification is async/best-effort | P2 | PARTIAL | Unchanged |

Remaining P2-002 gap counts after Batch 1 target state:

- P0: 1
- P1: 6
- P2: 2

## P2-002 Remediation Batch 2 Result - 2026-08-14

Scope: only P2-002-GAP-002 expense/budget stale-status race and partial commit risk.

| Gap | Severity | Status | Evidence |
|---|---|---|---|
| P2-002-GAP-001 approval action is sequential across `approval_actions`, `approval_lines`, `approval_documents`, and optional `wbs_tasks` | P0 | REMEDIATED / VERIFIED | Closed in Batch 1 |
| P2-002-GAP-002 expense status/budget update uses stale pre-read status and lacks expected-status guard | P0 | REMEDIATED / VERIFIED | `applyExpenseBudgetTransitionAtomic()` runs expense status transition and budget amount effects in one guarded SQL CTE statement using the DB current status and canonical `total_amount`; duplicate/concurrent second transition returns no mutation result |
| P2-002-GAP-003 project creation persists project before owner member insert | P1 | GAP | Unchanged |
| P2-002-GAP-004 service bootstrap/domain sync uses sequential writes | P1 | GAP | Unchanged |
| P2-002-GAP-005 leave approval/balance checks are not fully guarded in the update predicate | P1 | PARTIAL | Unchanged |
| P2-002-GAP-006 evaluation finalize readiness is checked before the finalizing update | P1 | PARTIAL | Unchanged |
| P2-002-GAP-007 inquiry conversion CTE lacks a DB uniqueness guarantee for `leads.inquiry_id` | P1 | PARTIAL | Unchanged |
| P2-002-GAP-008 transaction failure/race test coverage is missing | P1 | TEST_GAP | Improved for approval and expense/budget; broader transaction test gaps remain |
| P2-002-GAP-009 audit writes are best-effort and outside business transactions | P2 | PARTIAL | Policy unchanged |
| P2-002-GAP-010 public inquiry notification is async/best-effort | P2 | PARTIAL | Unchanged |

Remaining P2-002 gap counts after Batch 2 target state:

- P0: 0
- P1: 6
- P2: 2

## P2-003 Concurrency / Idempotency Audit Result - 2026-08-14

Audit artifact: `CONCURRENCY_IDEMPOTENCY_AUDIT.md`.

P2-003 audit status: IMPLEMENTED / VERIFIED for audit-only scope.

No DB write, migration, source code change, manual deploy, DNS change, production login, or production business action was performed.

Production read-only duplicate scan detected current duplicate corruption: 0.

Remediation remains open:

| Gap | Severity | Status | Required follow-up |
|---|---|---|---|
| P2-003-GAP-001 leave decision can double-deduct annual balance on duplicate/concurrent approval | P0 | GAP | P2-003 Remediation Batch 1 |
| P2-003-GAP-002 public inquiry create lacks application idempotency/dedupe | P1 | GAP | Later idempotency remediation |
| P2-003-GAP-003 inquiry conversion lacks DB uniqueness on `leads.inquiry_id` | P1 | PARTIAL | Later idempotency/constraint remediation |
| P2-003-GAP-004 expense create can duplicate financial requests on mobile retry | P1 | GAP | Later explicit idempotency remediation |
| P2-003-GAP-005 approval document create can duplicate document/lines on retry | P1 | GAP | Later explicit idempotency remediation |
| P2-003-GAP-006 leave request duplicate/overlap policy is not DB- or app-enforced | P1 | POLICY_GAP | Define policy, then remediate |
| P2-003-GAP-007 attendance correction decision has stale pre-read without update predicate | P1 | PARTIAL | Later state-guard remediation |
| P2-003-GAP-008 evaluation finalize readiness/status is pre-read before update | P1 | PARTIAL | Later guarded finalize remediation |
| P2-003-GAP-009 project/service bootstrap creates are not retry-safe across all side effects | P1 | GAP | Later create/bootstrap idempotency remediation |
| P2-003-GAP-010 resource allocation percentage cap can race | P1 | PARTIAL | Later atomic cap guard |
| P2-003-GAP-011 service deployment request can duplicate requested history | P1 | GAP | Add source/version idempotency before external deploy integration |
| P2-003-GAP-012 async notification/email event dedupe is incomplete | P2 | PARTIAL | Future queue/event idempotency work |
| P2-003-GAP-013 low-risk admin/editor creates are duplicate-by-design | P2 | NOT APPLICABLE | No remediation unless product policy changes |

Remaining P2-003 gap counts:

- P0: 1
- P1: 10
- P2: 2

## P2-003 Remediation Batch 1 Result - 2026-08-14

Scope: only P2-003-GAP-001 leave duplicate/concurrent approval double-deduction.

| Gap | Severity | Status | Evidence |
|---|---|---|---|
| P2-003-GAP-001 leave decision can double-deduct annual balance on duplicate/concurrent approval | P0 | REMEDIATED / VERIFIED | `applyLeaveDecisionAtomic()` runs leave status change and annual balance deduction in one guarded SQL CTE using DB canonical `requested_days`, expected status, sufficient-balance predicate, and atomic `used_days = used_days + requested_days`; duplicate/stale requests return conflict and do not mutate balance |
| P2-003-GAP-002 public inquiry create lacks application idempotency/dedupe | P1 | GAP | Unchanged |
| P2-003-GAP-003 inquiry conversion lacks DB uniqueness on `leads.inquiry_id` | P1 | PARTIAL | Unchanged |
| P2-003-GAP-004 expense create can duplicate financial requests on mobile retry | P1 | GAP | Unchanged |
| P2-003-GAP-005 approval document create can duplicate document/lines on retry | P1 | GAP | Unchanged |
| P2-003-GAP-006 leave request duplicate/overlap policy is not DB- or app-enforced | P1 | POLICY_GAP | Unchanged |
| P2-003-GAP-007 attendance correction decision has stale pre-read without update predicate | P1 | PARTIAL | Unchanged |
| P2-003-GAP-008 evaluation finalize readiness/status is pre-read before update | P1 | PARTIAL | Unchanged |
| P2-003-GAP-009 project/service bootstrap creates are not retry-safe across all side effects | P1 | GAP | Unchanged |
| P2-003-GAP-010 resource allocation percentage cap can race | P1 | PARTIAL | Unchanged |
| P2-003-GAP-011 service deployment request can duplicate requested history | P1 | GAP | Unchanged |
| P2-003-GAP-012 async notification/email event dedupe is incomplete | P2 | PARTIAL | Unchanged |
| P2-003-GAP-013 low-risk admin/editor creates are duplicate-by-design | P2 | NOT APPLICABLE | Unchanged |

Remaining P2-003 gap counts after Batch 1 target state:

- P0: 0
- P1: 10
- P2: 2

## P2-004 Query Inventory Result - 2026-08-14

Audit artifact: `QUERY_CATALOG.md`.

P2-004 audit status: IMPLEMENTED / VERIFIED for inventory-only scope.

No DB write, migration, index change, source code change, manual deploy, DNS change, production login, or production business action was performed.

Query inventory summary:

- API contracts reviewed: 128
- Unique API paths reviewed: 96
- Direct Worker SQL templates extracted: 173
- Production tables: 72
- Production indexes: 422
- P2-005 EXPLAIN candidate queries: 15

Remediation remains open:

| Gap | Severity | Status | Required follow-up |
|---|---|---|---|
| P2-004-GAP-001 todo list route performs WBS-to-todo synchronization on read path | P1 | GAP | P2-005 EXPLAIN baseline and possible query/index/refactor decision |
| P2-004-GAP-002 dashboard aggregate COUNT patterns may scan large tables at target scale | P1 | GAP | P2-005 EXPLAIN dashboard aggregate queries |
| P2-004-GAP-003 project list WBS aggregate/grouping is sensitive to the 500,000 WBS target | P1 | GAP | P2-005 EXPLAIN and index review |
| P2-004-GAP-004 audit/log listing must be verified against the 5,000,000-row retention target | P1 | GAP | P2-005 EXPLAIN audit/log filters and order |
| P2-004-GAP-005 evaluation readiness/finalize count checks need plan validation | P1 | GAP | P2-005 EXPLAIN count subqueries |
| P2-004-GAP-006 public locale aggregate/UNION is on a public traffic path | P1 | GAP | P2-005 EXPLAIN and cache/materialization review if needed |
| P2-004-GAP-007 resource allocation cap-check sum is partially indexed and should be baseline-tested | P1 | GAP | P2-005 EXPLAIN allocation sum |
| P2-004-GAP-008 small config lists are intentionally unbounded today | P2 | PARTIAL | Add caps only if config tables become user-growth tables |
| P2-004-GAP-009 low-frequency service bootstrap/helper loops are not primary hotspots | P2 | PARTIAL | Keep as low-priority optimization note |
| P2-004-GAP-010 some admin lists use hard caps instead of full cursor pagination | P2 | PARTIAL | Product/UX pagination improvement later |

Remaining P2-004 gap counts:

- P0: 0
- P1: 7
- P2: 3

## P2-005 Index Tuning / EXPLAIN Baseline Result - 2026-08-14

Baseline artifact: `INDEX_TUNING_BASELINE.md`.

P2-005 EXPLAIN baseline status: IMPLEMENTED / VERIFIED for analysis-only scope.

No DB write, CREATE INDEX, DROP INDEX, migration, source code change, manual deploy, DNS change, production login, or production business action was performed.

EXPLAIN coverage:

- HIGH: 6 / 6
- MEDIUM: 6 / 6
- LOW: 3 / 3
- Total: 15 / 15

Index remediation candidates:

| Candidate | Severity | Status | Required follow-up |
|---|---|---|---|
| IDX-P2-005-001 news public list index on `news_posts(status, is_pinned DESC, published_at DESC)` | P1 | APPLIED / VERIFIED | Migration `016_news_posts_list_index.sql`; BEFORE plan used `ix_news_posts_status` plus Sort, AFTER plan uses `ix_news_posts_status_pinned_published_at` with no Sort |
| IDX-P2-005-002 approval list index on `approval_documents(updated_at DESC)` | P1 | APPLIED / VERIFIED | Migration `017_approval_documents_updated_at_index.sql`; current 0-row table still plans Seq Scan + Sort, but the index structurally supports the actual `ORDER BY updated_at DESC LIMIT 200` route |
| IDX-P2-005-003 expense global list index on `expense_requests(expense_date DESC, id DESC)` | P1 | PROPOSED | Later P2-005 remediation batch |

Query rewrite candidates retained outside index remediation:

| Query | Severity | Status | Required follow-up |
|---|---|---|---|
| Q-ERP-006 todo WBS sync/list read-path mutation | P1 | QUERY_REWRITE_CANDIDATE | Later query-structure remediation |
| Q-ADM-001 dashboard aggregate counts | P1 | QUERY_REWRITE_CANDIDATE | Later dashboard summary/cache review |
| Q-ADM-003 project/WBS aggregate list | P1 | QUERY_REWRITE_CANDIDATE | Later project/WBS query rewrite review |
| Q-PUB-001 public locale aggregate | P1 | QUERY_REWRITE_CANDIDATE | Later public cache/query rewrite review |

Deferred/no-change results:

- P0 index candidates: 0
- P1 proposed index candidates: 3
- P2 proposed index candidates: 0
- Existing-index-sufficient candidates: 4
- Deferred-until-scale candidates: 2
- No-change candidates: 2
