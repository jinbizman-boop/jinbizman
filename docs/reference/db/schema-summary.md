# JINBIZ DB Schema Summary 최신형 완성형 최종본

## 이번 단계 목표

* 첨부 기준 문서들과 지금까지 확정된 채팅 방향을 모두 반영해 **`docs/db/schema-summary.md` 최신형 완성형 최종본**을 다시 정리합니다.
* 이번 문서는 `JINBIZ`의 외부 홈페이지와 내부 ERP를 함께 받치는 데이터베이스 전체 구조를 **한눈에 이해할 수 있도록 요약한 스키마 개요서**입니다.
* 기존 확정안에 아래 3가지를 정식 요구사항으로 추가 확정합니다.

  * **PC, 모바일, 태블릿 등 모든 기기와 모든 환경에서 깨지거나 이탈되지 않는 반응형 웹앱을 가능하게 하는 summary/detail 분리형 데이터 구조**
  * **한국어, 영어, 일본어, 불어, 스페인어 공식 지원**
  * **대표 도메인 `www.jinbizman.com` 사용**

* 이번 최종본은 단순 테이블 나열이 아니라 **무슨 테이블이 왜 필요한지, 어떻게 연결되는지, 1차 오픈에 무엇이 핵심인지 바로 파악 가능한 실행 기준 요약서**로 작성합니다.
* `Development-Execution`, `Develop-Total-Guide`, `Backend-Develop-Guide`, `MangePage-Main-Guide`, `HomePage-Main-Guide`, `migration-plan.md`에 반영된 **서비스 허브 / 공개 콘텐츠 / 프로젝트 / WBS / 업무보고 / 업무일지 / 결재 / 평가 근거 / 다국어 / canonical 도메인** 기준을 스키마 관점으로 다시 묶습니다.

---

## 변경 파일

이번 단계는 문서화 단계라 실제 SQL 생성은 없습니다.

다만 이 문서를 기준으로 직접 연결될 핵심 경로는 아래가 맞습니다.

* `db/migrations/*`
* `db/seeds/*`
* `worker/lib/db.ts`
* `worker/routes/public/*`
* `worker/routes/admin/*`
* `worker/routes/erp/*`
* `worker/routes/system/*`
* `src/lib/types.ts`

권장되는 실제 마이그레이션 파일 구조는 아래와 같습니다.

* `db/migrations/001_core_org_auth.sql`
* `db/migrations/002_service_hub.sql`
* `db/migrations/003_public_content.sql`
* `db/migrations/004_projects_wbs.sql`
* `db/migrations/005_daily_reports_logs.sql`
* `db/migrations/006_approvals.sql`
* `db/migrations/007_evaluations.sql`
* `db/migrations/008_domains_locales.sql`
* `db/migrations/009_audit_notifications.sql`
* `db/migrations/010_indexes_constraints.sql`

---

## 실행 명령어

이번 단계는 문서 확정 단계라 기본 확인 흐름은 아래 기준으로 둡니다.

```bash
npm install
npm run dev
npx wrangler dev
```

DB 스키마를 실제 적용하는 단계에서는 아래처럼 순차 적용 기준을 잡는 것이 가장 안전합니다.

```bash
psql "$DATABASE_URL" -f db/migrations/001_core_org_auth.sql
psql "$DATABASE_URL" -f db/migrations/002_service_hub.sql
psql "$DATABASE_URL" -f db/migrations/003_public_content.sql
psql "$DATABASE_URL" -f db/migrations/004_projects_wbs.sql
psql "$DATABASE_URL" -f db/migrations/005_daily_reports_logs.sql
psql "$DATABASE_URL" -f db/migrations/006_approvals.sql
psql "$DATABASE_URL" -f db/migrations/007_evaluations.sql
psql "$DATABASE_URL" -f db/migrations/008_domains_locales.sql
psql "$DATABASE_URL" -f db/migrations/009_audit_notifications.sql
psql "$DATABASE_URL" -f db/migrations/010_indexes_constraints.sql
```

---

## 확인 방법

아래가 맞으면 이번 schema summary는 정상으로 봐도 됩니다.

* 스키마가 **조직/권한 → 서비스 허브 → 공개 콘텐츠 → 프로젝트/WBS → 업무보고/일지 → 결재 → 평가 → 다국어/도메인 → 감사/알림** 순서로 이해되도록 정리되어 있는지
* 외부 홈페이지와 내부 ERP가 **같은 데이터 흐름** 안에 묶여 보이는지
* 서비스 허브, 프로젝트/WBS, 일일보고/일지, 평가 evidence가 핵심축으로 보이는지
* `service_domains`, `service_translations`, `news_post_translations`가 **5개 언어 + canonical 정책**을 위한 핵심 테이블로 설명되어 있는지
* `daily_report_items`와 `daily_log_items`가 반드시 `wbs_tasks`를 참조하는 구조로 정리되어 있는지
* 평가가 `evaluation_scores`보다 `evaluation_evidences` 중심으로 설명되는지
* 1차 오픈에서 꼭 필요한 핵심 테이블이 따로 정리되어 있는지
* 반응형 UI를 가능하게 하는 summary/detail 분리 구조가 포함되어 있는지
* 대표 도메인이 항상 `www.jinbizman.com` 기준으로 정리되어 있는지
* 문서 마지막 체크리스트로 기존 파일을 즉시 대체할 수 있는지 확인 가능한지

---

## 문제 발생 시

* 테이블 목록만 나열하고 관계를 설명하지 않으면 구현 중 연결 규칙이 빠집니다.
* 서비스 허브와 공개 콘텐츠의 관계가 불명확하면 멀티 서비스 확장성이 무너집니다.
* WBS와 업무보고/일지를 분리해서 이해하면 ERP 핵심 데이터 흐름이 끊깁니다.
* 평가를 점수 테이블 중심으로 설명하면 evidence 구조가 뒤로 밀립니다.
* 다국어를 별도 핵심 축으로 잡지 않으면 locale별 slug, 발행 상태, canonical 정책이 빠집니다.
* 공개 사이트용 스키마와 ERP용 스키마를 완전히 따로 보는 순간 하나의 운영 체계라는 기준이 무너집니다.
* 반응형을 CSS 문제로만 보면 목록/상세 응답 구조 설계가 빠집니다.

---

# 1. 최종 정의

이 문서에서 말하는 schema summary의 정답은 단순한 “테이블 이름 모음”이 아닙니다.

정답은 아래입니다.

> **JINBIZ DB Schema는 외부 회사소개형 AI 서비스 홈페이지와 내부 WBS 중심 ERP를 하나의 데이터 흐름으로 연결하기 위해, 서비스 허브·공개 콘텐츠·프로젝트/WBS·업무보고/업무일지·결재·평가 근거·다국어·도메인·감사 구조를 통합한 스키마 체계다.**

이 구조는 아래 전제를 반드시 지켜야 합니다.

* 외부 홈페이지는 **회사소개형 AI 서비스 기업 홈페이지**다.
* 내부 시스템은 **WBS 중심 ERP 통합 운영 관리자**다.
* 외부와 내부는 **같은 브랜드 / 같은 도메인 정책 / 같은 다국어 정책 / 같은 운영 체계**를 공유한다.
* 모든 업무는 **프로젝트에 속한다.**
* 모든 실무 기록은 **WBS에 연결된다.**
* 아침 업무보고와 퇴근 업무일지는 **WBS 없는 상태로 저장할 수 없다.**
* 평가는 점수 입력이 아니라 **evidence 기반 집계**를 전제로 한다.
* 대표 공개 도메인은 항상 **`www.jinbizman.com`** 이다.
* 공식 지원 언어는 항상 **`ko`, `en`, `ja`, `fr`, `es`** 이다.

---

# 2. 전체 스키마 구조 한눈에 보기

JINBIZ DB는 아래 9개 축으로 이해하는 것이 가장 정확합니다.

1. **조직/권한**
2. **서비스 허브**
3. **공개 콘텐츠**
4. **프로젝트/WBS**
5. **업무보고/업무일지**
6. **결재**
7. **평가**
8. **다국어/도메인**
9. **감사/알림**

이 9개 축은 서로 독립된 모듈이 아니라 아래 흐름으로 연결됩니다.

```text
조직/권한
   ↓
서비스 허브 ──→ 공개 콘텐츠 ──→ 외부 홈페이지
   ↓
프로젝트 ──→ WBS ──→ 업무보고/업무일지
   ↓               ↓
   └────────→ 결재 ─────────→ 평가 근거
                             ↓
                           평가
```

즉, 외부 공개 운영과 내부 ERP 운영이 분리된 두 시스템이 아니라, **같은 데이터 구조 안에서 다른 뷰를 가지는 하나의 운영 체계**입니다.

---

# 3. 모듈별 스키마 요약

## 3-1. 조직/권한

### 역할

* 사용자, 부서, 역할, 권한을 관리하는 기반
* 서비스 운영자, PM, 팀장, 평가자, 열람자 구분
* 감사로그의 actor 기준

### 핵심 테이블

* `departments`
* `users`
* `roles`
* `permissions`
* `role_permissions`
* `user_roles`

### 왜 중요한가

이 구조가 먼저 있어야 아래가 가능합니다.

* 서비스 담당자 지정
* 프로젝트 오너 지정
* WBS 담당자/리뷰어/승인자 지정
* 결재선 구성
* 평가자/피평가자 관계 설정
* 감사로그 actor 추적

---

## 3-2. 서비스 허브

### 역할

* 새 홈페이지나 앱이 생겼을 때 등록만으로 관리 가능한 구조
* 단일 사이트 CMS가 아니라 멀티 서비스 운영 허브
* 외부 홈페이지, 서비스 소개 페이지, 앱 운영 설정까지 연결 가능

### 핵심 테이블

* `services`
* `service_content_types`
* `service_content_items`
* `service_change_logs`

### 왜 중요한가

사용자가 요구한 “새 홈페이지/앱을 연결만 하면 관리 가능” 구조의 중심입니다.

### 대표 개념

* 서비스명
* 서비스 코드
* 서비스 유형
* 운영 상태
* 담당 부서/담당자
* 권한 템플릿
* 콘텐츠 모델
* `seo_enabled`, `i18n_enabled`

### 확장 메모

1차 핵심 스키마는 `services.domain`, `services.env_type` 기준으로 시작해도 충분합니다. 다만 서비스별 환경을 독립 엔티티로 분리해야 하는 시점이 오면 `service_environments`를 **2차 확장 테이블**로 추가할 수 있습니다. 이 문서의 핵심 축은 어디까지나 `services` 중심 구조를 유지하는 것입니다.

---

## 3-3. 공개 콘텐츠

### 역할

* 외부 홈페이지와 뉴스레터를 실제로 채우는 공개 운영 데이터
* 문의 접수와 사업기회 전환의 출발점

### 핵심 테이블

* `news_posts`
* `inquiries`
* `leads`
* `opportunities`

### 왜 중요한가

외부 홈페이지 1차 오픈에서 바로 검증 가능한 데이터 축입니다.

### 대표 개념

* 뉴스레터 실제 구조: `press / disclosure / notice`
* 문의 저장 + 관리자 처리
* 문의 → 리드 → 사업기회 → 프로젝트 전환 가능

---

## 3-4. 프로젝트 / WBS

### 역할

* ERP의 핵심 실행 엔진
* “모든 일은 프로젝트에 속하고, 모든 실무 기록은 WBS에 연결된다”를 실현

### 핵심 테이블

* `projects`
* `project_members`
* `wbs_templates`
* `wbs_template_items`
* `wbs_tasks`
* `wbs_task_dependencies`
* `project_outputs`
* `project_issues`

### 왜 중요한가

이 구조가 있어야 아래가 가능합니다.

* 프로젝트별 업무 분류
* 직무/직군별 맞춤 WBS 템플릿
* 선후행 업무 관계
* 산출물 축적
* 이슈와 리스크 추적
* 프로젝트 진척률 계산

---

## 3-5. 업무보고 / 업무일지

### 역할

* 아침 업무보고와 퇴근 업무일지를 구조화된 데이터로 저장
* 계획 대비 실제 진척률을 비교 가능하게 만듦

### 핵심 테이블

* `daily_reports`
* `daily_report_items`
* `daily_logs`
* `daily_log_items`

### 왜 중요한가

단순 텍스트 보고가 아니라 **실행 데이터**를 남기기 위한 구조입니다.

### 핵심 규칙

* `daily_report_items.wbs_task_id` 필수
* `daily_log_items.wbs_task_id` 필수
* WBS 없는 보고/일지 금지
* 실제 진척률은 0~100 범위
* 지연 사유, 다음 액션, 산출물 URL 저장 가능

---

## 3-6. 결재

### 역할

* 운영 통제 흐름
* 게시 승인, 일정 연장 승인, 예산 승인, 서비스 등록 승인 등 연결

### 핵심 테이블

* `approval_documents`
* `approval_lines`
* `approval_actions`

### 왜 중요한가

ERP가 단순 기록 시스템이 아니라 **운영 통제 시스템**이 되게 합니다.

### 대표 개념

* 문서 종류별 payload
* 결재선
* 승인/반려/수정요청 액션
* 프로젝트/WBS/서비스와 연결

---

## 3-7. 평가

### 역할

* 인사평가를 데이터 기반으로 운영
* 점수보다 evidence를 먼저 모으는 구조

### 핵심 테이블

* `evaluation_cycles`
* `evaluation_items`
* `evaluation_scores`
* `evaluation_evidences`
* `evaluation_feedbacks`

### 왜 중요한가

사용자가 요구한 “공정한 평가” 구조의 핵심입니다.

### 핵심 원칙

* 점수 입력 전 evidence가 있어야 함
* WBS/산출물/결재/업무일지에서 evidence 수집
* 평가 주기별로 집계
* finalize 전 누락 점검

---

## 3-8. 다국어 / 도메인

### 역할

* 5개 공식 언어 지원
* locale별 slug/SEO/발행 상태 분리
* canonical 도메인 정책 강제

### 핵심 테이블

* `service_domains`
* `service_translations`
* `news_post_translations`

### 왜 중요한가

다국어와 도메인은 UI 부가 기능이 아니라 **공개 운영 구조의 핵심 데이터**입니다.

### 핵심 원칙

* 지원 언어: `ko`, `en`, `ja`, `fr`, `es`
* 기본 언어: `ko`
* 기본 언어 없이 보조 언어 발행 금지
* locale별 slug unique
* canonical host는 `www.jinbizman.com`

---

## 3-9. 감사 / 알림

### 역할

* 누가 무엇을 바꿨는지 추적
* 운영 알림과 후속 액션 연결
* 첨부/코멘트 저장

### 핵심 테이블

* `attachments`
* `comments`
* `notifications`
* `audit_logs`

### 왜 중요한가

운영 안정성과 사후 추적의 핵심입니다.

### 핵심 원칙

* `audit_logs`는 사실상 append-only
* 주요 쓰기 동작은 모두 감사로그 남김
* `request_id`, `actor`, `target_type`, `target_id`, `action_type` 기준 추적

---

# 4. 핵심 테이블 목록 요약

## 4-1. 공통 / 조직

* `departments`
* `users`
* `roles`
* `permissions`
* `role_permissions`
* `user_roles`

## 4-2. 서비스 허브

* `services`
* `service_content_types`
* `service_content_items`
* `service_change_logs`

## 4-3. 공개 운영

* `news_posts`
* `inquiries`
* `leads`
* `opportunities`

## 4-4. 프로젝트 / WBS

* `projects`
* `project_members`
* `wbs_templates`
* `wbs_template_items`
* `wbs_tasks`
* `wbs_task_dependencies`
* `project_outputs`
* `project_issues`

## 4-5. 업무보고 / 업무일지

* `daily_reports`
* `daily_report_items`
* `daily_logs`
* `daily_log_items`

## 4-6. 결재 / 평가

* `approval_documents`
* `approval_lines`
* `approval_actions`
* `evaluation_cycles`
* `evaluation_items`
* `evaluation_scores`
* `evaluation_evidences`
* `evaluation_feedbacks`

## 4-7. 다국어 / 도메인

* `service_domains`
* `service_translations`
* `news_post_translations`

## 4-8. 공통 지원

* `attachments`
* `comments`
* `notifications`
* `audit_logs`

---

# 5. 가장 중요한 연결 관계

JINBIZ 스키마에서 가장 중요한 연결만 추리면 아래입니다.

## 5-1. 서비스 허브 연결

* `service_content_types.service_id → services.id`
* `service_content_items.service_id → services.id`
* `service_content_items.content_type_id → service_content_types.id`
* `service_change_logs.service_id → services.id`

## 5-2. 공개 콘텐츠 연결

* `news_posts.author_user_id → users.id`
* `inquiries.assigned_user_id → users.id`
* `leads.inquiry_id → inquiries.id`
* `opportunities.lead_id → leads.id`

## 5-3. 프로젝트 / WBS 연결

* `projects.service_id → services.id`
* `projects.owner_user_id → users.id`
* `project_members.project_id → projects.id`
* `project_members.user_id → users.id`
* `wbs_tasks.project_id → projects.id`
* `wbs_tasks.template_id → wbs_templates.id`
* `wbs_tasks.assignee_user_id → users.id`
* `wbs_tasks.reviewer_user_id → users.id`
* `wbs_tasks.approver_user_id → users.id`
* `wbs_task_dependencies.task_id → wbs_tasks.id`
* `wbs_task_dependencies.depends_on_task_id → wbs_tasks.id`
* `project_outputs.wbs_task_id → wbs_tasks.id`
* `project_issues.wbs_task_id → wbs_tasks.id`

## 5-4. 업무보고 / 업무일지 연결

* `daily_reports.user_id → users.id`
* `daily_reports.project_id → projects.id`
* `daily_report_items.daily_report_id → daily_reports.id`
* `daily_report_items.wbs_task_id → wbs_tasks.id`
* `daily_logs.user_id → users.id`
* `daily_logs.project_id → projects.id`
* `daily_log_items.daily_log_id → daily_logs.id`
* `daily_log_items.wbs_task_id → wbs_tasks.id`

## 5-5. 결재 연결

* `approval_documents.project_id → projects.id`
* `approval_documents.service_id → services.id`
* `approval_documents.requester_user_id → users.id`
* `approval_lines.approval_document_id → approval_documents.id`
* `approval_lines.approver_user_id → users.id`
* `approval_actions.approval_document_id → approval_documents.id`
* `approval_actions.approver_user_id → users.id`

## 5-6. 평가 연결

* `evaluation_items.cycle_id → evaluation_cycles.id`
* `evaluation_scores.cycle_id → evaluation_cycles.id`
* `evaluation_scores.evaluatee_user_id → users.id`
* `evaluation_scores.evaluator_user_id → users.id`
* `evaluation_scores.evaluation_item_id → evaluation_items.id`
* `evaluation_evidences.cycle_id → evaluation_cycles.id`
* `evaluation_evidences.user_id → users.id`
* `evaluation_feedbacks.cycle_id → evaluation_cycles.id`
* `evaluation_feedbacks.user_id → users.id`

## 5-7. 다국어 / 도메인 연결

* `service_domains.service_id → services.id`
* `service_translations.service_content_item_id → service_content_items.id`
* `news_post_translations.news_post_id → news_posts.id`

## 5-8. 감사 / 공통 연결

* `attachments`는 polymorphic target
* `comments`는 polymorphic target
* `notifications.user_id → users.id`
* `audit_logs.actor_user_id → users.id`

---

# 6. 상태값 요약 표준

## 6-1. 서비스

* `draft`
* `active`
* `maintenance`
* `retired`

## 6-2. 공개 콘텐츠 / 뉴스

* `draft`
* `review`
* `published`
* `archived`

## 6-3. 문의

* `new`
* `in_progress`
* `resolved`
* `converted`

## 6-4. 리드

* `new`
* `qualified`
* `proposal`
* `won`
* `lost`

## 6-5. 프로젝트

* `planned`
* `active`
* `blocked`
* `on_hold`
* `completed`
* `cancelled`

## 6-6. WBS

* `todo`
* `in_progress`
* `review`
* `approval_wait`
* `blocked`
* `done`
* `delayed`

## 6-7. 결재

문서:

* `draft`
* `submitted`
* `in_approval`
* `approved`
* `rejected`
* `cancelled`

액션:

* `approve`
* `reject`
* `request_changes`

## 6-8. 평가 주기

* `draft`
* `open`
* `scoring`
* `finalized`
* `closed`

## 6-9. 번역

* `draft`
* `in_translation`
* `review`
* `published`
* `hidden`

---

# 7. 다국어 / 도메인 요약

## 7-1. 공식 지원 언어

* `ko`
* `en`
* `ja`
* `fr`
* `es`

## 7-2. 기본 언어

* `ko`

## 7-3. 핵심 원칙

* 기본 언어 없이 보조 언어 단독 발행 금지
* locale별 `title`, `slug`, `seo_title`, `seo_description`, `payload_json` 분리
* locale별 slug unique
* 미발행 locale fallback 금지
* alternate/hreflang 생성 가능 구조 유지

## 7-4. canonical 도메인

* `https://www.jinbizman.com`

## 7-5. 대표 공개 URL 구조

기본 한국어:

* `/`
* `/company`
* `/business`
* `/newsletter`
* `/contact`

다국어:

* `/en/...`
* `/ja/...`
* `/fr/...`
* `/es/...`

---

# 8. 반응형 UI를 위한 스키마 관점 요약

반응형은 CSS만의 문제가 아니라 **데이터를 어떤 단위로 내려주느냐**의 문제이기도 합니다.

## 8-1. summary/detail 분리 구조가 필요한 이유

모바일에서는 카드형 요약이 필요하고, 데스크톱에서는 표 + 상세 드로어가 필요합니다.

그래서 DB 구조와 API 설계는 아래처럼 가야 합니다.

* 목록에 필요한 짧은 필드
* 상세에 필요한 긴 본문/JSON payload
* 별도 evidence/attachment/translation 구조

## 8-2. 대표 예시

### 뉴스

* 목록: `title`, `summary`, `slug`, `category`, `published_at`
* 상세: `body`, `seo_title`, `seo_description`, `alternateUrls`

### WBS

* 목록: `title`, `status`, `priority`, `due_date`, `actual_progress`
* 상세: `description`, `dependencyIds`, `output_url`, `approval`, `issues`

### 서비스 콘텐츠

* 목록: `title`, `status`, `available_locales`, `updated_at`
* 상세: `payload_json`, `seo`, `translations`, `change_logs`

### 평가 근거

* 목록: `source_type`, `summary_label`, `created_at`
* 상세: `summary_json`, `source_id`, `linked_task`, `linked_output`, `linked_approval`

즉, 스키마에서부터 **목록/상세로 잘라낼 수 있는 구조**를 가져가야 반응형 UI가 안정적으로 구현됩니다.

---

# 9. 1차 오픈 기준 핵심 테이블

1차 오픈에서 꼭 필요한 최소 핵심 테이블은 아래입니다.

## 9-1. 무조건 필요한 기반

* `departments`
* `users`
* `roles`
* `permissions`
* `role_permissions`
* `user_roles`

## 9-2. 외부 공개를 위한 핵심

* `services`
* `service_content_types`
* `service_content_items`
* `news_posts`
* `inquiries`
* `service_domains`
* `service_translations`
* `news_post_translations`

## 9-3. ERP 핵심 운영을 위한 최소

* `projects`
* `project_members`
* `wbs_templates`
* `wbs_tasks`
* `wbs_task_dependencies`
* `daily_reports`
* `daily_report_items`
* `daily_logs`
* `daily_log_items`
* `approval_documents`
* `approval_lines`
* `approval_actions`
* `evaluation_cycles`
* `evaluation_items`
* `evaluation_scores`
* `evaluation_evidences`

## 9-4. 운영 추적을 위한 최소

* `audit_logs`
* `notifications`

즉, 1차 오픈 기준으로도 **외부 사이트 + 관리자 ERP 핵심 흐름 + 평가 근거 데이터 + 다국어/도메인**까지 최소 축은 전부 들어가야 합니다.

---

# 10. 5단계 배포 완료 기준과 스키마 매핑

## 10-1. 1단계

* 조직/권한 + 서비스 허브 + 외부 공개 콘텐츠 기본 생성
* 핵심 테이블: `users`, `roles`, `services`, `service_content_items`, `news_posts`, `inquiries`

## 10-2. 2단계

* 도메인/locale/번역 구조 포함한 외부 사이트 운영 가능 상태
* 핵심 테이블: `service_domains`, `service_translations`, `news_post_translations`

## 10-3. 3단계

* 프로젝트/WBS/업무보고/업무일지 흐름 저장 가능 상태
* 핵심 테이블: `projects`, `wbs_tasks`, `daily_reports`, `daily_logs`

## 10-4. 4단계

* 결재/evidence/감사로그 포함한 관리자 운영 흐름 완성
* 핵심 테이블: `approval_documents`, `approval_actions`, `evaluation_evidences`, `audit_logs`

## 10-5. 5단계

* 인덱스/제약/운영 검증/배포 안정화까지 완료된 상태
* 핵심 대상: unique, check, query index, canonical/locale 무결성, append-only audit

---

# 11. 스키마 설계에서 절대 빠지면 안 되는 규칙

## 11-1. WBS 없는 업무보고 금지

* `daily_report_items.wbs_task_id` 필수
* `daily_log_items.wbs_task_id` 필수

## 11-2. progress 범위 제한

* `planned_progress`: 0~100
* `actual_progress`: 0~100

## 11-3. 평가는 evidence 우선

* `evaluation_scores`보다 `evaluation_evidences` 구조가 먼저 의미를 가져야 함
* 근거 없는 평가 확정 금지

## 11-4. locale별 slug unique

* `service_translations(slug, locale)` unique
* `news_post_translations(slug, locale)` unique

## 11-5. canonical host 고정

* canonical은 항상 `www.jinbizman.com`
* 비-www 직접 공개 기준 금지

## 11-6. 감사로그 append-only 원칙

* `audit_logs`는 변경/삭제보다 추가 중심
* 주요 쓰기 동작은 모두 남겨야 함

## 11-7. 서비스 허브 선행 원칙

* 서비스 등록 없는 서비스 운영 메뉴 생성 금지
* 콘텐츠/번역/도메인 데이터는 반드시 서비스 허브에 귀속

---

# 12. 대표 테이블별 요약 정의

## 12-1. `services`

서비스 허브의 최상위 엔티티입니다.  
새 홈페이지, 웹앱, 랜딩페이지, 앱 운영 설정을 “서비스” 단위로 묶습니다.

## 12-2. `service_content_items`

서비스에 속한 실제 공개 콘텐츠 본체입니다.  
페이지형, 카드형, 사례형, FAQ형 등 콘텐츠 모델의 기본 레코드입니다.

## 12-3. `news_posts`

뉴스레터의 본체입니다.  
실제 공개 운영은 `press / disclosure / notice` 3카테고리 기준입니다.

## 12-4. `inquiries`

외부 문의의 출발점입니다.  
저장 후 리드/사업기회/프로젝트 전환의 기초 데이터가 됩니다.

## 12-5. `projects`

ERP에서 모든 일의 상위 단위입니다.  
업무, 일정, 결재, 평가 근거가 여기로 귀속됩니다.

## 12-6. `wbs_tasks`

ERP 실행 엔진의 중심입니다.  
모든 실무 기록과 진척 추적은 결국 이 테이블에 연결됩니다.

## 12-7. `daily_report_items`

오늘 할 일을 어떤 WBS 기준으로 계획했는지 기록합니다.

## 12-8. `daily_log_items`

실제 무엇을 했고, 어디까지 진행됐는지 기록합니다.

## 12-9. `approval_documents`

운영 통제용 문서 본체입니다.  
일정 연장, 게시 승인, 예산 승인 등과 연결됩니다.

## 12-10. `evaluation_evidences`

평가 근거를 저장하는 핵심 테이블입니다.  
WBS, 산출물, 결재, 업무일지 등 다양한 source를 참조합니다.

## 12-11. `service_translations` / `news_post_translations`

5개 언어 운영을 실제로 가능하게 만드는 핵심 번역 테이블입니다.

---

# 13. 추천 인덱스/제약 핵심만 요약

## 13-1. 꼭 필요한 unique

* `users.email`
* `roles.code`
* `permissions.code`
* `services.service_code`
* `projects.code`
* `wbs_templates.code`
* `service_domains(service_id, locale)`
* `service_translations(service_content_item_id, locale)`
* `news_post_translations(news_post_id, locale)`
* `service_translations(slug, locale)`
* `news_post_translations(slug, locale)`

## 13-2. 꼭 필요한 check

* `planned_progress` 0~100
* `actual_progress` 0~100
* `expected_hours` 0~24
* `score` 범위 제한
* locale 허용 범위 제한

## 13-3. 꼭 필요한 조회 인덱스

* `news_posts(category, status, published_at desc)`
* `inquiries(status, created_at desc)`
* `projects(status, owner_user_id)`
* `wbs_tasks(project_id, status, due_date)`
* `daily_reports(user_id, report_date desc)`
* `daily_logs(user_id, log_date desc)`
* `audit_logs(actor_user_id, created_at desc)`

---

# 14. 운영 시 바로 이해해야 하는 핵심 데이터 흐름

가장 중요한 표준 흐름은 아래입니다.

1. 서비스 등록
2. 서비스 콘텐츠 생성
3. 공개 페이지/뉴스 발행
4. 문의 접수
5. 리드/사업기회 전환
6. 프로젝트 생성
7. WBS 생성
8. 아침 업무보고 제출
9. 퇴근 업무일지 제출
10. 결재 상신/처리
11. evidence 집계
12. 평가 점수 입력/확정

즉, DB 구조만 봐도 **브랜드 운영 → 사업기회 → 프로젝트 실행 → 평가 근거**까지 이어지는 흐름이 살아 있어야 합니다.

---

# 15. 이 문서를 어떻게 써야 하는가

이 문서는 아래 용도로 씁니다.

## 15-1. PM / 기획

* 어떤 데이터가 왜 필요한지 빠르게 파악
* 1차/2차 범위를 자를 때 기준으로 사용

## 15-2. 백엔드

* 마이그레이션 파일 분할 전 전체 구조 개요 파악
* FK, unique, check, 상태값 기준 확인

## 15-3. 프론트

* 어떤 화면이 어떤 테이블/응답 구조를 소비하는지 이해
* 목록/상세 화면 분리 설계 기준 확인

## 15-4. QA / 운영

* 어떤 기능이 어떤 테이블에 기록되어야 하는지 검증
* 빠진 로그/근거/evidence 확인

---

# 16. 문서 교체용 최종 체크리스트

## 16-1. 이 문서가 기존 `schema-summary.md`를 즉시 대체할 수 있어야 하는 이유

* 전체 스키마를 9개 축으로 재정리했습니다.
* 핵심 테이블 목록과 모듈 역할을 한눈에 이해할 수 있게 정리했습니다.
* 서비스 허브, 공개 콘텐츠, 프로젝트/WBS, 업무보고/일지, 결재, 평가, 다국어/도메인, 감사 구조를 모두 포함했습니다.
* 가장 중요한 FK 연결과 상태값 표준을 요약했습니다.
* 1차 오픈 핵심 테이블과 절대 빠지면 안 되는 규칙을 따로 정리했습니다.
* 반응형 UI를 가능하게 하는 summary/detail 분리 관점까지 포함했습니다.
* canonical `www.jinbizman.com` 정책과 5개 언어 공식 지원을 스키마 관점으로 반영했습니다.
* `migration-plan.md`와 충돌하지 않도록 마이그레이션 파일 책임 경계와 동일한 모듈 축으로 맞췄습니다.

## 16-2. 최종 검수 체크리스트

### 조직/권한
* 사용자/역할/퍼미션 구조가 설명되어 있는가

### 서비스 허브
* 서비스와 콘텐츠 모델 구조가 설명되어 있는가

### 공개 콘텐츠
* 뉴스/문의/리드/사업기회 구조가 설명되어 있는가

### 프로젝트/WBS
* 프로젝트와 WBS가 ERP 핵심 엔진으로 설명되어 있는가

### 업무보고/업무일지
* WBS FK 필수 규칙이 명시되어 있는가

### 결재/평가
* 결재와 evidence 기반 평가 구조가 설명되어 있는가

### 다국어/도메인
* `service_domains`, `service_translations`, `news_post_translations` 역할이 명확한가
* canonical host가 `www.jinbizman.com`으로 고정되어 있는가

### 운영/추적
* `audit_logs`, `notifications` 역할이 포함되어 있는가

---

## 변경 요약

* `docs/db/schema-summary.md`를 **전체 DB 구조를 한눈에 보는 실행형 요약 문서**로 재정의했습니다.
* 전체 스키마를 조직/권한, 서비스 허브, 공개 콘텐츠, 프로젝트/WBS, 업무보고/일지, 결재, 평가, 다국어/도메인, 감사/알림의 9개 축으로 정리했습니다.
* 외부 홈페이지와 내부 ERP가 같은 데이터 흐름 안에 있다는 점을 구조적으로 설명했습니다.
* 핵심 테이블, 주요 FK 연결, 상태값, locale/canonical 규칙, 1차 오픈 핵심 테이블을 정리했습니다.
* 반응형 UI를 가능하게 하는 summary/detail 데이터 구조 관점까지 포함했습니다.
* `migration-plan.md`의 10개 migration 분할 기준과 직접 연결되도록 정리했습니다.

---

## 다음 단계

가장 자연스러운 다음 작업은 **이 문서를 기준으로 `db/migrations/*.sql` 실제 전체본과 `src/lib/types.ts`용 DB-API 타입 매핑 표를 바로 생성하는 것**입니다.
