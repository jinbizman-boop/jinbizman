-- 009_audit_notifications.sql
-- Scope:
--   - attachments
--   - comments
--   - notifications
--   - audit_logs
--
-- Notes:
--   - Assumes earlier core/service/project/evaluation migrations are already applied.
--   - audit_logs contract explicitly includes:
--       request_id, actor_user_id, action_type, target_type, target_id,
--       scope, service_id, project_id, before_json, after_json, ip_hash, user_agent, created_at
--   - comments / attachments / notifications use a polymorphic target model
--     to preserve structural continuity across service, WBS, approval, inquiry, news, etc.

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
-- attachments
-- Generic file attachment table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attachments (
  id                  BIGSERIAL PRIMARY KEY,
  target_type         VARCHAR(80) NOT NULL,
  target_id           BIGINT NOT NULL CHECK (target_id > 0),
  service_id          BIGINT NULL REFERENCES services(id) ON DELETE SET NULL,
  project_id          BIGINT NULL REFERENCES projects(id) ON DELETE SET NULL,
  uploaded_by         BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  file_name           VARCHAR(255) NOT NULL,
  file_url            TEXT NOT NULL,
  mime_type           VARCHAR(120) NOT NULL DEFAULT '',
  file_size_bytes     BIGINT NOT NULL DEFAULT 0 CHECK (file_size_bytes >= 0),
  metadata_json       JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT attachments_target_type_not_blank_chk CHECK (btrim(target_type) <> ''),
  CONSTRAINT attachments_file_name_not_blank_chk CHECK (btrim(file_name) <> ''),
  CONSTRAINT attachments_file_url_not_blank_chk CHECK (btrim(file_url) <> '')
);

CREATE INDEX IF NOT EXISTS ix_attachments_target
  ON attachments(target_type, target_id);

CREATE INDEX IF NOT EXISTS ix_attachments_service_id
  ON attachments(service_id);

CREATE INDEX IF NOT EXISTS ix_attachments_project_id
  ON attachments(project_id);

CREATE INDEX IF NOT EXISTS ix_attachments_uploaded_by
  ON attachments(uploaded_by);

CREATE INDEX IF NOT EXISTS ix_attachments_created_at
  ON attachments(created_at DESC);

CREATE INDEX IF NOT EXISTS ix_attachments_target_created_at
  ON attachments(target_type, target_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_attachments_set_updated_at ON attachments;
CREATE TRIGGER trg_attachments_set_updated_at
BEFORE UPDATE ON attachments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- comments
-- Generic comment / memo table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comments (
  id                  BIGSERIAL PRIMARY KEY,
  target_type         VARCHAR(80) NOT NULL,
  target_id           BIGINT NOT NULL CHECK (target_id > 0),
  parent_comment_id   BIGINT NULL REFERENCES comments(id) ON DELETE CASCADE,
  service_id          BIGINT NULL REFERENCES services(id) ON DELETE SET NULL,
  project_id          BIGINT NULL REFERENCES projects(id) ON DELETE SET NULL,
  author_user_id      BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  content             TEXT NOT NULL,
  is_internal         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT comments_parent_not_self_chk CHECK (parent_comment_id IS NULL OR parent_comment_id <> id),
  CONSTRAINT comments_target_type_not_blank_chk CHECK (btrim(target_type) <> ''),
  CONSTRAINT comments_content_not_blank_chk CHECK (btrim(content) <> '')
);

CREATE INDEX IF NOT EXISTS ix_comments_target
  ON comments(target_type, target_id);

CREATE INDEX IF NOT EXISTS ix_comments_parent_comment_id
  ON comments(parent_comment_id);

CREATE INDEX IF NOT EXISTS ix_comments_service_id
  ON comments(service_id);

CREATE INDEX IF NOT EXISTS ix_comments_project_id
  ON comments(project_id);

CREATE INDEX IF NOT EXISTS ix_comments_author_user_id
  ON comments(author_user_id);

CREATE INDEX IF NOT EXISTS ix_comments_created_at
  ON comments(created_at DESC);

CREATE INDEX IF NOT EXISTS ix_comments_target_created_at
  ON comments(target_type, target_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_comments_set_updated_at ON comments;
CREATE TRIGGER trg_comments_set_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- notifications
-- In-app notification table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id                  BIGSERIAL PRIMARY KEY,
  recipient_user_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type   VARCHAR(80) NOT NULL,
  channel             VARCHAR(40) NOT NULL DEFAULT 'in_app'
                        CHECK (channel IN ('in_app', 'email', 'system')),
  title               VARCHAR(255) NOT NULL,
  message             TEXT NOT NULL DEFAULT '',
  related_type        VARCHAR(80) NOT NULL DEFAULT '',
  related_id          BIGINT NULL,
  service_id          BIGINT NULL REFERENCES services(id) ON DELETE SET NULL,
  project_id          BIGINT NULL REFERENCES projects(id) ON DELETE SET NULL,
  is_read             BOOLEAN NOT NULL DEFAULT FALSE,
  read_at             TIMESTAMPTZ NULL,
  sent_at             TIMESTAMPTZ NULL,
  metadata_json       JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT notifications_type_not_blank_chk CHECK (btrim(notification_type) <> ''),
  CONSTRAINT notifications_title_not_blank_chk CHECK (btrim(title) <> ''),
  CONSTRAINT notifications_related_pair_chk CHECK (
    (btrim(related_type) = '' AND related_id IS NULL)
    OR
    (btrim(related_type) <> '' AND related_id IS NOT NULL)
  ),
  CONSTRAINT notifications_read_at_chk CHECK (
    (is_read = FALSE AND read_at IS NULL) OR
    (is_read = TRUE AND read_at IS NOT NULL)
  ),
  CONSTRAINT notifications_sent_at_email_chk CHECK (
    channel <> 'email' OR sent_at IS NOT NULL OR channel = 'email'
  )
);

CREATE INDEX IF NOT EXISTS ix_notifications_recipient_user_id
  ON notifications(recipient_user_id);

CREATE INDEX IF NOT EXISTS ix_notifications_is_read
  ON notifications(is_read);

CREATE INDEX IF NOT EXISTS ix_notifications_service_id
  ON notifications(service_id);

CREATE INDEX IF NOT EXISTS ix_notifications_project_id
  ON notifications(project_id);

CREATE INDEX IF NOT EXISTS ix_notifications_related
  ON notifications(related_type, related_id);

CREATE INDEX IF NOT EXISTS ix_notifications_created_at
  ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS ix_notifications_recipient_read_created_at
  ON notifications(recipient_user_id, is_read, created_at DESC);

DROP TRIGGER IF EXISTS trg_notifications_set_updated_at ON notifications;
CREATE TRIGGER trg_notifications_set_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- audit_logs
-- Must include the stronger contract required by docs + feedback
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id                  BIGSERIAL PRIMARY KEY,
  request_id          VARCHAR(120) NOT NULL,
  actor_user_id       BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  action_type         VARCHAR(80) NOT NULL,
  target_type         VARCHAR(80) NOT NULL,
  target_id           BIGINT NULL,
  scope               VARCHAR(40) NOT NULL
                        CHECK (scope IN ('public', 'admin', 'erp', 'system')),
  service_id          BIGINT NULL REFERENCES services(id) ON DELETE SET NULL,
  project_id          BIGINT NULL REFERENCES projects(id) ON DELETE SET NULL,
  before_json         JSONB NOT NULL DEFAULT '{}'::JSONB,
  after_json          JSONB NOT NULL DEFAULT '{}'::JSONB,
  ip_hash             VARCHAR(255) NOT NULL DEFAULT '',
  user_agent          TEXT NOT NULL DEFAULT '',
  status_code         INTEGER NULL CHECK (status_code IS NULL OR status_code BETWEEN 100 AND 599),
  error_code          VARCHAR(120) NOT NULL DEFAULT '',
  duration_ms         INTEGER NULL CHECK (duration_ms IS NULL OR duration_ms >= 0),
  metadata_json       JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT audit_logs_request_id_not_blank_chk CHECK (btrim(request_id) <> ''),
  CONSTRAINT audit_logs_action_type_not_blank_chk CHECK (btrim(action_type) <> ''),
  CONSTRAINT audit_logs_target_type_not_blank_chk CHECK (btrim(target_type) <> ''),
  CONSTRAINT audit_logs_ip_hash_not_blank_chk CHECK (btrim(ip_hash) <> ''),
  CONSTRAINT audit_logs_user_agent_not_blank_chk CHECK (btrim(user_agent) <> '')
);

CREATE INDEX IF NOT EXISTS ix_audit_logs_request_id
  ON audit_logs(request_id);

CREATE INDEX IF NOT EXISTS ix_audit_logs_actor_user_id
  ON audit_logs(actor_user_id);

CREATE INDEX IF NOT EXISTS ix_audit_logs_action_type
  ON audit_logs(action_type);

CREATE INDEX IF NOT EXISTS ix_audit_logs_target
  ON audit_logs(target_type, target_id);

CREATE INDEX IF NOT EXISTS ix_audit_logs_scope
  ON audit_logs(scope);

CREATE INDEX IF NOT EXISTS ix_audit_logs_service_id
  ON audit_logs(service_id);

CREATE INDEX IF NOT EXISTS ix_audit_logs_project_id
  ON audit_logs(project_id);

CREATE INDEX IF NOT EXISTS ix_audit_logs_created_at
  ON audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS ix_audit_logs_scope_created_at
  ON audit_logs(scope, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_audit_logs_service_action_created_at
  ON audit_logs(service_id, action_type, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_audit_logs_project_action_created_at
  ON audit_logs(project_id, action_type, created_at DESC);



-- ------------------------------------------------------------
-- api_rate_limits
-- Fixed-window rate-limit buckets for public Worker endpoints.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS api_rate_limits (
  bucket_key       VARCHAR(180) PRIMARY KEY,
  request_count    INTEGER NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS api_rate_limits_window_started_at_idx
  ON api_rate_limits(window_started_at);

DROP TRIGGER IF EXISTS trg_api_rate_limits_set_updated_at ON api_rate_limits;
CREATE TRIGGER trg_api_rate_limits_set_updated_at
BEFORE UPDATE ON api_rate_limits
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

COMMIT;