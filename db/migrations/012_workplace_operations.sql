-- 012_workplace_operations.sql
-- Production operational modules inspired by mature Korean groupware/ERP patterns.
-- Scope: To-do, attendance, leave, resource allocation, timesheets, budgets/expenses,
--        goals, board/knowledge, integrations and email templates.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at' AND pg_function_is_visible(oid)
  ) THEN
    CREATE FUNCTION set_updated_at()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $fn$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $fn$;
  END IF;
END $$;

-- ------------------------------------------------------------
-- To-do: WBS-derived and personal tasks in one operational inbox.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS todo_items (
  id                  BIGSERIAL PRIMARY KEY,
  user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wbs_task_id         BIGINT NULL REFERENCES wbs_tasks(id) ON DELETE CASCADE,
  source_type         VARCHAR(40) NOT NULL DEFAULT 'personal'
                        CHECK (source_type IN ('personal', 'wbs', 'approval', 'system')),
  title               VARCHAR(255) NOT NULL,
  description         TEXT NOT NULL DEFAULT '',
  status              VARCHAR(40) NOT NULL DEFAULT 'todo'
                        CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
  priority            VARCHAR(40) NOT NULL DEFAULT 'medium'
                        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_at              TIMESTAMPTZ NULL,
  completed_at        TIMESTAMPTZ NULL,
  created_by          BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT todo_items_title_not_blank_chk CHECK (btrim(title) <> ''),
  CONSTRAINT todo_items_completed_chk CHECK (
    (status = 'done' AND completed_at IS NOT NULL) OR (status <> 'done')
  )
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_todo_items_wbs_user
  ON todo_items(user_id, wbs_task_id) WHERE wbs_task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_todo_items_user_status_due
  ON todo_items(user_id, status, due_at);
DROP TRIGGER IF EXISTS trg_todo_items_set_updated_at ON todo_items;
CREATE TRIGGER trg_todo_items_set_updated_at BEFORE UPDATE ON todo_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- Attendance
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_records (
  id                  BIGSERIAL PRIMARY KEY,
  user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  work_date           DATE NOT NULL,
  clock_in_at         TIMESTAMPTZ NULL,
  clock_out_at        TIMESTAMPTZ NULL,
  work_status         VARCHAR(40) NOT NULL DEFAULT 'working'
                        CHECK (work_status IN ('working', 'completed', 'leave', 'remote', 'business_trip', 'absent')),
  work_minutes        INTEGER NOT NULL DEFAULT 0 CHECK (work_minutes >= 0),
  correction_status   VARCHAR(40) NOT NULL DEFAULT 'none'
                        CHECK (correction_status IN ('none', 'requested', 'approved', 'rejected')),
  correction_reason   TEXT NOT NULL DEFAULT '',
  note                TEXT NOT NULL DEFAULT '',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT attendance_records_user_date_uk UNIQUE (user_id, work_date),
  CONSTRAINT attendance_clock_order_chk CHECK (
    clock_out_at IS NULL OR clock_in_at IS NULL OR clock_out_at >= clock_in_at
  )
);
CREATE INDEX IF NOT EXISTS ix_attendance_records_work_date ON attendance_records(work_date DESC);
CREATE INDEX IF NOT EXISTS ix_attendance_records_user_work_date ON attendance_records(user_id, work_date DESC);
DROP TRIGGER IF EXISTS trg_attendance_records_set_updated_at ON attendance_records;
CREATE TRIGGER trg_attendance_records_set_updated_at BEFORE UPDATE ON attendance_records
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- Leave balances/requests
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leave_balances (
  id                  BIGSERIAL PRIMARY KEY,
  user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance_year        INTEGER NOT NULL CHECK (balance_year BETWEEN 2000 AND 2100),
  granted_days        NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (granted_days >= 0),
  used_days           NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (used_days >= 0),
  adjusted_days       NUMERIC(6,2) NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT leave_balances_user_year_uk UNIQUE (user_id, balance_year),
  CONSTRAINT leave_balances_remaining_chk CHECK (granted_days + adjusted_days - used_days >= 0)
);
DROP TRIGGER IF EXISTS trg_leave_balances_set_updated_at ON leave_balances;
CREATE TRIGGER trg_leave_balances_set_updated_at BEFORE UPDATE ON leave_balances
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS leave_requests (
  id                    BIGSERIAL PRIMARY KEY,
  user_id               BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leave_type            VARCHAR(40) NOT NULL DEFAULT 'annual'
                          CHECK (leave_type IN ('annual', 'half_day_am', 'half_day_pm', 'sick', 'special', 'unpaid')),
  start_date            DATE NOT NULL,
  end_date              DATE NOT NULL,
  requested_days        NUMERIC(6,2) NOT NULL CHECK (requested_days > 0),
  reason                TEXT NOT NULL DEFAULT '',
  status                VARCHAR(40) NOT NULL DEFAULT 'submitted'
                          CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'cancelled')),
  approval_document_id  BIGINT NULL REFERENCES approval_documents(id) ON DELETE SET NULL,
  decided_by            BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  decided_at            TIMESTAMPTZ NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT leave_requests_date_range_chk CHECK (end_date >= start_date),
  CONSTRAINT leave_requests_decision_chk CHECK (
    (status IN ('approved', 'rejected') AND decided_at IS NOT NULL)
    OR status NOT IN ('approved', 'rejected')
  )
);
CREATE INDEX IF NOT EXISTS ix_leave_requests_user_status ON leave_requests(user_id, status, start_date DESC);
CREATE INDEX IF NOT EXISTS ix_leave_requests_status_date ON leave_requests(status, start_date DESC);
DROP TRIGGER IF EXISTS trg_leave_requests_set_updated_at ON leave_requests;
CREATE TRIGGER trg_leave_requests_set_updated_at BEFORE UPDATE ON leave_requests
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- Project allocation and timesheet
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_resource_allocations (
  id                  BIGSERIAL PRIMARY KEY,
  project_id          BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  allocation_month    DATE NOT NULL,
  allocation_percent  NUMERIC(5,2) NOT NULL CHECK (allocation_percent >= 0 AND allocation_percent <= 100),
  note                TEXT NOT NULL DEFAULT '',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT project_resource_allocations_uk UNIQUE (project_id, user_id, allocation_month),
  CONSTRAINT project_resource_allocations_month_chk CHECK (date_trunc('month', allocation_month::timestamp)::date = allocation_month)
);
CREATE INDEX IF NOT EXISTS ix_project_resource_allocations_user_month ON project_resource_allocations(user_id, allocation_month);
DROP TRIGGER IF EXISTS trg_project_resource_allocations_set_updated_at ON project_resource_allocations;
CREATE TRIGGER trg_project_resource_allocations_set_updated_at BEFORE UPDATE ON project_resource_allocations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS timesheets (
  id                    BIGSERIAL PRIMARY KEY,
  user_id               BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id            BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  wbs_task_id           BIGINT NULL REFERENCES wbs_tasks(id) ON DELETE SET NULL,
  work_date             DATE NOT NULL,
  hours                 NUMERIC(5,2) NOT NULL CHECK (hours > 0 AND hours <= 24),
  description           TEXT NOT NULL DEFAULT '',
  status                VARCHAR(40) NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  approval_document_id  BIGINT NULL REFERENCES approval_documents(id) ON DELETE SET NULL,
  reviewed_by           BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at           TIMESTAMPTZ NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT timesheets_unique_entry_uk UNIQUE (user_id, project_id, wbs_task_id, work_date)
);
CREATE INDEX IF NOT EXISTS ix_timesheets_user_date ON timesheets(user_id, work_date DESC);
CREATE INDEX IF NOT EXISTS ix_timesheets_project_date ON timesheets(project_id, work_date DESC);
DROP TRIGGER IF EXISTS trg_timesheets_set_updated_at ON timesheets;
CREATE TRIGGER trg_timesheets_set_updated_at BEFORE UPDATE ON timesheets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- Budget / expenses
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_budgets (
  id                  BIGSERIAL PRIMARY KEY,
  project_id          BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category_code       VARCHAR(80) NOT NULL,
  category_name       VARCHAR(160) NOT NULL,
  planned_amount      NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (planned_amount >= 0),
  committed_amount    NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (committed_amount >= 0),
  spent_amount        NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (spent_amount >= 0),
  currency            CHAR(3) NOT NULL DEFAULT 'KRW',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT project_budgets_project_category_uk UNIQUE (project_id, category_code),
  CONSTRAINT project_budgets_code_not_blank_chk CHECK (btrim(category_code) <> ''),
  CONSTRAINT project_budgets_name_not_blank_chk CHECK (btrim(category_name) <> '')
);
CREATE INDEX IF NOT EXISTS ix_project_budgets_project ON project_budgets(project_id);
DROP TRIGGER IF EXISTS trg_project_budgets_set_updated_at ON project_budgets;
CREATE TRIGGER trg_project_budgets_set_updated_at BEFORE UPDATE ON project_budgets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS expense_requests (
  id                    BIGSERIAL PRIMARY KEY,
  requester_user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  project_id            BIGINT NULL REFERENCES projects(id) ON DELETE SET NULL,
  budget_id             BIGINT NULL REFERENCES project_budgets(id) ON DELETE SET NULL,
  expense_date          DATE NOT NULL,
  vendor_name           VARCHAR(255) NOT NULL DEFAULT '',
  description           TEXT NOT NULL,
  supply_amount         NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (supply_amount >= 0),
  tax_amount            NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  total_amount          NUMERIC(18,2) GENERATED ALWAYS AS (supply_amount + tax_amount) STORED,
  currency              CHAR(3) NOT NULL DEFAULT 'KRW',
  status                VARCHAR(40) NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'paid', 'cancelled')),
  receipt_attachment_id BIGINT NULL REFERENCES attachments(id) ON DELETE SET NULL,
  approval_document_id  BIGINT NULL REFERENCES approval_documents(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT expense_requests_description_not_blank_chk CHECK (btrim(description) <> '')
);
CREATE INDEX IF NOT EXISTS ix_expense_requests_project_status ON expense_requests(project_id, status, expense_date DESC);
CREATE INDEX IF NOT EXISTS ix_expense_requests_requester_date ON expense_requests(requester_user_id, expense_date DESC);
DROP TRIGGER IF EXISTS trg_expense_requests_set_updated_at ON expense_requests;
CREATE TRIGGER trg_expense_requests_set_updated_at BEFORE UPDATE ON expense_requests
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- Goals / performance
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS goals (
  id                  BIGSERIAL PRIMARY KEY,
  owner_type          VARCHAR(40) NOT NULL DEFAULT 'user' CHECK (owner_type IN ('user', 'department', 'project')),
  owner_user_id       BIGINT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id       BIGINT NULL REFERENCES departments(id) ON DELETE CASCADE,
  project_id          BIGINT NULL REFERENCES projects(id) ON DELETE CASCADE,
  cycle_label         VARCHAR(80) NOT NULL,
  title               VARCHAR(255) NOT NULL,
  metric_name         VARCHAR(160) NOT NULL DEFAULT '',
  target_value        NUMERIC(18,4) NULL,
  current_value       NUMERIC(18,4) NULL,
  unit                VARCHAR(40) NOT NULL DEFAULT '',
  status              VARCHAR(40) NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'achieved', 'closed', 'cancelled')),
  weight              NUMERIC(6,2) NOT NULL DEFAULT 1 CHECK (weight >= 0),
  created_by          BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT goals_title_not_blank_chk CHECK (btrim(title) <> ''),
  CONSTRAINT goals_cycle_not_blank_chk CHECK (btrim(cycle_label) <> ''),
  CONSTRAINT goals_owner_chk CHECK (
    (owner_type = 'user' AND owner_user_id IS NOT NULL AND department_id IS NULL AND project_id IS NULL)
    OR (owner_type = 'department' AND owner_user_id IS NULL AND department_id IS NOT NULL AND project_id IS NULL)
    OR (owner_type = 'project' AND owner_user_id IS NULL AND department_id IS NULL AND project_id IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS ix_goals_owner_user ON goals(owner_user_id, status);
CREATE INDEX IF NOT EXISTS ix_goals_department ON goals(department_id, status);
CREATE INDEX IF NOT EXISTS ix_goals_project ON goals(project_id, status);
DROP TRIGGER IF EXISTS trg_goals_set_updated_at ON goals;
CREATE TRIGGER trg_goals_set_updated_at BEFORE UPDATE ON goals
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- Board / knowledge base
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS board_posts (
  id                  BIGSERIAL PRIMARY KEY,
  category            VARCHAR(80) NOT NULL DEFAULT 'notice',
  title               VARCHAR(255) NOT NULL,
  body                TEXT NOT NULL,
  status              VARCHAR(40) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_pinned           BOOLEAN NOT NULL DEFAULT FALSE,
  author_user_id      BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  published_at        TIMESTAMPTZ NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT board_posts_title_not_blank_chk CHECK (btrim(title) <> ''),
  CONSTRAINT board_posts_body_not_blank_chk CHECK (btrim(body) <> '')
);
CREATE INDEX IF NOT EXISTS ix_board_posts_status_published ON board_posts(status, is_pinned DESC, published_at DESC);
DROP TRIGGER IF EXISTS trg_board_posts_set_updated_at ON board_posts;
CREATE TRIGGER trg_board_posts_set_updated_at BEFORE UPDATE ON board_posts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS knowledge_documents (
  id                  BIGSERIAL PRIMARY KEY,
  category            VARCHAR(80) NOT NULL DEFAULT 'manual',
  title               VARCHAR(255) NOT NULL,
  body                TEXT NOT NULL,
  tags                 TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  status              VARCHAR(40) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  owner_user_id       BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  source_url          TEXT NOT NULL DEFAULT '',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT knowledge_documents_title_not_blank_chk CHECK (btrim(title) <> ''),
  CONSTRAINT knowledge_documents_body_not_blank_chk CHECK (btrim(body) <> '')
);
CREATE INDEX IF NOT EXISTS ix_knowledge_documents_status_category ON knowledge_documents(status, category, updated_at DESC);
DROP TRIGGER IF EXISTS trg_knowledge_documents_set_updated_at ON knowledge_documents;
CREATE TRIGGER trg_knowledge_documents_set_updated_at BEFORE UPDATE ON knowledge_documents
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- Integrations (non-secret configuration only) / email templates
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS integrations (
  id                  BIGSERIAL PRIMARY KEY,
  code                VARCHAR(120) NOT NULL,
  name                VARCHAR(255) NOT NULL,
  integration_type    VARCHAR(80) NOT NULL,
  status              VARCHAR(40) NOT NULL DEFAULT 'disconnected'
                        CHECK (status IN ('disconnected', 'configured', 'healthy', 'degraded', 'error', 'disabled')),
  config_json         JSONB NOT NULL DEFAULT '{}'::JSONB,
  last_checked_at     TIMESTAMPTZ NULL,
  last_error          TEXT NOT NULL DEFAULT '',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT integrations_code_uk UNIQUE (code),
  CONSTRAINT integrations_code_not_blank_chk CHECK (btrim(code) <> ''),
  CONSTRAINT integrations_name_not_blank_chk CHECK (btrim(name) <> ''),
  CONSTRAINT integrations_no_secret_keys_chk CHECK (
    NOT (config_json ?| ARRAY['secret','token','apiKey','api_key','password','credential','credentials'])
  )
);
CREATE INDEX IF NOT EXISTS ix_integrations_type_status ON integrations(integration_type, status);
DROP TRIGGER IF EXISTS trg_integrations_set_updated_at ON integrations;
CREATE TRIGGER trg_integrations_set_updated_at BEFORE UPDATE ON integrations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS email_templates (
  id                  BIGSERIAL PRIMARY KEY,
  code                VARCHAR(120) NOT NULL,
  locale              VARCHAR(10) NOT NULL DEFAULT 'ko' CHECK (locale IN ('ko', 'en', 'ja', 'fr', 'es')),
  name                VARCHAR(255) NOT NULL,
  subject_template    TEXT NOT NULL,
  html_template       TEXT NOT NULL,
  text_template       TEXT NOT NULL DEFAULT '',
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by          BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT email_templates_code_locale_uk UNIQUE (code, locale),
  CONSTRAINT email_templates_code_not_blank_chk CHECK (btrim(code) <> ''),
  CONSTRAINT email_templates_name_not_blank_chk CHECK (btrim(name) <> ''),
  CONSTRAINT email_templates_subject_not_blank_chk CHECK (btrim(subject_template) <> ''),
  CONSTRAINT email_templates_html_not_blank_chk CHECK (btrim(html_template) <> '')
);
CREATE INDEX IF NOT EXISTS ix_email_templates_active ON email_templates(is_active, code, locale);
DROP TRIGGER IF EXISTS trg_email_templates_set_updated_at ON email_templates;
CREATE TRIGGER trg_email_templates_set_updated_at BEFORE UPDATE ON email_templates
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Synchronize assigned WBS tasks into To-do without storing fake/manual copies.
INSERT INTO todo_items (user_id, wbs_task_id, source_type, title, description, status, priority, due_at, created_by)
SELECT w.assignee_user_id,
       w.id,
       'wbs',
       w.title,
       w.description,
       CASE WHEN w.status = 'done' THEN 'done'
            WHEN w.status = 'in_progress' THEN 'in_progress'
            ELSE 'todo' END,
       CASE WHEN w.priority IN ('low','medium','high','urgent') THEN w.priority ELSE 'medium' END,
       CASE WHEN w.due_date IS NOT NULL THEN (w.due_date::timestamp + interval '23 hours 59 minutes') AT TIME ZONE 'Asia/Seoul' ELSE NULL END,
       w.assignee_user_id
FROM wbs_tasks w
WHERE w.assignee_user_id IS NOT NULL
ON CONFLICT (user_id, wbs_task_id) WHERE wbs_task_id IS NOT NULL DO NOTHING;

COMMIT;
