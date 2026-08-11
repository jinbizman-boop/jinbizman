-- 006_approvals.sql
-- Scope:
--   - approval_documents
--   - approval_lines
--   - approval_actions
--
-- Notes:
--   - Assumes 001_core_org_auth.sql, 002_service_hub.sql, 004_projects_wbs.sql have already run.
--   - Document status standard:
--       draft / submitted / approved / rejected / cancelled
--   - Action type standard:
--       approve / reject / request_changes
--   - Submitted approval document must have at least one approval line.

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
-- approval_documents
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approval_documents (
  id                    BIGSERIAL PRIMARY KEY,
  document_type         VARCHAR(80) NOT NULL,
  title                 VARCHAR(255) NOT NULL,
  project_id            BIGINT NULL REFERENCES projects(id) ON DELETE SET NULL,
  service_id            BIGINT NULL REFERENCES services(id) ON DELETE SET NULL,
  requester_user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  related_wbs_task_id   BIGINT NULL REFERENCES wbs_tasks(id) ON DELETE SET NULL,
  status                VARCHAR(40) NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'cancelled')),
  payload_json          JSONB NOT NULL DEFAULT '{}'::JSONB,
  submitted_at          TIMESTAMPTZ NULL,
  completed_at          TIMESTAMPTZ NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT approval_documents_document_type_not_blank_chk CHECK (btrim(document_type) <> ''),
  CONSTRAINT approval_documents_title_not_blank_chk CHECK (btrim(title) <> ''),
  CONSTRAINT approval_documents_completed_status_chk CHECK (
    completed_at IS NULL OR status IN ('approved', 'rejected', 'cancelled')
  )
);

CREATE INDEX IF NOT EXISTS ix_approval_documents_status
  ON approval_documents(status);

CREATE INDEX IF NOT EXISTS ix_approval_documents_document_type
  ON approval_documents(document_type);

CREATE INDEX IF NOT EXISTS ix_approval_documents_project_id
  ON approval_documents(project_id);

CREATE INDEX IF NOT EXISTS ix_approval_documents_service_id
  ON approval_documents(service_id);

CREATE INDEX IF NOT EXISTS ix_approval_documents_requester_user_id
  ON approval_documents(requester_user_id);

CREATE INDEX IF NOT EXISTS ix_approval_documents_related_wbs_task_id
  ON approval_documents(related_wbs_task_id);

CREATE INDEX IF NOT EXISTS ix_approval_documents_submitted_at
  ON approval_documents(submitted_at DESC);

CREATE INDEX IF NOT EXISTS ix_approval_documents_created_at
  ON approval_documents(created_at DESC);

CREATE INDEX IF NOT EXISTS ix_approval_documents_status_requester
  ON approval_documents(status, requester_user_id);

DROP TRIGGER IF EXISTS trg_approval_documents_set_updated_at ON approval_documents;
CREATE TRIGGER trg_approval_documents_set_updated_at
BEFORE UPDATE ON approval_documents
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- approval_lines
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approval_lines (
  id                    BIGSERIAL PRIMARY KEY,
  approval_document_id  BIGINT NOT NULL REFERENCES approval_documents(id) ON DELETE CASCADE,
  sequence_no           INTEGER NOT NULL CHECK (sequence_no >= 1),
  approver_user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  line_role             VARCHAR(80) NOT NULL DEFAULT 'approver',
  is_required           BOOLEAN NOT NULL DEFAULT TRUE,
  line_status           VARCHAR(40) NOT NULL DEFAULT 'pending'
                          CHECK (line_status IN ('pending', 'approved', 'rejected', 'request_changes', 'skipped')),
  acted_at              TIMESTAMPTZ NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT approval_lines_document_sequence_uk UNIQUE (approval_document_id, sequence_no),
  CONSTRAINT approval_lines_document_approver_uk UNIQUE (approval_document_id, approver_user_id),
  CONSTRAINT approval_lines_role_not_blank_chk CHECK (btrim(line_role) <> ''),
  CONSTRAINT approval_lines_acted_status_chk CHECK (
    (line_status = 'pending' AND acted_at IS NULL)
    OR
    (line_status IN ('approved', 'rejected', 'request_changes', 'skipped') AND acted_at IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS ix_approval_lines_approval_document_id
  ON approval_lines(approval_document_id);

CREATE INDEX IF NOT EXISTS ix_approval_lines_approver_user_id
  ON approval_lines(approver_user_id);

CREATE INDEX IF NOT EXISTS ix_approval_lines_line_status
  ON approval_lines(line_status);

CREATE INDEX IF NOT EXISTS ix_approval_lines_document_sequence
  ON approval_lines(approval_document_id, sequence_no);

CREATE INDEX IF NOT EXISTS ix_approval_lines_approver_status
  ON approval_lines(approver_user_id, line_status);

DROP TRIGGER IF EXISTS trg_approval_lines_set_updated_at ON approval_lines;
CREATE TRIGGER trg_approval_lines_set_updated_at
BEFORE UPDATE ON approval_lines
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- approval_actions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approval_actions (
  id                    BIGSERIAL PRIMARY KEY,
  approval_document_id  BIGINT NOT NULL REFERENCES approval_documents(id) ON DELETE CASCADE,
  approval_line_id      BIGINT NULL REFERENCES approval_lines(id) ON DELETE SET NULL,
  approver_user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  action_type           VARCHAR(40) NOT NULL
                          CHECK (action_type IN ('approve', 'reject', 'request_changes')),
  comment               TEXT NOT NULL DEFAULT '',
  acted_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_approval_actions_approval_document_id
  ON approval_actions(approval_document_id);

CREATE INDEX IF NOT EXISTS ix_approval_actions_approval_line_id
  ON approval_actions(approval_line_id);

CREATE INDEX IF NOT EXISTS ix_approval_actions_approver_user_id
  ON approval_actions(approver_user_id);

CREATE INDEX IF NOT EXISTS ix_approval_actions_action_type
  ON approval_actions(action_type);

CREATE INDEX IF NOT EXISTS ix_approval_actions_acted_at
  ON approval_actions(acted_at DESC);

CREATE INDEX IF NOT EXISTS ix_approval_actions_document_approver
  ON approval_actions(approval_document_id, approver_user_id);

-- ------------------------------------------------------------
-- Validation: related_wbs_task_id must match project_id when both exist
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_approval_document_wbs_project_match()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  v_task_project_id BIGINT;
BEGIN
  IF NEW.related_wbs_task_id IS NULL OR NEW.project_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT project_id
    INTO v_task_project_id
  FROM wbs_tasks
  WHERE id = NEW.related_wbs_task_id;

  IF v_task_project_id IS NULL OR v_task_project_id <> NEW.project_id THEN
    RAISE EXCEPTION 'approval_documents.related_wbs_task_id must belong to approval_documents.project_id';
  END IF;

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_validate_approval_document_wbs_project_match ON approval_documents;
CREATE TRIGGER trg_validate_approval_document_wbs_project_match
BEFORE INSERT OR UPDATE ON approval_documents
FOR EACH ROW
EXECUTE FUNCTION validate_approval_document_wbs_project_match();

-- ------------------------------------------------------------
-- Validation: approval_line_id must belong to approval_document_id
-- and approver_user_id must match the approval line approver
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_approval_action_line_matches_document()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  v_document_id BIGINT;
  v_line_approver_user_id BIGINT;
BEGIN
  IF NEW.approval_line_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT approval_document_id, approver_user_id
    INTO v_document_id, v_line_approver_user_id
  FROM approval_lines
  WHERE id = NEW.approval_line_id;

  IF v_document_id IS NULL OR v_document_id <> NEW.approval_document_id THEN
    RAISE EXCEPTION 'approval_actions.approval_line_id must belong to the same approval_document_id';
  END IF;

  IF v_line_approver_user_id <> NEW.approver_user_id THEN
    RAISE EXCEPTION 'approval_actions.approver_user_id must match approval_lines.approver_user_id';
  END IF;

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_validate_approval_action_line_matches_document ON approval_actions;
CREATE TRIGGER trg_validate_approval_action_line_matches_document
BEFORE INSERT OR UPDATE ON approval_actions
FOR EACH ROW
EXECUTE FUNCTION validate_approval_action_line_matches_document();

-- ------------------------------------------------------------
-- Validation: submitted document must have at least one approval line
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_submitted_approval_document_has_lines()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  v_count INTEGER;
BEGIN
  IF NEW.status = 'submitted' THEN
    SELECT COUNT(*)
      INTO v_count
    FROM approval_lines
    WHERE approval_document_id = NEW.id;

    IF v_count < 1 THEN
      RAISE EXCEPTION 'submitted approval_documents row must have at least one approval_lines row';
    END IF;

    IF NEW.submitted_at IS NULL THEN
      RAISE EXCEPTION 'submitted approval_documents row must set submitted_at';
    END IF;
  END IF;

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_validate_submitted_approval_document_has_lines ON approval_documents;
CREATE CONSTRAINT TRIGGER trg_validate_submitted_approval_document_has_lines
AFTER INSERT OR UPDATE ON approval_documents
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION validate_submitted_approval_document_has_lines();

COMMIT;