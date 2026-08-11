-- 008_domains_locales.sql
-- Scope:
--   - service_domains
--   - service_translations
--   - news_post_translations
--
-- Notes:
--   - Assumes 002_service_hub.sql and 003_public_content.sql have already run.
--   - Official locales:
--       ko / en / ja / fr / es
--   - Translation status standard:
--       draft / in_translation / review / published / hidden
--   - Non-default locale cannot be published unless default locale is already published.
--   - Canonical domain is managed per service with a single canonical row allowed.

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
-- service_domains
-- canonical 도메인 / locale 매핑
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_domains (
  id                  BIGSERIAL PRIMARY KEY,
  service_id          BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  domain              VARCHAR(255) NOT NULL,
  locale              VARCHAR(10) NOT NULL
                        CHECK (locale IN ('ko', 'en', 'ja', 'fr', 'es')),
  is_canonical        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT service_domains_service_locale_uk UNIQUE (service_id, locale),
  CONSTRAINT service_domains_domain_not_blank_chk CHECK (btrim(domain) <> '')
);

CREATE INDEX IF NOT EXISTS ix_service_domains_service_id
  ON service_domains(service_id);

CREATE INDEX IF NOT EXISTS ix_service_domains_locale
  ON service_domains(locale);

CREATE UNIQUE INDEX IF NOT EXISTS ux_service_domains_domain_locale_lower
  ON service_domains(lower(domain), locale);

CREATE UNIQUE INDEX IF NOT EXISTS ux_service_domains_single_canonical_per_service
  ON service_domains(service_id)
  WHERE is_canonical = TRUE;

DROP TRIGGER IF EXISTS trg_service_domains_set_updated_at ON service_domains;
CREATE TRIGGER trg_service_domains_set_updated_at
BEFORE UPDATE ON service_domains
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- service_translations
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_translations (
  id                        BIGSERIAL PRIMARY KEY,
  service_content_item_id   BIGINT NOT NULL REFERENCES service_content_items(id) ON DELETE CASCADE,
  locale                    VARCHAR(10) NOT NULL
                              CHECK (locale IN ('ko', 'en', 'ja', 'fr', 'es')),
  title                     VARCHAR(255) NOT NULL,
  slug                      VARCHAR(255) NOT NULL,
  seo_title                 VARCHAR(255) NOT NULL DEFAULT '',
  seo_description           TEXT NOT NULL DEFAULT '',
  payload_json              JSONB NOT NULL DEFAULT '{}'::JSONB,
  status                    VARCHAR(40) NOT NULL DEFAULT 'draft'
                              CHECK (status IN ('draft', 'in_translation', 'review', 'published', 'hidden')),
  published_at              TIMESTAMPTZ NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT service_translations_item_locale_uk
    UNIQUE (service_content_item_id, locale),
  CONSTRAINT service_translations_title_not_blank_chk CHECK (btrim(title) <> ''),
  CONSTRAINT service_translations_slug_not_blank_chk CHECK (btrim(slug) <> ''),
  CONSTRAINT service_translations_published_status_chk CHECK (
    status <> 'published' OR published_at IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS ix_service_translations_service_content_item_id
  ON service_translations(service_content_item_id);

CREATE INDEX IF NOT EXISTS ix_service_translations_status
  ON service_translations(status);

CREATE INDEX IF NOT EXISTS ix_service_translations_published_at
  ON service_translations(published_at DESC);

CREATE INDEX IF NOT EXISTS ix_service_translations_locale_status
  ON service_translations(locale, status);

CREATE UNIQUE INDEX IF NOT EXISTS ux_service_translations_slug_locale_lower
  ON service_translations(lower(slug), locale);

DROP TRIGGER IF EXISTS trg_service_translations_set_updated_at ON service_translations;
CREATE TRIGGER trg_service_translations_set_updated_at
BEFORE UPDATE ON service_translations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- news_post_translations
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS news_post_translations (
  id                  BIGSERIAL PRIMARY KEY,
  news_post_id        BIGINT NOT NULL REFERENCES news_posts(id) ON DELETE CASCADE,
  locale              VARCHAR(10) NOT NULL
                        CHECK (locale IN ('ko', 'en', 'ja', 'fr', 'es')),
  title               VARCHAR(255) NOT NULL,
  summary             TEXT NOT NULL DEFAULT '',
  body                TEXT NOT NULL DEFAULT '',
  slug                VARCHAR(255) NOT NULL,
  seo_title           VARCHAR(255) NOT NULL DEFAULT '',
  seo_description     TEXT NOT NULL DEFAULT '',
  status              VARCHAR(40) NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'in_translation', 'review', 'published', 'hidden')),
  published_at        TIMESTAMPTZ NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT news_post_translations_post_locale_uk
    UNIQUE (news_post_id, locale),
  CONSTRAINT news_post_translations_title_not_blank_chk CHECK (btrim(title) <> ''),
  CONSTRAINT news_post_translations_slug_not_blank_chk CHECK (btrim(slug) <> ''),
  CONSTRAINT news_post_translations_published_status_chk CHECK (
    status <> 'published' OR published_at IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS ix_news_post_translations_news_post_id
  ON news_post_translations(news_post_id);

CREATE INDEX IF NOT EXISTS ix_news_post_translations_status
  ON news_post_translations(status);

CREATE INDEX IF NOT EXISTS ix_news_post_translations_published_at
  ON news_post_translations(published_at DESC);

CREATE INDEX IF NOT EXISTS ix_news_post_translations_locale_status
  ON news_post_translations(locale, status);

CREATE UNIQUE INDEX IF NOT EXISTS ux_news_post_translations_slug_locale_lower
  ON news_post_translations(lower(slug), locale);

DROP TRIGGER IF EXISTS trg_news_post_translations_set_updated_at ON news_post_translations;
CREATE TRIGGER trg_news_post_translations_set_updated_at
BEFORE UPDATE ON news_post_translations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- Validation 1:
-- service_domains.locale must be supported by the target service
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_service_domain_locale_supported()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  v_supported_locales VARCHAR(10)[];
BEGIN
  SELECT supported_locales
    INTO v_supported_locales
  FROM services
  WHERE id = NEW.service_id;

  IF v_supported_locales IS NULL OR NOT (NEW.locale = ANY(v_supported_locales)) THEN
    RAISE EXCEPTION 'service_domains.locale must exist in services.supported_locales';
  END IF;

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_validate_service_domain_locale_supported ON service_domains;
CREATE TRIGGER trg_validate_service_domain_locale_supported
BEFORE INSERT OR UPDATE ON service_domains
FOR EACH ROW
EXECUTE FUNCTION validate_service_domain_locale_supported();

-- ------------------------------------------------------------
-- Validation 2:
-- canonical domain row must use the service default_locale
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_service_domain_canonical_locale()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  v_default_locale VARCHAR(10);
BEGIN
  IF NEW.is_canonical = FALSE THEN
    RETURN NEW;
  END IF;

  SELECT default_locale
    INTO v_default_locale
  FROM services
  WHERE id = NEW.service_id;

  IF v_default_locale IS NULL OR NEW.locale <> v_default_locale THEN
    RAISE EXCEPTION 'service_domains canonical row must use services.default_locale';
  END IF;

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_validate_service_domain_canonical_locale ON service_domains;
CREATE TRIGGER trg_validate_service_domain_canonical_locale
BEFORE INSERT OR UPDATE ON service_domains
FOR EACH ROW
EXECUTE FUNCTION validate_service_domain_canonical_locale();

-- ------------------------------------------------------------
-- Validation 3:
-- service_translations.locale must be supported by the parent service
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_service_translation_locale_supported()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  v_supported_locales VARCHAR(10)[];
BEGIN
  SELECT s.supported_locales
    INTO v_supported_locales
  FROM service_content_items sci
  JOIN services s
    ON s.id = sci.service_id
  WHERE sci.id = NEW.service_content_item_id;

  IF v_supported_locales IS NULL OR NOT (NEW.locale = ANY(v_supported_locales)) THEN
    RAISE EXCEPTION 'service_translations.locale must exist in services.supported_locales';
  END IF;

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_validate_service_translation_locale_supported ON service_translations;
CREATE TRIGGER trg_validate_service_translation_locale_supported
BEFORE INSERT OR UPDATE ON service_translations
FOR EACH ROW
EXECUTE FUNCTION validate_service_translation_locale_supported();

-- ------------------------------------------------------------
-- Validation 4:
-- non-default service translation cannot be published before default locale is published
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_service_translation_publish_order()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  v_default_locale VARCHAR(10);
  v_default_published_exists BOOLEAN;
BEGIN
  SELECT s.default_locale
    INTO v_default_locale
  FROM service_content_items sci
  JOIN services s
    ON s.id = sci.service_id
  WHERE sci.id = NEW.service_content_item_id;

  IF NEW.status = 'published' AND NEW.locale <> v_default_locale THEN
    SELECT EXISTS (
      SELECT 1
      FROM service_translations st
      WHERE st.service_content_item_id = NEW.service_content_item_id
        AND st.locale = v_default_locale
        AND st.status = 'published'
        AND (TG_OP = 'INSERT' OR st.id <> NEW.id)
    )
    INTO v_default_published_exists;

    IF NOT v_default_published_exists THEN
      RAISE EXCEPTION 'default locale must be published before publishing a non-default service translation';
    END IF;
  END IF;

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_validate_service_translation_publish_order ON service_translations;
CREATE TRIGGER trg_validate_service_translation_publish_order
BEFORE INSERT OR UPDATE ON service_translations
FOR EACH ROW
EXECUTE FUNCTION validate_service_translation_publish_order();

-- ------------------------------------------------------------
-- Validation 5:
-- news_post_translations publish order
--   - if news_posts.service_id exists, use that service default_locale/supported_locales
--   - otherwise fall back to ko as default public locale
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_news_translation_locale_and_publish_order()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  v_service_id BIGINT;
  v_default_locale VARCHAR(10);
  v_supported_locales VARCHAR(10)[];
  v_default_published_exists BOOLEAN;
BEGIN
  SELECT service_id
    INTO v_service_id
  FROM news_posts
  WHERE id = NEW.news_post_id;

  IF v_service_id IS NOT NULL THEN
    SELECT default_locale, supported_locales
      INTO v_default_locale, v_supported_locales
    FROM services
    WHERE id = v_service_id;

    IF v_supported_locales IS NULL OR NOT (NEW.locale = ANY(v_supported_locales)) THEN
      RAISE EXCEPTION 'news_post_translations.locale must exist in services.supported_locales';
    END IF;
  ELSE
    v_default_locale := 'ko';
    v_supported_locales := ARRAY['ko','en','ja','fr','es']::VARCHAR(10)[];
  END IF;

  IF NEW.status = 'published' AND NEW.locale <> v_default_locale THEN
    SELECT EXISTS (
      SELECT 1
      FROM news_post_translations npt
      WHERE npt.news_post_id = NEW.news_post_id
        AND npt.locale = v_default_locale
        AND npt.status = 'published'
        AND (TG_OP = 'INSERT' OR npt.id <> NEW.id)
    )
    INTO v_default_published_exists;

    IF NOT v_default_published_exists THEN
      RAISE EXCEPTION 'default locale must be published before publishing a non-default news translation';
    END IF;
  END IF;

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_validate_news_translation_locale_and_publish_order ON news_post_translations;
CREATE TRIGGER trg_validate_news_translation_locale_and_publish_order
BEFORE INSERT OR UPDATE ON news_post_translations
FOR EACH ROW
EXECUTE FUNCTION validate_news_translation_locale_and_publish_order();

COMMIT;