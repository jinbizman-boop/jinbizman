-- 011_production_hardening.sql
-- Production hardening and operating-classification layer.
-- Adds login lockout/audit support, Cybertron business-domain classification,
-- system settings and provider-delivery observability without changing existing data semantics.

BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS failed_login_count INTEGER NOT NULL DEFAULT 0 CHECK (failed_login_count >= 0),
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS ix_users_locked_until
  ON users(locked_until)
  WHERE locked_until IS NOT NULL;

CREATE TABLE IF NOT EXISTS login_events (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  email           CITEXT NOT NULL,
  event_type      VARCHAR(40) NOT NULL CHECK (event_type IN ('success','failure','locked','logout')),
  ip_hash         VARCHAR(255) NOT NULL,
  user_agent      TEXT NOT NULL DEFAULT '',
  request_id      VARCHAR(120) NOT NULL,
  metadata_json   JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT login_events_email_not_blank_chk CHECK (btrim(email::text) <> ''),
  CONSTRAINT login_events_ip_hash_not_blank_chk CHECK (btrim(ip_hash) <> ''),
  CONSTRAINT login_events_request_id_not_blank_chk CHECK (btrim(request_id) <> '')
);

CREATE INDEX IF NOT EXISTS ix_login_events_email_created_at ON login_events(email, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_login_events_user_created_at ON login_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_login_events_type_created_at ON login_events(event_type, created_at DESC);

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS business_domain_code VARCHAR(40) NULL,
  ADD COLUMN IF NOT EXISTS cybertron_module_code VARCHAR(40) NULL;

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS business_domain_code VARCHAR(40) NULL,
  ADD COLUMN IF NOT EXISTS cybertron_module_code VARCHAR(40) NULL;

ALTER TABLE wbs_templates
  ADD COLUMN IF NOT EXISTS business_domain_code VARCHAR(40) NULL,
  ADD COLUMN IF NOT EXISTS cybertron_module_code VARCHAR(40) NULL;

ALTER TABLE approval_documents
  ADD COLUMN IF NOT EXISTS business_domain_code VARCHAR(40) NULL;

ALTER TABLE evaluation_items
  ADD COLUMN IF NOT EXISTS business_domain_code VARCHAR(40) NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_business_domain_code_chk') THEN
    ALTER TABLE services ADD CONSTRAINT services_business_domain_code_chk
      CHECK (business_domain_code IS NULL OR business_domain_code IN ('ai','materials','energy','defense','welfare'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_cybertron_module_code_chk') THEN
    ALTER TABLE services ADD CONSTRAINT services_cybertron_module_code_chk
      CHECK (cybertron_module_code IS NULL OR cybertron_module_code IN ('brain','frame','heart','shield','senses'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_business_domain_code_chk') THEN
    ALTER TABLE projects ADD CONSTRAINT projects_business_domain_code_chk
      CHECK (business_domain_code IS NULL OR business_domain_code IN ('ai','materials','energy','defense','welfare'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_cybertron_module_code_chk') THEN
    ALTER TABLE projects ADD CONSTRAINT projects_cybertron_module_code_chk
      CHECK (cybertron_module_code IS NULL OR cybertron_module_code IN ('brain','frame','heart','shield','senses'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wbs_templates_business_domain_code_chk') THEN
    ALTER TABLE wbs_templates ADD CONSTRAINT wbs_templates_business_domain_code_chk
      CHECK (business_domain_code IS NULL OR business_domain_code IN ('ai','materials','energy','defense','welfare'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wbs_templates_cybertron_module_code_chk') THEN
    ALTER TABLE wbs_templates ADD CONSTRAINT wbs_templates_cybertron_module_code_chk
      CHECK (cybertron_module_code IS NULL OR cybertron_module_code IN ('brain','frame','heart','shield','senses'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'approval_documents_business_domain_code_chk') THEN
    ALTER TABLE approval_documents ADD CONSTRAINT approval_documents_business_domain_code_chk
      CHECK (business_domain_code IS NULL OR business_domain_code IN ('ai','materials','energy','defense','welfare'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'evaluation_items_business_domain_code_chk') THEN
    ALTER TABLE evaluation_items ADD CONSTRAINT evaluation_items_business_domain_code_chk
      CHECK (business_domain_code IS NULL OR business_domain_code IN ('ai','materials','energy','defense','welfare'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS ix_services_business_domain ON services(business_domain_code, status);
CREATE INDEX IF NOT EXISTS ix_projects_business_domain ON projects(business_domain_code, status);
CREATE INDEX IF NOT EXISTS ix_wbs_templates_business_domain ON wbs_templates(business_domain_code, is_active);
CREATE INDEX IF NOT EXISTS ix_approval_documents_business_domain ON approval_documents(business_domain_code, status);
CREATE INDEX IF NOT EXISTS ix_evaluation_items_business_domain ON evaluation_items(business_domain_code, cycle_id);

-- Align the production news taxonomy with the current official-site information architecture.
-- Legacy press/disclosure/notice values remain valid for backward compatibility.
ALTER TABLE news_posts DROP CONSTRAINT IF EXISTS news_posts_category_check;
ALTER TABLE news_posts
  ADD CONSTRAINT news_posts_category_check
  CHECK (category IN ('press','disclosure','notice','company_news','ir','careers','resources'));

CREATE TABLE IF NOT EXISTS system_settings (
  setting_key       VARCHAR(160) PRIMARY KEY,
  setting_value     JSONB NOT NULL DEFAULT '{}'::JSONB,
  description       TEXT NOT NULL DEFAULT '',
  is_secret_ref     BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by        BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT system_settings_key_not_blank_chk CHECK (btrim(setting_key) <> '')
);

DROP TRIGGER IF EXISTS trg_system_settings_set_updated_at ON system_settings;
CREATE TRIGGER trg_system_settings_set_updated_at
BEFORE UPDATE ON system_settings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

INSERT INTO system_settings(setting_key, setting_value, description)
VALUES
  ('public.canonical_host', '"www.jinbizman.com"'::jsonb, '공식 canonical host'),
  ('public.default_locale', '"ko"'::jsonb, '기본 공개 언어'),
  ('public.supported_locales', '["ko","en","ja","fr","es"]'::jsonb, '공식 지원 언어'),
  ('auth.max_failed_logins', '5'::jsonb, '계정 잠금 전 연속 로그인 실패 횟수'),
  ('auth.lock_minutes', '15'::jsonb, '계정 잠금 유지 시간')
ON CONFLICT (setting_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS email_delivery_logs (
  id                BIGSERIAL PRIMARY KEY,
  message_type      VARCHAR(80) NOT NULL,
  provider          VARCHAR(80) NOT NULL DEFAULT 'resend',
  provider_id       VARCHAR(255) NOT NULL DEFAULT '',
  related_type      VARCHAR(80) NOT NULL DEFAULT '',
  related_id        BIGINT NULL,
  recipient         CITEXT NOT NULL,
  status            VARCHAR(40) NOT NULL CHECK (status IN ('queued','sent','skipped','failed')),
  error_message     TEXT NOT NULL DEFAULT '',
  request_id        VARCHAR(120) NOT NULL,
  metadata_json     JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT email_delivery_logs_type_not_blank_chk CHECK (btrim(message_type) <> ''),
  CONSTRAINT email_delivery_logs_recipient_not_blank_chk CHECK (btrim(recipient::text) <> ''),
  CONSTRAINT email_delivery_logs_request_id_not_blank_chk CHECK (btrim(request_id) <> '')
);

CREATE INDEX IF NOT EXISTS ix_email_delivery_related ON email_delivery_logs(related_type, related_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_email_delivery_status ON email_delivery_logs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_email_delivery_request ON email_delivery_logs(request_id);

DROP TRIGGER IF EXISTS trg_email_delivery_logs_set_updated_at ON email_delivery_logs;
CREATE TRIGGER trg_email_delivery_logs_set_updated_at
BEFORE UPDATE ON email_delivery_logs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

COMMIT;
