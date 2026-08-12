# JINBIZ MANAGEMENT Audit Matrix

Snapshot: GAP-P1-004 working state, Git HEAD `6e13881fe4db818eafa7b73da9d2d84afcccc127`.

Coverage counts:

- High-risk write action contracts: 54
- FULL global audit: 54
- PARTIAL global audit: 0
- Domain-only audit: 0 for identified high-risk writes
- No audit: 0 for identified high-risk writes
- Before/after coverage: 17 actions include explicit `before_json`; create/submit actions record committed `after_json`
- Failure audit: policy defined; helper supports `status_code`/`error_code`; broad route-level denial audit is follow-up

## Matrix

| Method | Path | Handler | Action Type | Target Type | Actor | Scope | Before | After | Status/Error | Domain Log | Global Audit | Test |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| POST | `/api/admin/services` | `adminServiceCreateRoute` | `service.create` | `service` | auth user | admin/service_id | no | yes | 201 | none | FULL | `tests/worker/audit.test.mjs` |
| PATCH | `/api/admin/services/:id` | `adminServiceUpdateRoute` | `service.update` | `service` | auth user | admin/service_id | yes | yes | 200 | none | FULL | source + worker |
| POST | `/api/admin/contents` | `adminContentCreateRoute` | `content.create` | `service_content_item` | auth user | admin/service_id | no | yes | 201 | none | FULL | source + worker |
| PATCH | `/api/admin/contents/:id` | `adminContentUpdateRoute` | `content.update` or `content.publish` | `service_content_item` | auth user | admin/service_id | yes | yes | 200 | none | FULL | source + worker |
| POST/PATCH/PUT | `/api/admin/contents/:id/translations/:locale` | `adminTranslationUpsertRoute` | `translation.update` or `translation.publish` | `service_translation` | auth user | admin/service_id | no | yes | 200 | none | FULL | source + worker |
| POST | `/api/admin/news` | `adminNewsCreateRoute` | `news.create` | `news_post` | auth user | admin/service_id optional | no | yes | 201 | none | FULL | source + worker |
| PATCH | `/api/admin/news/:id` | `adminNewsUpdateRoute` | `news.update` or `news.publish` | `news_post` | auth user | admin/service_id optional | yes | yes | 200 | none | FULL | source + worker |
| POST/PATCH/PUT | `/api/admin/news/:id/translations/:locale` | `adminNewsTranslationUpsertRoute` | `news.translation.update` or `news.translation.publish` | `news_post_translation` | auth user | admin/service_id optional | no | yes | 200 | none | FULL | source + worker |
| POST | `/api/admin/inquiries/:id/convert` | `adminInquiryConvertRoute` | `inquiry.convert` | `inquiry` | auth user | admin/service_id optional | yes | yes | 200 | lead row | FULL | `tests/worker/audit.test.mjs` |
| POST | `/api/admin/departments` | `departmentCreateRoute` | `department.create` | `department` | auth user | admin | no | yes | 201 | none | FULL | source + worker |
| POST | `/api/admin/roles` | `roleCreateRoute` | `role.create` | `role` | auth user | admin | no | yes | 201 | none | FULL | source + worker |
| POST | `/api/system/code-groups` | `codeGroupsRoute` | `common_code_group.create` | `common_code_group` | auth user | system | no | yes | 201 | none | FULL | `tests/worker/audit.test.mjs` |
| POST | `/api/system/code-groups/:id/codes` | `commonCodeCreateRoute` | `common_code.create` | `common_code` | auth user | system | no | yes | 201 | none | FULL | `tests/worker/audit.test.mjs` |
| POST | `/api/admin/service-deployments` | `serviceDeploymentsRoute` | `service_deployment.request` | `service_deployment` | auth user | admin/service_id | no | yes | 201 | none | FULL | `tests/worker/audit.test.mjs` |
| POST | `/api/admin/services/:id/domains` | `serviceDomainCreateRoute` | `service_domain.upsert` | `service_domain` | auth user | admin/service_id | yes if existing | yes | 200 | none | FULL | source + worker |
| POST | `/api/admin/site-banners` | `siteBannersRoute` | `site_banner.create` | `site_banner` | auth user | admin/service_id | no | yes | 201 | none | FULL | `tests/worker/audit.test.mjs` |
| POST | `/api/admin/site-navigation` | `siteNavigationRoute` | `site_navigation.create` | `site_navigation_item` | auth user | admin/service_id | no | yes | 201 | none | FULL | `tests/worker/audit.test.mjs` |
| POST | `/api/erp/projects` | `erpProjectCreateRoute` | `project.create` | `project` | auth user | erp/project_id | no | yes | 201 | none | FULL | source + worker |
| POST | `/api/erp/wbs` | `erpWbsCreateRoute` | `wbs.create` | `wbs_task` | auth user | erp/project_id | no | yes | 201 | none | FULL | source + worker |
| PATCH | `/api/erp/wbs/:id` | `erpWbsUpdateRoute` | `wbs.update` | `wbs_task` | auth user | erp/project_id | yes | yes | 200 | none | FULL | `tests/worker/audit.test.mjs` |
| POST | `/api/erp/daily-reports` | `erpDailyReportCreateRoute` | `daily_report.submit` | `daily_report` | auth user | erp/project_id | no | summary | 200 | none | FULL | source + worker |
| POST | `/api/erp/daily-logs` | `erpDailyLogCreateRoute` | `daily_log.submit` | `daily_log` | auth user | erp/project_id | no | summary | 200 | none | FULL | source + worker |
| POST | `/api/erp/approvals` | `erpApprovalCreateRoute` | `approval.submit` or `approval.draft.create` | `approval_document` | auth user | erp/project/service | no | summary | 201 | approval lines | FULL | source + worker |
| POST | `/api/erp/approvals/:id/actions` | `erpApprovalActionRoute` | `approval.approve/reject/request_changes` | `approval_document` | auth user | erp/project/service | yes | yes | 200 | `approval_actions` | FULL | `tests/worker/audit.test.mjs` |
| POST | `/api/erp/evaluations/cycles` | `erpEvaluationCycleCreateRoute` | `evaluation.cycle.create` | `evaluation_cycle` | auth user | erp | no | yes | 201 | none | FULL | source + worker |
| POST | `/api/erp/evaluations/scores` | `erpEvaluationScoreRoute` | `evaluation.score` | `evaluation_score` | auth user | erp/team | no | yes | 200 | none | FULL | source + worker |
| POST | `/api/erp/evaluations/cycles/:id/finalize` | `erpEvaluationFinalizeRoute` | `evaluation.finalize` | `evaluation_cycle` | auth user | erp | yes | yes | 200 | none | FULL | `tests/worker/audit.test.mjs` |
| POST | `/api/erp/todos` | `todoCreateRoute` | `todo.create` | `todo_item` | auth user | erp/self | no | yes | 201 | none | FULL | source + worker |
| PATCH | `/api/erp/todos/:id` | `todoUpdateRoute` | `todo.update` | `todo_item` | auth user | erp/self | yes | yes | 200 | none | FULL | source + worker |
| POST | `/api/erp/attendance/punch` | `attendancePunchRoute` | `attendance.clock_in/clock_out` | `attendance_record` | auth user | erp/self | yes if existing | yes | 200 | none | FULL | source + worker |
| POST | `/api/erp/attendance/correction` | `attendanceCorrectionRoute` | `attendance.correction.request` | `attendance_record` | auth user | erp/self | no | yes | 200 | none | FULL | source + worker |
| PATCH | `/api/erp/attendance/:id/correction` | `attendanceCorrectionDecisionRoute` | `attendance.correction.approved/rejected` | `attendance_record` | auth user | erp/team | yes | yes | 200 | none | FULL | source + worker |
| POST | `/api/erp/leave/balance` | `leaveBalanceUpsertRoute` | `leave.balance.upsert` | `leave_balance` | auth user | erp/team | no | yes | 200 | none | FULL | source + worker |
| POST | `/api/erp/leave` | `leaveCreateRoute` | `leave.submit` | `leave_request` | auth user | erp/self | no | yes | 201 | none | FULL | source + worker |
| PATCH | `/api/erp/leave/:id` | `leaveDecisionRoute` | `leave.approved/rejected/cancelled` | `leave_request` | auth user | erp/team | yes | yes | 200 | none | FULL | `tests/worker/audit.test.mjs` |
| POST | `/api/erp/timesheets` | `timesheetCreateRoute` | `timesheet.submit` | `timesheet` | auth user | erp/project/self | no | yes | 201 | none | FULL | source + worker |
| PATCH | `/api/erp/timesheets/:id` | `timesheetReviewRoute` | `timesheet.approved/rejected` | `timesheet` | auth user | erp/project/team | yes | yes | 200 | none | FULL | `tests/worker/audit.test.mjs` |
| POST | `/api/erp/resource-allocations` | `allocationUpsertRoute` | `resource_allocation.upsert` | `project_resource_allocation` | auth user | erp/project | no | yes | 200 | none | FULL | source + worker |
| POST | `/api/erp/budgets` | `budgetUpsertRoute` | `budget.upsert` | `project_budget` | auth user | erp/project | no | yes | 200 | none | FULL | source + worker |
| POST | `/api/erp/expenses` | `expenseCreateRoute` | `expense.submit` | `expense_request` | auth user | erp/project/self | no | yes | 201 | none | FULL | source + worker |
| PATCH | `/api/erp/expenses/:id` | `expenseUpdateRoute` | `expense.approved/rejected/paid/cancelled` | `expense_request` | auth user | erp/project/finance | yes | yes | 200 | none | FULL | `tests/worker/audit.test.mjs` |
| POST | `/api/erp/goals` | `goalCreateRoute` | `goal.create` | `goal` | auth user | erp/team/project | no | yes | 201 | none | FULL | source + worker |
| PATCH | `/api/erp/goals/:id` | `goalUpdateRoute` | `goal.update` | `goal` | auth user | erp/team/project | yes | yes | 200 | none | FULL | source + worker |
| POST | `/api/erp/board` | `boardCreateRoute` | `board.create` | `board_post` | auth user | erp | no | yes | 201 | none | FULL | source + worker |
| POST | `/api/erp/knowledge` | `knowledgeCreateRoute` | `knowledge.create` | `knowledge_document` | auth user | erp | no | yes | 201 | none | FULL | source + worker |
| POST | `/api/erp/approval-templates` | `approvalTemplatesRoute` | `approval_template.create` | `approval_template` | auth user | erp | no | yes | 201 | none | FULL | `tests/worker/audit.test.mjs` |
| POST | `/api/erp/approval-templates/:id/steps` | `approvalTemplateStepCreateRoute` | `approval_template_step.create` | `approval_template_step` | auth user | erp | no | yes | 201 | none | FULL | `tests/worker/audit.test.mjs` |
| POST | `/api/erp/project-issues` | `projectIssueCreateRoute` | `project_issue.create` | `project_issue` | auth user | erp/project_id | no | yes | 201 | none | FULL | `tests/worker/audit.test.mjs` |
| POST | `/api/erp/project-meetings` | `projectMeetingCreateRoute` | `project_meeting.create` | `project_meeting` | auth user | erp/project_id | no | yes | 201 | none | FULL | `tests/worker/audit.test.mjs` |
| POST | `/api/erp/knowledge-templates` | `knowledgeTemplatesRoute` | `knowledge_template.create` | `knowledge_template` | auth user | erp | no | yes | 201 | none | FULL | `tests/worker/audit.test.mjs` |
| POST/PATCH | `/api/system/integrations` | `integrationUpsertRoute` | `integration.upsert` | `integration` | auth user | system | no | redacted metadata | 200 | none | FULL | source + worker |
| POST/PATCH | `/api/system/email-templates` | `emailTemplateUpsertRoute` | `email_template.upsert` | `email_template` | auth user | system | no | allowlisted summary | 200 | `email_delivery_logs` for sends only | FULL | source + worker |
| PATCH | `/api/system/settings/:key` | `systemSettingUpdateRoute` | `system.setting.update` | `system_setting` | auth user | system | yes | yes | 200 | none | FULL | `tests/worker/audit.test.mjs` |

## Domain Log Integration

| Domain log | Current integration |
|---|---|
| `login_events` | Auth routes continue to write authentication events. This matrix does not replace them. |
| `approval_actions` | Approval action writes preserve approval-specific action rows and also write global audit. |
| `service_change_logs` | Read endpoint exists; writer coverage is not expanded in this GAP because global audit now covers high-risk service/CMS writes. |
| `email_delivery_logs` | Email delivery status remains in email helper; template changes are globally audited. |

## Follow-Up Notes

- Transaction-coupled audit for multi-statement writes remains a Phase 2 review candidate.
- Broad authenticated failure audit should be added with route metadata to avoid duplicating route-local auth checks.
