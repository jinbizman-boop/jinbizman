# P2-006 Retention / Soft Delete Audit

## 1. Baseline

| Item | Value |
|---|---|
| Repository | `jinbizman-boop/jinbizman` |
| Branch | `main` |
| Git HEAD audited | `1e00d4d018ed93337aca7e200f6198173b0d44aa` |
| Production Worker | `jinbizman` |
| Production Worker version | `55fcb266-f6c1-4b2f-943e-c609ec5063ff` |
| Database / schema | `neondb` / `public` |
| Production base tables | 72 |
| Source migrations | 001 through 018 |
| Production indexes | 425 |
| Scope | Audit and policy definition only |

No DB write, migration, delete, update, soft-delete column addition, source-code change, manual deploy, production login, or production business action was performed for this audit.

## 2. Source Of Truth

The v2.0 master plan defines P2-006 as the retention/soft-delete policy audit and names this document as the deliverable. The v2.0 requirements PDF provides the Phase 0 71-table data dictionary retention defaults and the retention/backup matrix. Phase 1 added `auth_sessions`, so this audit extends the source-of-truth matrix to the current 72-table production schema.

Source-of-truth retention principles used here:

- Core ERP business data defaults to 3 to 5 years depending on domain.
- Audit and login events default to 3 years.
- CMS/news published or archived content is long-term/archive governed.
- Notifications may be cleaned after 90 days.
- Ephemeral window data, including API rate-limit rows and auth sessions, should use safe TTL cleanup.
- Stricter legal, contract, privacy, or customer policy wins over these operational defaults.
- Soft delete is selective. Business history, content, and user lifecycle objects should prefer lifecycle status, soft delete, archive, masking, or anonymization where hard deletion would break auditability.

## 3. Classification Method

Each table is classified by retention period or family, PII presence, current lifecycle mechanism, delete strategy, FK or polymorphic orphan risk, current implementation evidence, gap, and severity.

Delete strategy vocabulary:

- `HARD_DELETE_ALLOWED`
- `SOFT_DELETE_RECOMMENDED`
- `ARCHIVE_THEN_DELETE`
- `APPEND_ONLY`
- `IMMUTABLE / NEVER_DELETE`
- `TTL / AUTOMATIC_CLEANUP`
- `POLICY_UNDEFINED`

Severity vocabulary:

- `P0`: immediate production loss/corruption/legal evidence risk.
- `P1`: policy or enforcement gap requiring remediation design.
- `P2`: scale, archive optimization, or long-horizon operational hardening.
- `NONE`: no specific retention gap identified in this audit.

## 4. Retention Matrix

| Table | Domain | PII | Retention | Current lifecycle | Delete strategy | Archive | Immutable | FK delete risk | Current implementation | Gap | Severity | Recommended action |
|---|---|---:|---|---|---|---:|---:|---|---|---|---|---|
| api_rate_limits | Auth/System | NO | Ephemeral window | `window_started_at` | `TTL / AUTOMATIC_CLEANUP` | NO | NO | None | Rows age by window only | Cleanup job/policy not implemented | P1 | Add TTL cleanup in later batch |
| approval_actions | Approval | POSSIBLE | 3 years | append-style action rows | `APPEND_ONLY` | YES | YES | Cascades from approval document | No update/delete API found | DB-level immutability not enforced | P1 | Keep append-only; consider DB/API guard |
| approval_documents | Approval | POSSIBLE | 3 years | `status` | `ARCHIVE_THEN_DELETE` | YES | NO | Parent of lines/actions | Status lifecycle exists | Hard delete would remove approval history | P1 | Archive-first; avoid broad hard delete |
| approval_lines | Approval | POSSIBLE | 3 years | line status | `ARCHIVE_THEN_DELETE` | YES | NO | Child of approval document | Status lifecycle exists | Retention follows document | NONE | Retain with parent |
| approval_template_steps | Approval config | NO | 3 years | template lifecycle | `ARCHIVE_THEN_DELETE` | YES | NO | Child of template | No delete route found | Template history policy not explicit | P2 | Keep template version/archive policy |
| approval_templates | Approval config | NO | 3 years | `is_active` | `ARCHIVE_THEN_DELETE` | YES | NO | Parent of steps | Active flag exists | Template retirement semantics need policy | P2 | Prefer inactive/archive over delete |
| attachments | Files/Media | POSSIBLE | Long-term/archive policy | target metadata | `POLICY_UNDEFINED` | YES | NO | Polymorphic target | DB row stores URL/metadata; R2 object exists | R2 object retention/delete audit undefined | P1 | Define DB/R2 synchronized lifecycle |
| attendance_records | Workplace | YES | 5 years | date/user record | `ARCHIVE_THEN_DELETE` | YES | NO | Cascades from user | No delete route found | User hard delete would erase records | P1 | Retain/archive; mask user if needed |
| audit_logs | Audit | POSSIBLE | 3 years | append-only log | `APPEND_ONLY` | YES | YES | Actor/target SET NULL or polymorphic | No update/delete API found | DB-level immutability not enforced | P1 | Keep immutable trail and retention cleanup |
| auth_sessions | Auth | NO | Ephemeral until expiry/revoke | `expires_at`, `revoked_at` | `TTL / AUTOMATIC_CLEANUP` | NO | NO | Cascades from user | Plain tokens absent; hash/session metadata only | Expired/revoked cleanup policy not implemented | P1 | Add safe expired-session cleanup |
| board_posts | Knowledge/Board | POSSIBLE | Long-term/archive policy | `status` | `SOFT_DELETE_RECOMMENDED` | YES | NO | Referenced by comments polymorphically | `draft/published/archived` style lifecycle | Delete/tombstone policy undefined | P2 | Use archived status; avoid hard delete until policy |
| comments | Collaboration | POSSIBLE | 3 years | polymorphic target | `POLICY_UNDEFINED` | YES | NO | Polymorphic target only | No physical target FK | Orphan behavior on target delete undefined | P1 | Add target lifecycle/orphan policy |
| common_code_groups | System config | NO | 3 years/config lifetime | `is_active` | `IMMUTABLE / NEVER_DELETE` | YES | NO | Parent of common codes | Active flag exists | None immediate | NONE | Retire instead of hard delete |
| common_codes | System config | NO | 3 years/config lifetime | `is_active` | `IMMUTABLE / NEVER_DELETE` | YES | NO | Child of group | Active flag exists | None immediate | NONE | Retire instead of hard delete |
| daily_log_items | Daily work | POSSIBLE | 3 years | parent daily log | `ARCHIVE_THEN_DELETE` | YES | NO | Child of daily log/WBS | Atomic replacement CTE deletes/reinserts current items | Replacement delete is expected edit behavior | NONE | Retain with daily log |
| daily_logs | Daily work | YES | 3 years | date/user/project | `ARCHIVE_THEN_DELETE` | YES | NO | Parent of items | Unique daily log contract exists | User/project hard delete cascade risk | P1 | Archive parent; avoid hard delete |
| daily_report_items | Daily work | POSSIBLE | 3 years | parent daily report | `ARCHIVE_THEN_DELETE` | YES | NO | Child of daily report/WBS | Atomic replacement CTE deletes/reinserts current items | Replacement delete is expected edit behavior | NONE | Retain with daily report |
| daily_reports | Daily work | YES | 3 years | date/user/project | `ARCHIVE_THEN_DELETE` | YES | NO | Parent of items | Unique daily report contract exists | User/project hard delete cascade risk | P1 | Archive parent; avoid hard delete |
| departments | Organization | NO | 3 years/config lifetime | `is_active` | `IMMUTABLE / NEVER_DELETE` | YES | NO | Referenced by users/work records | Active flag exists | None immediate | NONE | Retire/inactivate |
| email_delivery_logs | CRM/System | YES | 3 years | delivery status | `APPEND_ONLY` | YES | YES | Related event metadata | Delivery log rows only | Cleanup/archive process not implemented | P1 | Retain 3 years, redact payload if needed |
| email_templates | CRM/System | NO | 3 years | active/template lifecycle | `POLICY_UNDEFINED` | YES | NO | Used by delivery flows | No explicit archive policy found | Template version/retirement unclear | P2 | Define archive/version policy |
| evaluation_cycles | Evaluation | YES | 5 years | `status` | `ARCHIVE_THEN_DELETE` | YES | NO | Parent of evaluation data | Lifecycle status exists | Cycle hard delete cascades evidence/scores | P1 | Archive cycle and retain evidence |
| evaluation_evidences | Evaluation | YES | 5 years | evidence source fields | `ARCHIVE_THEN_DELETE` | YES | NO | Cascades from cycle/user/project/service | Evidence can reference source records | Parent retention may be shorter than evidence | P1 | Snapshot/anonymization policy |
| evaluation_feedbacks | Evaluation | YES | 5 years | feedback rows | `ARCHIVE_THEN_DELETE` | YES | NO | Cascades from cycle/users | No delete route found | User hard delete cascade risk | P1 | Retain or anonymize user |
| evaluation_items | Evaluation | NO | 5 years | cycle item config | `ARCHIVE_THEN_DELETE` | YES | NO | Child of cycle | No delete route found | Follows cycle retention | NONE | Retain with cycle |
| evaluation_scores | Evaluation | YES | 5 years | score rows | `ARCHIVE_THEN_DELETE` | YES | NO | Cascades from cycle/users | No delete route found | User hard delete cascade risk | P1 | Retain or anonymize user |
| expense_requests | Finance | YES | 3 years default; legal review may extend | `status` | `ARCHIVE_THEN_DELETE` | YES | NO | Budget/approval/user/project relations | Status lifecycle exists | Finance legal retention review required | P1 | Confirm finance retention before cleanup |
| goals | Evaluation/Work | YES | 3 years | `status` | `ARCHIVE_THEN_DELETE` | YES | NO | User/project/service refs | Lifecycle status exists | Parent delete can break goal history | P1 | Archive or anonymize |
| inquiries | CRM/Public | YES | 3 years | `status`, converted fields | `SOFT_DELETE_RECOMMENDED` | YES | NO | Lead conversion relation | Status lifecycle exists | PII anonymization after retention undefined | P1 | Anonymize/archive after retention |
| integrations | System integration | POSSIBLE | 3 years/config lifetime | `status` | `POLICY_UNDEFINED` | YES | NO | Config/connection metadata | Status lifecycle exists | Secret/config retention policy needs explicit rule | P1 | Define secret-free archive/delete policy |
| knowledge_documents | Knowledge | POSSIBLE | Long-term/archive policy | `status` | `SOFT_DELETE_RECOMMENDED` | YES | NO | Comments/attachments possible | Published/archive lifecycle exists | Tombstone/version retention undefined | P2 | Archive instead of hard delete |
| knowledge_templates | Knowledge config | NO | Long-term/archive policy | active/template lifecycle | `POLICY_UNDEFINED` | YES | NO | Template usage possible | No explicit archive policy found | Template retirement unclear | P2 | Define template version lifecycle |
| leads | CRM | YES | 3 years | `status/stage` | `SOFT_DELETE_RECOMMENDED` | YES | NO | Inquiry/opportunity flow | Lifecycle fields exist | PII anonymization after retention undefined | P1 | Archive/anonymize closed leads |
| leave_balances | Workplace | YES | 5 years | user/year balance | `ARCHIVE_THEN_DELETE` | YES | NO | Cascades from user | Unique balance contract exists | User hard delete cascade risk | P1 | Retain or anonymize user/year |
| leave_requests | Workplace | YES | 5 years | `status` | `ARCHIVE_THEN_DELETE` | YES | NO | User/approval relations | Lifecycle and atomic approval guard exist | User hard delete cascade risk | P1 | Archive leave history |
| login_events | Auth/Audit | YES | 3 years | append-only event | `APPEND_ONLY` | YES | YES | User SET NULL | Event trail exists | DB-level immutability not enforced | P1 | Retain 3 years; redaction review |
| meeting_action_items | Project | POSSIBLE | 3 years | action-item status | `ARCHIVE_THEN_DELETE` | YES | NO | Child of meeting/user | No delete route found | Parent project delete cascade risk | P1 | Retain with project archive |
| news_post_translations | News/Public | POSSIBLE | Long-term/archive policy | translation status | `SOFT_DELETE_RECOMMENDED` | YES | NO | Cascades from news post | Published/archive lifecycle exists | URL/SEO tombstone policy undefined | P2 | Preserve slug/tombstone policy |
| news_posts | News/Public | POSSIBLE | Long-term/archive policy | `status` | `SOFT_DELETE_RECOMMENDED` | YES | NO | Parent of translations | Published/archive lifecycle exists | URL/SEO tombstone policy undefined | P2 | Archive/tombstone before delete |
| notifications | System | POSSIBLE | 90 days | read/sent timestamps | `TTL / AUTOMATIC_CLEANUP` | NO | NO | User CASCADE, project/service SET NULL, polymorphic related target | Rows are recipient events | 90-day cleanup not implemented | P1 | Add TTL cleanup and event dedupe policy |
| opportunities | CRM | YES | 3 years | `stage/status` | `SOFT_DELETE_RECOMMENDED` | YES | NO | Lead/project flow | Lifecycle fields exist | PII/customer record anonymization undefined | P1 | Archive/anonymize after retention |
| permissions | Auth/RBAC | NO | 3 years/config lifetime | code catalog | `IMMUTABLE / NEVER_DELETE` | YES | NO | Parent of role_permissions | Static RBAC catalog | None immediate | NONE | Keep versioned catalog |
| project_budgets | Finance/Project | NO | 3 years default; legal review may extend | project budget rows | `ARCHIVE_THEN_DELETE` | YES | NO | Cascades from project | Amount checks and indexes exist | Finance legal retention review required | P1 | Retain with project/finance archive |
| project_issues | Project | POSSIBLE | 3 years | issue status | `ARCHIVE_THEN_DELETE` | YES | NO | Cascades from project | Lifecycle fields exist | Project hard delete cascade risk | P1 | Archive issue history |
| project_meetings | Project | POSSIBLE | 3 years | meeting rows | `ARCHIVE_THEN_DELETE` | YES | NO | Cascades from project | Parent of action items | Project hard delete cascade risk | P1 | Archive meeting record |
| project_members | Project | YES | 3 years | membership row | `ARCHIVE_THEN_DELETE` | YES | NO | Cascades from project/user | Unique project/user mapping | User/project hard delete cascade risk | P1 | Archive membership or anonymize user |
| project_outputs | Project | POSSIBLE | 3 years | output metadata | `ARCHIVE_THEN_DELETE` | YES | NO | Project/WBS relations | No delete route found | Attachment/output retention dependency | P1 | Keep with project archive |
| project_resource_allocations | Project/Resource | YES | 3 years | allocation month | `ARCHIVE_THEN_DELETE` | YES | NO | Cascades from project/user | Allocation uniqueness exists | User/project hard delete cascade risk | P1 | Archive allocation history |
| projects | Project | POSSIBLE | 3 years | `status` | `SOFT_DELETE_RECOMMENDED` | YES | NO | Parent for many business records | Lifecycle status exists | Hard delete cascade would remove major history | P1 | Use completed/cancelled/archive policy |
| role_permissions | Auth/RBAC | NO | 3 years/config lifetime | mapping | `IMMUTABLE / NEVER_DELETE` | YES | NO | Cascades from role/permission | Unique mapping exists | None immediate | NONE | Version RBAC changes |
| roles | Auth/RBAC | NO | 3 years/config lifetime | `is_active` | `IMMUTABLE / NEVER_DELETE` | YES | NO | Parent of mappings | Active flag/code unique | None immediate | NONE | Retire roles, do not delete |
| schema_migrations | System bookkeeping | NO | Permanent | migration ledger | `IMMUTABLE / NEVER_DELETE` | NO | YES | None | Append-only migration ledger | None | NONE | Never delete |
| service_change_logs | Service/Audit | POSSIBLE | 3 years | append-style change log | `APPEND_ONLY` | YES | YES | Cascades from service | Change history exists | DB-level immutability not enforced | P1 | Keep append-only trail |
| service_connections | Service | POSSIBLE | 3 years | connection status | `ARCHIVE_THEN_DELETE` | YES | NO | Cascades from service/environment | Config metadata only | Secret/config retention policy needs explicit rule | P1 | Avoid secret values; archive metadata |
| service_content_items | CMS/Service | POSSIBLE | Long-term/archive policy | `status` | `SOFT_DELETE_RECOMMENDED` | YES | NO | Parent of translations | Published/archive lifecycle exists | Delete/tombstone policy undefined | P2 | Archive content before delete |
| service_content_types | CMS/Service | NO | 3 years/config lifetime | type catalog | `ARCHIVE_THEN_DELETE` | YES | NO | Cascades from service | Unique type code per service | Template/type lifecycle unclear | P2 | Retire type instead of delete |
| service_deployments | Service | POSSIBLE | 3 years | deployment status | `ARCHIVE_THEN_DELETE` | YES | NO | Cascades from service | Deployment history exists | External artifact retention undefined | P2 | Define artifact/log retention |
| service_domains | Service/Public | NO | 3 years | canonical/domain rows | `ARCHIVE_THEN_DELETE` | YES | NO | Cascades from service | Domain mapping exists | Domain retirement/tombstone policy undefined | P2 | Archive historical domain mappings |
| service_environments | Service | NO | 3 years | environment rows | `ARCHIVE_THEN_DELETE` | YES | NO | Cascades from service | Environment metadata exists | None immediate | NONE | Retain with service |
| service_translations | CMS/Service | POSSIBLE | Long-term/archive policy | translation status | `SOFT_DELETE_RECOMMENDED` | YES | NO | Cascades from content item/service | Published/hidden lifecycle exists | Delete/tombstone policy undefined | P2 | Archive translation before delete |
| services | Service | POSSIBLE | 3 years | `status` | `SOFT_DELETE_RECOMMENDED` | YES | NO | Parent for many CMS/service records | `draft/active/maintenance/retired` lifecycle | Hard delete cascade would remove service history | P1 | Use retired/archive, avoid hard delete |
| site_banners | CMS/Site | NO | 3 years | active/schedule fields | `POLICY_UNDEFINED` | YES | NO | Public site config | No explicit archive policy found | Banner history retention unclear | P2 | Define archive or expiry policy |
| site_navigation_items | CMS/Site | NO | 3 years | active/order fields | `POLICY_UNDEFINED` | YES | NO | Public site config | No explicit archive policy found | Navigation history retention unclear | P2 | Define archive/version policy |
| system_settings | System config | POSSIBLE | 3 years/config lifetime | settings catalog | `IMMUTABLE / NEVER_DELETE` | YES | NO | None | Current values stored | Setting history/versioning undefined | P2 | Avoid secrets; version high-risk changes |
| timesheets | Workplace | YES | 5 years | `status` | `ARCHIVE_THEN_DELETE` | YES | NO | User/project/WBS relations | WBS required after migration 015 | User/project hard delete cascade risk | P1 | Archive time records |
| todo_items | Daily work | POSSIBLE | 3 years | `status` | `ARCHIVE_THEN_DELETE` | YES | NO | User/project/WBS relations | Status lifecycle exists | User/project hard delete cascade risk | P1 | Archive or expire low-risk todos by policy |
| user_roles | Auth/RBAC | YES | 5 years | mapping row | `ARCHIVE_THEN_DELETE` | YES | NO | Cascades from user/role | Unique mapping exists | User hard delete removes role history | P1 | Retain role history or audit snapshots |
| users | Auth/Organization | YES | 5 years after retirement | `status` | `SOFT_DELETE_RECOMMENDED` | YES | NO | Parent of many user records | `retired/suspended` lifecycle exists | Hard delete cascades business/workplace records | P1 | Retire/mask/anonymize instead of hard delete |
| wbs_task_dependencies | Project/WBS | NO | 3 years | dependency row | `ARCHIVE_THEN_DELETE` | YES | NO | Cascades from WBS task | Self-dependency check exists | Project/WBS hard delete cascade risk | P1 | Retain with project archive |
| wbs_tasks | Project/WBS | YES | 3 years | `status` | `ARCHIVE_THEN_DELETE` | YES | NO | Parent of many work records | Status lifecycle exists | WBS hard delete breaks reports/timesheets/evidence | P1 | Archive with project; avoid hard delete |
| wbs_template_items | Project/WBS config | NO | 3 years | template child | `ARCHIVE_THEN_DELETE` | YES | NO | Cascades from template | Template structure exists | Template version policy not explicit | P2 | Version/archive templates |
| wbs_templates | Project/WBS config | NO | 3 years | `is_active` | `ARCHIVE_THEN_DELETE` | YES | NO | Parent of template items | Active flag exists | Template retirement policy not explicit | P2 | Inactivate/archive templates |

Coverage: 72 / 72 production base tables.

## 5. Retention Classification Summary

| Retention family | Count | Notes |
|---|---:|---|
| Permanent / immutable | 1 | `schema_migrations` |
| 5-year | 11 | Users, user roles, workplace records, and evaluation records |
| 3-year | 49 | Default business/config/audit retention family |
| 90-day | 1 | `notifications` |
| Ephemeral/window | 2 | `api_rate_limits`, `auth_sessions` |
| Long-term/archive policy | 8 | Public/CMS/knowledge/attachment records with archive-first behavior |
| Fully undefined | 0 | Every table has a proposed retention family; several need policy refinement |

## 6. Delete Strategy Summary

| Strategy | Count | Notes |
|---|---:|---|
| `HARD_DELETE_ALLOWED` | 0 | No broad business hard-delete policy is approved in Phase 2 scope |
| `SOFT_DELETE_RECOMMENDED` | 12 | User, service, project, CRM, and public content lifecycle objects |
| `ARCHIVE_THEN_DELETE` | 39 | Core business records and child records |
| `APPEND_ONLY` | 5 | Audit/action/change/delivery event trails |
| `IMMUTABLE / NEVER_DELETE` | 8 | Migration, RBAC, organization, and code/config catalogs |
| `TTL / AUTOMATIC_CLEANUP` | 3 | API rate limits, auth sessions, notifications |
| `POLICY_UNDEFINED` | 5 | Attachments, comments, email templates, integrations, and site presentation history |

## 7. PII Classification

PII-bearing or PII-adjacent tables:

- `users`, `user_roles`, `inquiries`, `leads`, `opportunities`
- `email_delivery_logs`, `attachments`, `comments`, `notifications`
- `daily_reports`, `daily_logs`, `attendance_records`, `leave_requests`, `leave_balances`, `timesheets`
- `evaluation_cycles`, `evaluation_scores`, `evaluation_evidences`, `evaluation_feedbacks`, `goals`
- `expense_requests`, `project_members`, `project_resource_allocations`
- `audit_logs`, `login_events`

Anonymization or masking candidates:

- Retired users after retention threshold.
- Public inquiry and CRM contact fields after closure retention.
- Workplace, evaluation, and finance records where business evidence must remain but identifiable user data can be masked.
- Email delivery metadata if message content or recipient PII is retained.
- Audit/login event actor data after 3-year retention, subject to security/legal policy.

Policy gaps:

- No implemented anonymization workflow.
- No explicit per-domain masking rules.
- Finance evidence may require retention longer than the default 3-year project data period.

## 8. FK Delete And Orphan Risk

Read-only pg_catalog/information_schema scan found:

- CASCADE FK groups: 63
- RESTRICT/NO ACTION FK groups: 6
- SET NULL FK groups: 72

High-risk cascade paths:

- `users` hard delete cascades into auth sessions, role mappings, workplace records, evaluation records, project memberships, resource allocations, todos, notifications, and related user-owned records.
- `projects` hard delete cascades into WBS, reports, logs, budgets, issues, meetings, members, outputs, resource allocations, and dependent project history.
- `services` hard delete cascades into service environments, domains, content, translations, deployment history, change logs, and CMS records.
- `approval_documents` hard delete cascades into approval lines and actions.
- `evaluation_cycles` hard delete cascades into evaluation items, scores, evidences, and feedbacks.
- `news_posts`, `daily_reports`, `daily_logs`, `wbs_tasks`, and config parent tables cascade into child rows.

Polymorphic reference risk:

- `attachments.target_type/target_id`
- `comments.target_type/target_id`
- `notifications.related_type/related_id`
- `audit_logs.target_type/target_id`

These are application-guarded references. Parent hard delete can leave orphan metadata or broken links unless soft-delete/archive or orphan cleanup is defined.

## 9. Existing Lifecycle Surface

Production schema scan found:

- Tables with `deleted_at`, `deleted_by`, `is_deleted`, `archived_at`, or `is_archived`: 0
- Tables with lifecycle columns such as `status`, `is_active`, `revoked_at`, or `expires_at`: 37

Current lifecycle mechanisms include:

- User lifecycle: `active`, `invited`, `suspended`, `retired`.
- Service lifecycle: `draft`, `active`, `maintenance`, `retired`.
- Content/news/knowledge lifecycle: draft/review/published/archived/hidden variants.
- Project/WBS/workflow lifecycle status columns.
- Auth session expiry/revoke fields.
- API rate-limit windows.

Current delete surface:

- No broad API hard-delete route was identified in the Worker route scan.
- `daily_report_items` and `daily_log_items` are deleted inside atomic replacement CTEs for current user submissions; this is edit semantics, not retention cleanup.
- `MEDIA_BUCKET.delete(key)` is used only to clean up an R2 object after attachment metadata insert failure in media upload error handling.

## 10. Production Read-only Scan

The following read-only aggregate counts were collected from Production. No row values, PII, secrets, tokens, URLs, or business payloads were recorded.

| Check | Count |
|---|---:|
| Retired users | 0 |
| Login events older than 3 years | 0 |
| Audit logs older than 3 years | 0 |
| Email delivery logs older than 3 years | 0 |
| Notifications older than 90 days | 0 |
| Expired auth sessions | 0 |
| Revoked auth sessions | 0 |
| Expired API rate-limit rows older than 1 day | 0 |
| Archived service content items | 0 |
| Archived news posts | 0 |
| Archived board posts | 0 |
| Archived knowledge documents | 0 |
| Orphan project attachments | 0 |
| Orphan WBS attachments | 0 |
| Orphan expense attachments | 0 |
| Orphan project comments | 0 |
| Orphan WBS comments | 0 |

Immediate production deletion risk detected: NO.

## 11. Gaps

| Gap ID | Severity | Status | Scope | Evidence | Recommended action |
|---|---|---|---|---|---|
| P2-006-GAP-001 | P1 | GAP | TTL cleanup | `api_rate_limits`, `auth_sessions`, and `notifications` have expiry/window retention but no implemented cleanup job in this audit scope. | Add safe TTL cleanup batch with read-before-delete safeguards. |
| P2-006-GAP-002 | P1 | GAP | Append-only enforcement | `audit_logs`, `login_events`, `approval_actions`, `service_change_logs`, and `email_delivery_logs` are append-style records, but DB-level immutability is not enforced. | Define DB/API immutability guard or controlled retention delete path. |
| P2-006-GAP-003 | P1 | GAP | Cascade delete risk | User, project, service, approval, and evaluation parent hard deletes can cascade into important history. | Require soft-delete/archive-first policy before enabling parent delete routes. |
| P2-006-GAP-004 | P1 | GAP | Polymorphic references | Attachments, comments, notifications, and audit logs can reference deleted targets without physical FK. | Define tombstone/orphan cleanup and archive behavior. |
| P2-006-GAP-005 | P1 | GAP | R2 attachment lifecycle | `attachments` metadata and R2 object lifecycle are not fully defined for retention, deletion, audit, or orphan cleanup. | Define DB/R2 synchronized retention and deletion audit. |
| P2-006-GAP-006 | P1 | GAP | PII anonymization | Retired user, inquiry/CRM, workplace, evaluation, finance, email, login, and audit PII masking rules are not implemented. | Define anonymization/masking policy before cleanup. |
| P2-006-GAP-007 | P1 | POLICY_REVIEW_REQUIRED | Finance retention | Expense and budget evidence may need retention longer than the default project 3-year period. | Confirm finance retention policy before cleanup. |
| P2-006-GAP-008 | P2 | GAP | Public URL history | News/content/knowledge deletion could break public URLs, SEO, and linked history. | Define archived/tombstone/redirect behavior. |
| P2-006-GAP-009 | P2 | GAP | Archive scale | Audit/login and large business archives need scale strategy before 5M-row target. | Later archive/export/partition strategy. |
| P2-006-GAP-010 | P2 | GAP | Config/template history | Template/config retirement and version history is not fully specified. | Define version/archive convention for low-risk config objects. |

Gap counts:

- P0: 0
- P1: 7
- P2: 3
- Total: 10

## 12. P2-006 Exit Criteria

| Criterion | Status |
|---|---|
| 72/72 tables retention classified | PASS |
| PII classification complete | PASS |
| hard/soft/archive/immutable/TTL classification complete | PASS |
| FK delete risk audited | PASS |
| Polymorphic orphan risk audited | PASS |
| Existing lifecycle state mapped | PASS |
| Production old/orphan candidate scan complete | PASS |
| P0/P1/P2 gap classification complete | PASS |
| DATA_RETENTION.md generated | PASS |
| DB write | 0 |
| Migration | 0 |
| Code change | 0 |
| Delete/update | 0 |
| Secret exposure | 0 |

## 13. Verdict

P2-006 Retention / Soft Delete Audit: PASS.

Meaning: retention, delete strategy, PII, FK delete risk, polymorphic orphan risk, current lifecycle surface, production old/orphan candidates, and policy gaps have been inventoried for all 72 production tables. This does not implement cleanup, soft delete, anonymization, archive jobs, or DB-level immutability.

Immediate Production deletion risk detected: NO.

Next approved phase if no P0 retention gap remains:

Phase 2 - P2-007 Migration CI Audit.
