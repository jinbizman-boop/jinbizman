-- sample-services.sql
-- JINBIZ sample services seed
--
-- Purpose:
--   - seed latest service hub sample data
--   - align strictly with 002_service_hub.sql + 008_domains_locales.sql
--   - remain idempotent and production-safe
--
-- Scope:
--   - services
--   - service_environments
--   - service_connections
--   - service_domains
--   - service_content_types
--   - service_content_items
--   - service_translations

BEGIN;

-- ------------------------------------------------------------
-- 0) references
-- ------------------------------------------------------------
DROP TABLE IF EXISTS _seed_refs;
CREATE TEMP TABLE _seed_refs ON COMMIT DROP AS
SELECT
  (SELECT id FROM departments WHERE code = 'brand-strategy' LIMIT 1) AS dept_brand_id,
  (SELECT id FROM departments WHERE code = 'bizdev' LIMIT 1) AS dept_bizdev_id,
  (SELECT id FROM departments WHERE code = 'ai-data' LIMIT 1) AS dept_ai_id,
  (SELECT id FROM departments WHERE code = 'service-ops' LIMIT 1) AS dept_ops_id,
  (SELECT id FROM users WHERE email = 'admin@jinbizman.com' LIMIT 1) AS admin_user_id,
  COALESCE(
    (SELECT id FROM users WHERE email = 'backend@jinbizman.com' LIMIT 1),
    (SELECT id FROM users WHERE email = 'admin@jinbizman.com' LIMIT 1)
  ) AS backend_user_id;

-- ------------------------------------------------------------
-- 1) services
-- latest schema:
--   services(
--     service_code, service_name, service_type, brand_name, status,
--     domain, env_type, owner_department,
--     default_locale, supported_locales, i18n_enabled,
--     permission_template_code, content_model_code,
--     deploy_type, notify_type, seo_enabled, shared_asset_enabled, is_visible_in_admin,
--     owner_department_id, operator_user_id, tech_owner_user_id
--   )
-- ------------------------------------------------------------
DROP TABLE IF EXISTS _seed_services;
CREATE TEMP TABLE _seed_services (
  service_code TEXT PRIMARY KEY,
  service_name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  status TEXT NOT NULL,
  domain TEXT NOT NULL,
  env_type TEXT NOT NULL,
  owner_department TEXT NOT NULL,
  default_locale VARCHAR(10) NOT NULL,
  supported_locales VARCHAR(10)[] NOT NULL,
  i18n_enabled BOOLEAN NOT NULL,
  permission_template_code TEXT NOT NULL,
  content_model_code TEXT NOT NULL,
  deploy_type TEXT NOT NULL,
  notify_type TEXT NOT NULL,
  seo_enabled BOOLEAN NOT NULL,
  shared_asset_enabled BOOLEAN NOT NULL,
  is_visible_in_admin BOOLEAN NOT NULL,
  owner_department_id BIGINT,
  operator_user_id BIGINT,
  tech_owner_user_id BIGINT
) ON COMMIT DROP;

INSERT INTO _seed_services
SELECT *
FROM (
  SELECT
    'jinbiz-main',
    'JINBIZ Corporate Site',
    'website',
    'JINBIZ',
    'active',
    'www.jinbizman.com',
    'production',
    '브랜드전략팀',
    'ko',
    ARRAY['ko','en','ja','fr','es']::VARCHAR(10)[],
    TRUE,
    'CORP_SITE_DEFAULT',
    'CORP_SITE_PUBLIC',
    'worker',
    'email',
    TRUE,
    TRUE,
    TRUE,
    dept_brand_id,
    admin_user_id,
    backend_user_id
  FROM _seed_refs

  UNION ALL

  SELECT
    'eureka-world',
    'Eureka World',
    'webapp',
    'Eureka World',
    'draft',
    'www.jinbizman.com/eureka-world',
    'staging',
    'AI데이터팀',
    'ko',
    ARRAY['ko','en']::VARCHAR(10)[],
    TRUE,
    'AI_SERVICE_DEFAULT',
    'AI_WORKSPACE_PUBLIC',
    'worker',
    'email',
    TRUE,
    TRUE,
    TRUE,
    dept_ai_id,
    admin_user_id,
    backend_user_id
  FROM _seed_refs

  UNION ALL

  SELECT
    'salary-platform',
    '급여 플랫폼',
    'platform',
    'Salary Platform',
    'draft',
    'salary.jinbizman.com',
    'staging',
    '사업개발팀',
    'ko',
    ARRAY['ko']::VARCHAR(10)[],
    FALSE,
    'PLATFORM_DEFAULT',
    'PLATFORM_PUBLIC',
    'worker',
    'email',
    TRUE,
    TRUE,
    TRUE,
    dept_bizdev_id,
    admin_user_id,
    backend_user_id
  FROM _seed_refs

  UNION ALL

  SELECT
    'strategy-sim',
    '경영 전략 지원 시뮬레이션 플랫폼',
    'platform',
    'Strategy Sim',
    'draft',
    'strategy.jinbizman.com',
    'staging',
    '사업개발팀',
    'ko',
    ARRAY['ko']::VARCHAR(10)[],
    FALSE,
    'PLATFORM_DEFAULT',
    'PLATFORM_PUBLIC',
    'worker',
    'email',
    TRUE,
    TRUE,
    TRUE,
    dept_bizdev_id,
    admin_user_id,
    backend_user_id
  FROM _seed_refs
) seeded;

INSERT INTO services (
  service_code,
  service_name,
  service_type,
  brand_name,
  status,
  domain,
  env_type,
  owner_department,
  default_locale,
  supported_locales,
  i18n_enabled,
  permission_template_code,
  content_model_code,
  deploy_type,
  notify_type,
  seo_enabled,
  shared_asset_enabled,
  is_visible_in_admin,
  owner_department_id,
  operator_user_id,
  tech_owner_user_id
)
SELECT
  service_code,
  service_name,
  service_type,
  brand_name,
  status,
  domain,
  env_type,
  owner_department,
  default_locale,
  supported_locales,
  i18n_enabled,
  permission_template_code,
  content_model_code,
  deploy_type,
  notify_type,
  seo_enabled,
  shared_asset_enabled,
  is_visible_in_admin,
  owner_department_id,
  operator_user_id,
  tech_owner_user_id
FROM _seed_services
ON CONFLICT (service_code) DO UPDATE
SET service_name = EXCLUDED.service_name,
    service_type = EXCLUDED.service_type,
    brand_name = EXCLUDED.brand_name,
    status = EXCLUDED.status,
    domain = EXCLUDED.domain,
    env_type = EXCLUDED.env_type,
    owner_department = EXCLUDED.owner_department,
    default_locale = EXCLUDED.default_locale,
    supported_locales = EXCLUDED.supported_locales,
    i18n_enabled = EXCLUDED.i18n_enabled,
    permission_template_code = EXCLUDED.permission_template_code,
    content_model_code = EXCLUDED.content_model_code,
    deploy_type = EXCLUDED.deploy_type,
    notify_type = EXCLUDED.notify_type,
    seo_enabled = EXCLUDED.seo_enabled,
    shared_asset_enabled = EXCLUDED.shared_asset_enabled,
    is_visible_in_admin = EXCLUDED.is_visible_in_admin,
    owner_department_id = EXCLUDED.owner_department_id,
    operator_user_id = EXCLUDED.operator_user_id,
    tech_owner_user_id = EXCLUDED.tech_owner_user_id,
    updated_at = NOW();

-- ------------------------------------------------------------
-- 2) service_environments
-- ------------------------------------------------------------
DROP TABLE IF EXISTS _seed_service_environments;
CREATE TEMP TABLE _seed_service_environments (
  service_code TEXT NOT NULL,
  env_type TEXT NOT NULL,
  base_url TEXT NOT NULL,
  admin_url TEXT NOT NULL,
  api_base_url TEXT NOT NULL,
  webhook_base_url TEXT NOT NULL,
  branch_name TEXT NOT NULL,
  deployment_provider TEXT NOT NULL,
  deployment_config_json JSONB NOT NULL,
  is_primary BOOLEAN NOT NULL,
  is_active BOOLEAN NOT NULL,
  last_deployed_at TIMESTAMPTZ NULL
) ON COMMIT DROP;

INSERT INTO _seed_service_environments VALUES
  (
    'jinbiz-main',
    'production',
    'https://www.jinbizman.com',
    'https://www.jinbizman.com/admin',
    'https://www.jinbizman.com/api',
    'https://www.jinbizman.com/api/webhooks',
    'main',
    'cloudflare',
    '{"worker":"jinbiz-main","env":"production"}'::jsonb,
    TRUE,
    TRUE,
    TIMESTAMPTZ '2026-03-30 09:00:00+09'
  ),
  (
    'jinbiz-main',
    'staging',
    'https://staging.jinbizman.com',
    'https://staging.jinbizman.com/admin',
    'https://staging.jinbizman.com/api',
    'https://staging.jinbizman.com/api/webhooks',
    'staging',
    'cloudflare',
    '{"worker":"jinbiz-main","env":"staging"}'::jsonb,
    FALSE,
    TRUE,
    TIMESTAMPTZ '2026-03-29 18:00:00+09'
  ),
  (
    'eureka-world',
    'staging',
    'https://staging.jinbizman.com/eureka-world',
    'https://staging.jinbizman.com/admin/services/eureka-world',
    'https://staging.jinbizman.com/api',
    'https://staging.jinbizman.com/api/webhooks',
    'develop',
    'cloudflare',
    '{"worker":"eureka-world","env":"staging"}'::jsonb,
    TRUE,
    TRUE,
    NULL
  ),
  (
    'salary-platform',
    'staging',
    'https://salary-staging.jinbizman.com',
    'https://salary-staging.jinbizman.com/admin',
    'https://salary-staging.jinbizman.com/api',
    'https://salary-staging.jinbizman.com/api/webhooks',
    'develop',
    'cloudflare',
    '{"worker":"salary-platform","env":"staging"}'::jsonb,
    TRUE,
    TRUE,
    NULL
  ),
  (
    'strategy-sim',
    'staging',
    'https://strategy-staging.jinbizman.com',
    'https://strategy-staging.jinbizman.com/admin',
    'https://strategy-staging.jinbizman.com/api',
    'https://strategy-staging.jinbizman.com/api/webhooks',
    'develop',
    'cloudflare',
    '{"worker":"strategy-sim","env":"staging"}'::jsonb,
    TRUE,
    TRUE,
    NULL
  );

INSERT INTO service_environments (
  service_id,
  env_type,
  base_url,
  admin_url,
  api_base_url,
  webhook_base_url,
  branch_name,
  deployment_provider,
  deployment_config_json,
  is_primary,
  is_active,
  last_deployed_at
)
SELECT
  s.id,
  e.env_type,
  e.base_url,
  e.admin_url,
  e.api_base_url,
  e.webhook_base_url,
  e.branch_name,
  e.deployment_provider,
  e.deployment_config_json,
  e.is_primary,
  e.is_active,
  e.last_deployed_at
FROM _seed_service_environments e
JOIN services s
  ON s.service_code = e.service_code
ON CONFLICT (service_id, env_type) DO UPDATE
SET base_url = EXCLUDED.base_url,
    admin_url = EXCLUDED.admin_url,
    api_base_url = EXCLUDED.api_base_url,
    webhook_base_url = EXCLUDED.webhook_base_url,
    branch_name = EXCLUDED.branch_name,
    deployment_provider = EXCLUDED.deployment_provider,
    deployment_config_json = EXCLUDED.deployment_config_json,
    is_primary = EXCLUDED.is_primary,
    is_active = EXCLUDED.is_active,
    last_deployed_at = EXCLUDED.last_deployed_at,
    updated_at = NOW();

-- ------------------------------------------------------------
-- 3) service_connections
-- ------------------------------------------------------------
DROP TABLE IF EXISTS _seed_service_connections;
CREATE TEMP TABLE _seed_service_connections (
  service_code TEXT NOT NULL,
  connection_code TEXT NOT NULL,
  connection_type TEXT NOT NULL,
  provider_code TEXT NOT NULL,
  target_name TEXT NOT NULL,
  target_identifier TEXT NOT NULL,
  connection_status TEXT NOT NULL,
  config_json JSONB NOT NULL,
  secret_ref TEXT NOT NULL,
  last_checked_at TIMESTAMPTZ NULL
) ON COMMIT DROP;

INSERT INTO _seed_service_connections VALUES
  (
    'jinbiz-main',
    'primary_db',
    'database',
    'neon',
    'jinbiz-main-db',
    'neon:jinbiz-main',
    'active',
    '{"purpose":"primary-storage","region":"ap-northeast"}'::jsonb,
    'NEON_DATABASE_URL',
    TIMESTAMPTZ '2026-03-30 09:05:00+09'
  ),
  (
    'jinbiz-main',
    'outgoing_email',
    'email',
    'resend',
    'jinbiz-main-mail',
    'resend:jinbiz-main',
    'active',
    '{"from":"no-reply@jinbizman.com","usage":["inquiry","notification"]}'::jsonb,
    'RESEND_API_KEY',
    TIMESTAMPTZ '2026-03-30 09:06:00+09'
  ),
  (
    'jinbiz-main',
    'analytics_web',
    'analytics',
    'ga4',
    'jinbiz-main-ga4',
    'ga4:G-JINBIZMAIN',
    'active',
    '{"usage":["public-site","newsletter"]}'::jsonb,
    '',
    TIMESTAMPTZ '2026-03-30 09:07:00+09'
  ),
  (
    'jinbiz-main',
    'asset_storage',
    'storage',
    'cloudflare_r2',
    'jinbiz-assets',
    'r2:jinbiz-assets',
    'active',
    '{"bucket":"jinbiz-assets","public":true}'::jsonb,
    'R2_ASSETS_BUCKET',
    TIMESTAMPTZ '2026-03-30 09:08:00+09'
  ),
  (
    'eureka-world',
    'primary_db',
    'database',
    'neon',
    'eureka-world-db',
    'neon:eureka-world',
    'active',
    '{"purpose":"service-data"}'::jsonb,
    'NEON_DATABASE_URL',
    NULL
  ),
  (
    'eureka-world',
    'ai_inference',
    'llm',
    'openai',
    'eureka-world-ai',
    'openai:gpt-service',
    'active',
    '{"usage":["assistant","recommendation"]}'::jsonb,
    'OPENAI_API_KEY',
    NULL
  ),
  (
    'salary-platform',
    'primary_db',
    'database',
    'neon',
    'salary-platform-db',
    'neon:salary-platform',
    'active',
    '{"purpose":"service-data"}'::jsonb,
    'NEON_DATABASE_URL',
    NULL
  ),
  (
    'strategy-sim',
    'primary_db',
    'database',
    'neon',
    'strategy-sim-db',
    'neon:strategy-sim',
    'active',
    '{"purpose":"simulation-data"}'::jsonb,
    'NEON_DATABASE_URL',
    NULL
  ),
  (
    'strategy-sim',
    'ai_inference',
    'llm',
    'openai',
    'strategy-sim-ai',
    'openai:scenario-eval',
    'active',
    '{"usage":["strategy-analysis","summary"]}'::jsonb,
    'OPENAI_API_KEY',
    NULL
  );

INSERT INTO service_connections (
  service_id,
  connection_code,
  connection_type,
  provider_code,
  target_name,
  target_identifier,
  connection_status,
  config_json,
  secret_ref,
  last_checked_at
)
SELECT
  s.id,
  c.connection_code,
  c.connection_type,
  c.provider_code,
  c.target_name,
  c.target_identifier,
  c.connection_status,
  c.config_json,
  c.secret_ref,
  c.last_checked_at
FROM _seed_service_connections c
JOIN services s
  ON s.service_code = c.service_code
ON CONFLICT (service_id, connection_code) DO UPDATE
SET connection_type = EXCLUDED.connection_type,
    provider_code = EXCLUDED.provider_code,
    target_name = EXCLUDED.target_name,
    target_identifier = EXCLUDED.target_identifier,
    connection_status = EXCLUDED.connection_status,
    config_json = EXCLUDED.config_json,
    secret_ref = EXCLUDED.secret_ref,
    last_checked_at = EXCLUDED.last_checked_at,
    updated_at = NOW();

-- ------------------------------------------------------------
-- 4) service_domains
-- 008 schema has no path_prefix column.
-- domain field is used here as the public entry route string.
-- ------------------------------------------------------------
DROP TABLE IF EXISTS _seed_service_domains;
CREATE TEMP TABLE _seed_service_domains (
  service_code TEXT NOT NULL,
  locale VARCHAR(10) NOT NULL,
  domain TEXT NOT NULL,
  is_canonical BOOLEAN NOT NULL
) ON COMMIT DROP;

INSERT INTO _seed_service_domains VALUES
  ('jinbiz-main', 'ko', 'www.jinbizman.com', TRUE),
  ('jinbiz-main', 'en', 'www.jinbizman.com/en', FALSE),
  ('jinbiz-main', 'ja', 'www.jinbizman.com/ja', FALSE),
  ('jinbiz-main', 'fr', 'www.jinbizman.com/fr', FALSE),
  ('jinbiz-main', 'es', 'www.jinbizman.com/es', FALSE),

  ('eureka-world', 'ko', 'www.jinbizman.com/eureka-world', TRUE),
  ('eureka-world', 'en', 'www.jinbizman.com/en/eureka-world', FALSE),

  ('salary-platform', 'ko', 'salary.jinbizman.com', TRUE),
  ('strategy-sim', 'ko', 'strategy.jinbizman.com', TRUE);

INSERT INTO service_domains (
  service_id,
  domain,
  locale,
  is_canonical
)
SELECT
  s.id,
  d.domain,
  d.locale,
  d.is_canonical
FROM _seed_service_domains d
JOIN services s
  ON s.service_code = d.service_code
ON CONFLICT (service_id, locale) DO UPDATE
SET domain = EXCLUDED.domain,
    is_canonical = EXCLUDED.is_canonical,
    updated_at = NOW();

-- ------------------------------------------------------------
-- 5) service_content_types
-- ------------------------------------------------------------
DROP TABLE IF EXISTS _seed_service_content_types;
CREATE TEMP TABLE _seed_service_content_types (
  service_code TEXT NOT NULL,
  type_code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  schema_json JSONB NOT NULL,
  is_active BOOLEAN NOT NULL
) ON COMMIT DROP;

INSERT INTO _seed_service_content_types VALUES
  (
    'jinbiz-main',
    'hero_section',
    '메인 히어로',
    'page',
    10,
    '{"fields":["eyebrow","headline","description","primary_cta","secondary_cta","visual_asset_key"]}'::jsonb,
    TRUE
  ),
  (
    'jinbiz-main',
    'company_overview',
    '회사 소개',
    'page',
    20,
    '{"fields":["title","body","vision","values","timeline"]}'::jsonb,
    TRUE
  ),
  (
    'jinbiz-main',
    'business_items',
    '사업 소개',
    'page',
    30,
    '{"fields":["items"]}'::jsonb,
    TRUE
  ),
  (
    'jinbiz-main',
    'newsletter_landing',
    '뉴스레터 랜딩',
    'page',
    40,
    '{"fields":["intro_title","intro_body","tabs","empty_state"]}'::jsonb,
    TRUE
  ),
  (
    'jinbiz-main',
    'contact_landing',
    '문의 랜딩',
    'page',
    50,
    '{"fields":["intro_title","intro_body","inquiry_types","contact_meta"]}'::jsonb,
    TRUE
  ),
  (
    'jinbiz-main',
    'footer_legal_block',
    '푸터 법적 정보',
    'config',
    60,
    '{"fields":["company_name","business_number","address","email","phone","privacy_policy_url","terms_url"]}'::jsonb,
    TRUE
  ),

  (
    'eureka-world',
    'hero_section',
    '유레카월드 히어로',
    'page',
    10,
    '{"fields":["eyebrow","headline","description","primary_cta","visual_asset_key"]}'::jsonb,
    TRUE
  ),
  (
    'eureka-world',
    'service_announcements',
    '서비스 공지',
    'collection',
    20,
    '{"fields":["title","body","effective_from","effective_to","severity"]}'::jsonb,
    TRUE
  ),
  (
    'eureka-world',
    'download_buttons',
    '다운로드 버튼',
    'config',
    30,
    '{"fields":["items"]}'::jsonb,
    TRUE
  ),

  (
    'salary-platform',
    'hero_section',
    '플랫폼 히어로',
    'page',
    10,
    '{"fields":["headline","description","primary_cta"]}'::jsonb,
    TRUE
  ),
  (
    'salary-platform',
    'feature_cards',
    '플랫폼 기능 카드',
    'page',
    20,
    '{"fields":["items"]}'::jsonb,
    TRUE
  ),

  (
    'strategy-sim',
    'hero_section',
    '플랫폼 히어로',
    'page',
    10,
    '{"fields":["headline","description","primary_cta"]}'::jsonb,
    TRUE
  ),
  (
    'strategy-sim',
    'feature_cards',
    '플랫폼 기능 카드',
    'page',
    20,
    '{"fields":["items"]}'::jsonb,
    TRUE
  );

INSERT INTO service_content_types (
  service_id,
  type_code,
  name,
  category,
  sort_order,
  schema_json,
  is_active
)
SELECT
  s.id,
  t.type_code,
  t.name,
  t.category,
  t.sort_order,
  t.schema_json,
  t.is_active
FROM _seed_service_content_types t
JOIN services s
  ON s.service_code = t.service_code
ON CONFLICT (service_id, type_code) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    sort_order = EXCLUDED.sort_order,
    schema_json = EXCLUDED.schema_json,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ------------------------------------------------------------
-- 6) service_content_items
-- ------------------------------------------------------------
DROP TABLE IF EXISTS _seed_service_content_items;
CREATE TEMP TABLE _seed_service_content_items (
  service_code TEXT NOT NULL,
  type_code TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  status TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  is_system BOOLEAN NOT NULL,
  payload_json JSONB NOT NULL,
  published_at TIMESTAMPTZ NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL
) ON COMMIT DROP;

INSERT INTO _seed_service_content_items
SELECT *
FROM (
  SELECT
    'jinbiz-main',
    'hero_section',
    '메인 홈 히어로',
    'home-hero',
    'published',
    10,
    TRUE,
    '{
      "eyebrow":"AI Service Company",
      "headline":"AI로 실행력을 만드는 JINBIZ",
      "description":"회사소개형 AI 서비스 홈페이지와 WBS 중심 ERP 운영 체계를 하나의 실행 구조로 제공합니다.",
      "primary_cta":{"label":"회사소개 보기","link":"/company"},
      "secondary_cta":{"label":"문의하기","link":"/contact"},
      "visual_asset_key":"hero-main"
    }'::jsonb,
    TIMESTAMPTZ '2026-03-30 10:00:00+09',
    admin_user_id,
    admin_user_id
  FROM _seed_refs

  UNION ALL

  SELECT
    'jinbiz-main',
    'company_overview',
    '회사소개 개요',
    'company-overview',
    'published',
    20,
    TRUE,
    '{
      "title":"AI 서비스 기업 JINBIZ",
      "body":"진비즈 매니지먼트는 AI 서비스, 플랫폼 사업, 실행 중심 운영 체계를 연결하는 기업입니다.",
      "vision":"AI로 더 빠르고 정확한 실행 체계를 만든다.",
      "values":["실행","정합성","확장성","운영성"],
      "timeline":[
        {"year":"2026","label":"Corporate Site + ERP 1차 구축"}
      ]
    }'::jsonb,
    TIMESTAMPTZ '2026-03-30 10:00:00+09',
    admin_user_id,
    admin_user_id
  FROM _seed_refs

  UNION ALL

  SELECT
    'jinbiz-main',
    'business_items',
    '사업소개 개요',
    'business-overview',
    'published',
    30,
    TRUE,
    '{
      "items":[
        {"key":"ai_service","title":"AI 서비스","summary":"기업 실행 구조를 돕는 AI 서비스"},
        {"key":"platform_business","title":"플랫폼 사업","summary":"서비스 허브 기반 확장 플랫폼"},
        {"key":"planning_service","title":"기획 서비스","summary":"운영과 실행을 연결하는 기획 체계"}
      ]
    }'::jsonb,
    TIMESTAMPTZ '2026-03-30 10:00:00+09',
    admin_user_id,
    admin_user_id
  FROM _seed_refs

  UNION ALL

  SELECT
    'jinbiz-main',
    'newsletter_landing',
    '뉴스레터 랜딩',
    'newsletter-landing',
    'published',
    40,
    TRUE,
    '{
      "intro_title":"공식 소식 센터",
      "intro_body":"보도자료, 공시정보, 공지사항을 한곳에서 관리합니다.",
      "tabs":["press","disclosure","notice"],
      "empty_state":"등록된 소식이 없습니다."
    }'::jsonb,
    TIMESTAMPTZ '2026-03-30 10:00:00+09',
    admin_user_id,
    admin_user_id
  FROM _seed_refs

  UNION ALL

  SELECT
    'jinbiz-main',
    'contact_landing',
    '문의 랜딩',
    'contact-landing',
    'published',
    50,
    TRUE,
    '{
      "intro_title":"문의하기",
      "intro_body":"협업, 서비스, 제안, 운영 관련 문의를 남겨주세요.",
      "inquiry_types":["business","partnership","general"],
      "contact_meta":{"email":"contact@jinbizman.com","phone":"02-0000-0000"}
    }'::jsonb,
    TIMESTAMPTZ '2026-03-30 10:00:00+09',
    admin_user_id,
    admin_user_id
  FROM _seed_refs

  UNION ALL

  SELECT
    'jinbiz-main',
    'footer_legal_block',
    '푸터 법적 정보',
    'footer-legal',
    'published',
    60,
    TRUE,
    '{
      "company_name":"JINBIZ MANAGEMENT",
      "business_number":"000-00-00000",
      "address":"Jeonju, Republic of Korea",
      "email":"contact@jinbizman.com",
      "phone":"02-0000-0000",
      "privacy_policy_url":"/privacy",
      "terms_url":"/terms"
    }'::jsonb,
    TIMESTAMPTZ '2026-03-30 10:00:00+09',
    admin_user_id,
    admin_user_id
  FROM _seed_refs

  UNION ALL

  SELECT
    'eureka-world',
    'hero_section',
    '유레카월드 히어로',
    'eureka-hero',
    'draft',
    10,
    TRUE,
    '{
      "eyebrow":"AI Workspace",
      "headline":"유레카월드 공개 준비 중",
      "description":"작업 중심 AI 경험을 위한 서비스 공개 범위와 운영 정책을 정리하고 있습니다.",
      "primary_cta":{"label":"출시 예정","link":"/eureka-world"},
      "visual_asset_key":"eureka-hero"
    }'::jsonb,
    NULL,
    admin_user_id,
    admin_user_id
  FROM _seed_refs

  UNION ALL

  SELECT
    'eureka-world',
    'service_announcements',
    '유레카월드 공개 준비 공지',
    'eureka-launch-notice',
    'draft',
    20,
    FALSE,
    '{
      "title":"유레카월드 공개 준비 중",
      "body":"서비스 공개 범위, 다국어, 운영 정책을 정리하는 단계입니다.",
      "effective_from":"2026-04-01",
      "effective_to":"2026-06-30",
      "severity":"info"
    }'::jsonb,
    NULL,
    admin_user_id,
    admin_user_id
  FROM _seed_refs

  UNION ALL

  SELECT
    'salary-platform',
    'hero_section',
    '급여 플랫폼 히어로',
    'salary-hero',
    'draft',
    10,
    TRUE,
    '{
      "headline":"급여 플랫폼 준비 중",
      "description":"급여/정산 운영 구조를 위한 플랫폼 기획안입니다.",
      "primary_cta":{"label":"준비 중","link":"/"}
    }'::jsonb,
    NULL,
    admin_user_id,
    admin_user_id
  FROM _seed_refs

  UNION ALL

  SELECT
    'strategy-sim',
    'hero_section',
    '전략 시뮬레이션 히어로',
    'strategy-hero',
    'draft',
    10,
    TRUE,
    '{
      "headline":"전략 시뮬레이션 플랫폼 파일럿",
      "description":"전략 지원과 시나리오 분석을 위한 플랫폼 파일럿입니다.",
      "primary_cta":{"label":"파일럿 진행 중","link":"/"}
    }'::jsonb,
    NULL,
    admin_user_id,
    admin_user_id
  FROM _seed_refs
) seeded;

INSERT INTO service_content_items (
  service_id,
  content_type_id,
  title,
  slug,
  status,
  sort_order,
  is_system,
  payload_json,
  published_at,
  created_by,
  updated_by
)
SELECT
  s.id,
  sct.id,
  i.title,
  i.slug,
  i.status,
  i.sort_order,
  i.is_system,
  i.payload_json,
  i.published_at,
  i.created_by,
  i.updated_by
FROM _seed_service_content_items i
JOIN services s
  ON s.service_code = i.service_code
JOIN service_content_types sct
  ON sct.service_id = s.id
 AND sct.type_code = i.type_code
ON CONFLICT (service_id, content_type_id, slug) DO UPDATE
SET title = EXCLUDED.title,
    status = EXCLUDED.status,
    sort_order = EXCLUDED.sort_order,
    is_system = EXCLUDED.is_system,
    payload_json = EXCLUDED.payload_json,
    published_at = EXCLUDED.published_at,
    created_by = EXCLUDED.created_by,
    updated_by = EXCLUDED.updated_by,
    updated_at = NOW();

-- ------------------------------------------------------------
-- 7) service_translations
-- latest schema:
--   one locale row per content item
--   default locale must be published first
-- ------------------------------------------------------------
DROP TABLE IF EXISTS _seed_service_translations;
CREATE TEMP TABLE _seed_service_translations (
  service_code TEXT NOT NULL,
  type_code TEXT NOT NULL,
  item_slug TEXT NOT NULL,
  locale VARCHAR(10) NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  seo_title TEXT NOT NULL,
  seo_description TEXT NOT NULL,
  payload_json JSONB NOT NULL,
  status TEXT NOT NULL,
  published_at TIMESTAMPTZ NULL
) ON COMMIT DROP;

-- ko first for all base items
INSERT INTO _seed_service_translations VALUES
  (
    'jinbiz-main',
    'hero_section',
    'home-hero',
    'ko',
    '메인 홈 히어로',
    'home-hero',
    'JINBIZ 메인 홈',
    'AI 서비스 기업 JINBIZ 메인 홈',
    '{
      "eyebrow":"AI 서비스 기업",
      "headline":"AI로 실행력을 만드는 JINBIZ",
      "description":"회사소개형 AI 서비스 홈페이지와 WBS 중심 ERP 운영 체계를 하나의 실행 구조로 제공합니다.",
      "primary_cta":{"label":"회사소개 보기","link":"/company"},
      "secondary_cta":{"label":"문의하기","link":"/contact"}
    }'::jsonb,
    'published',
    TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),
  (
    'jinbiz-main',
    'company_overview',
    'company-overview',
    'ko',
    '회사소개 개요',
    'company-overview',
    'JINBIZ 회사소개',
    'AI 서비스 기업 JINBIZ 회사소개',
    '{
      "title":"AI 서비스 기업 JINBIZ",
      "body":"진비즈 매니지먼트는 AI 서비스, 플랫폼 사업, 실행 중심 운영 체계를 연결하는 기업입니다.",
      "vision":"AI로 더 빠르고 정확한 실행 체계를 만든다."
    }'::jsonb,
    'published',
    TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),
  (
    'jinbiz-main',
    'business_items',
    'business-overview',
    'ko',
    '사업소개 개요',
    'business-overview',
    'JINBIZ 사업소개',
    'AI 서비스, 플랫폼 사업, 기획 서비스 소개',
    '{
      "items":[
        {"key":"ai_service","title":"AI 서비스","summary":"기업 실행 구조를 돕는 AI 서비스"},
        {"key":"platform_business","title":"플랫폼 사업","summary":"서비스 허브 기반 확장 플랫폼"},
        {"key":"planning_service","title":"기획 서비스","summary":"운영과 실행을 연결하는 기획 체계"}
      ]
    }'::jsonb,
    'published',
    TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),
  (
    'jinbiz-main',
    'newsletter_landing',
    'newsletter-landing',
    'ko',
    '뉴스레터 랜딩',
    'newsletter-landing',
    'JINBIZ 뉴스레터',
    '보도자료, 공시정보, 공지사항 아카이브',
    '{
      "intro_title":"공식 소식 센터",
      "intro_body":"보도자료, 공시정보, 공지사항을 한곳에서 관리합니다."
    }'::jsonb,
    'published',
    TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),
  (
    'jinbiz-main',
    'contact_landing',
    'contact-landing',
    'ko',
    '문의 랜딩',
    'contact-landing',
    'JINBIZ 문의하기',
    '협업, 서비스, 제안, 운영 관련 문의 페이지',
    '{
      "intro_title":"문의하기",
      "intro_body":"협업, 서비스, 제안, 운영 관련 문의를 남겨주세요."
    }'::jsonb,
    'published',
    TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),
  (
    'jinbiz-main',
    'footer_legal_block',
    'footer-legal',
    'ko',
    '푸터 법적 정보',
    'footer-legal',
    'JINBIZ 법적 정보',
    '법적 고지 및 회사 정보',
    '{
      "company_name":"JINBIZ MANAGEMENT",
      "address":"Jeonju, Republic of Korea"
    }'::jsonb,
    'published',
    TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),
  (
    'eureka-world',
    'hero_section',
    'eureka-hero',
    'ko',
    '유레카월드 히어로',
    'eureka-hero',
    '유레카월드 공개 준비',
    '유레카월드 서비스 공개 준비 안내',
    '{
      "headline":"유레카월드 공개 준비 중",
      "description":"작업 중심 AI 경험을 위한 서비스 공개 범위와 운영 정책을 정리하고 있습니다."
    }'::jsonb,
    'draft',
    NULL
  ),
  (
    'eureka-world',
    'service_announcements',
    'eureka-launch-notice',
    'ko',
    '유레카월드 공개 준비 공지',
    'eureka-launch-notice',
    '유레카월드 공개 준비 공지',
    '유레카월드 공개 범위와 운영 정책 정리 단계',
    '{
      "title":"유레카월드 공개 준비 중",
      "body":"서비스 공개 범위, 다국어, 운영 정책을 정리하는 단계입니다."
    }'::jsonb,
    'draft',
    NULL
  ),
  (
    'salary-platform',
    'hero_section',
    'salary-hero',
    'ko',
    '급여 플랫폼 히어로',
    'salary-hero',
    '급여 플랫폼 준비 중',
    '급여 플랫폼 기획안',
    '{
      "headline":"급여 플랫폼 준비 중",
      "description":"급여/정산 운영 구조를 위한 플랫폼 기획안입니다."
    }'::jsonb,
    'draft',
    NULL
  ),
  (
    'strategy-sim',
    'hero_section',
    'strategy-hero',
    'ko',
    '전략 시뮬레이션 히어로',
    'strategy-hero',
    '전략 시뮬레이션 파일럿',
    '전략 시뮬레이션 플랫폼 파일럿',
    '{
      "headline":"전략 시뮬레이션 플랫폼 파일럿",
      "description":"전략 지원과 시나리오 분석을 위한 플랫폼 파일럿입니다."
    }'::jsonb,
    'draft',
    NULL
  );

-- published secondary locales for jinbiz-main
INSERT INTO _seed_service_translations VALUES
  (
    'jinbiz-main','hero_section','home-hero','en',
    'Home Hero','home-hero-en','JINBIZ Home','JINBIZ AI corporate home',
    '{"eyebrow":"AI Service Company","headline":"JINBIZ turns AI into execution","description":"We connect an AI corporate site with a WBS-driven ERP operating structure.","primary_cta":{"label":"About","link":"/en/company"},"secondary_cta":{"label":"Contact","link":"/en/contact"}}'::jsonb,
    'published',TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),
  (
    'jinbiz-main','company_overview','company-overview','en',
    'Company Overview','company-overview-en','About JINBIZ','About the AI service company JINBIZ',
    '{"title":"AI Service Company JINBIZ","body":"JINBIZ MANAGEMENT connects AI services, platform business, and execution-centered operations.","vision":"Build faster and more accurate execution systems with AI."}'::jsonb,
    'published',TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),
  (
    'jinbiz-main','business_items','business-overview','en',
    'Business Overview','business-overview-en','JINBIZ Business','AI services, platform business, and planning services',
    '{"items":[{"key":"ai_service","title":"AI Services","summary":"AI services for business execution"},{"key":"platform_business","title":"Platform Business","summary":"Scalable platforms based on the service hub"},{"key":"planning_service","title":"Planning Service","summary":"Planning systems that connect operation and execution"}]}'::jsonb,
    'published',TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),
  (
    'jinbiz-main','newsletter_landing','newsletter-landing','en',
    'Newsletter Landing','newsletter-landing-en','JINBIZ Newsroom','Press, disclosure, and notice archive',
    '{"intro_title":"Official News Center","intro_body":"Manage press releases, disclosures, and notices in one place."}'::jsonb,
    'published',TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),
  (
    'jinbiz-main','contact_landing','contact-landing','en',
    'Contact Landing','contact-landing-en','Contact JINBIZ','Contact page for collaboration, service, and proposal inquiries',
    '{"intro_title":"Contact","intro_body":"Send us your questions about collaboration, services, proposals, and operations."}'::jsonb,
    'published',TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),

  (
    'jinbiz-main','hero_section','home-hero','ja',
    'ホームヒーロー','home-hero-ja','JINBIZ ホーム','JINBIZ AI企業ホーム',
    '{"eyebrow":"AIサービス企業","headline":"AIで実行力をつくるJINBIZ","description":"会社紹介型AIサービスサイトとWBS中心ERP運営体制を一つの実行構造で提供します。","primary_cta":{"label":"会社紹介","link":"/ja/company"},"secondary_cta":{"label":"お問い合わせ","link":"/ja/contact"}}'::jsonb,
    'published',TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),
  (
    'jinbiz-main','company_overview','company-overview','ja',
    '会社紹介概要','company-overview-ja','JINBIZ 会社紹介','AIサービス企業 JINBIZ の会社紹介',
    '{"title":"AIサービス企業 JINBIZ","body":"JINBIZ MANAGEMENTは、AIサービス、プラットフォーム事業、実行中心の運営体制をつなぐ企業です。","vision":"AIでより速く正確な実行体制をつくる。"}'::jsonb,
    'published',TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),
  (
    'jinbiz-main','business_items','business-overview','ja',
    '事業紹介概要','business-overview-ja','JINBIZ 事業紹介','AIサービス、プラットフォーム事業、企画サービス',
    '{"items":[{"key":"ai_service","title":"AIサービス","summary":"企業の実行を支援するAIサービス"},{"key":"platform_business","title":"プラットフォーム事業","summary":"サービスハブ基盤の拡張プラットフォーム"},{"key":"planning_service","title":"企画サービス","summary":"運営と実行をつなぐ企画体制"}]}'::jsonb,
    'published',TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),
  (
    'jinbiz-main','newsletter_landing','newsletter-landing','ja',
    'ニュースレターランディング','newsletter-landing-ja','JINBIZ ニュースセンター','プレス・公示・お知らせアーカイブ',
    '{"intro_title":"公式ニュースセンター","intro_body":"プレスリリース、公示情報、お知らせを一か所で管理します。"}'::jsonb,
    'published',TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),
  (
    'jinbiz-main','contact_landing','contact-landing','ja',
    'お問い合わせランディング','contact-landing-ja','JINBIZ お問い合わせ','協業・サービス・提案・運営に関するお問い合わせページ',
    '{"intro_title":"お問い合わせ","intro_body":"協業、サービス、提案、運営に関するお問い合わせをお送りください。"}'::jsonb,
    'published',TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),

  (
    'jinbiz-main','hero_section','home-hero','fr',
    'Héros accueil','home-hero-fr','Accueil JINBIZ','Accueil corporate IA JINBIZ',
    '{"eyebrow":"Entreprise de services IA","headline":"JINBIZ transforme l’IA en capacité d’exécution","description":"Nous relions un site corporate IA à une structure ERP pilotée par WBS.","primary_cta":{"label":"Entreprise","link":"/fr/company"},"secondary_cta":{"label":"Contact","link":"/fr/contact"}}'::jsonb,
    'published',TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),
  (
    'jinbiz-main','company_overview','company-overview','fr',
    'Présentation de l’entreprise','company-overview-fr','À propos de JINBIZ','Présentation de l’entreprise de services IA JINBIZ',
    '{"title":"Entreprise de services IA JINBIZ","body":"JINBIZ MANAGEMENT relie les services IA, l’activité plateforme et l’exploitation orientée exécution.","vision":"Construire avec l’IA des systèmes d’exécution plus rapides et plus précis."}'::jsonb,
    'published',TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),
  (
    'jinbiz-main','business_items','business-overview','fr',
    'Présentation des activités','business-overview-fr','Activités JINBIZ','Services IA, activité plateforme et planification',
    '{"items":[{"key":"ai_service","title":"Services IA","summary":"Services IA pour l’exécution métier"},{"key":"platform_business","title":"Activité plateforme","summary":"Plateformes extensibles basées sur le service hub"},{"key":"planning_service","title":"Service de planification","summary":"Système de planification reliant exploitation et exécution"}]}'::jsonb,
    'published',TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),
  (
    'jinbiz-main','newsletter_landing','newsletter-landing','fr',
    'Accueil newsroom','newsletter-landing-fr','Actualités JINBIZ','Archives presse, divulgation et notices',
    '{"intro_title":"Centre d’actualités officiel","intro_body":"Gérez communiqués, informations de divulgation et notices en un seul endroit."}'::jsonb,
    'published',TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),
  (
    'jinbiz-main','contact_landing','contact-landing','fr',
    'Page contact','contact-landing-fr','Contacter JINBIZ','Page de contact pour collaboration, services et propositions',
    '{"intro_title":"Contact","intro_body":"Envoyez vos demandes concernant collaboration, services, propositions et opérations."}'::jsonb,
    'published',TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),

  (
    'jinbiz-main','hero_section','home-hero','es',
    'Héroe de inicio','home-hero-es','Inicio JINBIZ','Inicio corporativo IA JINBIZ',
    '{"eyebrow":"Empresa de servicios de IA","headline":"JINBIZ convierte la IA en capacidad de ejecución","description":"Conectamos un sitio corporativo de IA con una estructura ERP basada en WBS.","primary_cta":{"label":"Empresa","link":"/es/company"},"secondary_cta":{"label":"Contacto","link":"/es/contact"}}'::jsonb,
    'published',TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),
  (
    'jinbiz-main','company_overview','company-overview','es',
    'Resumen de la empresa','company-overview-es','Acerca de JINBIZ','Resumen de la empresa de servicios de IA JINBIZ',
    '{"title":"Empresa de servicios de IA JINBIZ","body":"JINBIZ MANAGEMENT conecta servicios de IA, negocio de plataformas y operación centrada en ejecución.","vision":"Construir con IA sistemas de ejecución más rápidos y precisos."}'::jsonb,
    'published',TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),
  (
    'jinbiz-main','business_items','business-overview','es',
    'Resumen del negocio','business-overview-es','Negocio JINBIZ','Servicios de IA, negocio de plataformas y planificación',
    '{"items":[{"key":"ai_service","title":"Servicios de IA","summary":"Servicios de IA para la ejecución empresarial"},{"key":"platform_business","title":"Negocio de plataformas","summary":"Plataformas escalables basadas en el service hub"},{"key":"planning_service","title":"Servicio de planificación","summary":"Sistema de planificación que conecta operación y ejecución"}]}'::jsonb,
    'published',TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),
  (
    'jinbiz-main','newsletter_landing','newsletter-landing','es',
    'Página de newsroom','newsletter-landing-es','Noticias JINBIZ','Archivo de prensa, divulgación y avisos',
    '{"intro_title":"Centro oficial de noticias","intro_body":"Gestione comunicados, divulgaciones y avisos en un solo lugar."}'::jsonb,
    'published',TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),
  (
    'jinbiz-main','contact_landing','contact-landing','es',
    'Página de contacto','contact-landing-es','Contacto JINBIZ','Página de contacto para colaboración, servicios y propuestas',
    '{"intro_title":"Contacto","intro_body":"Envíenos consultas sobre colaboración, servicios, propuestas y operación."}'::jsonb,
    'published',TIMESTAMPTZ '2026-03-30 10:00:00+09'
  ),

  (
    'eureka-world','hero_section','eureka-hero','en',
    'Eureka World Hero','eureka-hero-en','Eureka World launch prep','Eureka World service launch preparation',
    '{"headline":"Eureka World is preparing for launch","description":"We are defining the public scope and operating policy for a task-centered AI experience."}'::jsonb,
    'draft',NULL
  ),
  (
    'eureka-world','service_announcements','eureka-launch-notice','en',
    'Eureka World launch preparation notice','eureka-launch-notice-en','Eureka World launch preparation notice','Preparation notice for Eureka World public release',
    '{"title":"Eureka World launch preparation","body":"This stage is focused on finalizing public scope, multilingual support, and operations policy."}'::jsonb,
    'draft',NULL
  );

-- default locale first
INSERT INTO service_translations (
  service_content_item_id,
  locale,
  title,
  slug,
  seo_title,
  seo_description,
  payload_json,
  status,
  published_at
)
SELECT
  sci.id,
  st.locale,
  st.title,
  st.slug,
  st.seo_title,
  st.seo_description,
  st.payload_json,
  st.status,
  st.published_at
FROM _seed_service_translations st
JOIN services s
  ON s.service_code = st.service_code
JOIN service_content_types sct
  ON sct.service_id = s.id
 AND sct.type_code = st.type_code
JOIN service_content_items sci
  ON sci.service_id = s.id
 AND sci.content_type_id = sct.id
 AND sci.slug = st.item_slug
WHERE st.locale = 'ko'
ON CONFLICT (service_content_item_id, locale) DO UPDATE
SET title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    seo_title = EXCLUDED.seo_title,
    seo_description = EXCLUDED.seo_description,
    payload_json = EXCLUDED.payload_json,
    status = EXCLUDED.status,
    published_at = EXCLUDED.published_at,
    updated_at = NOW();

-- then secondary locales
INSERT INTO service_translations (
  service_content_item_id,
  locale,
  title,
  slug,
  seo_title,
  seo_description,
  payload_json,
  status,
  published_at
)
SELECT
  sci.id,
  st.locale,
  st.title,
  st.slug,
  st.seo_title,
  st.seo_description,
  st.payload_json,
  st.status,
  st.published_at
FROM _seed_service_translations st
JOIN services s
  ON s.service_code = st.service_code
JOIN service_content_types sct
  ON sct.service_id = s.id
 AND sct.type_code = st.type_code
JOIN service_content_items sci
  ON sci.service_id = s.id
 AND sci.content_type_id = sct.id
 AND sci.slug = st.item_slug
WHERE st.locale <> 'ko'
ON CONFLICT (service_content_item_id, locale) DO UPDATE
SET title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    seo_title = EXCLUDED.seo_title,
    seo_description = EXCLUDED.seo_description,
    payload_json = EXCLUDED.payload_json,
    status = EXCLUDED.status,
    published_at = EXCLUDED.published_at,
    updated_at = NOW();

COMMIT;