# JINBIZ Admin ERP IA 최신형 완성형 최종본

## 이번 단계 목표

* 첨부 기준 문서들과 지금까지 확정된 채팅 방향을 모두 반영해 **`docs/IA/admin-erp-ia.md` 최신형 완성형 최종본**을 다시 정리합니다.
* 이번 문서는 외부 홈페이지와 내부 ERP를 함께 받치는 문서 중, **관리자 ERP의 정보구조(IA)만 집중적으로 다루는 실행 기준서**입니다.
* 기존 확정안에 아래 3가지를 정식 요구사항으로 추가 확정합니다.

  * **PC, 모바일, 태블릿 등 모든 기기와 모든 환경에서 깨지거나 이탈되지 않는 반응형 웹앱**
  * **한국어, 영어, 일본어, 불어, 스페인어 공식 지원**
  * **대표 도메인 `www.jinbizman.com` 사용**

* 이번 최종본은 보기 좋은 메뉴 트리 문서가 아니라 **바로 화면 설계, 라우팅, 권한 매핑, 구현 순서로 연결 가능한 관리자 IA 기준서**로 작성합니다.
* `MangePage-Main-Guide`, `Develop-Total-Guide`, `Frontend-Develop-Guide`, `Backend-Develop-Guide`, `HomePage-Main-Guide`, `Development-Execution`에 공통으로 반영된 **서비스 허브 / 홈페이지 운영 / 뉴스·공지 / 문의·리드 / 프로젝트·WBS / 업무보고·업무일지 / 전자결재 / 평가 / 시스템 관리** 흐름을 관리자 IA로 재조립합니다.

---

## 변경 파일

이번 단계는 문서화 단계라 실제 코드 수정 파일은 없습니다.

다만 이 문서를 기준으로 바로 연결될 핵심 파일은 아래가 맞습니다.

* `src/pages/admin/DashboardPage.tsx`
* `src/pages/admin/services/ServiceHubPage.tsx`
* `src/pages/admin/services/ServiceDetailPage.tsx`
* `src/pages/admin/site/SiteContentPage.tsx`
* `src/pages/admin/site/SiteTranslationPage.tsx`
* `src/pages/admin/site/SiteSeoPage.tsx`
* `src/pages/admin/news/NewsAdminPage.tsx`
* `src/pages/admin/inquiries/InquiriesPage.tsx`
* `src/pages/admin/inquiries/InquiryDetailPage.tsx`
* `src/pages/admin/leads/LeadsPage.tsx`
* `src/pages/admin/opportunities/OpportunitiesPage.tsx`
* `src/pages/admin/wbs/ProjectsPage.tsx`
* `src/pages/admin/wbs/ProjectDetailPage.tsx`
* `src/pages/admin/wbs/WbsBoardPage.tsx`
* `src/pages/admin/wbs/WbsListPage.tsx`
* `src/pages/admin/wbs/WbsTemplatePage.tsx`
* `src/pages/admin/wbs/DailyReportPage.tsx`
* `src/pages/admin/wbs/DailyLogPage.tsx`
* `src/pages/admin/approvals/ApprovalsPage.tsx`
* `src/pages/admin/approvals/ApprovalDetailPage.tsx`
* `src/pages/admin/org/UsersPage.tsx`
* `src/pages/admin/org/RolesPage.tsx`
* `src/pages/admin/evaluations/EvaluationsPage.tsx`
* `src/pages/admin/evaluations/EvaluationEvidencePage.tsx`
* `src/pages/admin/system/AuditLogsPage.tsx`
* `src/pages/admin/system/SystemSettingsPage.tsx`
* `src/components/admin/SidebarNav.tsx`
* `src/components/admin/Topbar.tsx`
* `src/components/admin/MetricCard.tsx`
* `src/components/admin/FilterBar.tsx`
* `src/components/admin/PermissionGate.tsx`
* `src/components/common/LanguageSwitcher.tsx`
* `src/lib/navigation.ts`
* `src/lib/types.ts`
* `src/lib/permissions.ts`
* `src/lib/i18n.ts`
* `src/lib/responsive.ts`

관련 백엔드 연결 파일은 아래가 맞습니다.

* `worker/routes/admin/*`
* `worker/routes/erp/*`
* `worker/routes/system/*`
* `worker/lib/auth.ts`
* `worker/lib/permissions.ts`
* `worker/lib/locale.ts`
* `worker/lib/domain.ts`
* `worker/lib/seo.ts`

---

## 실행 명령어

이번 단계는 문서 확정 단계라 기본 확인 흐름은 아래 기준으로 둡니다.

```bash
npm install
npm run dev
npx wrangler dev
```

관리자 IA를 실제 화면으로 옮길 때 권장되는 기본 흐름은 아래와 같습니다.

```bash
npm create cloudflare@latest -- jinbiz --framework=react
npm install
npm install react-hook-form zod
npm install @tanstack/react-table
npm install recharts
npm install @dnd-kit/core @dnd-kit/sortable
npm run dev
```

---

## 확인 방법

아래가 맞으면 이번 관리자 ERP IA 문서는 정상으로 봐도 됩니다.

* 관리자 1차 메뉴가 **대시보드 / 서비스 허브 / 홈페이지 운영 / 뉴스·공지 / 문의·리드 / 프로젝트·WBS / 업무보고·업무일지 / 전자결재 / 조직·권한 / 평가 / 시스템 관리**로 명확히 정리되어 있는지
* 대시보드가 예쁜 카드 모음이 아니라 **오늘 통제해야 할 운영 상태판**으로 정리되어 있는지
* 서비스 허브가 특정 사이트 CMS가 아니라 **새 서비스 등록만 하면 관리자에 붙는 멀티 서비스 허브**로 보이는지
* 프로젝트/WBS, 아침 업무보고, 퇴근 업무일지가 **하나의 실행 흐름**으로 묶여 있는지
* 결재와 평가가 점수 입력 화면이 아니라 **운영 통제와 근거 데이터 중심 흐름**으로 정리되어 있는지
* 모바일/태블릿/데스크톱에서 관리자 메뉴, 표, 카드, 보드가 어떻게 바뀌는지 IA 규칙이 포함되어 있는지
* 5개 언어와 `www.jinbizman.com` 기준 정책이 관리자 운영 관점에서도 반영되어 있는지
* 권한별 메뉴 노출 기준이 포함되어 있는지
* 화면 우선순위와 1차 구현 순서가 포함되어 있는지
* 5단계 배포 완료 기준이 관리자 IA 단계와 연결되어 있는지
* 문서 마지막 체크리스트만 봐도 기존 파일을 즉시 대체할 수 있는지 확인 가능한지

---

## 문제 발생 시

* 메뉴만 나열하고 사용자 흐름을 안 적으면 실제 구현에서 화면 연결이 끊깁니다.
* 관리자 IA를 사이트 편집 화면 중심으로만 잡으면 ERP가 아니라 CMS처럼 보이게 됩니다.
* 서비스 허브와 홈페이지 운영을 섞어 쓰면 멀티 서비스 확장 구조가 흐려집니다.
* 프로젝트/WBS와 업무보고/업무일지를 분리해서 보면 ERP 핵심 흐름이 사라집니다.
* 결재와 평가를 별도 섬처럼 두면 운영 통제와 근거 데이터 축적이 약해집니다.
* 반응형 규칙을 후순위로 두면 태블릿/모바일 운영 현장에서 관리자 활용성이 무너집니다.
* 권한별 메뉴 노출을 나중에 붙이면 라우팅/사이드바/페이지 접근 제어가 다시 꼬입니다.
* 다국어/도메인 정책을 시스템 관리에만 넣으면 실제 운영 화면에서 언어별 발행과 canonical 검수가 빠집니다.

---

# 1. 최종 정의

이 문서에서 말하는 관리자 ERP IA의 정답은 단순한 “사이드바 메뉴 목록”이 아닙니다.

정답은 아래입니다.

> **JINBIZ Admin ERP IA는 서비스 운영, 홈페이지 운영, 문의 전환, 프로젝트 실행, WBS 관리, 아침 업무보고, 퇴근 업무일지, 전자결재, 평가 근거 데이터, 시스템 통제를 하나의 계정 체계와 하나의 화면 흐름 안에서 연결하는 정보구조다.**

이 IA는 아래 전제를 반드시 지켜야 합니다.

* 관리자 페이지는 **CMS가 아니라 ERP형 통합 운영 관리자**다.
* 핵심 엔진은 **서비스 허브 + 프로젝트/WBS + 업무보고/업무일지 + 평가 근거 데이터**다.
* 새 홈페이지/앱은 **서비스 등록만 하면 관리자 메뉴에 연결**되어야 한다.
* 모든 업무는 **프로젝트에 속하고, 모든 실무 기록은 WBS에 연결**되어야 한다.
* 평가는 점수보다 **근거 데이터**가 먼저 보여야 한다.
* 관리자 운영도 **반응형 웹앱** 전제를 가져야 한다.
* 관리자 운영에서도 언어/도메인 정책은 **5개 언어 + `www.jinbizman.com`** 기준을 따라야 한다.

---

# 2. 관리자 ERP의 IA 설계 원칙

## 2-1. CMS형이 아니라 운영 OS형

관리자 화면은 글 올리고 문구 수정하는 CMS처럼 보이면 안 됩니다.  
관리자 첫 화면에서부터 “운영 현황 → 실행 → 통제 → 판단” 흐름이 읽혀야 합니다.

## 2-2. 서비스 허브 우선

새 홈페이지, 랜딩페이지, 웹앱, 앱 운영 설정이 늘어날수록 관리자가 다시 뜯어고쳐지면 안 됩니다.  
따라서 IA는 서비스 허브를 독립 상위 메뉴로 둡니다.

## 2-3. WBS 중심

프로젝트와 WBS가 관리자 구조의 중앙에 있어야 합니다.  
업무보고, 업무일지, 결재, 평가가 모두 여기에 연결되어야 하기 때문입니다.

## 2-4. 운영 통제 우선

문의/리드, 게시 승인, 일정 변경 승인, 평가 확정 같은 흐름이 모두 관리자 안에서 이어져야 합니다.

## 2-5. 반응형 우선

사이드바, 테이블, 칸반, 편집기까지 포함해 모바일/태블릿/데스크톱 기준 IA가 있어야 합니다.

## 2-6. 권한 기반 노출 우선

사용자마다 모든 메뉴가 다 보이면 안 됩니다.  
역할과 스코프에 따라 메뉴 노출과 상세 화면 접근이 달라져야 합니다.

## 2-7. summary / detail 분리 우선

관리자 목록, 카드, 대시보드는 summary 데이터 기준으로 설계하고, 상세 편집/검토/드로어는 detail 데이터 기준으로 분리합니다.  
이 원칙이 있어야 모바일 카드형과 데스크톱 표형이 동시에 성립합니다.

---

# 3. 관리자 ERP 전체 구조 한눈에 보기

JINBIZ Admin ERP는 아래 5개 층으로 이해하는 것이 가장 정확합니다.

1. **상태 파악 층**  
   대시보드

2. **운영 관리 층**  
   서비스 허브 / 홈페이지 운영 / 뉴스·공지 / 문의·리드

3. **실행 관리 층**  
   프로젝트·WBS / 업무보고·업무일지

4. **통제 관리 층**  
   전자결재 / 조직·권한 / 시스템 관리

5. **판단 관리 층**  
   평가 / 리포트·통계(확장)

즉, 관리자 IA는 아래 흐름을 따라야 합니다.

```text
대시보드
  ↓
운영 관리 (서비스 허브, 홈페이지, 뉴스, 문의)
  ↓
실행 관리 (프로젝트, WBS, 업무보고, 업무일지)
  ↓
통제 관리 (결재, 권한, 시스템)
  ↓
판단 관리 (평가, 통계)
```

---

# 4. 관리자 1차 상위 메뉴 최종안

## 4-1. 1차 상위 메뉴

* 대시보드
* 서비스 허브
* 홈페이지 운영
* 뉴스/공지
* 문의/리드
* 프로젝트/WBS
* 업무보고/업무일지
* 전자결재
* 조직/권한
* 평가
* 시스템 관리

## 4-2. 메뉴 순서 원칙

순서를 바꾸면 안 되는 핵심 이유는 아래와 같습니다.

* **대시보드**는 첫 진입 상태판이므로 맨 앞
* **서비스 허브**는 멀티 서비스 확장성의 핵심이므로 운영 메뉴 중 최상위
* **홈페이지 운영 / 뉴스·공지 / 문의·리드**는 외부 운영 축
* **프로젝트/WBS / 업무보고·업무일지**는 내부 실행 축
* **전자결재 / 조직·권한 / 시스템 관리**는 통제 축
* **평가**는 최종 판단 축

## 4-3. 전역 고정 액션

어느 메뉴에 있든 상단 Topbar에서 최소 아래는 접근 가능해야 합니다.

* 전역 검색
* 알림
* 승인 대기 바로가기
* 언어 상태 확인
* 사용자 메뉴
* 로그아웃
* 오늘 해야 할 일 바로가기

---

# 5. 1차 메뉴별 2차 IA 상세

# 5-1. 대시보드

## 역할

* 관리자 첫 화면
* 오늘 당장 통제해야 하는 운영 상태판
* 여러 모듈을 통합해서 보여주는 허브

## 대시보드 카드

* 오늘 해야 할 일
* 업무보고 미제출자
* 업무일지 미제출자
* 지연 WBS
* 승인 대기
* 신규 문의
* 위험 프로젝트
* 리드 전환 현황

## 하위 블록

* 오늘 우선 처리 영역
* 나의 담당 업무
* 팀 상태 요약
* 최근 운영 이력
* 최근 승인 요청
* 최근 문의/리드
* 최근 서비스 변경 이력
* 언어별 발행 상태 요약

## 연결되는 대표 화면

* 지연 WBS 클릭 → `WbsBoardPage`
* 승인 대기 클릭 → `ApprovalsPage`
* 신규 문의 클릭 → `InquiriesPage`
* 위험 프로젝트 클릭 → `ProjectsPage`
* 미제출자 클릭 → `DailyReportPage` 또는 `DailyLogPage`

---

# 5-2. 서비스 허브

## 역할

* 새 홈페이지/앱을 등록하고 연결하는 관리자 확장성의 핵심
* 서비스 단위 운영의 출발점

## 2차 메뉴

* 전체 서비스 목록
* 서비스 등록
* 서비스 상세
* 서비스 설정
* 도메인/환경
* 언어 설정
* 권한 템플릿
* 운영 담당자
* 최근 변경 이력

## 서비스 상세 하위 탭

* 기본 정보
* 콘텐츠 모델
* 도메인/환경
* 언어/번역
* 권한/승인
* 배포 이력
* 변경 로그
* 반응형 QA 체크

## 핵심 화면

* `ServiceHubPage`
* `ServiceCreatePage`
* `ServiceDetailPage`
* `ServiceDomainsPage`
* `ServiceLocalesPage`
* `ServicePermissionsPage`

## 대표 사용자 흐름

1. 서비스 목록 진입
2. 새 서비스 등록
3. 운영 유형 선택
4. 콘텐츠 모델 연결
5. 권한 템플릿 연결
6. 도메인/환경 설정
7. 공식 지원 언어 설정
8. 관리자 메뉴 자동 노출

---

# 5-3. 홈페이지 운영

## 역할

* 서비스 허브에 등록된 서비스의 실제 공개 콘텐츠 운영
* 외부 홈페이지와 연결되는 사이트 운영 모듈

## 2차 메뉴

* 페이지 관리
* 콘텐츠 컬렉션
* 공통 컴포넌트
* 미디어 라이브러리
* SEO/OG 설정
* 배너/팝업
* 메뉴/네비게이션
* 도메인/환경
* 배포 이력
* 변경 승인
* 언어/번역 관리

## 대표 화면

* `SiteContentPage`
* `SitePageEditorPage`
* `SiteSeoPage`
* `SiteMediaPage`
* `SiteNavigationPage`
* `SiteTranslationsPage`
* `SiteDeployHistoryPage`

## 대표 사용자 흐름

1. 서비스 선택
2. 페이지 목록 조회
3. 페이지 편집
4. 언어별 번역 입력
5. SEO/slug 검토
6. 미리보기
7. 발행 요청
8. 승인 후 공개

---

# 5-4. 뉴스/공지

## 역할

* 뉴스레터 메뉴의 실제 운영 구조를 관리
* 보도자료 / 공시정보 / 공지사항 3탭 운영

## 2차 메뉴

* 보도자료
* 공시정보
* 공지사항
* 게시 승인
* 예약 발행
* 버전 이력
* 첨부파일 관리
* 언어별 발행 상태

## 대표 화면

* `NewsAdminPage`
* `NewsEditPage`
* `NewsApprovalQueuePage`
* `NewsVersionsPage`
* `NewsTranslationsPage`

## 대표 사용자 흐름

1. 카테고리 선택
2. 글 작성
3. 언어별 제목/본문 입력
4. SEO/slug 입력
5. 발행 예약 또는 즉시 발행 요청
6. 승인 대기
7. 공개 리스트/상세 반영

---

# 5-5. 문의/리드

## 역할

* 외부 문의를 내부 사업기회로 전환하는 운영 허브
* CRM의 시작점

## 2차 메뉴

* 문의 목록
* 문의 상세
* 상태 변경
* 담당자 배정
* 내부 메모
* 리드 목록
* 사업기회
* 프로젝트 전환
* 언어별 문의 분포
* 문의 통계

## 대표 화면

* `InquiriesPage`
* `InquiryDetailPage`
* `LeadsPage`
* `OpportunitiesPage`

## 대표 사용자 흐름

1. 신규 문의 확인
2. 담당자 배정
3. 후속 메모 기록
4. 리드 전환
5. 사업기회 승격
6. 프로젝트 생성 연결

---

# 5-6. 프로젝트/WBS

## 역할

* ERP의 실행 엔진
* 프로젝트와 WBS 중심 운영의 중심 메뉴

## 2차 메뉴

* 프로젝트 목록
* 프로젝트 상세
* WBS 보드
* WBS 리스트
* 간트
* 칸반
* 산출물
* 이슈/리스크
* 회의록
* 승인 이력
* WBS 템플릿
* 직군별 템플릿 관리

## 대표 화면

* `ProjectsPage`
* `ProjectDetailPage`
* `WbsBoardPage`
* `WbsListPage`
* `WbsGanttPage`
* `ProjectOutputsPage`
* `ProjectIssuesPage`
* `WbsTemplatesPage`

## 대표 사용자 흐름

1. 프로젝트 생성
2. 멤버 지정
3. WBS 템플릿 선택
4. 작업 생성
5. 담당자 배정
6. 상태 변경
7. 산출물/이슈 연결
8. 진척률 집계

---

# 5-7. 업무보고/업무일지

## 역할

* 아침 업무보고와 퇴근 업무일지를 한 축으로 묶는 실행 관리 메뉴
* WBS와 연결된 일일 기록의 입구

## 2차 메뉴

* 내 오늘 업무
* 아침 업무보고
* 퇴근 업무일지
* 팀 제출 현황
* 미제출자
* 지연 원인
* 보고/일지 히스토리

## 대표 화면

* `MyTodayWorkPage`
* `DailyReportPage`
* `DailyLogPage`
* `DailyReportStatusPage`
* `DailyLogStatusPage`

## 대표 사용자 흐름

1. 오늘 할 WBS 선택
2. 아침 업무보고 제출
3. 실시간 업무 수행
4. 퇴근 업무일지 제출
5. 지연 사유 기록
6. 다음 액션 연결
7. 프로젝트 진척률 반영

---

# 5-8. 전자결재

## 역할

* 운영 통제의 중심 허브
* 게시 승인, 일정 연장, 예산 승인, 공개 승인 등을 처리

## 2차 메뉴

* 결재 작성
* 결재 대기함
* 결재 진행함
* 결재 완료함
* 반려함
* 참조/열람
* 결재선 관리
* 서식 관리

## 대표 화면

* `ApprovalsPage`
* `ApprovalDetailPage`
* `ApprovalCreatePage`
* `ApprovalTemplatesPage`
* `ApprovalLinesPage`

## 대표 결재 서식

* 서비스 등록 승인
* 홈페이지 공개 승인
* 뉴스 발행 승인
* 프로젝트 개설 승인
* WBS 일정 연장 승인
* 예산/지출 승인
* 다국어 공개 승인
* 휴가/근태 승인

---

# 5-9. 조직/권한

## 역할

* 사용자, 부서, 역할, 권한, 메뉴 노출을 관리
* ERP의 접근 통제를 담당

## 2차 메뉴

* 사용자 계정
* 부서
* 직군/직무
* 역할 관리
* 권한 매핑
* 메뉴 노출 관리
* 로그인 정책
* 2차 인증(확장)

## 대표 화면

* `UsersPage`
* `DepartmentsPage`
* `RolesPage`
* `PermissionsPage`
* `MenuVisibilityPage`

---

# 5-10. 평가

## 역할

* 인사평가를 운영하는 메뉴
* 점수보다 근거 데이터를 먼저 보는 구조

## 2차 메뉴

* 평가 주기
* 평가 항목
* 평가 근거 데이터
* 점수 입력
* 피드백
* 확정 승인
* 이의제기/소명(확장)

## 대표 화면

* `EvaluationsPage`
* `EvaluationCyclePage`
* `EvaluationEvidencePage`
* `EvaluationScorePage`
* `EvaluationFinalizePage`

## 대표 사용자 흐름

1. 평가 주기 선택
2. 대상자 선택
3. WBS/산출물/결재/업무일지 evidence 검토
4. 점수 입력
5. 코멘트 입력
6. 확정 승인

---

# 5-11. 시스템 관리

## 역할

* ERP 운영의 통제실
* 서비스 유형, WBS 스타일, 코드값, 이메일/알림 정책, 로그를 관리

## 2차 메뉴

* 시스템 설정
* 코드 관리
* 서비스 유형 관리
* WBS 스타일 관리
* 평가 항목 관리
* 이메일 템플릿
* 알림 정책
* 감사 로그
* 로그인 기록
* 언어 설정
* 번역 운영 정책
* 도메인/SEO 공통 설정
* API 연동 관리

## 대표 화면

* `SystemSettingsPage`
* `CodeManagementPage`
* `EmailTemplatesPage`
* `AuditLogsPage`
* `SystemLocalesPage`
* `SystemSeoSettingsPage`

---

# 6. 관리자 화면 위계 구조

관리자 IA는 아래 위계로 이해하면 가장 자연스럽습니다.

## 6-1. Level 1

사이드바 상위 메뉴

예:
* 대시보드
* 서비스 허브
* 홈페이지 운영
* 프로젝트/WBS

## 6-2. Level 2

각 상위 메뉴의 리스트/카테고리/탭

예:
* 서비스 목록
* 페이지 관리
* WBS 보드
* 결재 대기함

## 6-3. Level 3

상세/에디터/드로어/모달

예:
* 서비스 상세
* 페이지 편집기
* WBS 상세 드로어
* 결재 상세
* 평가 근거 드로어

즉, 화면 위계는 아래처럼 갑니다.

```text
Level 1: 상위 메뉴
Level 2: 목록/탭/카테고리
Level 3: 상세/편집/드로어/모달
```

---

# 7. 대표 사용자 흐름별 IA

## 7-1. 새 서비스 등록 흐름

대시보드  
→ 서비스 허브  
→ 서비스 등록  
→ 운영 유형 선택  
→ 콘텐츠 모델 연결  
→ 권한 템플릿 연결  
→ 도메인/환경 설정  
→ 언어 설정  
→ 저장  
→ 홈페이지 운영 메뉴 자동 연결

## 7-2. 홈페이지 문구 수정 흐름

대시보드  
→ 홈페이지 운영  
→ 페이지 관리  
→ 페이지 선택  
→ 콘텐츠 편집  
→ 번역 탭 검토  
→ SEO/slug 검토  
→ 미리보기  
→ 발행 요청  
→ 전자결재 승인  
→ 공개 반영

## 7-3. 문의 → 프로젝트 전환 흐름

대시보드  
→ 문의/리드  
→ 문의 상세  
→ 담당자 배정  
→ 내부 메모  
→ 리드 전환  
→ 사업기회 생성  
→ 프로젝트 생성  
→ WBS 템플릿 연결

## 7-4. 프로젝트 실행 흐름

대시보드  
→ 프로젝트/WBS  
→ 프로젝트 생성  
→ 멤버 지정  
→ WBS 생성  
→ 업무 배정  
→ 아침 업무보고  
→ 퇴근 업무일지  
→ 진척률 집계  
→ 결재/승인 연결

## 7-5. 평가 흐름

대시보드  
→ 평가  
→ 평가 주기  
→ 대상자 선택  
→ 평가 근거 데이터 확인  
→ 점수 입력  
→ 확정 승인

---

# 8. 권한별 메뉴 노출 기준

## 8-1. super_admin

노출 메뉴:

* 전체 메뉴 노출
* 전체 시스템 설정 수정 가능

## 8-2. executive_admin

노출 메뉴:

* 대시보드
* 전자결재
* 평가
* 조직/권한 일부
* 시스템 관리 일부

## 8-3. service_admin

노출 메뉴:

* 대시보드
* 서비스 허브
* 홈페이지 운영
* 뉴스/공지
* 문의/리드
* 프로젝트/WBS 일부
* 시스템 관리 일부

## 8-4. project_pm

노출 메뉴:

* 대시보드
* 프로젝트/WBS
* 업무보고/업무일지
* 문의/리드 일부
* 전자결재 일부
* 평가 근거 열람 일부

## 8-5. news_operator

노출 메뉴:

* 대시보드
* 뉴스/공지
* 홈페이지 운영 일부
* 번역 발행 일부

## 8-6. translator

노출 메뉴:

* 홈페이지 운영 내 번역 탭
* 뉴스/공지 내 번역 탭
* 발행 요청 전까지 편집 가능

## 8-7. viewer

노출 메뉴:

* 일부 대시보드
* 일부 조회 전용 화면
* 수정/삭제/발행 불가

---

# 9. 반응형 IA 규칙

관리자 IA는 전 기기 대응이 전제입니다.

## 9-1. 데스크톱

* 고정 사이드바
* 상단 Topbar
* 테이블 + 상세 패널 병행
* 칸반/간트 전체 노출 가능

## 9-2. 태블릿

* 축소 사이드바
* 핵심 카드와 표 유지
* 일부 상세는 슬라이드 패널
* 다열 레이아웃은 2열 중심

## 9-3. 모바일

* 오프캔버스 사이드바
* 카드형 리스트 우선
* 상세는 전용 페이지 또는 풀스크린 드로어
* 대형 표는 카드형 전환 또는 안전한 가로 스크롤
* WBS 보드는 요약 탭 + 필터 우선
* 승인 대기와 오늘 해야 할 일은 1탭 이내 접근 유지

## 9-4. 관리자 반응형 핵심 원칙

* 메뉴가 숨겨져도 흐름이 끊기면 안 됨
* “오늘 해야 할 일”과 “승인 대기”는 모바일에서도 1탭 이내 접근 가능해야 함
* 서비스 허브, 문의 목록, WBS 보드, 결재 목록, 평가 근거는 모바일에서도 기본 확인 가능해야 함

---

# 10. 다국어/도메인 운영이 IA에 반영되는 방식

## 10-1. 관리자 기본 운영 언어

* 1차 운영 언어는 한국어 중심

## 10-2. 관리자에서 지원해야 하는 언어 운영 기능

* 언어별 콘텐츠 입력
* 언어별 번역 상태 관리
* 언어별 미리보기
* 언어별 공개/비공개
* 언어별 slug/SEO 관리

## 10-3. 관리자에서 보이는 도메인 정책

* canonical: `https://www.jinbizman.com`
* locale prefix URL
* `hreflang`/alternate 정책 확인
* 미발행 언어 숨김 정책 확인

즉, 다국어와 도메인은 시스템 관리에만 있는 설정이 아니라 **서비스 허브 / 홈페이지 운영 / 뉴스·공지 / 번역 편집기**에서 모두 드러나야 합니다.

---

# 11. 라우팅 구조 권장안

## 11-1. 관리자 라우트 기본

* `/admin/dashboard`
* `/admin/services`
* `/admin/site/pages`
* `/admin/site/seo`
* `/admin/site/translations`
* `/admin/news`
* `/admin/inquiries`
* `/admin/leads`
* `/admin/opportunities`
* `/admin/projects`
* `/admin/wbs`
* `/admin/daily-report`
* `/admin/daily-log`
* `/admin/approvals`
* `/admin/users`
* `/admin/roles`
* `/admin/evaluations`
* `/admin/system/audit-logs`
* `/admin/system/settings`

## 11-2. 상세 라우트 예시

* `/admin/services/:serviceId`
* `/admin/site/pages/:pageId`
* `/admin/news/:newsId`
* `/admin/inquiries/:inquiryId`
* `/admin/projects/:projectId`
* `/admin/wbs/:taskId`
* `/admin/approvals/:approvalId`
* `/admin/evaluations/:cycleId/:userId`

---

# 12. 관리자 사이드바 정보구조 권장 객체

```ts
export const adminNavigation = [
  {
    key: "dashboard",
    label: "대시보드",
    path: "/admin/dashboard",
    roles: ["super_admin", "executive_admin", "service_admin", "project_pm", "viewer"],
  },
  {
    key: "services",
    label: "서비스 허브",
    path: "/admin/services",
    roles: ["super_admin", "service_admin"],
    children: [
      { key: "service-list", label: "전체 서비스 목록", path: "/admin/services" },
      { key: "service-create", label: "서비스 등록", path: "/admin/services/new" },
    ],
  },
  {
    key: "site",
    label: "홈페이지 운영",
    path: "/admin/site/pages",
    roles: ["super_admin", "service_admin", "news_operator", "translator"],
    children: [
      { key: "site-pages", label: "페이지 관리", path: "/admin/site/pages" },
      { key: "site-seo", label: "SEO/OG 설정", path: "/admin/site/seo" },
      { key: "site-translations", label: "언어/번역 관리", path: "/admin/site/translations" },
    ],
  },
  {
    key: "news",
    label: "뉴스/공지",
    path: "/admin/news",
    roles: ["super_admin", "service_admin", "news_operator", "translator"],
  },
  {
    key: "inquiries",
    label: "문의/리드",
    path: "/admin/inquiries",
    roles: ["super_admin", "service_admin", "project_pm"],
  },
  {
    key: "projects",
    label: "프로젝트/WBS",
    path: "/admin/projects",
    roles: ["super_admin", "service_admin", "project_pm"],
  },
  {
    key: "daily",
    label: "업무보고/업무일지",
    path: "/admin/daily-report",
    roles: ["super_admin", "project_pm"],
  },
  {
    key: "approvals",
    label: "전자결재",
    path: "/admin/approvals",
    roles: ["super_admin", "executive_admin", "service_admin", "project_pm"],
  },
  {
    key: "org",
    label: "조직/권한",
    path: "/admin/users",
    roles: ["super_admin", "executive_admin"],
  },
  {
    key: "evaluations",
    label: "평가",
    path: "/admin/evaluations",
    roles: ["super_admin", "executive_admin", "project_pm"],
  },
  {
    key: "system",
    label: "시스템 관리",
    path: "/admin/system/settings",
    roles: ["super_admin", "executive_admin"],
  },
] as const;
```

---

# 13. 5단계 배포 완료 기준과 IA 연결

## 13-1. 1단계 — 관리자 셸과 공통 구조

포함 IA:

* 관리자 셸
* SidebarNav
* Topbar
* 대시보드 기본 카드
* 권한별 메뉴 노출 기본

완료 기준:

* 로그인 후 관리자 진입 가능
* 기본 상위 메뉴 노출 가능
* 반응형 셸 전환 가능

## 13-2. 2단계 — 서비스 허브와 공개 운영 기반

포함 IA:

* 서비스 허브
* 홈페이지 운영 기본
* 다국어/도메인 탭
* 뉴스/공지 기본

완료 기준:

* 서비스 등록 흐름 확인 가능
* 언어/도메인 관리 진입 가능
* 공개 운영 IA 성립

## 13-3. 3단계 — 문의 전환과 프로젝트 실행 기반

포함 IA:

* 문의/리드
* 프로젝트/WBS
* 템플릿
* 산출물/이슈

완료 기준:

* 문의 → 리드 → 프로젝트 흐름 진입 가능
* WBS 중심 메뉴 흐름 성립

## 13-4. 4단계 — 업무보고/업무일지와 결재

포함 IA:

* 업무보고/업무일지
* 결재 대기/진행/완료
* 게시 승인/일정 변경 승인

완료 기준:

* 모든 보고/일지가 WBS와 연결됨
* 결재 통제 화면이 실사용 가능

## 13-5. 5단계 — 평가 근거와 시스템 통제

포함 IA:

* 평가 근거 데이터
* 점수 입력/확정
* 감사 로그
* 시스템 설정
* 권한 세분화

완료 기준:

* 평가 화면보다 근거 화면이 먼저 동작
* 감사/권한/시스템 화면까지 완결됨

---

# 14. 1차 구현 우선순위 기준 IA

실제 구현은 아래 순서가 가장 안전합니다.

## 14-1. 1차 우선 화면

1. 관리자 셸
2. 대시보드
3. 서비스 허브
4. 홈페이지 운영 기본
5. 문의/리드
6. 프로젝트/WBS
7. 업무보고/업무일지
8. 뉴스/공지
9. 전자결재
10. 평가 근거 열람 기본
11. 조직/권한 기본
12. 시스템 관리 기본

## 14-2. 나중에 확장해도 되는 화면

* 일정/회의
* 경비/정산/재무
* 문서/지식관리
* 리포트/통계 고도화
* 인사/근태 고도화
* 번역 검수 워크플로 고도화

---

# 15. 관리자 IA에서 절대 빠지면 안 되는 연결 규칙

* 서비스 등록 없는 서비스 운영 메뉴 생성 금지
* WBS 없는 업무보고/업무일지 금지
* 평가 근거 없는 평가 확정 금지
* 문의 저장과 후속 처리 흐름 분리 금지
* 언어별 발행 상태 없는 다국어 UI 금지
* `www.jinbizman.com` 기준 없는 공개 운영 금지
* 모바일에서 핵심 운영 메뉴 접근이 2~3단계 이상 깊어지는 구조 금지
* 대시보드 카드가 상세 실행 화면으로 연결되지 않는 구조 금지
* 평가 화면에서 evidence보다 score가 먼저 보이는 구조 금지

---

# 16. 문서 교체용 최종 체크리스트

## 16-1. 이 문서가 기존 `admin-erp-ia.md`를 즉시 대체할 수 있어야 하는 이유

* 관리자 1차 상위 메뉴가 명확히 정리돼 있습니다.
* 각 메뉴의 2차 구조와 대표 화면이 정리돼 있습니다.
* 서비스 허브, 홈페이지 운영, 문의/리드, 프로젝트/WBS, 업무보고/업무일지, 결재, 평가, 시스템 관리가 모두 포함돼 있습니다.
* 대표 사용자 흐름과 권한별 메뉴 노출 기준이 포함돼 있습니다.
* 반응형 IA 규칙과 다국어/도메인 운영 규칙이 포함돼 있습니다.
* 5단계 배포 완료 기준 연결과 1차 구현 우선순위가 포함돼 있습니다.
* 관리자 사이드바 설정 객체 수준까지 바로 구현에 연결 가능하게 정리돼 있습니다.

## 16-2. 최종 검수 체크리스트

### 메뉴 구조
* 대시보드
* 서비스 허브
* 홈페이지 운영
* 뉴스/공지
* 문의/리드
* 프로젝트/WBS
* 업무보고/업무일지
* 전자결재
* 조직/권한
* 평가
* 시스템 관리

### 핵심 흐름
* 서비스 등록 → 운영 연결
* 문의 → 리드 → 프로젝트
* 프로젝트 → WBS → 업무보고/일지
* 결재 → 승인 흐름
* evidence → 평가

### 운영 정책
* 5개 언어
* `www.jinbizman.com`
* 모바일/태블릿/데스크톱 반응형
* 권한별 메뉴 노출
* CMS가 아닌 ERP 구조

---

## 변경 요약

* `docs/IA/admin-erp-ia.md`를 **관리자 ERP 정보구조 전용 실행 문서**로 재정의했습니다.
* 관리자 1차 상위 메뉴, 2차 메뉴, 대표 화면, 사용자 흐름, 권한별 노출 기준을 정리했습니다.
* 서비스 허브 중심 확장형 구조와 WBS 중심 실행 구조를 IA 관점으로 반영했습니다.
* 반응형, 다국어, 도메인 정책을 관리자 운영 관점으로 내려 정리했습니다.
* 5단계 배포 완료 기준과 1차 구현 우선순위까지 포함했습니다.

---

## 다음 단계

가장 자연스러운 다음 작업은 **이 문서를 기준으로 `src/lib/navigation.ts` 전체본과 `src/pages/admin/*` 페이지 골격, 그리고 관리자 사이드바 메뉴 설정 객체를 바로 생성하는 것**입니다.
