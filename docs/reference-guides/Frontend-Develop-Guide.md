## 이번 단계 목표

* 첨부 기준 문서들과 지금까지 확정된 채팅 방향을 모두 반영해 **JINBIZ 프론트엔드 개발 가이드 최신형 완성형 최종본**을 다시 정리합니다.
* 이번 문서는 외부 홈페이지와 내부 ERP 관리자까지 포함한 **프론트엔드 중심 실행 기준서**입니다.
* 기존 확정안에 아래 3가지를 정식 요구사항으로 추가 확정합니다.

  * **PC, 모바일, 태블릿 등 모든 기기와 모든 환경에서 깨지거나 이탈되지 않는 반응형 웹앱**
  * **한국어, 영어, 일본어, 불어, 스페인어 공식 지원**
  * **대표 도메인 `www.jinbizman.com` 사용**
* 이번 최종본은 보기 좋은 기획문서가 아니라 **바로 구현에 들어갈 수 있는 프론트 기준서**로 작성합니다.
* 홈 기준 문서, 관리자 기준 문서, 종합 가이드, 백엔드 가이드, 실행 문서, 협업 기능정의서를 함께 반영해 **원본 세부 유지 + 누락 복원 + 신규 정책 통합** 기준으로 다시 묶습니다.

첨부 기준 문서 공통 방향은 이미 고정되어 있습니다. 외부는 **회사소개형 AI 서비스 기업 홈페이지**, 내부는 **CMS가 아닌 WBS 중심 ERP**, 운영 핵심은 **서비스 허브·프로젝트/WBS·아침 업무보고·퇴근 업무일지·평가 근거 데이터**입니다.

---

## 변경 파일

이번 단계는 문서화 단계라 실제 코드 수정은 없습니다.

다만 이 가이드를 기준으로 실제 구현 시 바로 연결될 핵심 파일은 아래가 맞습니다.

* `src/main.tsx`
* `src/App.tsx`
* `src/routes.tsx`
* `src/pages/HomePage.tsx`
* `src/pages/CompanyPage.tsx`
* `src/pages/BusinessPage.tsx`
* `src/pages/NewsletterPage.tsx`
* `src/pages/ContactPage.tsx`
* `src/pages/NotFoundPage.tsx`
* `src/pages/admin/DashboardPage.tsx`
* `src/pages/admin/services/ServiceHubPage.tsx`
* `src/pages/admin/services/ServiceDetailPage.tsx`
* `src/pages/admin/site/SiteContentPage.tsx`
* `src/pages/admin/site/SiteTranslationPage.tsx`
* `src/pages/admin/site/SiteSeoPage.tsx`
* `src/pages/admin/news/NewsAdminPage.tsx`
* `src/pages/admin/inquiries/InquiriesPage.tsx`
* `src/pages/admin/inquiries/InquiryDetailPage.tsx`
* `src/pages/admin/wbs/ProjectsPage.tsx`
* `src/pages/admin/wbs/ProjectDetailPage.tsx`
* `src/pages/admin/wbs/WbsBoardPage.tsx`
* `src/pages/admin/wbs/WbsTemplatePage.tsx`
* `src/pages/admin/wbs/DailyReportPage.tsx`
* `src/pages/admin/wbs/DailyLogPage.tsx`
* `src/pages/admin/approvals/ApprovalsPage.tsx`
* `src/pages/admin/approvals/ApprovalDetailPage.tsx`
* `src/pages/admin/evaluations/EvaluationsPage.tsx`
* `src/pages/admin/evaluations/EvaluationDetailPage.tsx`
* `src/pages/admin/system/AuditLogsPage.tsx`
* `src/pages/admin/system/SystemSettingsPage.tsx`
* `src/components/common/*`
* `src/components/sections/*`
* `src/components/admin/*`
* `src/components/common/LanguageSwitcher.tsx`
* `src/components/common/AppShell.tsx`
* `src/components/admin/AdminShell.tsx`
* `src/components/admin/SidebarNav.tsx`
* `src/components/admin/Topbar.tsx`
* `src/components/admin/DataTable.tsx`
* `src/components/admin/MetricCard.tsx`
* `src/components/admin/WbsTaskDrawer.tsx`
* `src/components/admin/WbsKanbanBoard.tsx`
* `src/components/admin/FilterBar.tsx`
* `src/components/admin/PermissionGate.tsx`
* `src/lib/api.ts`
* `src/lib/types.ts`
* `src/lib/navigation.ts`
* `src/lib/validators.ts`
* `src/lib/i18n.ts`
* `src/lib/responsive.ts`
* `src/lib/seo.ts`
* `src/lib/permissions.ts`
* `src/hooks/*`
* `src/contexts/AuthContext.tsx`
* `src/contexts/LocaleContext.tsx`
* `src/styles/tokens.css`
* `src/styles/globals.css`

외부 페이지와 관리자 페이지는 같은 `src/` 아래에서 관리하고, 공통 토큰과 공통 컴포넌트 세트를 공유하는 구조가 맞습니다. 백엔드와 실행 문서도 실제 구현의 중심을 `src/`, `worker/`, `db/migrations/`에 두고 있습니다.

---

## 실행 명령어

```bash
npm create cloudflare@latest -- jinbiz --framework=react
npm install
npm install @neondatabase/serverless
npm install react-hook-form zod
npm install @tanstack/react-table
npm install recharts
npm install @dnd-kit/core @dnd-kit/sortable
npm install hono @hono/zod-openapi jose
npm run dev
npm run build
npx wrangler dev
npx wrangler deploy
```

실행 문서 기준 로컬 실행은 `npm install`, `npm run dev`, `npx wrangler dev` 흐름으로 고정되어 있고, 배포는 `npm run build`, `npx wrangler deploy` 기준입니다.

---

## 확인 방법

* 첫 화면 3초 안에 **AI 서비스 회사**로 인식되어야 합니다.
* 상단 메뉴는 `메인 홈 / 회사소개 / 사업소개 / 뉴스레터 / 문의하기` 5개로 고정입니다.
* 뉴스레터는 실제로 `보도자료 / 공시정보 / 공지사항` 구조여야 합니다.
* 관리자 페이지는 CMS처럼 보이면 안 되고, **서비스 허브·WBS·업무보고·업무일지·결재·문의/리드·평가 근거 데이터**가 보이는 ERP여야 합니다.
* 모든 보고는 WBS와 연결되어야 합니다.
* 새 홈페이지나 앱은 서비스 등록만으로 관리자에서 관리 가능한 구조여야 합니다.
* 외부 홈페이지와 내부 ERP 모두 **PC·모바일·태블릿에서 깨지지 않는 반응형 웹앱**이어야 합니다.
* 공개 페이지와 공개 콘텐츠는 **한국어·영어·일본어·불어·스페인어**를 공식 지원해야 합니다.
* 공개 URL 기준은 **`www.jinbizman.com`** 으로 통일되어야 합니다.
* 평가 화면보다 먼저 **평가 근거 데이터가 보이는 UI**가 있어야 합니다.
* 5단계 배포 완료 기준이 프론트 구현 순서 안에 반영되어야 합니다.

---

## 문제 발생 시

* 외부 홈페이지와 ERP를 별도 프로젝트처럼 설계하면 공통 디자인, 권한, 데이터 흐름이 끊깁니다.
* 관리자 UI를 특정 사이트 전용 CMS처럼 만들면 서비스 확장성이 바로 깨집니다.
* WBS 없이 업무보고부터 만들면 진척도, 지연 원인, 평가 근거가 남지 않습니다.
* 다국어를 텍스트 덧붙이기 수준으로 처리하면 언어별 발행, 검수, SEO 운영이 불가능해집니다.
* 반응형을 외부 홈페이지에만 적용하고 ERP는 데스크톱 전용처럼 만들면 실제 운영성이 무너집니다.
* 공개 GitHub 코드를 그대로 복사하면 JINBIZ 구조와 맞지 않는 화면 패턴이 섞입니다.
* 페이지별 TSX만 먼저 만들고 공통 셸과 공통 상태 설계를 나중으로 미루면 중복과 레이아웃 파손이 급격히 늘어납니다.
* 대형 표를 그대로 모바일에 밀어 넣으면 관리자 ERP 실사용성이 무너집니다.
* `www.jinbizman.com` 기준 canonical/locale 정책을 프론트에 반영하지 않으면 SEO와 언어 전환 품질이 동시에 무너집니다.

---

# JINBIZ 프론트엔드 개발 가이드 최신형 완성형 최종본

## 1. 최종 정의

이번 프론트엔드의 역할은 아래 2개를 동시에 만족시키는 것입니다.

첫째, 외부에는 **회사소개형 AI 서비스 기업 홈페이지**가 보여야 합니다.
둘째, 내부에는 **WBS 중심 ERP형 관리자**가 보여야 합니다.

즉 JINBIZ 프론트엔드는 단순 회사소개 사이트가 아니라, **브랜드 인식용 외부 경험**과 **실행 관리용 내부 경험**을 하나의 React 앱 안에서 묶는 구조입니다.

이번 최종본에서 정식 고정하는 프론트 요구사항은 아래 3가지입니다.

* 대표 도메인: **`www.jinbizman.com`**
* 외부 홈페이지와 내부 ERP 모두: **반응형 웹앱**
* 공개 서비스 공식 지원 언어: **한국어 / 영어 / 일본어 / 불어 / 스페인어**

그리고 프론트는 아래를 반드시 충족해야 합니다.

* 외부 페이지와 관리자 화면이 **같은 디자인 토큰**을 공유할 것
* 서비스 허브, WBS, 업무보고/일지, 평가 근거 데이터가 **UI 계층에서도 하나의 흐름**으로 보일 것
* 관리자 ERP가 **CMS처럼 보이지 않고 운영 OS처럼 보여야 할 것**
* 반응형, 다국어, 도메인 정책이 선언만이 아니라 **컴포넌트/레이아웃/라우팅/상태 처리 규칙**으로 내려와 있을 것

---

## 2. 이번 프로젝트에서 공개 레퍼런스를 쓰는 방식

이번 프로젝트는 “좋아 보이는 오픈소스 UI를 가져다 붙이는 방식”으로 하면 안 됩니다. 역할별로 나눠서 참고해야 합니다.

### 2-1. 구조 출발점

Cloudflare 공식 구조는 **앱의 출발점**으로 참고합니다.
React + Vite 프론트와 Worker API를 한 프로젝트 안에서 운영하는 구조가 JINBIZ와 가장 잘 맞습니다.

### 2-2. 화면 라이브러리 적용 기준

* **React Hook Form + Zod**
  * 문의 폼
  * 서비스 등록
  * WBS 생성
  * 일일보고/일지
  * 번역 발행 폼

* **TanStack Table**
  * 서비스 목록
  * 문의 목록
  * 사용자 목록
  * 결재 목록
  * 뉴스/공지 목록
  * 평가 근거 목록

* **Recharts**
  * 대시보드 지표
  * 프로젝트 진척률
  * 지연 사유 분포
  * 문의→리드 전환율
  * 언어별 운영 통계

* **dnd-kit**
  * WBS 칸반
  * 우선순위 변경
  * 정렬 가능한 서비스 카드
  * 가시적 드래그 정렬이 필요한 관리자 UI

* **TailAdmin 같은 템플릿**
  * 레이아웃 참고만
  * 전체 구조 복붙 금지
  * 카드 밀도, 여백, 테이블 헤더 처리 방식 참고만 허용

### 2-3. 공개 레퍼런스를 그대로 가져오면 안 되는 이유

* JINBIZ는 일반 SaaS admin이 아니라 **멀티 서비스 허브 + WBS 중심 ERP** 구조입니다.
* 공개 템플릿은 **평가 근거 데이터**, **WBS 없는 업무 금지**, **언어별 발행 상태**, **서비스 등록 기반 확장** 같은 규칙을 기본으로 갖고 있지 않습니다.
* 따라서 JINBIZ는 **레이아웃 참고 + 일부 기술 참고 + 자체 컴포넌트 구현** 방식이 맞습니다.

### 2-4. 최종 채택 원칙

* **무조건 채택:** React + Vite 구조, Tailwind CSS, TypeScript
* **강력 권장:** React Hook Form, Zod
* **필요 시 즉시 채택:** TanStack Table, Recharts
* **보드가 실제 필요할 때 채택:** dnd-kit
* **참고만:** 관리자 템플릿 레이아웃

---

## 3. 프론트엔드 아키텍처 최종안

JINBIZ 프론트는 **하나의 React 앱 안에서 외부 홈페이지와 관리자 ERP를 함께 운영**하는 구조가 맞습니다.
외부와 내부가 같은 브랜드, 같은 디자인 토큰, 같은 운영 원칙을 공유해야 하기 때문입니다.

### 3-1. 권장 구조

```text
src/
├─ components/
│  ├─ common/
│  ├─ sections/
│  └─ admin/
├─ pages/
│  ├─ HomePage.tsx
│  ├─ CompanyPage.tsx
│  ├─ BusinessPage.tsx
│  ├─ NewsletterPage.tsx
│  ├─ ContactPage.tsx
│  ├─ NotFoundPage.tsx
│  └─ admin/
│     ├─ DashboardPage.tsx
│     ├─ services/
│     ├─ site/
│     ├─ news/
│     ├─ inquiries/
│     ├─ wbs/
│     ├─ approvals/
│     ├─ org/
│     ├─ evaluations/
│     └─ system/
├─ hooks/
├─ contexts/
├─ lib/
│  ├─ api.ts
│  ├─ navigation.ts
│  ├─ permissions.ts
│  ├─ seo.ts
│  ├─ types.ts
│  ├─ validators.ts
│  ├─ i18n.ts
│  └─ responsive.ts
├─ styles/
│  ├─ tokens.css
│  └─ globals.css
└─ main.tsx
```

### 3-2. 핵심 원칙

* 외부 페이지와 관리자 페이지는 **같은 디자인 토큰**을 공유합니다.
* 데이터는 모두 Worker API를 통해 가져옵니다.
* 프론트에서 DB에 직접 접근하지 않습니다.
* 상태관리는 페이지 로컬 상태 + context로 시작합니다.
* 관리자 메뉴, 테이블, 폼은 공통 컴포넌트화합니다.
* 다국어는 `lib/i18n.ts`와 언어별 라우팅 규칙으로 관리합니다.
* 반응형은 컴포넌트 수준이 아니라 **레이아웃 시스템 수준**으로 관리합니다.
* summary/detail 응답 구조를 전제로, 목록과 상세 화면을 분리합니다.
* 모든 화면은 **로딩 / 빈 상태 / 에러 / 권한 없음** 4가지 기본 상태를 가집니다.

### 3-3. 셸 구조

#### 외부 셸

* PublicHeader
* PublicContainer
* PublicFooter
* Locale-aware route wrapper
* Canonical/SEO helper hook

#### 관리자 셸

* AdminShell
* SidebarNav
* Topbar
* Breadcrumb
* FilterBar
* PageHeader
* ActionGroup
* ContentArea

### 3-4. 왜 한 앱 구조가 맞는가

* 외부 홈페이지와 ERP가 **같은 브랜드 톤**을 가져야 합니다.
* 서비스 허브, 문의, 뉴스, 공개 페이지가 **같은 데이터 흐름**을 공유합니다.
* 언어 전환, canonical, 디자인 토큰, 권한별 메뉴 제어를 **중복 없이** 관리할 수 있습니다.

---

## 4. 대표 도메인과 라우팅 구조 최종안

대표 도메인은 **`www.jinbizman.com`** 입니다.
프론트는 이 도메인을 기준으로 URL, canonical, language switch, breadcrumb, 공개 링크 표시를 처리해야 합니다.

### 4-1. 외부 기본 라우트

* `/`
* `/company`
* `/business`
* `/newsletter`
* `/contact`

### 4-2. 다국어 라우트

* `/en`
* `/en/company`
* `/en/business`
* `/en/newsletter`
* `/en/contact`
* `/ja/...`
* `/fr/...`
* `/es/...`

### 4-3. 관리자 라우트

* `/admin/dashboard`
* `/admin/services`
* `/admin/services/:serviceId`
* `/admin/site/pages`
* `/admin/site/translations`
* `/admin/site/seo`
* `/admin/news`
* `/admin/news/:id`
* `/admin/inquiries`
* `/admin/inquiries/:id`
* `/admin/projects`
* `/admin/projects/:id`
* `/admin/wbs`
* `/admin/wbs/templates`
* `/admin/daily-report`
* `/admin/daily-log`
* `/admin/approvals`
* `/admin/approvals/:id`
* `/admin/evaluations`
* `/admin/evaluations/:cycleId/:userId`
* `/admin/system/audit-logs`
* `/admin/system/settings`

### 4-4. 라우팅 원칙

* 한국어는 기본 루트 유지
* 영어/일본어/불어/스페인어는 locale prefix 사용
* 관리자 ERP는 1차에서 한국어 중심 운영
* 공개 콘텐츠는 언어별 SEO와 URL 분리
* canonical 기준은 항상 `www.jinbizman.com`
* 언어 전환 시 **가능하면 동일 페이지 유지**
* 미발행 언어 페이지는 fallback이 아니라 **숨김 또는 NotFound 처리**

### 4-5. 라우팅 구현 권장 방식

* `react-router-dom` 기반 route tree 구성
* locale param parser 또는 path prefix parser 사용
* `useResolvedPath`, `useNavigate`를 이용한 locale-aware navigation helper 제공
* `navigation.ts`에서 외부 메뉴 / 관리자 메뉴 / 권한별 메뉴 분리

---

## 5. 외부 홈페이지 프론트엔드 기준

외부 홈페이지는 5개 메뉴로 고정합니다.

* 메인 홈
* 회사소개
* 사업소개
* 뉴스레터
* 문의하기

### 5-1. 공통 구현 원칙

* 첫인상 3초 안에 **AI 서비스 회사**로 인식
* 모바일 우선
* 반응형 Hero / 카드 / CTA
* 5개 언어 지원
* SEO/OG 메타정보 페이지별 분리
* 너무 많은 스크롤 효과와 장식성 애니메이션 금지
* 한 페이지 안에 **하나의 핵심 CTA 흐름** 유지

### 5-2. HomePage

#### 역할

첫 화면에서 **AI 서비스 회사**로 인식시키는 것

#### 필수 섹션

* Header
* Hero
* 핵심 메시지 3카드
* 회사소개 프리뷰
* 사업소개 프리뷰
* 유레카월드 강조
* 뉴스레터 유도
* 문의 유도
* Footer

#### 구현 원칙

* Hero는 모바일에서 텍스트/비주얼 수직 재배치
* CTA 2개는 모바일에서 세로 스택 허용
* 핵심 메시지 카드는 모바일 1열, 태블릿 2열, 데스크톱 3열
* 언어별 헤드라인 길이를 감안해 높이 고정 금지
* 첫 뷰에서 브랜드 문구, AI 서비스 정체성, CTA가 함께 보여야 함

#### 권장 컴포넌트 분해

* `HomeHeroSection`
* `CoreMessageCardsSection`
* `CompanyPreviewSection`
* `BusinessPreviewSection`
* `EurekaHighlightSection`
* `NewsletterPromoSection`
* `ContactPromoSection`

### 5-3. CompanyPage

#### 역할

**회사 정체성과 신뢰 형성**

#### 필수 섹션

* 페이지 헤더
* 회사 개요
* 회사 정의
* 비전
* 핵심 가치
* 연혁

#### 구현 원칙

* 대표 인사말 없음
* 과도한 문의 유도 없음
* 연혁은 모바일 세로 타임라인 우선
* 설명문은 카드 안 3~5줄 내 가독성 유지
* 비전과 가치 카드 높이 고정 금지

#### 권장 컴포넌트

* `CompanyIntroSection`
* `CompanyDefinitionSection`
* `VisionSection`
* `ValuesSection`
* `TimelineSection`

### 5-4. BusinessPage

#### 역할

3개 사업축을 명확하게 설명하는 것

#### 순서 고정

* AI 서비스
* 플랫폼 사업
* 기획 서비스

#### 구현 원칙

* 순서 변경 금지
* 각 사업 카드/섹션은 독립적인 색상 포인트만 허용
* 긴 문단보다 카드와 소제목 중심
* 하단 CTA는 모바일에서 전체 폭 버튼 허용
* 유레카월드는 작업 중심 AI 서비스 수준으로만 설명

#### 권장 컴포넌트

* `BusinessOverviewSection`
* `AiServiceSection`
* `PlatformBusinessSection`
* `PlanningFoundationSection`
* `HowWeWorkSection`
* `BusinessCtaSection`

### 5-5. NewsletterPage

#### 실제 운영 구조

* 보도자료
* 공시정보
* 공지사항

#### 구현 원칙

* 1차 오픈은 구독 기능 없음
* EmptyState를 디자인 포함 상태로 구현
* 탭이 언어 전환 후에도 깨지지 않도록 유연 폭 사용
* 리스트/상세 구조는 SEO를 고려해 미리 설계
* 카테고리 탭은 URL query 또는 path segment와 연결 가능

#### 권장 컴포넌트

* `NewsletterTabs`
* `NewsList`
* `NewsListItem`
* `NewsEmptyState`
* `NewsCategoryBadge`

### 5-6. ContactPage

#### 역할

문의 저장과 전환의 시작점

#### 필드

* 이름
* 회사명/소속
* 이메일
* 연락처
* 문의 유형
* 문의 내용

#### 구현 원칙

* 모바일 1열, 데스크톱 2열
* 제출 중 버튼 비활성화
* 에러 메시지는 언어별 분리
* 완료 메시지 다국어 제공
* 입력 최소 길이와 형식 검증은 프론트 + 백 양쪽 적용

#### 권장 컴포넌트

* `ContactForm`
* `ContactIntroPanel`
* `ContactSuccessMessage`
* `ContactMetaInfo`

---

## 6. 관리자 ERP 프론트엔드 기준

관리자 페이지는 CMS처럼 보이면 안 됩니다.
서비스 운영, 프로젝트 실행, 업무 보고, 업무 일지, 결재, 문의 전환, 조직 운영, 평가까지 연결하는 **통합 운영 OS**처럼 보여야 합니다.

### 6-1. 상위 메뉴

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

### 6-2. DashboardPage

#### 보여줘야 하는 것

* 오늘 해야 할 일
* 업무보고 미제출자
* 업무일지 미제출자
* 지연 WBS
* 승인 대기
* 신규 문의
* 위험 프로젝트
* 리드 전환 현황

#### 구현 원칙

* 대시보드는 예쁜 카드 모음이 아니라 **오늘 통제할 상태판**이어야 합니다.
* 중요도 높은 항목부터 상단 배치
* 모바일에서는 카드 스택, 데스크톱에서는 2~4열 매트릭스 허용
* 상세 이동 CTA를 각 카드에 포함

#### 권장 컴포넌트

* `MetricCard`
* `AlertListCard`
* `RiskProjectCard`
* `PendingApprovalCard`
* `SubmissionStatusCard`

### 6-3. ServiceHubPage

이 화면이 JINBIZ 확장성의 핵심입니다.

#### 포함 항목

* 전체 서비스 목록
* 서비스 등록
* 운영 상태
* 연결 환경
* 담당자
* 권한 템플릿
* 언어 설정
* 최근 변경 이력

#### 구현 원칙

* 서비스 등록만으로 관리자 메뉴에 즉시 연결되는 구조를 전제로 설계
* 목록은 summary, 상세는 drawer 또는 detail route 사용
* 상태 배지, locale badge, env badge를 공통화

#### 권장 컴포넌트

* `ServiceSummaryTable`
* `ServiceStatusBadge`
* `ServiceLocaleChips`
* `ServiceFormModal`
* `ServiceChangeLogPanel`

### 6-4. SiteContentPage

#### 포함 항목

* 메인 홈 관리
* 회사소개 관리
* 사업소개 관리
* 뉴스레터 관리
* 문의 페이지 관리
* SEO/OG
* 공통 CTA
* 도메인/환경
* 언어/번역 관리
* 배포 이력
* 변경 승인

#### 구현 원칙

* 서비스 선택 → 콘텐츠 타입 선택 → 콘텐츠 아이템 목록 → 번역/발행 상세 순서
* 페이지별 고정 카피를 코드 하드코딩하지 않고 콘텐츠 모델로 관리
* 번역 상태 badge, 발행 상태 badge, 검수 상태 badge 필수

### 6-5. NewsAdminPage

#### 포함 항목

* 보도자료
* 공시정보
* 공지사항
* 예약 발행
* 상단 고정
* 버전 이력
* 언어별 게시 상태

#### 구현 원칙

* 외부 `NewsletterPage`와 관리자 발행 데이터가 자연스럽게 연결되어야 함
* 빈 상태와 필터 상태를 모두 구분
* 카테고리 전환이 모바일에서 가로 스크롤 없이 동작해야 함

### 6-6. InquiriesPage

#### 포함 항목

* 문의 목록
* 상태 변경
* 담당자 배정
* 내부 메모
* 리드 전환
* 프로젝트 연결
* 언어별 문의 분포

#### 구현 원칙

* 리스트/상세 분리
* 모바일에서는 카드형 목록, 데스크톱에서는 표형 목록
* 우선순위 처리 필요 문의를 상단 정렬 가능

### 6-7. ProjectsPage / WbsBoardPage

#### 포함 항목

* 프로젝트 목록
* WBS 리스트
* 칸반
* 간트
* 업무 상세 드로어
* 산출물
* 이슈/리스크
* 승인 이력

#### 구현 원칙

* 프로젝트 유형 + 참여 직군 선택만으로 WBS 기본 골격을 자동 생성하는 구조를 전제로 설계
* 칸반과 리스트가 같은 데이터 모델을 보도록 설계
* 모바일에서는 전체 칸반보다 담당자 중심 My Tasks 뷰 우선

### 6-8. DailyReportPage / DailyLogPage

#### 핵심 원칙

* 모든 보고는 WBS 연결 필수
* WBS 없는 보고 금지
* 실제 진척률은 0~100 제한
* 지연 사유와 다음 액션 기록
* 모바일에서도 최소 입력 흐름이 끊기지 않아야 함

#### 권장 구성

* 날짜 선택
* 프로젝트 선택
* WBS 아이템 반복 입력
* 저장/임시저장
* 제출 상태
* 이전 보고/일지 불러오기

### 6-9. ApprovalsPage

#### 포함 항목

* 대기
* 진행
* 완료
* 반려
* 서식 관리
* 다국어 공개 승인

#### 구현 원칙

* 서식별 아이콘/배지 분리
* 승인 액션은 확인 모달 포함
* 상세 화면에는 요청 데이터, 관련 서비스, 관련 프로젝트, 첨부, 코멘트가 함께 보여야 함

### 6-10. EvaluationsPage

점수만 입력하는 UI로 만들면 안 됩니다.

#### 우선 보여줘야 하는 것

* 평가 주기
* 개인별 근거 데이터 요약
* WBS/산출물/지연/협업 이력
* 점수 입력
* 코멘트
* 이의제기 상태

#### 구현 원칙

* 평가 점수보다 **근거 요약 카드**가 먼저 보이게 설계
* 직무별 기대치를 반영한 설명 문구 제공
* 평가 확정 전 상태와 확정 후 상태를 시각적으로 명확히 구분

### 6-11. AuditLogsPage / SystemSettingsPage

#### AuditLogsPage

* request_id
* actor
* target
* action
* result
* created_at
* locale
* service_id / project_id 필터

#### SystemSettingsPage

* canonical 도메인
* locale 기본값
* 공개 locale 목록
* SEO 템플릿
* 공통 CTA 문구
* 알림 정책
* 배포 정책

---

## 7. 디자인 시스템 최종안

외부 홈페이지와 관리자 ERP는 같은 디자인 토큰을 공유해야 합니다.

### 7-1. 컬러 토큰

* Primary Navy: `#143B7D`
* Deep Navy: `#0F2E63`
* Light Blue Gray: `#EEF4FB`
* Soft Background: `#F8FAFD`
* White: `#FFFFFF`
* AI Accent: `#18A7B5`
* Platform Accent: `#7C4DDB`
* Planning Accent: `#2F7EDB`
* Text Primary: `#1F2937`
* Text Secondary: `#6B7280`
* Border: `#D9E2EC`
* Success: `#0F9F6E`
* Warning: `#D97706`
* Danger: `#DC2626`

### 7-2. 타이포그래피 원칙

* H1: 32~40px 데스크톱 / 28~32px 모바일
* H2: 24~32px
* H3: 20~24px
* 본문: 15~18px
* 보조: 13~15px
* 관리 표 텍스트: 13~14px 중심

### 7-3. 공통 컴포넌트 세트

* `Button`
* `IconButton`
* `PageHeader`
* `SectionHeader`
* `InfoCard`
* `MetricCard`
* `StatusBadge`
* `EmptyState`
* `ErrorState`
* `LoadingState`
* `FormField`
* `FormSection`
* `Tabs`
* `Modal`
* `Drawer`
* `DataTable`
* `SidebarNav`
* `Topbar`
* `FilterBar`
* `SearchInput`
* `LanguageSwitcher`
* `PermissionGate`
* `SeoMeta`

### 7-4. UI 원칙

* 화이트 중심
* 네이비 중심 제목
* 카드형 구성
* 넓은 여백
* 큰 제목, 짧은 설명
* 한 화면에 강조색 남발 금지
* 언어가 바뀌어도 동일 컴포넌트가 안전하게 작동해야 함
* 고정 높이보다 유연 높이 우선
* 데스크톱만 예쁘고 모바일이 깨지는 설계 금지

### 7-5. 피해야 할 것

* 우주풍 과장 이미지 남발
* 불필요한 유리질 효과 남발
* 모바일 2열 강제 유지
* 다국어 문자열이 긴데도 폭을 고정한 버튼
* 테이블만 있고 모바일 대체 뷰가 없는 관리자 UI

---

## 8. 반응형 웹앱 구현 기준

외부 홈페이지와 ERP 모두를 대상으로, 전 기기와 모든 환경에서 깨지거나 이탈되지 않는 반응형 웹앱 구현을 필수 기준으로 고정합니다.

### 8-1. 반응형 시스템 원칙

* 모바일 우선 설계
* `max-width` 중심 레이아웃
* 고정 높이 최소화
* 긴 문자열 대응 `break-words`, `min-w-0` 적용
* 탭, 버튼, 카드 제목은 다국어 길이 고려
* 데스크톱 표는 모바일 카드 뷰 대체 설계
* 사이드바는 모바일 오프캔버스, 태블릿 이상 고정형
* 헤더는 스크롤 상황에서도 주요 액션 유지
* WBS 보드, 결재 목록, 문의 목록, 뉴스 편집기까지 반응형 포함

### 8-2. 브레이크포인트 운영 기준

* `xs`: 360px~430px
* `sm`: 640px 전후
* `md`: 768px 전후
* `lg`: 1024px 전후
* `xl`: 1280px 전후
* `2xl`: 1440px 이상

### 8-3. 외부 페이지 반응형 기준

* Hero: 텍스트/비주얼 수직 재배치
* 카드: 1열 → 2열 → 3열 확장
* CTA: 가로 배치 불가 시 세로 스택
* 뉴스 탭: 유연 폭 + wrap 또는 safe horizontal scroll 최소화
* 문의 폼: 모바일 1열, 데스크톱 2열

### 8-4. 관리자 ERP 반응형 기준

* 모바일: 오프캔버스 사이드바, 카드 중심 전환
* 태블릿: 축소 사이드바 + 핵심 테이블 유지
* 데스크톱: 풀 ERP 레이아웃
* 대형 테이블은 카드형 변환 또는 안전한 가로 스크롤 허용
* WBS 보드는 My Tasks 우선 대체 뷰 제공
* FilterBar는 모바일에서 접기/펼치기 허용

### 8-5. QA 필수 대상

* iPhone Safari
* Android Chrome
* iPad 세로/가로
* 데스크톱 Chrome/Edge
* 언어 전환 후 레이아웃 확인
* ERP 로그인/대시보드/WBS/문의/뉴스 편집기 확인

### 8-6. 반응형 구현 Helper 기준

`src/lib/responsive.ts` 권장 항목:

* `isMobileWidth()`
* `isTabletWidth()`
* `getGridColumnsByWidth()`
* `shouldUseCardTableView()`
* `getDrawerPlacementByWidth()`

---

## 9. 다국어 구현 기준

공식 지원 언어는 한국어, 영어, 일본어, 불어, 스페인어로 고정합니다.
ERP는 1차 운영 언어를 한국어 중심으로 두되, 언어별 콘텐츠 관리와 발행 제어를 처음부터 지원해야 합니다.

### 9-1. 구현 원칙

* 공개 페이지는 5개 언어 공식 지원
* 기본 언어는 한국어
* 언어별 slug 분리
* 언어별 SEO title/description 분리
* 언어별 게시 상태 분리
* 번역 미완료 언어는 미공개 처리
* 브랜드 문구는 기계 번역이 아니라 검수형 운영

### 9-2. 프론트 구조

* `src/lib/i18n.ts`에서 지원 언어 상수 관리
* `LanguageSwitcher`는 외부 헤더와 푸터, 관리자 번역 편집기에서 공용 사용
* 페이지 문자열은 사전 파일 또는 CMS 응답형 구조로 관리
* 뉴스/공지/문의 완료 메시지도 언어별 분리

### 9-3. 권장 타입

```ts
export const supportedLocales = ["ko", "en", "ja", "fr", "es"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];
export const defaultLocale: SupportedLocale = "ko";
```

### 9-4. 번역 발행 UI 원칙

* locale tabs 제공
* draft / review / published / hidden 상태 표시
* 기본 언어 없이 보조 언어 단독 발행 금지 경고
* slug 충돌 검증 메시지 제공
* 언어별 SEO 메타 필드 분리

### 9-5. URL 정책

* 한국어: `/`
* 영어: `/en/...`
* 일본어: `/ja/...`
* 불어: `/fr/...`
* 스페인어: `/es/...`

### 9-6. LanguageSwitcher 구현 기준

* 현재 페이지 유지형 전환 우선
* 미발행 언어면 disabled 또는 숨김
* 관리자 번역 편집기에서는 locale chip 형태도 함께 제공
* 푸터에서도 재사용 가능해야 함

---

## 10. 프론트 상태 설계

상태관리를 과하게 시작하지 말고, 페이지 로컬 상태와 context 중심으로 갑니다. 또한 모든 화면에 로딩, 빈 상태, 에러, 권한 없음 상태 4가지를 기본으로 둡니다.

### 10-1. 기본 원칙

* 페이지 로컬 상태 우선
* 공통 사용자 정보/권한은 context
* 폼은 React Hook Form
* 입력 검증은 Zod
* 큰 표는 TanStack Table
* 칸반은 dnd-kit
* 차트는 Recharts

### 10-2. Context 권장 범위

* `AuthContext`
  * 로그인 사용자 정보
  * roles
  * permissions
  * isAuthenticated

* `LocaleContext`
  * currentLocale
  * availableLocales
  * switchLocale

* `AdminLayoutContext`
  * sidebarOpen
  * currentNavGroup
  * mobile drawer state

### 10-3. 모든 화면의 기본 상태

* 로딩 상태
* 빈 데이터 상태
* 에러 상태
* 권한 없음 상태

### 10-4. 공통 상태 컴포넌트 규칙

* `LoadingState`: skeleton 또는 spinner
* `EmptyState`: 액션 가능 여부 분리
* `ErrorState`: 재시도 버튼 포함
* `ForbiddenState`: 권한 설명 + 뒤로 이동

### 10-5. summary / detail 분리 원칙

* 목록 화면은 summary만 사용
* 상세 drawer/modal/detail page는 detail 응답 사용
* 프론트는 summary를 억지로 상세 뷰에 재사용하지 않음

---

## 11. 프론트가 알아야 하는 데이터 구조

프론트는 DB를 직접 다루지 않지만, 어떤 화면이 어떤 응답 구조를 소비하는지 정확히 알아야 안전하게 설계할 수 있습니다.

### 11-1. 핵심 테이블/응답 축

* `services`
* `service_domains`
* `service_content_items`
* `service_translations`
* `news_posts`
* `news_post_translations`
* `inquiries`
* `projects`
* `wbs_templates`
* `wbs_tasks`
* `daily_reports`
* `daily_report_items`
* `daily_logs`
* `daily_log_items`
* `approval_documents`
* `evaluation_cycles`
* `evaluation_scores`
* `evaluation_evidences`

### 11-2. 프론트 핵심 연결 이해

* `daily_report_items.wbs_task_id` → 업무보고 UI에서 WBS 선택 필수
* `daily_log_items.wbs_task_id` → 일지 UI에서 WBS 선택 필수
* `evaluation_evidences` → 평가 상세에서 근거 카드 제공
* `service_translations` → 번역 편집기 / locale tabs
* `service_domains` → canonical / locale-aware 링크 생성

### 11-3. 프론트에서 먼저 타입화할 응답

* `ServiceSummary`
* `ServiceDetail`
* `InquirySummary`
* `InquiryDetail`
* `ProjectSummary`
* `ProjectDetail`
* `WbsTaskSummary`
* `WbsTaskDetail`
* `DailyReportDraft`
* `DailyLogDraft`
* `ApprovalSummary`
* `ApprovalDetail`
* `EvaluationEvidenceSummary`

---

## 12. 기능 명세서 최종안

### 12-1. 문의 폼

#### 목적

* 외부 문의 접수
* 관리자 저장 + 이메일 알림 트리거

#### 입력

* `inquiryType`
* `companyName`
* `name`
* `email`
* `phone`
* `message`
* `locale`

#### 프론트 규칙

* 이름 필수
* 이메일 형식 필수
* 문의 내용 10자 이상
* 제출 중 버튼 비활성화
* 성공 후 폼 초기화
* 완료 메시지는 locale 기준 노출

### 12-2. 서비스 등록 폼

#### 목적

새 홈페이지/앱을 ERP 관리 대상으로 등록

#### 입력

* `serviceCode`
* `serviceName`
* `serviceType`
* `domain`
* `envType`
* `contentModelCode`
* `permissionTemplateCode`
* `supportedLocales`
* `defaultLocale`

#### 프론트 규칙

* 서비스 코드 중복 경고
* 서비스 유형 변경 시 필드 노출 변경
* 언어 선택 시 기본 언어 1개 필수
* 성공 시 상세 화면 이동

### 12-3. WBS 생성 폼

#### 목적

프로젝트 안에서 구조화된 업무 생성

#### 입력

* `projectId`
* `templateId`
* `title`
* `assigneeUserId`
* `dueDate`
* `priority`
* `requiresApproval`

#### 프론트 규칙

* 프로젝트 필수
* 담당자 필수
* 템플릿 선택 시 기본 항목 자동 채움
* 완료 후 보드 즉시 갱신

### 12-4. 아침 업무보고 / 퇴근 업무일지

#### 공통 원칙

* WBS 연결 필수
* 날짜/프로젝트 명확히 선택
* 모바일에서도 작성 가능한 단일 컬럼 폼
* 저장 후 대시보드 집계에 반영
* 지연이면 사유 코드 입력 UI 활성화

### 12-5. 뉴스/공지 발행 폼

* 카테고리 필수
* 제목/요약/본문 분리
* locale tabs 제공
* 발행 상태 badge 표시
* 예약 발행 입력 시 timezone 표시

### 12-6. 평가 입력 폼

* 근거 데이터 요약 먼저 표시
* 점수 입력은 항목별 분리
* 최종 확정 전 재검토 모달
* 권한 없는 사용자는 열람만 허용 또는 차단

---

## 13. 페이지별 상세 구현 규칙

### 13-1. HomePage TSX 규칙

* page-level data를 API 없이도 렌더 가능하게 기본 카피 fallback 유지
* 추후 CMS 연결 시 section 단위 props 구조로 전환 가능하게 설계
* SEO title/description helper 적용

### 13-2. CompanyPage TSX 규칙

* static-like page지만 data model 연결을 고려한 section 컴포넌트 구조 유지
* timeline item은 locale 길이 차이 대응

### 13-3. BusinessPage TSX 규칙

* 사업 3축 순서 변경 금지
* platform case preview가 추가되어도 레이아웃이 깨지지 않게 카드 그리드 구조 유지

### 13-4. NewsletterPage TSX 규칙

* 탭과 list state를 분리
* empty / loading / list / error 상태를 명확히 구분
* 향후 상세 페이지 route로 자연스럽게 이어질 수 있게 설계

### 13-5. ContactPage TSX 규칙

* 제출 성공시 toast + in-page message 병행 가능
* locale hidden/default field 유지
* 문의 유형 옵션은 공용 enum과 연결

### 13-6. DashboardPage TSX 규칙

* 데이터 카드 우선순위 고정
* 카드의 숫자와 상태 레이블은 서버 enum과 동일한 공용 타입 사용
* 모바일 카드와 데스크톱 매트릭스 레이아웃 모두 고려

### 13-7. ServiceHubPage TSX 규칙

* table view + card view dual layout 준비
* 서비스 등록 modal 또는 별도 페이지 둘 중 하나로 통일
* locale/domain badges는 재사용 컴포넌트화

### 13-8. WbsBoardPage TSX 규칙

* 칸반/리스트 전환 지원
* drag handle 영역과 클릭 상세 열기 영역 분리
* blocked / delayed / review 상태를 시각적으로 분명히 표현

### 13-9. DailyReportPage / DailyLogPage TSX 규칙

* 반복 입력 item은 field array 사용
* WBS 검색/선택 UX를 빠르게 설계
* 이전 제출 데이터 불러오기 shortcut 제공 가능

### 13-10. EvaluationsPage TSX 규칙

* cycle selector
* evaluation evidence summary cards
* score matrix
* comment panel
* permission gate 필수

---

## 14. 공통 파일별 역할 상세 기준

### 14-1. `src/main.tsx`

* router mount
* global styles import
* AuthProvider / LocaleProvider 연결

### 14-2. `src/App.tsx`

* route tree
* public/admin shell composition
* error boundary level handling

### 14-3. `src/lib/api.ts`

* 공통 fetch wrapper
* JSON 응답 파싱
* success/error 규약 통일
* request credentials 포함
* query builder helper

### 14-4. `src/lib/types.ts`

* 공용 enum
* summary/detail interfaces
* locale type
* permission codes
* dashboard card types

### 14-5. `src/lib/navigation.ts`

* public nav items
* admin nav items
* role/permission based filtering
* locale-aware path generator

### 14-6. `src/lib/i18n.ts`

* supported locales 상수
* default locale
* locale validation helper
* locale labels
* switch helper

### 14-7. `src/lib/responsive.ts`

* breakpoints
* helper functions
* card/table switch rules
* drawer placement helpers

### 14-8. `src/styles/tokens.css`

* color tokens
* radius
* spacing scale
* shadow scale
* admin/public shared tokens

### 14-9. `src/components/common/LanguageSwitcher.tsx`

* public header/footer 공용
* translation editor sub-header에서도 재사용 가능
* 현재 locale, available locales, disabled locale 처리

### 14-10. `src/components/admin/DataTable.tsx`

* TanStack Table wrapper
* desktop table + mobile card alternative
* loading / empty / error integrated states

### 14-11. `src/components/admin/PermissionGate.tsx`

* permission code check
* forbidden fallback UI
* children conditional render

---

## 15. 공통 코드 예시

### 15-1. `src/lib/i18n.ts`

```ts
export const supportedLocales = ["ko", "en", "ja", "fr", "es"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale: SupportedLocale = "ko";

export const localeLabels: Record<SupportedLocale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  fr: "Français",
  es: "Español",
};

export function isSupportedLocale(value: string): value is SupportedLocale {
  return supportedLocales.includes(value as SupportedLocale);
}
```

### 15-2. `src/lib/navigation.ts`

```ts
import type { SupportedLocale } from "./i18n";

export type NavItem = {
  label: string;
  path: string;
};

export const publicNavItems: NavItem[] = [
  { label: "메인 홈", path: "/" },
  { label: "회사소개", path: "/company" },
  { label: "사업소개", path: "/business" },
  { label: "뉴스레터", path: "/newsletter" },
  { label: "문의하기", path: "/contact" },
];

export function withLocale(path: string, locale: SupportedLocale) {
  if (locale === "ko") return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}
```

### 15-3. `src/styles/tokens.css`

```css
:root {
  --color-primary-navy: #143b7d;
  --color-deep-navy: #0f2e63;
  --color-light-blue-gray: #eef4fb;
  --color-soft-bg: #f8fafd;
  --color-white: #ffffff;
  --color-ai-accent: #18a7b5;
  --color-platform-accent: #7c4ddb;
  --color-planning-accent: #2f7edb;
  --color-text-primary: #1f2937;
  --color-text-secondary: #6b7280;
  --color-border: #d9e2ec;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --shadow-card: 0 8px 24px rgba(15, 46, 99, 0.08);
}
```

### 15-4. `src/components/common/LanguageSwitcher.tsx`

```tsx
import { localeLabels, supportedLocales, type SupportedLocale } from "../../lib/i18n";

type LanguageSwitcherProps = {
  currentLocale: SupportedLocale;
  availableLocales?: SupportedLocale[];
  onChange: (locale: SupportedLocale) => void;
};

export function LanguageSwitcher({
  currentLocale,
  availableLocales = supportedLocales,
  onChange,
}: LanguageSwitcherProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {supportedLocales.map((locale) => {
        const disabled = !availableLocales.includes(locale);
        const active = locale === currentLocale;

        return (
          <button
            key={locale}
            type="button"
            disabled={disabled}
            onClick={() => onChange(locale)}
            className={[
              "rounded-full border px-3 py-1.5 text-sm",
              active ? "bg-slate-900 text-white" : "bg-white text-slate-700",
              disabled ? "cursor-not-allowed opacity-40" : "",
            ].join(" ")}
          >
            {localeLabels[locale]}
          </button>
        );
      })}
    </div>
  );
}
```

### 15-5. `src/pages/ContactPage.tsx`

```tsx
import { useForm } from "react-hook-form";

type ContactFormValues = {
  inquiryType: string;
  companyName: string;
  name: string;
  email: string;
  phone: string;
  message: string;
};

export function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    defaultValues: {
      inquiryType: "general",
      companyName: "",
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    console.log(values);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h1 className="text-3xl font-bold text-slate-900">문의하기</h1>
          <p className="mt-3 text-slate-600">
            AI 서비스, 플랫폼 협업, 사업 기획 관련 문의를 남겨주세요.
          </p>
        </section>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <input
            {...register("name", { required: "이름을 입력해주세요." })}
            className="w-full rounded-xl border px-4 py-3"
            placeholder="이름"
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}

          <input
            type="email"
            {...register("email", { required: "이메일을 입력해주세요." })}
            className="w-full rounded-xl border px-4 py-3"
            placeholder="이메일"
          />

          <textarea
            rows={6}
            {...register("message", {
              required: "문의 내용을 입력해주세요.",
              minLength: { value: 10, message: "문의 내용은 10자 이상 입력해주세요." },
            })}
            className="w-full rounded-xl border px-4 py-3"
            placeholder="문의 내용"
          />
          {errors.message && <p className="text-sm text-red-600">{errors.message.message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-slate-900 px-5 py-3 text-white md:w-auto"
          >
            {isSubmitting ? "접수 중..." : "문의 보내기"}
          </button>
        </form>
      </div>
    </main>
  );
}
```

---

## 16. 서비스 허브 · 콘텐츠 모델 · 다국어 운영 프론트 설계

### 16-1. 서비스 허브를 먼저 두는 이유

* 새 홈페이지/앱이 생겨도 화면 구조를 뜯어고치지 않기 위해
* 관리자 메뉴와 권한, 언어, 도메인, 콘텐츠 모델을 같은 흐름으로 제어하기 위해
* 외부 홈페이지와 ERP의 연결점을 프론트에서도 명확히 만들기 위해

### 16-2. 서비스 레지스트리 UI 필수 항목

* 서비스명
* 서비스 코드
* 서비스 유형
* 운영 상태
* 연결 도메인
* 연결 환경
* 관리자 노출 여부
* 담당자
* 권한 템플릿
* 콘텐츠 모델
* 지원 언어 목록
* 기본 언어
* 최근 변경일

### 16-3. 콘텐츠 모델 기반 운영 원칙

프론트는 페이지를 코드로 하드코딩하더라도, 최종 운영은 다음 콘텐츠 타입을 전제로 설계해야 합니다.

* `hero_section`
* `feature_cards`
* `business_items`
* `news_posts`
* `platform_cases`
* `faq_items`
* `service_announcements`
* `download_buttons`

### 16-4. 다국어 발행 UI 규칙

* 기본 언어 미입력 시 발행 버튼 비활성화
* 보조 언어는 draft 상태로 시작
* 검수 완료 후 published로 승격
* 미발행 언어는 public navigation에서 숨김

---

## 17. 상태값 표준과 공통 규칙

### 17-1. 상태값 표준

* 서비스: `draft / active / maintenance / retired`
* 콘텐츠/뉴스: `draft / review / published / archived`
* 문의: `new / in_progress / resolved / converted`
* 리드: `new / qualified / proposal / won / lost`
* 프로젝트: `planned / active / paused / completed / cancelled`
* WBS: `todo / in_progress / review / approval_wait / done / delayed / blocked`
* 결재: `draft / submitted / approved / rejected / cancelled`
* 평가 주기: `draft / open / scoring / finalized / closed`
* 번역: `draft / in_translation / review / published / hidden`

### 17-2. 공통 규칙

* enum 문자열은 프론트/백 공용 타입으로 관리
* status badge 색상 매핑은 공통 helper 사용
* summary/detail 응답 구분을 UI도 그대로 따름
* 한 화면에서 서로 다른 상태 체계를 섞지 않음

---

## 18. 권한 기반 메뉴/화면 제어 규칙

### 18-1. 기본 역할

* `super_admin`
* `executive_admin`
* `service_admin`
* `site_operator`
* `news_operator`
* `translator`
* `reviewer`
* `pm`
* `team_lead`
* `finance_manager`
* `hr_evaluator`
* `general_member`
* `viewer`

### 18-2. 프론트 권한 제어 원칙

* 권한 없는 메뉴는 숨기거나 비활성화
* 직접 URL 접근 시도 시 ForbiddenState 처리
* 메뉴 노출과 액션 가능 여부를 분리
* 평가 확정, 도메인/SEO 변경, 번역 발행 등은 별도 권한 분리

### 18-3. PermissionGate 사용 기준

* 관리자 레이아웃 메뉴
* 상단 액션 버튼
* 상세 화면의 수정/삭제/발행 버튼
* 평가 확정 버튼
* 승인 액션 버튼

---

## 19. 5단계 배포 완료 기준 최종안

이 장은 반드시 반영해야 하는 **실행형 배포 완료 기준**입니다.
문서를 읽는 순간 바로 구현 우선순위를 잡을 수 있어야 하므로, 아래 5단계를 최종 기준으로 고정합니다.

## 19-1. 1단계 배포 완료 기준 — 외부 브랜드 골격 완성

### 포함 범위

* 메인 홈
* 회사소개
* 사업소개
* 뉴스레터 리스트 골격
* 문의하기 화면 골격
* 공통 헤더/푸터
* 디자인 토큰 1차 적용

### 완료 기준

* 방문자가 첫 화면에서 AI 서비스 회사로 인식
* 5개 메뉴 구조 고정
* 회사소개에 대표 인사말/과도한 CTA 없음
* 사업소개 순서가 올바름
* 뉴스레터가 3탭 구조를 가짐
* 문의 페이지가 실제 폼 형태를 가짐
* PC/모바일/태블릿 기본 레이아웃이 깨지지 않음

## 19-2. 2단계 배포 완료 기준 — 반응형/다국어/도메인 체계 완성

### 포함 범위

* `src/lib/i18n.ts`
* 언어 선택기
* 언어별 라우트
* canonical / hreflang 정책
* `www.jinbizman.com` 기준 URL 정책
* 반응형 보강

### 완료 기준

* 한국어/영어/일본어/불어/스페인어 라우트 구조 동작
* 언어 전환 시 동일 페이지 유지
* 미발행 언어는 fallback이 아니라 숨김 처리
* `www.jinbizman.com` 기준 SEO가 정리
* 360px~1440px 이상에서 가로 스크롤 없음
* 버튼 겹침/카드 이탈/텍스트 깨짐 없음

## 19-3. 3단계 배포 완료 기준 — 문의와 관리자 셸, 서비스 허브 기본 완성

### 포함 범위

* 문의 API 연결
* 문의 DB 저장
* 이메일 알림
* 관리자 셸
* 대시보드 기본 카드
* 서비스 허브 기본 CRUD
* 홈페이지 운영 기본 화면

### 완료 기준

* 문의 입력 → 저장 → 성공 메시지 검증
* ERP에서 문의 목록 조회 가능
* 이메일 알림 동시 발생
* 관리자 셸이 반응형으로 동작
* 서비스 등록 시 언어/도메인/권한 템플릿 설정 가능
* 홈페이지 콘텐츠를 ERP에서 수정 가능한 골격 확보

## 19-4. 4단계 배포 완료 기준 — WBS, 업무보고/일지, 뉴스 운영, 결재 완성

### 포함 범위

* 프로젝트/WBS
* 아침 업무보고
* 퇴근 업무일지
* 뉴스/공지 운영
* 발행 승인
* 기본 전자결재
* 감사 로그 일부

### 완료 기준

* 모든 업무보고/일지가 WBS를 참조
* 프로젝트 진척률 자동 집계 시작
* 뉴스레터 리스트/상세와 관리자 발행 연결
* 게시 승인 플로우 동작
* 결재 서식 일부 운영 가능
* 감사 로그에 주요 변경 이력 저장

## 19-5. 5단계 배포 완료 기준 — 평가 근거, 보안, 테스트, 운영 기준 완성

### 포함 범위

* 평가 근거 데이터 집계
* 권한 세분화
* 보안 강화
* Rate Limit 연계 확인
* 구조화 로그를 소비하는 운영 화면 기본
* 핵심 시나리오 QA
* 1차 공개 배포

### 완료 기준

* 평가 점수 전에 근거 데이터가 보임
* 권한별 메뉴/데이터 접근 분리
* 비밀정보 하드코딩 없음
* 문의 시나리오와 WBS 시나리오 핵심 테스트 통과
* 외부 사이트는 공개
* 내부 ERP는 권한 사용자만 접근

---

## 20. 개발 순서 최종안

1단계
React + Vite + Workers 기본 프로젝트 생성

2단계
외부 홈페이지 5개 정적 페이지 완성

3단계
디자인 토큰 + 공통 컴포넌트 + `LanguageSwitcher` 구축

4단계
다국어 구조와 `www.jinbizman.com` 기준 URL 정책 반영

5단계
문의하기 폼 + API 연결

6단계
관리자 셸 레이아웃 구축

7단계
서비스 허브 화면 구축

8단계
프로젝트/WBS 리스트 및 상세 화면 구축

9단계
아침 업무보고 / 퇴근 업무일지 화면 구축

10단계
뉴스/공지 관리자와 외부 뉴스레터 연결

11단계
결재 화면 기본 구현

12단계
평가 근거 요약 화면 구현

13단계
권한별 메뉴 노출, 로딩/빈 상태/에러 상태 정리

14단계
테스트/관측성/배포 점검

---

## 21. 먼저 만들면 안 되는 것

* 과한 관리자 디자인 시스템
* 인증 고도화 선도입
* 실시간 기능 선도입
* 결제 시스템 선도입
* WebSocket 선도입
* 거대한 리팩터링
* 과한 폴더 분리
* 다국어 기계번역 대량 선반영
* 평가 점수 화면만 먼저 만드는 것
* 테이블만 있는 관리자 화면을 먼저 만드는 것

---

## 22. 반드시 지켜야 하는 연결 규칙

* 문의는 저장과 알림이 동시에
* 뉴스는 언어별 발행 상태 분리
* WBS 없이 보고/일지 금지
* 평가 근거 없는 평가 확정 금지
* 서비스 등록 없는 서비스 운영 메뉴 생성 금지
* 공개 페이지는 `www.jinbizman.com` 기준 유지
* 관리자 셸과 외부 헤더/푸터는 같은 토큰 사용
* summary 응답으로 detail 화면을 억지로 대체하지 않기

---

## 23. 최종 성공 기준

* 외부 홈페이지가 더 이상 일반 회사소개 페이지처럼 보이지 않고 **AI 서비스 회사**로 인식된다.
* 관리자 시스템이 더 이상 CMS처럼 보이지 않는다.
* 새 홈페이지/앱이 생겨도 서비스 등록만으로 관리자에 연결된다.
* 모든 업무가 프로젝트와 WBS에 연결된다.
* 직군별로 다른 WBS 스타일이 적용된다.
* 아침 업무보고와 퇴근 전 업무일지가 실무에 맞게 작동한다.
* 프로젝트 계획 대비 실제 진척도를 실시간으로 볼 수 있다.
* 지연 원인을 코드화해서 누적할 수 있다.
* 평가 화면보다 먼저 평가 근거 데이터가 보인다.
* 외부 홈페이지와 내부 ERP가 PC·모바일·태블릿에서 모두 깨지지 않는다.
* 5개 언어 콘텐츠가 발행/검수/숨김까지 일관되게 운영된다.
* 공개 도메인 정책이 `www.jinbizman.com` 기준으로 흔들리지 않는다.

---

## 24. 문서 교체용 최종 체크리스트와 완료도

### 24-1. 이 문서가 기존 문서를 즉시 대체할 수 있어야 하는 이유

* 외부 홈페이지 기준이 페이지 단위로 정리돼 있습니다.
* 내부 ERP 기준이 모듈 단위로 정리돼 있습니다.
* 서비스 허브, WBS, 업무보고/일지, 평가 근거 데이터가 누락되지 않았습니다.
* 반응형, 다국어, 도메인 정책이 선언이 아니라 구현 규칙으로 내려와 있습니다.
* 공통 토큰, 공통 컴포넌트, 공통 상태 규칙이 포함되어 있습니다.
* 5단계 배포 완료 기준이 구현 우선순위와 함께 포함되어 있습니다.

### 24-2. 최종 검수 체크리스트

#### 외부 홈페이지

* [ ] 메인 홈 / 회사소개 / 사업소개 / 뉴스레터 / 문의하기 5개 메뉴 고정
* [ ] AI 서비스 → 플랫폼 사업 → 기획 서비스 순서 유지
* [ ] 문의 폼 실제 동작 준비
* [ ] 5개 언어 라우트 구조 준비
* [ ] canonical / hreflang 규칙 반영

#### 내부 ERP

* [ ] 관리자 셸 공통화
* [ ] 서비스 허브 / WBS / 업무보고 / 업무일지 / 결재 / 평가 근거 화면 구조 확보
* [ ] 권한별 메뉴 제어 가능
* [ ] 모바일 카드형 대체 뷰 또는 안전한 가로 스크롤 제공

#### 운영 정책

* [ ] `www.jinbizman.com` 기준 링크 유지
* [ ] 미발행 언어 숨김 처리
* [ ] 평가 근거 없는 평가 확정 금지 UI 흐름 반영
* [ ] WBS 없는 보고 입력 금지 흐름 반영

### 24-3. 최종 완료도

#### 문서 완료도

**문서 기준 100%**

#### 비고

실제 런타임 오류 0% 여부는 다음 단계의 `src/` 실제 구현과 테스트에서 검증해야 합니다.

---

## 25. 최종 결론

이번 프론트엔드의 정답은 단순히 “회사소개 페이지를 예쁘게 만드는 것”이 아닙니다.

정답은 아래입니다.

* 외부는 **회사소개형 AI 서비스 기업 홈페이지**
* 내부는 **WBS 중심 ERP형 관리자**
* 대표 도메인은 **`www.jinbizman.com`**
* 공개 서비스는 **한국어 / 영어 / 일본어 / 불어 / 스페인어 공식 지원**
* 외부와 내부 모두 **PC·모바일·태블릿 전 기기 완전 대응 반응형 웹앱**
* 디자인은 **Corporate AI Workspace**
* 확장성 핵심은 **서비스 허브**
* 운영 핵심은 **프로젝트 + WBS + 업무보고 + 업무일지**
* 공정성 핵심은 **평가 화면이 아니라 평가 근거 데이터**
* 공개 레퍼런스는 참고용이고, 실제 구현은 JINBIZ 구조에 맞춘 자체 컴포넌트와 화면 기준으로 정리

즉, 이번 최종본은 “프론트 페이지를 어떻게 만들까”가 아니라 **JINBIZ의 외부 브랜드와 내부 실행 체계를 동시에 구현하는 프론트엔드 실행 기준서**입니다.

### 다음 단계

가장 자연스러운 다음 작업은 **이 최종본을 기준으로 `src/` 실제 폴더 구조 전체본 + 페이지별 TSX 골격 코드 + 관리자 공통 컴포넌트 세트**를 바로 뽑는 것입니다.


---

## 부록 A. 외부 공통 컴포넌트 상세 목록

### A-1. Header 계층

* `PublicHeader`
* `PublicNav`
* `PublicLogo`
* `HeaderCtaGroup`
* `MobileMenuButton`
* `MobileMenuDrawer`
* `HeaderLanguageSwitcher`

### A-2. Footer 계층

* `PublicFooter`
* `FooterNav`
* `FooterCompanyInfo`
* `FooterLegalLinks`
* `FooterLanguageSwitcher`

### A-3. 섹션 공통 컴포넌트

* `HeroLayout`
* `SectionContainer`
* `SectionGrid`
* `PreviewCard`
* `HighlightPanel`
* `TimelineItem`
* `ValueCard`
* `BusinessCard`
* `CtaBanner`

### A-4. 외부 공통 상태 컴포넌트

* `PageLoadingState`
* `ListLoadingState`
* `PageEmptyState`
* `ListEmptyState`
* `PageErrorState`

### A-5. 외부 페이지 전환 시 유지해야 하는 것

* locale
* current nav active state
* SEO meta
* breadcrumb 노출 여부
* scroll restoration 정책



---

## 부록 B. 관리자 공통 컴포넌트 상세 목록

### B-1. 셸

* `AdminShell`
* `AdminTopbar`
* `AdminSidebar`
* `AdminSidebarGroup`
* `AdminBreadcrumb`
* `AdminPageContainer`

### B-2. 데이터 표시

* `MetricCard`
* `KpiStrip`
* `StatusBadge`
* `ProgressBar`
* `SummaryList`
* `TimelineList`
* `ActivityFeed`
* `AuditLogList`

### B-3. 입력/편집

* `FormField`
* `FormLabel`
* `SelectField`
* `TextareaField`
* `DateField`
* `FieldHint`
* `FieldError`
* `LocaleTabs`
* `TranslationEditor`

### B-4. 표/리스트

* `DataTable`
* `TableToolbar`
* `TablePagination`
* `MobileCardList`
* `FilterBar`
* `SearchBar`

### B-5. 오버레이

* `Modal`
* `Drawer`
* `ConfirmDialog`
* `Toast`

### B-6. WBS 전용

* `WbsKanbanBoard`
* `WbsLaneColumn`
* `WbsTaskCard`
* `WbsTaskDrawer`
* `DependencyBadge`
* `RiskBadge`
* `WorkStyleBadge`

### B-7. 평가 전용

* `EvidenceSummaryCard`
* `ScoreMatrix`
* `EvaluationCommentPanel`
* `CycleStatusBadge`
* `AdjustmentNotice`



---

## 부록 C. 페이지별 로딩 / 빈 상태 / 에러 / 권한 없음 기준

### C-1. HomePage

* 로딩: skeleton section 3개 이상
* 빈 상태: 해당 없음
* 에러: 섹션 일부 실패 시 graceful fallback
* 권한 없음: 해당 없음

### C-2. NewsletterPage

* 로딩: 탭 유지 + 리스트 skeleton
* 빈 상태: 카테고리별 다른 문구
* 에러: 카테고리 재시도 버튼
* 권한 없음: 해당 없음

### C-3. DashboardPage

* 로딩: KPI skeleton + alert list skeleton
* 빈 상태: 조직 초기 상태 안내
* 에러: 카드 단위 부분 실패 허용
* 권한 없음: 관리자 권한 부족 안내

### C-4. ServiceHubPage

* 로딩: 표 skeleton
* 빈 상태: 첫 서비스 등록 유도
* 에러: 재시도 + 로그 확인 안내
* 권한 없음: `service_admin` 이상 필요 안내

### C-5. WbsBoardPage

* 로딩: lane skeleton
* 빈 상태: 프로젝트 먼저 생성 안내
* 에러: 보드 재불러오기 버튼
* 권한 없음: 프로젝트 접근 권한 안내

### C-6. EvaluationsPage

* 로딩: cycle selector skeleton + evidence cards skeleton
* 빈 상태: 평가 주기 없음 안내
* 에러: 평가 데이터 재조회 버튼
* 권한 없음: `hr_evaluator` 또는 권한 사용자만 접근



---

## 부록 D. 페이지별 SEO 메타 기준

### D-1. HomePage

* title: 브랜드 + AI 서비스 포지션
* description: AI 서비스와 플랫폼 소개 요약
* canonical: `https://www.jinbizman.com/`

### D-2. CompanyPage

* title: 회사소개
* description: 정체성, 비전, 가치, 연혁 중심 요약
* canonical: locale-aware path

### D-3. BusinessPage

* title: 사업소개
* description: AI 서비스 / 플랫폼 / 기획 서비스 3축
* canonical: locale-aware path

### D-4. NewsletterPage

* title: 뉴스레터
* description: 보도자료, 공시정보, 공지사항 안내
* canonical: locale-aware path

### D-5. ContactPage

* title: 문의하기
* description: AI 서비스, 플랫폼 협업, 사업 문의 접수
* canonical: locale-aware path

### D-6. NewsDetailPage

* title: 번역된 제목
* description: 번역된 요약
* og:title: title 동기화
* og:description: summary 동기화
* alternate links: 5개 언어 기준 생성



---

## 부록 E. 관리자 메뉴 노출 매핑 예시

### E-1. `super_admin`

* 전체 메뉴 노출
* 전체 시스템 설정 수정 가능

### E-2. `service_admin`

* 대시보드
* 서비스 허브
* 홈페이지 운영
* 뉴스/공지
* 문의/리드
* 프로젝트/WBS 일부

### E-3. `pm`

* 대시보드
* 프로젝트/WBS
* 업무보고/업무일지
* 문의/리드 일부
* 평가 근거 열람 일부

### E-4. `news_operator`

* 대시보드
* 뉴스/공지
* 사이트 운영 일부
* 번역 발행 일부

### E-5. `translator`

* 사이트 번역 편집기
* 뉴스 번역 탭
* 발행 요청 전까지 편집 가능

### E-6. `viewer`

* 일부 대시보드
* 일부 조회 전용 화면
* 수정/삭제/발행 불가



---

## 부록 F. 공통 타입 예시

```ts
export type ServiceStatus = "draft" | "active" | "maintenance" | "retired";
export type ContentStatus = "draft" | "review" | "published" | "archived";
export type InquiryStatus = "new" | "in_progress" | "resolved" | "converted";
export type ProjectStatus = "planned" | "active" | "paused" | "completed" | "cancelled";
export type WbsStatus = "todo" | "in_progress" | "review" | "approval_wait" | "done" | "delayed" | "blocked";
export type TranslationStatus = "draft" | "in_translation" | "review" | "published" | "hidden";
```

```ts
export interface ServiceSummary {
  id: number;
  serviceCode: string;
  serviceName: string;
  serviceType: string;
  status: ServiceStatus;
  domain: string;
  envType: string;
  supportedLocales: string[];
  updatedAt: string;
}
```

```ts
export interface WbsTaskSummary {
  id: number;
  title: string;
  status: WbsStatus;
  priority: string;
  assigneeName: string;
  dueDate: string | null;
  actualProgress: number;
}
```



---

## 부록 G. `api.ts` 설계 기준

### G-1. 공통 요구사항

* credentials 포함
* `success: true/false` 응답 규약 처리
* query string builder 제공
* error code 파싱
* locale header 또는 query 연계 가능

### G-2. 권장 함수 목록

* `apiFetch`
* `buildQueryString`
* `parseApiResponse`
* `assertSuccess`
* `downloadBlob`

### G-3. 에러 처리 원칙

* 401: 로그인 만료 처리
* 403: ForbiddenState 또는 toast
* 404: NotFound 또는 empty 처리 구분
* 422/400: 폼 에러 매핑
* 500: 공통 서버 오류 메시지



---

## 부록 H. `validators.ts` 설계 기준

### H-1. 프론트에서 미리 검증할 스키마

* inquiry form
* service register form
* wbs create form
* daily report item
* daily log item
* translation publish form
* evaluation score form

### H-2. 분리 원칙

* 공통 enum schema
* locale schema
* slug schema
* SEO schema
* 날짜/시간 schema
* 배열 item schema

### H-3. 주의사항

* 백엔드 Zod 검증을 대체하지 않음
* 프론트 검증은 UX 개선용
* 서버 검증 실패 메시지 매핑도 준비



---

## 부록 I. `tokens.css` 추가 규칙

### I-1. spacing scale 권장

* `--space-1: 4px`
* `--space-2: 8px`
* `--space-3: 12px`
* `--space-4: 16px`
* `--space-5: 20px`
* `--space-6: 24px`
* `--space-8: 32px`
* `--space-10: 40px`

### I-2. radius 권장

* `--radius-sm: 8px`
* `--radius-md: 12px`
* `--radius-lg: 16px`
* `--radius-xl: 20px`
* `--radius-2xl: 24px`

### I-3. shadow 권장

* `--shadow-sm`
* `--shadow-card`
* `--shadow-modal`

### I-4. z-index 계층 권장

* header
* sidebar
* drawer
* modal
* toast



---

## 부록 J. 뉴스레터 상세 페이지 프론트 확장 기준

### J-1. 필요 이유

* SEO 확보
* 공유 가능한 공식 링크 제공
* 언어별 slug 운영
* 관리자 발행 흐름과 연결

### J-2. 추천 라우트

* `/newsletter/:category/:slug`
* `/en/newsletter/:category/:slug`
* `/ja/newsletter/:category/:slug`
* `/fr/newsletter/:category/:slug`
* `/es/newsletter/:category/:slug`

### J-3. 상세 화면 요소

* 카테고리 badge
* 제목
* 발행일
* 요약
* 본문
* 첨부 링크
* 관련 글
* 언어 전환
* canonical/alternate meta



---

## 부록 K. WBS 보드 프론트 상호작용 규칙

### K-1. drag and drop 규칙

* 같은 lane 내 재정렬 허용
* 다른 lane 이동 시 상태 변경 확인
* blocked / done lane 이동 시 추가 입력 요구 가능

### K-2. 카드 표시 최소 정보

* 제목
* 담당자
* 상태
* 우선순위
* 진행률
* 마감일
* 위험/의존 배지

### K-3. 상세 drawer 표시 정보

* 설명
* 산출물
* 이슈/리스크
* dependency
* 코멘트
* 승인 여부
* 최근 일지



---

## 부록 L. 대시보드 지표 카드 매핑

### L-1. 운영 카드

* 신규 문의 수
* 승인 대기 수
* 지연 WBS 수
* 위험 프로젝트 수

### L-2. 제출률 카드

* 오늘 업무보고 제출률
* 오늘 업무일지 제출률

### L-3. 성과 카드

* 문의→리드 전환율
* 프로젝트 진척률 평균
* 언어별 발행 콘텐츠 수

### L-4. 카드 행동 원칙

* 각 카드 클릭 시 상세 화면 이동
* 카드 숫자는 summary 응답 기준
* 단순 숫자 외 상태 설명 포함



---

## 부록 M. 협업툴 기능정의서 반영 프론트 포인트

### M-1. To-do / WBS 연결

* 개인 할 일 화면은 별도 독립 제품처럼 만들지 않고 WBS 기반 My Tasks로 연결

### M-2. 간트/마일스톤

* 1차는 placeholder 또는 read-only라도 화면 구조는 먼저 확보 가능

### M-3. 참여 인력 및 투입률

* 프로젝트 상세에 향후 확장 가능한 탭 구조 설계

### M-4. 사업비 진행 관리

* 프론트 1차에서는 메뉴나 placeholder 수준으로 열어둘 수 있음

### M-5. HR/근태

* 1차 오픈 비필수라도 관리자 nav 확장 슬롯을 고려



---

## 부록 N. 테스트 및 QA 체크리스트

### N-1. 외부 페이지

* [ ] 360px에서 Hero 텍스트/버튼 깨짐 없음
* [ ] 430px에서 문의 폼 입력 오류 메시지 정상 노출
* [ ] 768px에서 카드 2열 안정화
* [ ] 1024px 이상에서 max-width 적용
* [ ] locale 전환 시 path 유지
* [ ] 미발행 locale 숨김 처리

### N-2. 관리자 페이지

* [ ] 모바일 사이드바 오프캔버스 정상 동작
* [ ] 표형 화면이 모바일 카드형으로 대체 가능
* [ ] WBS 보드가 모바일에서 최소한의 조회 가능
* [ ] 평가 근거 카드가 점수 입력보다 먼저 노출
* [ ] 권한 없는 메뉴 차단

### N-3. 연결 규칙

* [ ] WBS 없는 보고 입력 불가
* [ ] 서비스 등록 없는 서비스 운영 메뉴 생성 불가
* [ ] 번역 draft와 published 상태 명확히 구분
* [ ] canonical 링크가 `www.jinbizman.com` 기준인지 확인


---

## 부록 O. 세부 UI 운영 규칙 모음

### O-1. 헤더 상호작용 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-2. 모바일 메뉴 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-3. 푸터 법적정보 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-4. 문의 완료 메시지 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-5. 뉴스 탭 상태 유지 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-6. 서비스 카드 배지 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-7. 서비스 필터 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-8. 서비스 상세 드로어 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-9. 번역 편집기 탭 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-10. SEO 입력 필드 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-11. 문의 목록 우선순위 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-12. 문의 상세 액션 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-13. 프로젝트 목록 필터 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-14. 프로젝트 상세 상단 요약 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-15. WBS 카드 색상 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-16. WBS 검색/필터 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-17. 업무보고 반복 입력 UX 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-18. 업무일지 지연 사유 UX 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-19. 결재 상태 배지 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-20. 결재 상세 레이아웃 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-21. 평가 주기 선택 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-22. 평가 코멘트 표시 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-23. 감사로그 필터 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-24. 시스템 설정 저장 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.

### O-25. 공통 Toast 메세지 규칙

* 구현 전 공용 컴포넌트/헬퍼와 먼저 연결 여부를 확인합니다.
* 다국어 길이 차이와 모바일 폭을 먼저 검증합니다.
* summary 응답으로 충분한지, detail 응답이 필요한지 구분합니다.
* 권한이 필요한 액션인지 판단해 `PermissionGate`와 연결합니다.
