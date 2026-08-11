-- 010_indexes_constraints.sql
-- Final hardening layer
--
-- Scope:
--   - locale unique constraints (via unique indexes / helper unique guards)
--   - slug unique constraints (via unique indexes / helper unique guards)
--   - canonical unique helper index
--   - status/date/foreign-key lookup indexes
--
-- Notes:
--   - Assumes 001~009 migrations already ran.
--   - Earlier migrations may already have some equivalent indexes/constraints.
--   - This file is intentionally idempotent and only adds safe final guards / high-value composite indexes.

BEGIN;

-- ------------------------------------------------------------
-- locale uniqueness / guards
-- ------------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS ux_final_service_domains_service_locale
  ON service_domains(service_id, locale);

CREATE UNIQUE INDEX IF NOT EXISTS ux_final_service_translations_item_locale
  ON service_translations(service_content_item_id, locale);

CREATE UNIQUE INDEX IF NOT EXISTS ux_final_news_post_translations_post_locale
  ON news_post_translations(news_post_id, locale);

-- ------------------------------------------------------------
-- slug uniqueness / guards
-- ------------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS ux_final_service_translations_slug_locale
  ON service_translations(lower(slug), locale);

CREATE UNIQUE INDEX IF NOT EXISTS ux_final_news_post_translations_slug_locale
  ON news_post_translations(lower(slug), locale);

CREATE UNIQUE INDEX IF NOT EXISTS ux_final_news_posts_slug
  ON news_posts(lower(slug));

-- ------------------------------------------------------------
-- canonical unique helper index
-- ------------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS ux_final_service_domains_single_canonical
  ON service_domains(service_id)
  WHERE is_canonical = TRUE;

-- ------------------------------------------------------------
-- published/public lookup indexes
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS ix_final_service_content_items_service_status_published_at
  ON service_content_items(service_id, status, published_at DESC);

CREATE INDEX IF NOT EXISTS ix_final_service_translations_locale_status_published_at
  ON service_translations(locale, status, published_at DESC);

CREATE INDEX IF NOT EXISTS ix_final_news_posts_category_status_published_at
  ON news_posts(category, status, published_at DESC);

CREATE INDEX IF NOT EXISTS ix_final_news_post_translations_locale_status_published_at
  ON news_post_translations(locale, status, published_at DESC);

-- ------------------------------------------------------------
-- service/admin dashboard lookup indexes
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS ix_final_services_status_visible_updated_at
  ON services(status, is_visible_in_admin, updated_at DESC);

CREATE INDEX IF NOT EXISTS ix_final_service_change_logs_service_created_at
  ON service_change_logs(service_id, created_at DESC);

-- ------------------------------------------------------------
-- inquiry / lead / opportunity lookup indexes
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS ix_final_inquiries_status_assigned_created_at
  ON inquiries(status, assigned_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_final_leads_status_owner_created_at
  ON leads(status, owner_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_final_opportunities_stage_owner_close_date
  ON opportunities(stage, owner_user_id, expected_close_date);

-- ------------------------------------------------------------
-- project / WBS lookup indexes
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS ix_final_projects_status_owner_end_date
  ON projects(status, owner_user_id, end_date);

CREATE INDEX IF NOT EXISTS ix_final_project_members_user_project
  ON project_members(user_id, project_id);

CREATE INDEX IF NOT EXISTS ix_final_wbs_tasks_assignee_status_due_date
  ON wbs_tasks(assignee_user_id, status, due_date);

CREATE INDEX IF NOT EXISTS ix_final_wbs_tasks_project_assignee_status
  ON wbs_tasks(project_id, assignee_user_id, status);

CREATE INDEX IF NOT EXISTS ix_final_wbs_task_dependencies_depends_on_task
  ON wbs_task_dependencies(depends_on_task_id, task_id);

CREATE INDEX IF NOT EXISTS ix_final_project_outputs_project_wbs_created_at
  ON project_outputs(project_id, wbs_task_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_final_project_issues_project_status_priority
  ON project_issues(project_id, status, priority);

-- ------------------------------------------------------------
-- daily report / log lookup indexes
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS ix_final_daily_reports_user_date_submitted
  ON daily_reports(user_id, report_date DESC, submitted_at);

CREATE INDEX IF NOT EXISTS ix_final_daily_report_items_task_report
  ON daily_report_items(wbs_task_id, daily_report_id);

CREATE INDEX IF NOT EXISTS ix_final_daily_logs_user_date_submitted
  ON daily_logs(user_id, log_date DESC, submitted_at);

CREATE INDEX IF NOT EXISTS ix_final_daily_log_items_task_log_progress
  ON daily_log_items(wbs_task_id, daily_log_id, actual_progress);

-- ------------------------------------------------------------
-- approvals lookup indexes
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS ix_final_approval_documents_status_requester_submitted
  ON approval_documents(status, requester_user_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS ix_final_approval_documents_project_service_status
  ON approval_documents(project_id, service_id, status);

CREATE INDEX IF NOT EXISTS ix_final_approval_lines_approver_status_acted_at
  ON approval_lines(approver_user_id, line_status, acted_at DESC);

CREATE INDEX IF NOT EXISTS ix_final_approval_actions_document_acted_at
  ON approval_actions(approval_document_id, acted_at DESC);

-- ------------------------------------------------------------
-- evaluation lookup indexes
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS ix_final_evaluation_cycles_status_end_date
  ON evaluation_cycles(status, end_date DESC);

CREATE INDEX IF NOT EXISTS ix_final_evaluation_items_cycle_group_sort
  ON evaluation_items(cycle_id, item_group, sort_order);

CREATE INDEX IF NOT EXISTS ix_final_evaluation_scores_cycle_evaluatee_item
  ON evaluation_scores(cycle_id, evaluatee_user_id, evaluation_item_id);

CREATE INDEX IF NOT EXISTS ix_final_evaluation_scores_evaluator_cycle
  ON evaluation_scores(evaluator_user_id, cycle_id);

CREATE INDEX IF NOT EXISTS ix_final_evaluation_evidences_cycle_user_occurred_at
  ON evaluation_evidences(cycle_id, user_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS ix_final_evaluation_feedbacks_cycle_user_type
  ON evaluation_feedbacks(cycle_id, evaluatee_user_id, feedback_type);

-- ------------------------------------------------------------
-- notification / audit lookup indexes
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS ix_final_notifications_recipient_read_created_at
  ON notifications(recipient_user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_final_attachments_target_created_at
  ON attachments(target_type, target_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_final_comments_target_created_at
  ON comments(target_type, target_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_final_audit_logs_scope_created_at
  ON audit_logs(scope, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_final_audit_logs_service_action_created_at
  ON audit_logs(service_id, action_type, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_final_audit_logs_project_action_created_at
  ON audit_logs(project_id, action_type, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_final_audit_logs_actor_created_at
  ON audit_logs(actor_user_id, created_at DESC);

COMMIT;