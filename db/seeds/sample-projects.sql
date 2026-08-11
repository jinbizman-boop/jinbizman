-- sample-projects.sql
-- JINBIZ sample projects / WBS / daily work seed
--
-- Purpose:
--   - seed sample data for the latest 004_projects_wbs.sql + 005_daily_reports_logs.sql
--   - align strictly with the split migration structure
--   - remain idempotent and production-safe
--
-- Notes:
--   - This file assumes 001_core_org_auth.sql, 002_service_hub.sql,
--     004_projects_wbs.sql, 005_daily_reports_logs.sql already ran.
--   - All daily report/log items are linked to WBS tasks in the same project.
--   - Submitted reports/logs are created together with at least one item in the same transaction.

BEGIN;

-- ------------------------------------------------------------
-- 0) references
-- ------------------------------------------------------------
CREATE TEMP TABLE IF NOT EXISTS _seed_refs ON COMMIT DROP AS
SELECT
  (SELECT id FROM users WHERE email = 'admin@jinbizman.com' LIMIT 1) AS admin_user_id,
  COALESCE(
    (SELECT id FROM users WHERE email = 'pm@jinbizman.com' LIMIT 1),
    (SELECT id FROM users WHERE email = 'admin@jinbizman.com' LIMIT 1)
  ) AS pm_user_id,
  COALESCE(
    (SELECT id FROM users WHERE email = 'frontend@jinbizman.com' LIMIT 1),
    (SELECT id FROM users WHERE email = 'admin@jinbizman.com' LIMIT 1)
  ) AS frontend_user_id,
  COALESCE(
    (SELECT id FROM users WHERE email = 'backend@jinbizman.com' LIMIT 1),
    (SELECT id FROM users WHERE email = 'admin@jinbizman.com' LIMIT 1)
  ) AS backend_user_id,
  (SELECT id FROM services WHERE service_code = 'jinbiz-main' LIMIT 1) AS service_main_id,
  (SELECT id FROM services WHERE service_code = 'eureka-world' LIMIT 1) AS service_eureka_id,
  (SELECT id FROM services WHERE service_code = 'strategy-sim' LIMIT 1) AS service_strategy_id;

-- ------------------------------------------------------------
-- 1) projects
-- latest schema:
--   code, name, project_type, service_id, status, owner_user_id,
--   start_date, end_date, description
-- ------------------------------------------------------------
INSERT INTO projects (
  code,
  name,
  project_type,
  service_id,
  status,
  owner_user_id,
  start_date,
  end_date,
  description
)
SELECT *
FROM (
  SELECT
    'PRJ-2026-HOMEPAGE',
    '진비즈 공식 홈페이지 1차 공개 구축',
    'website',
    service_main_id,
    'active',
    pm_user_id,
    DATE '2026-03-01',
    DATE '2026-04-15',
    '외부 회사소개형 AI 서비스 홈페이지 1차 공개 구축 프로젝트'
  FROM _seed_refs

  UNION ALL

  SELECT
    'PRJ-2026-ERP-HUB',
    'ERP 서비스 허브 1차 구축',
    'erp',
    NULL::BIGINT,
    'active',
    pm_user_id,
    DATE '2026-03-05',
    DATE '2026-05-10',
    '서비스 허브, 프로젝트/WBS, 업무보고/일지, 결재 기초를 구축하는 ERP 프로젝트'
  FROM _seed_refs

  UNION ALL

  SELECT
    'PRJ-2026-EUREKA-LAUNCH',
    '유레카월드 공개 준비',
    'platform',
    service_eureka_id,
    'planned',
    pm_user_id,
    DATE '2026-04-01',
    DATE '2026-06-20',
    '대표 AI 서비스 유레카월드의 공개 범위, 다국어, 운영 준비 프로젝트'
  FROM _seed_refs

  UNION ALL

  SELECT
    'PRJ-2026-STRATEGY-PILOT',
    '전략 시뮬레이션 플랫폼 파일럿',
    'platform',
    service_strategy_id,
    'paused',
    pm_user_id,
    DATE '2026-02-10',
    DATE '2026-04-30',
    '전략 지원 시뮬레이션 플랫폼의 초기 파일럿 프로젝트'
  FROM _seed_refs
) seeded_projects
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    project_type = EXCLUDED.project_type,
    service_id = EXCLUDED.service_id,
    status = EXCLUDED.status,
    owner_user_id = EXCLUDED.owner_user_id,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ------------------------------------------------------------
-- 2) project_members
-- ------------------------------------------------------------
INSERT INTO project_members (project_id, user_id, role_in_project)
SELECT p.id, r.user_id, r.role_in_project
FROM (
  SELECT 'PRJ-2026-HOMEPAGE' AS project_code, (SELECT pm_user_id FROM _seed_refs) AS user_id, 'pm' AS role_in_project
  UNION ALL
  SELECT 'PRJ-2026-HOMEPAGE', (SELECT frontend_user_id FROM _seed_refs), 'frontend'
  UNION ALL
  SELECT 'PRJ-2026-HOMEPAGE', (SELECT backend_user_id FROM _seed_refs), 'backend'
  UNION ALL
  SELECT 'PRJ-2026-ERP-HUB', (SELECT pm_user_id FROM _seed_refs), 'pm'
  UNION ALL
  SELECT 'PRJ-2026-ERP-HUB', (SELECT backend_user_id FROM _seed_refs), 'backend'
  UNION ALL
  SELECT 'PRJ-2026-EUREKA-LAUNCH', (SELECT admin_user_id FROM _seed_refs), 'ops'
) r
JOIN projects p
  ON p.code = r.project_code
WHERE r.user_id IS NOT NULL
ON CONFLICT (project_id, user_id) DO UPDATE
SET role_in_project = EXCLUDED.role_in_project;

-- ------------------------------------------------------------
-- 3) wbs_templates
-- ------------------------------------------------------------
INSERT INTO wbs_templates (
  code,
  name,
  job_family,
  work_style,
  is_active,
  schema_json
)
VALUES
  ('TPL_PM_MILESTONE', 'PM 마일스톤 템플릿', 'planning', 'PM_MILESTONE', TRUE, '{"goal":"milestone","requiredFields":["title","dueDate","assignee"]}'::jsonb),
  ('TPL_FE_DEV', '프론트엔드 구현 템플릿', 'frontend', 'FE_DEV', TRUE, '{"goal":"implementation","requiredFields":["title","dueDate","assignee","qa"]}'::jsonb),
  ('TPL_BE_API', '백엔드 API 템플릿', 'backend', 'BE_API', TRUE, '{"goal":"api","requiredFields":["title","dueDate","assignee","deployment"]}'::jsonb),
  ('TPL_OPS_SLA', '운영/SLA 템플릿', 'operations', 'OPS_SLA', TRUE, '{"goal":"operations","requiredFields":["title","dueDate","assignee","sla"]}'::jsonb)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    job_family = EXCLUDED.job_family,
    work_style = EXCLUDED.work_style,
    is_active = EXCLUDED.is_active,
    schema_json = EXCLUDED.schema_json,
    updated_at = NOW();

-- ------------------------------------------------------------
-- 4) wbs_template_items
-- ------------------------------------------------------------
DO $$
DECLARE
  v_template_id BIGINT;
  v_item_id BIGINT;
BEGIN
  -- TPL_PM_MILESTONE
  SELECT id INTO v_template_id FROM wbs_templates WHERE code = 'TPL_PM_MILESTONE' LIMIT 1;
  IF v_template_id IS NOT NULL THEN
    SELECT id INTO v_item_id FROM wbs_template_items WHERE template_id = v_template_id AND title = '프로젝트 킥오프 및 목표 정의' LIMIT 1;
    IF v_item_id IS NULL THEN
      INSERT INTO wbs_template_items (
        template_id, title, description, task_type, sort_order,
        default_job_family, default_work_style, default_priority,
        default_weight, default_start_offset_days, default_due_offset_days,
        requires_approval, metadata_json
      ) VALUES (
        v_template_id, '프로젝트 킥오프 및 목표 정의', '목표/범위/일정/책임을 정리하는 마일스톤',
        'milestone', 1, 'planning', 'PM_MILESTONE', 'high',
        20.00, 0, 7, FALSE, '{"phase":"kickoff"}'::jsonb
      );
    ELSE
      UPDATE wbs_template_items
      SET description = '목표/범위/일정/책임을 정리하는 마일스톤',
          task_type = 'milestone',
          sort_order = 1,
          default_job_family = 'planning',
          default_work_style = 'PM_MILESTONE',
          default_priority = 'high',
          default_weight = 20.00,
          default_start_offset_days = 0,
          default_due_offset_days = 7,
          requires_approval = FALSE,
          metadata_json = '{"phase":"kickoff"}'::jsonb,
          updated_at = NOW()
      WHERE id = v_item_id;
    END IF;
  END IF;

  -- TPL_FE_DEV
  SELECT id INTO v_template_id FROM wbs_templates WHERE code = 'TPL_FE_DEV' LIMIT 1;
  IF v_template_id IS NOT NULL THEN
    SELECT id INTO v_item_id FROM wbs_template_items WHERE template_id = v_template_id AND title = '반응형 화면 구현' LIMIT 1;
    IF v_item_id IS NULL THEN
      INSERT INTO wbs_template_items (
        template_id, title, description, task_type, sort_order,
        default_job_family, default_work_style, default_priority,
        default_weight, default_start_offset_days, default_due_offset_days,
        requires_approval, metadata_json
      ) VALUES (
        v_template_id, '반응형 화면 구현', '반응형 레이아웃과 컴포넌트를 구현하는 작업',
        'task', 1, 'frontend', 'FE_DEV', 'high',
        15.00, 0, 14, FALSE, '{"phase":"implementation"}'::jsonb
      );
    ELSE
      UPDATE wbs_template_items
      SET description = '반응형 레이아웃과 컴포넌트를 구현하는 작업',
          task_type = 'task',
          sort_order = 1,
          default_job_family = 'frontend',
          default_work_style = 'FE_DEV',
          default_priority = 'high',
          default_weight = 15.00,
          default_start_offset_days = 0,
          default_due_offset_days = 14,
          requires_approval = FALSE,
          metadata_json = '{"phase":"implementation"}'::jsonb,
          updated_at = NOW()
      WHERE id = v_item_id;
    END IF;
  END IF;

  -- TPL_BE_API
  SELECT id INTO v_template_id FROM wbs_templates WHERE code = 'TPL_BE_API' LIMIT 1;
  IF v_template_id IS NOT NULL THEN
    SELECT id INTO v_item_id FROM wbs_template_items WHERE template_id = v_template_id AND title = '공개/관리자 API 구현' LIMIT 1;
    IF v_item_id IS NULL THEN
      INSERT INTO wbs_template_items (
        template_id, title, description, task_type, sort_order,
        default_job_family, default_work_style, default_priority,
        default_weight, default_start_offset_days, default_due_offset_days,
        requires_approval, metadata_json
      ) VALUES (
        v_template_id, '공개/관리자 API 구현', '공개/관리자 API를 구현하는 작업',
        'task', 1, 'backend', 'BE_API', 'high',
        18.00, 0, 14, FALSE, '{"phase":"api"}'::jsonb
      );
    ELSE
      UPDATE wbs_template_items
      SET description = '공개/관리자 API를 구현하는 작업',
          task_type = 'task',
          sort_order = 1,
          default_job_family = 'backend',
          default_work_style = 'BE_API',
          default_priority = 'high',
          default_weight = 18.00,
          default_start_offset_days = 0,
          default_due_offset_days = 14,
          requires_approval = FALSE,
          metadata_json = '{"phase":"api"}'::jsonb,
          updated_at = NOW()
      WHERE id = v_item_id;
    END IF;
  END IF;

  -- TPL_OPS_SLA
  SELECT id INTO v_template_id FROM wbs_templates WHERE code = 'TPL_OPS_SLA' LIMIT 1;
  IF v_template_id IS NOT NULL THEN
    SELECT id INTO v_item_id FROM wbs_template_items WHERE template_id = v_template_id AND title = '공개 승인 및 운영 체크' LIMIT 1;
    IF v_item_id IS NULL THEN
      INSERT INTO wbs_template_items (
        template_id, title, description, task_type, sort_order,
        default_job_family, default_work_style, default_priority,
        default_weight, default_start_offset_days, default_due_offset_days,
        requires_approval, metadata_json
      ) VALUES (
        v_template_id, '공개 승인 및 운영 체크', '운영 관점 검수와 승인 확인 작업',
        'task', 1, 'operations', 'OPS_SLA', 'medium',
        10.00, 0, 10, TRUE, '{"phase":"operations"}'::jsonb
      );
    ELSE
      UPDATE wbs_template_items
      SET description = '운영 관점 검수와 승인 확인 작업',
          task_type = 'task',
          sort_order = 1,
          default_job_family = 'operations',
          default_work_style = 'OPS_SLA',
          default_priority = 'medium',
          default_weight = 10.00,
          default_start_offset_days = 0,
          default_due_offset_days = 10,
          requires_approval = TRUE,
          metadata_json = '{"phase":"operations"}'::jsonb,
          updated_at = NOW()
      WHERE id = v_item_id;
    END IF;
  END IF;
END $$;

-- ------------------------------------------------------------
-- 5) wbs_tasks
-- ------------------------------------------------------------
DO $$
DECLARE
  v_project_id BIGINT;
  v_template_id BIGINT;
  v_template_item_id BIGINT;
  v_task_id BIGINT;
  v_assignee BIGINT;
  v_reviewer BIGINT;
  v_approver BIGINT;
BEGIN
  -- helper tasks for HOMEPAGE
  SELECT id INTO v_project_id FROM projects WHERE code = 'PRJ-2026-HOMEPAGE' LIMIT 1;
  IF v_project_id IS NOT NULL THEN
    SELECT id INTO v_reviewer FROM _seed_refs;
    v_reviewer := (SELECT admin_user_id FROM _seed_refs);

    -- 정보구조 및 섹션 정의 확정
    SELECT id INTO v_template_id FROM wbs_templates WHERE code = 'TPL_PM_MILESTONE' LIMIT 1;
    SELECT id INTO v_template_item_id
    FROM wbs_template_items
    WHERE template_id = v_template_id AND title = '프로젝트 킥오프 및 목표 정의'
    LIMIT 1;
    v_assignee := (SELECT pm_user_id FROM _seed_refs);

    SELECT id INTO v_task_id FROM wbs_tasks WHERE project_id = v_project_id AND title = '정보구조 및 섹션 정의 확정' LIMIT 1;
    IF v_task_id IS NULL THEN
      INSERT INTO wbs_tasks (
        project_id, template_id, template_item_id,
        title, description, task_type, job_family, work_style,
        assignee_user_id, reviewer_user_id,
        start_date, due_date, planned_progress, actual_progress,
        priority, status, weight, requires_approval,
        output_url, qa_status, deploy_status
      ) VALUES (
        v_project_id, v_template_id, v_template_item_id,
        '정보구조 및 섹션 정의 확정',
        '외부 홈페이지 5개 메뉴와 섹션 구조, 뉴스레터 3탭, 다국어 공개 범위를 확정합니다.',
        'task', 'planning', 'PM_MILESTONE',
        v_assignee, v_reviewer,
        DATE '2026-03-01', DATE '2026-03-08', 100, 100,
        'high', 'done', 15.00, FALSE,
        '', 'passed', 'not_applicable'
      );
    ELSE
      UPDATE wbs_tasks
      SET template_id = v_template_id,
          template_item_id = v_template_item_id,
          description = '외부 홈페이지 5개 메뉴와 섹션 구조, 뉴스레터 3탭, 다국어 공개 범위를 확정합니다.',
          task_type = 'task',
          job_family = 'planning',
          work_style = 'PM_MILESTONE',
          assignee_user_id = v_assignee,
          reviewer_user_id = v_reviewer,
          start_date = DATE '2026-03-01',
          due_date = DATE '2026-03-08',
          planned_progress = 100,
          actual_progress = 100,
          priority = 'high',
          status = 'done',
          weight = 15.00,
          requires_approval = FALSE,
          output_url = '',
          qa_status = 'passed',
          deploy_status = 'not_applicable',
          updated_at = NOW()
      WHERE id = v_task_id;
    END IF;

    -- 홈페이지 반응형 디자인 시스템 적용
    SELECT id INTO v_template_id FROM wbs_templates WHERE code = 'TPL_FE_DEV' LIMIT 1;
    SELECT id INTO v_template_item_id
    FROM wbs_template_items
    WHERE template_id = v_template_id AND title = '반응형 화면 구현'
    LIMIT 1;
    v_assignee := (SELECT frontend_user_id FROM _seed_refs);

    SELECT id INTO v_task_id FROM wbs_tasks WHERE project_id = v_project_id AND title = '홈페이지 반응형 디자인 시스템 적용' LIMIT 1;
    IF v_task_id IS NULL THEN
      INSERT INTO wbs_tasks (
        project_id, template_id, template_item_id,
        title, description, task_type, job_family, work_style,
        assignee_user_id, reviewer_user_id,
        start_date, due_date, planned_progress, actual_progress,
        priority, status, weight, requires_approval,
        output_url, qa_status, deploy_status
      ) VALUES (
        v_project_id, v_template_id, v_template_item_id,
        '홈페이지 반응형 디자인 시스템 적용',
        'Corporate AI Workspace 톤의 반응형 레이아웃과 디자인 토큰을 적용합니다.',
        'task', 'frontend', 'FE_DEV',
        v_assignee, v_reviewer,
        DATE '2026-03-05', DATE '2026-03-20', 100, 80,
        'high', 'review', 12.00, FALSE,
        '', 'pending', 'not_applicable'
      );
    ELSE
      UPDATE wbs_tasks
      SET template_id = v_template_id,
          template_item_id = v_template_item_id,
          description = 'Corporate AI Workspace 톤의 반응형 레이아웃과 디자인 토큰을 적용합니다.',
          task_type = 'task',
          job_family = 'frontend',
          work_style = 'FE_DEV',
          assignee_user_id = v_assignee,
          reviewer_user_id = v_reviewer,
          start_date = DATE '2026-03-05',
          due_date = DATE '2026-03-20',
          planned_progress = 100,
          actual_progress = 80,
          priority = 'high',
          status = 'review',
          weight = 12.00,
          requires_approval = FALSE,
          output_url = '',
          qa_status = 'pending',
          deploy_status = 'not_applicable',
          updated_at = NOW()
      WHERE id = v_task_id;
    END IF;

    -- 뉴스 및 문의 Public API 연결
    SELECT id INTO v_template_id FROM wbs_templates WHERE code = 'TPL_BE_API' LIMIT 1;
    SELECT id INTO v_template_item_id
    FROM wbs_template_items
    WHERE template_id = v_template_id AND title = '공개/관리자 API 구현'
    LIMIT 1;
    v_assignee := (SELECT backend_user_id FROM _seed_refs);

    SELECT id INTO v_task_id FROM wbs_tasks WHERE project_id = v_project_id AND title = '뉴스 및 문의 Public API 연결' LIMIT 1;
    IF v_task_id IS NULL THEN
      INSERT INTO wbs_tasks (
        project_id, template_id, template_item_id,
        title, description, task_type, job_family, work_style,
        assignee_user_id, reviewer_user_id,
        start_date, due_date, planned_progress, actual_progress,
        priority, status, weight, requires_approval,
        output_url, qa_status, deploy_status
      ) VALUES (
        v_project_id, v_template_id, v_template_item_id,
        '뉴스 및 문의 Public API 연결',
        '뉴스레터 리스트/상세와 문의 저장 API를 외부 페이지에 연결합니다.',
        'task', 'backend', 'BE_API',
        v_assignee, v_reviewer,
        DATE '2026-03-08', DATE '2026-03-26', 100, 55,
        'high', 'in_progress', 18.00, FALSE,
        'https://www.jinbizman.com/newsletter', 'pending', 'ready'
      );
    ELSE
      UPDATE wbs_tasks
      SET template_id = v_template_id,
          template_item_id = v_template_item_id,
          description = '뉴스레터 리스트/상세와 문의 저장 API를 외부 페이지에 연결합니다.',
          task_type = 'task',
          job_family = 'backend',
          work_style = 'BE_API',
          assignee_user_id = v_assignee,
          reviewer_user_id = v_reviewer,
          start_date = DATE '2026-03-08',
          due_date = DATE '2026-03-26',
          planned_progress = 100,
          actual_progress = 55,
          priority = 'high',
          status = 'in_progress',
          weight = 18.00,
          requires_approval = FALSE,
          output_url = 'https://www.jinbizman.com/newsletter',
          qa_status = 'pending',
          deploy_status = 'ready',
          updated_at = NOW()
      WHERE id = v_task_id;
    END IF;

    -- 1차 공개 승인 및 게시
    SELECT id INTO v_template_id FROM wbs_templates WHERE code = 'TPL_OPS_SLA' LIMIT 1;
    SELECT id INTO v_template_item_id
    FROM wbs_template_items
    WHERE template_id = v_template_id AND title = '공개 승인 및 운영 체크'
    LIMIT 1;
    v_assignee := (SELECT admin_user_id FROM _seed_refs);
    v_approver := (SELECT admin_user_id FROM _seed_refs);

    SELECT id INTO v_task_id FROM wbs_tasks WHERE project_id = v_project_id AND title = '1차 공개 승인 및 게시' LIMIT 1;
    IF v_task_id IS NULL THEN
      INSERT INTO wbs_tasks (
        project_id, template_id, template_item_id,
        title, description, task_type, job_family, work_style,
        assignee_user_id, reviewer_user_id, approver_user_id,
        start_date, due_date, planned_progress, actual_progress,
        priority, status, weight, requires_approval,
        output_url, qa_status, deploy_status
      ) VALUES (
        v_project_id, v_template_id, v_template_item_id,
        '1차 공개 승인 및 게시',
        '도메인, 공개 범위, 번역 상태, 게시 승인 조건을 최종 검토합니다.',
        'task', 'operations', 'OPS_SLA',
        v_assignee, v_reviewer, v_approver,
        DATE '2026-03-20', DATE '2026-03-30', 100, 90,
        'high', 'approval_wait', 10.00, TRUE,
        '', 'pending', 'ready'
      );
    ELSE
      UPDATE wbs_tasks
      SET template_id = v_template_id,
          template_item_id = v_template_item_id,
          description = '도메인, 공개 범위, 번역 상태, 게시 승인 조건을 최종 검토합니다.',
          task_type = 'task',
          job_family = 'operations',
          work_style = 'OPS_SLA',
          assignee_user_id = v_assignee,
          reviewer_user_id = v_reviewer,
          approver_user_id = v_approver,
          start_date = DATE '2026-03-20',
          due_date = DATE '2026-03-30',
          planned_progress = 100,
          actual_progress = 90,
          priority = 'high',
          status = 'approval_wait',
          weight = 10.00,
          requires_approval = TRUE,
          output_url = '',
          qa_status = 'pending',
          deploy_status = 'ready',
          updated_at = NOW()
      WHERE id = v_task_id;
    END IF;
  END IF;

  -- ERP HUB tasks
  SELECT id INTO v_project_id FROM projects WHERE code = 'PRJ-2026-ERP-HUB' LIMIT 1;
  IF v_project_id IS NOT NULL THEN
    v_reviewer := (SELECT admin_user_id FROM _seed_refs);

    -- 서비스 허브 기본 등록/조회 구현
    SELECT id INTO v_template_id FROM wbs_templates WHERE code = 'TPL_BE_API' LIMIT 1;
    SELECT id INTO v_template_item_id
    FROM wbs_template_items
    WHERE template_id = v_template_id AND title = '공개/관리자 API 구현'
    LIMIT 1;
    v_assignee := (SELECT backend_user_id FROM _seed_refs);

    SELECT id INTO v_task_id FROM wbs_tasks WHERE project_id = v_project_id AND title = '서비스 허브 기본 등록/조회 구현' LIMIT 1;
    IF v_task_id IS NULL THEN
      INSERT INTO wbs_tasks (
        project_id, template_id, template_item_id,
        title, description, task_type, job_family, work_style,
        assignee_user_id, reviewer_user_id,
        start_date, due_date, planned_progress, actual_progress,
        priority, status, weight, requires_approval,
        output_url, qa_status, deploy_status
      ) VALUES (
        v_project_id, v_template_id, v_template_item_id,
        '서비스 허브 기본 등록/조회 구현',
        '서비스 등록, 상태, 도메인, 다국어, 권한 템플릿 연결의 기본 구조를 구현합니다.',
        'task', 'backend', 'BE_API',
        v_assignee, v_reviewer,
        DATE '2026-03-05', DATE '2026-03-28', 100, 60,
        'high', 'in_progress', 16.00, FALSE,
        '', 'pending', 'ready'
      );
    ELSE
      UPDATE wbs_tasks
      SET template_id = v_template_id,
          template_item_id = v_template_item_id,
          description = '서비스 등록, 상태, 도메인, 다국어, 권한 템플릿 연결의 기본 구조를 구현합니다.',
          task_type = 'task',
          job_family = 'backend',
          work_style = 'BE_API',
          assignee_user_id = v_assignee,
          reviewer_user_id = v_reviewer,
          start_date = DATE '2026-03-05',
          due_date = DATE '2026-03-28',
          planned_progress = 100,
          actual_progress = 60,
          priority = 'high',
          status = 'in_progress',
          weight = 16.00,
          requires_approval = FALSE,
          output_url = '',
          qa_status = 'pending',
          deploy_status = 'ready',
          updated_at = NOW()
      WHERE id = v_task_id;
    END IF;

    -- WBS 기반 업무보고/일지 연결
    SELECT id INTO v_template_id FROM wbs_templates WHERE code = 'TPL_PM_MILESTONE' LIMIT 1;
    SELECT id INTO v_template_item_id
    FROM wbs_template_items
    WHERE template_id = v_template_id AND title = '프로젝트 킥오프 및 목표 정의'
    LIMIT 1;
    v_assignee := (SELECT pm_user_id FROM _seed_refs);

    SELECT id INTO v_task_id FROM wbs_tasks WHERE project_id = v_project_id AND title = 'WBS 기반 업무보고/일지 연결' LIMIT 1;
    IF v_task_id IS NULL THEN
      INSERT INTO wbs_tasks (
        project_id, template_id, template_item_id,
        title, description, task_type, job_family, work_style,
        assignee_user_id, reviewer_user_id,
        start_date, due_date, planned_progress, actual_progress,
        priority, status, weight, requires_approval,
        output_url, qa_status, deploy_status
      ) VALUES (
        v_project_id, v_template_id, v_template_item_id,
        'WBS 기반 업무보고/일지 연결',
        '모든 업무보고와 업무일지가 WBS를 참조하도록 연결합니다.',
        'task', 'planning', 'PM_MILESTONE',
        v_assignee, v_reviewer,
        DATE '2026-03-12', DATE '2026-04-02', 100, 85,
        'high', 'review', 20.00, FALSE,
        '', 'passed', 'not_applicable'
      );
    ELSE
      UPDATE wbs_tasks
      SET template_id = v_template_id,
          template_item_id = v_template_item_id,
          description = '모든 업무보고와 업무일지가 WBS를 참조하도록 연결합니다.',
          task_type = 'task',
          job_family = 'planning',
          work_style = 'PM_MILESTONE',
          assignee_user_id = v_assignee,
          reviewer_user_id = v_reviewer,
          start_date = DATE '2026-03-12',
          due_date = DATE '2026-04-02',
          planned_progress = 100,
          actual_progress = 85,
          priority = 'high',
          status = 'review',
          weight = 20.00,
          requires_approval = FALSE,
          output_url = '',
          qa_status = 'passed',
          deploy_status = 'not_applicable',
          updated_at = NOW()
      WHERE id = v_task_id;
    END IF;

    -- 전자결재 기본 라인 구성
    SELECT id INTO v_template_id FROM wbs_templates WHERE code = 'TPL_OPS_SLA' LIMIT 1;
    SELECT id INTO v_template_item_id
    FROM wbs_template_items
    WHERE template_id = v_template_id AND title = '공개 승인 및 운영 체크'
    LIMIT 1;
    v_assignee := (SELECT admin_user_id FROM _seed_refs);
    v_approver := (SELECT admin_user_id FROM _seed_refs);

    SELECT id INTO v_task_id FROM wbs_tasks WHERE project_id = v_project_id AND title = '전자결재 기본 라인 구성' LIMIT 1;
    IF v_task_id IS NULL THEN
      INSERT INTO wbs_tasks (
        project_id, template_id, template_item_id,
        title, description, task_type, job_family, work_style,
        assignee_user_id, reviewer_user_id, approver_user_id,
        start_date, due_date, planned_progress, actual_progress,
        priority, status, weight, requires_approval,
        output_url, qa_status, deploy_status
      ) VALUES (
        v_project_id, v_template_id, v_template_item_id,
        '전자결재 기본 라인 구성',
        '배포 승인, 게시 승인, 일정 변경 승인용 결재선 구조를 구성합니다.',
        'task', 'operations', 'OPS_SLA',
        v_assignee, v_reviewer, v_approver,
        DATE '2026-03-25', DATE '2026-04-12', 100, 20,
        'medium', 'todo', 10.00, TRUE,
        '', 'not_required', 'not_applicable'
      );
    ELSE
      UPDATE wbs_tasks
      SET template_id = v_template_id,
          template_item_id = v_template_item_id,
          description = '배포 승인, 게시 승인, 일정 변경 승인용 결재선 구조를 구성합니다.',
          task_type = 'task',
          job_family = 'operations',
          work_style = 'OPS_SLA',
          assignee_user_id = v_assignee,
          reviewer_user_id = v_reviewer,
          approver_user_id = v_approver,
          start_date = DATE '2026-03-25',
          due_date = DATE '2026-04-12',
          planned_progress = 100,
          actual_progress = 20,
          priority = 'medium',
          status = 'todo',
          weight = 10.00,
          requires_approval = TRUE,
          output_url = '',
          qa_status = 'not_required',
          deploy_status = 'not_applicable',
          updated_at = NOW()
      WHERE id = v_task_id;
    END IF;
  END IF;

  -- EUREKA tasks
  SELECT id INTO v_project_id FROM projects WHERE code = 'PRJ-2026-EUREKA-LAUNCH' LIMIT 1;
  IF v_project_id IS NOT NULL THEN
    v_assignee := (SELECT admin_user_id FROM _seed_refs);
    v_reviewer := (SELECT admin_user_id FROM _seed_refs);

    SELECT id INTO v_task_id FROM wbs_tasks WHERE project_id = v_project_id AND title = '유레카월드 공개 카피 및 소개 문안 정리' LIMIT 1;
    IF v_task_id IS NULL THEN
      INSERT INTO wbs_tasks (
        project_id, title, description, task_type, job_family, work_style,
        assignee_user_id, reviewer_user_id,
        start_date, due_date, planned_progress, actual_progress,
        priority, status, weight, requires_approval,
        output_url, qa_status, deploy_status
      ) VALUES (
        v_project_id,
        '유레카월드 공개 카피 및 소개 문안 정리',
        '작업 중심 AI 서비스 포지션에 맞는 공개 설명, 포인트 항목, CTA 문구를 정리합니다.',
        'task', 'operations', 'OPS_SLA',
        v_assignee, v_reviewer,
        DATE '2026-04-02', DATE '2026-04-18', 100, 45,
        'high', 'in_progress', 12.00, FALSE,
        '', 'pending', 'not_applicable'
      );
    ELSE
      UPDATE wbs_tasks
      SET description = '작업 중심 AI 서비스 포지션에 맞는 공개 설명, 포인트 항목, CTA 문구를 정리합니다.',
          task_type = 'task',
          job_family = 'operations',
          work_style = 'OPS_SLA',
          assignee_user_id = v_assignee,
          reviewer_user_id = v_reviewer,
          start_date = DATE '2026-04-02',
          due_date = DATE '2026-04-18',
          planned_progress = 100,
          actual_progress = 45,
          priority = 'high',
          status = 'in_progress',
          weight = 12.00,
          requires_approval = FALSE,
          output_url = '',
          qa_status = 'pending',
          deploy_status = 'not_applicable',
          updated_at = NOW()
      WHERE id = v_task_id;
    END IF;

    SELECT id INTO v_task_id FROM wbs_tasks WHERE project_id = v_project_id AND title = '다국어 공개 범위 및 번역 상태 정리' LIMIT 1;
    IF v_task_id IS NULL THEN
      INSERT INTO wbs_tasks (
        project_id, title, description, task_type, job_family, work_style,
        assignee_user_id, reviewer_user_id,
        start_date, due_date, planned_progress, actual_progress,
        priority, status, weight, requires_approval,
        output_url, qa_status, deploy_status
      ) VALUES (
        v_project_id,
        '다국어 공개 범위 및 번역 상태 정리',
        '한국어, 영어, 일본어, 불어, 스페인어의 공개 가능 범위와 발행 상태를 정리합니다.',
        'task', 'operations', 'OPS_SLA',
        v_assignee, v_reviewer,
        DATE '2026-04-12', DATE '2026-04-30', 100, 10,
        'medium', 'todo', 8.00, FALSE,
        '', 'not_required', 'not_applicable'
      );
    ELSE
      UPDATE wbs_tasks
      SET description = '한국어, 영어, 일본어, 불어, 스페인어의 공개 가능 범위와 발행 상태를 정리합니다.',
          task_type = 'task',
          job_family = 'operations',
          work_style = 'OPS_SLA',
          assignee_user_id = v_assignee,
          reviewer_user_id = v_reviewer,
          start_date = DATE '2026-04-12',
          due_date = DATE '2026-04-30',
          planned_progress = 100,
          actual_progress = 10,
          priority = 'medium',
          status = 'todo',
          weight = 8.00,
          requires_approval = FALSE,
          output_url = '',
          qa_status = 'not_required',
          deploy_status = 'not_applicable',
          updated_at = NOW()
      WHERE id = v_task_id;
    END IF;
  END IF;

  -- STRATEGY tasks
  SELECT id INTO v_project_id FROM projects WHERE code = 'PRJ-2026-STRATEGY-PILOT' LIMIT 1;
  IF v_project_id IS NOT NULL THEN
    v_assignee := (SELECT admin_user_id FROM _seed_refs);
    v_reviewer := (SELECT admin_user_id FROM _seed_refs);

    SELECT id INTO v_task_id FROM wbs_tasks WHERE project_id = v_project_id AND title = '전략 시뮬레이션 데이터 모델 정의' LIMIT 1;
    IF v_task_id IS NULL THEN
      INSERT INTO wbs_tasks (
        project_id, title, description, task_type, job_family, work_style,
        assignee_user_id, reviewer_user_id,
        start_date, due_date, planned_progress, actual_progress,
        priority, status, weight, requires_approval,
        output_url, qa_status, deploy_status
      ) VALUES (
        v_project_id,
        '전략 시뮬레이션 데이터 모델 정의',
        '실시간 정보 반영, 전략 시나리오, 결과 예측 구조를 설계합니다.',
        'task', 'ai-data', 'AI_EXPERIMENT',
        v_assignee, v_reviewer,
        DATE '2026-02-15', DATE '2026-03-25', 100, 35,
        'medium', 'blocked', 14.00, FALSE,
        '', 'pending', 'not_applicable'
      );
    ELSE
      UPDATE wbs_tasks
      SET description = '실시간 정보 반영, 전략 시나리오, 결과 예측 구조를 설계합니다.',
          task_type = 'task',
          job_family = 'ai-data',
          work_style = 'AI_EXPERIMENT',
          assignee_user_id = v_assignee,
          reviewer_user_id = v_reviewer,
          start_date = DATE '2026-02-15',
          due_date = DATE '2026-03-25',
          planned_progress = 100,
          actual_progress = 35,
          priority = 'medium',
          status = 'blocked',
          weight = 14.00,
          requires_approval = FALSE,
          output_url = '',
          qa_status = 'pending',
          deploy_status = 'not_applicable',
          updated_at = NOW()
      WHERE id = v_task_id;
    END IF;

    SELECT id INTO v_task_id FROM wbs_tasks WHERE project_id = v_project_id AND title = '파일럿 리포트 작성' LIMIT 1;
    IF v_task_id IS NULL THEN
      INSERT INTO wbs_tasks (
        project_id, title, description, task_type, job_family, work_style,
        assignee_user_id, reviewer_user_id,
        start_date, due_date, planned_progress, actual_progress,
        priority, status, weight, requires_approval,
        output_url, qa_status, deploy_status
      ) VALUES (
        v_project_id,
        '파일럿 리포트 작성',
        '파일럿 결과, 리스크, 다음 단계 의사결정 자료를 작성합니다.',
        'task', 'planning', 'SALES_PIPELINE',
        v_assignee, v_reviewer,
        DATE '2026-03-01', DATE '2026-04-10', 100, 15,
        'low', 'blocked', 6.00, FALSE,
        '', 'not_required', 'not_applicable'
      );
    ELSE
      UPDATE wbs_tasks
      SET description = '파일럿 결과, 리스크, 다음 단계 의사결정 자료를 작성합니다.',
          task_type = 'task',
          job_family = 'planning',
          work_style = 'SALES_PIPELINE',
          assignee_user_id = v_assignee,
          reviewer_user_id = v_reviewer,
          start_date = DATE '2026-03-01',
          due_date = DATE '2026-04-10',
          planned_progress = 100,
          actual_progress = 15,
          priority = 'low',
          status = 'blocked',
          weight = 6.00,
          requires_approval = FALSE,
          output_url = '',
          qa_status = 'not_required',
          deploy_status = 'not_applicable',
          updated_at = NOW()
      WHERE id = v_task_id;
    END IF;
  END IF;
END $$;

-- ------------------------------------------------------------
-- 6) wbs_task_dependencies
-- ------------------------------------------------------------
INSERT INTO wbs_task_dependencies (task_id, depends_on_task_id, dependency_type)
SELECT
  task_row.id,
  depends_row.id,
  dep.dependency_type
FROM (
  VALUES
    ('PRJ-2026-HOMEPAGE', '홈페이지 반응형 디자인 시스템 적용', '정보구조 및 섹션 정의 확정', 'finish_to_start'),
    ('PRJ-2026-HOMEPAGE', '뉴스 및 문의 Public API 연결', '홈페이지 반응형 디자인 시스템 적용', 'finish_to_start'),
    ('PRJ-2026-HOMEPAGE', '1차 공개 승인 및 게시', '뉴스 및 문의 Public API 연결', 'finish_to_start'),
    ('PRJ-2026-ERP-HUB', '전자결재 기본 라인 구성', 'WBS 기반 업무보고/일지 연결', 'finish_to_start')
) AS dep(project_code, task_title, depends_on_title, dependency_type)
JOIN projects p
  ON p.code = dep.project_code
JOIN wbs_tasks task_row
  ON task_row.project_id = p.id
 AND task_row.title = dep.task_title
JOIN wbs_tasks depends_row
  ON depends_row.project_id = p.id
 AND depends_row.title = dep.depends_on_title
ON CONFLICT (task_id, depends_on_task_id) DO NOTHING;

-- ------------------------------------------------------------
-- 7) project_outputs
-- ------------------------------------------------------------
DO $$
DECLARE
  v_project_id BIGINT;
  v_task_id BIGINT;
  v_output_id BIGINT;
  v_uploaded_by BIGINT;
BEGIN
  v_uploaded_by := (SELECT admin_user_id FROM _seed_refs);

  -- 홈페이지 공개 체크리스트
  SELECT id INTO v_project_id FROM projects WHERE code = 'PRJ-2026-HOMEPAGE' LIMIT 1;
  IF v_project_id IS NOT NULL THEN
    SELECT id INTO v_task_id
    FROM wbs_tasks
    WHERE project_id = v_project_id AND title = '1차 공개 승인 및 게시'
    LIMIT 1;

    SELECT id INTO v_output_id
    FROM project_outputs
    WHERE project_id = v_project_id AND title = '홈페이지 공개 체크리스트 v1'
    LIMIT 1;

    IF v_output_id IS NULL THEN
      INSERT INTO project_outputs (
        project_id, wbs_task_id, output_type, title,
        file_url, external_url, version_label, is_final,
        uploaded_by, metadata_json
      ) VALUES (
        v_project_id, v_task_id, 'document', '홈페이지 공개 체크리스트 v1',
        '', 'https://www.jinbizman.com/contact', 'v1.0', FALSE,
        v_uploaded_by, '{"category":"launch-checklist"}'::jsonb
      );
    ELSE
      UPDATE project_outputs
      SET wbs_task_id = v_task_id,
          output_type = 'document',
          file_url = '',
          external_url = 'https://www.jinbizman.com/contact',
          version_label = 'v1.0',
          is_final = FALSE,
          uploaded_by = v_uploaded_by,
          metadata_json = '{"category":"launch-checklist"}'::jsonb,
          updated_at = NOW()
      WHERE id = v_output_id;
    END IF;
  END IF;

  -- ERP 업무보고 화면 검증 문서
  SELECT id INTO v_project_id FROM projects WHERE code = 'PRJ-2026-ERP-HUB' LIMIT 1;
  IF v_project_id IS NOT NULL THEN
    SELECT id INTO v_task_id
    FROM wbs_tasks
    WHERE project_id = v_project_id AND title = 'WBS 기반 업무보고/일지 연결'
    LIMIT 1;

    SELECT id INTO v_output_id
    FROM project_outputs
    WHERE project_id = v_project_id AND title = 'ERP 업무보고 화면 검증 문서'
    LIMIT 1;

    IF v_output_id IS NULL THEN
      INSERT INTO project_outputs (
        project_id, wbs_task_id, output_type, title,
        file_url, external_url, version_label, is_final,
        uploaded_by, metadata_json
      ) VALUES (
        v_project_id, v_task_id, 'document', 'ERP 업무보고 화면 검증 문서',
        '', 'https://www.jinbizman.com', 'v1.0', FALSE,
        v_uploaded_by, '{"category":"daily-report-qa"}'::jsonb
      );
    ELSE
      UPDATE project_outputs
      SET wbs_task_id = v_task_id,
          output_type = 'document',
          file_url = '',
          external_url = 'https://www.jinbizman.com',
          version_label = 'v1.0',
          is_final = FALSE,
          uploaded_by = v_uploaded_by,
          metadata_json = '{"category":"daily-report-qa"}'::jsonb,
          updated_at = NOW()
      WHERE id = v_output_id;
    END IF;
  END IF;
END $$;

-- ------------------------------------------------------------
-- 8) project_issues
-- ------------------------------------------------------------
DO $$
DECLARE
  v_project_id BIGINT;
  v_task_id BIGINT;
  v_issue_id BIGINT;
  v_reporter BIGINT;
  v_assignee BIGINT;
BEGIN
  v_reporter := (SELECT admin_user_id FROM _seed_refs);
  v_assignee := (SELECT admin_user_id FROM _seed_refs);

  -- ERP issue
  SELECT id INTO v_project_id FROM projects WHERE code = 'PRJ-2026-ERP-HUB' LIMIT 1;
  IF v_project_id IS NOT NULL THEN
    SELECT id INTO v_task_id
    FROM wbs_tasks
    WHERE project_id = v_project_id AND title = '전자결재 기본 라인 구성'
    LIMIT 1;

    SELECT id INTO v_issue_id
    FROM project_issues
    WHERE project_id = v_project_id AND title = '결재선 current line 갱신 정책 확인 필요'
    LIMIT 1;

    IF v_issue_id IS NULL THEN
      INSERT INTO project_issues (
        project_id, wbs_task_id, issue_type, title, description,
        priority, status, reporter_user_id, assignee_user_id, due_date
      ) VALUES (
        v_project_id, v_task_id, 'issue', '결재선 current line 갱신 정책 확인 필요',
        '결재선 변경 시 current line 동기화 정책과 반려 후 재상신 흐름을 재검토해야 합니다.',
        'medium', 'open', v_reporter, v_assignee, DATE '2026-04-05'
      );
    ELSE
      UPDATE project_issues
      SET wbs_task_id = v_task_id,
          issue_type = 'issue',
          description = '결재선 변경 시 current line 동기화 정책과 반려 후 재상신 흐름을 재검토해야 합니다.',
          priority = 'medium',
          status = 'open',
          reporter_user_id = v_reporter,
          assignee_user_id = v_assignee,
          due_date = DATE '2026-04-05',
          updated_at = NOW()
      WHERE id = v_issue_id;
    END IF;
  END IF;

  -- Homepage issue
  SELECT id INTO v_project_id FROM projects WHERE code = 'PRJ-2026-HOMEPAGE' LIMIT 1;
  IF v_project_id IS NOT NULL THEN
    SELECT id INTO v_task_id
    FROM wbs_tasks
    WHERE project_id = v_project_id AND title = '뉴스 및 문의 Public API 연결'
    LIMIT 1;

    SELECT id INTO v_issue_id
    FROM project_issues
    WHERE project_id = v_project_id AND title = '뉴스 상세 응답 스키마 locale 처리 보강 필요'
    LIMIT 1;

    IF v_issue_id IS NULL THEN
      INSERT INTO project_issues (
        project_id, wbs_task_id, issue_type, title, description,
        priority, status, reporter_user_id, assignee_user_id, due_date
      ) VALUES (
        v_project_id, v_task_id, 'risk', '뉴스 상세 응답 스키마 locale 처리 보강 필요',
        '다국어 slug와 locale fallback 규칙이 공개 화면과 동일하게 반영되는지 추가 확인이 필요합니다.',
        'high', 'in_progress', v_reporter, v_assignee, DATE '2026-03-31'
      );
    ELSE
      UPDATE project_issues
      SET wbs_task_id = v_task_id,
          issue_type = 'risk',
          description = '다국어 slug와 locale fallback 규칙이 공개 화면과 동일하게 반영되는지 추가 확인이 필요합니다.',
          priority = 'high',
          status = 'in_progress',
          reporter_user_id = v_reporter,
          assignee_user_id = v_assignee,
          due_date = DATE '2026-03-31',
          updated_at = NOW()
      WHERE id = v_issue_id;
    END IF;
  END IF;
END $$;

-- ------------------------------------------------------------
-- 9) daily_reports + daily_report_items
-- ------------------------------------------------------------
DO $$
DECLARE
  v_user_id BIGINT;
  v_department_id BIGINT;
  v_project_id BIGINT;
  v_report_id BIGINT;
  v_task_id BIGINT;
BEGIN
  v_user_id := (SELECT pm_user_id FROM _seed_refs);
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  SELECT department_id INTO v_department_id FROM users WHERE id = v_user_id;
  SELECT id INTO v_project_id FROM projects WHERE code = 'PRJ-2026-ERP-HUB' LIMIT 1;
  SELECT id INTO v_task_id
  FROM wbs_tasks
  WHERE project_id = v_project_id AND title = 'WBS 기반 업무보고/일지 연결'
  LIMIT 1;

  IF v_project_id IS NULL OR v_task_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO daily_reports (
    user_id,
    department_id,
    report_date,
    project_id,
    today_focus,
    top_priority_text,
    expected_blockers_text,
    support_request_target,
    expects_approval,
    submitted_at
  )
  VALUES (
    v_user_id,
    v_department_id,
    DATE '2026-03-28',
    v_project_id,
    'WBS 연결형 업무보고 폼과 제출 흐름 마감',
    '업무보고와 업무일지가 모두 WBS 기준으로 저장되도록 검증',
    '권한 분리와 결재 연동 API 응답 스키마 차이 확인 필요',
    '평가 근거 데이터 집계용 응답 샘플 확인 요청',
    FALSE,
    NOW()
  )
  ON CONFLICT (user_id, report_date, project_id) DO UPDATE
  SET department_id = EXCLUDED.department_id,
      today_focus = EXCLUDED.today_focus,
      top_priority_text = EXCLUDED.top_priority_text,
      expected_blockers_text = EXCLUDED.expected_blockers_text,
      support_request_target = EXCLUDED.support_request_target,
      expects_approval = EXCLUDED.expects_approval,
      submitted_at = EXCLUDED.submitted_at,
      updated_at = NOW();

  SELECT id INTO v_report_id
  FROM daily_reports
  WHERE user_id = v_user_id
    AND report_date = DATE '2026-03-28'
    AND project_id = v_project_id
  LIMIT 1;

  INSERT INTO daily_report_items (
    daily_report_id,
    wbs_task_id,
    goal_text,
    expected_hours,
    collaboration_needed,
    has_preceding_issue,
    risk_text,
    support_request_text,
    target_completed_at
  )
  VALUES (
    v_report_id,
    v_task_id,
    'WBS 연결형 업무보고 폼 검증 및 제출 로직 마무리',
    6.00,
    TRUE,
    TRUE,
    '권한 분리와 결재 연동 API의 응답 스키마 차이 확인 필요',
    '평가 근거 데이터 집계용 응답 샘플 확인 요청',
    TIME '18:00'
  )
  ON CONFLICT (daily_report_id, wbs_task_id) DO UPDATE
  SET goal_text = EXCLUDED.goal_text,
      expected_hours = EXCLUDED.expected_hours,
      collaboration_needed = EXCLUDED.collaboration_needed,
      has_preceding_issue = EXCLUDED.has_preceding_issue,
      risk_text = EXCLUDED.risk_text,
      support_request_text = EXCLUDED.support_request_text,
      target_completed_at = EXCLUDED.target_completed_at,
      updated_at = NOW();
END $$;

-- ------------------------------------------------------------
-- 10) daily_logs + daily_log_items
-- ------------------------------------------------------------
DO $$
DECLARE
  v_user_id BIGINT;
  v_department_id BIGINT;
  v_project_id BIGINT;
  v_log_id BIGINT;
  v_task_id BIGINT;
BEGIN
  v_user_id := (SELECT frontend_user_id FROM _seed_refs);
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  SELECT department_id INTO v_department_id FROM users WHERE id = v_user_id;
  SELECT id INTO v_project_id FROM projects WHERE code = 'PRJ-2026-HOMEPAGE' LIMIT 1;
  SELECT id INTO v_task_id
  FROM wbs_tasks
  WHERE project_id = v_project_id AND title = '뉴스 및 문의 Public API 연결'
  LIMIT 1;

  IF v_project_id IS NULL OR v_task_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO daily_logs (
    user_id,
    department_id,
    log_date,
    project_id,
    daily_summary,
    collaboration_summary,
    pending_approval_summary,
    has_blocker,
    support_needed_text,
    submitted_at
  )
  VALUES (
    v_user_id,
    v_department_id,
    DATE '2026-03-28',
    v_project_id,
    '공개 페이지 뉴스/문의 API 연결과 응답 규약 점검을 진행했습니다.',
    '백엔드 응답 스키마와 프론트 locale 처리 방식을 함께 조정했습니다.',
    '다국어 뉴스 상세 발행 흐름은 추가 검토가 남아 있습니다.',
    TRUE,
    'locale fallback 규칙과 관리자 발행 응답 규약 확인이 필요합니다.',
    NOW()
  )
  ON CONFLICT (user_id, log_date, project_id) DO UPDATE
  SET department_id = EXCLUDED.department_id,
      daily_summary = EXCLUDED.daily_summary,
      collaboration_summary = EXCLUDED.collaboration_summary,
      pending_approval_summary = EXCLUDED.pending_approval_summary,
      has_blocker = EXCLUDED.has_blocker,
      support_needed_text = EXCLUDED.support_needed_text,
      submitted_at = EXCLUDED.submitted_at,
      updated_at = NOW();

  SELECT id INTO v_log_id
  FROM daily_logs
  WHERE user_id = v_user_id
    AND log_date = DATE '2026-03-28'
    AND project_id = v_project_id
  LIMIT 1;

  INSERT INTO daily_log_items (
    daily_log_id,
    wbs_task_id,
    work_summary,
    is_completed,
    actual_progress,
    output_url,
    delay_reason_code,
    issue_memo,
    next_action
  )
  VALUES (
    v_log_id,
    v_task_id,
    '뉴스 목록 API와 문의 저장 API를 공개 페이지에 연결하고 응답 규약을 정리했습니다.',
    FALSE,
    70,
    'https://www.jinbizman.com/newsletter',
    'API_SCHEMA_DIFF',
    '다국어 상세 응답과 locale fallback 규칙의 최종 정합성 확인이 필요합니다.',
    '다국어 뉴스 상세 페이지와 관리자 발행 흐름을 연결합니다.'
  )
  ON CONFLICT (daily_log_id, wbs_task_id) DO UPDATE
  SET work_summary = EXCLUDED.work_summary,
      is_completed = EXCLUDED.is_completed,
      actual_progress = EXCLUDED.actual_progress,
      output_url = EXCLUDED.output_url,
      delay_reason_code = EXCLUDED.delay_reason_code,
      issue_memo = EXCLUDED.issue_memo,
      next_action = EXCLUDED.next_action,
      updated_at = NOW();
END $$;

COMMIT;