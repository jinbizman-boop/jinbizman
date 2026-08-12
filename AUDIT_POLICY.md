# JINBIZ MANAGEMENT Audit Policy

## Purpose

This policy defines the production audit trail for high-risk JINBIZ MANAGEMENT write actions. The audit trail must answer who acted, when the request happened, what target changed, which service/project context was involved, and which before/after business values changed.

## Scope

High-risk audit applies to authenticated Admin, ERP, and System write endpoints that mutate security, CMS, CRM, project/WBS, approval, evaluation, workplace, finance, service deployment, or system configuration data. GET endpoints remain access/request logging concerns, not global audit events, unless a later privacy/security review classifies a read path as sensitive.

## Audit Data Contract

Global audit writes use `audit_logs` without schema changes:

| Field | Policy |
|---|---|
| `request_id` | Server request id from the Worker request pipeline. Multiple audit rows in one request share this id. |
| `actor_user_id` | Authenticated server-side actor. Client-provided actor ids are never trusted. |
| `action_type` | Canonical action vocabulary below. |
| `target_type` | Canonical business object vocabulary below. |
| `target_id` | Target primary key when available. |
| `scope` | DB-compatible API scope: `public`, `admin`, `erp`, or `system`, inferred from request path unless explicitly set. RBAC data scope is represented by service/project ids and matrix notes. |
| `service_id` | Set for service/CMS/news/domain/deployment/site operations when available. |
| `project_id` | Set for project/WBS/daily work/resource/budget/expense/project-scoped operations when available. |
| `before_json` | Minimal previous state for update/review/finalize/upsert actions. Empty object for creates. |
| `after_json` | Minimal committed result or business outcome. |
| `ip_hash` | Privacy-preserving IP hash from the request helper. Raw IP is not stored. |
| `user_agent` | Request user agent string for incident correlation. |
| `status_code` | Success status or selected high-risk failure status. |
| `error_code` | Empty string on success; stable API error code for selected high-risk failures. |
| `duration_ms` | Optional measured duration when available. |
| `metadata_json` | Non-secret structured context such as template id, setting key, or group id. |

## High-Risk Action Definition

High-risk writes include:

- Auth/security administration: role creation, department administration, system settings, integrations, common codes.
- Service/CMS: service create/update, content/news create/update/publish, translation publish, domains, banners, navigation, deployments.
- CRM: inquiry status mutation and inquiry-to-lead conversion.
- Project/WBS: project create, WBS create/update, project issues, meetings, resource allocation.
- Approval: approval create/submit/action plus domain `approval_actions`.
- Evaluation: cycle create, score input, finalize.
- Workplace: attendance correction, leave balance/request/decision, timesheet submit/review.
- Finance: budget upsert, expense submit/status/payment transition.
- Knowledge/operations: board, knowledge document, knowledge template creation.

## Action Vocabulary

Use dotted action names: `<domain>.<verb>` or `<domain>.<state>`.

Canonical verbs: `create`, `update`, `upsert`, `submit`, `approve`, `reject`, `request`, `publish`, `convert`, `finalize`, `score`, `configure`.

Examples: `service.create`, `content.publish`, `inquiry.convert`, `wbs.update`, `approval.approve`, `evaluation.finalize`, `leave.approved`, `expense.paid`, `system.setting.update`.

## Target Vocabulary

Use stable business object names:

`service`, `service_domain`, `service_deployment`, `service_content_item`, `service_translation`, `news_post`, `news_post_translation`, `inquiry`, `lead`, `project`, `wbs_task`, `daily_report`, `daily_log`, `approval_document`, `approval_template`, `approval_template_step`, `evaluation_cycle`, `evaluation_score`, `attendance_record`, `leave_balance`, `leave_request`, `timesheet`, `project_resource_allocation`, `project_budget`, `expense_request`, `goal`, `board_post`, `knowledge_document`, `knowledge_template`, `integration`, `email_template`, `common_code_group`, `common_code`, `system_setting`.

## Before/After Policy

- Create actions record the committed row in `after_json`; `before_json` is `{}`.
- Update/review/finalize/upsert actions record `before_json` when the previous row is available.
- Full request payload dumps are prohibited. Handlers should record returned rows or explicit allowlisted business fields.
- Large content bodies may be represented by committed row metadata if a future storage policy requires truncation. No truncation helper is introduced in this GAP because existing payload limits are already enforced by GAP-P1-003.

## PII Policy

Audit rows prefer ids over repeated personal fields. Public inquiry conversion may contain CRM row fields already in the source object; no new PII collection is introduced by this GAP. Raw IP is never stored; only `ip_hash` is persisted.

## Secret Redaction

`writeAuditLog` sanitizes `before_json`, `after_json`, and `metadata_json` recursively. Sensitive keys such as password, password hash, access token, refresh token, JWT secret, database URL, API key, authorization header, cookie, private key, and generic secret/credential fields are replaced with `[REDACTED]`.

## Success Policy

Successful high-risk writes create a global `audit_logs` row. Domain-specific logs remain intact and are not replaced by global audit.

## Failure Policy

Routine malformed input (`400`/`422`) and anonymous `401` are not globally audited to avoid log floods. Selected high-risk authenticated failures (`403` permission/scope denial, `409` state conflict, `423` locked account/resource where applicable) should use the same audit contract when the route has enough target context. The current helper supports `status_code` and `error_code`; broad denial logging is a follow-up to avoid duplicating route-local auth checks.

## Transaction Policy

Where a handler performs multi-table writes in one SQL statement, audit is written after the committed business result is available. The current Neon access layer does not expose a reusable multi-statement transaction wrapper in every route. Therefore audit failures are fail-open and logged to Worker logs so the original business write is not left ambiguous by a secondary logging outage.

Phase 2 should review transactional coupling for conversion, approval action, daily report/log, leave, expense, and budget flows.

## Domain Logs vs Global Audit

| Domain log | Role |
|---|---|
| `login_events` | Authentication success/failure/lockout events. |
| `approval_actions` | Business approval action history and approver line integrity. |
| `service_change_logs` | Service Hub domain timeline; currently read API exists but writer coverage remains follow-up. |
| `email_delivery_logs` | Email delivery status and provider outcome. |
| `audit_logs` | Cross-domain security and operations audit trail for high-risk mutations. |

## Retention

Audit and operational logs are retained for 3 years by default, subject to legal, contract, privacy, and incident requirements. Retention automation is out of scope for GAP-P1-004.

## Testing Policy

Audit coverage is verified by:

- Source contract test for redaction and high-risk route audit calls.
- Worker regression tests for auth, authorization, API security, and mobile auth.
- TypeScript/build/release gates.
- No Production write tests in this GAP.

## Incident Use

Incident review should pivot on `request_id`, `actor_user_id`, `target_type`, `target_id`, `service_id`, `project_id`, `action_type`, `status_code`, and `created_at`.
