# JINBIZ MANAGEMENT Permission UX Matrix

## Snapshot

- Gap: GAP-P1-006
- Git HEAD: 6e13881fe4db818eafa7b73da9d2d84afcccc127
- Protected screens: 35
- Forbidden supported: 35
- Coverage: 100%
- Source of truth: `AUTHORIZATION_MATRIX.md`, `SCREEN_INVENTORY.md`, `src/lib/permissions.ts`
- Security boundary: Server authorization remains final; UI permission checks are presentation and workflow guidance only.

## Policy

- 401: redirect to `/admin/login`.
- 403 on initial page load: render common Forbidden UI.
- 403 after a user action: keep page context and show an action-level permission message.
- Menu visibility: show only modules whose read permission is present in `/api/auth/me`.
- Action visibility: expose write/approve actions only when the canonical permission is present.
- Direct URL: route guard and/or page API 403 renders Forbidden UI even when the menu item is hidden.

## Protected Screen Matrix

| Route | Screen | Read Permission | Write Permission | Approve Permission | Menu Visibility | Direct URL | 403 UX | Action UX | Test |
|---|---|---|---|---|---|---|---|---|---|
| `/admin` | Dashboard alias | `project.read` or `system.read` or `audit.read` | N/A | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | N/A | `tests/admin-react.test.mjs` |
| `/admin/dashboard` | Dashboard | `project.read` or `system.read` or `audit.read` | N/A | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | N/A | `tests/admin-react.test.mjs` |
| `/admin/services` | Services | `service.read` | `service.create` or `service.update` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Write actions hidden | `tests/admin-react.test.mjs` |
| `/admin/site-content` | Site content | `content.read` | `content.update` or `content.publish` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Workflow hidden | `tests/admin-react.test.mjs` |
| `/admin/news` | News | `news.read` | `news.create` or `news.update` or `news.publish` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Write actions hidden | `tests/admin-react.test.mjs` |
| `/admin/inquiries` | Inquiries | `inquiry.read` | `inquiry.update` | `lead.convert` | Permission-aware | Forbidden on no read permission | ForbiddenState | Conversion hidden/denied | `tests/admin-react.test.mjs` |
| `/admin/leads` | Leads | `inquiry.read` or `lead.update` or `opportunity.manage` | `lead.update` or `opportunity.manage` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Write actions hidden | `tests/admin-react.test.mjs` |
| `/admin/opportunities` | Opportunities | `opportunity.manage` | `opportunity.manage` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Write actions hidden | `tests/admin-react.test.mjs` |
| `/admin/projects` | Projects/WBS | `project.read` or `wbs.read` | `project.create` or `project.update` or `wbs.create` or `wbs.update` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Project/WBS forms hidden | `tests/admin-react.test.mjs` |
| `/admin/daily-work` | Daily work | `project.read` or `wbs.read` or `daily_report.create` or `daily_log.create` | `daily_report.create` or `daily_log.create` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Submit forms hidden | `tests/admin-react.test.mjs` |
| `/admin/todos` | Todos | `todo.read` | `todo.manage` or `wbs.update` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Write actions hidden | `tests/admin-react.test.mjs` |
| `/admin/approvals` | Approvals | `approval.read` | `approval.create` | `approval.act` | Permission-aware | Forbidden on no read permission | ForbiddenState | Submit/action buttons hidden | `tests/admin-react.test.mjs` |
| `/admin/attendance` | Attendance | `attendance.read` or `attendance.punch` | `attendance.punch` | `attendance.manage` | Permission-aware | Forbidden on no read permission | ForbiddenState | Review actions hidden | `tests/admin-react.test.mjs` |
| `/admin/leave` | Leave | `leave.read` or `leave.create` | `leave.create` | `leave.manage` | Permission-aware | Forbidden on no read permission | ForbiddenState | Decision actions hidden | `tests/admin-react.test.mjs` |
| `/admin/timesheets` | Timesheets | `timesheet.read` or `timesheet.create` | `timesheet.create` | `timesheet.review` | Permission-aware | Forbidden on no read permission | ForbiddenState | Review actions hidden | `tests/admin-react.test.mjs` |
| `/admin/users` | Users | `user.read` | `user.update` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Write actions hidden | `tests/admin-react.test.mjs` |
| `/admin/departments` | Departments | `user.read` or `system.read` | `system.update` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Write actions hidden | `tests/admin-react.test.mjs` |
| `/admin/roles` | Roles | `role.read` | `system.update` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Write actions hidden | `tests/admin-react.test.mjs` |
| `/admin/permissions` | Permissions | `role.read` | `system.update` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Write actions hidden | `tests/admin-react.test.mjs` |
| `/admin/budgets` | Budgets | `budget.read` | `budget.manage` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Write actions hidden | `tests/admin-react.test.mjs` |
| `/admin/expenses` | Expenses | `expense.read` or `expense.create` | `expense.create` | `expense.manage` | Permission-aware | Forbidden on no read permission | ForbiddenState | State actions hidden | `tests/admin-react.test.mjs` |
| `/admin/goals` | Goals/KPI | `goal.read` | `goal.manage` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Write actions hidden | `tests/admin-react.test.mjs` |
| `/admin/evaluations` | Evaluations | `evaluation.read` | `evaluation.score` | `evaluation.finalize` | Permission-aware | Forbidden on no read permission | ForbiddenState | Score/finalize hidden | `tests/admin-react.test.mjs` |
| `/admin/board` | Board | `board.read` | `board.manage` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Write actions hidden | `tests/admin-react.test.mjs` |
| `/admin/knowledge` | Knowledge | `knowledge.read` | `knowledge.manage` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Write actions hidden | `tests/admin-react.test.mjs` |
| `/admin/media` | Media | `content.update` | `content.update` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Upload hidden | `tests/admin-react.test.mjs` |
| `/admin/service-deployments` | Service deployments | `service.read` | `service.update` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Deployment actions hidden | `tests/admin-react.test.mjs` |
| `/admin/site-banners` | Site banners | `content.read` | `content.update` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Write actions hidden | `tests/admin-react.test.mjs` |
| `/admin/site-navigation` | Site navigation | `content.read` | `content.update` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Write actions hidden | `tests/admin-react.test.mjs` |
| `/admin/approval-templates` | Approval templates | `approval.read` | `approval.create` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Write actions hidden | `tests/admin-react.test.mjs` |
| `/admin/code-groups` | Code groups | `system.read` | `system.update` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Write actions hidden | `tests/admin-react.test.mjs` |
| `/admin/integrations` | Integrations | `integration.read` | `integration.manage` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Write actions hidden | `tests/admin-react.test.mjs` |
| `/admin/email-templates` | Email templates | `email_template.read` | `email_template.manage` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Write actions hidden | `tests/admin-react.test.mjs` |
| `/admin/audit-logs` | Audit logs | `audit.read` | N/A | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | N/A | `tests/admin-react.test.mjs` |
| `/admin/settings` | Settings | `system.read` | `system.update` | N/A | Permission-aware | Forbidden on no read permission | ForbiddenState | Write actions hidden | `tests/admin-react.test.mjs` |

## Role Verification Targets

| Role | Expected UX |
|---|---|
| `super_admin` | All modules and actions visible through permissions returned by `/api/auth/me`. |
| `viewer` | Read modules visible; write/approve actions hidden. |
| `general_member` | Self-work modules such as todos, daily work, attendance, leave, and timesheets visible only when the corresponding permissions exist. |
| `pm` | Project/WBS modules and project-scoped actions visible when `project.*` and `wbs.*` permissions exist. |
| `team_lead` | Team review modules visible when attendance/leave/timesheet review permissions exist. |
| `finance_manager` | Budget/expense modules and finance actions visible. |
| `hr_evaluator` | Evaluation module and score/finalize actions visible according to permission split. |

## Follow-Up Notes

- Scope remains server-enforced. UI only hides obvious out-of-policy actions and maps server 403 to a clear user state.
- Generic module workflow depth remains out of scope for GAP-P1-006.
