-- 005_daily_reports_logs.sql
-- Scope:
--   - daily_reports
--   - daily_report_items
--   - daily_logs
--   - daily_log_items
--
-- Notes:
--   - Assumes 001_core_org_auth.sql and 004_projects_wbs.sql are already applied.
--   - All report/log items must reference WBS tasks.
--   - Submitted report/log must contain at least one item.
--   - WBS task referenced by each item must belong to the same project as its parent report/log.

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
-- daily_reports
-- 아침 업무보고 헤더
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_reports (
  id                      BIGSERIAL PRIMARY KEY,
  user_id                 BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id           BIGINT NULL REFERENCES departments(id) ON DELETE SET NULL,
  report_date             DATE NOT NULL,
  project_id              BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  today_focus             TEXT NOT NULL DEFAULT '',
  top_priority_text       TEXT NOT NULL DEFAULT '',
  expected_blockers_text  TEXT NOT NULL DEFAULT '',
  support_request_target  TEXT NOT NULL DEFAULT '',
  expects_approval        BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at            TIMESTAMPTZ NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT daily_reports_user_date_project_uk UNIQUE (user_id, report_date, project_id)
);

CREATE INDEX IF NOT EXISTS ix_daily_reports_user_id
  ON daily_reports(user_id);

CREATE INDEX IF NOT EXISTS ix_daily_reports_department_id
  ON daily_reports(department_id);

CREATE INDEX IF NOT EXISTS ix_daily_reports_report_date
  ON daily_reports(report_date DESC);

CREATE INDEX IF NOT EXISTS ix_daily_reports_project_id
  ON daily_reports(project_id);

CREATE INDEX IF NOT EXISTS ix_daily_reports_submitted_at
  ON daily_reports(submitted_at);

CREATE INDEX IF NOT EXISTS ix_daily_reports_user_date
  ON daily_reports(user_id, report_date DESC);

CREATE INDEX IF NOT EXISTS ix_daily_reports_project_date
  ON daily_reports(project_id, report_date DESC);

DROP TRIGGER IF EXISTS trg_daily_reports_set_updated_at ON daily_reports;
CREATE TRIGGER trg_daily_reports_set_updated_at
BEFORE UPDATE ON daily_reports
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- daily_report_items
-- 아침 업무보고 항목
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_report_items (
  id                      BIGSERIAL PRIMARY KEY,
  daily_report_id         BIGINT NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  wbs_task_id             BIGINT NOT NULL REFERENCES wbs_tasks(id) ON DELETE RESTRICT,
  goal_text               TEXT NOT NULL,
  expected_hours          NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (expected_hours >= 0),
  collaboration_needed    BOOLEAN NOT NULL DEFAULT FALSE,
  has_preceding_issue     BOOLEAN NOT NULL DEFAULT FALSE,
  risk_text               TEXT NOT NULL DEFAULT '',
  support_request_text    TEXT NOT NULL DEFAULT '',
  target_completed_at     TIME NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT daily_report_items_report_task_uk UNIQUE (daily_report_id, wbs_task_id),
  CONSTRAINT daily_report_items_goal_text_not_blank_chk CHECK (btrim(goal_text) <> '')
);

CREATE INDEX IF NOT EXISTS ix_daily_report_items_daily_report_id
  ON daily_report_items(daily_report_id);

CREATE INDEX IF NOT EXISTS ix_daily_report_items_wbs_task_id
  ON daily_report_items(wbs_task_id);

CREATE INDEX IF NOT EXISTS ix_daily_report_items_report_task
  ON daily_report_items(daily_report_id, wbs_task_id);

DROP TRIGGER IF EXISTS trg_daily_report_items_set_updated_at ON daily_report_items;
CREATE TRIGGER trg_daily_report_items_set_updated_at
BEFORE UPDATE ON daily_report_items
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- daily_logs
-- 퇴근 업무일지 헤더
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_logs (
  id                        BIGSERIAL PRIMARY KEY,
  user_id                   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id             BIGINT NULL REFERENCES departments(id) ON DELETE SET NULL,
  log_date                  DATE NOT NULL,
  project_id                BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  daily_summary             TEXT NOT NULL DEFAULT '',
  collaboration_summary     TEXT NOT NULL DEFAULT '',
  pending_approval_summary  TEXT NOT NULL DEFAULT '',
  has_blocker               BOOLEAN NOT NULL DEFAULT FALSE,
  support_needed_text       TEXT NOT NULL DEFAULT '',
  submitted_at              TIMESTAMPTZ NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT daily_logs_user_date_project_uk UNIQUE (user_id, log_date, project_id)
);

CREATE INDEX IF NOT EXISTS ix_daily_logs_user_id
  ON daily_logs(user_id);

CREATE INDEX IF NOT EXISTS ix_daily_logs_department_id
  ON daily_logs(department_id);

CREATE INDEX IF NOT EXISTS ix_daily_logs_log_date
  ON daily_logs(log_date DESC);

CREATE INDEX IF NOT EXISTS ix_daily_logs_project_id
  ON daily_logs(project_id);

CREATE INDEX IF NOT EXISTS ix_daily_logs_submitted_at
  ON daily_logs(submitted_at);

CREATE INDEX IF NOT EXISTS ix_daily_logs_user_date
  ON daily_logs(user_id, log_date DESC);

CREATE INDEX IF NOT EXISTS ix_daily_logs_project_date
  ON daily_logs(project_id, log_date DESC);

DROP TRIGGER IF EXISTS trg_daily_logs_set_updated_at ON daily_logs;
CREATE TRIGGER trg_daily_logs_set_updated_at
BEFORE UPDATE ON daily_logs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- daily_log_items
-- 퇴근 업무일지 항목
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_log_items (
  id                      BIGSERIAL PRIMARY KEY,
  daily_log_id            BIGINT NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
  wbs_task_id             BIGINT NOT NULL REFERENCES wbs_tasks(id) ON DELETE RESTRICT,
  work_summary            TEXT NOT NULL,
  is_completed            BOOLEAN NOT NULL,
  actual_progress         INTEGER NOT NULL CHECK (actual_progress BETWEEN 0 AND 100),
  output_url              TEXT NOT NULL DEFAULT '',
  delay_reason_code       VARCHAR(80) NOT NULL DEFAULT '',
  issue_memo              TEXT NOT NULL DEFAULT '',
  next_action             TEXT NOT NULL DEFAULT '',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT daily_log_items_log_task_uk UNIQUE (daily_log_id, wbs_task_id),
  CONSTRAINT daily_log_items_work_summary_not_blank_chk CHECK (btrim(work_summary) <> ''),
  CONSTRAINT daily_log_items_completed_progress_chk
    CHECK (NOT is_completed OR actual_progress = 100),
  CONSTRAINT daily_log_items_incomplete_delay_reason_chk
    CHECK (is_completed OR btrim(delay_reason_code) <> ''),
  CONSTRAINT daily_log_items_incomplete_next_action_chk
    CHECK (is_completed OR btrim(next_action) <> '')
);

CREATE INDEX IF NOT EXISTS ix_daily_log_items_daily_log_id
  ON daily_log_items(daily_log_id);

CREATE INDEX IF NOT EXISTS ix_daily_log_items_wbs_task_id
  ON daily_log_items(wbs_task_id);

CREATE INDEX IF NOT EXISTS ix_daily_log_items_actual_progress
  ON daily_log_items(actual_progress);

CREATE INDEX IF NOT EXISTS ix_daily_log_items_log_task
  ON daily_log_items(daily_log_id, wbs_task_id);

DROP TRIGGER IF EXISTS trg_daily_log_items_set_updated_at ON daily_log_items;
CREATE TRIGGER trg_daily_log_items_set_updated_at
BEFORE UPDATE ON daily_log_items
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- Validation: each report item must point to a WBS task in the same project
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_daily_report_item_project_match()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  v_report_project_id BIGINT;
  v_task_project_id   BIGINT;
BEGIN
  SELECT project_id
    INTO v_report_project_id
  FROM daily_reports
  WHERE id = NEW.daily_report_id;

  SELECT project_id
    INTO v_task_project_id
  FROM wbs_tasks
  WHERE id = NEW.wbs_task_id;

  IF v_report_project_id IS NULL OR v_task_project_id IS NULL OR v_report_project_id <> v_task_project_id THEN
    RAISE EXCEPTION 'daily_report_items.wbs_task_id must belong to the same project as daily_reports.project_id';
  END IF;

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_validate_daily_report_item_project_match ON daily_report_items;
CREATE TRIGGER trg_validate_daily_report_item_project_match
BEFORE INSERT OR UPDATE ON daily_report_items
FOR EACH ROW
EXECUTE FUNCTION validate_daily_report_item_project_match();

-- ------------------------------------------------------------
-- Validation: each log item must point to a WBS task in the same project
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_daily_log_item_project_match()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  v_log_project_id  BIGINT;
  v_task_project_id BIGINT;
BEGIN
  SELECT project_id
    INTO v_log_project_id
  FROM daily_logs
  WHERE id = NEW.daily_log_id;

  SELECT project_id
    INTO v_task_project_id
  FROM wbs_tasks
  WHERE id = NEW.wbs_task_id;

  IF v_log_project_id IS NULL OR v_task_project_id IS NULL OR v_log_project_id <> v_task_project_id THEN
    RAISE EXCEPTION 'daily_log_items.wbs_task_id must belong to the same project as daily_logs.project_id';
  END IF;

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_validate_daily_log_item_project_match ON daily_log_items;
CREATE TRIGGER trg_validate_daily_log_item_project_match
BEFORE INSERT OR UPDATE ON daily_log_items
FOR EACH ROW
EXECUTE FUNCTION validate_daily_log_item_project_match();

-- ------------------------------------------------------------
-- Constraint trigger: submitted daily report must have at least one item
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_submitted_daily_report_has_items()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  v_count INTEGER;
BEGIN
  IF NEW.submitted_at IS NOT NULL THEN
    SELECT COUNT(*)
      INTO v_count
    FROM daily_report_items
    WHERE daily_report_id = NEW.id;

    IF v_count < 1 THEN
      RAISE EXCEPTION 'submitted daily_reports row must have at least one daily_report_items row';
    END IF;
  END IF;

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_validate_submitted_daily_report_has_items ON daily_reports;
CREATE CONSTRAINT TRIGGER trg_validate_submitted_daily_report_has_items
AFTER INSERT OR UPDATE ON daily_reports
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION validate_submitted_daily_report_has_items();

-- ------------------------------------------------------------
-- Constraint trigger: submitted daily log must have at least one item
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_submitted_daily_log_has_items()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  v_count INTEGER;
BEGIN
  IF NEW.submitted_at IS NOT NULL THEN
    SELECT COUNT(*)
      INTO v_count
    FROM daily_log_items
    WHERE daily_log_id = NEW.id;

    IF v_count < 1 THEN
      RAISE EXCEPTION 'submitted daily_logs row must have at least one daily_log_items row';
    END IF;
  END IF;

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_validate_submitted_daily_log_has_items ON daily_logs;
CREATE CONSTRAINT TRIGGER trg_validate_submitted_daily_log_has_items
AFTER INSERT OR UPDATE ON daily_logs
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION validate_submitted_daily_log_has_items();

COMMIT;