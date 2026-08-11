-- departments.sql
-- JINBIZ departments seed
--
-- Purpose:
--   - seed the baseline organization tree for the latest split migrations
--   - align strictly with 001_core_org_auth.sql
--   - remain idempotent and production-safe
--
-- Notes:
--   - This file targets the latest departments schema only.
--   - Seed responsibility stays in db/seeds/*, not db/migrations/*.

BEGIN;

-- ------------------------------------------------------------
-- 1) baseline departments
-- latest schema:
--   departments(
--     id, code, name, parent_id, sort_order, is_active, created_at, updated_at
--   )
-- ------------------------------------------------------------
INSERT INTO departments (code, name, sort_order, is_active)
VALUES
  ('mgmt-hq', '경영관리본부', 0, TRUE),
  ('brand-strategy', '브랜드전략팀', 10, TRUE),
  ('platform-biz', '플랫폼사업팀', 20, TRUE),
  ('service-ops', '서비스운영팀', 30, TRUE),
  ('planning-pm', '기획PM팀', 40, TRUE),
  ('frontend', '프론트엔드팀', 50, TRUE),
  ('backend-infra', '백엔드인프라팀', 60, TRUE),
  ('ai-data', 'AI데이터팀', 70, TRUE),
  ('contents-ops', '운영콘텐츠팀', 80, TRUE),
  ('finance-hr', '재무인사팀', 90, TRUE),
  ('management-support', '경영지원팀', 100, TRUE)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------
-- 2) parent-child hierarchy
-- root:
--   mgmt-hq
-- children:
--   all operating departments
-- ------------------------------------------------------------
UPDATE departments child
SET parent_id = root.id
FROM departments root
WHERE root.code = 'mgmt-hq'
  AND child.code IN (
    'brand-strategy',
    'platform-biz',
    'service-ops',
    'planning-pm',
    'frontend',
    'backend-infra',
    'ai-data',
    'contents-ops',
    'finance-hr',
    'management-support'
  )
  AND child.parent_id IS DISTINCT FROM root.id;

-- ------------------------------------------------------------
-- 3) ensure root has no parent
-- ------------------------------------------------------------
UPDATE departments
SET parent_id = NULL
WHERE code = 'mgmt-hq'
  AND parent_id IS NOT NULL;

COMMIT;