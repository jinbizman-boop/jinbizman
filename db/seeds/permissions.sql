-- permissions.sql
-- JINBIZ permissions seed
--
-- Purpose:
--   - seed the latest permissions table only
--   - align strictly with 001_core_org_auth.sql
--   - remain idempotent and production-safe
--
-- Notes:
--   - This file targets the latest schema only:
--       permissions(code, name, description, group_key, created_at, updated_at)
--   - role to permission mapping must stay in db/seeds/role_permissions.sql
--   - existing created_at values are preserved on re-run

BEGIN;

INSERT INTO permissions (code, name, description, group_key)
VALUES
  ('service.read', '서비스 조회', '서비스 허브 목록/상세 조회', 'admin.services'),
  ('service.create', '서비스 생성', '서비스 허브에 새 서비스 등록', 'admin.services'),
  ('service.update', '서비스 수정', '서비스 정보, 상태, 설정 수정', 'admin.services'),
  ('service.assign', '서비스 담당자/연결 관리', '서비스 담당자, 연결, 운영 정보 할당', 'admin.services'),

  ('content.read', '사이트 콘텐츠 조회', '홈페이지 운영 콘텐츠 조회', 'site.content'),
  ('content.create', '사이트 콘텐츠 생성', '홈페이지 운영 콘텐츠 생성', 'site.content'),
  ('content.update', '사이트 콘텐츠 수정', '홈페이지 운영 콘텐츠 수정', 'site.content'),
  ('content.publish', '사이트 콘텐츠 발행', '홈페이지 운영 콘텐츠 발행/숨김 처리', 'site.content'),

  ('translation.read', '번역 조회', '다국어 번역 목록/상세 조회', 'site.translations'),
  ('translation.create', '번역 생성', '다국어 번역 초안 생성', 'site.translations'),
  ('translation.update', '번역 수정', '다국어 번역 편집', 'site.translations'),
  ('translation.publish', '번역 발행', '다국어 번역 검수 후 발행', 'site.translations'),

  ('news.read', '뉴스/공지 조회', '보도자료, 공시정보, 공지사항 조회', 'site.news'),
  ('news.create', '뉴스/공지 생성', '보도자료, 공시정보, 공지사항 생성', 'site.news'),
  ('news.update', '뉴스/공지 수정', '보도자료, 공시정보, 공지사항 수정', 'site.news'),
  ('news.publish', '뉴스/공지 발행', '보도자료, 공시정보, 공지사항 발행', 'site.news'),

  ('inquiry.read', '문의 조회', '문의 목록/상세 조회', 'crm.inquiries'),
  ('inquiry.update', '문의 상태 수정', '문의 담당자/상태/후속 메모 수정', 'crm.inquiries'),
  ('lead.create', '리드 생성', '문의에서 리드 생성', 'crm.leads'),
  ('lead.update', '리드 수정', '리드 상태/점수/메모 수정', 'crm.leads'),
  ('opportunity.manage', '사업기회 관리', '사업기회 생성/수정/전환 관리', 'crm.opportunities'),

  ('project.read', '프로젝트 조회', '프로젝트 목록/상세 조회', 'erp.projects'),
  ('project.create', '프로젝트 생성', '프로젝트 생성', 'erp.projects'),
  ('project.update', '프로젝트 수정', '프로젝트 상태/일정/설명 수정', 'erp.projects'),
  ('project.member.manage', '프로젝트 멤버 관리', '프로젝트 멤버 추가/수정/정리', 'erp.projects'),

  ('wbs.read', 'WBS 조회', 'WBS 목록/상세 조회', 'erp.wbs'),
  ('wbs.create', 'WBS 생성', 'WBS 및 의존성 생성', 'erp.wbs'),
  ('wbs.update', 'WBS 수정', 'WBS 상태/일정/담당자/진척률 수정', 'erp.wbs'),
  ('wbs.approve', 'WBS 승인', '승인 필요한 WBS 검토/승인', 'erp.wbs'),

  ('daily_report.create', '아침 업무보고 작성', '아침 업무보고 작성 및 제출', 'erp.daily'),
  ('daily_report.read', '아침 업무보고 조회', '아침 업무보고 조회', 'erp.daily'),
  ('daily_log.create', '업무일지 작성', '퇴근 업무일지 작성 및 제출', 'erp.daily'),
  ('daily_log.read', '업무일지 조회', '퇴근 업무일지 조회', 'erp.daily'),
  ('daily_log.review', '업무일지 검토', '업무일지 검토 및 피드백', 'erp.daily'),

  ('approval.read', '결재 조회', '결재 문서/승인선/이력 조회', 'erp.approvals'),
  ('approval.create', '결재 상신', '결재 문서 생성 및 상신', 'erp.approvals'),
  ('approval.act', '결재 처리', '승인/반려/수정요청 처리', 'erp.approvals'),

  ('evaluation.read', '평가 조회', '평가 주기/항목/결과 조회', 'erp.evaluations'),
  ('evaluation.score', '평가 점수 입력', '평가 근거 기반 점수 입력', 'erp.evaluations'),
  ('evaluation.finalize', '평가 확정', '평가 결과 확정/종료', 'erp.evaluations'),

  ('user.read', '사용자 조회', '사용자 목록/상세 조회', 'org.users'),
  ('user.update', '사용자 수정', '사용자 상태/부서/직군 정보 수정', 'org.users'),
  ('role.read', '역할 조회', '역할 및 권한 구조 조회', 'org.roles'),
  ('role.manage', '역할 관리', '역할 및 역할-권한 연결 관리', 'org.roles'),

  ('audit.read', '감사로그 조회', '감사로그 목록/상세 조회', 'system.audit'),
  ('system.read', '시스템 설정 조회', '시스템 설정 조회', 'system.settings'),
  ('system.update', '시스템 설정 수정', '시스템 설정 수정', 'system.settings'),

  ('todo.read', '내 할 일 조회', 'WBS 자동 연동 및 개인 To-do 조회', 'erp.todo'),
  ('todo.create', '개인 할 일 생성', '개인 To-do 생성', 'erp.todo'),
  ('todo.update', '할 일 수정', 'To-do 상태/우선순위/마감일 수정', 'erp.todo'),

  ('attendance.read', '근태 조회', '본인 또는 권한 범위 근태 조회', 'hr.attendance'),
  ('attendance.punch', '출퇴근 기록', '본인 출근/퇴근 기록', 'hr.attendance'),
  ('attendance.manage', '근태 관리', '근태 정정/승인/관리', 'hr.attendance'),

  ('leave.read', '휴가 조회', '휴가 잔여 및 신청 이력 조회', 'hr.leave'),
  ('leave.create', '휴가 신청', '휴가/연차 신청', 'hr.leave'),
  ('leave.manage', '휴가 관리', '휴가 승인/반려 및 잔여 연차 관리', 'hr.leave'),

  ('timesheet.read', '타임시트 조회', '프로젝트 투입/타임시트 조회', 'erp.timesheet'),
  ('timesheet.create', '타임시트 작성', '프로젝트 작업시간 입력/제출', 'erp.timesheet'),
  ('timesheet.review', '타임시트 검토', '타임시트 승인/반려', 'erp.timesheet'),

  ('budget.read', '예산 조회', '프로젝트 예산/집행률 조회', 'finance.budget'),
  ('budget.manage', '예산 관리', '프로젝트 예산 생성/수정', 'finance.budget'),
  ('expense.read', '지출 조회', '지출/정산 요청 조회', 'finance.expense'),
  ('expense.create', '지출 작성', '지출/정산 요청 생성', 'finance.expense'),
  ('expense.manage', '지출 관리', '지출 승인 상태 및 지급 상태 관리', 'finance.expense'),

  ('goal.read', '목표 조회', '개인/부서/프로젝트 목표 조회', 'erp.goals'),
  ('goal.manage', '목표 관리', '목표/지표 생성 및 업데이트', 'erp.goals'),

  ('board.read', '사내 게시판 조회', '사내 게시물 조회', 'collab.board'),
  ('board.manage', '사내 게시판 관리', '사내 게시물 작성/발행/보관', 'collab.board'),
  ('knowledge.read', '지식 문서 조회', '매뉴얼/규정/지식 문서 조회', 'collab.knowledge'),
  ('knowledge.manage', '지식 문서 관리', '매뉴얼/규정/지식 문서 생성/발행', 'collab.knowledge'),

  ('integration.read', '외부 연동 조회', 'API/Webhook 연동 상태 조회', 'system.integrations'),
  ('integration.manage', '외부 연동 관리', '비밀정보를 제외한 외부 연동 메타 설정', 'system.integrations'),
  ('email_template.read', '이메일 템플릿 조회', '알림 이메일 템플릿 조회', 'system.email_templates'),
  ('email_template.manage', '이메일 템플릿 관리', '언어별 알림 이메일 템플릿 관리', 'system.email_templates')
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    group_key = EXCLUDED.group_key,
    updated_at = NOW();

COMMIT;