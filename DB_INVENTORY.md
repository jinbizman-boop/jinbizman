# JINBIZ MANAGEMENT Production DB Inventory v2

## 1. Snapshot Metadata

- Date: 2026-08-12T05:58:55Z
- Git HEAD: 6e13881fe4db818eafa7b73da9d2d84afcccc127
- Neon project: jinbiz-management
- Neon project id: mute-leaf-74331210
- Branch id checked: br-autumn-silence-a62bx2oe
- Database: neondb
- Schema: public
- Database user: neondb_owner
- PostgreSQL: PostgreSQL 18.4 (be2730e), server_version 18.4
- Timezone: GMT
- Migration source: db/migrations/001_core_org_auth.sql through 013_remaining_admin_operations.sql
- Applied migration: 13/13
- Base tables: 71
- Source of Truth: JINBIZ MANAGEMENT v2.0 requirements/master-plan PDFs, plus live Neon Production metadata.

No database write, migration, seed, source-code edit, Cloudflare edit, commit, or push was performed for P0-002.

## 2. Summary

| Object | Count | Notes |
|---|---:|---|
| Public base tables | 71 | Matches v2.0 71-table baseline. |
| Columns | 812 | From information_schema.columns. |
| Primary keys | 71 | Every base table has a PK. |
| Foreign keys | 149 | All checked FK constraints are validated. |
| Unique constraints | 41 | All checked UNIQUE constraints are validated. |
| Check constraints | 242 | From pg_constraint, excluding NOT NULL metadata. |
| Indexes | 416 | From pg_indexes for public schema. |
| Enum/user-defined types | 1 | user_status. |
| Triggers | 90 | Includes updated_at and business validation triggers. |
| Functions in public | 63 | Includes citext extension functions and 15 custom trigger functions. |
| Generated columns | 1 | expense_requests.total_amount. |

Constraint validation status:

| Type | Total | Validated | Not Validated |
|---|---:|---:|---:|
| CHECK | 242 | 242 | 0 |
| FK | 149 | 149 | 0 |
| PK | 71 | 71 | 0 |
| UNIQUE | 41 | 41 | 0 |

## 3. Migration Status

Source migrations:

| # | File | Domain |
|---:|---|---|
| 001 | 001_core_org_auth.sql | Auth / Organization |
| 002 | 002_service_hub.sql | Service Hub |
| 003 | 003_public_content.sql | Public / CRM |
| 004 | 004_projects_wbs.sql | Project / WBS |
| 005 | 005_daily_reports_logs.sql | Daily Work |
| 006 | 006_approvals.sql | Approval |
| 007 | 007_evaluations.sql | Evaluation |
| 008 | 008_domains_locales.sql | Domain / Locale |
| 009 | 009_audit_notifications.sql | Audit / Notification |
| 010 | 010_indexes_constraints.sql | Final indexes / constraints |
| 011 | 011_production_hardening.sql | Production hardening |
| 012 | 012_workplace_operations.sql | Workplace / Finance / Operations |
| 013 | 013_remaining_admin_operations.sql | Remaining admin operations |

DB schema_migrations:

- Applied count: 13
- Missing source migrations: none
- Extra DB migrations: none
- Duplicate migration filenames: none observed
- 001~013 continuity: PASS

## 4. Table Inventory

Notation: `!` = NOT NULL, `D` = default expression exists, `G` = generated column, `I` = identity. Row counts are estimates from `pg_stat_user_tables.n_live_tup`, not exact `count(*)`.

| Table | Est Rows | Cols | PK | FK | UQ | CK | IX | TRG | Columns |
|---|---:|---:|---|---:|---:|---:|---:|---:|---|
| api_rate_limits | 1 | 4 | bucket_key | 0 | 0 | 1 | 2 | 1 | bucket_key:character varying!, request_count:integer!:D, window_started_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| approval_actions | 0 | 8 | id | 3 | 0 | 1 | 8 | 2 | id:bigint!:D, approval_document_id:bigint!, approval_line_id:bigint, approver_user_id:bigint!, action_type:character varying!, comment:text!:D, acted_at:timestamp with time zone!:D, created_at:timestamp with time zone!:D |
| approval_documents | 0 | 14 | id | 4 | 0 | 5 | 13 | 5 | id:bigint!:D, document_type:character varying!, title:character varying!, project_id:bigint, service_id:bigint, requester_user_id:bigint!, related_wbs_task_id:bigint, status:character varying!:D, payload_json:jsonb!:D, submitted_at:timestamp with time zone, completed_at:timestamp with time zone, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D, business_domain_code:character varying |
| approval_lines | 0 | 10 | id | 2 | 2 | 4 | 9 | 1 | id:bigint!:D, approval_document_id:bigint!, sequence_no:integer!, approver_user_id:bigint!, line_role:character varying!:D, is_required:boolean!:D, line_status:character varying!:D, acted_at:timestamp with time zone, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| approval_template_steps | 0 | 8 | id | 2 | 1 | 2 | 2 | 0 | id:bigint!:D, template_id:bigint!, step_order:integer!, approver_role_code:text, approver_user_id:bigint, action_type:text!:D, is_required:boolean!:D, created_at:timestamp with time zone!:D |
| approval_templates | 0 | 10 | id | 1 | 1 | 0 | 2 | 1 | id:bigint!:D, template_code:text!, name:text!, document_type:text!, description:text!:D, requires_project:boolean!:D, is_active:boolean!:D, created_by:bigint, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| attachments | 0 | 13 | id | 3 | 0 | 5 | 8 | 1 | id:bigint!:D, target_type:character varying!, target_id:bigint!, service_id:bigint, project_id:bigint, uploaded_by:bigint, file_name:character varying!, file_url:text!, mime_type:character varying!:D, file_size_bytes:bigint!:D, metadata_json:jsonb!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| attendance_records | 0 | 12 | id | 1 | 1 | 4 | 4 | 1 | id:bigint!:D, user_id:bigint!, work_date:date!, clock_in_at:timestamp with time zone, clock_out_at:timestamp with time zone, work_status:character varying!:D, work_minutes:integer!:D, correction_status:character varying!:D, correction_reason:text!:D, note:text!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| audit_logs | 0 | 18 | id | 3 | 0 | 8 | 16 | 0 | id:bigint!:D, request_id:character varying!, actor_user_id:bigint, action_type:character varying!, target_type:character varying!, target_id:bigint, scope:character varying!, service_id:bigint, project_id:bigint, before_json:jsonb!:D, after_json:jsonb!:D, ip_hash:character varying!:D, user_agent:text!:D, status_code:integer, error_code:character varying!:D, duration_ms:integer, metadata_json:jsonb!:D, created_at:timestamp with time zone!:D |
| board_posts | 0 | 10 | id | 1 | 0 | 3 | 2 | 1 | id:bigint!:D, category:character varying!:D, title:character varying!, body:text!, status:character varying!:D, is_pinned:boolean!:D, author_user_id:bigint, published_at:timestamp with time zone, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| comments | 0 | 11 | id | 4 | 0 | 4 | 9 | 1 | id:bigint!:D, target_type:character varying!, target_id:bigint!, parent_comment_id:bigint, service_id:bigint, project_id:bigint, author_user_id:bigint, content:text!, is_internal:boolean!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| common_code_groups | 0 | 8 | id | 1 | 1 | 2 | 2 | 1 | id:bigint!:D, group_code:text!, name:text!, description:text!:D, is_active:boolean!:D, created_by:bigint, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| common_codes | 0 | 9 | id | 1 | 1 | 3 | 3 | 1 | id:bigint!:D, group_id:bigint!, code:text!, label:text!, sort_order:integer!:D, metadata_json:jsonb!:D, is_active:boolean!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| daily_log_items | 0 | 12 | id | 2 | 1 | 5 | 7 | 3 | id:bigint!:D, daily_log_id:bigint!, wbs_task_id:bigint!, work_summary:text!, is_completed:boolean!, actual_progress:integer!, output_url:text!:D, delay_reason_code:character varying!:D, issue_memo:text!:D, next_action:text!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| daily_logs | 0 | 13 | id | 3 | 1 | 0 | 10 | 3 | id:bigint!:D, user_id:bigint!, department_id:bigint, log_date:date!, project_id:bigint!, daily_summary:text!:D, collaboration_summary:text!:D, pending_approval_summary:text!:D, has_blocker:boolean!:D, support_needed_text:text!:D, submitted_at:timestamp with time zone, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| daily_report_items | 0 | 12 | id | 2 | 1 | 2 | 6 | 3 | id:bigint!:D, daily_report_id:bigint!, wbs_task_id:bigint!, goal_text:text!, expected_hours:numeric!:D, collaboration_needed:boolean!:D, has_preceding_issue:boolean!:D, risk_text:text!:D, support_request_text:text!:D, target_completed_at:time without time zone, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| daily_reports | 0 | 13 | id | 3 | 1 | 0 | 10 | 3 | id:bigint!:D, user_id:bigint!, department_id:bigint, report_date:date!, project_id:bigint!, today_focus:text!:D, top_priority_text:text!:D, expected_blockers_text:text!:D, support_request_target:text!:D, expects_approval:boolean!:D, submitted_at:timestamp with time zone, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| departments | 11 | 8 | id | 1 | 1 | 3 | 6 | 1 | id:bigint!:D, code:text!, name:text!, parent_id:bigint, sort_order:integer!:D, is_active:boolean!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| email_delivery_logs | 0 | 13 | id | 0 | 0 | 4 | 4 | 1 | id:bigint!:D, message_type:character varying!, provider:character varying!:D, provider_id:character varying!:D, related_type:character varying!:D, related_id:bigint, recipient:citext!, status:character varying!, error_message:text!:D, request_id:character varying!, metadata_json:jsonb!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| email_templates | 0 | 11 | id | 1 | 1 | 5 | 3 | 1 | id:bigint!:D, code:character varying!, locale:character varying!:D, name:character varying!, subject_template:text!, html_template:text!, text_template:text!:D, is_active:boolean!:D, updated_by:bigint, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| evaluation_cycles | 0 | 11 | id | 1 | 0 | 5 | 7 | 3 | id:bigint!:D, name:character varying!, start_date:date!, end_date:date!, status:character varying!:D, description:text!:D, created_by:bigint, finalized_at:timestamp with time zone, closed_at:timestamp with time zone, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| evaluation_evidences | 0 | 11 | id | 4 | 1 | 2 | 10 | 1 | id:bigint!:D, cycle_id:bigint!, user_id:bigint!, source_type:character varying!, source_id:bigint!, service_id:bigint, project_id:bigint, summary_json:jsonb!:D, occurred_at:timestamp with time zone!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| evaluation_feedbacks | 0 | 9 | id | 3 | 0 | 2 | 6 | 1 | id:bigint!:D, cycle_id:bigint!, evaluatee_user_id:bigint!, author_user_id:bigint!, feedback_type:character varying!:D, content:text!, is_visible_to_user:boolean!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| evaluation_items | 0 | 12 | id | 1 | 1 | 6 | 8 | 1 | id:bigint!:D, cycle_id:bigint!, code:character varying!, name:character varying!, item_group:character varying!, weight:numeric!, sort_order:integer!:D, description:text!:D, is_active:boolean!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D, business_domain_code:character varying |
| evaluation_scores | 0 | 9 | id | 4 | 1 | 1 | 9 | 5 | id:bigint!:D, cycle_id:bigint!, evaluatee_user_id:bigint!, evaluator_user_id:bigint!, evaluation_item_id:bigint!, score:numeric!, comment:text!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| expense_requests | 0 | 16 | id | 5 | 0 | 4 | 3 | 1 | id:bigint!:D, requester_user_id:bigint!, project_id:bigint, budget_id:bigint, expense_date:date!, vendor_name:character varying!:D, description:text!, supply_amount:numeric!:D, tax_amount:numeric!:D, total_amount:numeric:G, currency:character!:D, status:character varying!:D, receipt_attachment_id:bigint, approval_document_id:bigint, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| goals | 0 | 16 | id | 4 | 0 | 6 | 4 | 1 | id:bigint!:D, owner_type:character varying!:D, owner_user_id:bigint, department_id:bigint, project_id:bigint, cycle_label:character varying!, title:character varying!, metric_name:character varying!:D, target_value:numeric, current_value:numeric, unit:character varying!:D, status:character varying!:D, weight:numeric!:D, created_by:bigint, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| inquiries | 0 | 17 | id | 2 | 0 | 8 | 10 | 1 | id:bigint!:D, inquiry_type:character varying!, company_name:character varying!:D, name:character varying!, email:citext!, phone:character varying!:D, message:text!, locale:character varying!:D, status:character varying!:D, assigned_user_id:bigint, lead_status:character varying!:D, project_id:bigint, source_channel:character varying!:D, internal_note:text!:D, converted_at:timestamp with time zone, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| integrations | 0 | 10 | id | 0 | 1 | 4 | 3 | 1 | id:bigint!:D, code:character varying!, name:character varying!, integration_type:character varying!, status:character varying!:D, config_json:jsonb!:D, last_checked_at:timestamp with time zone, last_error:text!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| knowledge_documents | 0 | 10 | id | 1 | 0 | 3 | 2 | 1 | id:bigint!:D, category:character varying!:D, title:character varying!, body:text!, tags:ARRAY!:D, status:character varying!:D, owner_user_id:bigint, source_url:text!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| knowledge_templates | 0 | 10 | id | 1 | 1 | 0 | 2 | 1 | id:bigint!:D, code:text!, name:text!, category:text!:D, description:text!:D, template_body:text!:D, is_active:boolean!:D, created_by:bigint, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| leads | 0 | 17 | id | 3 | 0 | 5 | 9 | 1 | id:bigint!:D, inquiry_id:bigint, service_id:bigint, owner_user_id:bigint, company_name:character varying!:D, contact_name:character varying!, email:citext!, phone:character varying!:D, source_channel:character varying!:D, lead_type:character varying!:D, status:character varying!:D, score:integer!:D, notes:text!:D, converted_to_project:boolean!:D, converted_at:timestamp with time zone, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| leave_balances | 0 | 8 | id | 1 | 1 | 4 | 2 | 1 | id:bigint!:D, user_id:bigint!, balance_year:integer!, granted_days:numeric!:D, used_days:numeric!:D, adjusted_days:numeric!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| leave_requests | 0 | 13 | id | 3 | 0 | 5 | 3 | 1 | id:bigint!:D, user_id:bigint!, leave_type:character varying!:D, start_date:date!, end_date:date!, requested_days:numeric!, reason:text!:D, status:character varying!:D, approval_document_id:bigint, decided_by:bigint, decided_at:timestamp with time zone, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| login_events | 27 | 9 | id | 1 | 0 | 4 | 4 | 0 | id:bigint!:D, user_id:bigint, email:citext!, event_type:character varying!, ip_hash:character varying!, user_agent:text!:D, request_id:character varying!, metadata_json:jsonb!:D, created_at:timestamp with time zone!:D |
| meeting_action_items | 0 | 9 | id | 3 | 0 | 1 | 1 | 1 | id:bigint!:D, meeting_id:bigint!, assignee_user_id:bigint, wbs_task_id:bigint, title:text!, due_date:date, status:text!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| news_post_translations | 0 | 13 | id | 1 | 1 | 5 | 10 | 3 | id:bigint!:D, news_post_id:bigint!, locale:character varying!, title:character varying!, summary:text!:D, body:text!:D, slug:character varying!, seo_title:character varying!:D, seo_description:text!:D, status:character varying!:D, published_at:timestamp with time zone, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| news_posts | 0 | 15 | id | 4 | 1 | 5 | 11 | 1 | id:bigint!:D, category:character varying!, service_id:bigint, title:character varying!, slug:character varying!, summary:text!:D, body:text!:D, status:character varying!:D, is_pinned:boolean!:D, published_at:timestamp with time zone, author_user_id:bigint, created_by:bigint, updated_by:bigint, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| notifications | 0 | 16 | id | 3 | 0 | 6 | 9 | 1 | id:bigint!:D, recipient_user_id:bigint!, notification_type:character varying!, channel:character varying!:D, title:character varying!, message:text!:D, related_type:character varying!:D, related_id:bigint, service_id:bigint, project_id:bigint, is_read:boolean!:D, read_at:timestamp with time zone, sent_at:timestamp with time zone, metadata_json:jsonb!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| opportunities | 0 | 13 | id | 4 | 0 | 4 | 9 | 1 | id:bigint!:D, lead_id:bigint, service_id:bigint, owner_user_id:bigint, title:character varying!, stage:character varying!:D, expected_value:numeric!:D, currency_code:character varying!:D, expected_close_date:date, project_id:bigint, notes:text!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| permissions | 74 | 7 | id | 0 | 1 | 2 | 4 | 1 | id:bigint!:D, code:text!, name:text!, description:text, group_key:text, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| project_budgets | 0 | 10 | id | 1 | 1 | 5 | 3 | 1 | id:bigint!:D, project_id:bigint!, category_code:character varying!, category_name:character varying!, planned_amount:numeric!:D, committed_amount:numeric!:D, spent_amount:numeric!:D, currency:character!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| project_issues | 0 | 14 | id | 4 | 0 | 5 | 7 | 1 | id:bigint!:D, project_id:bigint!, wbs_task_id:bigint, issue_type:character varying!:D, title:character varying!, description:text!:D, priority:character varying!:D, status:character varying!:D, reporter_user_id:bigint, assignee_user_id:bigint, due_date:date, resolved_at:timestamp with time zone, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| project_meetings | 0 | 10 | id | 2 | 0 | 1 | 2 | 1 | id:bigint!:D, project_id:bigint!, title:text!, meeting_at:timestamp with time zone!, location:text!:D, meeting_url:text!:D, minutes:text!:D, created_by:bigint, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| project_members | 0 | 6 | id | 2 | 1 | 1 | 5 | 0 | id:bigint!:D, project_id:bigint!, user_id:bigint!, role_in_project:character varying!, joined_at:timestamp with time zone!:D, created_at:timestamp with time zone!:D |
| project_outputs | 0 | 13 | id | 3 | 0 | 2 | 5 | 1 | id:bigint!:D, project_id:bigint!, wbs_task_id:bigint, output_type:character varying!:D, title:character varying!, file_url:text!:D, external_url:text!:D, version_label:character varying!:D, is_final:boolean!:D, uploaded_by:bigint, metadata_json:jsonb!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| project_resource_allocations | 0 | 8 | id | 2 | 1 | 2 | 3 | 1 | id:bigint!:D, project_id:bigint!, user_id:bigint!, allocation_month:date!, allocation_percent:numeric!, note:text!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| projects | 0 | 14 | id | 2 | 1 | 7 | 10 | 1 | id:bigint!:D, code:character varying!, name:character varying!, project_type:character varying!, service_id:bigint, status:character varying!:D, owner_user_id:bigint, start_date:date, end_date:date, description:text!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D, business_domain_code:character varying, cybertron_module_code:character varying |
| role_permissions | 331 | 4 | id | 2 | 1 | 0 | 4 | 0 | id:bigint!:D, role_id:bigint!, permission_id:bigint!, created_at:timestamp with time zone!:D |
| roles | 22 | 7 | id | 0 | 1 | 2 | 4 | 1 | id:bigint!:D, code:text!, name:text!, description:text, is_system:boolean!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| schema_migrations | 13 | 2 | filename | 0 | 0 | 0 | 1 | 0 | filename:text!, applied_at:timestamp with time zone!:D |
| service_change_logs | 0 | 10 | id | 2 | 0 | 2 | 7 | 0 | id:bigint!:D, service_id:bigint!, action_type:character varying!, target_type:character varying!, target_id:bigint, before_json:jsonb!:D, after_json:jsonb!:D, metadata_json:jsonb!:D, actor_user_id:bigint, created_at:timestamp with time zone!:D |
| service_connections | 0 | 13 | id | 1 | 1 | 3 | 6 | 1 | id:bigint!:D, service_id:bigint!, connection_code:character varying!, connection_type:character varying!, provider_code:character varying!:D, target_name:character varying!:D, target_identifier:character varying!:D, connection_status:character varying!:D, config_json:jsonb!:D, secret_ref:character varying!:D, last_checked_at:timestamp with time zone, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| service_content_items | 0 | 15 | id | 5 | 1 | 5 | 10 | 1 | id:bigint!:D, service_id:bigint!, content_type_id:bigint!, parent_item_id:bigint, title:character varying!, slug:character varying!, status:character varying!:D, sort_order:integer!:D, is_system:boolean!:D, payload_json:jsonb!:D, published_at:timestamp with time zone, created_by:bigint, updated_by:bigint, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| service_content_types | 0 | 10 | id | 1 | 1 | 3 | 6 | 1 | id:bigint!:D, service_id:bigint!, type_code:character varying!, name:character varying!, category:character varying!:D, sort_order:integer!:D, schema_json:jsonb!:D, is_active:boolean!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| service_deployments | 0 | 10 | id | 2 | 0 | 2 | 2 | 0 | id:bigint!:D, service_id:bigint!, environment:text!, version_label:text!, status:text!:D, source_ref:text!:D, notes:text!:D, requested_by:bigint, requested_at:timestamp with time zone!:D, completed_at:timestamp with time zone |
| service_domains | 0 | 7 | id | 1 | 1 | 2 | 8 | 5 | id:bigint!:D, service_id:bigint!, domain:character varying!, locale:character varying!, is_canonical:boolean!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| service_environments | 0 | 15 | id | 1 | 1 | 1 | 6 | 1 | id:bigint!:D, service_id:bigint!, env_type:character varying!, base_url:character varying!:D, admin_url:character varying!:D, api_base_url:character varying!:D, webhook_base_url:character varying!:D, branch_name:character varying!:D, deployment_provider:character varying!:D, deployment_config_json:jsonb!:D, is_primary:boolean!:D, is_active:boolean!:D, last_deployed_at:timestamp with time zone, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| service_translations | 0 | 12 | id | 1 | 1 | 5 | 10 | 5 | id:bigint!:D, service_content_item_id:bigint!, locale:character varying!, title:character varying!, slug:character varying!, seo_title:character varying!:D, seo_description:text!:D, payload_json:jsonb!:D, status:character varying!:D, published_at:timestamp with time zone, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| services | 0 | 26 | id | 3 | 1 | 12 | 12 | 1 | id:bigint!:D, service_code:character varying!, service_name:character varying!, service_type:character varying!, brand_name:character varying!:D, status:character varying!:D, domain:character varying!, env_type:character varying!:D, owner_department:character varying!:D, default_locale:character varying!:D, supported_locales:ARRAY!:D, i18n_enabled:boolean!:D, permission_template_code:character varying!:D, content_model_code:character varying!:D, deploy_type:character varying!:D, notify_type:character varying!:D, seo_enabled:boolean!:D, shared_asset_enabled:boolean!:D, is_visible_in_admin:boolean!:D, owner_department_id:bigint, operator_user_id:bigint, tech_owner_user_id:bigint, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D, business_domain_code:character varying, cybertron_module_code:character varying |
| site_banners | 0 | 14 | id | 2 | 1 | 1 | 3 | 1 | id:bigint!:D, service_id:bigint!, banner_code:text!, locale:character varying!:D, title:text!, body:text!:D, link_url:text!:D, placement:text!:D, starts_at:timestamp with time zone, ends_at:timestamp with time zone, is_active:boolean!:D, created_by:bigint, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| site_navigation_items | 0 | 10 | id | 2 | 0 | 2 | 2 | 1 | id:bigint!:D, service_id:bigint!, locale:character varying!:D, parent_id:bigint, label:text!, href:text!, sort_order:integer!:D, is_active:boolean!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| system_settings | 5 | 7 | setting_key | 1 | 0 | 1 | 1 | 1 | setting_key:character varying!, setting_value:jsonb!:D, description:text!:D, is_secret_ref:boolean!:D, updated_by:bigint, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| timesheets | 0 | 13 | id | 5 | 1 | 2 | 4 | 1 | id:bigint!:D, user_id:bigint!, project_id:bigint!, wbs_task_id:bigint, work_date:date!, hours:numeric!, description:text!:D, status:character varying!:D, approval_document_id:bigint, reviewed_by:bigint, reviewed_at:timestamp with time zone, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| todo_items | 0 | 13 | id | 3 | 0 | 5 | 3 | 1 | id:bigint!:D, user_id:bigint!, wbs_task_id:bigint, source_type:character varying!:D, title:character varying!, description:text!:D, status:character varying!:D, priority:character varying!:D, due_at:timestamp with time zone, completed_at:timestamp with time zone, created_by:bigint, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| user_roles | 1 | 4 | id | 2 | 1 | 0 | 4 | 0 | id:bigint!:D, user_id:bigint!, role_id:bigint!, created_at:timestamp with time zone!:D |
| users | 1 | 17 | id | 1 | 1 | 5 | 8 | 1 | id:bigint!:D, email:citext!, password_hash:text, name:text!, phone:text, status:user_status!:D, department_id:bigint, job_family:text, job_role:text, joined_at:date, left_at:date, last_login_at:timestamp with time zone, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D, failed_login_count:integer!:D, locked_until:timestamp with time zone, password_changed_at:timestamp with time zone |
| wbs_task_dependencies | 0 | 5 | id | 2 | 1 | 2 | 4 | 0 | id:bigint!:D, task_id:bigint!, depends_on_task_id:bigint!, dependency_type:character varying!:D, created_at:timestamp with time zone!:D |
| wbs_tasks | 0 | 27 | id | 7 | 0 | 10 | 13 | 1 | id:bigint!:D, project_id:bigint!, parent_task_id:bigint, template_id:bigint, template_item_id:bigint, title:character varying!, description:text!:D, task_type:character varying!:D, job_family:character varying!:D, work_style:character varying!:D, assignee_user_id:bigint, reviewer_user_id:bigint, approver_user_id:bigint, start_date:date, due_date:date, planned_progress:integer!:D, actual_progress:integer!:D, priority:character varying!:D, status:character varying!:D, weight:numeric!:D, requires_approval:boolean!:D, approval_completed_at:timestamp with time zone, output_url:text!:D, qa_status:character varying!:D, deploy_status:character varying!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| wbs_template_items | 0 | 17 | id | 2 | 0 | 5 | 4 | 1 | id:bigint!:D, template_id:bigint!, parent_item_id:bigint, title:character varying!, description:text!:D, task_type:character varying!:D, sort_order:integer!:D, default_job_family:character varying!:D, default_work_style:character varying!:D, default_priority:character varying!:D, default_weight:numeric!:D, default_start_offset_days:integer!:D, default_due_offset_days:integer!:D, requires_approval:boolean!:D, metadata_json:jsonb!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D |
| wbs_templates | 0 | 11 | id | 0 | 1 | 6 | 7 | 1 | id:bigint!:D, code:character varying!, name:character varying!, job_family:character varying!, work_style:character varying!, is_active:boolean!:D, schema_json:jsonb!:D, created_at:timestamp with time zone!:D, updated_at:timestamp with time zone!:D, business_domain_code:character varying, cybertron_module_code:character varying |

## 5. ENUM / Types

| Type | Values | Used by |
|---|---|---|
| user_status | active, invited, suspended, retired | users.status |

## 6. Foreign Key Relationship Summary

Tables without FKs: api_rate_limits, email_delivery_logs, integrations, permissions, roles, schema_migrations, wbs_templates.

Core relationship map:

- Auth / Org: users.department_id -> departments.id; departments.parent_id -> departments.id; user_roles connects users and roles; role_permissions connects roles and permissions.
- Public / CRM: inquiries may assign users and link projects; leads link inquiries/services/users; opportunities link leads/services/users/projects.
- Service / CMS: services link departments/users; service environments, connections, content types, content items, domains, translations, deployments, banners, navigation, and change logs link back to services.
- Project / WBS: projects link services/users; project_members link projects/users; wbs_tasks link projects, templates, template items, parent tasks, assignee/reviewer/approver users; wbs_task_dependencies self-link wbs_tasks; outputs/issues/meetings/action items link project/WBS/users.
- Daily Work: daily_reports and daily_logs link users, departments, projects; item tables require WBS task references.
- Approval: approval_documents link requester, project, service, WBS task; lines and actions link documents/users.
- Evaluation: cycles/items/scores/evidences/feedbacks link users, projects, services, and cycle/item records.
- Workplace / Finance: attendance, leave, timesheets, allocations, budgets, expenses, and goals link users/projects/approval/budget/attachments.
- Operations / System: audit_logs, notifications, attachments, comments, email templates, system settings, integrations, knowledge, board posts, and rate limits form the operational support layer.

## 7. Unique / Check Constraint Highlights

The full table inventory above records per-table UNIQUE and CHECK counts. Key verified invariants:

- Auth: users_email_uk, roles_code_uk, permissions_code_uk, user_roles_user_role_uk, role_permissions_role_permission_uk.
- Service / CMS: services_service_code_uk, service_domains_service_locale_uk, service_content_items_service_content_slug_uk, service_translations_item_locale_uk, locale checks for ko/en/ja/fr/es, single-canonical partial unique indexes.
- Public / CRM: inquiries locale/status/lead_status checks, news slug uniqueness, news translation post+locale uniqueness, lead score check.
- Project / WBS: projects_code_uk, progress range checks on wbs_tasks, no self-dependency on wbs_task_dependencies, WBS done requires 100 percent progress, approval-required WBS cannot be done before approval_completed_at.
- Daily Work: daily_report_items and daily_log_items require WBS FK, report/log item uniqueness per report/log and WBS, daily log incomplete items require delay reason and next action.
- Approval: document status vocabulary, line sequence >= 1, unique line sequence and approver per document, submitted approval documents require lines through trigger.
- Evaluation: score range check, score item/cycle match trigger, score requires evidence trigger, cycle finalize requirements trigger.
- Workplace: attendance user/date unique, clock-out >= clock-in, leave date range and requested_days checks, leave balance remaining check, timesheet hours 0-24.
- Finance: project budget planned/committed/spent amounts >= 0, expense supply/tax amounts >= 0, generated total_amount.

## 8. Index Inventory

All 416 public indexes were listed from pg_indexes. Names by table:

| Table | Count | Indexes |
|---|---:|---|
| api_rate_limits | 2 | api_rate_limits_pkey, api_rate_limits_window_started_at_idx |
| approval_actions | 8 | approval_actions_pkey, ix_approval_actions_acted_at, ix_approval_actions_action_type, ix_approval_actions_approval_document_id, ix_approval_actions_approval_line_id, ix_approval_actions_approver_user_id, ix_approval_actions_document_approver, ix_final_approval_actions_document_acted_at |
| approval_documents | 13 | approval_documents_pkey, ix_approval_documents_business_domain, ix_approval_documents_created_at, ix_approval_documents_document_type, ix_approval_documents_project_id, ix_approval_documents_related_wbs_task_id, ix_approval_documents_requester_user_id, ix_approval_documents_service_id, ix_approval_documents_status, ix_approval_documents_status_requester, ix_approval_documents_submitted_at, ix_final_approval_documents_project_service_status, ix_final_approval_documents_status_requester_submitted |
| approval_lines | 9 | approval_lines_document_approver_uk, approval_lines_document_sequence_uk, approval_lines_pkey, ix_approval_lines_approval_document_id, ix_approval_lines_approver_status, ix_approval_lines_approver_user_id, ix_approval_lines_document_sequence, ix_approval_lines_line_status, ix_final_approval_lines_approver_status_acted_at |
| approval_template_steps | 2 | approval_template_steps_pkey, approval_template_steps_template_id_step_order_key |
| approval_templates | 2 | approval_templates_pkey, approval_templates_template_code_key |
| attachments | 8 | attachments_pkey, ix_attachments_created_at, ix_attachments_project_id, ix_attachments_service_id, ix_attachments_target, ix_attachments_target_created_at, ix_attachments_uploaded_by, ix_final_attachments_target_created_at |
| attendance_records | 4 | attendance_records_pkey, attendance_records_user_date_uk, ix_attendance_records_user_work_date, ix_attendance_records_work_date |
| audit_logs | 16 | audit_logs_pkey, ix_audit_logs_action_type, ix_audit_logs_actor_user_id, ix_audit_logs_created_at, ix_audit_logs_project_action_created_at, ix_audit_logs_project_id, ix_audit_logs_request_id, ix_audit_logs_scope, ix_audit_logs_scope_created_at, ix_audit_logs_service_action_created_at, ix_audit_logs_service_id, ix_audit_logs_target, ix_final_audit_logs_actor_created_at, ix_final_audit_logs_project_action_created_at, ix_final_audit_logs_scope_created_at, ix_final_audit_logs_service_action_created_at |
| board_posts | 2 | board_posts_pkey, ix_board_posts_status_published |
| comments | 9 | comments_pkey, ix_comments_author_user_id, ix_comments_created_at, ix_comments_parent_comment_id, ix_comments_project_id, ix_comments_service_id, ix_comments_target, ix_comments_target_created_at, ix_final_comments_target_created_at |
| common_code_groups | 2 | common_code_groups_group_code_key, common_code_groups_pkey |
| common_codes | 3 | common_codes_group_id_code_key, common_codes_pkey, ix_common_codes_group_sort |
| daily_log_items | 7 | daily_log_items_log_task_uk, daily_log_items_pkey, ix_daily_log_items_actual_progress, ix_daily_log_items_daily_log_id, ix_daily_log_items_log_task, ix_daily_log_items_wbs_task_id, ix_final_daily_log_items_task_log_progress |
| daily_logs | 10 | daily_logs_pkey, daily_logs_user_date_project_uk, ix_daily_logs_department_id, ix_daily_logs_log_date, ix_daily_logs_project_date, ix_daily_logs_project_id, ix_daily_logs_submitted_at, ix_daily_logs_user_date, ix_daily_logs_user_id, ix_final_daily_logs_user_date_submitted |
| daily_report_items | 6 | daily_report_items_pkey, daily_report_items_report_task_uk, ix_daily_report_items_daily_report_id, ix_daily_report_items_report_task, ix_daily_report_items_wbs_task_id, ix_final_daily_report_items_task_report |
| daily_reports | 10 | daily_reports_pkey, daily_reports_user_date_project_uk, ix_daily_reports_department_id, ix_daily_reports_project_date, ix_daily_reports_project_id, ix_daily_reports_report_date, ix_daily_reports_submitted_at, ix_daily_reports_user_date, ix_daily_reports_user_id, ix_final_daily_reports_user_date_submitted |
| departments | 6 | departments_code_lower_uk, departments_code_uk, departments_is_active_idx, departments_parent_id_idx, departments_pkey, departments_sort_order_idx |
| email_delivery_logs | 4 | email_delivery_logs_pkey, ix_email_delivery_related, ix_email_delivery_request, ix_email_delivery_status |
| email_templates | 3 | email_templates_code_locale_uk, email_templates_pkey, ix_email_templates_active |
| evaluation_cycles | 7 | evaluation_cycles_pkey, ix_evaluation_cycles_created_by, ix_evaluation_cycles_end_date, ix_evaluation_cycles_start_date, ix_evaluation_cycles_status, ix_evaluation_cycles_status_end_date, ix_final_evaluation_cycles_status_end_date |
| evaluation_evidences | 10 | evaluation_evidences_cycle_user_source_uk, evaluation_evidences_pkey, ix_evaluation_evidences_cycle_id, ix_evaluation_evidences_cycle_user_occurred_at, ix_evaluation_evidences_occurred_at, ix_evaluation_evidences_project_id, ix_evaluation_evidences_service_id, ix_evaluation_evidences_source, ix_evaluation_evidences_user_id, ix_final_evaluation_evidences_cycle_user_occurred_at |
| evaluation_feedbacks | 6 | evaluation_feedbacks_pkey, ix_evaluation_feedbacks_author_user_id, ix_evaluation_feedbacks_cycle_id, ix_evaluation_feedbacks_evaluatee_user_id, ix_evaluation_feedbacks_feedback_type, ix_final_evaluation_feedbacks_cycle_user_type |
| evaluation_items | 8 | evaluation_items_cycle_code_uk, evaluation_items_pkey, ix_evaluation_items_business_domain, ix_evaluation_items_cycle_id, ix_evaluation_items_cycle_sort, ix_evaluation_items_item_group, ix_final_evaluation_items_cycle_group_sort, ux_evaluation_items_cycle_code_lower |
| evaluation_scores | 9 | evaluation_scores_cycle_evale_evalr_item_uk, evaluation_scores_pkey, ix_evaluation_scores_cycle_evaluatee_item, ix_evaluation_scores_cycle_id, ix_evaluation_scores_evaluatee_user_id, ix_evaluation_scores_evaluator_user_id, ix_evaluation_scores_item_id, ix_final_evaluation_scores_cycle_evaluatee_item, ix_final_evaluation_scores_evaluator_cycle |
| expense_requests | 3 | expense_requests_pkey, ix_expense_requests_project_status, ix_expense_requests_requester_date |
| goals | 4 | goals_pkey, ix_goals_department, ix_goals_owner_user, ix_goals_project |
| inquiries | 10 | inquiries_pkey, ix_final_inquiries_status_assigned_created_at, ix_inquiries_assigned_user_id, ix_inquiries_company_name, ix_inquiries_created_at, ix_inquiries_email, ix_inquiries_locale, ix_inquiries_project_id, ix_inquiries_status, ix_inquiries_status_assigned_user_id |
| integrations | 3 | integrations_code_uk, integrations_pkey, ix_integrations_type_status |
| knowledge_documents | 2 | ix_knowledge_documents_status_category, knowledge_documents_pkey |
| knowledge_templates | 2 | knowledge_templates_code_key, knowledge_templates_pkey |
| leads | 9 | ix_final_leads_status_owner_created_at, ix_leads_created_at, ix_leads_email, ix_leads_inquiry_id, ix_leads_owner_user_id, ix_leads_service_id, ix_leads_status, ix_leads_status_owner_user_id, leads_pkey |
| leave_balances | 2 | leave_balances_pkey, leave_balances_user_year_uk |
| leave_requests | 3 | ix_leave_requests_status_date, ix_leave_requests_user_status, leave_requests_pkey |
| login_events | 4 | ix_login_events_email_created_at, ix_login_events_type_created_at, ix_login_events_user_created_at, login_events_pkey |
| meeting_action_items | 1 | meeting_action_items_pkey |
| news_post_translations | 10 | ix_final_news_post_translations_locale_status_published_at, ix_news_post_translations_locale_status, ix_news_post_translations_news_post_id, ix_news_post_translations_published_at, ix_news_post_translations_status, news_post_translations_pkey, news_post_translations_post_locale_uk, ux_final_news_post_translations_post_locale, ux_final_news_post_translations_slug_locale, ux_news_post_translations_slug_locale_lower |
| news_posts | 11 | ix_final_news_posts_category_status_published_at, ix_news_posts_author_user_id, ix_news_posts_category, ix_news_posts_category_status_published_at, ix_news_posts_published_at, ix_news_posts_service_id, ix_news_posts_status, news_posts_pkey, news_posts_slug_uk, ux_final_news_posts_slug, ux_news_posts_slug_lower |
| notifications | 9 | ix_final_notifications_recipient_read_created_at, ix_notifications_created_at, ix_notifications_is_read, ix_notifications_project_id, ix_notifications_recipient_read_created_at, ix_notifications_recipient_user_id, ix_notifications_related, ix_notifications_service_id, notifications_pkey |
| opportunities | 9 | ix_final_opportunities_stage_owner_close_date, ix_opportunities_expected_close_date, ix_opportunities_lead_id, ix_opportunities_owner_user_id, ix_opportunities_project_id, ix_opportunities_service_id, ix_opportunities_stage, ix_opportunities_stage_owner_user_id, opportunities_pkey |
| permissions | 4 | permissions_code_lower_uk, permissions_code_uk, permissions_group_key_idx, permissions_pkey |
| project_budgets | 3 | ix_project_budgets_project, project_budgets_pkey, project_budgets_project_category_uk |
| project_issues | 7 | ix_final_project_issues_project_status_priority, ix_project_issues_assignee_user_id, ix_project_issues_issue_type, ix_project_issues_project_id, ix_project_issues_status, ix_project_issues_wbs_task_id, project_issues_pkey |
| project_meetings | 2 | ix_project_meetings_project_at, project_meetings_pkey |
| project_members | 5 | ix_final_project_members_user_project, ix_project_members_role_in_project, ix_project_members_user_id, project_members_pkey, project_members_project_user_uk |
| project_outputs | 5 | ix_final_project_outputs_project_wbs_created_at, ix_project_outputs_project_id, ix_project_outputs_uploaded_by, ix_project_outputs_wbs_task_id, project_outputs_pkey |
| project_resource_allocations | 3 | ix_project_resource_allocations_user_month, project_resource_allocations_pkey, project_resource_allocations_uk |
| projects | 10 | ix_final_projects_status_owner_end_date, ix_projects_business_domain, ix_projects_end_date, ix_projects_owner_user_id, ix_projects_service_id, ix_projects_start_date, ix_projects_status, projects_code_uk, projects_pkey, ux_projects_code_lower |
| role_permissions | 4 | role_permissions_permission_id_idx, role_permissions_pkey, role_permissions_role_id_idx, role_permissions_role_permission_uk |
| roles | 4 | roles_code_lower_uk, roles_code_uk, roles_is_system_idx, roles_pkey |
| schema_migrations | 1 | schema_migrations_pkey |
| service_change_logs | 7 | ix_final_service_change_logs_service_created_at, ix_service_change_logs_actor_user_id, ix_service_change_logs_created_at, ix_service_change_logs_service_created_at, ix_service_change_logs_service_id, ix_service_change_logs_target, service_change_logs_pkey |
| service_connections | 6 | ix_service_connections_service_id, ix_service_connections_status, ix_service_connections_type_status, service_connections_pkey, service_connections_service_code_uk, ux_service_connections_code_lower |
| service_content_items | 10 | ix_final_service_content_items_service_status_published_at, ix_service_content_items_content_type_id, ix_service_content_items_parent_item_id, ix_service_content_items_published_at, ix_service_content_items_service_id, ix_service_content_items_service_status, ix_service_content_items_status, service_content_items_pkey, service_content_items_service_content_slug_uk, ux_service_content_items_slug_lower |
| service_content_types | 6 | ix_service_content_types_category, ix_service_content_types_is_active, ix_service_content_types_service_id, service_content_types_pkey, service_content_types_service_type_uk, ux_service_content_types_type_code_lower |
| service_deployments | 2 | ix_service_deployments_service_requested, service_deployments_pkey |
| service_domains | 8 | ix_service_domains_locale, ix_service_domains_service_id, service_domains_pkey, service_domains_service_locale_uk, ux_final_service_domains_service_locale, ux_final_service_domains_single_canonical, ux_service_domains_domain_locale_lower, ux_service_domains_single_canonical_per_service |
| service_environments | 6 | ix_service_environments_env_type, ix_service_environments_is_active, ix_service_environments_service_id, service_environments_pkey, service_environments_service_env_uk, ux_service_environments_primary |
| service_translations | 10 | ix_final_service_translations_locale_status_published_at, ix_service_translations_locale_status, ix_service_translations_published_at, ix_service_translations_service_content_item_id, ix_service_translations_status, service_translations_item_locale_uk, service_translations_pkey, ux_final_service_translations_item_locale, ux_final_service_translations_slug_locale, ux_service_translations_slug_locale_lower |
| services | 12 | ix_final_services_status_visible_updated_at, ix_services_business_domain, ix_services_operator_user_id, ix_services_owner_department_id, ix_services_service_type, ix_services_status, ix_services_tech_owner_user_id, ix_services_type_status, ix_services_visible_status, services_pkey, services_service_code_uk, ux_services_service_code_lower |
| site_banners | 3 | ix_site_banners_service_active, site_banners_pkey, site_banners_service_id_banner_code_locale_key |
| site_navigation_items | 2 | ix_site_navigation_service_locale_sort, site_navigation_items_pkey |
| system_settings | 1 | system_settings_pkey |
| timesheets | 4 | ix_timesheets_project_date, ix_timesheets_user_date, timesheets_pkey, timesheets_unique_entry_uk |
| todo_items | 3 | ix_todo_items_user_status_due, todo_items_pkey, ux_todo_items_wbs_user |
| user_roles | 4 | user_roles_pkey, user_roles_role_id_idx, user_roles_user_id_idx, user_roles_user_role_uk |
| users | 8 | ix_users_locked_until, users_department_id_idx, users_email_uk, users_job_family_idx, users_job_role_idx, users_last_login_at_idx, users_pkey, users_status_idx |
| wbs_task_dependencies | 4 | ix_final_wbs_task_dependencies_depends_on_task, ix_wbs_task_dependencies_depends_on_task_id, wbs_task_dependencies_pair_uk, wbs_task_dependencies_pkey |
| wbs_tasks | 13 | ix_final_wbs_tasks_assignee_status_due_date, ix_final_wbs_tasks_project_assignee_status, ix_wbs_tasks_approver_user_id, ix_wbs_tasks_assignee_user_id, ix_wbs_tasks_due_date, ix_wbs_tasks_parent_task_id, ix_wbs_tasks_project_id, ix_wbs_tasks_project_status_due_date, ix_wbs_tasks_reviewer_user_id, ix_wbs_tasks_status, ix_wbs_tasks_template_id, ix_wbs_tasks_template_item_id, wbs_tasks_pkey |
| wbs_template_items | 4 | ix_wbs_template_items_parent_item_id, ix_wbs_template_items_sort_order, ix_wbs_template_items_template_id, wbs_template_items_pkey |
| wbs_templates | 7 | ix_wbs_templates_business_domain, ix_wbs_templates_is_active, ix_wbs_templates_job_family, ix_wbs_templates_work_style, ux_wbs_templates_code_lower, wbs_templates_code_uk, wbs_templates_pkey |

## 9. Trigger / Function Inventory

Trigger summary:

- Total triggers: 90
- Common updated_at trigger: set_updated_at()
- Business validation triggers observed:
  - validate_approval_action_line_matches_document
  - validate_approval_document_wbs_project_match
  - validate_submitted_approval_document_has_lines
  - validate_daily_report_item_project_match
  - validate_daily_log_item_project_match
  - validate_submitted_daily_report_has_items
  - validate_submitted_daily_log_has_items
  - validate_evaluation_cycle_finalize_requirements
  - validate_evaluation_score_item_cycle_match
  - validate_evaluation_score_requires_evidence
  - validate_news_translation_locale_and_publish_order
  - validate_service_domain_canonical_locale
  - validate_service_domain_locale_supported
  - validate_service_translation_locale_supported
  - validate_service_translation_publish_order

Custom trigger functions:

| Function | Result |
|---|---|
| set_updated_at() | trigger |
| validate_approval_action_line_matches_document() | trigger |
| validate_approval_document_wbs_project_match() | trigger |
| validate_daily_log_item_project_match() | trigger |
| validate_daily_report_item_project_match() | trigger |
| validate_evaluation_cycle_finalize_requirements() | trigger |
| validate_evaluation_score_item_cycle_match() | trigger |
| validate_evaluation_score_requires_evidence() | trigger |
| validate_news_translation_locale_and_publish_order() | trigger |
| validate_service_domain_canonical_locale() | trigger |
| validate_service_domain_locale_supported() | trigger |
| validate_service_translation_locale_supported() | trigger |
| validate_service_translation_publish_order() | trigger |
| validate_submitted_approval_document_has_lines() | trigger |
| validate_submitted_daily_log_has_items() | trigger |
| validate_submitted_daily_report_has_items() | trigger |

Other public functions are extension-provided citext helpers/operators.

## 10. Domain Relationship Summary

| Domain | Tables |
|---|---|
| Auth / Org | users, departments, roles, permissions, user_roles, role_permissions, login_events, api_rate_limits |
| Service / CMS | services, service_environments, service_connections, service_content_types, service_content_items, service_domains, service_translations, service_change_logs, service_deployments, site_banners, site_navigation_items |
| Public / CRM | news_posts, news_post_translations, inquiries, leads, opportunities, email_templates, email_delivery_logs |
| Project / WBS | projects, project_members, wbs_templates, wbs_template_items, wbs_tasks, wbs_task_dependencies, project_outputs, project_issues, project_meetings, meeting_action_items |
| Daily Work | daily_reports, daily_report_items, daily_logs, daily_log_items, todo_items |
| Approval | approval_documents, approval_lines, approval_actions, approval_templates, approval_template_steps |
| Evaluation / KPI | evaluation_cycles, evaluation_items, evaluation_scores, evaluation_evidences, evaluation_feedbacks, goals |
| Workplace / Finance | attendance_records, leave_balances, leave_requests, timesheets, project_resource_allocations, project_budgets, expense_requests |
| Knowledge / Operations / System | knowledge_documents, knowledge_templates, board_posts, attachments, comments, notifications, audit_logs, integrations, common_code_groups, common_codes, system_settings, schema_migrations |

## 11. Source vs Production Drift

| Category | Status | Notes |
|---|---|---|
| Migration source count | MATCH | 13 source files, 001~013. |
| Applied migration count | MATCH | 13/13 in schema_migrations. |
| Base table count | MATCH | v2.0 states 71; Production has 71. |
| Table-name drift | MATCH | Production table names align with migration source and v2.0 extracted Data Dictionary scope. |
| Column drift | MATCH at count/name level | 812 columns observed; PDF pages 14~16 state the 71-table dictionary was produced from Production information_schema. |
| Constraint drift | NOT DETECTED in P0-002 | All PK/FK/UQ/CHECK constraints queried from live DB; no invalid constraint found. Deeper expected-vs-policy review belongs to P2-001. |
| Index drift | NOT DETECTED in P0-002 | 416 public indexes observed; EXPLAIN/index tuning is explicitly out of P0-002 scope. |
| Type drift | NOT DETECTED in P0-002 | user_status enum exists and is used by users.status. |

## 12. Gap Candidates

### GAP-DB-001

Severity: P2 candidate
Object: public functions
Observed: public schema includes extension-provided citext functions together with custom trigger functions.
Expected: DB inventory should distinguish extension functions from project-owned functions before any future function audit.
Risk: Function counts can be misread as 63 custom project functions.
Recommended next review phase: P2-001 / P2-007.

### GAP-DB-002

Severity: P2 candidate
Object: check constraints and status vocabulary
Observed: Most business statuses are varchar/text plus CHECK constraints; only users.status uses a PostgreSQL enum.
Expected: This may be intentional, but v2.0 state-machine work should verify every status CHECK against the final state matrix.
Risk: A state value can drift between DB, Worker validation, UI labels, and mobile API if not centrally tracked.
Recommended next review phase: P1 / P2 state and constraint review.

### GAP-DB-003

Severity: P2 candidate
Object: row-count method
Observed: P0-002 used estimated n_live_tup counts to avoid Production load; exact counts were not run.
Expected: Exact counts may be useful later for seed/reference integrity when data volume is known safe.
Risk: Estimated row counts can lag behind current small-table data.
Recommended next review phase: P8-003 data verification or targeted P2 data audit.

## 13. Security / Data Integrity Observations

- DATABASE_URL, password values, JWT_SECRET, Cloudflare tokens, API keys, DB password, and administrator password were not queried or documented.
- Metadata includes column names such as password_hash and secret_ref, but no stored values were read or printed.
- All FK, PK, UNIQUE, and CHECK constraints returned by pg_constraint are validated.
- Every table has a primary key.
- WBS core guards are present at DB level: progress range, self-dependency prevention, done=100, approval-required completion guard, daily report/log WBS FK.
- Evaluation evidence guard is present through validate_evaluation_score_requires_evidence.
- Finance generated total_amount is present on expense_requests.

## 14. P0-002 Exit Criteria

- [x] Production DB identity 확인
- [x] PostgreSQL version 확인
- [x] migrations source 001~013 확인
- [x] schema_migrations 001~013 적용 상태 확인
- [x] public base table 전수 조회
- [x] table count 확인
- [x] 71 table column dictionary
- [x] PK 전수
- [x] FK 전수
- [x] UNIQUE 전수
- [x] CHECK 전수
- [x] Index 전수
- [x] Enum/User-defined type 전수
- [x] Trigger 전수
- [x] Custom Function 전수
- [x] estimated row counts
- [x] migration to table/domain mapping
- [x] Source vs Production drift
- [x] Gap Candidate 목록
- [x] DB_INVENTORY.md 생성
- [x] DB write 0건
- [x] Source code 변경 0건
- [x] Cloudflare 변경 0건

## Phase 1 Production Addendum - 2026-08-13

The original DB inventory above is the Phase 0 71-table baseline. Production after Phase 1 migration 014:

- Database: `neondb`
- Schema: `public`
- Public base tables: 72
- Applied migrations: 14
- Latest migration: `014_mobile_auth_sessions.sql`
- `auth_sessions`: present
- Roles: 22
- Permissions: 74

The v2.0/Phase 0 71-table baseline is preserved as historical baseline. The current Production table count is 72 because Phase 1 added the mobile auth session table through migration 014.

## P2-001 Constraint Audit Addendum - 2026-08-13

`DB_CONSTRAINT_AUDIT.md` audited the current 72-table Production schema read-only.

Current catalog counts:

- Primary keys: 72
- Foreign keys: 151
- UNIQUE constraints: 43
- CHECK constraints: 246
- NOT NULL columns: 669
- Indexes: 422
- Validated PK/FK/UNIQUE/CHECK constraints: 512/512
- Tables without primary key: 0

Production data violation scan found 0 current violating rows for the sampled unique, progress, amount, date, self-dependency, auth-session, and smoke-cleanup invariants.

Open remediation gaps are tracked in BACKLOG.md. No DB write, migration, source-code change, or production login was performed for P2-001.
