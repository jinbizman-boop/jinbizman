### 이번 단계 목표

* 기존 `JINBIZ 실행용 확정 문서 완성형 최종본 v1.2`를 기준으로, **반응형 웹앱**, **5개 국어 공식 지원**, **대표 도메인 `www.jinbizman.com` 사용**을 정식 요구사항으로 포함한 최신형 최종본으로 다시 고정합니다.
* 외부는 회사소개형 AI 서비스 홈페이지, 내부는 WBS 중심 ERP 통합 운영 관리자라는 기존 방향은 유지합니다. 
* 이번 문서는 참고용이 아니라 **바로 개발 착수 가능한 실행 기준서**로 정리합니다. 

### 변경 파일

* 이번 단계는 문서 최신화 단계라 실제 코드 수정은 없습니다.
* 다만 다음 구현 단계에서는 `src/`, `worker/`, `db/migrations/`를 중심으로 진행하는 것이 맞고, 외부 5개 페이지·관리자 핵심 화면·서비스 허브·WBS·일일보고·평가 흐름이 핵심 연결 지점입니다.  

### 실행 명령어

```bash
npm install
npm run dev
npx wrangler dev
```

### 확인 방법

* 외부 홈페이지가 `메인 홈 / 회사소개 / 사업소개 / 뉴스레터 / 문의하기` 5개 메뉴로 고정돼 있는지 확인합니다. 
* 뉴스레터가 실제로 `보도자료 / 공시정보 / 공지사항` 구조인지 확인합니다. 
* 관리자 화면이 CMS가 아니라 서비스 허브, 프로젝트/WBS, 업무보고/업무일지, 결재, 평가 중심 ERP 구조인지 확인합니다. 
* 외부와 내부 모두 `www.jinbizman.com` 기준, 5개 국어, 전 기기 반응형 기준이 포함되어 있는지 확인합니다. 

### 문제 발생 시

* 반응형, 다국어, 도메인 정책을 문서 마지막에만 덧붙이면 실제 구현에서 빠집니다.
* 서비스 허브, WBS, 평가 근거 데이터 흐름을 별도 기능처럼 분리하면 ERP 구조가 무너집니다.
* 뉴스레터를 구독형으로 오해하거나, 문의를 단순 폼으로만 처리하면 기존 확정 방향과 어긋납니다.  

### 다음 단계

* 다음으로는 이 최종본을 기준으로 **`db/migrations` 전체 초안 + `worker/routes` 골격 + `src/pages` TSX 골격**을 바로 뽑는 것이 가장 자연스럽습니다.

---

# JINBIZ 실행용 확정 문서 완성형 최종본 v1.4

* 작성일: 2026-03-27
* 문서 목적: 바로 개발 착수 가능한 실행 기준 고정
* 범위: 외부 회사소개형 AI 홈페이지 + 내부 WBS 중심 ERP 통합 운영 관리자
* 대표 도메인: `www.jinbizman.com`

## 0. 문서 전제

이번 문서는 현재 대화에서 확인된 기준 문서들을 바탕으로, 이미 확정된 방향을 하나의 실행 기준으로 재정리한 최종본입니다. 현재 확인 가능한 핵심 기준은 외부 홈페이지를 **회사소개형 AI 서비스 기업 홈페이지**로, 내부 시스템을 **WBS 중심 ERP 통합 운영 관리자**로 고정하는 것이며, 서비스 허브·업무보고/업무일지·평가 근거 데이터가 핵심 축입니다. 

이번 v1.3에서는 기존 v1.2 기준에 아래 3가지를 정식 요구사항으로 추가 확정합니다.

* **PC, 모바일, 태블릿 등 모든 기기와 모든 환경에서 깨지거나 이탈되지 않는 반응형 웹앱**
* **한국어, 영어, 일본어, 불어, 스페인어 공식 지원**
* **대표 도메인 `www.jinbizman.com` 사용**

또한 외부 홈페이지와 내부 ERP를 따로 노는 구조가 아니라, **하나의 브랜드, 하나의 디자인 토큰, 하나의 데이터 흐름, 하나의 운영 체계**로 묶어 설계합니다. 이 방향은 종합 가이드, 프론트 가이드, 관리자 기획안에서 공통으로 유지되는 기준입니다.   

---

## 1. 최종 방향과 최신 기준 반영 결론

### 1-1. 외부 홈페이지 방향

외부 홈페이지는 **회사소개형 AI 서비스 기업 홈페이지**로 고정합니다. 첫 화면에서 AI 서비스 회사로 인식되어야 하고, 상단 메뉴는 `메인 홈 / 회사소개 / 사업소개 / 뉴스레터 / 문의하기` 5개로 고정합니다. 사업 설명은 `AI 서비스 → 플랫폼 사업 → 기획 서비스` 순서로 유지하고, 뉴스레터는 실제로 `보도자료 / 공시정보 / 공지사항` 구조로 운영합니다.  

### 1-2. 내부 ERP 방향

내부 시스템은 CMS가 아니라 **ERP형 통합 운영 관리자**로 고정합니다. 핵심은 서비스 허브, 프로젝트/WBS, 아침 업무보고, 퇴근 업무일지, 문의/리드, 전자결재, 권한, 평가 근거 데이터입니다. 관리자 핵심 화면도 대시보드, 서비스 허브, 홈페이지 운영, 문의/리드, 프로젝트/WBS, 업무보고/업무일지, 전자결재, 조직/권한, 평가, 시스템 관리로 정리되어 있습니다. 

### 1-3. 실제 구현 기준

실제 구현 기준은 아래로 고정합니다.

* 런타임/배포: Cloudflare Workers + Wrangler
* 프론트: React + Vite + TypeScript
* DB: Neon Postgres + `@neondatabase/serverless`
* API 프레임워크: Hono
* 인증: jose
* 검증: Zod
* 폼: React Hook Form
* 테이블: TanStack Table
* 차트: Recharts
* 칸반: dnd-kit

이 스택은 실행 문서의 실제 구현 기준과 일치합니다. 

### 1-4. 이번 버전에서 추가 확정되는 핵심 정책

이번 v1.3에서 정식 고정하는 핵심 정책은 아래와 같습니다.

* 외부와 내부 모두 **반응형 웹앱**
* 공개 서비스는 **한국어·영어·일본어·불어·스페인어 공식 지원**
* 대표 도메인은 **`www.jinbizman.com`**
* canonical, `hreflang`, 공개 링크, 뉴스 상세, 문의 완료 링크 모두 이 도메인 기준
* 내부 ERP는 1차 운영 언어를 한국어 중심으로 두되, 언어별 콘텐츠 관리와 발행 제어는 처음부터 지원
* 관리자 표와 대시보드도 모바일/태블릿 대응을 포함

이 정책은 종합 가이드의 추가 확정 정책 3종과 정확히 일치합니다. 

---

## 2. 1차 오픈 범위, 2차 확장 범위, 비목표

### 2-1. 1차 오픈 필수 구현

외부

* 메인 홈
* 회사소개
* 사업소개
* 뉴스레터
* 문의하기
* 뉴스 조회 API
* 문의 등록 API
* 언어 전환 UI
* `www.jinbizman.com` 기준 canonical/SEO
* 전 기기 반응형 레이아웃

내부

* 관리자 로그인
* 대시보드
* 서비스 허브
* 홈페이지 운영 기본
* 뉴스/공지 운영
* 문의/리드 관리
* 프로젝트/WBS 관리
* 아침 업무보고
* 퇴근 업무일지
* 전자결재 기본
* 사용자/권한 관리 기본
* 평가 주기/항목/근거 조회/점수 입력 기본
* 감사로그 조회 기본
* 언어별 콘텐츠 관리 기본
* 모바일/태블릿 대응 관리자 레이아웃 기본

기존 1차 범위는 실행 문서에 이미 정의되어 있고, 이번 버전에서는 반응형/다국어/도메인 정책을 1차 기본 요구로 포함합니다.  

### 2-2. 2차 확장

* 일정/회의
* 경비/정산/재무
* 문서/지식관리
* 리포트/통계 고도화
* 인사/근태
* 직군별 WBS 템플릿 고도화
* AI 브리핑/요약
* 번역 검수 워크플로
* 언어별 운영 성과 리포트
* 개인/팀 To-do 자동 연동
* WBS 간트 차트 및 마일스톤 관리
* 참여율 시뮬레이터와 타임시트
* 비목별 예산 대시보드
* 증빙 자동 매핑 및 OCR 후보 기능
* 매뉴얼/규정 기반 AI 문의 챗봇 후보

### 2-3. 비목표

* ORM 선도입
* 도커/모노레포/마이크로서비스 선도입
* 실시간/WebSocket 선도입
* 대형 인증/결제 솔루션 선도입
* 실제 SQL 마이그레이션 본문까지 한 번에 대규모 확정
* 관리자 ERP를 데스크톱 전용으로 설계하는 방식
* 다국어를 단순 문자열 치환 수준으로 처리하는 방식

---

## 3. 폴더 구조와 라우트 확정안

### 3-1. 최종 폴더 구조 원칙

기존 실행 문서의 `jinbizman/` 기준 구조는 유지하되, 이번 버전에서는 반응형·다국어·도메인 정책을 반영하는 파일을 명시적으로 추가합니다. 기본 축은 `src/`, `worker/`, `db/`, `public/`, `docs/`입니다. 

핵심 추가 항목:

* `src/lib/i18n.ts`
* `src/lib/responsive.ts`
* `src/components/common/LanguageSwitcher.tsx`
* `worker/lib/locale.ts`
* `worker/lib/domain.ts`
* `worker/lib/seo.ts`
* `worker/routes/public/locales.ts`
* `worker/routes/admin/translations.ts`
* `db/migrations/*` 안의 다국어/도메인 확장 SQL

### 3-2. 외부 프론트 라우트

한국어 기본:

* `/`
* `/company`
* `/business`
* `/newsletter`
* `/contact`

다국어:

* `/en`
* `/en/company`
* `/en/business`
* `/en/newsletter`
* `/en/contact`
* `/ja/...`
* `/fr/...`
* `/es/...`

### 3-3. 관리자 프론트 라우트

기존 관리자 라우트는 유지하되, 다국어 운영용 관리 화면을 추가할 수 있도록 확장합니다.

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

### 3-4. API 라우트 그룹

* Public: `/api/health`, `/api/news`, `/api/inquiries`, `/api/auth/*`, `/api/site/pages/*`, `/api/locales`
* Admin: `/api/admin/services`, `/api/admin/news`, `/api/admin/inquiries`, `/api/admin/translations`
* ERP: `/api/erp/projects`, `/api/erp/wbs`, `/api/erp/daily-reports`, `/api/erp/daily-logs`, `/api/erp/evaluations`
* System: `/api/system/audit-logs`, `/api/docs`, `/api/system/settings`

---

## 4. 상태값 표준과 공통 규칙

### 4-1. 상태값 표준

* 서비스: `draft / active / maintenance / retired`
* 콘텐츠/뉴스: `draft / review / published / archived`
* 문의: `new / in_progress / resolved / converted`
* 리드: `new / qualified / proposal / won / lost`
* 프로젝트: `planned / active / paused / completed / cancelled`
* WBS: `todo / in_progress / review / approval_wait / done / delayed / blocked`
* 결재 문서: `draft / submitted / approved / rejected / cancelled`
* 결재 액션: `approve / reject / request_changes`
* 평가 주기: `draft / open / scoring / finalized / closed`
* 사용자: `active / invited / suspended / retired`
* 번역 상태: `draft / in_translation / review / published / hidden`

### 4-2. 공통 규칙

* 모든 기본 테이블은 `created_at`, `updated_at`을 가집니다.
* enum 문자열은 프론트/백 공용 타입으로 관리합니다.
* 외부 입력은 API에서 Zod로 검증하고 DB 저장 직전에 다시 확인합니다.
* 모든 관리자 API는 `request_id`, `actor_user_id`, `target_type`, `target_id` 기준 감사로그를 남깁니다.
* 프론트에서 DB 직접 접근 금지입니다.
* 모든 공개 콘텐츠는 canonical URL과 locale 메타데이터를 가집니다.
* 미번역 언어는 fallback 출력이 아니라 미공개 상태로 관리합니다.
* 반응형 UI를 깨뜨릴 수 있는 과도한 단일 응답 payload는 summary/detail API로 분리합니다.

---

## 5. DB 테이블 최종 설계서

### 5-1. 네이밍 규칙

* 테이블명: 복수형 snake_case
* 컬럼명: snake_case
* 기본 PK: `bigserial id`
* FK 명명: `대상명_id`
* 시간: `timestamptz`
* JSON: `jsonb`

### 5-2. 테이블 목록

기존 핵심 목록은 유지합니다.

* 조직/권한: `departments`, `users`, `roles`, `permissions`, `role_permissions`, `user_roles`
* 서비스 허브: `services`, `service_connections`, `service_content_types`, `service_content_items`, `service_change_logs`
* 대외 운영: `news_posts`, `inquiries`, `leads`, `opportunities`
* 프로젝트/WBS: `projects`, `project_members`, `wbs_templates`, `wbs_template_items`, `wbs_tasks`, `wbs_task_dependencies`, `project_outputs`, `project_issues`
* 일일보고: `daily_reports`, `daily_report_items`, `daily_logs`, `daily_log_items`
* 결재: `approval_documents`, `approval_lines`, `approval_actions`
* 평가: `evaluation_cycles`, `evaluation_items`, `evaluation_scores`, `evaluation_evidences`, `evaluation_feedbacks`
* 공통 지원: `attachments`, `comments`, `notifications`, `audit_logs`

이번 버전 추가:

* 도메인/다국어: `service_domains`, `service_translations`, `news_post_translations`

### 5-3. 핵심 스키마 추가 확정

기존 `services`에는 이미 `i18n_enabled`가 포함되어 있어 다국어 구조와 연결됩니다. 

추가 테이블 예시:

`service_domains`

* id
* service_id
* domain
* locale
* is_canonical
* created_at

`service_translations`

* id
* service_content_item_id
* locale
* title
* slug
* seo_title
* seo_description
* payload_json
* status
* created_at
* updated_at

`news_post_translations`

* id
* news_post_id
* locale
* title
* summary
* body
* slug
* seo_title
* seo_description
* status
* created_at
* updated_at

### 5-4. 핵심 인덱스/제약

기존 인덱스 외 추가:

* `service_translations(service_content_item_id, locale) UNIQUE`
* `news_post_translations(news_post_id, locale) UNIQUE`
* `service_domains(service_id, locale) UNIQUE`
* `service_translations(slug, locale) UNIQUE`
* `news_post_translations(slug, locale) UNIQUE`

### 5-5. 필수 업무 규칙

* 업무보고와 업무일지는 WBS 없는 상태로 저장 금지
* `actual_progress`와 `planned_progress`는 0~100 범위 유지
* `requires_approval=true`인 WBS는 승인 전 `done` 처리 금지
* 평가 점수 입력 전 `evaluation_evidences` 존재 여부 검사
* 문의 `converted` 시 `leads` 1건 이상 자동 생성 또는 기존 리드 연결
* 기본 언어 없이 보조 언어 단독 발행 금지
* canonical 도메인은 항상 `www.jinbizman.com`

---

## 6. API 명세서

### 6-1. 공통 응답 형식

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

### 6-2. 공통 오류 코드

* `VALIDATION_ERROR`
* `UNAUTHORIZED`
* `FORBIDDEN`
* `NOT_FOUND`
* `CONFLICT`
* `PRECONDITION_FAILED`
* `RATE_LIMITED`
* `INTERNAL_ERROR`

### 6-3. Public API

* `GET /api/health`
* `GET /api/news`
* `GET /api/news/:slug`
* `GET /api/site/pages/:slug`
* `GET /api/locales`
* `POST /api/inquiries`
* `POST /api/auth/login`
* `POST /api/auth/logout`
* `GET /api/auth/me`

문의는 저장 + 알림 동시 처리 구조여야 하고, 뉴스레터는 공개 소식 센터 역할을 하며, 5개 언어 게시 상태를 따로 관리하는 방향이 이미 문서에 반영돼 있습니다.  

### 6-4. Admin API

* `GET /api/admin/services`
* `POST /api/admin/services`
* `GET /api/admin/services/:id`
* `PATCH /api/admin/services/:id`
* `GET /api/admin/services/:id/content-types`
* `POST /api/admin/services/:id/content-types`
* `GET /api/admin/services/:id/contents`
* `POST /api/admin/services/:id/contents`
* `PATCH /api/admin/contents/:id`
* `GET /api/admin/contents/:id/translations`
* `POST /api/admin/contents/:id/translations`
* `PATCH /api/admin/contents/:id/translations/:locale`
* `GET /api/admin/news`
* `POST /api/admin/news`
* `PATCH /api/admin/news/:id`
* `GET /api/admin/inquiries`
* `GET /api/admin/inquiries/:id`
* `PATCH /api/admin/inquiries/:id`
* `POST /api/admin/inquiries/:id/convert`

### 6-5. ERP API

* `GET /api/erp/projects`
* `POST /api/erp/projects`
* `GET /api/erp/projects/:id`
* `PATCH /api/erp/projects/:id`
* `GET /api/erp/projects/:id/members`
* `POST /api/erp/projects/:id/members`
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

### 6-6. System API

* `GET /api/system/audit-logs`
* `GET /api/docs`
* `GET /api/system/settings`
* `PATCH /api/system/settings`

### 6-7. 인증/보안 원칙

* 세션은 HttpOnly cookie 저장 기본
* JWT payload에는 `userId`, `roles`, `departmentId` 정도만 저장
* 공개 API와 로그인/문의 API에 Rate Limiting 적용
* 문의 저장 후 이메일 발송/알림 적재는 Queue로 분리
* 민감정보는 Secrets로 관리
* 관리자 API는 로그인 + 퍼미션 + 스코프 + 감사로그가 기본

---

## 7. 화면별 UI 설계서

### 7-1. 공통 디자인 토큰

* Primary Navy: `#143B7D`
* Deep Navy: `#0F2E63`
* Light Blue Gray: `#EEF4FB`
* Soft Background: `#F8FAFD`
* AI Accent: `#18A7B5`
* Platform Accent: `#7C4DDB`
* Planning Accent: `#2F7EDB`
* Text Primary: `#1F2937`
* Text Secondary: `#6B7280`
* Border: `#D9E2EC`

이 디자인 토큰은 실행 문서의 공통 디자인 토큰과 일치합니다. 

### 7-2. 외부 홈페이지

`HomePage`

* 목표: AI 서비스 회사로 3초 안에 인식
* 구성: 헤더, Hero, 핵심 메시지 3카드, 회사소개 프리뷰, 사업소개 프리뷰, 유레카월드 강조, 뉴스레터 유도, 문의 유도, 푸터
* CTA: 회사소개 보기 / 사업소개 보기 / 문의하기
* 추가: 언어 전환 버튼, 다국어 Hero 길이 대응, 반응형 카드 배치

`CompanyPage`

* 목표: 공식 회사의 정체성과 신뢰 설명
* 구성: 페이지 헤더, 회사 개요, 회사 정의, 비전, 핵심 가치, 연혁
* 금지: 대표 인사말, 과도한 CTA, 문의 유도
* 추가: 모바일 세로 타임라인, 다국어 카드 높이 유연화

`BusinessPage`

* 목표: 사업 3축을 정확한 순서로 설명
* 순서: AI 서비스 → 플랫폼 사업 → 기획 서비스
* 추가: 다국어 폭 대응, 모바일 1열/데스크톱 다열 전환

`NewsletterPage`

* 목표: 보도자료/공시/공지 아카이브
* 상단 탭: 보도자료 / 공시정보 / 공지사항
* 1차 오픈: 구독 폼 없음
* 추가: 5개 언어 게시 상태 분리, 미발행 언어 숨김

`ContactPage`

* 목표: 문의 저장과 후속 전환의 시작점
* 필드: 이름, 회사명/소속, 이메일, 연락처, 문의 유형, 문의 내용
* 성공 후: 접수 완료 문구와 후속 안내
* 유효성: 이름 필수, 이메일 형식, 문의 내용 10자 이상
* 추가: 완료 메시지 다국어, 모바일 1열/데스크톱 2열

### 7-3. 관리자 ERP

상위 메뉴:

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

핵심 화면:

* DashboardPage: 오늘 할 일, 미제출자, 지연 WBS, 승인 대기, 신규 문의, 위험 프로젝트
* ServiceHubPage: 서비스 목록, 등록, 상태, 환경, 담당자, 권한 템플릿, 최근 변경 이력
* SiteContentPage: 페이지 관리, 컬렉션, SEO/OG, 배너/팝업, 메뉴, 미디어, 배포 이력
* InquiriesPage: 문의 목록, 상태 변경, 담당자 배정, 내부 메모, 리드 전환, 프로젝트 연결
* ProjectsPage: 리스트/칸반/간트
* WbsBoardPage: `todo / in_progress / review / approval_wait / done / delayed / blocked`
* DailyReportPage: 오늘 수행할 WBS, 목표, 예상 시간, 리스크, 지원 요청
* DailyLogPage: 실제 수행 내용, 실제 진척률, 산출물 URL, 지연 사유, 다음 액션
* ApprovalsPage: 대기/진행/완료/반려, 승인선, 이력, 코멘트
* UsersPage / RolesPage: 조직도, 사용자 상태, 역할 매핑, 서비스/프로젝트 스코프
* EvaluationPages: 평가 주기, 항목, 근거 데이터 탭, 점수 입력, 코멘트
* AuditLogsPage: 사용자, 액션, 날짜, 서비스, 프로젝트 필터

모든 관리자 화면 기본 상태:

* 로딩 상태
* 빈 데이터 상태
* 에러 상태
* 권한 없음 상태

이 관리자 화면 정의는 실행 문서와 프론트 가이드의 핵심 화면 정의와 일치합니다. 

---

## 8. 권한 정책표

### 8-1. 역할 정의

* `super_admin`: 전체 시스템/서비스/프로젝트/사용자/설정
* `executive_admin`: 대시보드 열람, 결재 승인, 평가 결과 열람, 중요 설정 승인
* `service_admin`: 서비스 등록/수정, 콘텐츠/환경/권한 관리
* `site_editor`: 홈페이지 문구, 뉴스/공지 편집, 발행 요청
* `bizdev_manager`: 문의/리드/사업기회 관리, 프로젝트 연결
* `project_pm`: 프로젝트 생성/수정, WBS 생성/배정, 멤버 관리
* `team_lead`: 팀원 WBS 리뷰, 업무보고/일지 검토, 평가 초안
* `member`: 본인 WBS, 보고, 일지, 알림
* `finance_manager`: 비용/정산 관련 결재
* `hr_evaluator`: 평가 주기/항목/집계/확정
* `viewer`: 읽기 전용
* `translation_editor`: 언어별 콘텐츠 작성/수정
* `translation_reviewer`: 언어별 검수/발행 승인

### 8-2. 스코프

* `global`
* `service`
* `project`
* `team`
* `self`

### 8-3. 퍼미션 코드 표준

* `service.read / service.create / service.update / service.assign`
* `content.read / content.create / content.update / content.publish`
* `translation.read / translation.create / translation.update / translation.publish`
* `inquiry.read / inquiry.update / lead.create / opportunity.manage`
* `project.read / project.create / project.update / project.member.manage`
* `wbs.read / wbs.create / wbs.update / wbs.approve`
* `daily_report.create / daily_log.create / daily_log.review`
* `approval.read / approval.create / approval.act`
* `evaluation.read / evaluation.score / evaluation.finalize`
* `audit.read / system.read / system.update`

### 8-4. 권한 원칙

* 서비스 데이터는 service scope 기준
* 프로젝트/WBS는 project scope 기준
* 평가는 team 또는 global 범위 분리
* 승인 권한은 역할 + 문서 종류 + 승인선 포함 여부 함께 검사
* 감사로그는 수정/삭제 불가
* 언어별 공개 승인은 일반 편집 권한과 분리
* 공통 도메인/SEO 설정은 소수 관리자만 수정 가능

---

## 9. WBS · 업무보고 · 평가 데이터 흐름표

핵심 문장:

**모든 업무는 프로젝트에 속하고, 모든 실무 기록은 WBS에 연결되며, 평가는 그 기록에서 자동으로 근거를 모읍니다.**

### 표준 흐름

1. 서비스 등록 (`services`)
2. 프로젝트 생성 (`projects`)
3. WBS 템플릿 선택 (`wbs_templates`, `wbs_template_items`)
4. WBS 생성 (`wbs_tasks`, `wbs_task_dependencies`)
5. 아침 업무보고 제출 (`daily_reports`, `daily_report_items`)
6. 실시간 수행: 상태 변경, 산출물 업로드, 이슈 등록, 필요 시 결재 상신
7. 퇴근 업무일지 제출 (`daily_logs`, `daily_log_items`)
8. 자동 집계: 프로젝트 진척률, 일정 편차, 담당자 업무량, 지연 원인, 미제출 현황
9. 평가 근거 생성 (`evaluation_evidences`)
10. 평가 점수 입력/확정 (`evaluation_scores`, `evaluation_feedbacks`)

### 핵심 연결

* `daily_report_items.wbs_task_id → wbs_tasks.id`
* `daily_log_items.wbs_task_id → wbs_tasks.id`
* `project_outputs.wbs_task_id → wbs_tasks.id`
* `approval_documents.project_id → projects.id`
* `evaluation_evidences.source_id → WBS/산출물/결재 원본`

### 자동 집계 지표

* 프로젝트 계획 대비 실제 진척률
* 팀/사용자별 업무량
* 지연 WBS 수
* 지연 사유 코드 분포
* 업무보고/업무일지 제출률
* 문의 → 리드 → 프로젝트 전환율

이 데이터 흐름은 실행 문서의 핵심 연결 구조와 일치합니다. 

---

## 10. README 초안

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

## 11. 환경변수 목록(.dev.vars.example 기준)

### 필수 변수

* `DATABASE_URL`
* `JWT_SECRET`
* `SESSION_COOKIE_NAME`
* `APP_BASE_URL`
* `ADMIN_ALLOWED_ORIGINS`
* `APP_ENV`

### 선택 변수

* `EMAIL_PROVIDER`
* `EMAIL_API_KEY`
* `EMAIL_FROM`
* `INQUIRY_NOTIFY_TO`
* `SENTRY_DSN`
* `LOG_LEVEL`
* `ENABLE_RATE_LIMIT`
* `ENABLE_QUEUE_NOTIFICATIONS`
* `ENABLE_API_DOCS`

### .dev.vars.example

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

### wrangler.jsonc 초안

기존 초안의 핵심 방향은 유지하되, 운영 기준을 아래처럼 봅니다.

* `APP_BASE_URL`: `https://www.jinbizman.com`
* `ADMIN_ALLOWED_ORIGINS`: `https://www.jinbizman.com`
* 공개 SEO/OG/canonical 생성은 이 기준을 따름

종합 가이드에서도 도메인 정책은 `www.jinbizman.com` 고정, canonical/hreflang/OG/sitemap 모두 이 기준이라고 정리합니다. 

---

## 12. 테스트, 운영, 관측성 기준

### 12-1. 1차 필수 테스트

* 문의 등록 검증 실패
* 문의 등록 성공
* 권한 없는 서비스 등록 차단
* WBS 없는 업무보고 차단
* 업무일지 progress 범위 검증
* 평가 확정 권한 차단
* 언어별 slug 중복 차단
* canonical 도메인 생성 정확성 검증
* 모바일/태블릿 관리자 핵심 화면 깨짐 없음 검증

### 12-2. 구조화 로그 기준

* `request_id`
* `user_id`
* `service_id`
* `project_id`
* `locale`
* `action_type`
* `status_code`
* `error_code`
* `duration_ms`

### 12-3. 운영 원칙

* 문의 저장과 이메일 발송은 같은 요청에서 끝내지 않고 저장 성공 후 Queue로 후처리
* rate limiting, logging, audit를 1차부터 적용
* 감사로그는 중요한 쓰기 동작에 우선 적용
* Sentry는 붙이면 좋지만 1차는 structured logging부터 시작 가능
* 다국어 콘텐츠는 언어별 게시 상태와 검수 상태를 별도 관리
* ERP도 반응형 QA를 배포 체크리스트에 포함

---

## 13. 바로 개발 들어가는 구현 순서

1. Cloudflare React 프로젝트 생성
2. `src / worker / db` 기본 구조 생성
3. `wrangler.jsonc / .dev.vars.example / env 타입` 정의
4. `worker/app.ts`, `response.ts`, `errors.ts`, `logger.ts`, `request-id middleware`
5. 인증(`auth.ts`, `login/logout/me`)
6. DB 연결(`db.ts`) 및 `migrations/001_init.sql` 초안
7. Public API(`health`, `news`, `inquiries`, `site-pages`, `locales`)
8. 서비스 허브(`services`, `content types`, `contents`, `translations`)
9. 프로젝트/WBS(`projects`, `wbs`, `dependencies`, `outputs`, `issues`)
10. 업무보고/일지(`daily-reports`, `daily-logs`)
11. 전자결재(`approvals`)
12. 평가(`cycles`, `items`, `evidences`, `scores`)
13. 외부 5개 페이지 구현
14. 관리자 셸 + 대시보드 + 핵심 운영 화면 구현
15. 반응형 QA + 다국어 운영 QA + 도메인 SEO 점검
16. 테스트/로그/배포

이 구현 순서는 실행 문서의 기본 순서를 유지하면서, 이번 버전에서 추가된 반응형·다국어·도메인 정책을 중간에 빠지지 않도록 반영한 것입니다.  

---

## 14. 최종 확정 문장

이 프로젝트는 이제 아래처럼 최종 고정합니다.

**JINBIZ는 외부 회사소개형 AI 홈페이지 + 내부 WBS 중심 ERP로 고정합니다.**
실제 구현은 **React/Vite + Cloudflare Workers + Hono + Neon + jose + Zod** 기준으로 진행하고, 관리자 핵심은 **서비스 허브, 프로젝트/WBS, 아침 업무보고, 퇴근 업무일지, 결재, 평가 근거 데이터화**입니다. 

추가로 아래도 함께 고정합니다.

* 대표 도메인: **`www.jinbizman.com`**
* 공개 서비스 공식 지원 언어: **한국어 / 영어 / 일본어 / 불어 / 스페인어**
* 외부 홈페이지와 내부 ERP 모두: **PC / 모바일 / 태블릿 전 기기 반응형 웹앱**
* 뉴스레터 운영 구조: **보도자료 / 공시정보 / 공지사항**
* 문의 운영 구조: **이메일 알림 + 관리자 저장**
* 서비스 확장 방식: **서비스 등록만 하면 운영 연결**
* 평가 방식: **주관이 아니라 WBS·산출물·일정·품질·협업 데이터 기반**

---

## 부록 A. 내부 기준 문서

* [Development-Execution.md](sandbox:/mnt/data/Development-Execution.md) 
* [Develop-Total-Guide.md](sandbox:/mnt/data/Develop-Total-Guide.md) 
* [Frontend-Develop-Guide.md](sandbox:/mnt/data/Frontend-Develop-Guide.md) 
* [HomePage-Main-Guide.md](sandbox:/mnt/data/HomePage-Main-Guide.md) 
* [MangePage-Main-Guide.md](sandbox:/mnt/data/MangePage-Main-Guide.md) 

## 부록 B. 공식 참고 출처

* Cloudflare Workers React + Vite
* Wrangler configuration
* Workers Rate Limiting
* Cloudflare Queues
* Workers Vitest integration
* Workers Secrets
* Neon serverless driver
* Hono Zod OpenAPI
* Hono RPC
* jose GitHub
* SK official
* Saltlux official
* Hiworks official
* Ecount official
* NAVER WORKS official

원하시면 다음 단계로 이 v1.3 기준에 맞춘 **폴더트리 최신본**까지 이어서 바로 정리하겠습니다.


---

## 15. 서비스 허브 · 콘텐츠 모델 · 다국어 운영 통합 설계 최종안

이 장은 실행 문서가 실제 개발 착수 기준서로 바로 쓰이기 위해 반드시 필요한 **서비스 허브 / 콘텐츠 모델 / 다국어 발행 구조**를 닫기 위한 보강 장입니다.
홈페이지 기준 문서의 외부 콘텐츠 기준, 관리자 기준 문서의 멀티 서비스 허브 구조, 종합 가이드의 서비스/도메인/번역 연결 원칙을 실행 문서 한 군데로 다시 묶습니다.

### 15-1. 서비스 허브를 먼저 두는 이유

JINBIZ는 `www.jinbizman.com` 한 개의 사이트만 영구적으로 관리하는 프로젝트가 아닙니다.
향후 유레카월드, 신규 플랫폼, 캠페인 랜딩페이지, 서비스 소개 사이트, 앱 설정 화면, 고객지원 포털이 추가될 수 있습니다.

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
* `is_visible_in_admin`

### 15-3. 서비스 유형 표준안

* 회사 공식 홈페이지
* 제품/서비스 소개 홈페이지
* 플랫폼 랜딩페이지
* 이벤트/캠페인 마이크로사이트
* 웹앱
* 모바일앱 운영 설정
* 고객지원/헬프센터
* 관리자 서브포털

### 15-4. 콘텐츠 모델 기반 운영 원칙

새 서비스가 생겨도 대응하려면 페이지를 하드코딩하는 대신 **콘텐츠 모델 기반**으로 관리해야 합니다.

공통 콘텐츠 타입 예시는 아래가 맞습니다.

* `hero_section`
* `feature_cards`
* `business_items`
* `news_posts`
* `platform_cases`
* `faq_items`
* `service_announcements`
* `app_store_links`
* `download_buttons`

각 모델은 아래 정책을 가집니다.

* 기본 언어 필수 여부
* 언어별 제목/설명/CTA 필드
* 언어별 slug
* 언어별 SEO title/description
* 언어별 발행 상태
* 번역 검수 상태

### 15-5. 외부 홈페이지 콘텐츠 모델 최소 묶음

#### 메인 홈

* Home Hero
* Core Messages
* Company Preview
* Business Preview
* Eureka Highlight
* Newsletter Promo
* Contact Promo

#### 뉴스/공지

* 보도자료
* 공시정보
* 공지사항
* 언어별 리스트/상세 메타데이터

#### 문의

* 안내문
* 입력 필드 구성
* 완료 메시지
* 후속 연락 정보

### 15-6. 언어별 발행 운영 규칙

* 기본 언어는 한국어입니다.
* 영어·일본어·불어·스페인어는 공식 지원 언어입니다.
* 기본 언어 없이 보조 언어 단독 발행은 금지합니다.
* 미번역 언어는 fallback 노출이 아니라 **미공개 처리**합니다.
* 언어별 slug, SEO title, SEO description, publish status를 분리합니다.
* canonical은 항상 `https://www.jinbizman.com` 기준입니다.
* `hreflang`은 실제 발행된 언어만 노출합니다.

### 15-7. 공통 자산 관리 원칙

새 서비스가 늘어날수록 아래 자산은 공통 관리가 효율적입니다.

* 로고
* 브랜드 컬러
* 공통 버튼 스타일
* CTA 문구 템플릿
* 공통 푸터 정보
* 법적 문구
* OG 이미지 규격
* 공통 배너
* 공통 문의 연결 방식
* 언어별 공통 문구 세트
* 언어별 기본 SEO 문구

---

## 16. 협업툴 기능정의서 반영 메모

업로드된 협업툴 기능정의서의 실제 확장 요구는 실행 문서의 1차/2차/3차 범위를 더 선명하게 만들어 줍니다.
이 문서는 현재 즉시 구현 범위를 무리하게 넓히지 않으면서도, 추후 확장 시 어디까지 연결해야 하는지를 실행 기준에 남겨야 합니다.

### 16-1. 1차에 반영할 연결 규칙

* WBS 담당자 지정 시 개인 To-do 자동 연동 가능 구조 확보
* 전자결재 지출결의서에 프로젝트/예산 항목 필수 선택 규칙 반영
* 관리자 대시보드에 결재 대기, 공지, 내 할 일 요약 카드 배치 가능 구조 확보
* 조직/권한 관리에서 RBAC 기반 메뉴 접근 제어 지원
* 휴가 결재 완료 시 연차 차감 같은 후속 자동화가 붙을 수 있도록 승인 이벤트 기준 정의

### 16-2. 2차 우선 검토 항목

* WBS 간트 차트 드래그 앤 드롭
* 마일스톤 별도 설정과 알림
* 프로젝트 전체 공정률 자동 계산
* 지연 과업 레드 플래그 표시
* 참여율 시뮬레이터
* 타임시트 승인 워크플로우
* 비목별 예산 관리
* 목표 집행률 대비 실제 집행 곡선 시각화

### 16-3. 3차 후보 기능

* 영수증 OCR 스캔
* 증빙 자동 매핑
* 불인정 비용 경고
* 단계별 매뉴얼/규정 지식 베이스
* RAG 기반 AI 문의 챗봇
* 컨소시엄 매칭 가이드

### 16-4. 실행 문서에서의 판단 원칙

* 협업툴 기능정의서의 요구는 **ERP 확장성 기준**으로 반영합니다.
* 1차 오픈은 서비스 허브, WBS, 업무보고/일지, 결재, 문의/리드, 평가 근거 데이터에 집중합니다.
* 다만 To-do 자동 연동, 간트, 투입률, 예산, OCR, AI 문의 같은 항목은 **데이터 구조와 이벤트 포인트**를 미리 남겨 둡니다.

---

## 17. 5단계 배포 완료 기준 최종안

이 장은 반드시 반영해야 하는 **실행형 배포 완료 기준**입니다.
반응형, 다국어, 도메인, 서비스 허브, WBS, 평가 근거 데이터가 어느 단계에서 완료돼야 하는지 구체적으로 고정합니다.

## 17-1. 1단계 배포 완료 기준 — 외부 브랜드 골격 완성

### 포함 범위

* 외부 홈페이지 5개 페이지 정적 골격
* 공통 디자인 토큰
* 공통 헤더/푸터
* Hero와 핵심 CTA
* 회사소개/사업소개/뉴스레터/문의하기 기본 구조

### 완료 기준

* 첫 화면에서 AI 서비스 회사로 인식됩니다.
* 메뉴 5개 구조가 고정됩니다.
* 사업소개 순서가 `AI 서비스 → 플랫폼 사업 → 기획 서비스`로 유지됩니다.
* 뉴스레터는 `보도자료 / 공시정보 / 공지사항` 구조를 가집니다.
* 회사소개에는 대표 인사말과 과도한 문의 유도가 없습니다.

## 17-2. 2단계 배포 완료 기준 — 반응형/다국어/도메인 체계 완성

### 포함 범위

* `src/lib/i18n.ts`
* 언어 선택기
* 언어별 라우트
* canonical / hreflang 정책
* `www.jinbizman.com` 기준 URL 정책
* 반응형 보강

### 완료 기준

* 한국어/영어/일본어/불어/스페인어 라우트 구조가 동작합니다.
* 언어 전환 시 동일 페이지를 최대한 유지합니다.
* 미발행 언어는 fallback이 아니라 숨김 처리됩니다.
* `www.jinbizman.com` 기준 SEO가 정리됩니다.
* 360px~1440px 이상에서 가로 스크롤이 없습니다.
* 버튼 겹침, 카드 이탈, 텍스트 깨짐이 없습니다.

## 17-3. 3단계 배포 완료 기준 — 문의와 관리자 셸, 서비스 허브 기본 완성

### 포함 범위

* 문의 API 연결
* 문의 DB 저장
* 이메일 알림
* 관리자 셸
* 대시보드 기본 카드
* 서비스 허브 기본 CRUD
* 홈페이지 운영 기본 화면

### 완료 기준

* 문의 입력 → 저장 → 성공 메시지가 검증됩니다.
* ERP에서 문의 목록 조회가 가능합니다.
* 이메일 알림이 동시에 발생합니다.
* 관리자 셸이 반응형으로 동작합니다.
* 서비스 등록 시 언어/도메인/권한 템플릿 설정이 가능합니다.
* 홈페이지 콘텐츠를 ERP에서 수정 가능한 골격이 확보됩니다.

## 17-4. 4단계 배포 완료 기준 — WBS, 업무보고/일지, 뉴스 운영, 결재 완성

### 포함 범위

* 프로젝트/WBS
* 아침 업무보고
* 퇴근 업무일지
* 뉴스/공지 운영
* 발행 승인
* 기본 전자결재
* 감사 로그 일부

### 완료 기준

* 모든 업무보고/일지가 WBS를 참조합니다.
* 프로젝트 진척률 자동 집계가 시작됩니다.
* 뉴스레터 리스트/상세와 관리자 발행이 연결됩니다.
* 게시 승인 플로우가 동작합니다.
* 결재 서식 일부를 운영할 수 있습니다.
* 감사 로그에 주요 변경 이력이 저장됩니다.

## 17-5. 5단계 배포 완료 기준 — 평가 근거, 보안, 테스트, 운영 기준 완성

### 포함 범위

* 평가 근거 데이터 집계
* 평가 주기/항목/점수 입력/확정
* 권한 고도화
* Rate Limit
* Queue 후처리
* 테스트
* 운영 로그
* README / 환경변수 / 배포 기준

### 완료 기준

* 평가 점수보다 먼저 평가 근거 데이터가 조회됩니다.
* 근거 없는 평가 확정이 차단됩니다.
* 공개 API에 Rate Limit이 적용됩니다.
* 문의 저장과 이메일 발송이 분리됩니다.
* request_id / actor / locale / duration 기준 로그가 남습니다.
* README, `.dev.vars.example`, `wrangler.jsonc` 기준이 정리됩니다.
* 1차 운영 기준 문서만으로 개발/테스트/배포 착수가 가능합니다.

---

## 18. 구현 우선순위와 반드시 지켜야 하는 연결 규칙

### 18-1. 추천 구현 순서

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

### 18-2. 먼저 만들면 안 되는 것

* 과한 관리자 디자인 시스템
* 인증 고도화 선도입
* 실시간 기능 선도입
* 결제 시스템 선도입
* WebSocket 선도입
* 거대한 리팩터링
* 과한 폴더 분리
* 다국어 기계번역 대량 선반영
* 평가 점수 화면만 먼저 만드는 것

### 18-3. 반드시 지켜야 하는 연결 규칙

* 문의는 저장과 알림이 동시에
* 뉴스는 언어별 발행 상태 분리
* WBS 없이 보고/일지 금지
* 평가 근거 없는 평가 확정 금지
* 서비스 등록 없는 서비스 운영 메뉴 생성 금지
* 공개 페이지는 `www.jinbizman.com` 기준 유지
* 서비스 등록 시 언어/도메인/권한 템플릿이 함께 연결
* WBS 담당자 지정 시 To-do 자동 연동 확장 포인트 유지
* 지출결의서 승인 시 프로젝트 예산 차감 확장 포인트 유지

---

## 19. 문서 교체용 최종 체크리스트와 완료도

### 19-1. 이 문서가 기존 문서를 즉시 대체할 수 있어야 하는 이유

* 외부 홈페이지 기준이 페이지 단위로 정리돼 있습니다.
* 내부 ERP 기준이 모듈 단위로 정리돼 있습니다.
* 서비스 허브, WBS, 업무보고/일지, 평가 근거 데이터가 누락되지 않았습니다.
* 반응형, 다국어, 도메인 정책이 선언이 아니라 운영 규칙으로 내려와 있습니다.
* 파일/라우트/API/상태값 연결까지 포함하고 있습니다.
* README, 환경변수, 보안, 테스트, 운영 기준까지 같이 묶여 있습니다.
* 5단계 배포 완료 기준이 구현 순서와 함께 들어 있습니다.
* 협업 기능정의서의 확장 요구까지 실행 범위와 후보 범위로 분리해 반영했습니다.

### 19-2. 최종 검수 체크리스트

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
* 서비스 등록만으로 메뉴/권한/언어/도메인 연결

#### 협업 기능 확장성

* To-do 자동 연동 가능
* 간트/마일스톤 확장 가능
* 투입률/타임시트 확장 가능
* 비목별 예산 관리 확장 가능
* OCR/증빙 자동화 후보 반영
* AI 매뉴얼/규정 문의 후보 반영

### 19-3. 최종 완료도

이 문서의 완료도는 아래 기준으로 판단합니다.

* 외부 홈페이지 실행 기준 정리 완료
* 관리자 ERP 실행 기준 정리 완료
* 서비스 허브/도메인/다국어 구조 반영 완료
* WBS/업무보고/업무일지/평가 흐름 반영 완료
* README/환경변수/배포/보안/테스트 기준 반영 완료
* 5단계 배포 완료 기준 반영 완료
* 협업 기능정의서 기반 확장 요구 반영 완료

문서 완료도는 **100%**로 판단합니다.
