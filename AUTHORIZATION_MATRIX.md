# JINBIZ MANAGEMENT Authorization Matrix

## 1. Snapshot

- Date: 2026-08-12
- Git HEAD at start: `6e13881fe4db818eafa7b73da9d2d84afcccc127`
- Source: `API_INVENTORY.md`, Worker source, Phase 0 backlog `GAP-P1-001`
- Scope vocabulary: `global`, `service`, `project`, `team`, `self`, `scope-based`, `not-applicable`
- Protected contracts covered: 111 (`/api/admin/*`, `/api/erp/*`, `/api/system/*`, excluding anonymous `GET /api/system/business-domains`)

## 2. Enforcement Contract

- Authentication: every protected contract resolves `AuthUser` from Bearer token or `jinbiz_session` cookie.
- Permission: every protected contract has an explicit permission code or documented permission alternative.
- Scope: permission decides what action is allowed; scope decides which resource instance is allowed.
- Super admin: role `super_admin` and `system.update` retain global scope bypass for RBAC only. Business validation, malformed input, missing resource, and invalid state are not bypassed.
- Denial: unauthenticated requests return `401`; authenticated permission or scope denials return `403`; missing resources keep existing `404` behavior.

## 3. Scope Resolvers

| Scope | Resource | Resolver | Global bypass | Expected denial | Tests |
|---|---|---|---|---|---|
| global | system-wide object | permission only | `super_admin`, `system.update` where applicable | 403 without permission | `tests/worker/authorization.test.mjs` |
| service | `service_id` | `services.operator_user_id`, `services.tech_owner_user_id`, `services.owner_department_id` | `super_admin`, `system.update` | 403 outside service | `tests/worker/authorization.test.mjs` |
| project | `project_id` | active `project_members(project_id, user_id)` | `super_admin`, `system.update`; role-specific global roles where stated | 403 outside project | `tests/worker/authorization.test.mjs` |
| team | `target_user_id` | same active `users.department_id` | `super_admin`, `system.update`, `hr_evaluator`, `executive_admin` | 403 outside team | `tests/worker/authorization.test.mjs` |
| self | `auth.id` | resource `user_id = auth.id` | explicit manage permission or global bypass | 403 for foreign user | `tests/worker/authorization.test.mjs` |
| scope-based | mixed | route-specific resolver below | route-specific | 403 outside resolved scope | `tests/worker/authorization.test.mjs` |

## 4. Admin Contracts

| Method | Path | Handler | Authentication | Permission | Scope | Resource | Scope Resolver | Super Admin | Expected Denial | Test |
|---|---|---|---|---|---|---|---|---|---|---|
| GET | `/api/admin/dashboard` | `adminDashboardRoute` | required | `project.read` | global | dashboard aggregate | permission | bypass | 403 | source + worker regression |
| GET | `/api/admin/services` | `adminServicesRoute` | required | `service.read` | service/global | service list | service ownership filter unless global | bypass | 403/filter | source + worker regression |
| POST | `/api/admin/services` | `adminServiceCreateRoute` | required | `service.create` | global/self | new service | creator becomes `operator_user_id` | bypass | 403 | source + worker regression |
| PATCH | `/api/admin/services/:id` | `adminServiceUpdateRoute` | required | `service.update` | service | `service_id` | `assertServiceScope` | bypass | 403 | source + worker regression |
| GET | `/api/admin/services/:id/content-types` | `adminContentTypesRoute` | required | `content.read` | service | `service_id` | `assertServiceScope` | bypass | 403 | source + worker regression |
| GET | `/api/admin/services/:id/domains` | `adminServiceDomainsRoute` | required | `service.read` | service | `service_id` | `assertServiceScope` | bypass | 403 | source + worker regression |
| GET | `/api/admin/services/:id/changes` | `adminServiceChangesRoute` | required | `service.read` | service | `service_id` | `assertServiceScope` | bypass | 403 | source + worker regression |
| POST | `/api/admin/services/:id/domains` | `serviceDomainCreateRoute` | required | `service.update` | service | `service_id` | `assertServiceScope` | bypass | 403 | source + worker regression |
| GET | `/api/admin/contents` | `adminContentsRoute` | required | `content.read` | service/global | `service_id` query or visible services | `assertServiceScope` for explicit service, otherwise ownership filter | bypass | 403/filter | source + worker regression |
| POST | `/api/admin/contents` | `adminContentCreateRoute` | required | `content.create` | service | body `serviceId` | `assertServiceScope` | bypass | 403 | source + worker regression |
| PATCH | `/api/admin/contents/:id` | `adminContentUpdateRoute` | required | `content.update` or `content.publish` | service | content row `service_id` | `assertServiceScope` | bypass | 403 | source + worker regression |
| POST/PATCH/PUT | `/api/admin/contents/:id/translations/:locale` | `adminTranslationUpsertRoute` | required | `translation.update` or `translation.publish` | service | parent content row `service_id` | `assertServiceScope` | bypass | 403 | source + worker regression |
| GET | `/api/admin/news` | `adminNewsRoute` | required | `news.read` | global | news list | permission | bypass | 403 | source + worker regression |
| POST | `/api/admin/news` | `adminNewsCreateRoute` | required | `news.create` | service/global | optional body `serviceId` | `assertServiceScope` when service-bound | bypass | 403 | source + worker regression |
| PATCH | `/api/admin/news/:id` | `adminNewsUpdateRoute` | required | `news.update` or `news.publish` | service/global | news row `service_id` | `assertServiceScope` when service-bound | bypass | 403 | source + worker regression |
| POST/PATCH/PUT | `/api/admin/news/:id/translations/:locale` | `adminNewsTranslationUpsertRoute` | required | `news.update` or `news.publish` | service/global | parent news row `service_id` | `assertServiceScope` when service-bound | bypass | 403 | source + worker regression |
| GET | `/api/admin/inquiries` | `adminInquiriesRoute` | required | `inquiry.read` | global | inquiries | permission | bypass | 403 | source + worker regression |
| PATCH | `/api/admin/inquiries/:id` | `adminInquiryUpdateRoute` | required | `inquiry.update` | global | inquiry | permission | bypass | 403 | source + worker regression |
| POST | `/api/admin/inquiries/:id/convert` | `adminInquiryConvertRoute` | required | `lead.create` | service/global | inquiry plus optional service | `assertServiceScope` when service-bound | bypass | 403 | source + worker regression |
| GET | `/api/admin/leads` | `adminLeadsRoute` | required | `inquiry.read` or `lead.update` or `opportunity.manage` | global | leads | permission alternatives | bypass | 403 | source + worker regression |
| GET | `/api/admin/opportunities` | `adminOpportunitiesRoute` | required | `opportunity.manage` | global | opportunities | permission | bypass | 403 | source + worker regression |
| GET | `/api/admin/projects` | `adminProjectsRoute` | required | `project.read` | project/global | project list | project membership filter unless global | bypass | 403/filter | source + worker regression |
| GET | `/api/admin/wbs` | `adminWbsRoute` | required | `wbs.read` | project | query `projectId` | `assertProjectScope` | bypass | 403 | source + worker regression |
| GET | `/api/admin/wbs-templates` | `adminWbsTemplatesRoute` | required | `wbs.read` | global | templates | permission | bypass | 403 | source + worker regression |
| GET | `/api/admin/approvals` | `adminApprovalsRoute` | required | `approval.read` | scope-based | approvals | requester, approver line, project membership, service ownership filter | bypass | 403/filter | source + worker regression |
| GET | `/api/admin/approvals/:id` | `adminApprovalDetailRoute` | required | `approval.read` | scope-based | approval doc | requester, approver line, project membership, or service ownership | bypass | 403 | source + worker regression |
| GET | `/api/admin/evaluations` | `adminEvaluationsRoute` | required | `evaluation.read` | global | cycles | permission | bypass | 403 | source + worker regression |
| GET | `/api/admin/evaluations/items` | `adminEvaluationItemsRoute` | required | `evaluation.read` | global | cycle items | permission | bypass | 403 | source + worker regression |
| GET | `/api/admin/departments` | `adminDepartmentsRoute` | required | `user.read` | global | departments | permission | bypass | 403 | source + worker regression |
| POST | `/api/admin/departments` | `departmentCreateRoute` | required | `system.update` | global | departments | permission | bypass | 403 | source + worker regression |
| GET | `/api/admin/roles` | `adminRolesRoute` | required | `role.read` | global | roles | permission | bypass | 403 | source + worker regression |
| POST | `/api/admin/roles` | `roleCreateRoute` | required | `system.update` | global | roles | permission | bypass | 403 | source + worker regression |
| GET | `/api/admin/permissions` | `adminPermissionsRoute` | required | `role.read` | global | permissions | permission | bypass | 403 | source + worker regression |
| GET | `/api/admin/users` | `adminUsersRoute` | required | `user.read` or `approval.create` or `evaluation.read` | global/team | users | `user.read` sees all, approval/evaluation helper access filters to department | bypass | 403/filter | source + worker regression |
| GET | `/api/admin/login-events` | `adminLoginEventsRoute` | required | `audit.read` | global | login events | permission | bypass | 403 | source + worker regression |
| GET | `/api/admin/operations-summary` | `adminOperationsSummaryRoute` | required | `project.read` | global | operations aggregate | executive/admin aggregate contract | bypass | 403 | source + worker regression |
| POST | `/api/admin/media` | `adminMediaUploadRoute` | required | `content.update` | service | form `serviceId` | `assertServiceScope` before R2 write | bypass | 403 | source + worker regression |
| GET | `/api/admin/service-deployments` | `serviceDeploymentsRoute` | required | `service.read` | service/global | service deployments | explicit `serviceId` uses `assertServiceScope`; otherwise ownership filter | bypass | 403/filter | source + worker regression |
| POST | `/api/admin/service-deployments` | `serviceDeploymentsRoute` | required | `service.update` | service | body `serviceId` | `assertServiceScope` | bypass | 403 | source + worker regression |
| GET | `/api/admin/site-banners` | `siteBannersRoute` | required | `content.read` | service/global | site banners | service ownership filter unless global | bypass | 403/filter | source + worker regression |
| POST | `/api/admin/site-banners` | `siteBannersRoute` | required | `content.update` | service | body `serviceId` | `assertServiceScope` | bypass | 403 | source + worker regression |
| GET | `/api/admin/site-navigation` | `siteNavigationRoute` | required | `content.read` | service/global | navigation items | service ownership filter unless global | bypass | 403/filter | source + worker regression |
| POST | `/api/admin/site-navigation` | `siteNavigationRoute` | required | `content.update` | service | body `serviceId` | `assertServiceScope` | bypass | 403 | source + worker regression |

## 5. ERP Contracts

| Method | Path | Handler | Authentication | Permission | Scope | Resource | Scope Resolver | Super Admin | Expected Denial | Test |
|---|---|---|---|---|---|---|---|---|---|---|
| GET | `/api/erp/projects` | `adminProjectsRoute` | required | `project.read` | project/global | projects | project membership filter unless global | bypass | 403/filter | source + worker regression |
| POST | `/api/erp/projects` | `erpProjectCreateRoute` | required | `project.create` | global/self | new project | creator/owner membership seed | bypass | 403 | source + worker regression |
| GET | `/api/erp/wbs` | `adminWbsRoute` | required | `wbs.read` | project | query `projectId` | `assertProjectScope` | bypass | 403 | source + worker regression |
| POST | `/api/erp/wbs` | `erpWbsCreateRoute` | required | `wbs.create` | project | body `projectId` | `assertProjectScope` | bypass | 403 | source + worker regression |
| PATCH | `/api/erp/wbs/:id` | `erpWbsUpdateRoute` | required | `wbs.update` | project | task row `project_id` | `assertProjectScope` | bypass | 403 | source + worker regression |
| POST | `/api/erp/daily-reports` | `erpDailyReportCreateRoute` | required | `daily_report.create` | self/project | body `projectId`, item WBS ids | `assertProjectScope` plus WBS project/assignee check | bypass | 403 | source + worker regression |
| POST | `/api/erp/daily-logs` | `erpDailyLogCreateRoute` | required | `daily_log.create` | self/project | body `projectId`, item WBS ids | `assertProjectScope` plus WBS project/assignee check | bypass | 403 | source + worker regression |
| GET | `/api/erp/approvals` | `adminApprovalsRoute` | required | `approval.read` | scope-based | approvals | requester, approver line, project membership, service ownership filter | bypass | 403/filter | source + worker regression |
| GET | `/api/erp/approvals/:id` | `adminApprovalDetailRoute` | required | `approval.read` | scope-based | approval document | requester, approver line, project membership, or service ownership | bypass | 403 | source + worker regression |
| POST | `/api/erp/approvals` | `erpApprovalCreateRoute` | required | `approval.create` | project/service/self | project/service/related WBS | `assertProjectScope`, `assertServiceScope`, WBS-project consistency | bypass | 403 | source + worker regression |
| POST | `/api/erp/approvals/:id/actions` | `erpApprovalActionRoute` | required | `approval.act` | self | approver line | pending line `approver_user_id = auth.id` | bypass only via explicit line/business rule | 403 | source + worker regression |
| GET | `/api/erp/evaluations/cycles` | `adminEvaluationsRoute` | required | `evaluation.read` | global | cycles | permission | bypass | 403 | source + worker regression |
| POST | `/api/erp/evaluations/cycles` | `erpEvaluationCycleCreateRoute` | required | `evaluation.finalize` | global | cycle | permission | bypass | 403 | source + worker regression |
| GET | `/api/erp/evaluations/items` | `adminEvaluationItemsRoute` | required | `evaluation.read` | global | items | permission | bypass | 403 | source + worker regression |
| GET | `/api/erp/evaluations/evidences` | `erpEvaluationEvidenceRoute` | required | `evaluation.read` | team/global | evidence user | `assertTeamScope`, HR/evaluation global roles | bypass | 403 | source + worker regression |
| GET | `/api/erp/evaluations/readiness` | `erpEvaluationReadinessRoute` | required | `evaluation.read` | global | cycle/evidence aggregate | permission and finalize readiness aggregate | bypass | 403 | source + worker regression |
| POST | `/api/erp/evaluations/scores` | `erpEvaluationScoreRoute` | required | `evaluation.score` | team/global | evaluatee/cycle | `assertTeamScope`, HR/evaluation global roles, evidence DB guard | bypass | 403 | source + worker regression |
| POST | `/api/erp/evaluations/cycles/:id/finalize` | `erpEvaluationFinalizeRoute` | required | `evaluation.finalize` | global | cycle | permission and evidence precondition | bypass | 403 | source + worker regression |
| GET | `/api/erp/todos` | `todoListRoute` | required | `todo.read` | self | auth user | SQL `user_id = auth.id` | bypass not needed | 403 | source + worker regression |
| POST | `/api/erp/todos` | `todoCreateRoute` | required | `todo.create` | self | auth user | insert `user_id = auth.id` | bypass not needed | 403 | source + worker regression |
| PATCH | `/api/erp/todos/:id` | `todoUpdateRoute` | required | `todo.update` | self | todo row owner | SQL `id AND user_id = auth.id` | bypass not needed | 404/403 policy retained as 404 for hidden foreign todo | source + worker regression |
| GET | `/api/erp/attendance` | `attendanceListRoute` | required | `attendance.read` | self/team | query `userId` | `assertSelfScope` and `assertTeamScope` | bypass | 403 | source + worker regression |
| POST | `/api/erp/attendance/punch` | `attendancePunchRoute` | required | `attendance.punch` | self | auth user | SQL `user_id = auth.id` | bypass not needed | 403 | source + worker regression |
| POST | `/api/erp/attendance/correction` | `attendanceCorrectionRoute` | required | `attendance.read` | self | auth user | SQL `user_id = auth.id` | bypass not needed | 403 | source + worker regression |
| PATCH | `/api/erp/attendance/:id/correction` | `attendanceCorrectionDecisionRoute` | required | `attendance.manage` | team | attendance row `user_id` | `assertTeamScope` | bypass | 403 | source + worker regression |
| GET | `/api/erp/leave` | `leaveSummaryRoute` | required | `leave.read` | self/team | query `userId` | `assertSelfScope` and `assertTeamScope` | bypass | 403 | source + worker regression |
| POST | `/api/erp/leave` | `leaveCreateRoute` | required | `leave.create` | self | auth user | insert `user_id = auth.id` | bypass not needed | 403 | source + worker regression |
| PATCH | `/api/erp/leave/:id` | `leaveDecisionRoute` | required | `leave.manage` | team | leave row `user_id` | `assertTeamScope` | bypass | 403 | source + worker regression |
| POST | `/api/erp/leave/balance` | `leaveBalanceUpsertRoute` | required | `leave.manage` | team | body `userId` | `assertTeamScope` | bypass | 403 | source + worker regression |
| GET | `/api/erp/timesheets` | `timesheetListRoute` | required | `timesheet.read`; `timesheet.review` for query | self/team | query `userId`, list rows | `assertTeamScope` and department filter | bypass | 403/filter | source + worker regression |
| POST | `/api/erp/timesheets` | `timesheetCreateRoute` | required | `timesheet.create` | self/project | body `projectId` | `assertProjectScope`; row always inserted for auth user | bypass | 403 | source + worker regression |
| PATCH | `/api/erp/timesheets/:id` | `timesheetReviewRoute` | required | `timesheet.review` | team | timesheet row `user_id` | `assertTeamScope` | bypass | 403 | source + worker regression |
| GET | `/api/erp/expenses` | `expenseListRoute` | required | `expense.read`; `expense.manage` for manage role | self/project/global finance | requester/project | requester, project membership, finance/global filter | bypass | 403/filter | source + worker regression |
| POST | `/api/erp/expenses` | `expenseCreateRoute` | required | `expense.create` | self/project | optional `projectId` | `assertProjectScope` when project-bound | bypass | 403 | source + worker regression |
| PATCH | `/api/erp/expenses/:id` | `expenseUpdateRoute` | required | `expense.manage` | project/self/global finance | expense row | project membership or requester self; finance/global roles | bypass | 403 | source + worker regression |
| GET | `/api/erp/budgets` | `budgetListRoute` | required | `budget.read` | project/global finance | query/list project | `assertProjectScope` and membership filter unless finance/global | bypass | 403/filter | source + worker regression |
| POST | `/api/erp/budgets` | `budgetUpsertRoute` | required | `budget.manage` | project/global finance | body `projectId` | `assertProjectScope` with finance/global role bypass | bypass | 403 | source + worker regression |
| POST | `/api/erp/resource-allocations` | `allocationUpsertRoute` | required | `project.member.manage` | project/team | project and target user | `assertProjectScope` and `assertTeamScope` | bypass | 403 | source + worker regression |
| GET | `/api/erp/goals` | `goalListRoute` | required | `goal.read` | self/team/project/global | goal owner | self, department, project membership, or global goal role filter | bypass | 403/filter | source + worker regression |
| POST | `/api/erp/goals` | `goalCreateRoute` | required | `goal.manage` | self/team/project/global | owner target | `assertGoalOwnerScope` | bypass | 403 | source + worker regression |
| PATCH | `/api/erp/goals/:id` | `goalUpdateRoute` | required | `goal.manage` | self/team/project/global | goal row | `assertGoalOwnerScope` from stored owner | bypass | 403 | source + worker regression |
| GET | `/api/erp/knowledge` | `knowledgeListRoute` | required | `knowledge.read` | global | docs | permission | bypass | 403 | source + worker regression |
| POST | `/api/erp/knowledge` | `knowledgeCreateRoute` | required | `knowledge.manage` | self/global | docs | actor owner plus permission | bypass | 403 | source + worker regression |
| GET | `/api/erp/board` | `boardListRoute` | required | `board.read` | global | board posts | permission | bypass | 403 | source + worker regression |
| POST | `/api/erp/board` | `boardCreateRoute` | required | `board.manage` | self/global | board post | actor owner plus permission | bypass | 403 | source + worker regression |
| GET | `/api/erp/approval-templates` | `approvalTemplatesRoute` | required | `approval.read` | global | templates | permission | bypass | 403 | source + worker regression |
| POST | `/api/erp/approval-templates` | `approvalTemplatesRoute` | required | `approval.create` | global | templates | permission | bypass | 403 | source + worker regression |
| POST | `/api/erp/approval-templates/:id/steps` | `approvalTemplateStepCreateRoute` | required | `approval.create` | global | template step | permission | bypass | 403 | source + worker regression |
| POST | `/api/erp/project-issues` | `projectIssueCreateRoute` | required | `project.update` | project | body `projectId` | `assertProjectScope` | bypass | 403 | source + worker regression |
| POST | `/api/erp/project-meetings` | `projectMeetingCreateRoute` | required | `project.update` | project | body `projectId` | `assertProjectScope` | bypass | 403 | source + worker regression |
| GET | `/api/erp/knowledge-templates` | `knowledgeTemplatesRoute` | required | `system.read` | global | templates | permission | bypass | 403 | source + worker regression |
| POST | `/api/erp/knowledge-templates` | `knowledgeTemplatesRoute` | required | `system.update` | global | templates | permission | bypass | 403 | source + worker regression |

## 6. System Contracts

| Method | Path | Handler | Authentication | Permission | Scope | Resource | Scope Resolver | Super Admin | Expected Denial | Test |
|---|---|---|---|---|---|---|---|---|---|---|
| GET | `/api/system/settings` | `systemSettingsRoute` | required | `system.read` | global | settings | permission | bypass | 403 | source + worker regression |
| PATCH | `/api/system/settings/:key` | `systemSettingUpdateRoute` | required | `system.update` | global | setting key | permission and secret-key business guard | bypass | 403 | source + worker regression |
| GET | `/api/system/audit-logs` | `systemAuditLogsRoute` | required | `audit.read` | global | audit logs | permission | bypass | 403 | source + worker regression |
| GET | `/api/system/email-templates` | `emailTemplateListRoute` | required | `email_template.read` | global | email templates | permission | bypass | 403 | source + worker regression |
| POST/PATCH | `/api/system/email-templates` | `emailTemplateUpsertRoute` | required | `email_template.manage` | global | email template code | permission | bypass | 403 | source + worker regression |
| GET | `/api/system/integrations` | `integrationListRoute` | required | `integration.read` | global | integrations | permission | bypass | 403 | source + worker regression |
| POST/PATCH | `/api/system/integrations` | `integrationUpsertRoute` | required | `integration.manage` | global | integration code | permission | bypass | 403 | source + worker regression |
| GET | `/api/system/code-groups` | `codeGroupsRoute` | required | `system.read` | global | common code groups | permission | bypass | 403 | source + worker regression |
| POST | `/api/system/code-groups` | `codeGroupsRoute` | required | `system.update` | global | common code group | permission | bypass | 403 | source + worker regression |
| POST | `/api/system/code-groups/:id/codes` | `commonCodeCreateRoute` | required | `system.update` | global | common code | permission | bypass | 403 | source + worker regression |

## 7. Representative Hardening Applied

- `worker/lib/authorization.ts`: canonical scope helpers for `self`, `project`, `service`, and `team`.
- `worker/lib/auth.ts`: auth reload now includes `department_id` and role codes so server-side scope can distinguish global roles from scoped roles.
- Project scope:
  - project and WBS listing filters,
  - WBS create/update,
  - daily report/log WBS membership and assignee checks,
  - project issues/meetings,
  - budgets/expenses/resource allocations.
- Service scope:
  - service list/content list filters,
  - service update/content create/update/translation/news/media/deployment/domain writes,
  - service detail reads.
- Team/self scope:
  - attendance, leave, timesheet cross-user reads/actions,
  - leave balance updates,
  - expense self/project/finance boundaries.
- Approval scope:
  - approval list/detail reads are limited to requester, approver line, project membership, service ownership, or global approver/admin scope.
- Evaluation scope:
  - evidence reads and score writes require same-team access unless the actor has HR/evaluation global scope.
- Goal scope:
  - goal list/create/update uses self, department, project membership, or global goal scope.

## 8. Follow-Up Gaps

- None for the GAP-P1-001 permission/scope contract. Broader API versioning, mobile auth, rate limit policy, and UI forbidden-state work remain in later backlog items.

## 9. GAP-P1-001 Exit Criteria Notes

- Matrix coverage: PASS for 111 protected contracts.
- Canonical scope vocabulary: PASS.
- Representative cross-scope helper tests: PASS via `tests/worker/authorization.test.mjs`.
- Full endpoint integration tests for every protected contract: NOT ADDED; representative helper and route-level source regression only.
- Production DB writes: 0.
- Cloudflare changes/deploy: 0.
