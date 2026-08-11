# JINBIZ DB Migration Plan 최신형 완성형 최종본

## 이번 단계 목표

* 첨부 기준 문서들과 지금까지 확정된 채팅 방향을 모두 반영해 **`docs/db/migration-plan.md` 최신형 완성형 최종본**을 다시 정리합니다.
* 이번 문서는 `JINBIZ`의 외부 홈페이지와 내부 ERP를 함께 받치는 데이터베이스 계층 중, **`db/migrations/*` 전체 실행 순서와 분할 기준**만 집중적으로 다루는 실행 기준서입니다.
* 기존 확정안에 아래 3가지를 정식 요구사항으로 추가 확정합니다.

  * **PC, 모바일, 태블릿 등 모든 기기와 모든 환경에서 깨지거나 이탈되지 않는 반응형 웹앱을 가능하게 하는 summary/detail 구조를 지원하는 데이터 모델**
  * **한국어, 영어, 일본어, 불어, 스페인어 공식 지원**
  * **대표 도메인 `www.jinbizman.com` 사용**

* 이번 최종본은 보기 좋은 개요 문서가 아니라 **바로 구현 가능한 마이그레이션 실행 계획서**로 작성합니다.
* `Development-Execution`, `Backend-Develop-Guide`, `Develop-Total-Guide`, `HomePage-Main-Guide`, `MangePage-Main-Guide`, `Frontend-Develop-Guide`에 공통으로 반영된 **서비스 허브 / 공개 콘텐츠 / 프로젝트 / WBS / 업무보고 / 업무일지 / 결재 / 평가 근거 / 다국어 / 도메인 / 감사로그** 방향을 마이그레이션 범위에 맞게 재조립합니다.

---

## 변경 파일

이번 단계는 문서화 단계라 실제 SQL 파일 생성은 없습니다.

다만 이 문서를 기준으로 바로 생성될 핵심 경로는 아래가 맞습니다.

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
* `db/seeds/001_seed_roles_permissions.sql`
* `db/seeds/002_seed_default_service_content_types.sql`
* `db/seeds/003_seed_wbs_templates.sql`
* `db/seeds/004_seed_system_settings.sql`

관련 구현 연결 파일은 아래가 맞습니다.

* `worker/lib/db.ts`
* `worker/routes/public/*`
* `worker/routes/admin/*`
* `worker/routes/erp/*`
* `worker/routes/system/*`
* `src/lib/types.ts`
* `src/lib/api.ts`
* `src/lib/i18n.ts`

---

## 실행 명령어

이번 단계는 문서 확정 단계라 실제 실행 명령어는 아래 흐름을 기준으로 둡니다.

```bash
npm install
npm run dev
npx wrangler dev
```

다음 실제 구현 단계에서 권장되는 기본 흐름은 아래와 같습니다.

```bash
npm create cloudflare@latest -- jinbiz --framework=react
npm install
npm install @neondatabase/serverless
npm install hono @hono/zod-openapi jose zod
npm run dev
npx wrangler dev
```

마이그레이션 작성 이후 실제 적용 기준 예시는 아래처럼 관리하는 것이 적절합니다.

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

seed 적용 예시는 아래 순서가 맞습니다.

```bash
psql "$DATABASE_URL" -f db/seeds/001_seed_roles_permissions.sql
psql "$DATABASE_URL" -f db/seeds/002_seed_default_service_content_types.sql
psql "$DATABASE_URL" -f db/seeds/003_seed_wbs_templates.sql
psql "$DATABASE_URL" -f db/seeds/004_seed_system_settings.sql
```

---

## 확인 방법

아래가 맞으면 이번 migration plan은 정상으로 봐도 됩니다.

* 마이그레이션 순서가 **조직/권한 → 서비스 허브 → 공개 콘텐츠 → 프로젝트/WBS → 업무보고/일지 → 결재 → 평가 → 도메인/다국어 → 감사/알림 → 인덱스/제약** 순서로 정리되어 있는지
* 서비스 허브, 프로젝트/WBS, 일일보고/일지, 평가 근거 데이터가 **선후행 관계에 맞게 분리**되어 있는지
* `service_domains`, `service_translations`, `news_post_translations`가 **5개 언어 + canonical 정책**을 지원하도록 포함되어 있는지
* `daily_report_items`와 `daily_log_items`가 반드시 `wbs_tasks`를 참조하도록 되어 있는지
* 평가 점수보다 `evaluation_evidences`가 먼저 존재할 수 있는 구조인지
* 인덱스와 제약을 마지막 파일로 분리해 **초기 생성과 성능 튜닝을 분리**하고 있는지
* seeds가 역할/권한, 기본 콘텐츠 타입, 기본 WBS 템플릿, 시스템 설정 초기화에 맞게 정리되어 있는지
* 롤백/재실행/운영 배포 시 주의사항이 포함되어 있는지
* 도메인 기준이 항상 `www.jinbizman.com`인지
* 문서 마지막 체크리스트로 기존 파일을 즉시 대체할 수 있는지 확인 가능한지

---

## 문제 발생 시

* 처음부터 모든 테이블을 한 파일에 몰아넣으면 선후행 관계를 추적하기 어렵고 장애 시 복구가 힘들어집니다.
* 권한/조직보다 서비스/프로젝트를 먼저 만들면 FK와 scope 구조가 흔들립니다.
* WBS보다 업무보고/업무일지를 먼저 만들면 핵심 연결 규칙이 깨집니다.
* 평가 테이블을 너무 일찍 만들면 evidence 연결 전에 점수 위주 구조가 굳어집니다.
* 다국어/도메인을 뒤늦게 붙이면 slug, canonical, `hreflang`, 언어별 발행 상태가 꼬입니다.
* 인덱스를 초반 생성 SQL에 과하게 섞으면 개발 초기 변경 비용이 커집니다.
* `NOT NULL`을 너무 일찍 강하게 걸면 seed와 백필이 어려워집니다.
* `status`를 자유 문자열로 두면 프론트/백엔드/통계에서 표준 상태 관리가 무너집니다.

---

# 1. 최종 정의

이 문서에서 말하는 migration plan의 정답은 단순한 “테이블 생성 순서 메모”가 아닙니다.

정답은 아래입니다.

> **JINBIZ DB Migration Plan은 외부 홈페이지 운영과 내부 ERP 운영을 하나의 데이터 흐름으로 연결하기 위해, 서비스 허브·공개 콘텐츠·프로젝트/WBS·업무보고/업무일지·결재·평가 근거·다국어·도메인·감사로그 구조를 선후행 관계에 맞게 단계적으로 생성하는 실행 계획이다.**

이 계획은 아래 전제를 반드시 지켜야 합니다.

* 외부 홈페이지는 **회사소개형 AI 서비스 기업 홈페이지**다.
* 내부 시스템은 **WBS 중심 ERP 통합 운영 관리자**다.
* 모든 업무는 **프로젝트에 속한다.**
* 모든 실무 기록은 **WBS에 연결된다.**
* 아침 업무보고와 퇴근 업무일지는 **WBS 없는 상태로 저장할 수 없다.**
* 평가는 점수 입력이 아니라 **evidence 기반 집계**를 전제로 한다.
* 다국어는 UI 옵션이 아니라 **데이터 구조**다.
* canonical 도메인은 항상 **`www.jinbizman.com`** 이다.
* 공식 지원 언어는 항상 **`ko`, `en`, `ja`, `fr`, `es`** 이다.

---

# 2. 마이그레이션 전략 전체 개요

## 2-1. 분할 철학

마이그레이션은 아래 원칙으로 분할합니다.

* **핵심 선행 테이블** 먼저 생성
* **운영 데이터**는 업무 흐름 단위로 분리
* **다국어/도메인**은 후반에 붙이되, 공개 콘텐츠보다 늦지 않게 연결
* **감사/알림**은 운영 추적을 위해 별도 파일로 분리
* **인덱스/제약**은 마지막에 정리해 개발 초기 변경 비용을 낮춤
* **초기 생성과 운영 강화**를 분리해, 1차 오픈과 2차 안정화를 같은 스키마에서 이어갈 수 있게 함

## 2-2. 추천 순서

1. `001_core_org_auth.sql`
2. `002_service_hub.sql`
3. `003_public_content.sql`
4. `004_projects_wbs.sql`
5. `005_daily_reports_logs.sql`
6. `006_approvals.sql`
7. `007_evaluations.sql`
8. `008_domains_locales.sql`
9. `009_audit_notifications.sql`
10. `010_indexes_constraints.sql`

이 순서는 백엔드 가이드에 제안된 분할 순서를 기준으로 하되, 실행 문서의 표준 흐름과 관리자/종합 가이드의 연결 규칙까지 반영한 최종 고정안입니다.

## 2-3. 왜 이 순서가 맞는가

* 조직/권한이 먼저 있어야 서비스/프로젝트 소유자와 actor를 연결할 수 있습니다.
* 서비스 허브가 먼저 있어야 공개 콘텐츠와 도메인/언어를 어디에 귀속할지 정해집니다.
* 공개 콘텐츠가 먼저 있어야 외부 사이트를 조기에 띄울 수 있습니다.
* 프로젝트/WBS가 먼저 있어야 업무보고/업무일지가 의미를 가집니다.
* 업무보고/업무일지가 먼저 있어야 결재/평가의 근거 흐름이 살아납니다.
* 평가는 evidence가 먼저 누적된 뒤 들어와야 점수 위주 구조를 막을 수 있습니다.
* 인덱스/제약은 마지막에 정리해야 초기 스키마 수정이 덜 아픕니다.

## 2-4. 표준 흐름과의 매핑

개발 실행 문서의 표준 흐름은 **서비스 등록 → 프로젝트 생성 → WBS 템플릿 선택 → WBS 생성 → 아침 업무보고 → 실시간 수행 → 퇴근 업무일지 → 자동 집계 → 평가 근거 생성 → 평가 점수 입력/확정** 순서입니다. DB 마이그레이션도 이 흐름을 깨지 않도록 설계해야 합니다.

* `services`가 먼저 있어야 서비스 허브가 열립니다.
* `projects`, `wbs_templates`, `wbs_tasks`가 있어야 일일 기록이 의미를 가집니다.
* `daily_report_items.wbs_task_id`, `daily_log_items.wbs_task_id`, `project_outputs.wbs_task_id` 연결이 살아 있어야 자동 집계와 평가 evidence가 가능합니다.

---

# 3. 공통 DB 설계 원칙

## 3-1. 네이밍 규칙

* 테이블명: 복수형 snake_case
* 컬럼명: snake_case
* 기본 PK: `bigserial id`
* FK 명명: `대상명_id`
* 시간 컬럼: `created_at`, `updated_at`
* 공개 발행/작성 시점: `published_at`, `submitted_at`, `acted_at`
* JSON: `jsonb`
* 삭제 정책: 기본은 하드 삭제보다 상태값/아카이브 우선 검토

## 3-2. 공통 컬럼 원칙

권장 공통 컬럼:

* `id`
* `created_at timestamptz not null default now()`
* `updated_at timestamptz not null default now()`

필요시 추가 공통 컬럼:

* `created_by`
* `updated_by`
* `status`
* `sort_order`
* `is_active`

## 3-3. 상태값 표준

문서 전체와 맞추어 아래 상태값 표준을 DB에도 반영합니다.

* 서비스: `draft / active / maintenance / retired`
* 콘텐츠/뉴스: `draft / review / published / archived`
* 문의: `new / in_progress / resolved / converted`
* 리드: `new / qualified / proposal / won / lost`
* 프로젝트: `planned / active / blocked / on_hold / completed / cancelled`
* WBS: `todo / in_progress / review / approval_wait / blocked / done / delayed`
* 결재 문서: `draft / submitted / in_approval / approved / rejected / cancelled`
* 결재 액션: `approve / reject / request_changes`
* 평가 주기: `draft / open / scoring / finalized / closed`
* 번역 상태: `draft / in_translation / review / published / hidden`
* 사용자: `active / invited / suspended / retired`

## 3-4. 다국어 원칙

* 지원 언어는 `ko`, `en`, `ja`, `fr`, `es`
* 기본 언어는 `ko`
* 기본 언어 없이 보조 언어 단독 발행 금지
* locale별 slug unique
* 미발행 locale fallback 금지
* 공개 URL 생성 기준은 always `www.jinbizman.com`

## 3-5. 반응형 지원을 위한 데이터 원칙

반응형은 프론트 중심이지만 DB도 아래 원칙을 따라야 합니다.

* summary/detail 분리에 유리한 구조
* 리스트에 필요한 요약 필드와 상세 payload 분리 가능 구조
* 긴 본문은 `body`, `payload_json`에 두고 목록에는 `summary`/요약 필드 제공
* 다국어 긴 문자열도 locale별 row 분리로 관리
* 관리자 표는 list 조회 기준에 맞는 index-friendly 필드를 우선 노출할 수 있어야 함

## 3-6. enum / check / 참조 테이블 전략

초기 1차는 PostgreSQL native enum보다 **text + check constraint**를 우선합니다.

이유는 아래와 같습니다.

* 상태값 수정 비용이 낮습니다.
* 개발 초기 스키마 변경에 유연합니다.
* 앱 타입과 SQL 제약을 함께 맞추기 쉽습니다.

다만 아래는 문서에 고정합니다.

* status 성격 컬럼은 자유 문자열 금지
* `locale`은 허용 locale set check 적용
* `actual_progress`, `planned_progress`, `score`, `expected_hours`는 범위 check 적용

## 3-7. `updated_at` 관리 원칙

1차에서는 앱 레이어에서 `updated_at = now()`를 명시적으로 갱신해도 됩니다.

다만 운영 안정화를 위해 아래 중 하나를 정식 표준으로 채택합니다.

* 앱 레이어 통일
* 공통 trigger 함수 사용

이 문서에서는 **앱 레이어 우선, trigger는 2차 검토**를 권장합니다. 초반 마이그레이션 복잡도를 낮추기 위해서입니다.

---

# 4. 전체 마이그레이션 맵

## 4-1. 파일 목록

```text
db/
├─ migrations/
│  ├─ 001_core_org_auth.sql
│  ├─ 002_service_hub.sql
│  ├─ 003_public_content.sql
│  ├─ 004_projects_wbs.sql
│  ├─ 005_daily_reports_logs.sql
│  ├─ 006_approvals.sql
│  ├─ 007_evaluations.sql
│  ├─ 008_domains_locales.sql
│  ├─ 009_audit_notifications.sql
│  └─ 010_indexes_constraints.sql
└─ seeds/
   ├─ 001_seed_roles_permissions.sql
   ├─ 002_seed_default_service_content_types.sql
   ├─ 003_seed_wbs_templates.sql
   └─ 004_seed_system_settings.sql
```

## 4-2. 선후행 관계 요약

* `001`은 모든 후속 마이그레이션의 기반
* `002`는 `003`, `008`, 일부 `006`의 선행
* `004`는 `005`, `006`, `007`의 선행
* `005`는 `007`의 evidence 선행
* `006`은 `007`의 evidence 선행
* `008`은 공개 사이트/SEO/locale 운영 선행
* `009`는 모든 쓰기 동작의 감사/알림 연결
* `010`은 전 테이블 생성 후 마지막에 적용

## 4-3. 파일 네이밍 규칙

* 숫자 prefix는 실행 순서와 1:1 대응
* 기능별로 한 파일 한 책임 유지
* 구조 변경이 크면 기존 파일 수정보다 새 파일 추가 우선
* 운영 배포 이후에는 기존 번호 파일을 덮어쓰기보다 보정용 다음 번호 파일을 추가

## 4-4. `schema_migrations` 운영 원칙

운영 기준으로는 migration 이력 테이블을 둡니다.

권장 구조 예시:

* `version`
* `name`
* `applied_at`
* `checksum`
* `executed_by`

초기 1차에 이 테이블을 별도 `000_schema_migrations.sql`로 둘 수도 있지만, 현재 문서의 고정 파일 구조를 유지하기 위해 **운영 도구 계층 또는 배포 스크립트에서 관리하는 방식**을 우선 권장합니다.

---

# 5. 001_core_org_auth.sql

## 5-1. 목적

조직, 사용자, 역할, 퍼미션, 매핑 구조 생성

## 5-2. 포함 테이블

* `departments`
* `users`
* `roles`
* `permissions`
* `role_permissions`
* `user_roles`

## 5-3. 왜 먼저 만들어야 하는가

* 서비스 소유자, 프로젝트 오너, 결재 요청자, 평가자 등 모든 actor의 기준이 됩니다.
* scope 검사와 감사로그 actor 연결이 가능해집니다.

## 5-4. 권장 컬럼 예시

### `departments`

* `id`
* `code`
* `name`
* `parent_id`
* `created_at`
* `updated_at`

### `users`

* `id`
* `email`
* `password_hash`
* `name`
* `phone`
* `status`
* `department_id`
* `job_family`
* `job_role`
* `joined_at`
* `left_at`
* `created_at`
* `updated_at`

### `roles`

* `id`
* `code`
* `name`
* `description`

### `permissions`

* `id`
* `code`
* `name`
* `description`
* `scope_type`

### `role_permissions`

* `id`
* `role_id`
* `permission_id`

### `user_roles`

* `id`
* `user_id`
* `role_id`

## 5-5. 핵심 제약

* `users.email UNIQUE`
* `roles.code UNIQUE`
* `permissions.code UNIQUE`
* `role_permissions(role_id, permission_id) UNIQUE`
* `user_roles(user_id, role_id) UNIQUE`

## 5-6. 성공 기준

* 관리자 계정과 역할 구조를 저장할 수 있어야 합니다.
* 이후 `services.owner_department_id`, `projects.owner_user_id`, `audit_logs.actor_user_id` 연결이 가능해야 합니다.

---

# 6. 002_service_hub.sql

## 6-1. 목적

새 홈페이지/앱을 등록하고 운영할 수 있는 서비스 허브 기반 생성

## 6-2. 포함 테이블

* `services`
* `service_content_types`
* `service_content_items`
* `service_change_logs`

## 6-3. 왜 이 단계에서 만드는가

* 공개 콘텐츠, 도메인, 다국어, SEO가 모두 어떤 서비스에 속하는지 먼저 정해져야 합니다.
* 관리자/공개 운영의 확장성 핵심이기 때문입니다.

## 6-4. 권장 컬럼 예시

### `services`

* `id`
* `service_code`
* `service_name`
* `service_type`
* `brand_name`
* `status`
* `domain`
* `env_type`
* `is_visible_in_admin`
* `owner_department_id`
* `operator_user_id`
* `tech_owner_user_id`
* `permission_template_code`
* `content_model_code`
* `deploy_type`
* `notify_type`
* `seo_enabled`
* `i18n_enabled`
* `shared_asset_enabled`
* `created_at`
* `updated_at`

### `service_content_types`

* `id`
* `service_id`
* `type_code`
* `name`
* `schema_json`
* `is_active`

### `service_content_items`

* `id`
* `service_id`
* `content_type_id`
* `title`
* `slug`
* `status`
* `payload_json`
* `published_at`
* `created_by`
* `updated_by`
* `created_at`
* `updated_at`

### `service_change_logs`

* `id`
* `service_id`
* `action_type`
* `target_type`
* `target_id`
* `before_json`
* `after_json`
* `actor_user_id`
* `created_at`

## 6-5. 핵심 제약

* `services.service_code UNIQUE`
* `service_content_types(service_id, type_code) UNIQUE`
* `service_content_items(service_id, content_type_id, slug) UNIQUE` 또는 locale 확장 전 임시 unique
* `status`는 허용 상태값 범위만 사용

## 6-6. 성공 기준

* `jinbiz-main` 같은 대표 서비스 1개를 저장할 수 있어야 합니다.
* 서비스별 콘텐츠 타입과 콘텐츠 아이템을 연결할 수 있어야 합니다.
* 멀티 서비스 확장 구조가 이후 마이그레이션을 뜯지 않고도 유지되어야 합니다.

---

# 7. 003_public_content.sql

## 7-1. 목적

외부 공개 운영에 필요한 뉴스, 문의, 리드, 사업기회 구조 생성

## 7-2. 포함 테이블

* `news_posts`
* `inquiries`
* `leads`
* `opportunities`

## 7-3. 왜 이 단계에서 만드는가

* 외부 홈페이지 1차 오픈과 가장 직접 연결됩니다.
* 문의 → 리드 → 프로젝트 전환 흐름의 시작점입니다.

## 7-4. 권장 컬럼 예시

### `news_posts`

* `id`
* `category`
* `title`
* `slug`
* `summary`
* `body`
* `status`
* `published_at`
* `author_user_id`
* `created_at`
* `updated_at`

### `inquiries`

* `id`
* `inquiry_type`
* `company_name`
* `name`
* `email`
* `phone`
* `message`
* `locale`
* `status`
* `assigned_user_id`
* `lead_status`
* `project_id`
* `created_at`
* `updated_at`

### `leads`

* `id`
* `inquiry_id`
* `owner_user_id`
* `status`
* `source`
* `memo`
* `created_at`
* `updated_at`

### `opportunities`

* `id`
* `lead_id`
* `name`
* `status`
* `expected_value`
* `owner_user_id`
* `project_id`
* `created_at`
* `updated_at`

## 7-5. 핵심 제약

* `news_posts.slug UNIQUE`는 locale 테이블 도입 전 임시, 이후 locale별 unique로 완화 가능
* `inquiries.status` 허용 범위 강제
* `inquiries.locale` 허용 locale set 강제
* `leads.inquiry_id`는 필요 시 UNIQUE로 1:1 보장 가능
* `opportunities.lead_id`는 다건 허용 여부 정책에 따라 unique 여부 결정

## 7-6. 성공 기준

* 외부 문의 저장이 가능해야 합니다.
* 보도자료 / 공시정보 / 공지사항 3개 카테고리를 저장할 수 있어야 합니다.
* 문의 → 리드 → 프로젝트 전환 흐름의 출발점이 열려야 합니다.

---

# 8. 004_projects_wbs.sql

## 8-1. 목적

프로젝트, 멤버, WBS, WBS 템플릿, 의존성, 산출물, 이슈 구조 생성

## 8-2. 포함 테이블

* `projects`
* `project_members`
* `wbs_templates`
* `wbs_template_items`
* `wbs_tasks`
* `wbs_task_dependencies`
* `project_outputs`
* `project_issues`

## 8-3. 왜 이 단계에서 만드는가

* ERP 핵심 엔진입니다.
* 이후 업무보고/업무일지, 결재, 평가 evidence가 모두 여기에 연결됩니다.

## 8-4. 권장 컬럼 예시

### `projects`

* `id`
* `code`
* `name`
* `project_type`
* `service_id`
* `status`
* `owner_user_id`
* `start_date`
* `end_date`
* `description`
* `created_at`
* `updated_at`

### `project_members`

* `id`
* `project_id`
* `user_id`
* `role_in_project`

### `wbs_templates`

* `id`
* `code`
* `name`
* `job_family`
* `work_style`
* `is_active`
* `schema_json`

### `wbs_template_items`

* `id`
* `template_id`
* `title`
* `sort_order`
* `default_weight`
* `default_requires_approval`

### `wbs_tasks`

* `id`
* `project_id`
* `parent_task_id`
* `template_id`
* `title`
* `description`
* `task_type`
* `job_family`
* `work_style`
* `assignee_user_id`
* `reviewer_user_id`
* `approver_user_id`
* `start_date`
* `due_date`
* `planned_progress`
* `actual_progress`
* `priority`
* `status`
* `weight`
* `requires_approval`
* `output_url`
* `qa_status`
* `deploy_status`
* `created_at`
* `updated_at`

### `wbs_task_dependencies`

* `id`
* `task_id`
* `depends_on_task_id`
* `dependency_type`

### `project_outputs`

* `id`
* `project_id`
* `wbs_task_id`
* `title`
* `output_type`
* `file_url`
* `created_by`
* `created_at`

### `project_issues`

* `id`
* `project_id`
* `wbs_task_id`
* `title`
* `description`
* `status`
* `severity`
* `owner_user_id`
* `created_at`
* `updated_at`

## 8-5. 핵심 제약

* `projects.code UNIQUE`
* `project_members(project_id, user_id) UNIQUE`
* `wbs_templates.code UNIQUE`
* `planned_progress`와 `actual_progress`는 0~100 check
* `weight`는 0 초과 check
* `task_id <> depends_on_task_id`
* 필요 시 순환 참조는 앱 레이어에서 차단

## 8-6. 성공 기준

* 프로젝트 생성이 가능해야 합니다.
* 직무·직군·업무유형별 템플릿 기반 WBS 생성이 가능해야 합니다.
* 산출물, 이슈, 지연, 승인 대기 같은 실무 상태가 WBS 기준으로 누적돼야 합니다.

---

# 9. 005_daily_reports_logs.sql

## 9-1. 목적

아침 업무보고와 퇴근 업무일지 구조 생성

## 9-2. 포함 테이블

* `daily_reports`
* `daily_report_items`
* `daily_logs`
* `daily_log_items`

## 9-3. 왜 이 단계에서 만드는가

* WBS가 먼저 있어야 업무보고/일지가 의미를 가집니다.
* 평가 evidence와 프로젝트 진척률 계산의 핵심 입력입니다.

## 9-4. 권장 컬럼 예시

### `daily_reports`

* `id`
* `user_id`
* `report_date`
* `project_id`
* `submitted_at`

### `daily_report_items`

* `id`
* `daily_report_id`
* `wbs_task_id`
* `goal_text`
* `expected_hours`
* `risk_text`
* `support_request_text`

### `daily_logs`

* `id`
* `user_id`
* `log_date`
* `project_id`
* `submitted_at`

### `daily_log_items`

* `id`
* `daily_log_id`
* `wbs_task_id`
* `work_summary`
* `actual_progress`
* `delay_reason_code`
* `next_action`
* `output_url`

## 9-5. 핵심 제약

* `daily_report_items.wbs_task_id` FK 필수
* `daily_log_items.wbs_task_id` FK 필수
* `expected_hours` 0~24 check
* `actual_progress` 0~100 check
* 동일 사용자/날짜/프로젝트 중복 제출 정책은 unique composite 검토 가능
  * 예: `daily_reports(user_id, report_date, project_id) UNIQUE`
  * 예: `daily_logs(user_id, log_date, project_id) UNIQUE`

## 9-6. 성공 기준

* WBS 없는 업무보고/일지 저장이 불가능해야 합니다.
* 제출률, 지연 사유 분포, 계획 대비 실제 진척률 계산에 필요한 입력이 모두 저장 가능해야 합니다.

---

# 10. 006_approvals.sql

## 10-1. 목적

운영 통제 흐름인 전자결재 구조 생성

## 10-2. 포함 테이블

* `approval_documents`
* `approval_lines`
* `approval_actions`

## 10-3. 왜 이 단계에서 만드는가

* 프로젝트/WBS 이후에 와야 WBS 일정 변경 승인, 게시 승인, 예산 승인 등과 자연스럽게 연결됩니다.
* 평가 evidence에도 일부 연결됩니다.

## 10-4. 권장 컬럼 예시

### `approval_documents`

* `id`
* `document_type`
* `title`
* `project_id`
* `service_id`
* `requester_user_id`
* `status`
* `payload_json`
* `created_at`

### `approval_lines`

* `id`
* `approval_document_id`
* `approver_user_id`
* `step_order`
* `status`

### `approval_actions`

* `id`
* `approval_document_id`
* `approver_user_id`
* `action_type`
* `comment`
* `acted_at`

## 10-5. 핵심 제약

* `approval_lines(approval_document_id, approver_user_id, step_order)` unique 조합 검토
* `action_type` 허용 범위 제한
* 문서 상태 전이 제한은 앱 레이어와 함께 적용

## 10-6. 성공 기준

* 배포 승인, 게시 승인, 일정 연장 승인 같은 운영 통제 흐름을 저장할 수 있어야 합니다.
* 평가 evidence가 결재 문서를 source로 참조할 수 있어야 합니다.

---

# 11. 007_evaluations.sql

## 11-1. 목적

평가 주기, 항목, 점수, evidence, 피드백 구조 생성

## 11-2. 포함 테이블

* `evaluation_cycles`
* `evaluation_items`
* `evaluation_scores`
* `evaluation_evidences`
* `evaluation_feedbacks`

## 11-3. 왜 이 단계에서 만드는가

* WBS, 업무일지, 산출물, 결재가 먼저 누적된 뒤 evidence를 연결해야 평가가 점수 중심으로 기울지 않습니다.

## 11-4. 권장 컬럼 예시

### `evaluation_cycles`

* `id`
* `name`
* `start_date`
* `end_date`
* `status`

### `evaluation_items`

* `id`
* `cycle_id`
* `code`
* `name`
* `weight`

### `evaluation_scores`

* `id`
* `cycle_id`
* `evaluatee_user_id`
* `evaluator_user_id`
* `evaluation_item_id`
* `score`
* `comment`

### `evaluation_evidences`

* `id`
* `cycle_id`
* `user_id`
* `source_type`
* `source_id`
* `summary_json`

### `evaluation_feedbacks`

* `id`
* `cycle_id`
* `user_id`
* `feedback_text`
* `created_by`
* `created_at`

## 11-5. 핵심 제약

* `evaluation_items(cycle_id, code) UNIQUE`
* `evaluation_scores(cycle_id, evaluatee_user_id, evaluator_user_id, evaluation_item_id) UNIQUE`
* `score` 범위 check 예: 0~5 또는 0~100
* finalize 전 evidence 존재 여부는 앱 레이어에서 검사

## 11-6. 성공 기준

* 평가 화면보다 먼저 evidence를 저장할 수 있어야 합니다.
* `wbs_task`, `project_output`, `approval_document`, `daily_log_item` 같은 source를 evidence로 참조할 수 있어야 합니다.

---

# 12. 008_domains_locales.sql

## 12-1. 목적

대표 도메인과 5개 언어 공식 지원을 위한 locale/domain 테이블 생성

## 12-2. 포함 테이블

* `service_domains`
* `service_translations`
* `news_post_translations`

## 12-3. 왜 이 단계에서 만드는가

* 서비스 허브와 공개 콘텐츠가 먼저 있어야 어떤 서비스/콘텐츠에 locale과 domain을 붙일지 정해집니다.
* 그러나 공개 SEO와 URL 정책에 필수라서 1차 오픈 전에 반드시 포함되어야 합니다.

## 12-4. 권장 컬럼 예시

### `service_domains`

* `id`
* `service_id`
* `domain`
* `locale`
* `is_canonical`
* `created_at`

### `service_translations`

* `id`
* `service_content_item_id`
* `locale`
* `title`
* `slug`
* `seo_title`
* `seo_description`
* `payload_json`
* `status`
* `created_at`
* `updated_at`

### `news_post_translations`

* `id`
* `news_post_id`
* `locale`
* `title`
* `summary`
* `body`
* `slug`
* `seo_title`
* `seo_description`
* `status`
* `created_at`
* `updated_at`

## 12-5. 핵심 제약

* `service_domains(service_id, locale) UNIQUE`
* `service_translations(service_content_item_id, locale) UNIQUE`
* `news_post_translations(news_post_id, locale) UNIQUE`
* `service_translations(slug, locale) UNIQUE`
* `news_post_translations(slug, locale) UNIQUE`
* canonical은 정책상 `www.jinbizman.com`만 허용
* default locale 없이 보조 locale 발행 금지 규칙은 앱 레이어와 함께 적용

## 12-6. 성공 기준

* `ko / en / ja / fr / es` 5개 locale row를 저장할 수 있어야 합니다.
* 대표 도메인 canonical 정책을 데이터 레벨에서 관리할 수 있어야 합니다.
* locale별 slug와 언어별 발행 상태를 분리해 관리할 수 있어야 합니다.

---

# 13. 009_audit_notifications.sql

## 13-1. 목적

감사, 알림, 첨부, 코멘트 구조 생성

## 13-2. 포함 테이블

* `attachments`
* `comments`
* `notifications`
* `audit_logs`

## 13-3. 왜 이 단계에서 만드는가

* 운영 추적과 변경 이력은 1차부터 필요하지만 핵심 비즈니스 테이블 생성 뒤에 붙여도 FK 연결이 자연스럽습니다.

## 13-4. 권장 컬럼 예시

### `attachments`

* `id`
* `target_type`
* `target_id`
* `file_name`
* `file_url`
* `mime_type`
* `uploaded_by`
* `created_at`

### `comments`

* `id`
* `target_type`
* `target_id`
* `body`
* `created_by`
* `created_at`

### `notifications`

* `id`
* `user_id`
* `type`
* `title`
* `body`
* `link_url`
* `is_read`
* `created_at`

### `audit_logs`

* `id`
* `request_id`
* `actor_user_id`
* `target_type`
* `target_id`
* `action_type`
* `scope`
* `service_id`
* `project_id`
* `before_json`
* `after_json`
* `ip_hash`
* `user_agent`
* `created_at`

## 13-5. 핵심 제약

* `audit_logs`는 update/delete 금지 원칙
* `notifications.is_read` 기본값 false
* `attachments`와 `comments`는 polymorphic target 구조 허용

## 13-6. 성공 기준

* 서비스 생성/수정, 콘텐츠 발행, 번역 발행, 문의 상태 변경, WBS 상태 변경, 결재 승인/반려, 평가 확정 같은 핵심 동작을 감사 대상으로 남길 수 있어야 합니다.

---

# 14. 010_indexes_constraints.sql

## 14-1. 목적

성능과 무결성 강화를 위한 마지막 인덱스/제약 적용

## 14-2. 왜 마지막에 두는가

* 초기 설계 변경 비용을 낮출 수 있습니다.
* 개발 중 스키마 변경이 잦은 구간에서 인덱스 관리 부담을 줄일 수 있습니다.
* 운영 전 최종 무결성 점검을 별도 단계로 분리할 수 있습니다.

## 14-3. 권장 인덱스

### 조직/권한

* `users(email)`
* `user_roles(user_id)`
* `role_permissions(role_id)`

### 서비스 허브

* `services(service_code)`
* `services(status)`
* `service_content_items(service_id, content_type_id, status)`
* `service_change_logs(service_id, created_at desc)`

### 공개 콘텐츠

* `news_posts(category, status, published_at desc)`
* `inquiries(status, created_at desc)`
* `leads(status, owner_user_id)`

### 프로젝트/WBS

* `projects(status, owner_user_id, end_date)`
* `project_members(project_id, user_id)`
* `wbs_tasks(project_id, status, due_date)`
* `wbs_tasks(assignee_user_id, status, due_date)`
* `wbs_task_dependencies(task_id, depends_on_task_id)`

### 업무보고/일지

* `daily_reports(user_id, report_date desc)`
* `daily_logs(user_id, log_date desc)`
* `daily_report_items(wbs_task_id)`
* `daily_log_items(wbs_task_id)`

### 결재/평가

* `approval_documents(status, created_at desc)`
* `approval_actions(approval_document_id, acted_at desc)`
* `evaluation_cycles(status, start_date desc)`
* `evaluation_evidences(cycle_id, user_id, source_type)`

### 다국어/도메인

* `service_domains(service_id, locale)`
* `service_translations(locale, slug)`
* `news_post_translations(locale, slug)`
* `service_domains(domain, locale)`
* partial unique index on canonical rows

### 감사/알림

* `notifications(user_id, is_read, created_at desc)`
* `audit_logs(actor_user_id, created_at desc)`
* `audit_logs(target_type, target_id, created_at desc)`
* `audit_logs(request_id)`

## 14-4. 권장 check / constraint

* progress 범위 check
* score 범위 check
* locale 허용 범위 check
* 상태값 enum-like check 또는 참조 테이블 사용 검토
* 날짜 역전 금지 check 일부 적용 가능
* `is_canonical = true` 행에 대한 partial unique index 검토

## 14-5. 성공 기준

* 핵심 목록 API의 필터 / 정렬 / 조회 속도가 초기 운영 수준에서 충분해야 합니다.
* locale unique, slug unique, canonical unique 보조 인덱스가 모두 반영되어야 합니다.

---

# 15. Seeds 계획

## 15-1. 001_seed_roles_permissions.sql

### 목적

기본 역할과 퍼미션 세트 초기화

### 포함 예시

역할:

* `super_admin`
* `executive_admin`
* `service_admin`
* `site_editor`
* `bizdev_manager`
* `project_pm`
* `team_lead`
* `member`
* `finance_manager`
* `hr_evaluator`
* `viewer`
* `translation_editor`
* `translation_reviewer`

퍼미션:

* `service.read`
* `service.create`
* `service.update`
* `content.read`
* `content.create`
* `content.update`
* `content.publish`
* `translation.read`
* `translation.create`
* `translation.update`
* `translation.publish`
* `inquiry.read`
* `inquiry.update`
* `lead.create`
* `project.read`
* `project.create`
* `project.update`
* `wbs.read`
* `wbs.create`
* `wbs.update`
* `wbs.approve`
* `daily_report.create`
* `daily_log.create`
* `approval.read`
* `approval.create`
* `approval.act`
* `evaluation.read`
* `evaluation.score`
* `evaluation.finalize`
* `audit.read`
* `system.read`
* `system.update`

## 15-2. 002_seed_default_service_content_types.sql

### 목적

서비스 허브 기본 콘텐츠 타입 초기화

### 포함 예시

* `hero_section`
* `feature_cards`
* `business_items`
* `platform_cases`
* `faq_items`
* `service_announcements`
* `download_buttons`

## 15-3. 003_seed_wbs_templates.sql

### 목적

직무·직군·업무유형별 기본 WBS 템플릿 초기화

### 포함 예시

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

## 15-4. 004_seed_system_settings.sql

### 목적

기본 시스템 설정 초기화

### 포함 예시

* 기본 locale: `ko`
* supported locales: `ko,en,ja,fr,es`
* canonical host: `www.jinbizman.com`
* APP_BASE_URL: `https://www.jinbizman.com`
* feature flags 기본값

## 15-5. seed 작성 원칙

* seed는 운영 데이터가 아니라 **기본 코드값 / 템플릿 / 설정값**만 다룹니다.
* 비밀번호 hash, 실제 운영 이메일, 실제 관리자 개인정보는 seed에 넣지 않습니다.
* seed는 재실행 시 중복 insert보다 upsert 또는 conflict-safe 전략을 우선합니다.

---

# 16. 마이그레이션 파일별 상세 실행 메모

## 16-1. 001 실행 시 주의

* 첫 관리자 계정 삽입 전략을 seed에 둘지 별도 운영 절차로 둘지 명확히 결정
* password_hash는 seed에 하드코딩하지 말고 운영 초기화 스크립트로 분리 권장

## 16-2. 002 실행 시 주의

* 기본 서비스로 `jinbiz-main` 하나를 seed할지 여부 결정
* `i18n_enabled`와 `seo_enabled` 기본값은 true 권장

## 16-3. 003 실행 시 주의

* 뉴스/문의만으로도 외부 1차 오픈 검증 가능
* `inquiries.locale`은 반드시 공식 locale set으로 제한

## 16-4. 004 실행 시 주의

* `wbs_tasks.parent_task_id` self reference 생성 가능
* 의존성 순환은 SQL보다 앱 레이어에서 검증하는 편이 현실적

## 16-5. 005 실행 시 주의

* 업무보고/일지 중복 제출 정책은 early fix 필요
* 업무일지에서 지연 사유 코드는 별도 코드 테이블 검토 가능

## 16-6. 006 실행 시 주의

* `approval_documents.payload_json`은 문서 종류별 schema validation 전제
* 초기에는 payload 자유도를 두되 타입별 validator를 앱에서 먼저 적용

## 16-7. 007 실행 시 주의

* evaluation evidence는 polymorphic source 구조 유지
* source_type 예시: `wbs_task`, `project_output`, `approval_document`, `daily_log_item`

## 16-8. 008 실행 시 주의

* locale별 slug unique는 반드시 반영
* canonical host가 `www.jinbizman.com` 외 값으로 들어가지 않도록 seed/validator 동시 적용

## 16-9. 009 실행 시 주의

* `audit_logs`는 update/delete 금지 원칙
* 변경 전/후 JSON은 너무 큰 payload가 되지 않도록 요약 필드 정책 검토

## 16-10. 010 실행 시 주의

* 운영 직전 explain/analyze 기준으로 과도한 인덱스 여부 재검토
* 개발 단계에서는 모든 인덱스를 한 번에 걸지 말고 핵심 조회 위주부터 적용 가능

---

# 17. 롤백 / 재실행 / 운영 배포 원칙

## 17-1. 롤백 원칙

* 운영 DB에서 destructive rollback은 최대한 피함
* 잘못된 마이그레이션은 역방향 삭제보다 **보정 migration**으로 수정
* `DROP TABLE` 기반 롤백은 로컬/스테이징에서만 제한 사용

## 17-2. 재실행 원칙

* `create table if not exists` 사용은 초기 로컬 개발에는 편하지만, 운영에서는 schema drift를 감출 수 있으므로 신중히 사용
* 운영 기준으로는 마이그레이션 이력 테이블 도입 권장
  * 예: `schema_migrations(version, applied_at)`

## 17-3. 배포 순서 원칙

1. 로컬 적용
2. seed 최소 적용
3. worker route smoke test
4. 스테이징 적용
5. 주요 API health/integrity check
6. 운영 적용
7. 배포 직후 `/api/health`, `/api/locales`, `/api/news`, 관리자 주요 목록 확인

## 17-4. 백필 원칙

새 컬럼 추가 시 권장 순서:

1. nullable로 추가
2. 백필 수행
3. 앱 배포
4. NOT NULL / unique / check 강화

## 17-5. destructive 변경 금지 원칙

아래는 운영에서 직접 실행하지 않습니다.

* 데이터 삭제를 전제로 한 컬럼 제거
* 대규모 테이블 rename 후 앱 동시 미배포
* seed를 운영 데이터 overwrite 용도로 사용
* 운영 중 slug / locale unique 정책을 무계획 변경

---

# 18. 테스트 기준

## 18-1. 1차 필수 검증

* 조직/권한 테이블 생성 정상
* 서비스 허브 기본 CRUD 가능한 스키마 여부
* 뉴스/문의 저장 가능
* 프로젝트/WBS 생성 가능
* WBS 없는 업무보고/일지 저장 차단 가능
* 결재 문서 생성 및 액션 가능
* evaluation_evidences 저장 가능
* locale별 slug unique 동작
* canonical host 기준 데이터 저장 가능
* audit_logs 기록 가능

## 18-2. SQL 수준 검증 예시

* FK 무결성 확인
* unique 충돌 테스트
* check constraint 테스트
* not null 위반 테스트
* sample insert / select smoke test

## 18-3. 성능 기본 검증

* `GET /api/news`
* `GET /api/admin/services`
* `GET /api/erp/wbs?projectId=...`
* `GET /api/admin/inquiries`
* `GET /api/erp/evaluations/evidences?cycleId=...`

위 5개는 1차 핵심 조회라 explain/analyze 체크 대상입니다.

## 18-4. smoke test SQL 권장 항목

* 역할 / 퍼미션 샘플 insert
* 서비스 / 콘텐츠 타입 / 콘텐츠 아이템 샘플 insert
* 프로젝트 / WBS / 업무보고 / 업무일지 샘플 insert
* locale별 translation insert
* canonical domain insert
* evidence insert

---

# 19. 구현 우선순위

## 19-1. 추천 작성 순서

1. `001_core_org_auth.sql`
2. `002_service_hub.sql`
3. `003_public_content.sql`
4. `008_domains_locales.sql` 초안 병행
5. `004_projects_wbs.sql`
6. `005_daily_reports_logs.sql`
7. `006_approvals.sql`
8. `007_evaluations.sql`
9. `009_audit_notifications.sql`
10. `010_indexes_constraints.sql`
11. seeds 작성
12. smoke test SQL 작성

## 19-2. 5단계 배포 완료 기준과의 연결

### 1단계

* 조직/권한 + 서비스 허브 + 외부 공개 콘텐츠 기본 생성

### 2단계

* 도메인/locale/번역 구조 포함한 외부 사이트 운영 가능 상태

### 3단계

* 프로젝트/WBS/업무보고/업무일지 흐름 저장 가능 상태

### 4단계

* 결재/evidence/감사로그 포함한 관리자 운영 흐름 완성

### 5단계

* 인덱스/제약/운영 검증/배포 안정화까지 완료된 상태

## 19-3. 실제 구현 순서와의 연결 메모

종합 가이드의 개발 단계에서도 **WBS 연결 업무보고/업무일지**, **뉴스/공지 운영**, **전자결재**, **평가 근거 데이터**, **1차 배포** 순서를 제시하고 있으므로, DB 마이그레이션도 같은 흐름을 방해하지 않아야 합니다.

---

# 20. 문서 교체용 최종 체크리스트

## 20-1. 이 문서가 기존 `migration-plan.md`를 즉시 대체할 수 있어야 하는 이유

* 마이그레이션 파일 분할 기준을 단계별로 명확히 정의했습니다.
* 서비스 허브, 공개 콘텐츠, 프로젝트/WBS, 업무보고/일지, 결재, 평가, 다국어, 도메인, 감사 구조를 모두 포함했습니다.
* 상태값 표준, locale 정책, canonical 정책을 포함했습니다.
* 인덱스/제약을 마지막 파일로 분리하는 전략을 포함했습니다.
* seeds 계획과 운영 배포 원칙을 포함했습니다.
* WBS 없는 보고 금지, evidence 우선 평가 구조, `www.jinbizman.com` canonical 강제 같은 핵심 규칙을 반영했습니다.
* 기존 문서들에서 반복되는 핵심 원칙을 누락 없이 마이그레이션 관점으로 재정리했습니다.

## 20-2. 최종 검수 체크리스트

### 조직/권한
* 사용자/역할/퍼미션/매핑 구조 존재
* email/code unique 존재

### 서비스 허브
* 서비스/콘텐츠 타입/콘텐츠 아이템/변경 로그 구조 존재
* `i18n_enabled`, `seo_enabled` 존재

### 공개 콘텐츠
* 뉴스/문의/리드/사업기회 구조 존재
* 뉴스레터 3카테고리 운영 가능

### 프로젝트/WBS
* 프로젝트/멤버/WBS/의존성/산출물/이슈 구조 존재
* progress/weight 제약 존재

### 업무보고/업무일지
* WBS FK 필수
* progress/hours 범위 제약 존재

### 결재/평가
* 결재 문서/라인/액션 구조 존재
* 평가 cycle/item/score/evidence 구조 존재

### 다국어/도메인
* locale별 slug unique
* canonical host 정책 반영
* 5개 언어 공식 지원 가능

### 감사/운영
* audit_logs 존재
* notifications 존재
* 인덱스와 운영 제약 계획 존재

---

## 변경 요약

* `docs/db/migration-plan.md`를 **실행 가능한 DB 마이그레이션 계획서**로 재정의했습니다.
* 마이그레이션을 10개 파일로 분할하는 기준을 명확히 정리했습니다.
* 서비스 허브 → 공개 콘텐츠 → 프로젝트/WBS → 업무보고/일지 → 결재 → 평가 → 도메인/다국어 → 감사/알림 → 인덱스 순서를 고정했습니다.
* `www.jinbizman.com` canonical 정책과 5개 언어 공식 지원을 DB 관점으로 반영했습니다.
* WBS 없는 업무보고/일지 금지, evidence 우선 평가 구조를 반영했습니다.
* seeds 계획, 롤백/재실행/운영 배포 원칙, 테스트 기준까지 포함했습니다.

---

## 다음 단계

가장 자연스러운 다음 작업은 **이 문서를 기준으로 `db/migrations/*.sql` 실제 파일 전체본과 `db/seeds/*.sql` 초기값 세트를 바로 생성하는 것**입니다.
