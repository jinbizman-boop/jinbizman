-- roles.sql
-- JINBIZ roles seed
--
-- Purpose:
--   - seed the latest roles table only
--   - align strictly with 001_core_org_auth.sql
--   - remain idempotent and production-safe
--
-- Notes:
--   - This file targets the latest schema only:
--       roles(code, name, description, is_system, created_at, updated_at)
--   - role to permission mapping must stay in db/seeds/role_permissions.sql
--   - existing created_at values are preserved on re-run

BEGIN;

INSERT INTO roles (code, name, description, is_system)
VALUES
  -- canonical roles
  ('super_admin', '슈퍼관리자', '전체 시스템, 서비스, 프로젝트, 사용자, 설정을 관리하는 최고 권한 역할', TRUE),
  ('executive_admin', '대표/경영관리자', '대시보드 열람, 중요 승인, 평가 결과 열람, 핵심 설정 승인 역할', TRUE),
  ('service_admin', '서비스관리자', '서비스 등록/수정, 콘텐츠/환경/운영 권한 관리 역할', TRUE),
  ('site_editor', '홈페이지운영자', '홈페이지 문구, 뉴스/공지 편집 및 발행 요청 역할', TRUE),
  ('bizdev_manager', '사업개발관리자', '문의, 리드, 사업기회 관리와 프로젝트 연결 역할', TRUE),
  ('project_pm', '프로젝트PM', '프로젝트 생성/수정, WBS 생성/배정, 멤버 관리 역할', TRUE),
  ('team_lead', '팀장', '팀원 WBS 리뷰, 업무보고/업무일지 검토, 평가 초안 역할', TRUE),
  ('member', '구성원', '본인 WBS, 업무보고, 업무일지, 알림 처리 역할', TRUE),
  ('finance_manager', '재무관리자', '비용/정산/재무 관련 결재 및 통제 역할', TRUE),
  ('hr_evaluator', '인사평가관리자', '평가 주기, 항목, 점수 집계, 결과 확정 역할', TRUE),
  ('viewer', '열람전용', '조회만 가능한 읽기 전용 역할', TRUE),
  ('translation_editor', '번역작성자', '언어별 콘텐츠 작성 및 수정 역할', TRUE),
  ('translation_reviewer', '번역검수자', '언어별 번역 검수 및 공개 승인 역할', TRUE),

  -- compatibility / alias roles
  ('service_operator', '서비스운영자', 'service_admin 호환 운영 역할', TRUE),
  ('site_operator', '사이트운영자', 'site_editor 호환 운영 역할', TRUE),
  ('news_editor', '뉴스운영자', 'site_editor 호환 운영 역할', TRUE),
  ('news_operator', '공지/뉴스운영자', 'site_editor 호환 운영 역할', TRUE),
  ('translator', '번역자', 'translation_editor 호환 역할', TRUE),
  ('reviewer', '검수자', 'translation_reviewer 또는 승인 검토 호환 역할', TRUE),
  ('pm', 'PM', 'project_pm 호환 역할', TRUE),
  ('general_member', '일반구성원', 'member 호환 역할', TRUE),
  ('hr_manager', '인사관리자', 'hr_evaluator 호환 역할', TRUE)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_system = EXCLUDED.is_system,
    updated_at = NOW();

COMMIT;