-- 007_evaluations.sql
-- Scope:
--   - evaluation_cycles
--   - evaluation_items
--   - evaluation_scores
--   - evaluation_evidences
--   - evaluation_feedbacks
--
-- Notes:
--   - Assumes 001_core_org_auth.sql, 002_service_hub.sql, 004_projects_wbs.sql,
--     005_daily_reports_logs.sql, 006_approvals.sql have already run.
--   - Evaluation cycle status standard:
--       draft / open / scoring / finalized / closed
--   - Score entry requires prior evidence for the same cycle + evaluatee.
--   - finalized / closed cycle requires evidence and scores to exist.

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
-- evaluation_cycles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evaluation_cycles (
  id                  BIGSERIAL PRIMARY KEY,
  name                VARCHAR(255) NOT NULL,
  start_date          DATE NOT NULL,
  end_date            DATE NOT NULL,
  status              VARCHAR(40) NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'open', 'scoring', 'finalized', 'closed')),
  description         TEXT NOT NULL DEFAULT '',
  created_by          BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  finalized_at        TIMESTAMPTZ NULL,
  closed_at           TIMESTAMPTZ NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT evaluation_cycles_name_not_blank_chk CHECK (btrim(name) <> ''),
  CONSTRAINT evaluation_cycles_date_range_chk CHECK (end_date >= start_date),
  CONSTRAINT evaluation_cycles_finalized_status_chk CHECK (
    finalized_at IS NULL OR status IN ('finalized', 'closed')
  ),
  CONSTRAINT evaluation_cycles_closed_status_chk CHECK (
    closed_at IS NULL OR status = 'closed'
  )
);

CREATE INDEX IF NOT EXISTS ix_evaluation_cycles_status
  ON evaluation_cycles(status);

CREATE INDEX IF NOT EXISTS ix_evaluation_cycles_start_date
  ON evaluation_cycles(start_date);

CREATE INDEX IF NOT EXISTS ix_evaluation_cycles_end_date
  ON evaluation_cycles(end_date);

CREATE INDEX IF NOT EXISTS ix_evaluation_cycles_created_by
  ON evaluation_cycles(created_by);

CREATE INDEX IF NOT EXISTS ix_evaluation_cycles_status_end_date
  ON evaluation_cycles(status, end_date DESC);

DROP TRIGGER IF EXISTS trg_evaluation_cycles_set_updated_at ON evaluation_cycles;
CREATE TRIGGER trg_evaluation_cycles_set_updated_at
BEFORE UPDATE ON evaluation_cycles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- evaluation_items
-- Group structure:
--   common / job_specific / project_contribution / collaboration
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evaluation_items (
  id                  BIGSERIAL PRIMARY KEY,
  cycle_id            BIGINT NOT NULL REFERENCES evaluation_cycles(id) ON DELETE CASCADE,
  code                VARCHAR(120) NOT NULL,
  name                VARCHAR(255) NOT NULL,
  item_group          VARCHAR(80) NOT NULL
                        CHECK (item_group IN ('common', 'job_specific', 'project_contribution', 'collaboration')),
  weight              NUMERIC(6,2) NOT NULL CHECK (weight >= 0),
  sort_order          INTEGER NOT NULL DEFAULT 0,
  description         TEXT NOT NULL DEFAULT '',
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT evaluation_items_cycle_code_uk UNIQUE (cycle_id, code),
  CONSTRAINT evaluation_items_code_not_blank_chk CHECK (btrim(code) <> ''),
  CONSTRAINT evaluation_items_name_not_blank_chk CHECK (btrim(name) <> ''),
  CONSTRAINT evaluation_items_sort_order_nonnegative_chk CHECK (sort_order >= 0)
);

CREATE INDEX IF NOT EXISTS ix_evaluation_items_cycle_id
  ON evaluation_items(cycle_id);

CREATE INDEX IF NOT EXISTS ix_evaluation_items_item_group
  ON evaluation_items(item_group);

CREATE INDEX IF NOT EXISTS ix_evaluation_items_cycle_sort
  ON evaluation_items(cycle_id, sort_order);

CREATE UNIQUE INDEX IF NOT EXISTS ux_evaluation_items_cycle_code_lower
  ON evaluation_items(cycle_id, lower(code));

DROP TRIGGER IF EXISTS trg_evaluation_items_set_updated_at ON evaluation_items;
CREATE TRIGGER trg_evaluation_items_set_updated_at
BEFORE UPDATE ON evaluation_items
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- evaluation_evidences
-- Evidence must come first.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evaluation_evidences (
  id                  BIGSERIAL PRIMARY KEY,
  cycle_id            BIGINT NOT NULL REFERENCES evaluation_cycles(id) ON DELETE CASCADE,
  user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_type         VARCHAR(80) NOT NULL
                        CHECK (source_type IN (
                          'wbs_task',
                          'project_output',
                          'approval_document',
                          'daily_report',
                          'daily_log',
                          'quality_review',
                          'risk_record',
                          'collaboration_comment',
                          'schedule_metric',
                          'rework_metric',
                          'lead_conversion'
                        )),
  source_id           BIGINT NOT NULL CHECK (source_id > 0),
  service_id          BIGINT NULL REFERENCES services(id) ON DELETE SET NULL,
  project_id          BIGINT NULL REFERENCES projects(id) ON DELETE SET NULL,
  summary_json        JSONB NOT NULL DEFAULT '{}'::JSONB,
  occurred_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT evaluation_evidences_cycle_user_source_uk
    UNIQUE (cycle_id, user_id, source_type, source_id)
);

CREATE INDEX IF NOT EXISTS ix_evaluation_evidences_cycle_id
  ON evaluation_evidences(cycle_id);

CREATE INDEX IF NOT EXISTS ix_evaluation_evidences_user_id
  ON evaluation_evidences(user_id);

CREATE INDEX IF NOT EXISTS ix_evaluation_evidences_project_id
  ON evaluation_evidences(project_id);

CREATE INDEX IF NOT EXISTS ix_evaluation_evidences_service_id
  ON evaluation_evidences(service_id);

CREATE INDEX IF NOT EXISTS ix_evaluation_evidences_source
  ON evaluation_evidences(source_type, source_id);

CREATE INDEX IF NOT EXISTS ix_evaluation_evidences_occurred_at
  ON evaluation_evidences(occurred_at DESC);

CREATE INDEX IF NOT EXISTS ix_evaluation_evidences_cycle_user_occurred_at
  ON evaluation_evidences(cycle_id, user_id, occurred_at DESC);

DROP TRIGGER IF EXISTS trg_evaluation_evidences_set_updated_at ON evaluation_evidences;
CREATE TRIGGER trg_evaluation_evidences_set_updated_at
BEFORE UPDATE ON evaluation_evidences
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- evaluation_scores
-- Score entry blocked unless evidence exists first.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evaluation_scores (
  id                  BIGSERIAL PRIMARY KEY,
  cycle_id            BIGINT NOT NULL REFERENCES evaluation_cycles(id) ON DELETE CASCADE,
  evaluatee_user_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  evaluator_user_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  evaluation_item_id  BIGINT NOT NULL REFERENCES evaluation_items(id) ON DELETE CASCADE,
  score               NUMERIC(6,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  comment             TEXT NOT NULL DEFAULT '',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT evaluation_scores_cycle_evale_evalr_item_uk
    UNIQUE (cycle_id, evaluatee_user_id, evaluator_user_id, evaluation_item_id)
);

CREATE INDEX IF NOT EXISTS ix_evaluation_scores_cycle_id
  ON evaluation_scores(cycle_id);

CREATE INDEX IF NOT EXISTS ix_evaluation_scores_evaluatee_user_id
  ON evaluation_scores(evaluatee_user_id);

CREATE INDEX IF NOT EXISTS ix_evaluation_scores_evaluator_user_id
  ON evaluation_scores(evaluator_user_id);

CREATE INDEX IF NOT EXISTS ix_evaluation_scores_item_id
  ON evaluation_scores(evaluation_item_id);

CREATE INDEX IF NOT EXISTS ix_evaluation_scores_cycle_evaluatee_item
  ON evaluation_scores(cycle_id, evaluatee_user_id, evaluation_item_id);

DROP TRIGGER IF EXISTS trg_evaluation_scores_set_updated_at ON evaluation_scores;
CREATE TRIGGER trg_evaluation_scores_set_updated_at
BEFORE UPDATE ON evaluation_scores
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- evaluation_feedbacks
-- Supports mid / final feedback and visible notes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evaluation_feedbacks (
  id                  BIGSERIAL PRIMARY KEY,
  cycle_id            BIGINT NOT NULL REFERENCES evaluation_cycles(id) ON DELETE CASCADE,
  evaluatee_user_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feedback_type       VARCHAR(40) NOT NULL DEFAULT 'final'
                        CHECK (feedback_type IN ('mid', 'final')),
  content             TEXT NOT NULL,
  is_visible_to_user  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT evaluation_feedbacks_content_not_blank_chk CHECK (btrim(content) <> '')
);

CREATE INDEX IF NOT EXISTS ix_evaluation_feedbacks_cycle_id
  ON evaluation_feedbacks(cycle_id);

CREATE INDEX IF NOT EXISTS ix_evaluation_feedbacks_evaluatee_user_id
  ON evaluation_feedbacks(evaluatee_user_id);

CREATE INDEX IF NOT EXISTS ix_evaluation_feedbacks_author_user_id
  ON evaluation_feedbacks(author_user_id);

CREATE INDEX IF NOT EXISTS ix_evaluation_feedbacks_feedback_type
  ON evaluation_feedbacks(feedback_type);

DROP TRIGGER IF EXISTS trg_evaluation_feedbacks_set_updated_at ON evaluation_feedbacks;
CREATE TRIGGER trg_evaluation_feedbacks_set_updated_at
BEFORE UPDATE ON evaluation_feedbacks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- Validation 1:
-- evaluation_item must belong to the same cycle as evaluation_scores.cycle_id
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_evaluation_score_item_cycle_match()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  v_cycle_id BIGINT;
BEGIN
  SELECT cycle_id
    INTO v_cycle_id
  FROM evaluation_items
  WHERE id = NEW.evaluation_item_id;

  IF v_cycle_id IS NULL OR v_cycle_id <> NEW.cycle_id THEN
    RAISE EXCEPTION 'evaluation_scores.evaluation_item_id must belong to the same cycle_id';
  END IF;

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_validate_evaluation_score_item_cycle_match ON evaluation_scores;
CREATE TRIGGER trg_validate_evaluation_score_item_cycle_match
BEFORE INSERT OR UPDATE ON evaluation_scores
FOR EACH ROW
EXECUTE FUNCTION validate_evaluation_score_item_cycle_match();

-- ------------------------------------------------------------
-- Validation 2:
-- score cannot be entered before evidence exists
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_evaluation_score_requires_evidence()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
    INTO v_count
  FROM evaluation_evidences
  WHERE cycle_id = NEW.cycle_id
    AND user_id = NEW.evaluatee_user_id;

  IF v_count < 1 THEN
    RAISE EXCEPTION 'evaluation_scores requires at least one evaluation_evidences row for the same cycle and evaluatee';
  END IF;

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_validate_evaluation_score_requires_evidence ON evaluation_scores;
CREATE TRIGGER trg_validate_evaluation_score_requires_evidence
BEFORE INSERT OR UPDATE ON evaluation_scores
FOR EACH ROW
EXECUTE FUNCTION validate_evaluation_score_requires_evidence();

-- ------------------------------------------------------------
-- Validation 3:
-- finalized / closed cycle must have both evidence and scores
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_evaluation_cycle_finalize_requirements()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  v_evidence_count INTEGER;
  v_score_count    INTEGER;
BEGIN
  IF NEW.status IN ('finalized', 'closed') THEN
    SELECT COUNT(*)
      INTO v_evidence_count
    FROM evaluation_evidences
    WHERE cycle_id = NEW.id;

    SELECT COUNT(*)
      INTO v_score_count
    FROM evaluation_scores
    WHERE cycle_id = NEW.id;

    IF v_evidence_count < 1 THEN
      RAISE EXCEPTION 'finalized/closed evaluation cycle must have at least one evaluation_evidences row';
    END IF;

    IF v_score_count < 1 THEN
      RAISE EXCEPTION 'finalized/closed evaluation cycle must have at least one evaluation_scores row';
    END IF;

    IF NEW.status = 'finalized' AND NEW.finalized_at IS NULL THEN
      RAISE EXCEPTION 'finalized evaluation cycle must set finalized_at';
    END IF;

    IF NEW.status = 'closed' AND (NEW.finalized_at IS NULL OR NEW.closed_at IS NULL) THEN
      RAISE EXCEPTION 'closed evaluation cycle must set finalized_at and closed_at';
    END IF;
  END IF;

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_validate_evaluation_cycle_finalize_requirements ON evaluation_cycles;
CREATE CONSTRAINT TRIGGER trg_validate_evaluation_cycle_finalize_requirements
AFTER INSERT OR UPDATE ON evaluation_cycles
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION validate_evaluation_cycle_finalize_requirements();

COMMIT;