-- 004_projects_wbs.sql
-- Scope:
--   - projects
--   - project_members
--   - wbs_templates
--   - wbs_template_items
--   - wbs_tasks
--   - wbs_task_dependencies
--   - project_outputs
--   - project_issues
--
-- Notes:
--   - Assumes 001_core_org_auth.sql, 002_service_hub.sql, 003_public_content.sql have already run.
--   - approval_documents FK to projects will be added naturally in 006_approvals.sql when that table is created.
--   - Here we safely add backfilled project FKs for earlier tables introduced in 003_public_content.sql.

BEGIN;

-- ------------------------------------------------------------
-- shared updated_at trigger
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'set_updated_at'
      AND pg_function_is_visible(oid)
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
-- projects
-- status standard:
--   planned / active / paused / completed / cancelled
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id                  BIGSERIAL PRIMARY KEY,
  code                VARCHAR(120) NOT NULL,
  name                VARCHAR(255) NOT NULL,
  project_type        VARCHAR(80) NOT NULL,
  service_id          BIGINT NULL REFERENCES services(id) ON DELETE SET NULL,
  status              VARCHAR(40) NOT NULL DEFAULT 'planned'
                        CHECK (status IN ('planned', 'active', 'paused', 'completed', 'cancelled')),
  owner_user_id       BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  start_date          DATE NULL,
  end_date            DATE NULL,
  description         TEXT NOT NULL DEFAULT '',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT projects_code_uk UNIQUE (code),
  CONSTRAINT projects_code_not_blank_chk CHECK (btrim(code) <> ''),
  CONSTRAINT projects_name_not_blank_chk CHECK (btrim(name) <> ''),
  CONSTRAINT projects_type_not_blank_chk CHECK (btrim(project_type) <> ''),
  CONSTRAINT projects_date_range_chk CHECK (
    end_date IS NULL OR start_date IS NULL OR end_date >= start_date
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_projects_code_lower
  ON projects(lower(code));

CREATE INDEX IF NOT EXISTS ix_projects_status
  ON projects(status);

CREATE INDEX IF NOT EXISTS ix_projects_service_id
  ON projects(service_id);

CREATE INDEX IF NOT EXISTS ix_projects_owner_user_id
  ON projects(owner_user_id);

CREATE INDEX IF NOT EXISTS ix_projects_start_date
  ON projects(start_date);

CREATE INDEX IF NOT EXISTS ix_projects_end_date
  ON projects(end_date);

DROP TRIGGER IF EXISTS trg_projects_set_updated_at ON projects;
CREATE TRIGGER trg_projects_set_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- project_members
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_members (
  id                  BIGSERIAL PRIMARY KEY,
  project_id          BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_in_project     VARCHAR(80) NOT NULL,
  joined_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT project_members_project_user_uk UNIQUE (project_id, user_id),
  CONSTRAINT project_members_role_not_blank_chk CHECK (btrim(role_in_project) <> '')
);

CREATE INDEX IF NOT EXISTS ix_project_members_user_id
  ON project_members(user_id);

CREATE INDEX IF NOT EXISTS ix_project_members_role_in_project
  ON project_members(role_in_project);

-- ------------------------------------------------------------
-- wbs_templates
-- template registry by job_family / work_style
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wbs_templates (
  id                  BIGSERIAL PRIMARY KEY,
  code                VARCHAR(120) NOT NULL,
  name                VARCHAR(255) NOT NULL,
  job_family          VARCHAR(80) NOT NULL,
  work_style          VARCHAR(80) NOT NULL,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  schema_json         JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT wbs_templates_code_uk UNIQUE (code),
  CONSTRAINT wbs_templates_code_not_blank_chk CHECK (btrim(code) <> ''),
  CONSTRAINT wbs_templates_name_not_blank_chk CHECK (btrim(name) <> ''),
  CONSTRAINT wbs_templates_job_family_not_blank_chk CHECK (btrim(job_family) <> ''),
  CONSTRAINT wbs_templates_work_style_not_blank_chk CHECK (btrim(work_style) <> '')
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_wbs_templates_code_lower
  ON wbs_templates(lower(code));

CREATE INDEX IF NOT EXISTS ix_wbs_templates_job_family
  ON wbs_templates(job_family);

CREATE INDEX IF NOT EXISTS ix_wbs_templates_work_style
  ON wbs_templates(work_style);

CREATE INDEX IF NOT EXISTS ix_wbs_templates_is_active
  ON wbs_templates(is_active);

DROP TRIGGER IF EXISTS trg_wbs_templates_set_updated_at ON wbs_templates;
CREATE TRIGGER trg_wbs_templates_set_updated_at
BEFORE UPDATE ON wbs_templates
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- wbs_template_items
-- template task blueprint
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wbs_template_items (
  id                        BIGSERIAL PRIMARY KEY,
  template_id               BIGINT NOT NULL REFERENCES wbs_templates(id) ON DELETE CASCADE,
  parent_item_id            BIGINT NULL REFERENCES wbs_template_items(id) ON DELETE CASCADE,
  title                     VARCHAR(255) NOT NULL,
  description               TEXT NOT NULL DEFAULT '',
  task_type                 VARCHAR(80) NOT NULL DEFAULT 'task',
  sort_order                INTEGER NOT NULL DEFAULT 0,
  default_job_family        VARCHAR(80) NOT NULL DEFAULT '',
  default_work_style        VARCHAR(80) NOT NULL DEFAULT '',
  default_priority          VARCHAR(40) NOT NULL DEFAULT 'medium',
  default_weight            NUMERIC(6,2) NOT NULL DEFAULT 1.00 CHECK (default_weight >= 0),
  default_start_offset_days INTEGER NOT NULL DEFAULT 0,
  default_due_offset_days   INTEGER NOT NULL DEFAULT 0,
  requires_approval         BOOLEAN NOT NULL DEFAULT FALSE,
  metadata_json             JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT wbs_template_items_title_not_blank_chk CHECK (btrim(title) <> ''),
  CONSTRAINT wbs_template_items_task_type_not_blank_chk CHECK (btrim(task_type) <> ''),
  CONSTRAINT wbs_template_items_sort_order_nonnegative_chk CHECK (sort_order >= 0),
  CONSTRAINT wbs_template_items_due_offset_chk CHECK (
    default_due_offset_days >= default_start_offset_days
  )
);

CREATE INDEX IF NOT EXISTS ix_wbs_template_items_template_id
  ON wbs_template_items(template_id);

CREATE INDEX IF NOT EXISTS ix_wbs_template_items_parent_item_id
  ON wbs_template_items(parent_item_id);

CREATE INDEX IF NOT EXISTS ix_wbs_template_items_sort_order
  ON wbs_template_items(template_id, sort_order);

DROP TRIGGER IF EXISTS trg_wbs_template_items_set_updated_at ON wbs_template_items;
CREATE TRIGGER trg_wbs_template_items_set_updated_at
BEFORE UPDATE ON wbs_template_items
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- wbs_tasks
-- status standard:
--   todo / in_progress / review / approval_wait / done / delayed / blocked
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wbs_tasks (
  id                    BIGSERIAL PRIMARY KEY,
  project_id            BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_task_id        BIGINT NULL REFERENCES wbs_tasks(id) ON DELETE CASCADE,
  template_id           BIGINT NULL REFERENCES wbs_templates(id) ON DELETE SET NULL,
  template_item_id      BIGINT NULL REFERENCES wbs_template_items(id) ON DELETE SET NULL,
  title                 VARCHAR(255) NOT NULL,
  description           TEXT NOT NULL DEFAULT '',
  task_type             VARCHAR(80) NOT NULL DEFAULT 'task',
  job_family            VARCHAR(80) NOT NULL DEFAULT '',
  work_style            VARCHAR(80) NOT NULL DEFAULT '',
  assignee_user_id      BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  reviewer_user_id      BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  approver_user_id      BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  start_date            DATE NULL,
  due_date              DATE NULL,
  planned_progress      INTEGER NOT NULL DEFAULT 0 CHECK (planned_progress BETWEEN 0 AND 100),
  actual_progress       INTEGER NOT NULL DEFAULT 0 CHECK (actual_progress BETWEEN 0 AND 100),
  priority              VARCHAR(40) NOT NULL DEFAULT 'medium',
  status                VARCHAR(40) NOT NULL DEFAULT 'todo'
                          CHECK (status IN ('todo', 'in_progress', 'review', 'approval_wait', 'done', 'delayed', 'blocked')),
  weight                NUMERIC(6,2) NOT NULL DEFAULT 1.00 CHECK (weight >= 0),
  requires_approval     BOOLEAN NOT NULL DEFAULT FALSE,
  approval_completed_at TIMESTAMPTZ NULL,
  output_url            TEXT NOT NULL DEFAULT '',
  qa_status             VARCHAR(40) NOT NULL DEFAULT 'not_required',
  deploy_status         VARCHAR(40) NOT NULL DEFAULT 'not_applicable',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT wbs_tasks_title_not_blank_chk CHECK (btrim(title) <> ''),
  CONSTRAINT wbs_tasks_task_type_not_blank_chk CHECK (btrim(task_type) <> ''),
  CONSTRAINT wbs_tasks_priority_not_blank_chk CHECK (btrim(priority) <> ''),
  CONSTRAINT wbs_tasks_date_range_chk CHECK (
    due_date IS NULL OR start_date IS NULL OR due_date >= start_date
  ),
  CONSTRAINT wbs_tasks_done_progress_chk CHECK (
    status <> 'done' OR actual_progress = 100
  ),
  CONSTRAINT wbs_tasks_requires_approval_done_chk CHECK (
    NOT (requires_approval = TRUE AND status = 'done' AND approval_completed_at IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS ix_wbs_tasks_project_id
  ON wbs_tasks(project_id);

CREATE INDEX IF NOT EXISTS ix_wbs_tasks_parent_task_id
  ON wbs_tasks(parent_task_id);

CREATE INDEX IF NOT EXISTS ix_wbs_tasks_template_id
  ON wbs_tasks(template_id);

CREATE INDEX IF NOT EXISTS ix_wbs_tasks_template_item_id
  ON wbs_tasks(template_item_id);

CREATE INDEX IF NOT EXISTS ix_wbs_tasks_assignee_user_id
  ON wbs_tasks(assignee_user_id);

CREATE INDEX IF NOT EXISTS ix_wbs_tasks_reviewer_user_id
  ON wbs_tasks(reviewer_user_id);

CREATE INDEX IF NOT EXISTS ix_wbs_tasks_approver_user_id
  ON wbs_tasks(approver_user_id);

CREATE INDEX IF NOT EXISTS ix_wbs_tasks_status
  ON wbs_tasks(status);

CREATE INDEX IF NOT EXISTS ix_wbs_tasks_due_date
  ON wbs_tasks(due_date);

CREATE INDEX IF NOT EXISTS ix_wbs_tasks_project_status_due_date
  ON wbs_tasks(project_id, status, due_date);

DROP TRIGGER IF EXISTS trg_wbs_tasks_set_updated_at ON wbs_tasks;
CREATE TRIGGER trg_wbs_tasks_set_updated_at
BEFORE UPDATE ON wbs_tasks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- wbs_task_dependencies
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wbs_task_dependencies (
  id                    BIGSERIAL PRIMARY KEY,
  task_id               BIGINT NOT NULL REFERENCES wbs_tasks(id) ON DELETE CASCADE,
  depends_on_task_id    BIGINT NOT NULL REFERENCES wbs_tasks(id) ON DELETE CASCADE,
  dependency_type       VARCHAR(40) NOT NULL DEFAULT 'finish_to_start',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT wbs_task_dependencies_pair_uk UNIQUE (task_id, depends_on_task_id),
  CONSTRAINT wbs_task_dependencies_not_self_chk CHECK (task_id <> depends_on_task_id),
  CONSTRAINT wbs_task_dependencies_type_not_blank_chk CHECK (btrim(dependency_type) <> '')
);

CREATE INDEX IF NOT EXISTS ix_wbs_task_dependencies_depends_on_task_id
  ON wbs_task_dependencies(depends_on_task_id);

-- ------------------------------------------------------------
-- project_outputs
-- outputs/evidence directly tied to WBS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_outputs (
  id                    BIGSERIAL PRIMARY KEY,
  project_id            BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  wbs_task_id           BIGINT NULL REFERENCES wbs_tasks(id) ON DELETE SET NULL,
  output_type           VARCHAR(80) NOT NULL DEFAULT 'document',
  title                 VARCHAR(255) NOT NULL,
  file_url              TEXT NOT NULL DEFAULT '',
  external_url          TEXT NOT NULL DEFAULT '',
  version_label         VARCHAR(80) NOT NULL DEFAULT '',
  is_final              BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_by           BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  metadata_json         JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT project_outputs_title_not_blank_chk CHECK (btrim(title) <> ''),
  CONSTRAINT project_outputs_type_not_blank_chk CHECK (btrim(output_type) <> '')
);

CREATE INDEX IF NOT EXISTS ix_project_outputs_project_id
  ON project_outputs(project_id);

CREATE INDEX IF NOT EXISTS ix_project_outputs_wbs_task_id
  ON project_outputs(wbs_task_id);

CREATE INDEX IF NOT EXISTS ix_project_outputs_uploaded_by
  ON project_outputs(uploaded_by);

DROP TRIGGER IF EXISTS trg_project_outputs_set_updated_at ON project_outputs;
CREATE TRIGGER trg_project_outputs_set_updated_at
BEFORE UPDATE ON project_outputs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- project_issues
-- issue / risk / blocker tracking
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_issues (
  id                    BIGSERIAL PRIMARY KEY,
  project_id            BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  wbs_task_id           BIGINT NULL REFERENCES wbs_tasks(id) ON DELETE SET NULL,
  issue_type            VARCHAR(40) NOT NULL DEFAULT 'issue'
                          CHECK (issue_type IN ('issue', 'risk', 'blocker')),
  title                 VARCHAR(255) NOT NULL,
  description           TEXT NOT NULL DEFAULT '',
  priority              VARCHAR(40) NOT NULL DEFAULT 'medium',
  status                VARCHAR(40) NOT NULL DEFAULT 'open'
                          CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  reporter_user_id      BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  assignee_user_id      BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  due_date              DATE NULL,
  resolved_at           TIMESTAMPTZ NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT project_issues_title_not_blank_chk CHECK (btrim(title) <> ''),
  CONSTRAINT project_issues_priority_not_blank_chk CHECK (btrim(priority) <> ''),
  CONSTRAINT project_issues_resolved_status_chk CHECK (
    status NOT IN ('resolved', 'closed') OR resolved_at IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS ix_project_issues_project_id
  ON project_issues(project_id);

CREATE INDEX IF NOT EXISTS ix_project_issues_wbs_task_id
  ON project_issues(wbs_task_id);

CREATE INDEX IF NOT EXISTS ix_project_issues_status
  ON project_issues(status);

CREATE INDEX IF NOT EXISTS ix_project_issues_issue_type
  ON project_issues(issue_type);

CREATE INDEX IF NOT EXISTS ix_project_issues_assignee_user_id
  ON project_issues(assignee_user_id);

DROP TRIGGER IF EXISTS trg_project_issues_set_updated_at ON project_issues;
CREATE TRIGGER trg_project_issues_set_updated_at
BEFORE UPDATE ON project_issues
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- backfill FKs for earlier tables created before projects existed
-- 003_public_content.sql intentionally left these as nullable BIGINT
-- ------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'inquiries'
      AND column_name = 'project_id'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'inquiries_project_id_fk'
    ) THEN
      ALTER TABLE inquiries
        ADD CONSTRAINT inquiries_project_id_fk
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'opportunities'
      AND column_name = 'project_id'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'opportunities_project_id_fk'
    ) THEN
      ALTER TABLE opportunities
        ADD CONSTRAINT opportunities_project_id_fk
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

COMMIT;