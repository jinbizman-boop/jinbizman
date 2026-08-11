-- 003_public_content.sql
-- Scope:
--   - news_posts
--   - inquiries
--   - leads
--   - opportunities
--
-- Notes:
--   - Assumes 001_core_org_auth.sql and 002_service_hub.sql have already run.
--   - news_post_translations is intentionally handled in 008_domains_locales.sql.
--   - project_id is intentionally left as nullable BIGINT without FK here because projects are created in 004_projects_wbs.sql.
--   - 004_projects_wbs.sql should backfill the project_id foreign keys safely.
--   - Opportunity stage vocabulary is intentionally flexible here.

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
-- news_posts
-- Public news center:
--   - press / disclosure / notice
-- Status standard:
--   - draft / review / published / archived
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS news_posts (
  id                BIGSERIAL PRIMARY KEY,
  category          VARCHAR(40) NOT NULL
                      CHECK (category IN ('press', 'disclosure', 'notice')),
  service_id        BIGINT NULL REFERENCES services(id) ON DELETE SET NULL,
  title             VARCHAR(255) NOT NULL,
  slug              VARCHAR(255) NOT NULL,
  summary           TEXT NOT NULL DEFAULT '',
  body              TEXT NOT NULL DEFAULT '',
  status            VARCHAR(40) NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft', 'review', 'published', 'archived')),
  is_pinned         BOOLEAN NOT NULL DEFAULT FALSE,
  published_at      TIMESTAMPTZ NULL,
  author_user_id    BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_by        BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  updated_by        BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT news_posts_slug_uk UNIQUE (slug),
  CONSTRAINT news_posts_title_not_blank_chk CHECK (btrim(title) <> ''),
  CONSTRAINT news_posts_slug_not_blank_chk CHECK (btrim(slug) <> ''),
  CONSTRAINT news_posts_published_status_chk CHECK (
    status <> 'published' OR published_at IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS ix_news_posts_category
  ON news_posts(category);

CREATE INDEX IF NOT EXISTS ix_news_posts_status
  ON news_posts(status);

CREATE INDEX IF NOT EXISTS ix_news_posts_service_id
  ON news_posts(service_id);

CREATE INDEX IF NOT EXISTS ix_news_posts_author_user_id
  ON news_posts(author_user_id);

CREATE INDEX IF NOT EXISTS ix_news_posts_published_at
  ON news_posts(published_at DESC);

CREATE INDEX IF NOT EXISTS ix_news_posts_category_status_published_at
  ON news_posts(category, status, published_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS ux_news_posts_slug_lower
  ON news_posts(lower(slug));

DROP TRIGGER IF EXISTS trg_news_posts_set_updated_at ON news_posts;
CREATE TRIGGER trg_news_posts_set_updated_at
BEFORE UPDATE ON news_posts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- inquiries
-- Purpose:
--   - external inquiry intake
--   - save + admin processing
--   - convert to lead
-- Status standard:
--   - new / in_progress / resolved / converted
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inquiries (
  id                  BIGSERIAL PRIMARY KEY,
  inquiry_type        VARCHAR(80) NOT NULL,
  company_name        VARCHAR(255) NOT NULL DEFAULT '',
  name                VARCHAR(120) NOT NULL,
  email               CITEXT NOT NULL,
  phone               VARCHAR(50) NOT NULL DEFAULT '',
  message             TEXT NOT NULL,
  locale              VARCHAR(10) NOT NULL DEFAULT 'ko'
                        CHECK (locale IN ('ko', 'en', 'ja', 'fr', 'es')),
  status              VARCHAR(40) NOT NULL DEFAULT 'new'
                        CHECK (status IN ('new', 'in_progress', 'resolved', 'converted')),
  assigned_user_id    BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  lead_status         VARCHAR(40) NOT NULL DEFAULT 'new'
                        CHECK (lead_status IN ('new', 'qualified', 'proposal', 'won', 'lost')),
  project_id          BIGINT NULL,
  source_channel      VARCHAR(80) NOT NULL DEFAULT 'website',
  internal_note       TEXT NOT NULL DEFAULT '',
  converted_at        TIMESTAMPTZ NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT inquiries_inquiry_type_not_blank_chk CHECK (btrim(inquiry_type) <> ''),
  CONSTRAINT inquiries_name_not_blank_chk CHECK (btrim(name) <> ''),
  CONSTRAINT inquiries_email_not_blank_chk CHECK (btrim(email::text) <> ''),
  CONSTRAINT inquiries_message_not_blank_chk CHECK (btrim(message) <> ''),
  CONSTRAINT inquiries_converted_status_chk CHECK (
    status <> 'converted' OR converted_at IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS ix_inquiries_status
  ON inquiries(status);

CREATE INDEX IF NOT EXISTS ix_inquiries_assigned_user_id
  ON inquiries(assigned_user_id);

CREATE INDEX IF NOT EXISTS ix_inquiries_locale
  ON inquiries(locale);

CREATE INDEX IF NOT EXISTS ix_inquiries_created_at
  ON inquiries(created_at DESC);

CREATE INDEX IF NOT EXISTS ix_inquiries_email
  ON inquiries(email);

CREATE INDEX IF NOT EXISTS ix_inquiries_company_name
  ON inquiries(company_name);

CREATE INDEX IF NOT EXISTS ix_inquiries_project_id
  ON inquiries(project_id);

CREATE INDEX IF NOT EXISTS ix_inquiries_status_assigned_user_id
  ON inquiries(status, assigned_user_id);

DROP TRIGGER IF EXISTS trg_inquiries_set_updated_at ON inquiries;
CREATE TRIGGER trg_inquiries_set_updated_at
BEFORE UPDATE ON inquiries
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- leads
-- Purpose:
--   - CRM-style pipeline created from inquiries or direct admin intake
-- Status standard:
--   - new / qualified / proposal / won / lost
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id                    BIGSERIAL PRIMARY KEY,
  inquiry_id            BIGINT NULL REFERENCES inquiries(id) ON DELETE SET NULL,
  service_id            BIGINT NULL REFERENCES services(id) ON DELETE SET NULL,
  owner_user_id         BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  company_name          VARCHAR(255) NOT NULL DEFAULT '',
  contact_name          VARCHAR(120) NOT NULL,
  email                 CITEXT NOT NULL,
  phone                 VARCHAR(50) NOT NULL DEFAULT '',
  source_channel        VARCHAR(80) NOT NULL DEFAULT 'website',
  lead_type             VARCHAR(80) NOT NULL DEFAULT 'general',
  status                VARCHAR(40) NOT NULL DEFAULT 'new'
                          CHECK (status IN ('new', 'qualified', 'proposal', 'won', 'lost')),
  score                 INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  notes                 TEXT NOT NULL DEFAULT '',
  converted_to_project  BOOLEAN NOT NULL DEFAULT FALSE,
  converted_at          TIMESTAMPTZ NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT leads_contact_name_not_blank_chk CHECK (btrim(contact_name) <> ''),
  CONSTRAINT leads_email_not_blank_chk CHECK (btrim(email::text) <> ''),
  CONSTRAINT leads_converted_status_chk CHECK (
    converted_to_project = FALSE OR converted_at IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS ix_leads_status
  ON leads(status);

CREATE INDEX IF NOT EXISTS ix_leads_inquiry_id
  ON leads(inquiry_id);

CREATE INDEX IF NOT EXISTS ix_leads_service_id
  ON leads(service_id);

CREATE INDEX IF NOT EXISTS ix_leads_owner_user_id
  ON leads(owner_user_id);

CREATE INDEX IF NOT EXISTS ix_leads_created_at
  ON leads(created_at DESC);

CREATE INDEX IF NOT EXISTS ix_leads_email
  ON leads(email);

CREATE INDEX IF NOT EXISTS ix_leads_status_owner_user_id
  ON leads(status, owner_user_id);

DROP TRIGGER IF EXISTS trg_leads_set_updated_at ON leads;
CREATE TRIGGER trg_leads_set_updated_at
BEFORE UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- opportunities
-- Purpose:
--   - downstream business opportunity tracked from a lead
-- Note:
--   - stage vocabulary is intentionally flexible here.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS opportunities (
  id                    BIGSERIAL PRIMARY KEY,
  lead_id               BIGINT NULL REFERENCES leads(id) ON DELETE SET NULL,
  service_id            BIGINT NULL REFERENCES services(id) ON DELETE SET NULL,
  owner_user_id         BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  title                 VARCHAR(255) NOT NULL,
  stage                 VARCHAR(80) NOT NULL DEFAULT 'open',
  expected_value        NUMERIC(14, 2) NOT NULL DEFAULT 0
                          CHECK (expected_value >= 0),
  currency_code         VARCHAR(10) NOT NULL DEFAULT 'KRW',
  expected_close_date   DATE NULL,
  project_id            BIGINT NULL,
  notes                 TEXT NOT NULL DEFAULT '',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT opportunities_title_not_blank_chk CHECK (btrim(title) <> ''),
  CONSTRAINT opportunities_stage_not_blank_chk CHECK (btrim(stage) <> ''),
  CONSTRAINT opportunities_currency_code_not_blank_chk CHECK (btrim(currency_code) <> '')
);

CREATE INDEX IF NOT EXISTS ix_opportunities_lead_id
  ON opportunities(lead_id);

CREATE INDEX IF NOT EXISTS ix_opportunities_service_id
  ON opportunities(service_id);

CREATE INDEX IF NOT EXISTS ix_opportunities_owner_user_id
  ON opportunities(owner_user_id);

CREATE INDEX IF NOT EXISTS ix_opportunities_stage
  ON opportunities(stage);

CREATE INDEX IF NOT EXISTS ix_opportunities_expected_close_date
  ON opportunities(expected_close_date);

CREATE INDEX IF NOT EXISTS ix_opportunities_project_id
  ON opportunities(project_id);

CREATE INDEX IF NOT EXISTS ix_opportunities_stage_owner_user_id
  ON opportunities(stage, owner_user_id);

DROP TRIGGER IF EXISTS trg_opportunities_set_updated_at ON opportunities;
CREATE TRIGGER trg_opportunities_set_updated_at
BEFORE UPDATE ON opportunities
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

COMMIT;