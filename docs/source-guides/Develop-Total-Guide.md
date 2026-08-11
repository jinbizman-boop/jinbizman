## 이번 단계 목표

* 첨부 기준 문서와 지금까지 확정된 채팅 방향을 모두 반영해 **JINBIZ 홈페이지 + ERP 관리자 종합 개발 가이드 최신형 완성형 최종본**을 다시 정리합니다.
* 이번 최종본은 단순 참고 문서가 아니라 **바로 구현 착수 가능한 실행 기준서**로 작성합니다.
* 기존 확정안에 아래 3가지를 정식 요구사항으로 추가 확정합니다.

  * **PC, 모바일, 태블릿 등 모든 기기와 모든 환경에서 깨지거나 이탈되지 않는 반응형 웹앱**
  * **한국어, 영어, 일본어, 불어, 스페인어 공식 지원**
  * **대표 도메인 `www.jinbizman.com` 사용**
* 외부 홈페이지와 내부 ERP를 따로 설계하지 않고, **하나의 브랜드·하나의 디자인 토큰·하나의 데이터 흐름·하나의 운영 체계**로 묶습니다.

첨부 문서 기준으로 외부는 회사소개형 AI 서비스 기업 홈페이지, 내부는 CMS가 아닌 WBS 중심 ERP, 그리고 핵심은 서비스 허브·업무보고/업무일지·평가 근거 데이터라는 방향이 이미 고정되어 있습니다.    

---

## 변경 파일

이번 단계는 문서화 단계라 실제 수정 파일은 없습니다.

다만 이 가이드를 기준으로 바로 연결될 핵심 파일은 아래가 맞습니다.

* `src/pages/HomePage.tsx`
* `src/pages/CompanyPage.tsx`
* `src/pages/BusinessPage.tsx`
* `src/pages/NewsletterPage.tsx`
* `src/pages/ContactPage.tsx`
* `src/pages/admin/DashboardPage.tsx`
* `src/pages/admin/services/*`
* `src/pages/admin/site/*`
* `src/pages/admin/wbs/*`
* `src/pages/admin/approvals/*`
* `src/pages/admin/evaluations/*`
* `src/components/common/*`
* `src/components/sections/*`
* `src/components/admin/*`
* `src/components/common/LanguageSwitcher.tsx`
* `src/lib/api.ts`
* `src/lib/types.ts`
* `src/lib/validators.ts`
* `src/lib/i18n.ts`
* `src/lib/responsive.ts`
* `worker/index.ts`
* `worker/app.ts`
* `worker/lib/db.ts`
* `worker/lib/response.ts`
* `worker/lib/auth.ts`
* `worker/lib/locale.ts`
* `worker/routes/public/inquiries.ts`
* `worker/routes/public/news.ts`
* `worker/routes/public/site-pages.ts`
* `worker/routes/admin/services.ts`
* `worker/routes/admin/site-pages.ts`
* `worker/routes/admin/site-seo.ts`
* `worker/routes/erp/projects.ts`
* `worker/routes/erp/wbs.ts`
* `worker/routes/erp/daily-reports.ts`
* `worker/routes/erp/daily-logs.ts`
* `worker/routes/erp/evaluations.ts`
* `db/migrations/*`

첨부 프론트/백엔드 가이드도 실제 구현의 중심을 `src/`, `worker/`, `db/migrations/`에 두고 있습니다.  

---

## 실행 명령어

Cloudflare는 현재 React + Vite 기반 Workers 앱 시작점을 `npm create cloudflare@latest -- <app> --framework=react`로 안내하고 있고, Cloudflare Vite plugin은 Worker 코드를 `workerd` 안에서 실행해 로컬과 배포 동작을 가깝게 맞춥니다. Neon serverless driver는 HTTP와 WebSocket 모두를 지원하며, 단발성 조회와 비대화형 트랜잭션은 HTTP가 더 빠르다고 안내합니다. ([Cloudflare Docs][1])

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

---

## 확인 방법

이번 최종본 기준으로 아래가 맞아야 합니다.

* 외부는 **회사소개형 AI 서비스 기업 홈페이지**여야 합니다.
* 내부는 **CMS가 아니라 ERP형 통합 운영 관리자**여야 합니다.
* 상단 메뉴는 `메인 홈 / 회사소개 / 사업소개 / 뉴스레터 / 문의하기` 5개로 고정입니다.
* 사업 구조는 `AI 서비스 → 플랫폼 사업 → 기획 서비스` 3축입니다.
* 뉴스레터 메뉴는 실제 운영상 `보도자료 / 공시정보 / 공지사항` 구조입니다.
* 문의는 `이메일 알림 + 관리자 저장` 동시 처리입니다.
* 모든 업무는 **프로젝트 + WBS + 아침 업무보고 + 퇴근 업무일지**로 이어져야 합니다.
* 새 홈페이지나 앱은 **서비스 등록만 하면 ERP에서 관리 가능한 확장형 구조**여야 합니다.
* 외부 홈페이지와 내부 ERP 모두 **PC·모바일·태블릿에서 깨지지 않는 반응형 웹앱**이어야 합니다.
* 공개 페이지와 공개 콘텐츠는 **한국어·영어·일본어·불어·스페인어 공식 지원**이어야 합니다.
* 도메인 기준은 **`www.jinbizman.com`** 으로 통일되어야 합니다.

---

## 문제 발생 시

가장 흔한 실패는 아래입니다.

* 홈페이지와 ERP를 따로따로 설계해서 데이터가 끊기는 경우
* 관리자 페이지를 특정 사이트 전용 CMS처럼 만들어 확장성이 깨지는 경우
* WBS 없이 자유 텍스트 업무보고부터 만들어 진척도 계산이 안 되는 경우
* 평가 화면만 먼저 만들고, 평가 근거 데이터 구조를 나중에 붙이려는 경우
* 다국어를 문자열 붙이기 수준으로 처리해서 언어별 발행·검수·SEO 관리가 불가능해지는 경우
* 반응형을 외부 홈페이지에만 적용하고 ERP는 데스크톱 전용처럼 만들어 실제 운영 현장성이 무너지는 경우
* 공개 GitHub 코드를 그대로 복사해 프로젝트 방향과 맞지 않는 구조가 섞이는 경우

---

# JINBIZ 종합 개발 가이드 최신형 완성형 최종본

## 1. 최종 정의

JINBIZ 프로젝트는 아래처럼 확정하면 됩니다.

> **외부용:** 회사소개형 AI 서비스 기업 홈페이지
> **내부용:** WBS 중심 ERP형 통합 운영 관리자

홈페이지는 AI 서비스 회사의 정체성을 보여주고, ERP는 홈페이지 운영·뉴스/공지·문의/리드·전자결재·WBS·조직/권한·평가까지 하나의 계정 체계 안에서 연결해야 합니다. 이 방향은 첨부 기준 문서에서 이미 확정돼 있습니다.   

이번 최종본에서 추가로 고정하는 것은 아래 3가지입니다.

* 대표 도메인은 **`www.jinbizman.com`**
* 외부 홈페이지와 내부 ERP 모두 **반응형 웹앱**
* 공개 서비스는 **한국어·영어·일본어·불어·스페인어 공식 지원**

---

## 2. 이번 프로젝트에서 공개 GitHub/공식 레퍼런스를 어떻게 써야 하는가

이번 프로젝트는 “공개 코드를 많이 보는 것”보다 **어떤 저장소를 어디까지 참고할지 구분하는 것**이 중요합니다.

Cloudflare 공식 React + Vite 가이드는 React SPA와 Workers API를 함께 쓰는 전체 구조를 제시하고, 기본 시작 명령과 개발 흐름을 안내합니다. Cloudflare Vite plugin은 Worker 코드를 `workerd`에서 실행하므로 로컬과 운영 차이를 줄이기 좋습니다. 그래서 이 프로젝트의 **출발점 구조**는 Cloudflare 공식 구조를 그대로 따르는 것이 가장 안전합니다. ([Cloudflare Docs][1])

Neon의 serverless driver 문서는 HTTP 또는 WebSocket 연결을 지원하며, HTTP는 one-shot query와 비대화형 트랜잭션에 유리하다고 설명합니다. 이번 프로젝트는 공개 페이지 조회, 관리자 목록 조회, 문의 저장 같은 **짧은 요청-응답형 쿼리**가 많으므로 기본은 HTTP 기반이 맞습니다. ([Neon][2])

UI 참고는 **레이아웃용**과 **기능용**을 분리해야 합니다. TailAdmin은 React + Tailwind 관리자 셸 구조를 참고하기 좋고, TanStack Table은 큰 표를 디자인 자유도 높게 구현하기 좋고, React Hook Form과 Zod는 폼 상태와 입력 검증을 가볍게 통일하기 좋습니다. Recharts는 선언형 차트에, dnd-kit은 칸반/정렬 인터랙션에 적합합니다. Hono OpenAPI는 API 문서 자동 생성에, jose는 Cloudflare Workers를 포함한 웹 호환 런타임에서 JWT/서명 처리에 적합합니다. ([GitHub][3])

즉, 공개 레퍼런스는 아래처럼 씁니다.

* **무조건 채택:** Cloudflare 공식 React + Vite 구조, Neon serverless driver
* **1차에서 채택:** React Hook Form, Zod
* **표가 커질 때 채택:** TanStack Table
* **차트가 필요할 때 채택:** Recharts
* **칸반이 실제로 필요할 때 채택:** dnd-kit
* **레이아웃 참고만:** TailAdmin
* **API 문서 자동화:** Hono OpenAPI
* **인증 토큰/JWT 처리:** jose

---

## 3. 최종 기술 스택

### 고정 스택

* React + Vite + TypeScript
* Cloudflare Workers
* Neon Postgres
* Tailwind CSS
* npm
* Git + GitHub
* VS Code + Copilot

### 기본 원칙

* ORM 기본 미사용
* Worker에서만 DB 접근
* 프론트는 API만 호출
* 복잡한 라이브러리는 꼭 필요할 때만 도입
* 한 저장소, 한 앱 구조 유지

Cloudflare Workers는 전역 네트워크에서 앱을 배포·실행하는 서버리스 플랫폼이고, Secrets는 Worker에 암호화된 값으로 바인딩할 수 있으며, 로컬 개발에서는 `.dev.vars` 계열 파일을 쓸 수 있습니다. 민감값은 Git에 커밋하면 안 됩니다. ([Cloudflare Docs][4])

---

## 4. 추가 확정 정책 3종

## 4-1. 도메인 정책

대표 도메인은 **`www.jinbizman.com`** 으로 고정합니다.

운영 원칙은 아래입니다.

* canonical 도메인: `https://www.jinbizman.com`
* `jinbizman.com` → `www.jinbizman.com` 301 리다이렉트
* 공개 페이지, 뉴스 상세, 문의 완료, 언어별 페이지 모두 이 도메인 기준
* ERP는 같은 프로젝트 안에서 운영하되 1차는 동일 도메인 하위 경로 또는 동일 배포 단위로 관리
* sitemap, `hreflang`, OG, canonical도 모두 이 도메인을 기준으로 생성

첨부 실행 문서의 `wrangler.jsonc` 초안도 이미 `APP_BASE_URL`과 `ADMIN_ALLOWED_ORIGINS`를 `https://www.jinbizman.com` 기준으로 두고 있습니다. 

## 4-2. 반응형 웹앱 정책

이 프로젝트는 **외부 홈페이지 + 내부 ERP 전체를 반응형 웹앱**으로 설계합니다.

핵심 기준은 아래입니다.

* PC, 모바일, 태블릿에서 레이아웃이 무너지지 않을 것
* 카드, 표, 버튼, 폼, 탭, 내비게이션이 겹치지 않을 것
* 다국어 길이 차이로 인해 버튼/카드/탭이 밀리지 않을 것
* Hero, 뉴스 탭, 문의 폼, 관리자 표, WBS 보드까지 포함할 것
* 모바일 우선 설계, 데스크톱 확장형 적용
* 관리자 표는 모바일에서 카드형 전환 또는 안전한 가로 스크롤 허용

## 4-3. 다국어 정책

JINBIZ의 공식 지원 언어는 아래 5개입니다.

* 한국어
* 영어
* 일본어
* 불어
* 스페인어

외부 공개 영역은 5개 언어를 공식 지원하고, 내부 ERP는 1차 운영 언어를 한국어 중심으로 두되 아래를 처음부터 지원합니다.

* 언어별 콘텐츠 입력
* 언어별 번역 상태 관리
* 언어별 미리보기
* 언어별 공개/비공개
* 언어별 slug/SEO 관리

첨부 백엔드 가이드와 실행 문서도 이미 서비스 허브의 `services` 구조에 `i18n_enabled`를 포함하고 있어 다국어 확장 방향과 일치합니다.  

---

## 5. 최종 아키텍처

### 전체 구조

* `src/`: 외부 홈페이지 + 관리자 프론트
* `worker/`: 백엔드 API, 인증, 권한, DB 접근
* `db/`: 마이그레이션
* `public/`: 정적 리소스

### 요청 흐름

1. 사용자가 외부 페이지 또는 관리자 페이지 접속
2. React가 화면 렌더링
3. 데이터가 필요하면 `/api/*` 호출
4. Worker가 인증/권한 확인
5. Worker가 Neon에 쿼리
6. JSON 응답 반환
7. 프론트가 렌더링 업데이트

### 왜 이 구조가 맞는가

Cloudflare 공식 가이드는 React SPA와 Worker API를 함께 쓰는 풀스택 구조를 제시하고, 첨부 프론트/백엔드/실행 문서도 동일한 방향을 기준으로 잡고 있습니다. ([Cloudflare Docs][1])  

---

## 6. 벤치마킹 방향 최종안

외부 홈페이지는 **SK식 신뢰 구조 + 솔트룩스식 사업 설명 구조**를 결합하는 것이 적합합니다. SK 공식 사이트는 회사·뉴스·소개 구조가 안정적이고, 솔트룩스는 엔터프라이즈 AI·디지털플랫폼정부·금융서비스 지능화처럼 “무엇을 하는 회사인지”를 사업 중심으로 강하게 설명합니다. ([SK][5])

내부 ERP는 **하이웍스의 운영 허브성 + 이카운트의 실시간 ERP성 + 네이버웍스의 통합 플랫폼성**을 결합하는 것이 맞습니다. 하이웍스는 인사관리·근무관리·경비지출관리·메신저·전자결재·세금계산서를 올인원으로 내세우고, 전자결재를 다양한 기기에서 확인할 수 있다고 설명합니다. 이카운트는 영업·구매·재고·생산·회계·급여·그룹웨어와 실시간 보고서, 메뉴 재구성을 강점으로 둡니다. 네이버웍스는 관리자 권한 체계를 세분화하고, 어드민과 경영지원/결재/협업 기능을 하나의 운영 구조로 제공합니다. ([main.hiworks.com][6])

---

## 7. 기능 정의 최종안

## 7-1. 외부 홈페이지 기능 정의

### 메인 홈

* 첫 화면에서 “AI 서비스 회사”로 인식
* Hero, 핵심 메시지 3카드, 회사소개 프리뷰, 사업소개 프리뷰, 유레카월드 강조, 뉴스레터 유도, 문의 유도
* 사업 구조는 `AI 서비스 / 플랫폼 사업 / 기획 서비스`
* 언어 전환 버튼 제공
* 반응형 Hero / 카드 / CTA 적용

### 회사소개

* 회사 개요, 회사 정의, 비전, 핵심 가치, 연혁 중심
* 대표 인사말 없음
* 과도한 문의 유도 없음
* 연혁은 모바일/데스크톱 각각 자연스럽게 재배치

### 사업소개

* `AI 서비스 → 플랫폼 사업 → 기획 서비스` 3축 설명
* 유레카월드는 내부 엔진을 공개하지 않고 “작업 중심 AI 워크스페이스” 수준으로만 설명
* 플랫폼 사업은 생활형 / 산업 혁신형 2축
* 긴 문장은 다국어 기준으로 폭 제한

### 뉴스레터

* 메뉴명은 유지
* 실제 운영 구조는 `보도자료 / 공시정보 / 공지사항`
* 1차는 구독 기능 없음
* 언어별 게시 상태 분리
* SEO를 위해 리스트/상세 구조 선구축

### 문의하기

* 문의 저장 + 이메일 알림 동시 처리
* 기본 필드: 문의 유형, 이름, 이메일, 연락처, 회사/소속, 문의 내용
* 완료 메시지 다국어 제공
* 모바일 1열, 데스크톱 2열

이 외부 5개 메뉴와 운영 방향은 첨부 홈페이지 기준 문서와 종합 실행 문서의 방향과 일치합니다.  

## 7-2. ERP 기능 정의

### 서비스 허브

* 새 홈페이지/앱 추가 시 `서비스 등록 → 운영 유형 선택 → 콘텐츠 모델 연결 → 권한 템플릿 연결 → 환경 연결 → 언어 연결`
* 관리자 메뉴 자동 노출
* 도메인/환경/다국어/SEO 설정 포함

### 홈페이지 운영

* 페이지 관리
* 콘텐츠 컬렉션
* 공통 컴포넌트
* 미디어 라이브러리
* SEO/OG
* 배너/팝업
* 메뉴/네비게이션
* 도메인/환경
* 배포 이력
* 변경 이력
* 권한/승인
* 언어/번역 관리

### 뉴스/공지 운영

* 보도자료 / 공시정보 / 공지사항 등록·수정·예약·발행·보관
* 언어별 본문/SEO/게시 상태 관리

### 문의/리드 관리

* 문의 자동 저장
* 이메일 알림
* 상태 관리
* 담당자 배정
* 리드 전환
* 프로젝트 연결

### WBS/프로젝트

* 프로젝트 생성
* WBS 생성
* 담당자 지정
* 상태 관리
* 산출물/이슈/리스크
* 칸반/간트/캘린더 확장 가능

### 아침 업무보고 / 퇴근 업무일지

* 모든 보고는 WBS 연결 필수
* 자유 텍스트만 저장 금지
* 계획 대비 실제 진척률과 지연 원인 집계

### 전자결재

* 배포 승인
* 게시 승인
* 일정 변경 승인
* 프로젝트 개설 승인
* 예산/지출 승인
* 언어별 공개 승인

### 조직/권한

* 단일 로그인
* 부서/직군/직무/역할 관리
* 권한 템플릿
* 관리자 권한 분리

### 인사평가

* WBS·산출물·일정·품질·협업 데이터 기반 평가
* 평가 화면보다 **평가 근거 데이터**가 먼저

이 ERP 방향은 첨부 관리자 기준 문서와 백엔드 가이드의 핵심 요구와 일치합니다.  

---

## 8. 화면 설계 최종안

## 8-1. 외부 사이트 IA

### 1차 메뉴

* 메인 홈
* 회사소개
* 사업소개
* 뉴스레터
* 문의하기

### 메인 홈 섹션

* 헤더
* Hero
* 핵심 메시지 3카드
* 회사소개 프리뷰
* 사업소개 프리뷰
* 유레카월드 강조
* 뉴스레터 유도
* 문의 유도
* 푸터

### 회사소개 섹션

* 페이지 헤더
* 회사 개요
* 회사 정의
* 비전
* 핵심 가치
* 연혁

### 사업소개 섹션

* 페이지 헤더
* 사업 개요
* AI 서비스
* 플랫폼 사업
* 기획 서비스
* How We Work
* CTA

### 뉴스레터 섹션

* 페이지 헤더
* 상단 탭
* 보도자료 리스트/빈 상태
* 공시정보 리스트/빈 상태
* 공지사항 리스트/빈 상태

### 문의하기 섹션

* 페이지 헤더
* 문의 폼
* 접수 안내
* 보조 연락 정보

## 8-2. 관리자 IA

### 1차 상위 메뉴

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

### 대시보드 카드

* 오늘 해야 할 일
* 보고 미제출자
* 일지 미제출자
* 지연 WBS
* 승인 대기
* 신규 문의
* 위험 프로젝트
* 리드 전환 현황

### 핵심 화면

* 서비스 허브
* Site Content
* News Admin
* Inquiries
* Projects
* WBS Board
* Daily Report
* Daily Log
* Approvals
* Evaluations
* Audit Logs

첨부 프론트 가이드도 같은 상위 메뉴와 핵심 화면 방향을 전제로 하고 있습니다. 

---

## 9. 디자인 시스템 최종안

기준 문서는 화이트 + 네이비 중심의 기업형 AI 톤을 요구하며, 외부 홈페이지와 ERP가 같은 디자인 언어를 공유해야 한다고 정리합니다. 

### 컬러 토큰

* Primary Navy: `#143B7D`
* Deep Navy: `#0F2E63`
* Light Blue Gray: `#EEF4FB`
* Soft Background: `#F8FAFD`
* White: `#FFFFFF`
* AI Service Accent: `#18A7B5`
* Platform Accent: `#7C4DDB`
* Planning Accent: `#2F7EDB`
* Text Primary: `#1F2937`
* Text Secondary: `#6B7280`
* Border: `#D9E2EC`

### 컴포넌트 세트

* `Button`
* `SectionHeader`
* `PageHeader`
* `InfoCard`
* `MetricCard`
* `StatusBadge`
* `EmptyState`
* `DataTable`
* `FormField`
* `Modal`
* `SidebarNav`
* `Topbar`
* `Tabs`
* `LanguageSwitcher`

### 반응형 컴포넌트 원칙

* 버튼 최소 높이 고정
* 카드 높이 자동
* 표는 모바일 대체 뷰 제공
* 사이드바는 모바일 오프캔버스
* 긴 다국어 문자열에도 파손 없는 `min/max-width` 설계

---

## 10. DB 테이블 최종안

기존 첨부 실행 문서의 핵심 테이블 구조는 유지하되, **반응형은 프론트 구현 규칙**으로 두고, **다국어와 도메인은 데이터 구조에 명시적으로 추가**합니다. 기존 `services`, `news_posts`, `projects`, `wbs_tasks`, `daily_reports`, `daily_logs`, `evaluation_evidences` 중심 구조는 그대로 유지하는 것이 맞습니다.  

### 공통/조직

* `users`
* `roles`
* `user_roles`
* `departments`

### 서비스 허브

* `services`
* `service_domains`
* `service_environments`
* `service_content_types`
* `service_content_items`
* `service_translations`
* `service_change_logs`

### 홈페이지/뉴스/문의

* `news_posts`
* `news_post_translations`
* `inquiries`

### 프로젝트/WBS

* `projects`
* `project_members`
* `wbs_templates`
* `wbs_tasks`
* `wbs_task_dependencies`

### 업무보고/업무일지

* `daily_reports`
* `daily_report_items`
* `daily_logs`
* `daily_log_items`

### 결재/평가

* `approval_documents`
* `approval_actions`
* `evaluation_cycles`
* `evaluation_items`
* `evaluation_scores`
* `evaluation_evidences`

### 다국어/도메인 추가 핵심

* `service_domains`: 서비스별 도메인, 언어별 URL 정책, canonical 여부
* `service_translations`: 언어별 제목/본문/CTA/SEO/slug/발행 상태
* `news_post_translations`: 뉴스/공지의 언어별 본문과 메타데이터

### 핵심 연결

* `daily_report_items` → `wbs_tasks`
* `daily_log_items` → `wbs_tasks`
* `evaluation_evidences` → `wbs_tasks`, `project_outputs`, `approval_documents`
* `service_translations` → `service_content_items`
* `service_domains` → `services`

---

## 11. 기능 명세서 최종안

## 11-1. 문의 등록

목적: 외부 문의 저장 + 담당자 알림

입력:

* `inquiry_type`
* `company_name`
* `name`
* `email`
* `phone`
* `message`
* `locale`

처리:

* 프론트 검증
* Worker Zod 검증
* DB 저장
* 이메일 알림 큐 적재
* 응답 반환

API:

* `POST /api/inquiries`

Cloudflare Queues는 메시지 전달 보장을 제공하고, 기본적으로 at-least-once delivery입니다. 문의 저장 뒤 후속 알림을 요청 경로에서 분리하는 구조에 적합합니다. Rate Limiting API는 경로별/유저별 제한을 Worker 코드 안에서 둘 수 있습니다. ([Cloudflare Docs][7])

## 11-2. 서비스 등록

목적: 새 홈페이지/앱을 ERP 관리 대상으로 추가

입력:

* `service_code`
* `service_name`
* `service_type`
* `domain`
* `env_type`
* `content_model_code`
* `permission_template_code`
* `supported_locales`
* `default_locale`

API:

* `POST /api/admin/services`

## 11-3. WBS 생성

목적: 프로젝트 안의 구조화된 업무 단위 생성

입력:

* `project_id`
* `template_id`
* `title`
* `assignee_user_id`
* `due_date`
* `priority`
* `requires_approval`

API:

* `POST /api/erp/wbs`

## 11-4. 아침 업무보고

목적: 오늘 수행할 WBS와 목표 등록

입력:

* `report_date`
* `project_id`
* `items[]`

API:

* `POST /api/erp/daily-reports`

## 11-5. 퇴근 업무일지

목적: 실제 수행 결과와 진척률 기록

입력:

* `log_date`
* `project_id`
* `items[]`

API:

* `POST /api/erp/daily-logs`

## 11-6. 언어별 콘텐츠 발행

목적: 다국어 공개 콘텐츠의 작성/검수/발행 관리

입력:

* `service_content_item_id`
* `locale`
* `title`
* `body`
* `seo_title`
* `seo_description`
* `slug`
* `publish_status`

API:

* `POST /api/admin/contents/:id/translations`
* `PATCH /api/admin/contents/:id/translations/:locale`

---

## 12. 가이드 코드 최종안

아래 코드는 공개 저장소를 그대로 복사한 것이 아니라, 이번 프로젝트 기준으로 바로 쓰기 좋게 새로 정리한 가이드 코드입니다.

### 12-1. `worker/lib/db.ts`

```ts
import { neon } from "@neondatabase/serverless";

export interface Env {
  DATABASE_URL: string;
}

export function getSql(env: Env) {
  return neon(env.DATABASE_URL);
}
```

### 12-2. `worker/lib/locale.ts`

```ts
export const SUPPORTED_LOCALES = ["ko", "en", "ja", "fr", "es"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function resolveLocale(input?: string | null): SupportedLocale {
  if (!input) return "ko";
  const normalized = input.toLowerCase();
  return (SUPPORTED_LOCALES as readonly string[]).includes(normalized)
    ? (normalized as SupportedLocale)
    : "ko";
}
```

### 12-3. `src/lib/i18n.ts`

```ts
export const supportedLocales = ["ko", "en", "ja", "fr", "es"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale: SupportedLocale = "ko";

export function isSupportedLocale(value: string): value is SupportedLocale {
  return supportedLocales.includes(value as SupportedLocale);
}
```

### 12-4. `worker/lib/response.ts`

```ts
export function ok<T>(data: T, init?: ResponseInit) {
  return Response.json({ success: true, data }, { status: 200, ...init });
}

export function fail(
  code: string,
  message: string,
  status = 400,
  init?: ResponseInit,
) {
  return Response.json(
    { success: false, error: { code, message } },
    { status, ...init },
  );
}
```

### 12-5. `worker/routes/public/inquiries.ts`

```ts
import { z } from "zod";
import { getSql, type Env } from "../../lib/db";
import { ok, fail } from "../../lib/response";
import { resolveLocale } from "../../lib/locale";

const inquirySchema = z.object({
  inquiryType: z.string().min(1),
  companyName: z.string().optional().default(""),
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().optional().default(""),
  message: z.string().min(10),
  locale: z.string().optional(),
});

export async function handleCreateInquiry(request: Request, env: Env) {
  const body = await request.json();
  const parsed = inquirySchema.safeParse(body);

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "입력값을 다시 확인해주세요.", 400);
  }

  const data = parsed.data;
  const locale = resolveLocale(data.locale);
  const sql = getSql(env);

  const rows = await sql`
    insert into inquiries (
      inquiry_type,
      company_name,
      name,
      email,
      phone,
      message,
      status,
      locale,
      created_at,
      updated_at
    ) values (
      ${data.inquiryType},
      ${data.companyName},
      ${data.name},
      ${data.email},
      ${data.phone},
      ${data.message},
      'new',
      ${locale},
      now(),
      now()
    )
    returning id
  `;

  return ok({
    inquiryId: rows[0].id,
    locale,
    message: "문의가 정상적으로 접수되었습니다.",
  });
}
```

### 12-6. `src/pages/ContactPage.tsx`

```tsx
import { useForm } from "react-hook-form";
import { apiFetch } from "../lib/api";

type ContactFormValues = {
  inquiryType: string;
  companyName: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  locale: "ko" | "en" | "ja" | "fr" | "es";
};

export function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    reset,
  } = useForm<ContactFormValues>({
    defaultValues: {
      inquiryType: "general",
      companyName: "",
      name: "",
      email: "",
      phone: "",
      message: "",
      locale: "ko",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    await apiFetch("/api/inquiries", {
      method: "POST",
      body: JSON.stringify(values),
    });
    reset();
    alert("문의가 정상적으로 접수되었습니다.");
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
          <select {...register("locale")} className="w-full rounded-xl border px-4 py-3">
            <option value="ko">한국어</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
          </select>

          <input {...register("name", { required: "이름을 입력해주세요." })} className="w-full rounded-xl border px-4 py-3" />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}

          <input type="email" {...register("email", { required: "이메일을 입력해주세요." })} className="w-full rounded-xl border px-4 py-3" />

          <textarea
            rows={6}
            {...register("message", {
              required: "문의 내용을 입력해주세요.",
              minLength: { value: 10, message: "문의 내용은 10자 이상 입력해주세요." },
            })}
            className="w-full rounded-xl border px-4 py-3"
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

### 12-7. `db/migrations/001_init.sql` 추가 예시

```sql
create table if not exists service_domains (
  id bigserial primary key,
  service_id bigint not null references services(id) on delete cascade,
  domain varchar(255) not null,
  locale varchar(10) not null default 'ko',
  is_canonical boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists service_translations (
  id bigserial primary key,
  service_content_item_id bigint not null references service_content_items(id) on delete cascade,
  locale varchar(10) not null,
  title text not null,
  slug text not null,
  seo_title text not null default '',
  seo_description text not null default '',
  payload_json jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(service_content_item_id, locale)
);
```

---

## 13. 개발 순서 최종안

### 1단계

Cloudflare React + Vite 기본 프로젝트 생성
공식 가이드 구조대로 `src/ + worker/ + wrangler.jsonc`부터 만듭니다. ([Cloudflare Docs][1])

### 2단계

외부 홈페이지 5개 정적 페이지 완성
이 단계에서는 DB 연결 없이 화면/문구/반응형 레이아웃을 먼저 맞춥니다.

### 3단계

공통 디자인 시스템 구축
버튼, 카드, 페이지 헤더, 상태 배지, 폼 필드, 언어 선택기까지 만듭니다.

### 4단계

다국어 구조와 도메인 정책 반영
`i18n.ts`, locale 라우트, canonical/hreflang 구조, `www.jinbizman.com` 기준 URL 정책을 확정합니다.

### 5단계

문의하기 API 연결
가장 빠르게 “입력 → 저장 → 완료 메시지”가 검증되는 기능부터 붙입니다.

### 6단계

관리자 셸 레이아웃 구축
사이드바, 탑바, 대시보드 카드, 빈 상태 컴포넌트를 만듭니다.

### 7단계

서비스 허브 기본 구현
새 서비스 등록과 목록 조회, 도메인/언어 설정까지 가능하도록 만듭니다.

### 8단계

프로젝트/WBS 기본 구현
프로젝트 생성, WBS 생성, 담당자 지정, 상태 변경까지 연결합니다.

### 9단계

업무보고/업무일지 연결
WBS와 연결된 아침 보고, 퇴근 일지를 저장하고 대시보드에 반영합니다.

### 10단계

뉴스/공지 운영 구현
뉴스레터 탭과 관리자 발행 모듈을 연결하고 언어별 게시 상태를 붙입니다.

### 11단계

전자결재 기본 구현
배포 승인, 게시 승인, 일정 연장 승인부터 시작합니다.

### 12단계

평가 근거 데이터 집계 구현
평가 화면보다 먼저 근거 데이터 요약을 만듭니다.

### 13단계

테스트/보안/관측성 정리
Cloudflare는 Workers Vitest integration 사용을 권장하고, Rate Limiting API와 Secrets, Queues를 Worker 바인딩으로 쓸 수 있습니다. ([Cloudflare Docs][8])

### 14단계

1차 배포
외부 사이트 공개, 내부 ERP는 관리자 권한 접근만 허용합니다.

---

## 14. 최종 결론

이 프로젝트의 최종 정답은 아래입니다.

* 외부는 **회사소개형 AI 서비스 기업 홈페이지**
* 내부는 **WBS 중심 ERP형 관리자**
* 기술은 **React + Vite + TypeScript + Cloudflare Workers + Neon**
* 대표 도메인은 **`www.jinbizman.com`**
* 확장성 핵심은 **서비스 허브**
* 운영 핵심은 **프로젝트 + WBS + 업무보고 + 업무일지**
* 공정성 핵심은 **평가 화면이 아니라 평가 근거 데이터**
* 공개 서비스는 **한국어 / 영어 / 일본어 / 불어 / 스페인어 공식 지원**
* 외부와 내부 모두 **PC·모바일·태블릿 전 기기 완전 대응 반응형 웹앱**
* 공개 GitHub 코드는 **역할별 참고 기준**으로 쓰고, 실제 구현은 JINBIZ 구조에 맞춘 자체 코드로 정리

즉, 이번 최종본은 “홈페이지 하나 만드는 가이드”가 아니라 **JINBIZ 운영 시스템 전체를 실제 구현 가능한 단위로 쪼갠 개발 기준서**입니다. 이 방향은 첨부 홈페이지 기준 문서, 관리자 기준 문서, 프론트엔드 가이드, 백엔드 가이드, 실행용 확정 문서가 공통으로 요구한 회사 포지션, ERP 정의, WBS 중심 운영, 멀티 서비스 연결, 업무 데이터 기반 평가 구조와 일치합니다.     

기준 문서:

* [HomePage-Main-Guide.md](sandbox:/mnt/data/HomePage-Main-Guide.md) 
* [MangePage-Main-Guide.md](sandbox:/mnt/data/MangePage-Main-Guide.md) 

다음 단계는 **이 최종본을 기준으로 실제 구현용 `DB 마이그레이션 전체본 + API 명세서 전체본 + 화면별 TSX 골격 코드`를 뽑는 것**이 가장 자연스럽습니다.

---

## 15. 서비스 허브 · 콘텐츠 모델 · 다국어 운영 통합 설계 최종안

이 장은 기존 종합 가이드에 부족했던 **서비스 허브 / 콘텐츠 모델 / 다국어 발행 구조**를 문서 기준으로 완전히 닫기 위한 보강 장입니다.  
홈페이지 기준 문서의 외부 콘텐츠 모델, 관리자 기준 문서의 멀티 서비스 허브 구조, 실행 문서의 서비스/도메인/번역 테이블 방향을 한 문서로 통합합니다.

### 15-1. 서비스 허브를 먼저 두는 이유

JINBIZ는 `www.jinbizman.com` 한 개의 사이트만 영구적으로 관리하는 프로젝트가 아닙니다.  
향후 유레카월드, 신규 플랫폼, 캠페인 페이지, 서비스 소개 페이지, 앱 설정 화면, 고객지원 포털이 계속 추가될 수 있습니다.

따라서 관리자에서 먼저 잡아야 할 단위는 “페이지”가 아니라 **서비스**입니다.

서비스 허브를 먼저 두면 아래가 가능합니다.

* 새 홈페이지/앱을 **서비스 등록만으로** ERP에 연결
* 서비스별 도메인, 환경, 언어, 권한, 콘텐츠 모델 분리
* 외부 브랜드 사이트와 내부 운영 포털을 같은 관리 체계에 편입
* 서비스별 변경 이력, 배포 이력, 운영 담당자, 권한 템플릿 추적
* 언어별 공개 상태와 canonical 정책을 서비스 단위로 통제

### 15-2. 서비스 레지스트리 기본 항목

서비스 등록 시 최소한 아래 값을 가져야 합니다.

* `service_code`
* `service_name`
* `service_type`
* `brand_name`
* `status`
* `default_locale`
* `supported_locales`
* `i18n_enabled`
* `domain`
* `env_type`
* `permission_template_code`
* `content_model_code`
* `owner_department_id`
* `operator_user_id`
* `tech_owner_user_id`
* `seo_enabled`
* `shared_asset_enabled`

### 15-3. 서비스 유형 표준안

* 회사 공식 홈페이지
* 서비스 소개 홈페이지
* 플랫폼 랜딩페이지
* 이벤트/캠페인 마이크로사이트
* 웹앱
* 모바일앱 운영 설정
* 헬프센터 / 고객지원
* 관리자 서브포털
* 내부 전용 운영 페이지

### 15-4. 콘텐츠 모델 기반 운영 원칙

새로운 서비스가 생길 때마다 화면을 하드코딩하지 않고, 아래처럼 콘텐츠 타입과 콘텐츠 아이템을 조합하는 구조를 우선합니다.

#### 공통 콘텐츠 타입 예시

* `hero_section`
* `feature_cards`
* `company_overview`
* `business_items`
* `news_posts`
* `platform_cases`
* `faq_items`
* `service_announcements`
* `app_store_links`
* `download_buttons`
* `footer_legal_block`

#### 콘텐츠 아이템 공통 필드

* 제목
* 요약
* 본문 또는 payload
* CTA 라벨
* CTA 링크
* 시각 자산 키
* 노출 순서
* 활성 상태
* 공개 상태
* 작성자
* 수정자
* 예약 발행 일시
* 언어별 발행 상태
* SEO title
* SEO description
* canonical
* og image

### 15-5. 외부 홈페이지 콘텐츠 모델 최종안

#### Home Hero

* 상단 슬로건
* 메인 헤드라인
* 보조 카피
* 본문
* 1차 CTA 라벨/링크
* 2차 CTA 라벨/링크
* 시각 자산
* 노출 여부
* 언어별 발행 상태

#### Core Messages

* 카드 타이틀
* 카드 설명
* 아이콘/비주얼 키
* 노출 순서
* 활성 상태

#### Company Section

* 제목
* 본문
* 버튼 라벨
* 버튼 링크
* 강조 문구
* 언어별 발행 상태

#### Business Section

* 사업 카테고리명
* 요약
* 포인트 컬러
* 카드 순서
* 활성 상태

#### Eureka Highlight

* 섹션 제목
* 대표 설명
* 포인트 항목 리스트
* 시각 자산
* CTA 여부
* 공개 범위 메모

#### Newsletter Landing

* 섹션 제목
* 요약
* CTA 라벨
* CTA 링크
* 빈 상태 문구

#### Contact Landing

* 섹션 제목
* 요약
* CTA 라벨
* CTA 링크
* 안내문

### 15-6. 뉴스/공지 콘텐츠 모델 최종안

* 카테고리
* 제목
* slug
* 요약
* 본문
* 첨부파일
* 상단 고정 여부
* 작성자
* 수정자
* 예약 발행 일시
* 공개 상태
* 언어별 발행 상태
* SEO title
* SEO description
* og image
* canonical

### 15-7. 문의 콘텐츠 모델 최종안

* 이름
* 회사명/소속
* 이메일
* 연락처
* 문의 유형
* 문의 내용
* 유입 경로
* 언어 코드
* 담당자
* 상태값
* 후속 메모
* 프로젝트 전환 여부
* 알림 발송 기록

### 15-8. ERP 운영 콘텐츠 모델 최종안

* 서비스 정보
* 프로젝트 정보
* WBS 템플릿
* 일일 보고 항목
* 일일 일지 항목
* 결재 서식
* 평가 주기
* 평가 항목
* 평가 근거 데이터
* 문서 분류
* 시스템 공통 코드

### 15-9. 다국어 발행 운영 규칙

JINBIZ의 공식 지원 언어는 아래 5개입니다.

* 한국어
* 영어
* 일본어
* 불어
* 스페인어

운영 규칙은 아래처럼 고정합니다.

* 한국어를 기본 언어로 둡니다.
* 보조 언어는 기본 언어가 준비된 뒤 검수/발행합니다.
* 미번역 언어는 fallback이 아니라 **미공개 상태**로 둡니다.
* 언어별 `slug`, `seo_title`, `seo_description`, `publish_status`를 분리합니다.
* 관리자 ERP는 언어별 입력, 미리보기, 검수 상태, 공개/비공개를 지원합니다.
* 공개 페이지 canonical 기준은 항상 `https://www.jinbizman.com`입니다.
* 영어/일본어/불어/스페인어는 locale prefix 라우트를 사용합니다.

---

## 16. 폴더 · 라우트 · 파일 · API 연결 최종 보강안

이 장은 기존 섹션 5, 8, 10, 11을 실제 구현 파일 기준으로 더 직접 연결하기 위한 보강 장입니다.

### 16-1. 프론트 폴더 연결

#### `src/pages`

* `HomePage.tsx`
* `CompanyPage.tsx`
* `BusinessPage.tsx`
* `NewsletterPage.tsx`
* `ContactPage.tsx`

#### `src/pages/admin`

* `DashboardPage.tsx`
* `ServiceHubPage.tsx`
* `SiteContentPage.tsx`
* `NewsManagePage.tsx`
* `InquiriesPage.tsx`
* `ProjectsPage.tsx`
* `WbsBoardPage.tsx`
* `DailyReportPage.tsx`
* `DailyLogPage.tsx`
* `ApprovalsPage.tsx`
* `OrganizationPage.tsx`
* `EvaluationPage.tsx`
* `SystemSettingsPage.tsx`

#### `src/components/sections`

* 외부 홈페이지 섹션 컴포넌트
* 관리자 카드/패널 공통 컴포넌트
* 빈 상태/에러 상태/권한 없음 상태 컴포넌트
* 뉴스 탭/리스트/상세 컴포넌트
* 문의 폼 구성 요소

#### `src/components/common`

* `LanguageSwitcher.tsx`
* `PageHeader.tsx`
* `SectionHeader.tsx`
* `PrimaryButton.tsx`
* `Card.tsx`
* `StatusBadge.tsx`
* `EmptyState.tsx`
* `ErrorState.tsx`
* `LoadingState.tsx`

#### `src/lib`

* `i18n.ts`
* `responsive.ts`
* `seo.ts`
* `api.ts`
* `auth.ts`
* `permissions.ts`
* `constants.ts`
* `types.ts`
* `validators.ts`

### 16-2. 외부 프론트 라우트 최종안

#### 기본 한국어

* `/`
* `/company`
* `/business`
* `/newsletter`
* `/contact`

#### 다국어

* `/en`
* `/en/company`
* `/en/business`
* `/en/newsletter`
* `/en/contact`
* `/ja/...`
* `/fr/...`
* `/es/...`

### 16-3. 관리자 프론트 라우트 최종안

* `/admin/dashboard`
* `/admin/services`
* `/admin/services/:serviceId`
* `/admin/services/:serviceId/contents`
* `/admin/site/pages`
* `/admin/site/media`
* `/admin/site/seo`
* `/admin/site/translations`
* `/admin/news`
* `/admin/news/:id`
* `/admin/inquiries`
* `/admin/inquiries/:id`
* `/admin/leads`
* `/admin/opportunities`
* `/admin/projects`
* `/admin/projects/:id`
* `/admin/projects/:id/wbs`
* `/admin/daily-report`
* `/admin/daily-log`
* `/admin/approvals`
* `/admin/approvals/:id`
* `/admin/users`
* `/admin/departments`
* `/admin/roles`
* `/admin/evaluations/cycles`
* `/admin/evaluations/scores`
* `/admin/evaluations/:cycleId/:userId`
* `/admin/system/audit-logs`
* `/admin/system/settings`

### 16-4. Worker 라우트 그룹 최종안

#### Public

* `POST /api/inquiries`
* `GET /api/news`
* `GET /api/news/:slug`
* `GET /api/site/pages/:slug`
* `GET /api/locales`
* `GET /api/health`

#### Admin

* `GET /api/admin/services`
* `POST /api/admin/services`
* `PATCH /api/admin/services/:id`
* `GET /api/admin/site-content`
* `POST /api/admin/site-content`
* `PATCH /api/admin/site-content/:id`
* `GET /api/admin/contents/:id/translations`
* `POST /api/admin/contents/:id/translations`
* `PATCH /api/admin/contents/:id/translations/:locale`
* `GET /api/admin/news`
* `POST /api/admin/news`
* `PATCH /api/admin/news/:id`
* `GET /api/admin/inquiries`
* `PATCH /api/admin/inquiries/:id`
* `POST /api/admin/inquiries/:id/convert`

#### ERP

* `GET /api/erp/projects`
* `POST /api/erp/projects`
* `PATCH /api/erp/projects/:id`
* `GET /api/erp/wbs`
* `POST /api/erp/wbs`
* `PATCH /api/erp/wbs/:id`
* `POST /api/erp/wbs/:id/dependencies`
* `GET /api/erp/daily-reports`
* `POST /api/erp/daily-reports`
* `GET /api/erp/daily-logs`
* `POST /api/erp/daily-logs`
* `GET /api/erp/approvals`
* `POST /api/erp/approvals`
* `POST /api/erp/approvals/:id/actions`
* `GET /api/erp/evaluations/cycles`
* `POST /api/erp/evaluations/cycles`
* `GET /api/erp/evaluations/evidences`
* `POST /api/erp/evaluations/scores`
* `POST /api/erp/evaluations/finalize`

#### System

* `GET /api/system/audit-logs`
* `GET /api/docs`
* `GET /api/system/settings`
* `PATCH /api/system/settings`

### 16-5. DB 마이그레이션 연결 기준

#### 기본 축

* 조직/권한
* 서비스 허브
* 다국어/도메인
* 뉴스/공지
* 문의/리드
* 프로젝트/WBS
* 일일 보고/일지
* 결재
* 평가
* 공통 첨부/알림/감사로그

#### 마이그레이션 원칙

* 구조 변경은 반드시 SQL 파일로 남깁니다.
* 운영 DB 수작업 변경을 기준으로 삼지 않습니다.
* 신규 테이블은 `created_at`, `updated_at`를 기본 포함합니다.
* 다국어용 번역 테이블과 도메인 테이블을 명시적으로 둡니다.
* 일일 보고/일지는 반드시 WBS FK를 갖습니다.

---

## 17. 상태값 표준 · 데이터 규칙 · 응답 규약 최종안

### 17-1. 상태값 표준

#### 공통 문서 상태

* `draft`
* `review`
* `published`
* `archived`

#### 문의 상태

* `new`
* `in_progress`
* `resolved`
* `converted`

#### 서비스 상태

* `draft`
* `active`
* `maintenance`
* `retired`

#### 프로젝트 상태

* `planned`
* `active`
* `paused`
* `completed`
* `cancelled`

#### WBS 상태

* `todo`
* `in_progress`
* `review`
* `approval_wait`
* `done`
* `delayed`
* `blocked`

#### 결재 상태

* `draft`
* `submitted`
* `approved`
* `rejected`
* `cancelled`

#### 평가 주기 상태

* `draft`
* `open`
* `scoring`
* `finalized`
* `closed`

#### 사용자 상태

* `active`
* `invited`
* `suspended`
* `retired`

#### 번역 상태

* `draft`
* `in_translation`
* `review`
* `published`
* `hidden`

### 17-2. 공통 규칙

* 모든 기본 테이블은 `created_at`, `updated_at`을 가집니다.
* enum 문자열은 프론트/백 공용 타입으로 관리합니다.
* 외부 입력은 API에서 Zod로 검증하고 DB 저장 직전에 다시 확인합니다.
* 모든 관리자 API는 `request_id`, `actor_user_id`, `target_type`, `target_id` 기준 감사로그를 남깁니다.
* 프론트에서 DB 직접 접근 금지입니다.
* 모든 공개 콘텐츠는 canonical URL과 locale 메타데이터를 가집니다.
* 미번역 언어는 fallback 출력이 아니라 미공개 상태로 관리합니다.
* 반응형 UI를 깨뜨릴 수 있는 과도한 단일 응답 payload는 summary/detail API로 분리합니다.

### 17-3. 공통 응답 형식

```json
{
  "success": true,
  "data": {}
}
```

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자에게 보여줄 문장"
  }
}
```

### 17-4. 공통 오류 코드

* `VALIDATION_ERROR`
* `UNAUTHORIZED`
* `FORBIDDEN`
* `NOT_FOUND`
* `CONFLICT`
* `PRECONDITION_FAILED`
* `RATE_LIMITED`
* `INTERNAL_ERROR`

### 17-5. summary / detail 응답 원칙

* 목록 API는 카드/테이블 렌더링에 필요한 핵심 필드만 제공합니다.
* 상세 API는 본문, 이력, 메타데이터, 첨부, 승인 정보까지 확장합니다.
* 모바일 카드형 뷰에 필요한 요약 필드와 데스크톱 상세 뷰 필드를 분리합니다.
* 긴 다국어 문자열은 `summary`, `title`, `body`를 섞지 않고 의도적으로 나눕니다.

---

## 18. 권한 체계 · 승인 규칙 · 감사로그 최종안

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

### 18-2. 권한 원칙

* 서비스별 권한 분리
* 프로젝트별 권한 분리
* 데이터 열람 권한 분리
* 승인 권한 분리
* 평가 열람/확정 권한 분리
* 언어별 발행 승인 권한 분리
* 도메인/SEO 공통 설정 권한 분리

### 18-3. 승인 규칙

아래 작업은 전자결재와 직접 연결합니다.

* 서비스 등록 승인
* 페이지 개설 승인
* 콘텐츠 공개 승인
* 메뉴 반영 승인
* 도메인 연결 승인
* 배포 승인
* 점검 공지 승인
* 언어별 공개 승인
* 다국어 번역 검수 승인
* 프로젝트 개설 승인
* WBS 일정 변경 승인
* 마감일 연장 승인
* 예산 승인
* 외주 승인
* 지출 결의
* 휴가/근태 승인
* 인사평가 확정 승인

### 18-4. 감사로그 필수 항목

* `request_id`
* `actor_user_id`
* `service_id`
* `project_id`
* `target_type`
* `target_id`
* `locale`
* `action_type`
* `before_json`
* `after_json`
* `status_code`
* `error_code`
* `duration_ms`
* `created_at`

### 18-5. 중요한 쓰기 동작에 반드시 남길 로그

* 서비스 등록/수정
* 도메인 변경
* 언어별 발행/숨김
* 뉴스/공지 발행
* 문의 상태 변경
* 리드 전환
* 프로젝트 생성/상태 변경
* WBS 생성/상태 변경/지연 처리
* 아침 업무보고 제출
* 퇴근 업무일지 제출
* 결재 승인/반려
* 평가 점수 입력/확정
* 사용자 권한 변경
* 시스템 설정 변경

---

## 19. WBS · 업무보고 · 평가 데이터 흐름표 최종안

### 19-1. 표준 흐름

1. 프로젝트 생성
2. 프로젝트 유형 선택
3. 참여 직군 선택
4. 직군별 WBS 템플릿 자동 생성
5. 담당자 배정
6. 아침 업무보고에서 오늘 수행할 WBS 선택
7. 실시간 상태 변경 / 이슈 등록 / 산출물 업로드
8. 퇴근 업무일지에서 실제 진척률과 지연 사유 기록
9. 프로젝트 진척도와 일정 편차 자동 집계
10. 평가 근거 데이터로 누적

### 19-2. 맞춤형 WBS 3층 구조

#### 공통 코어

* 프로젝트
* 업무명
* 담당자
* 시작일
* 종료일
* 상태
* 우선순위
* 가중치
* 선행업무
* 승인 필요 여부
* 산출물
* 계획 진척률
* 실제 진척률

#### 직군 프로필

* 경영/사업개발
* 기획/PM
* 디자인
* 프론트엔드
* 백엔드/인프라
* AI/데이터
* 운영/콘텐츠/CS
* 재무/인사/경영지원

#### 업무 스타일 코드

* `PLAN_DOC`
* `PM_MILESTONE`
* `DESIGN_REVIEW`
* `FE_DEV`
* `BE_API`
* `AI_EXPERIMENT`
* `OPS_SLA`
* `SALES_PIPELINE`
* `FIN_APPROVAL`
* `HR_PROCESS`

### 19-3. 아침 업무보고 입력 기준

공통 입력:

* 보고일
* 작성자
* 소속
* 프로젝트
* WBS
* 오늘 목표
* 완료 목표 수치
* 예상 소요 시간
* 리스크
* 지원 요청

직군별 추가 항목:

* 기획: 오늘 확정할 문서/결정사항
* 디자인: 오늘 작업 화면/시안 차수
* 프론트: 구현 기능/PR 예정
* 백엔드: API/스키마 변경
* AI: 가설/실험 지표
* 운영: 처리 목표 건수/SLA 목표
* 재무: 마감 건수/승인 대기 건

### 19-4. 퇴근 업무일지 입력 기준

공통 입력:

* 작성일
* 작성자
* 프로젝트
* WBS
* 실제 수행 내용
* 완료 여부
* 실제 진척률
* 산출물 첨부
* 실제 소요 시간
* 지연 사유
* 내일 이어질 일

직군별 추가 항목:

* 기획: 변경 요구사항
* 디자인: 피드백 반영 상태
* 프론트: PR/QA 결과
* 백엔드: 테스트/배포 결과
* AI: 성능 수치
* 운영: 실제 처리 건수 / 미처리 잔량
* 재무: 반려 건 / 증빙 미비 건

### 19-5. 자동 집계 지표

* 프로젝트 계획 대비 실제 진척도
* 팀별 업무보고 제출률
* 팀별 업무일지 제출률
* 직군별 업무량
* 지연 사유 통계
* 서비스별 운영 이력
* 문의 → 리드 → 프로젝트 전환율
* 직군별 평가 요약
* 프로젝트별 산출물 누적 수
* 승인 처리 속도
* 언어별 운영/유입 지표

### 19-6. 평가 근거 데이터 원칙

평가는 아래 데이터에서 자동 수집합니다.

* WBS 완료 이력
* 업무보고/업무일지
* 산출물 첨부
* 승인 이력
* 지연 사유 코드
* 재작업 횟수
* QA 결과
* SLA 기록
* 프로젝트 기여도
* 피드백 반영 이력
* 회의 후속 액션 이행률

평가자는 기억이나 호감도가 아니라 **ERP 안의 실행 데이터**로 판단해야 합니다.

---

## 20. 환경변수 · wrangler 설정 · 로컬 개발 기준

### 20-1. `.dev.vars.example` 기준 필수 변수

* `DATABASE_URL`
* `JWT_SECRET`
* `SESSION_COOKIE_NAME`
* `APP_BASE_URL`
* `ADMIN_ALLOWED_ORIGINS`
* `APP_ENV`

### 20-2. 선택 변수

* `EMAIL_PROVIDER`
* `EMAIL_API_KEY`
* `EMAIL_FROM`
* `INQUIRY_NOTIFY_TO`
* `SENTRY_DSN`
* `LOG_LEVEL`
* `ENABLE_RATE_LIMIT`
* `ENABLE_QUEUE_NOTIFICATIONS`
* `ENABLE_API_DOCS`

### 20-3. `.dev.vars.example`

```env
# Database
DATABASE_URL=postgres://USER:PASSWORD@HOST/DB?sslmode=require

# Auth
JWT_SECRET=replace-with-long-random-secret
SESSION_COOKIE_NAME=jinbiz_session

# App
APP_BASE_URL=https://www.jinbizman.com
ADMIN_ALLOWED_ORIGINS=https://www.jinbizman.com

# Email / Notification
EMAIL_PROVIDER=resend
EMAIL_API_KEY=replace-with-provider-key
EMAIL_FROM=no-reply@example.com
INQUIRY_NOTIFY_TO=admin@example.com

# Monitoring
SENTRY_DSN=
LOG_LEVEL=info

# Feature flags
ENABLE_RATE_LIMIT=true
ENABLE_QUEUE_NOTIFICATIONS=true
ENABLE_API_DOCS=true

# Environment
APP_ENV=local
```

### 20-4. wrangler 설정 원칙

* canonical 도메인은 `https://www.jinbizman.com`
* `APP_BASE_URL`과 `ADMIN_ALLOWED_ORIGINS`는 동일 기준으로 둡니다.
* 민감정보는 `vars`가 아니라 **Secrets**로 관리합니다.
* 일반 구성값만 `vars`에 둡니다.
* 로컬 개발 기준 파일은 `.dev.vars` / `.dev.vars.example`을 유지합니다.
* 실제 값은 절대 저장소에 커밋하지 않습니다.

### 20-5. `wrangler.jsonc` 초안

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "jinbiz",
  "main": "worker/index.ts",
  "compatibility_date": "2026-03-27",
  "assets": {
    "directory": "./dist"
  },
  "vars": {
    "APP_BASE_URL": "https://www.jinbizman.com",
    "ADMIN_ALLOWED_ORIGINS": "https://www.jinbizman.com",
    "APP_ENV": "production",
    "ENABLE_RATE_LIMIT": "true",
    "ENABLE_QUEUE_NOTIFICATIONS": "true",
    "ENABLE_API_DOCS": "true"
  },
  "queues": {
    "producers": [
      {
        "binding": "NOTIFICATION_QUEUE",
        "queue": "jinbiz-notifications"
      }
    ]
  }
}
```

### 20-6. 민감정보 관리 원칙

* `DATABASE_URL`, `JWT_SECRET`, 이메일 API 키는 Secrets로 둡니다.
* `vars`는 plain text / JSON 구성값에만 씁니다.
* 로컬은 `.dev.vars`를 사용하고, 실제 값은 Git에 넣지 않습니다.
* 스크린샷, 예시 코드, 문서에 실제 키를 넣지 않습니다.

---

## 21. 테스트 · 보안 · 관측성 · 운영 기준 최종안

### 21-1. 1차 필수 테스트

* 문의 등록 검증 실패
* 문의 등록 성공
* 권한 없는 서비스 등록 차단
* WBS 없는 업무보고 차단
* 업무일지 progress 범위 검증
* 평가 확정 권한 차단
* 언어별 slug 중복 차단
* canonical 도메인 생성 정확성 검증
* 모바일/태블릿 관리자 핵심 화면 깨짐 없음 검증

### 21-2. Rate Limit 우선 적용 대상

* `POST /api/inquiries`
* 로그인/인증 관련 엔드포인트
* 공개 뉴스 검색 과다 호출
* 관리자 대량 수정/발행 액션
* 평가 확정/승인 액션

### 21-3. Queue로 분리할 작업

* 문의 저장 후 이메일 발송
* 관리자 알림
* 감사로그 후처리
* 번역 검수 요청 알림
* 배포 완료 알림
* 대량 통계 집계 후처리

### 21-4. 구조화 로그 기준

* `request_id`
* `user_id`
* `service_id`
* `project_id`
* `locale`
* `action_type`
* `status_code`
* `error_code`
* `duration_ms`

### 21-5. 운영 원칙

* 문의 저장과 이메일 발송은 같은 요청에서 끝내지 않고 저장 성공 후 Queue로 후처리합니다.
* rate limiting, logging, audit를 1차부터 적용합니다.
* 감사로그는 중요한 쓰기 동작에 우선 적용합니다.
* 다국어 콘텐츠는 언어별 게시 상태와 검수 상태를 별도 관리합니다.
* ERP도 반응형 QA를 배포 체크리스트에 포함합니다.
* 내부 ERP는 권한 사용자만 접근하도록 배포합니다.

### 21-6. 테스트 권장 구성

* Workers Vitest integration 기준 테스트
* public API 스모크 테스트
* 관리자 권한 테스트
* 핵심 입력 검증 테스트
* WBS 기반 업무보고/일지 테스트
* 언어별 발행 상태 테스트
* canonical / `hreflang` 메타 검증
* 배포 전 관리자 반응형 시나리오 점검

### 21-7. 보안 고정 원칙

* 프론트에서 DB 직접 접근 금지
* 모든 입력은 API에서 재검증
* JWT/세션 시크릿 하드코딩 금지
* 공개/관리자 API 권한 경계 분리
* 승인 필요한 WBS는 승인 전 완료 금지
* 평가 근거 없는 평가 확정 금지
* 서비스 등록 없는 서비스 운영 메뉴 생성 금지

---

## 22. 5단계 배포 완료 기준 최종안

이 장은 반드시 반영해야 하는 **실행형 배포 완료 기준**입니다.  
문서를 읽는 순간 바로 구현 우선순위를 잡을 수 있어야 하므로, 아래 5단계를 최종 기준으로 고정합니다.

## 22-1. 1단계 배포 완료 기준 — 외부 브랜드 골격 완성

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

## 22-2. 2단계 배포 완료 기준 — 반응형/다국어/도메인 체계 완성

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

## 22-3. 3단계 배포 완료 기준 — 문의와 관리자 셸, 서비스 허브 기본 완성

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

## 22-4. 4단계 배포 완료 기준 — WBS, 업무보고/일지, 뉴스 운영, 결재 완성

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

## 22-5. 5단계 배포 완료 기준 — 평가 근거, 보안, 테스트, 운영 기준 완성

### 포함 범위

* 평가 근거 데이터 집계
* 권한 세분화
* 보안 강화
* Rate Limit
* 구조화 로그
* 테스트
* 운영 체크리스트
* 1차 공개 배포

### 완료 기준

* 평가 점수 전에 근거 데이터가 보임
* 권한별 메뉴/데이터 접근 분리
* 비밀정보 하드코딩 없음
* 문의 API Rate Limit 적용
* 핵심 시나리오 테스트 통과
* 외부 사이트는 공개
* 내부 ERP는 권한 사용자만 접근

---

## 23. 구현 우선순위와 개발 순서 최종 정렬

### 23-1. 추천 구현 순서

1. 외부 홈페이지 5개 페이지 정적 골격
2. 공통 디자인 토큰과 공통 컴포넌트
3. 다국어 구조와 도메인 정책
4. 문의 폼과 Public API
5. 관리자 셸 레이아웃
6. 서비스 허브 기본
7. 홈페이지 운영 기본
8. 뉴스/공지 운영 기본
9. 프로젝트/WBS 기본
10. 아침 업무보고/퇴근 업무일지
11. 전자결재 기본
12. 평가 근거 데이터 집계
13. 권한/감사 로그/시스템 관리
14. 테스트/관측성/배포

### 23-2. 먼저 만들면 안 되는 것

* 과한 관리자 디자인 시스템
* 인증 고도화 선도입
* 실시간 기능 선도입
* 결제 시스템 선도입
* WebSocket 선도입
* 거대한 리팩터링
* 과한 폴더 분리
* 다국어 기계번역 대량 선반영
* 평가 점수 화면만 먼저 만드는 것

### 23-3. 반드시 지켜야 하는 연결 규칙

* 문의는 저장과 알림이 동시에
* 뉴스는 언어별 발행 상태 분리
* WBS 없이 보고/일지 금지
* 평가 근거 없는 평가 확정 금지
* 서비스 등록 없는 서비스 운영 메뉴 생성 금지
* 공개 페이지는 `www.jinbizman.com` 기준 유지

---

## 24. README 갱신 기준과 초안

### 24-1. README에 반드시 들어가야 하는 항목

* 프로젝트 소개
* 대표 도메인
* 공식 지원 언어
* 기술 스택
* 주요 기능
* 로컬 실행 방법
* 배포 방법
* 환경변수 설명
* 주요 폴더 구조
* 개발 원칙
* 자주 발생하는 오류와 해결법

### 24-2. README 초안

```md
# JINBIZ

JINBIZ는 외부 회사소개형 AI 서비스 홈페이지와 내부 WBS 중심 ERP 통합 운영 관리자를 하나의 저장소에서 운영하는 프로젝트입니다.

## 대표 도메인
- https://www.jinbizman.com

## 공식 지원 언어
- 한국어
- 영어
- 일본어
- 불어
- 스페인어

## 기술 스택
- Frontend: React + Vite + TypeScript
- Backend: Cloudflare Workers + Hono
- Database: Neon Postgres
- Styling: Tailwind CSS
- Validation: Zod
- Form: React Hook Form
- Auth: jose
- Charts / Table / DnD: Recharts, TanStack Table, dnd-kit

## 주요 기능
- 외부 홈페이지 5개 페이지
- 서비스 허브 기반 멀티 서비스 운영
- 뉴스/공지 운영
- 문의 저장 + 알림
- 프로젝트/WBS 관리
- 아침 업무보고 / 퇴근 업무일지
- 전자결재
- 평가 근거 데이터 기반 인사평가
- 감사로그
- 다국어 콘텐츠 운영
- 반응형 웹앱

## 로컬 실행
npm install
npm run dev
npx wrangler dev

## 배포
npm run build
npx wrangler deploy

## 개발 원칙
- 프론트에서 DB 직접 접근 금지
- 모든 입력은 API에서 재검증
- 민감정보 하드코딩 금지
- 작은 단위로 구현 후 확인
- canonical 도메인은 www.jinbizman.com
- 공개 페이지는 5개 언어 지원
```

---

## 25. 문서 교체용 최종 체크리스트와 완료도

### 25-1. 이 문서가 기존 문서를 즉시 대체할 수 있어야 하는 이유

* 외부 홈페이지 기준이 페이지 단위로 정리돼 있습니다.
* 내부 ERP 기준이 모듈 단위로 정리돼 있습니다.
* 서비스 허브, WBS, 업무보고/일지, 평가 근거 데이터가 누락되지 않았습니다.
* 반응형, 다국어, 도메인 정책이 선언이 아니라 운영 규칙으로 내려와 있습니다.
* 파일/라우트/API/상태값 연결까지 포함하고 있습니다.
* 5단계 배포 완료 기준이 구현 순서와 함께 들어 있습니다.
* README, 환경변수, 보안, 테스트, 운영 기준까지 같이 묶여 있습니다.

### 25-2. 최종 검수 체크리스트

#### 외부 홈페이지

* AI 서비스 회사 인식
* 메뉴 5개 고정
* 회사소개의 톤 안정성
* 사업소개 순서 고정
* 뉴스레터 3탭 구조
* 문의 폼 구조
* 다국어 지원
* 도메인 정책 반영
* 반응형 안정성

#### 내부 ERP

* CMS가 아닌 ERP 구조
* 서비스 허브 존재
* 홈페이지 운영 연결
* 뉴스/공지 운영 연결
* 문의/리드 관리 연결
* 프로젝트/WBS 연결
* 업무보고/업무일지 연결
* 전자결재 연결
* 조직/권한 연결
* 평가 근거 데이터 연결

#### 운영 정책

* 언어별 발행 상태
* `www.jinbizman.com` canonical
* 감사 로그
* 승인 흐름
* 상태값 표준
* 5단계 배포 완료 기준

### 25-3. 최종 완료도

이 문서의 완료도는 아래 기준으로 판단합니다.

* 원본 세부 유지
* 새 요구사항 3종 정식 반영
* 홈/관리자/프론트/백엔드/실행 문서의 핵심 세부 통합
* 다른 가이드와 충돌 없는 상위 기준 유지
* 종합 가이드 단독으로도 구현 우선순위와 연결 구조 판단 가능

#### 문서 완료도

**100%**

#### 비고

* 이 문서는 기획 요약본이 아니라 **실행용 기준 문서**입니다.
* 다음 단계에서는 이 문서를 기준으로 `src/`, `worker/`, `db/migrations/` 구현을 바로 시작하면 됩니다.
* 실제 런타임 오류 0% 여부는 구현과 테스트에서 검증하지만, **문서 기준 완성도는 100%**로 고정합니다.


[1]: https://developers.cloudflare.com/workers/framework-guides/web-apps/react/ "React + Vite · Cloudflare Workers docs"
[2]: https://neon.com/docs/serverless/serverless-driver "Neon serverless driver - Neon Docs"
[3]: https://github.com/TailAdmin/free-react-tailwind-admin-dashboard "TailAdmin free React Tailwind admin dashboard"
[4]: https://developers.cloudflare.com/workers/configuration/secrets/ "Secrets · Cloudflare Workers docs"
[5]: https://eng.sk.com/ "SK Group"
[6]: https://main.hiworks.com/ "하이웍스"
[7]: https://developers.cloudflare.com/queues/ "Cloudflare Queues docs"
[8]: https://developers.cloudflare.com/workers/testing/vitest-integration/ "Vitest integration - Workers"
[9]: https://developers.cloudflare.com/workers/vite-plugin/ "Cloudflare Vite plugin"
[10]: https://developers.cloudflare.com/workers/configuration/environment-variables/ "Environment variables · Cloudflare Workers docs"
