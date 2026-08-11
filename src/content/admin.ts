export interface AdminModule {
  key: string;
  label: string;
  group: string;
  endpoint?: string;
  description: string;
}

export const adminModules: AdminModule[] = [
  { key: "dashboard", label: "대시보드", group: "운영", endpoint: "/api/admin/dashboard", description: "오늘 통제해야 할 프로젝트·업무·결재·문의 상태" },
  { key: "services", label: "서비스 허브", group: "외부 운영", endpoint: "/api/admin/services", description: "홈페이지·플랫폼·앱을 서비스 단위로 등록하고 운영" },
  { key: "site-content", label: "홈페이지 운영", group: "외부 운영", endpoint: "/api/admin/contents", description: "페이지 콘텐츠·번역·SEO·배너·네비게이션 관리" },
  { key: "news", label: "뉴스·공지", group: "외부 운영", endpoint: "/api/admin/news", description: "기업소식·공지·IR·채용·자료·프로젝트 업데이트" },
  { key: "inquiries", label: "문의", group: "CRM", endpoint: "/api/admin/inquiries", description: "외부 문의 접수와 처리 이력" },
  { key: "leads", label: "리드", group: "CRM", endpoint: "/api/admin/leads", description: "문의에서 전환된 잠재 고객" },
  { key: "opportunities", label: "사업기회", group: "CRM", endpoint: "/api/admin/opportunities", description: "리드에서 프로젝트 전환 전 영업 기회" },
  { key: "projects", label: "프로젝트/WBS", group: "프로젝트", endpoint: "/api/admin/projects", description: "프로젝트와 구조화된 업무 실행" },
  { key: "daily-work", label: "업무보고·일지", group: "프로젝트", description: "WBS 기반 아침 계획과 퇴근 실제 기록" },
  { key: "todos", label: "내 할 일", group: "프로젝트", endpoint: "/api/erp/todos", description: "WBS 자동연동 + 개인 할 일" },
  { key: "approvals", label: "전자결재", group: "통제", endpoint: "/api/admin/approvals", description: "업무·게시·예산·휴가·평가 승인" },
  { key: "attendance", label: "근태", group: "조직", endpoint: "/api/erp/attendance", description: "출퇴근과 정정 요청" },
  { key: "leave", label: "휴가·연차", group: "조직", endpoint: "/api/erp/leave", description: "연차 잔액과 휴가 신청" },
  { key: "timesheets", label: "타임시트", group: "조직", endpoint: "/api/erp/timesheets", description: "프로젝트별 실제 투입 시간" },
  { key: "users", label: "사용자", group: "조직", endpoint: "/api/admin/users", description: "조직 구성원 계정" },
  { key: "departments", label: "부서", group: "조직", endpoint: "/api/admin/departments", description: "조직 구조" },
  { key: "roles", label: "역할", group: "조직", endpoint: "/api/admin/roles", description: "RBAC 역할" },
  { key: "permissions", label: "권한", group: "조직", endpoint: "/api/admin/permissions", description: "서비스·프로젝트·업무 범위 권한" },
  { key: "budgets", label: "예산", group: "재무", endpoint: "/api/erp/budgets", description: "프로젝트 예산과 집행 기준" },
  { key: "expenses", label: "지출", group: "재무", endpoint: "/api/erp/expenses", description: "지출·증빙·결재 연결" },
  { key: "goals", label: "목표/KPI", group: "평가", endpoint: "/api/erp/goals", description: "조직·개인 목표" },
  { key: "evaluations", label: "인사평가", group: "평가", endpoint: "/api/admin/evaluations", description: "WBS·산출물·일정·협업 근거 기반 평가" },
  { key: "board", label: "게시판", group: "지식", endpoint: "/api/erp/board", description: "사내 공지와 협업 게시물" },
  { key: "knowledge", label: "지식문서", group: "지식", endpoint: "/api/erp/knowledge", description: "정책·프로젝트·템플릿 지식" },
  { key: "media", label: "미디어", group: "외부 운영", description: "R2 기반 홈페이지 파일 자산" },
  { key: "service-deployments", label: "서비스 배포", group: "시스템", endpoint: "/api/admin/service-deployments", description: "서비스별 배포 이력" },
  { key: "site-banners", label: "배너", group: "시스템", endpoint: "/api/admin/site-banners", description: "공개 사이트 배너" },
  { key: "site-navigation", label: "네비게이션", group: "시스템", endpoint: "/api/admin/site-navigation", description: "공개 사이트 메뉴" },
  { key: "approval-templates", label: "결재서식", group: "시스템", endpoint: "/api/erp/approval-templates", description: "표준 결재 흐름" },
  { key: "code-groups", label: "공통코드", group: "시스템", endpoint: "/api/system/code-groups", description: "상태·분류 공통코드" },
  { key: "integrations", label: "외부 연동", group: "시스템", endpoint: "/api/system/integrations", description: "외부 서비스 연결 상태 — 비밀값은 DB에 저장하지 않음" },
  { key: "email-templates", label: "메일 템플릿", group: "시스템", endpoint: "/api/system/email-templates", description: "5개 언어 알림 템플릿" },
  { key: "audit-logs", label: "감사로그", group: "시스템", endpoint: "/api/system/audit-logs", description: "중요 쓰기 작업의 before/after 기록" },
  { key: "settings", label: "시스템 설정", group: "시스템", endpoint: "/api/system/settings", description: "도메인·언어·운영 정책" },
];

export const adminGroups = ["운영", "외부 운영", "CRM", "프로젝트", "통제", "조직", "재무", "평가", "지식", "시스템"];
