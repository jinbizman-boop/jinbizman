-- 013_remaining_admin_operations.sql
-- Closes the remaining visible ERP administration modules with real persisted data.
BEGIN;

CREATE TABLE IF NOT EXISTS common_code_groups (
  id BIGSERIAL PRIMARY KEY,
  group_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT common_code_groups_code_not_blank CHECK (btrim(group_code) <> ''),
  CONSTRAINT common_code_groups_name_not_blank CHECK (btrim(name) <> '')
);

CREATE TABLE IF NOT EXISTS common_codes (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT NOT NULL REFERENCES common_code_groups(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, code),
  CONSTRAINT common_codes_code_not_blank CHECK (btrim(code) <> ''),
  CONSTRAINT common_codes_label_not_blank CHECK (btrim(label) <> '')
);

CREATE TABLE IF NOT EXISTS approval_templates (
  id BIGSERIAL PRIMARY KEY,
  template_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  requires_project BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS approval_template_steps (
  id BIGSERIAL PRIMARY KEY,
  template_id BIGINT NOT NULL REFERENCES approval_templates(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL CHECK (step_order > 0),
  approver_role_code TEXT NULL,
  approver_user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL DEFAULT 'approve',
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (template_id, step_order),
  CONSTRAINT approval_template_step_actor CHECK (approver_role_code IS NOT NULL OR approver_user_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS project_meetings (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  meeting_at TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  meeting_url TEXT NOT NULL DEFAULT '',
  minutes TEXT NOT NULL DEFAULT '',
  created_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT project_meetings_title_not_blank CHECK (btrim(title) <> '')
);

CREATE TABLE IF NOT EXISTS meeting_action_items (
  id BIGSERIAL PRIMARY KEY,
  meeting_id BIGINT NOT NULL REFERENCES project_meetings(id) ON DELETE CASCADE,
  assignee_user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  wbs_task_id BIGINT NULL REFERENCES wbs_tasks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  due_date DATE NULL,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_deployments (
  id BIGSERIAL PRIMARY KEY,
  service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  environment TEXT NOT NULL CHECK (environment IN ('staging','production')),
  version_label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','approved','deploying','succeeded','failed','rolled_back')),
  source_ref TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  requested_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS site_banners (
  id BIGSERIAL PRIMARY KEY,
  service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  banner_code TEXT NOT NULL,
  locale VARCHAR(10) NOT NULL DEFAULT 'ko' CHECK (locale IN ('ko','en','ja','fr','es')),
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  link_url TEXT NOT NULL DEFAULT '',
  placement TEXT NOT NULL DEFAULT 'global',
  starts_at TIMESTAMPTZ NULL,
  ends_at TIMESTAMPTZ NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (service_id, banner_code, locale)
);

CREATE TABLE IF NOT EXISTS site_navigation_items (
  id BIGSERIAL PRIMARY KEY,
  service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  locale VARCHAR(10) NOT NULL DEFAULT 'ko' CHECK (locale IN ('ko','en','ja','fr','es')),
  parent_id BIGINT NULL REFERENCES site_navigation_items(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_templates (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT NOT NULL DEFAULT '',
  template_body TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_common_codes_group_sort ON common_codes(group_id, sort_order);
CREATE INDEX IF NOT EXISTS ix_project_meetings_project_at ON project_meetings(project_id, meeting_at DESC);
CREATE INDEX IF NOT EXISTS ix_service_deployments_service_requested ON service_deployments(service_id, requested_at DESC);
CREATE INDEX IF NOT EXISTS ix_site_banners_service_active ON site_banners(service_id, is_active);
CREATE INDEX IF NOT EXISTS ix_site_navigation_service_locale_sort ON site_navigation_items(service_id, locale, sort_order);

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['common_code_groups','common_codes','approval_templates','project_meetings','meeting_action_items','site_banners','site_navigation_items','knowledge_templates']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_set_updated_at ON %I', t, t);
    EXECUTE format('CREATE TRIGGER trg_%I_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t);
  END LOOP;
END $$;

COMMIT;
