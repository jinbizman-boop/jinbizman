-- 002_service_hub.sql
-- Scope:
--   - services
--   - service_environments
--   - service_connections
--   - service_content_types
--   - service_content_items
--   - service_change_logs
--
-- Notes:
--   - Assumes 001_core_org_auth.sql has already run.
--   - service_domains / service_translations are intentionally handled in 008_domains_locales.sql.
--   - system_settings is intentionally excluded from this file and should be handled separately.

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
-- services
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id                        BIGSERIAL PRIMARY KEY,
  service_code              VARCHAR(120) NOT NULL,
  service_name              VARCHAR(255) NOT NULL,
  service_type              VARCHAR(80) NOT NULL,
  brand_name                VARCHAR(255) NOT NULL DEFAULT '',
  status                    VARCHAR(40) NOT NULL DEFAULT 'draft'
                              CHECK (status IN ('draft', 'active', 'maintenance', 'retired')),

  -- legacy/main entry fields kept for structural continuity
  domain                    VARCHAR(255) NOT NULL,
  env_type                  VARCHAR(40) NOT NULL DEFAULT 'production'
                              CHECK (env_type IN ('local', 'staging', 'production')),
  owner_department          VARCHAR(120) NOT NULL DEFAULT '',

  -- service registry / operating policy
  default_locale            VARCHAR(10) NOT NULL DEFAULT 'ko'
                              CHECK (default_locale IN ('ko', 'en', 'ja', 'fr', 'es')),
  supported_locales         VARCHAR(10)[] NOT NULL DEFAULT ARRAY['ko']::VARCHAR(10)[],
  i18n_enabled              BOOLEAN NOT NULL DEFAULT TRUE,
  permission_template_code  VARCHAR(120) NOT NULL DEFAULT '',
  content_model_code        VARCHAR(120) NOT NULL DEFAULT '',
  deploy_type               VARCHAR(80) NOT NULL DEFAULT 'worker',
  notify_type               VARCHAR(80) NOT NULL DEFAULT 'email',
  seo_enabled               BOOLEAN NOT NULL DEFAULT TRUE,
  shared_asset_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  is_visible_in_admin       BOOLEAN NOT NULL DEFAULT TRUE,

  -- ownership / operators
  owner_department_id       BIGINT NULL REFERENCES departments(id) ON DELETE SET NULL,
  operator_user_id          BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  tech_owner_user_id        BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,

  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT services_service_code_uk UNIQUE (service_code),
  CONSTRAINT services_service_code_not_blank_chk CHECK (btrim(service_code) <> ''),
  CONSTRAINT services_service_name_not_blank_chk CHECK (btrim(service_name) <> ''),
  CONSTRAINT services_service_type_not_blank_chk CHECK (btrim(service_type) <> ''),
  CONSTRAINT services_domain_not_blank_chk CHECK (btrim(domain) <> ''),
  CONSTRAINT services_supported_locales_nonempty_chk CHECK (cardinality(supported_locales) >= 1),
  CONSTRAINT services_supported_locales_allowed_chk CHECK (
    supported_locales <@ ARRAY['ko','en','ja','fr','es']::VARCHAR(10)[]
  ),
  CONSTRAINT services_default_locale_in_supported_chk CHECK (
    default_locale = ANY(supported_locales)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_services_service_code_lower
  ON services(lower(service_code));

CREATE INDEX IF NOT EXISTS ix_services_status
  ON services(status);

CREATE INDEX IF NOT EXISTS ix_services_service_type
  ON services(service_type);

CREATE INDEX IF NOT EXISTS ix_services_owner_department_id
  ON services(owner_department_id);

CREATE INDEX IF NOT EXISTS ix_services_operator_user_id
  ON services(operator_user_id);

CREATE INDEX IF NOT EXISTS ix_services_tech_owner_user_id
  ON services(tech_owner_user_id);

CREATE INDEX IF NOT EXISTS ix_services_type_status
  ON services(service_type, status);

CREATE INDEX IF NOT EXISTS ix_services_visible_status
  ON services(is_visible_in_admin, status);

DROP TRIGGER IF EXISTS trg_services_set_updated_at ON services;
CREATE TRIGGER trg_services_set_updated_at
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- service_environments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_environments (
  id                        BIGSERIAL PRIMARY KEY,
  service_id                BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  env_type                  VARCHAR(40) NOT NULL
                              CHECK (env_type IN ('local', 'staging', 'production')),
  base_url                  VARCHAR(255) NOT NULL DEFAULT '',
  admin_url                 VARCHAR(255) NOT NULL DEFAULT '',
  api_base_url              VARCHAR(255) NOT NULL DEFAULT '',
  webhook_base_url          VARCHAR(255) NOT NULL DEFAULT '',
  branch_name               VARCHAR(120) NOT NULL DEFAULT '',
  deployment_provider       VARCHAR(80) NOT NULL DEFAULT 'cloudflare',
  deployment_config_json    JSONB NOT NULL DEFAULT '{}'::JSONB,
  is_primary                BOOLEAN NOT NULL DEFAULT FALSE,
  is_active                 BOOLEAN NOT NULL DEFAULT TRUE,
  last_deployed_at          TIMESTAMPTZ NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT service_environments_service_env_uk UNIQUE (service_id, env_type)
);

CREATE INDEX IF NOT EXISTS ix_service_environments_service_id
  ON service_environments(service_id);

CREATE INDEX IF NOT EXISTS ix_service_environments_env_type
  ON service_environments(env_type);

CREATE INDEX IF NOT EXISTS ix_service_environments_is_active
  ON service_environments(is_active);

CREATE UNIQUE INDEX IF NOT EXISTS ux_service_environments_primary
  ON service_environments(service_id)
  WHERE is_primary = TRUE;

DROP TRIGGER IF EXISTS trg_service_environments_set_updated_at ON service_environments;
CREATE TRIGGER trg_service_environments_set_updated_at
BEFORE UPDATE ON service_environments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- service_connections
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_connections (
  id                        BIGSERIAL PRIMARY KEY,
  service_id                BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  connection_code           VARCHAR(120) NOT NULL,
  connection_type           VARCHAR(80) NOT NULL,
  provider_code             VARCHAR(120) NOT NULL DEFAULT '',
  target_name               VARCHAR(255) NOT NULL DEFAULT '',
  target_identifier         VARCHAR(255) NOT NULL DEFAULT '',
  connection_status         VARCHAR(40) NOT NULL DEFAULT 'active'
                              CHECK (connection_status IN ('active', 'inactive', 'error')),
  config_json               JSONB NOT NULL DEFAULT '{}'::JSONB,
  secret_ref                VARCHAR(255) NOT NULL DEFAULT '',
  last_checked_at           TIMESTAMPTZ NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT service_connections_service_code_uk UNIQUE (service_id, connection_code),
  CONSTRAINT service_connections_code_not_blank_chk CHECK (btrim(connection_code) <> ''),
  CONSTRAINT service_connections_type_not_blank_chk CHECK (btrim(connection_type) <> '')
);

CREATE INDEX IF NOT EXISTS ix_service_connections_service_id
  ON service_connections(service_id);

CREATE INDEX IF NOT EXISTS ix_service_connections_type_status
  ON service_connections(connection_type, connection_status);

CREATE INDEX IF NOT EXISTS ix_service_connections_status
  ON service_connections(connection_status);

CREATE UNIQUE INDEX IF NOT EXISTS ux_service_connections_code_lower
  ON service_connections(service_id, lower(connection_code));

DROP TRIGGER IF EXISTS trg_service_connections_set_updated_at ON service_connections;
CREATE TRIGGER trg_service_connections_set_updated_at
BEFORE UPDATE ON service_connections
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- service_content_types
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_content_types (
  id                        BIGSERIAL PRIMARY KEY,
  service_id                BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  type_code                 VARCHAR(120) NOT NULL,
  name                      VARCHAR(255) NOT NULL,
  category                  VARCHAR(80) NOT NULL DEFAULT 'content',
  sort_order                INTEGER NOT NULL DEFAULT 0,
  schema_json               JSONB NOT NULL DEFAULT '{}'::JSONB,
  is_active                 BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT service_content_types_service_type_uk UNIQUE (service_id, type_code),
  CONSTRAINT service_content_types_type_code_not_blank_chk CHECK (btrim(type_code) <> ''),
  CONSTRAINT service_content_types_name_not_blank_chk CHECK (btrim(name) <> ''),
  CONSTRAINT service_content_types_sort_order_nonnegative_chk CHECK (sort_order >= 0)
);

CREATE INDEX IF NOT EXISTS ix_service_content_types_service_id
  ON service_content_types(service_id);

CREATE INDEX IF NOT EXISTS ix_service_content_types_category
  ON service_content_types(category);

CREATE INDEX IF NOT EXISTS ix_service_content_types_is_active
  ON service_content_types(is_active);

CREATE UNIQUE INDEX IF NOT EXISTS ux_service_content_types_type_code_lower
  ON service_content_types(service_id, lower(type_code));

DROP TRIGGER IF EXISTS trg_service_content_types_set_updated_at ON service_content_types;
CREATE TRIGGER trg_service_content_types_set_updated_at
BEFORE UPDATE ON service_content_types
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- service_content_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_content_items (
  id                        BIGSERIAL PRIMARY KEY,
  service_id                BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  content_type_id           BIGINT NOT NULL REFERENCES service_content_types(id) ON DELETE CASCADE,
  parent_item_id            BIGINT NULL REFERENCES service_content_items(id) ON DELETE CASCADE,
  title                     VARCHAR(255) NOT NULL,
  slug                      VARCHAR(255) NOT NULL,
  status                    VARCHAR(40) NOT NULL DEFAULT 'draft'
                              CHECK (status IN ('draft', 'review', 'published', 'archived')),
  sort_order                INTEGER NOT NULL DEFAULT 0,
  is_system                 BOOLEAN NOT NULL DEFAULT FALSE,
  payload_json              JSONB NOT NULL DEFAULT '{}'::JSONB,
  published_at              TIMESTAMPTZ NULL,
  created_by                BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  updated_by                BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT service_content_items_service_content_slug_uk
    UNIQUE (service_id, content_type_id, slug),
  CONSTRAINT service_content_items_title_not_blank_chk CHECK (btrim(title) <> ''),
  CONSTRAINT service_content_items_slug_not_blank_chk CHECK (btrim(slug) <> ''),
  CONSTRAINT service_content_items_sort_order_nonnegative_chk CHECK (sort_order >= 0),
  CONSTRAINT service_content_items_published_status_chk CHECK (
    status <> 'published' OR published_at IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS ix_service_content_items_service_id
  ON service_content_items(service_id);

CREATE INDEX IF NOT EXISTS ix_service_content_items_content_type_id
  ON service_content_items(content_type_id);

CREATE INDEX IF NOT EXISTS ix_service_content_items_parent_item_id
  ON service_content_items(parent_item_id);

CREATE INDEX IF NOT EXISTS ix_service_content_items_status
  ON service_content_items(status);

CREATE INDEX IF NOT EXISTS ix_service_content_items_published_at
  ON service_content_items(published_at DESC);

CREATE INDEX IF NOT EXISTS ix_service_content_items_service_status
  ON service_content_items(service_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS ux_service_content_items_slug_lower
  ON service_content_items(service_id, content_type_id, lower(slug));

DROP TRIGGER IF EXISTS trg_service_content_items_set_updated_at ON service_content_items;
CREATE TRIGGER trg_service_content_items_set_updated_at
BEFORE UPDATE ON service_content_items
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- service_change_logs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_change_logs (
  id                        BIGSERIAL PRIMARY KEY,
  service_id                BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  action_type               VARCHAR(80) NOT NULL,
  target_type               VARCHAR(80) NOT NULL,
  target_id                 BIGINT NULL,
  before_json               JSONB NOT NULL DEFAULT '{}'::JSONB,
  after_json                JSONB NOT NULL DEFAULT '{}'::JSONB,
  metadata_json             JSONB NOT NULL DEFAULT '{}'::JSONB,
  actor_user_id             BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT service_change_logs_action_type_not_blank_chk CHECK (btrim(action_type) <> ''),
  CONSTRAINT service_change_logs_target_type_not_blank_chk CHECK (btrim(target_type) <> '')
);

CREATE INDEX IF NOT EXISTS ix_service_change_logs_service_id
  ON service_change_logs(service_id);

CREATE INDEX IF NOT EXISTS ix_service_change_logs_actor_user_id
  ON service_change_logs(actor_user_id);

CREATE INDEX IF NOT EXISTS ix_service_change_logs_target
  ON service_change_logs(target_type, target_id);

CREATE INDEX IF NOT EXISTS ix_service_change_logs_created_at
  ON service_change_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS ix_service_change_logs_service_created_at
  ON service_change_logs(service_id, created_at DESC);

COMMIT;