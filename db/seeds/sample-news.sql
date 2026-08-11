-- sample-news.sql
-- JINBIZ sample news seed
--
-- Purpose:
--   - seed newsletter archive sample data for the latest split migrations
--   - align strictly with 003_public_content.sql + 008_domains_locales.sql
--   - remain idempotent and production-safe
--
-- Notes:
--   - newsletter structure:
--       press / disclosure / notice
--   - official locales:
--       ko / en / ja / fr / es
--   - default locale must be published first before non-default locales are published
--   - unpublished locales should remain hidden from the public page

BEGIN;

-- ------------------------------------------------------------
-- 1) base news_posts
-- latest schema:
--   news_posts(
--     category, service_id, title, slug, summary, body, status,
--     is_pinned, published_at, author_user_id, created_by, updated_by
--   )
-- ------------------------------------------------------------
WITH refs AS (
  SELECT
    (SELECT id FROM services WHERE service_code = 'jinbiz-main' LIMIT 1) AS service_id,
    (SELECT id FROM users WHERE email = 'admin@jinbizman.com' LIMIT 1) AS admin_user_id
)
INSERT INTO news_posts (
  category,
  service_id,
  title,
  slug,
  summary,
  body,
  status,
  is_pinned,
  published_at,
  author_user_id,
  created_by,
  updated_by
)
SELECT *
FROM (
  SELECT
    'press',
    service_id,
    'JINBIZ MANAGEMENT, AI 서비스 기업 홈페이지 공식 오픈',
    'jinbiz-ai-corporate-site-launch',
    '진비즈 매니지먼트가 회사소개형 AI 서비스 기업 홈페이지와 ERP 기반 운영 체계를 공식 오픈했습니다.',
    'JINBIZ MANAGEMENT는 AI 서비스와 플랫폼 사업을 중심으로 한 회사소개형 홈페이지를 공식 오픈했습니다. 이번 공개에는 메인 홈, 회사소개, 사업소개, 뉴스레터, 문의하기 구조와 함께 다국어 공개 운영을 위한 기본 체계가 포함됩니다. 또한 내부 운영을 위한 ERP 기반의 서비스 허브, 프로젝트/WBS, 업무보고/업무일지, 결재와 평가 근거 데이터 구조를 함께 준비했습니다.',
    'published',
    TRUE,
    TIMESTAMPTZ '2026-03-27 09:00:00+09',
    admin_user_id,
    admin_user_id,
    admin_user_id
  FROM refs

  UNION ALL

  SELECT
    'disclosure',
    service_id,
    'JINBIZ MANAGEMENT 운영 구조 및 거버넌스 공시 안내',
    'jinbiz-governance-and-operations-update-2026',
    '진비즈 매니지먼트의 서비스 허브, 다국어 운영, 결재 및 감사로그 기준을 정리한 운영 구조 공시입니다.',
    '본 공시는 JINBIZ MANAGEMENT의 운영 기준을 외부 이해관계자에게 명확히 안내하기 위한 자료입니다. 서비스 등록 기반 확장 구조, 다국어 공개 정책, 결재 및 감사로그 운영 원칙, WBS 중심 실행 체계와 평가 근거 데이터 축적 원칙을 포함합니다.',
    'published',
    FALSE,
    TIMESTAMPTZ '2026-03-28 10:30:00+09',
    admin_user_id,
    admin_user_id,
    admin_user_id
  FROM refs

  UNION ALL

  SELECT
    'notice',
    service_id,
    '뉴스레터 및 문의 시스템 점검 안내',
    'jinbiz-newsroom-service-maintenance-2026-04',
    '뉴스레터와 문의 시스템의 안정성 향상을 위한 정기 점검 일정을 안내드립니다.',
    '보다 안정적인 뉴스레터 아카이브 제공과 문의 처리 품질 개선을 위해 정기 점검을 진행합니다. 점검 시간 동안 일부 페이지 접근이나 문의 접수가 일시적으로 지연될 수 있으며, 접수된 문의는 점검 종료 후 순차적으로 정상 처리됩니다.',
    'published',
    FALSE,
    TIMESTAMPTZ '2026-03-29 08:00:00+09',
    admin_user_id,
    admin_user_id,
    admin_user_id
  FROM refs
) seeded_news
ON CONFLICT (slug) DO UPDATE
SET category = EXCLUDED.category,
    service_id = EXCLUDED.service_id,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    body = EXCLUDED.body,
    status = EXCLUDED.status,
    is_pinned = EXCLUDED.is_pinned,
    published_at = EXCLUDED.published_at,
    author_user_id = EXCLUDED.author_user_id,
    created_by = EXCLUDED.created_by,
    updated_by = EXCLUDED.updated_by,
    updated_at = NOW();

-- ------------------------------------------------------------
-- 2) default locale (ko) translations first
-- required before any non-default locale can be published
-- ------------------------------------------------------------
INSERT INTO news_post_translations (
  news_post_id,
  locale,
  title,
  summary,
  body,
  slug,
  seo_title,
  seo_description,
  status,
  published_at
)
SELECT
  np.id,
  'ko',
  seed.title,
  seed.summary,
  seed.body,
  seed.slug,
  seed.seo_title,
  seed.seo_description,
  seed.status,
  seed.published_at
FROM news_posts np
JOIN (
  VALUES
    (
      'jinbiz-ai-corporate-site-launch',
      'JINBIZ MANAGEMENT, AI 서비스 기업 홈페이지 공식 오픈',
      '진비즈 매니지먼트가 회사소개형 AI 서비스 기업 홈페이지와 ERP 기반 운영 체계를 공식 오픈했습니다.',
      'JINBIZ MANAGEMENT는 AI 서비스와 플랫폼 사업을 중심으로 한 회사소개형 홈페이지를 공식 오픈했습니다. 이번 공개에는 메인 홈, 회사소개, 사업소개, 뉴스레터, 문의하기 구조와 함께 다국어 공개 운영을 위한 기본 체계가 포함됩니다. 또한 내부 운영을 위한 ERP 기반의 서비스 허브, 프로젝트/WBS, 업무보고/업무일지, 결재와 평가 근거 데이터 구조를 함께 준비했습니다.',
      'jinbiz-ai-corporate-site-launch',
      'JINBIZ MANAGEMENT AI 서비스 기업 홈페이지 공식 오픈',
      '회사소개형 AI 서비스 기업 홈페이지와 ERP 운영 체계 공식 오픈 소식',
      'published',
      TIMESTAMPTZ '2026-03-27 09:00:00+09'
    ),
    (
      'jinbiz-governance-and-operations-update-2026',
      'JINBIZ MANAGEMENT 운영 구조 및 거버넌스 공시 안내',
      '진비즈 매니지먼트의 서비스 허브, 다국어 운영, 결재 및 감사로그 기준을 정리한 운영 구조 공시입니다.',
      '본 공시는 JINBIZ MANAGEMENT의 운영 기준을 외부 이해관계자에게 명확히 안내하기 위한 자료입니다. 서비스 등록 기반 확장 구조, 다국어 공개 정책, 결재 및 감사로그 운영 원칙, WBS 중심 실행 체계와 평가 근거 데이터 축적 원칙을 포함합니다.',
      'jinbiz-governance-and-operations-update-2026',
      'JINBIZ MANAGEMENT 운영 구조 및 거버넌스 공시',
      '서비스 허브, 다국어 운영, 결재 및 감사로그 기준에 대한 운영 구조 공시',
      'published',
      TIMESTAMPTZ '2026-03-28 10:30:00+09'
    ),
    (
      'jinbiz-newsroom-service-maintenance-2026-04',
      '뉴스레터 및 문의 시스템 점검 안내',
      '뉴스레터와 문의 시스템의 안정성 향상을 위한 정기 점검 일정을 안내드립니다.',
      '보다 안정적인 뉴스레터 아카이브 제공과 문의 처리 품질 개선을 위해 정기 점검을 진행합니다. 점검 시간 동안 일부 페이지 접근이나 문의 접수가 일시적으로 지연될 수 있으며, 접수된 문의는 점검 종료 후 순차적으로 정상 처리됩니다.',
      'jinbiz-newsroom-service-maintenance-2026-04',
      '뉴스레터 및 문의 시스템 점검 안내',
      '뉴스레터 아카이브와 문의 처리 시스템 정기 점검 안내',
      'published',
      TIMESTAMPTZ '2026-03-29 08:00:00+09'
    )
) AS seed(post_slug, title, summary, body, slug, seo_title, seo_description, status, published_at)
  ON np.slug = seed.post_slug
ON CONFLICT (news_post_id, locale) DO UPDATE
SET title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    body = EXCLUDED.body,
    slug = EXCLUDED.slug,
    seo_title = EXCLUDED.seo_title,
    seo_description = EXCLUDED.seo_description,
    status = EXCLUDED.status,
    published_at = EXCLUDED.published_at,
    updated_at = NOW();

-- ------------------------------------------------------------
-- 3) published secondary locales
-- en / ja / fr / es
-- ------------------------------------------------------------
INSERT INTO news_post_translations (
  news_post_id,
  locale,
  title,
  summary,
  body,
  slug,
  seo_title,
  seo_description,
  status,
  published_at
)
SELECT
  np.id,
  'en',
  seed.title,
  seed.summary,
  seed.body,
  seed.slug,
  seed.seo_title,
  seed.seo_description,
  'published',
  seed.published_at
FROM news_posts np
JOIN (
  VALUES
    (
      'jinbiz-ai-corporate-site-launch',
      'JINBIZ MANAGEMENT officially launches its AI corporate website',
      'JINBIZ MANAGEMENT has officially launched its AI-focused corporate website and ERP-based operations foundation.',
      'JINBIZ MANAGEMENT has officially launched a corporate website focused on AI services and platform business. The release includes Home, Company, Business, Newsletter, and Contact pages, along with a multilingual publishing structure. It also introduces the operational foundation for the internal ERP, including the service hub, project and WBS workflow, daily report and daily log flow, approvals, and evidence-based evaluation records.',
      'jinbiz-ai-corporate-site-launch-en',
      'JINBIZ MANAGEMENT launches AI corporate website',
      'Official launch news for the corporate AI website and ERP operations foundation',
      TIMESTAMPTZ '2026-03-27 09:00:00+09'
    ),
    (
      'jinbiz-governance-and-operations-update-2026',
      'JINBIZ MANAGEMENT governance and operations disclosure update',
      'This disclosure outlines the service hub, multilingual operations, approval workflow, and audit-log standards of JINBIZ MANAGEMENT.',
      'This disclosure is intended to clearly explain the operating standards of JINBIZ MANAGEMENT to external stakeholders. It covers the service-registration-based expansion model, multilingual publishing policy, approval and audit-log operating standards, and the WBS-centered execution and evidence-based evaluation principles.',
      'jinbiz-governance-and-operations-update-2026-en',
      'JINBIZ MANAGEMENT governance and operations disclosure',
      'Disclosure covering the service hub, multilingual operations, approvals, and audit-log standards',
      TIMESTAMPTZ '2026-03-28 10:30:00+09'
    ),
    (
      'jinbiz-newsroom-service-maintenance-2026-04',
      'Scheduled maintenance notice for the newsletter and contact system',
      'We are sharing the regular maintenance schedule for improving the stability of the newsletter and contact system.',
      'Regular maintenance will be performed to improve the stability of the newsletter archive and the quality of inquiry handling. During the maintenance window, access to some pages or inquiry submission may be delayed temporarily. Submitted inquiries will be processed normally in sequence after the maintenance is completed.',
      'jinbiz-newsroom-service-maintenance-2026-04-en',
      'Newsletter and contact system maintenance notice',
      'Regular maintenance notice for the newsletter archive and inquiry handling system',
      TIMESTAMPTZ '2026-03-29 08:00:00+09'
    )
) AS seed(post_slug, title, summary, body, slug, seo_title, seo_description, published_at)
  ON np.slug = seed.post_slug
ON CONFLICT (news_post_id, locale) DO UPDATE
SET title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    body = EXCLUDED.body,
    slug = EXCLUDED.slug,
    seo_title = EXCLUDED.seo_title,
    seo_description = EXCLUDED.seo_description,
    status = EXCLUDED.status,
    published_at = EXCLUDED.published_at,
    updated_at = NOW();

INSERT INTO news_post_translations (
  news_post_id,
  locale,
  title,
  summary,
  body,
  slug,
  seo_title,
  seo_description,
  status,
  published_at
)
SELECT
  np.id,
  'ja',
  seed.title,
  seed.summary,
  seed.body,
  seed.slug,
  seed.seo_title,
  seed.seo_description,
  'published',
  seed.published_at
FROM news_posts np
JOIN (
  VALUES
    (
      'jinbiz-ai-corporate-site-launch',
      'JINBIZ MANAGEMENT、AIサービス企業ホームページを正式公開',
      'JINBIZ MANAGEMENTが会社紹介型AIサービス企業ホームページとERP運営基盤を正式に公開しました。',
      'JINBIZ MANAGEMENTは、AIサービスとプラットフォーム事業を中心とする会社紹介型ホームページを正式公開しました。今回の公開では、メインホーム、会社紹介、事業紹介、ニュースレター、お問い合わせ構成に加え、多言語公開運営の基本基盤も含まれます。さらに、内部運営のためのERP基盤として、サービスハブ、プロジェクト/WBS、業務報告/業務日誌、承認、評価根拠データ構造も用意しました。',
      'jinbiz-ai-corporate-site-launch-ja',
      'JINBIZ MANAGEMENT AIサービス企業ホームページ正式公開',
      '会社紹介型AIサービス企業ホームページとERP運営基盤の公開ニュース',
      TIMESTAMPTZ '2026-03-27 09:00:00+09'
    ),
    (
      'jinbiz-governance-and-operations-update-2026',
      'JINBIZ MANAGEMENT 運営構造およびガバナンス公示案内',
      'サービスハブ、多言語運営、承認および監査ログ基準をまとめた運営構造公示です。',
      '本公示は、JINBIZ MANAGEMENTの運営基準を外部関係者に明確に案内するための資料です。サービス登録ベースの拡張構造、多言語公開方針、承認および監査ログ運営原則、WBS中心の実行体制と評価根拠データの蓄積原則を含みます。',
      'jinbiz-governance-and-operations-update-2026-ja',
      'JINBIZ MANAGEMENT 運営構造およびガバナンス公示',
      'サービスハブ、多言語運営、承認および監査ログ基準に関する公示',
      TIMESTAMPTZ '2026-03-28 10:30:00+09'
    ),
    (
      'jinbiz-newsroom-service-maintenance-2026-04',
      'ニュースレターおよびお問い合わせシステム点検のご案内',
      'ニュースレターとお問い合わせシステムの安定性向上のため、定期点検日程をご案内します。',
      'より安定したニュースレターアーカイブ提供とお問い合わせ処理品質向上のため、定期点検を実施します。点検時間中は一部ページアクセスやお問い合わせ受付が一時的に遅延する場合がありますが、受付済みのお問い合わせは点検終了後に順次正常処理されます。',
      'jinbiz-newsroom-service-maintenance-2026-04-ja',
      'ニュースレターおよびお問い合わせシステム点検案内',
      'ニュースレターアーカイブとお問い合わせ処理システムの定期点検案内',
      TIMESTAMPTZ '2026-03-29 08:00:00+09'
    )
) AS seed(post_slug, title, summary, body, slug, seo_title, seo_description, published_at)
  ON np.slug = seed.post_slug
ON CONFLICT (news_post_id, locale) DO UPDATE
SET title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    body = EXCLUDED.body,
    slug = EXCLUDED.slug,
    seo_title = EXCLUDED.seo_title,
    seo_description = EXCLUDED.seo_description,
    status = EXCLUDED.status,
    published_at = EXCLUDED.published_at,
    updated_at = NOW();

INSERT INTO news_post_translations (
  news_post_id,
  locale,
  title,
  summary,
  body,
  slug,
  seo_title,
  seo_description,
  status,
  published_at
)
SELECT
  np.id,
  'fr',
  seed.title,
  seed.summary,
  seed.body,
  seed.slug,
  seed.seo_title,
  seed.seo_description,
  'published',
  seed.published_at
FROM news_posts np
JOIN (
  VALUES
    (
      'jinbiz-ai-corporate-site-launch',
      'JINBIZ MANAGEMENT lance officiellement son site corporate dédié aux services IA',
      'JINBIZ MANAGEMENT a officiellement lancé son site corporate orienté services IA ainsi que sa base d’exploitation ERP.',
      'JINBIZ MANAGEMENT a officiellement lancé un site corporate centré sur les services IA et l’activité plateforme. Cette publication comprend les pages Accueil, Société, Activités, Newsletter et Contact, ainsi qu’une structure de publication multilingue. Elle prépare également la base ERP interne comprenant le service hub, le flux projet/WBS, les rapports quotidiens, les validations et les données de preuve pour l’évaluation.',
      'jinbiz-ai-corporate-site-launch-fr',
      'Lancement officiel du site corporate IA de JINBIZ MANAGEMENT',
      'Annonce officielle du lancement du site corporate IA et de la base ERP',
      TIMESTAMPTZ '2026-03-27 09:00:00+09'
    ),
    (
      'jinbiz-governance-and-operations-update-2026',
      'Annonce de gouvernance et de structure opérationnelle de JINBIZ MANAGEMENT',
      'Cette publication présente le service hub, l’exploitation multilingue, le workflow d’approbation et les standards d’audit de JINBIZ MANAGEMENT.',
      'Cette publication vise à expliquer clairement les standards de fonctionnement de JINBIZ MANAGEMENT aux parties prenantes externes. Elle couvre le modèle d’extension basé sur l’enregistrement de services, la politique de publication multilingue, les principes d’approbation et d’audit, ainsi que l’exécution centrée sur le WBS et les preuves d’évaluation.',
      'jinbiz-governance-and-operations-update-2026-fr',
      'Publication de gouvernance et d’exploitation de JINBIZ MANAGEMENT',
      'Publication sur le service hub, l’exploitation multilingue, les validations et les journaux d’audit',
      TIMESTAMPTZ '2026-03-28 10:30:00+09'
    ),
    (
      'jinbiz-newsroom-service-maintenance-2026-04',
      'Avis de maintenance du système de newsletter et de contact',
      'Nous partageons le calendrier de maintenance régulière visant à améliorer la stabilité du système de newsletter et de contact.',
      'Une maintenance régulière sera réalisée afin d’améliorer la stabilité de l’archive newsletter et la qualité du traitement des demandes. Pendant la maintenance, l’accès à certaines pages ou l’envoi des demandes peut être temporairement ralenti. Les demandes déjà reçues seront traitées normalement après la fin de la maintenance.',
      'jinbiz-newsroom-service-maintenance-2026-04-fr',
      'Avis de maintenance du système de newsletter et de contact',
      'Avis de maintenance régulière pour l’archive newsletter et le système de contact',
      TIMESTAMPTZ '2026-03-29 08:00:00+09'
    )
) AS seed(post_slug, title, summary, body, slug, seo_title, seo_description, published_at)
  ON np.slug = seed.post_slug
ON CONFLICT (news_post_id, locale) DO UPDATE
SET title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    body = EXCLUDED.body,
    slug = EXCLUDED.slug,
    seo_title = EXCLUDED.seo_title,
    seo_description = EXCLUDED.seo_description,
    status = EXCLUDED.status,
    published_at = EXCLUDED.published_at,
    updated_at = NOW();

INSERT INTO news_post_translations (
  news_post_id,
  locale,
  title,
  summary,
  body,
  slug,
  seo_title,
  seo_description,
  status,
  published_at
)
SELECT
  np.id,
  'es',
  seed.title,
  seed.summary,
  seed.body,
  seed.slug,
  seed.seo_title,
  seed.seo_description,
  'published',
  seed.published_at
FROM news_posts np
JOIN (
  VALUES
    (
      'jinbiz-ai-corporate-site-launch',
      'JINBIZ MANAGEMENT lanza oficialmente su sitio corporativo de servicios de IA',
      'JINBIZ MANAGEMENT ha lanzado oficialmente su sitio corporativo orientado a servicios de IA y su base operativa ERP.',
      'JINBIZ MANAGEMENT ha lanzado oficialmente un sitio corporativo centrado en servicios de IA y negocio de plataformas. El lanzamiento incluye Inicio, Empresa, Negocio, Newsletter y Contacto, junto con una estructura de publicación multilingüe. También establece la base operativa del ERP interno, incluido el service hub, el flujo de proyectos y WBS, los reportes diarios, las aprobaciones y los datos de evidencia para evaluación.',
      'jinbiz-ai-corporate-site-launch-es',
      'Lanzamiento oficial del sitio corporativo IA de JINBIZ MANAGEMENT',
      'Noticia oficial del lanzamiento del sitio corporativo IA y de la base ERP',
      TIMESTAMPTZ '2026-03-27 09:00:00+09'
    ),
    (
      'jinbiz-governance-and-operations-update-2026',
      'Aviso de gobernanza y estructura operativa de JINBIZ MANAGEMENT',
      'Esta divulgación resume el service hub, la operación multilingüe, los flujos de aprobación y los estándares de auditoría de JINBIZ MANAGEMENT.',
      'Esta divulgación tiene como objetivo explicar claramente los estándares operativos de JINBIZ MANAGEMENT a las partes interesadas externas. Incluye el modelo de expansión basado en registro de servicios, la política de publicación multilingüe, los principios de aprobación y auditoría, así como la ejecución centrada en WBS y la acumulación de evidencias para evaluación.',
      'jinbiz-governance-and-operations-update-2026-es',
      'Divulgación de gobernanza y operación de JINBIZ MANAGEMENT',
      'Divulgación sobre el service hub, la operación multilingüe, aprobaciones y registros de auditoría',
      TIMESTAMPTZ '2026-03-28 10:30:00+09'
    ),
    (
      'jinbiz-newsroom-service-maintenance-2026-04',
      'Aviso de mantenimiento del sistema de newsletter y contacto',
      'Compartimos el calendario de mantenimiento periódico para mejorar la estabilidad del sistema de newsletter y contacto.',
      'Se realizará un mantenimiento periódico para mejorar la estabilidad del archivo de newsletter y la calidad del procesamiento de consultas. Durante la ventana de mantenimiento, el acceso a algunas páginas o el envío de consultas puede retrasarse temporalmente. Las consultas recibidas serán procesadas normalmente una vez finalizado el mantenimiento.',
      'jinbiz-newsroom-service-maintenance-2026-04-es',
      'Aviso de mantenimiento del sistema de newsletter y contacto',
      'Aviso de mantenimiento periódico para el archivo de newsletter y el sistema de contacto',
      TIMESTAMPTZ '2026-03-29 08:00:00+09'
    )
) AS seed(post_slug, title, summary, body, slug, seo_title, seo_description, published_at)
  ON np.slug = seed.post_slug
ON CONFLICT (news_post_id, locale) DO UPDATE
SET title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    body = EXCLUDED.body,
    slug = EXCLUDED.slug,
    seo_title = EXCLUDED.seo_title,
    seo_description = EXCLUDED.seo_description,
    status = EXCLUDED.status,
    published_at = EXCLUDED.published_at,
    updated_at = NOW();

COMMIT;