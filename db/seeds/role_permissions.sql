-- role_permissions.sql
-- JINBIZ role_permissions seed
--
-- Purpose:
--   - seed the latest role_permissions table only
--   - align strictly with 001_core_org_auth.sql + current role/permission standards
--   - remain idempotent and production-safe
--
-- Notes:
--   - This file assumes roles.sql and permissions.sql already ran.
--   - It does NOT create roles or permissions.
--   - It only inserts missing required mappings.
--   - Existing manual mappings are preserved.

BEGIN;

CREATE TEMP TABLE IF NOT EXISTS _seed_role_permissions (
  role_code TEXT NOT NULL,
  permission_code TEXT NOT NULL,
  PRIMARY KEY (role_code, permission_code)
) ON COMMIT DROP;

TRUNCATE TABLE _seed_role_permissions;

-- ------------------------------------------------------------
-- super_admin
-- 전체 권한
-- ------------------------------------------------------------
INSERT INTO _seed_role_permissions (role_code, permission_code)
SELECT 'super_admin', p.code
FROM permissions p;

-- ------------------------------------------------------------
-- executive_admin
-- 대시보드 열람, 결재 승인, 평가 결과 열람, 중요 설정 승인
-- ------------------------------------------------------------
INSERT INTO _seed_role_permissions (role_code, permission_code)
VALUES
  ('executive_admin', 'service.read'),
  ('executive_admin', 'content.read'),
  ('executive_admin', 'translation.read'),
  ('executive_admin', 'news.read'),
  ('executive_admin', 'inquiry.read'),
  ('executive_admin', 'project.read'),
  ('executive_admin', 'wbs.read'),
  ('executive_admin', 'daily_report.read'),
  ('executive_admin', 'daily_log.read'),
  ('executive_admin', 'approval.read'),
  ('executive_admin', 'approval.act'),
  ('executive_admin', 'evaluation.read'),
  ('executive_admin', 'audit.read'),
  ('executive_admin', 'system.read');

-- ------------------------------------------------------------
-- service_admin
-- 서비스 등록/수정, 콘텐츠/환경/권한 관리
-- ------------------------------------------------------------
INSERT INTO _seed_role_permissions (role_code, permission_code)
VALUES
  ('service_admin', 'service.read'),
  ('service_admin', 'service.create'),
  ('service_admin', 'service.update'),
  ('service_admin', 'service.assign'),
  ('service_admin', 'content.read'),
  ('service_admin', 'content.create'),
  ('service_admin', 'content.update'),
  ('service_admin', 'content.publish'),
  ('service_admin', 'translation.read'),
  ('service_admin', 'translation.create'),
  ('service_admin', 'translation.update'),
  ('service_admin', 'translation.publish'),
  ('service_admin', 'news.read'),
  ('service_admin', 'news.create'),
  ('service_admin', 'news.update'),
  ('service_admin', 'news.publish'),
  ('service_admin', 'inquiry.read'),
  ('service_admin', 'inquiry.update'),
  ('service_admin', 'lead.create'),
  ('service_admin', 'lead.update'),
  ('service_admin', 'opportunity.manage'),
  ('service_admin', 'project.read'),
  ('service_admin', 'project.update'),
  ('service_admin', 'wbs.read'),
  ('service_admin', 'audit.read'),
  ('service_admin', 'approval.create');

-- ------------------------------------------------------------
-- site_editor
-- 홈페이지 문구, 뉴스/공지 편집, 발행 요청
-- ------------------------------------------------------------
INSERT INTO _seed_role_permissions (role_code, permission_code)
VALUES
  ('site_editor', 'content.read'),
  ('site_editor', 'content.create'),
  ('site_editor', 'content.update'),
  ('site_editor', 'translation.read'),
  ('site_editor', 'translation.create'),
  ('site_editor', 'translation.update'),
  ('site_editor', 'news.read'),
  ('site_editor', 'news.create'),
  ('site_editor', 'news.update'),
  ('site_editor', 'approval.create');

-- ------------------------------------------------------------
-- news_operator
-- 문서 예시 역할 호환
-- ------------------------------------------------------------
INSERT INTO _seed_role_permissions (role_code, permission_code)
VALUES
  ('news_operator', 'content.read'),
  ('news_operator', 'content.update'),
  ('news_operator', 'news.read'),
  ('news_operator', 'news.create'),
  ('news_operator', 'news.update'),
  ('news_operator', 'translation.read'),
  ('news_operator', 'translation.update');

-- ------------------------------------------------------------
-- bizdev_manager
-- 문의/리드/사업기회 관리
-- ------------------------------------------------------------
INSERT INTO _seed_role_permissions (role_code, permission_code)
VALUES
  ('bizdev_manager', 'service.read'),
  ('bizdev_manager', 'news.read'),
  ('bizdev_manager', 'inquiry.read'),
  ('bizdev_manager', 'inquiry.update'),
  ('bizdev_manager', 'lead.create'),
  ('bizdev_manager', 'lead.update'),
  ('bizdev_manager', 'opportunity.manage'),
  ('bizdev_manager', 'project.read');

-- ------------------------------------------------------------
-- project_pm
-- 프로젝트 생성/수정, WBS 생성/배정, 멤버 관리
-- ------------------------------------------------------------
INSERT INTO _seed_role_permissions (role_code, permission_code)
VALUES
  ('project_pm', 'project.read'),
  ('project_pm', 'project.create'),
  ('project_pm', 'project.update'),
  ('project_pm', 'project.member.manage'),
  ('project_pm', 'wbs.read'),
  ('project_pm', 'wbs.create'),
  ('project_pm', 'wbs.update'),
  ('project_pm', 'daily_report.read'),
  ('project_pm', 'daily_log.read'),
  ('project_pm', 'daily_log.review'),
  ('project_pm', 'inquiry.read'),
  ('project_pm', 'lead.update'),
  ('project_pm', 'evaluation.read'),
  ('project_pm', 'approval.create');

-- ------------------------------------------------------------
-- pm
-- 프론트 문서 예시 역할 호환
-- ------------------------------------------------------------
INSERT INTO _seed_role_permissions (role_code, permission_code)
VALUES
  ('pm', 'project.read'),
  ('pm', 'project.create'),
  ('pm', 'project.update'),
  ('pm', 'project.member.manage'),
  ('pm', 'wbs.read'),
  ('pm', 'wbs.create'),
  ('pm', 'wbs.update'),
  ('pm', 'daily_report.read'),
  ('pm', 'daily_log.read'),
  ('pm', 'daily_log.review'),
  ('pm', 'inquiry.read'),
  ('pm', 'lead.update'),
  ('pm', 'evaluation.read'),
  ('pm', 'approval.create');

-- ------------------------------------------------------------
-- team_lead
-- 팀원 WBS 리뷰, 보고/일지 검토, 평가 초안
-- ------------------------------------------------------------
INSERT INTO _seed_role_permissions (role_code, permission_code)
VALUES
  ('team_lead', 'project.read'),
  ('team_lead', 'wbs.read'),
  ('team_lead', 'wbs.update'),
  ('team_lead', 'wbs.approve'),
  ('team_lead', 'daily_report.read'),
  ('team_lead', 'daily_log.read'),
  ('team_lead', 'daily_log.review'),
  ('team_lead', 'approval.read'),
  ('team_lead', 'evaluation.read'),
  ('team_lead', 'evaluation.score'),
  ('team_lead', 'approval.create'),
  ('team_lead', 'approval.act');

-- ------------------------------------------------------------
-- member
-- 본인 WBS, 보고, 일지, 알림
-- ------------------------------------------------------------
INSERT INTO _seed_role_permissions (role_code, permission_code)
VALUES
  ('member', 'project.read'),
  ('member', 'wbs.read'),
  ('member', 'daily_report.create'),
  ('member', 'daily_log.create'),
  ('member', 'approval.read'),
  ('member', 'approval.create');

-- ------------------------------------------------------------
-- general_member
-- 문서 예시 역할 호환
-- ------------------------------------------------------------
INSERT INTO _seed_role_permissions (role_code, permission_code)
VALUES
  ('general_member', 'project.read'),
  ('general_member', 'wbs.read'),
  ('general_member', 'daily_report.create'),
  ('general_member', 'daily_log.create'),
  ('general_member', 'approval.read'),
  ('general_member', 'approval.create');

-- ------------------------------------------------------------
-- finance_manager
-- 비용/정산 관련 결재
-- ------------------------------------------------------------
INSERT INTO _seed_role_permissions (role_code, permission_code)
VALUES
  ('finance_manager', 'project.read'),
  ('finance_manager', 'approval.read'),
  ('finance_manager', 'approval.act'),
  ('finance_manager', 'audit.read'),
  ('finance_manager', 'approval.create');

-- ------------------------------------------------------------
-- hr_evaluator
-- 평가 주기/항목/집계/확정
-- ------------------------------------------------------------
INSERT INTO _seed_role_permissions (role_code, permission_code)
VALUES
  ('hr_evaluator', 'evaluation.read'),
  ('hr_evaluator', 'evaluation.score'),
  ('hr_evaluator', 'evaluation.finalize'),
  ('hr_evaluator', 'user.read'),
  ('hr_evaluator', 'audit.read');

-- ------------------------------------------------------------
-- translation_editor
-- 언어별 콘텐츠 작성/수정
-- ------------------------------------------------------------
INSERT INTO _seed_role_permissions (role_code, permission_code)
VALUES
  ('translation_editor', 'content.read'),
  ('translation_editor', 'translation.read'),
  ('translation_editor', 'translation.create'),
  ('translation_editor', 'translation.update'),
  ('translation_editor', 'news.read'),
  ('translation_editor', 'news.update');

-- ------------------------------------------------------------
-- translator
-- 프론트 문서 예시 역할 호환
-- ------------------------------------------------------------
INSERT INTO _seed_role_permissions (role_code, permission_code)
VALUES
  ('translator', 'content.read'),
  ('translator', 'translation.read'),
  ('translator', 'translation.create'),
  ('translator', 'translation.update'),
  ('translator', 'news.read'),
  ('translator', 'news.update');

-- ------------------------------------------------------------
-- translation_reviewer
-- 언어별 검수/발행 승인
-- ------------------------------------------------------------
INSERT INTO _seed_role_permissions (role_code, permission_code)
VALUES
  ('translation_reviewer', 'translation.read'),
  ('translation_reviewer', 'translation.update'),
  ('translation_reviewer', 'translation.publish'),
  ('translation_reviewer', 'news.read'),
  ('translation_reviewer', 'news.publish'),
  ('translation_reviewer', 'content.read'),
  ('translation_reviewer', 'content.publish');

-- ------------------------------------------------------------
-- reviewer
-- 문서 예시 역할 호환
-- ------------------------------------------------------------
INSERT INTO _seed_role_permissions (role_code, permission_code)
VALUES
  ('reviewer', 'wbs.read'),
  ('reviewer', 'wbs.approve'),
  ('reviewer', 'approval.read'),
  ('reviewer', 'approval.act'),
  ('reviewer', 'evaluation.read');

-- ------------------------------------------------------------
-- viewer
-- 읽기 전용
-- ------------------------------------------------------------
INSERT INTO _seed_role_permissions (role_code, permission_code)
VALUES
  ('viewer', 'service.read'),
  ('viewer', 'content.read'),
  ('viewer', 'translation.read'),
  ('viewer', 'news.read'),
  ('viewer', 'inquiry.read'),
  ('viewer', 'project.read'),
  ('viewer', 'wbs.read'),
  ('viewer', 'daily_report.read'),
  ('viewer', 'daily_log.read'),
  ('viewer', 'approval.read'),
  ('viewer', 'evaluation.read'),
  ('viewer', 'user.read'),
  ('viewer', 'role.read'),
  ('viewer', 'system.read'),
  ('viewer', 'audit.read');

-- ------------------------------------------------------------
-- workplace operations / collaboration / finance
-- ------------------------------------------------------------
INSERT INTO _seed_role_permissions (role_code, permission_code)
VALUES
  ('executive_admin', 'attendance.read'),
  ('executive_admin', 'leave.read'),
  ('executive_admin', 'timesheet.read'),
  ('executive_admin', 'budget.read'),
  ('executive_admin', 'expense.read'),
  ('executive_admin', 'goal.read'),
  ('executive_admin', 'board.read'),
  ('executive_admin', 'knowledge.read'),
  ('executive_admin', 'integration.read'),
  ('executive_admin', 'email_template.read'),

  ('service_admin', 'board.read'),
  ('service_admin', 'knowledge.read'),
  ('service_admin', 'integration.read'),
  ('service_admin', 'email_template.read'),

  ('project_pm', 'todo.read'),
  ('project_pm', 'todo.create'),
  ('project_pm', 'todo.update'),
  ('project_pm', 'timesheet.read'),
  ('project_pm', 'timesheet.review'),
  ('project_pm', 'budget.read'),
  ('project_pm', 'goal.read'),
  ('project_pm', 'goal.manage'),
  ('project_pm', 'board.read'),
  ('project_pm', 'knowledge.read'),

  ('pm', 'todo.read'),
  ('pm', 'todo.create'),
  ('pm', 'todo.update'),
  ('pm', 'timesheet.read'),
  ('pm', 'timesheet.review'),
  ('pm', 'budget.read'),
  ('pm', 'goal.read'),
  ('pm', 'goal.manage'),
  ('pm', 'board.read'),
  ('pm', 'knowledge.read'),

  ('team_lead', 'todo.read'),
  ('team_lead', 'todo.update'),
  ('team_lead', 'attendance.read'),
  ('team_lead', 'leave.read'),
  ('team_lead', 'timesheet.read'),
  ('team_lead', 'timesheet.review'),
  ('team_lead', 'goal.read'),
  ('team_lead', 'goal.manage'),
  ('team_lead', 'board.read'),
  ('team_lead', 'knowledge.read'),

  ('member', 'todo.read'),
  ('member', 'todo.create'),
  ('member', 'todo.update'),
  ('member', 'attendance.read'),
  ('member', 'attendance.punch'),
  ('member', 'leave.read'),
  ('member', 'leave.create'),
  ('member', 'timesheet.read'),
  ('member', 'timesheet.create'),
  ('member', 'goal.read'),
  ('member', 'board.read'),
  ('member', 'knowledge.read'),

  ('general_member', 'todo.read'),
  ('general_member', 'todo.create'),
  ('general_member', 'todo.update'),
  ('general_member', 'attendance.read'),
  ('general_member', 'attendance.punch'),
  ('general_member', 'leave.read'),
  ('general_member', 'leave.create'),
  ('general_member', 'timesheet.read'),
  ('general_member', 'timesheet.create'),
  ('general_member', 'goal.read'),
  ('general_member', 'board.read'),
  ('general_member', 'knowledge.read'),

  ('finance_manager', 'budget.read'),
  ('finance_manager', 'budget.manage'),
  ('finance_manager', 'expense.read'),
  ('finance_manager', 'expense.create'),
  ('finance_manager', 'expense.manage'),

  ('hr_evaluator', 'attendance.read'),
  ('hr_evaluator', 'attendance.manage'),
  ('hr_evaluator', 'leave.read'),
  ('hr_evaluator', 'leave.manage'),
  ('hr_evaluator', 'timesheet.read'),
  ('hr_evaluator', 'goal.read'),
  ('hr_evaluator', 'goal.manage'),

  ('viewer', 'todo.read'),
  ('viewer', 'attendance.read'),
  ('viewer', 'leave.read'),
  ('viewer', 'timesheet.read'),
  ('viewer', 'budget.read'),
  ('viewer', 'expense.read'),
  ('viewer', 'goal.read'),
  ('viewer', 'board.read'),
  ('viewer', 'knowledge.read'),
  ('viewer', 'integration.read'),
  ('viewer', 'email_template.read');

-- ------------------------------------------------------------
-- apply only when both role and permission exist
-- preserve existing mappings
-- ------------------------------------------------------------
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  r.id,
  p.id
FROM _seed_role_permissions srp
JOIN roles r
  ON r.code = srp.role_code
JOIN permissions p
  ON p.code = srp.permission_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

COMMIT;