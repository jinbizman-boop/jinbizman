# JINBIZ 관리자 API 명세서 최신형 완성형 최종본

## 이번 단계 목표

* 첨부 기준 문서들과 지금까지 확정된 채팅 방향을 모두 반영해 **`docs/api/admin-api.md` 최신형 완성형 최종본**을 다시 정리합니다.
* 이번 문서는 `JINBIZ`의 외부 홈페이지와 내부 ERP를 함께 받치는 관리자 계층 중, **`/api/admin/*` 범위만 집중적으로 다루는 관리자 API 실행 기준서**입니다.
* 기존 확정안에 아래 3가지를 정식 요구사항으로 추가 확정합니다.

  * **PC, 모바일, 태블릿 등 모든 기기와 모든 환경에서 깨지거나 이탈되지 않는 반응형 웹앱을 가능하게 하는 summary/detail 응답 구조**
  * **한국어, 영어, 일본어, 불어, 스페인어 공식 지원**
  * **대표 도메인 `www.jinbizman.com` 사용**

* 이번 최종본은 보기 좋은 개요 문서가 아니라 **바로 구현 착수 가능한 관리자 API 기준서**로 작성합니다.
* `HomePage-Main-Guide`, `MangePage-Main-Guide`, `Develop-Total-Guide`, `Frontend-Develop-Guide`, `Backend-Develop-Guide`, `Development-Execution`에 공통으로 반영된 **서비스 허브, WBS 중심 운영, 다국어, 도메인, 권한, 감사로그, 평가 근거 데이터 방향**을 관리 API 범위에 맞게 재조립합니다.
* 기존 초안의 구조적 연속성은 유지하되, 실제 구현 시 바로 사용할 수 있도록 **라우트 표준, 검증 규칙, 예시 payload, 응답 타입, 권한 정책, 상태 전이, 감사로그 기준, 구현 우선순위**를 추가 보강합니다.

---

## 변경 파일

이번 단계는 문서화 단계라 실제 코드 수정 파일은 없습니다.

다만 이 문서를 기준으로 바로 연결될 핵심 백엔드 파일은 아래가 맞습니다.

* `worker/routes/admin/services.ts`
* `worker/routes/admin/site-content.ts`
* `worker/routes/admin/site-seo.ts`
* `worker/routes/admin/translations.ts`
* `worker/routes/admin/news.ts`
* `worker/routes/admin/inquiries.ts`
* `worker/routes/admin/dashboard.ts`
* `worker/routes/admin/lookups.ts`
* `worker/lib/auth.ts`
* `worker/lib/permissions.ts`
* `worker/lib/locale.ts`
* `worker/lib/domain.ts`
* `worker/lib/seo.ts`
* `worker/lib/response.ts`
* `worker/lib/errors.ts`
* `worker/lib/logger.ts`
* `worker/lib/validators.ts`
* `worker/middleware/auth.ts`
* `worker/middleware/require-permission.ts`
* `worker/middleware/scope-check.ts`
* `worker/middleware/audit.ts`
* `worker/middleware/request-id.ts`
* `db/migrations/*`

관련 프론트 연결 파일은 아래가 맞습니다.

* `src/lib/api.ts`
* `src/lib/types.ts`
* `src/lib/permissions.ts`
* `src/lib/navigation.ts`
* `src/pages/admin/services/*`
* `src/pages/admin/site/*`
* `src/pages/admin/news/*`
* `src/pages/admin/inquiries/*`
* `src/pages/admin/DashboardPage.tsx`
* `src/components/admin/DataTable.tsx`
* `src/components/admin/PermissionGate.tsx`
* `src/components/admin/FilterBar.tsx`
* `src/components/admin/MetricCard.tsx`

---

## 실행 명령어

```bash
npm install
npm run dev
npx wrangler dev
```

관리자 API 문서 적용 후 실제 개발 착수 시 권장 명령어는 아래 흐름을 유지합니다.

```bash
npm create cloudflare@latest -- jinbiz --framework=react
npm install
npm install hono @hono/zod-validator @hono/zod-openapi zod
npm install @neondatabase/serverless
npm install jose
npm install -D vitest @cloudflare/vitest-pool-workers
npm run dev
npm run build
npx wrangler dev
npx wrangler deploy
```

---

## 확인 방법

아래가 맞으면 이번 관리자 API 문서는 정상으로 봐도 됩니다.

* 관리자 API 범위가 **서비스 허브 / 사이트 콘텐츠 / SEO / 번역 / 뉴스 / 문의·리드 / 운영용 보조 조회**로 명확히 분리되어 있는지
* 공개 API와 관리자 API가 섞이지 않고 `/api/admin/*` 기준으로 정리되어 있는지
* 모든 관리자 쓰기 요청에 **인증 + 퍼미션 + 스코프 + 감사로그** 원칙이 반영되어 있는지
* 다국어 발행이 **기본 언어 선행 / 보조 언어 별도 상태 / 미발행 언어 숨김** 기준으로 동작하는지
* canonical/SEO URL 기준이 항상 **`https://www.jinbizman.com`** 인지
* 목록 API와 상세 API가 분리되어 **반응형 UI에서 카드/테이블/상세 드로어로 안전하게 쓸 수 있는지**
* 문의가 단순 조회가 아니라 **상태 변경 / 담당자 배정 / 메모 / 리드 전환 / 프로젝트 연결**로 이어지는지
* 서비스 등록 후 **도메인 / 환경 / 권한 템플릿 / 지원 언어**를 함께 관리할 수 있는지
* 번역 발행 권한이 일반 편집 권한과 분리되어 있는지
* 문서 마지막 체크리스트로 기존 문서를 즉시 대체할 수 있는지 확인 가능한지

---

## 문제 발생 시

* 관리자 API를 서비스 허브 없이 페이지별 임시 CRUD로 만들면 서비스가 늘어날수록 구조가 무너집니다.
* `fetch` 분기 방식으로 라우트를 계속 늘리면 유지보수가 급격히 어려워집니다.
* 다국어를 별도 번역 리소스가 아니라 단순 문자열 덧붙이기로 처리하면 언어별 발행, slug, SEO 관리가 불가능해집니다.
* `www.jinbizman.com` 기준 canonical을 강제하지 않으면 공개 URL과 검색엔진 메타가 꼬입니다.
* 목록 응답에 상세 payload를 모두 실으면 모바일 카드형 뷰와 데스크톱 테이블 모두 비효율적이 됩니다.
* 감사로그를 나중에 붙이면 관리자 ERP의 변경 이력과 승인 근거가 무너집니다.
* 번역 발행 권한과 일반 편집 권한을 분리하지 않으면 검수 흐름이 깨집니다.
* 문의를 저장만 하고 리드/프로젝트 연결 규칙을 빼면 CRM 확장성이 사라집니다.
* 관리자 대시보드에 필요한 집계 응답을 ad-hoc하게 만들면 카드형/차트형 UI가 계속 깨집니다.

---

# 1. 최종 정의

이 문서에서 말하는 관리자 API의 정답은 단순한 “관리자 CRUD 모음”이 아닙니다.

정답은 아래입니다.

> **JINBIZ 관리자 API는 서비스 허브, 사이트 콘텐츠, SEO, 번역, 뉴스/공지, 문의/리드 운영을 하나의 권한 체계와 감사 체계 안에서 묶어 관리하는 통합 운영 API 계층이다.**

이 API는 아래 전제를 반드시 지켜야 합니다.

* 외부 홈페이지와 내부 ERP는 **같은 브랜드 / 같은 도메인 정책 / 같은 다국어 정책 / 같은 디자인 토큰**을 공유한다.
* 관리자 API는 공개 API와 별도로 **인증된 운영 행위**만 다룬다.
* 관리자 API는 CRUD보다 **운영 규칙 강제**가 우선이다.
* 관리자 API는 추후 ERP API와 자연스럽게 이어질 수 있도록 **서비스 → 프로젝트 → WBS → 평가 근거 데이터** 흐름을 끊지 않는다.
* 대표 공개 도메인은 항상 **`www.jinbizman.com`** 이다.
* 공식 지원 언어는 항상 **`ko`, `en`, `ja`, `fr`, `es`** 이다.
* 프론트는 summary/detail 분리 응답을 사용하므로, 관리자 API는 **목록 요약 응답과 상세 응답을 명확히 분리**해야 한다.
* 관리자 UI는 CMS처럼 보이면 안 되고 운영 OS처럼 보여야 하므로, API 역시 **서비스 단위 운영 / 승인 / 감사 / 상태 전이**를 중심으로 설계한다.

---

# 2. 문서 범위

이 문서는 아래 경로만 다룹니다.

## 2-1. 핵심 관리자 라우트

* `/api/admin/services`
* `/api/admin/services/:id`
* `/api/admin/services/:id/change-logs`
* `/api/admin/site-content`
* `/api/admin/site-content/:id`
* `/api/admin/site-content/:id/publish`
* `/api/admin/site-seo/:serviceId`
* `/api/admin/contents/:id/translations`
* `/api/admin/contents/:id/translations/:locale`
* `/api/admin/contents/:id/translations/:locale/publish`
* `/api/admin/news`
* `/api/admin/news/:id`
* `/api/admin/news/:id/publish`
* `/api/admin/inquiries`
* `/api/admin/inquiries/:id`
* `/api/admin/inquiries/:id/status`
* `/api/admin/inquiries/:id/assign`
* `/api/admin/inquiries/:id/notes`
* `/api/admin/inquiries/:id/convert`

## 2-2. 구현 편의를 위한 보조 관리자 라우트

아래는 UI 구현 효율을 위해 strongly recommended 이지만, 구조적 연속성을 깨지 않는 범위에서 선택 적용합니다.

* `/api/admin/dashboard/overview`
* `/api/admin/lookups/users`
* `/api/admin/lookups/departments`
* `/api/admin/lookups/projects`
* `/api/admin/lookups/content-types`
* `/api/admin/lookups/locales`

## 2-3. 이 문서에서 직접 다루지 않는 라우트

* Public API: `/api/health`, `/api/news`, `/api/inquiries`, `/api/site/pages/*`, `/api/locales`
* ERP API: `/api/erp/projects`, `/api/erp/wbs`, `/api/erp/daily-reports`, `/api/erp/daily-logs`, `/api/erp/evaluations`
* System API: `/api/system/audit-logs`, `/api/system/settings`, `/api/docs`

단, 관리자 API는 ERP API와 연결되는 규칙을 고려해야 하므로, 문의 → 리드 → 프로젝트 연결과 서비스 허브 → 프로젝트/WBS 연결을 전제로 설계합니다.

---

# 3. 관리자 API 설계 원칙

## 3-1. 운영 단위 우선 원칙

페이지별 CRUD가 아니라 아래 운영 단위로 API를 나눕니다.

* 서비스 허브
* 사이트 콘텐츠
* 사이트 SEO
* 번역/언어 운영
* 뉴스/공지 운영
* 문의/리드 운영
* 관리자 운영 보조 조회

## 3-2. summary / detail 분리 원칙

모든 관리자 목록 API는 카드/테이블에 필요한 최소 필드만 제공합니다.

예시:

* 목록 API: 상태, 제목, 코드, 업데이트일, 담당자, 배지 렌더링용 필드
* 상세 API: 본문, 이력, 메타데이터, 첨부, 권한, 승인 정보, 관련 링크

이렇게 해야 외부/내부 반응형 UI에서 모바일 카드 뷰와 데스크톱 상세 뷰를 모두 안정적으로 구성할 수 있습니다.

## 3-3. 감사로그 우선 원칙

모든 관리자 쓰기 요청은 아래를 남겨야 합니다.

* `request_id`
* `actor_user_id`
* `target_type`
* `target_id`
* `action_type`
* `before_json`
* `after_json`
* `created_at`

## 3-4. 다국어 검수형 원칙

* 기본 언어 없이 보조 언어 단독 발행 금지
* 보조 언어는 기본적으로 `draft`
* 검수 완료 후 `published`
* 미발행 언어는 fallback 노출 금지
* locale별 `slug`, `seo_title`, `seo_description`, `title`, `body`, `status` 분리

## 3-5. 도메인 고정 원칙

* canonical host는 항상 `www.jinbizman.com`
* `jinbizman.com` 직접 노출 금지
* 관리자 API가 생성하는 모든 공개 URL, preview URL, alternate link는 `https://www.jinbizman.com` 기준

## 3-6. 권한 분리 원칙

* 조회 권한과 수정 권한 분리
* 일반 편집과 발행 승인 분리
* 번역 편집과 번역 발행 분리
* 서비스 범위와 전체 범위 분리
* system 설정 권한은 최소 관리자만 보유

## 3-7. 상태 전이 원칙

상태값은 enum 문자열이 아니라 **실제 운영 규칙**입니다.

예시:

* `draft -> review -> published -> archived`
* `new -> in_progress -> resolved -> converted`
* 불가능한 전이는 `PRECONDITION_FAILED`

## 3-8. 관계 보존 원칙

관리자 API는 다음 관계를 절대 끊지 않습니다.

* 서비스 ↔ 도메인
* 서비스 ↔ 콘텐츠 타입
* 콘텐츠 ↔ 번역
* 뉴스 ↔ 뉴스 번역
* 문의 ↔ 리드/사업기회 ↔ 프로젝트
* 서비스 ↔ 프로젝트/WBS 후보 연결

---

# 4. 공통 규칙

## 4-1. 공통 응답 형식

성공:

```json
{
  "success": true,
  "data": {}
}
```

실패:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자에게 보여줄 문장"
  }
}
```

## 4-2. 공통 오류 코드

* `VALIDATION_ERROR`
* `UNAUTHORIZED`
* `FORBIDDEN`
* `NOT_FOUND`
* `CONFLICT`
* `PRECONDITION_FAILED`
* `RATE_LIMITED`
* `INTERNAL_ERROR`

## 4-3. 공통 상태값 표준

* 서비스: `draft | active | maintenance | retired`
* 콘텐츠/뉴스: `draft | review | published | archived`
* 문의: `new | in_progress | resolved | converted`
* 리드: `new | qualified | proposal | won | lost`
* 번역 상태: `draft | in_translation | review | published | hidden`

## 4-4. 공통 헤더와 메타

권장 요청 헤더:

* `Content-Type: application/json`
* `X-Request-Id: <uuid>`
* `X-Locale: ko|en|ja|fr|es`

공통 응답 메타 예시:

```json
{
  "success": true,
  "data": { "...": "..." },
  "meta": {
    "requestId": "req_01HQ...",
    "timestamp": "2026-03-29T12:00:00.000Z"
  }
}
```

## 4-5. 인증 원칙

* 세션은 HttpOnly cookie 저장 기본
* JWT payload는 `userId`, `roles`, `departmentId` 정도만 저장
* 관리자 API는 로그인 + 퍼미션 + 스코프 + 감사로그가 기본
* 민감정보는 Secrets 사용
* 일반 설정은 vars 사용

## 4-6. 페이징 규칙

기본 파라미터:

* `page`
* `pageSize`
* `q`
* `sortBy`
* `sortOrder`

기본 응답:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

## 4-7. 정렬 기본값

* 서비스 목록: `updatedAt desc`
* 콘텐츠 목록: `updatedAt desc`
* 뉴스 목록: `publishedAt desc`, draft는 `updatedAt desc`
* 문의 목록: `createdAt desc`

---

# 5. 역할, 스코프, 퍼미션

## 5-1. 기본 역할

* `super_admin`
* `executive_admin`
* `service_admin`
* `site_editor`
* `news_operator`
* `bizdev_manager`
* `translation_editor`
* `translation_reviewer`
* `viewer`

실제 구현에서는 프로젝트/ERP 전용 역할과 관리자 API 역할이 혼재될 수 있으므로, 권한은 역할명이 아니라 퍼미션 코드 중심으로 검사합니다.

## 5-2. 스코프

* `global`
* `service`
* `project`
* `team`
* `self`

관리자 API에서는 주로 `global`과 `service`를 사용합니다.

## 5-3. 퍼미션 코드 표준

* `service.read`
* `service.create`
* `service.update`
* `service.assign`
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
* `opportunity.manage`
* `dashboard.read`
* `lookup.read`
* `audit.read`
* `system.read`
* `system.update`

## 5-4. 권한 원칙

* 서비스 데이터는 `service` scope 기준
* 감사로그는 수정/삭제 불가
* 언어별 공개 승인은 일반 편집 권한과 분리
* 공통 도메인/SEO 설정은 소수 관리자만 수정 가능

---

# 6. 공통 타입 설계 기준

## 6-1. ServiceSummary

```ts
export interface ServiceSummary {
  id: number;
  serviceCode: string;
  serviceName: string;
  serviceType: string;
  status: "draft" | "active" | "maintenance" | "retired";
  domain: string;
  envType: string;
  supportedLocales: string[];
  updatedAt: string;
}
```

## 6-2. ServiceDetail

```ts
export interface ServiceDetail {
  id: number;
  serviceCode: string;
  serviceName: string;
  brandName: string;
  serviceType: string;
  status: "draft" | "active" | "maintenance" | "retired";
  domain: string;
  envType: "local" | "staging" | "production";
  isVisibleInAdmin: boolean;
  ownerDepartmentId: number | null;
  operatorUserId: number | null;
  techOwnerUserId: number | null;
  permissionTemplateCode: string;
  contentModelCode: string;
  deployType: string;
  notifyType: string;
  seoEnabled: boolean;
  i18nEnabled: boolean;
  supportedLocales: ("ko" | "en" | "ja" | "fr" | "es")[];
  defaultLocale: "ko" | "en" | "ja" | "fr" | "es";
  sharedAssetEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## 6-3. SiteContentSummary

```ts
export interface SiteContentSummary {
  id: number;
  serviceId: number;
  contentTypeCode: string;
  title: string;
  slug: string;
  status: "draft" | "review" | "published" | "archived";
  publishedAt: string | null;
  updatedAt: string;
  availableLocales: string[];
}
```

## 6-4. SiteContentDetail

```ts
export interface SiteContentDetail {
  id: number;
  serviceId: number;
  contentTypeCode: string;
  title: string;
  slug: string;
  status: "draft" | "review" | "published" | "archived";
  payloadJson: Record<string, unknown>;
  publishedAt: string | null;
  updatedAt: string;
  localeStatuses: Array<{
    locale: "ko" | "en" | "ja" | "fr" | "es";
    status: "draft" | "in_translation" | "review" | "published" | "hidden";
  }>;
  seo: {
    canonicalUrl: string;
    ogImageUrl: string | null;
  };
}
```

## 6-5. TranslationDetail

```ts
export interface TranslationDetail {
  id: number;
  serviceContentItemId: number;
  locale: "ko" | "en" | "ja" | "fr" | "es";
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  status: "draft" | "in_translation" | "review" | "published" | "hidden";
  payloadJson: Record<string, unknown>;
  updatedAt: string;
}
```

## 6-6. InquirySummary

```ts
export interface InquirySummary {
  id: number;
  inquiryType: string;
  companyName: string;
  name: string;
  email: string;
  locale: "ko" | "en" | "ja" | "fr" | "es";
  status: "new" | "in_progress" | "resolved" | "converted";
  assignedUserId: number | null;
  createdAt: string;
}
```

## 6-7. InquiryDetail

```ts
export interface InquiryDetail {
  id: number;
  inquiryType: string;
  companyName: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  locale: "ko" | "en" | "ja" | "fr" | "es";
  status: "new" | "in_progress" | "resolved" | "converted";
  assignedUserId: number | null;
  leadStatus: string | null;
  projectId: number | null;
  notes: Array<{
    id: number;
    body: string;
    createdBy: number;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

---

# 7. 관리자 API 라우트 맵

## 7-1. Admin API 그룹

* `/api/admin/dashboard/*`
* `/api/admin/services/*`
* `/api/admin/site-content/*`
* `/api/admin/site-seo/*`
* `/api/admin/translations/*`
* `/api/admin/news/*`
* `/api/admin/inquiries/*`
* `/api/admin/lookups/*`

## 7-2. 실제 연결 파일 기준

* `worker/routes/admin/dashboard.ts`
* `worker/routes/admin/services.ts`
* `worker/routes/admin/site-content.ts`
* `worker/routes/admin/site-seo.ts`
* `worker/routes/admin/translations.ts`
* `worker/routes/admin/news.ts`
* `worker/routes/admin/inquiries.ts`
* `worker/routes/admin/lookups.ts`

---

# 8. 서비스 허브 API

서비스 허브는 JINBIZ 확장성의 핵심입니다. 새 홈페이지/앱이 생길 때 `서비스 등록 → 운영 유형 선택 → 콘텐츠 모델 연결 → 권한 템플릿 연결 → 환경 연결 → 언어 연결`만으로 관리자 체계 안에 붙어야 합니다.

## 8-1. GET `/api/admin/services`

### 목적

서비스 목록 조회

### 권한

* `service.read`

### 쿼리

* `status`
* `serviceType`
* `envType`
* `q`
* `page`
* `pageSize`

### 응답 예시

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "serviceCode": "jinbiz-main",
        "serviceName": "JINBIZ Main Site",
        "serviceType": "corporate_site",
        "status": "active",
        "domain": "www.jinbizman.com",
        "envType": "production",
        "supportedLocales": ["ko", "en", "ja", "fr", "es"],
        "updatedAt": "2026-03-29T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 구현 규칙

* 목록 응답은 summary만 제공
* mobile card / desktop table 모두 같은 응답으로 렌더링 가능해야 함

## 8-2. POST `/api/admin/services`

### 목적

새 홈페이지/앱을 ERP 관리 대상으로 등록

### 권한

* `service.create`

### 입력

```json
{
  "serviceCode": "eureka-world",
  "serviceName": "Eureka World",
  "brandName": "Eureka World",
  "serviceType": "web_app",
  "domain": "www.jinbizman.com",
  "envType": "production",
  "permissionTemplateCode": "service_default",
  "contentModelCode": "corporate_default",
  "supportedLocales": ["ko", "en", "ja", "fr", "es"],
  "defaultLocale": "ko",
  "i18nEnabled": true,
  "seoEnabled": true,
  "sharedAssetEnabled": true
}
```

### 검증 규칙

* `serviceCode` unique
* `defaultLocale`는 `supportedLocales` 안에 포함되어야 함
* `supportedLocales`는 공식 지원 언어 집합 안에서만 선택 가능
* `domain`은 canonical 정책과 충돌하면 안 됨

### 처리 규칙

* 기본 `service_content_types` 생성
* 기본 권한 정책 연결
* 기본 도메인 연결
* 기본 언어 정책 생성
* 변경 로그 저장

### 성공 응답

```json
{
  "success": true,
  "data": {
    "serviceId": 12,
    "serviceCode": "eureka-world",
    "message": "서비스가 정상적으로 등록되었습니다."
  }
}
```

## 8-3. GET `/api/admin/services/:id`

### 목적

서비스 상세 조회

### 권한

* `service.read`

### 응답 특징

* summary + 운영 필드 + 권한 필드 + locale 필드
* 연결 도메인과 환경 정보를 포함
* UI 상세화면에서 바로 렌더링 가능한 구조

## 8-4. PATCH `/api/admin/services/:id`

### 목적

서비스 정보 수정

### 권한

* `service.update`

### 수정 가능 필드 예시

* `serviceName`
* `brandName`
* `status`
* `envType`
* `isVisibleInAdmin`
* `operatorUserId`
* `techOwnerUserId`
* `permissionTemplateCode`
* `supportedLocales`
* `defaultLocale`
* `seoEnabled`
* `sharedAssetEnabled`

### 사전조건

* 발행된 locale 삭제 시도 시 `PRECONDITION_FAILED`
* `defaultLocale` 제거 금지
* 운영중 서비스의 canonical locale 제거 금지

## 8-5. GET `/api/admin/services/:id/change-logs`

### 목적

서비스 변경 이력 조회

### 권한

* `service.read`

### 응답 필드 예시

* `actionType`
* `actorUserId`
* `targetType`
* `beforeJson`
* `afterJson`
* `createdAt`

---

# 9. 사이트 콘텐츠 API

기본 콘텐츠 타입 예시:

* `hero_section`
* `feature_cards`
* `business_items`
* `news_posts`
* `platform_cases`
* `faq_items`
* `service_announcements`
* `download_buttons`

## 9-1. GET `/api/admin/site-content`

### 목적

사이트 콘텐츠 목록 조회

### 권한

* `content.read`

### 쿼리

* `serviceId`
* `contentTypeCode`
* `status`
* `locale`
* `q`
* `page`
* `pageSize`

### 응답 특징

* 목록은 `SiteContentSummary` 형태
* `availableLocales` 제공
* 정렬 기본값은 `updatedAt desc`

## 9-2. POST `/api/admin/site-content`

### 목적

새 콘텐츠 생성

### 권한

* `content.create`

### 입력 예시

```json
{
  "serviceId": 1,
  "contentTypeCode": "hero_section",
  "title": "메인 히어로",
  "slug": "home-hero",
  "status": "draft",
  "payloadJson": {
    "headline": "AI 서비스와 플랫폼으로 더 나은 비즈니스 실행을 만드는 회사",
    "subHeadline": "누구나 상상만 했던 것을 현실로 만들 수 있습니다.",
    "ctaPrimary": "회사소개 보기",
    "ctaSecondary": "사업소개 보기"
  }
}
```

### 처리 규칙

* `slug` unique within service + content type + locale policy
* `payloadJson`은 content type schema 검증 통과 필요
* 기본 언어 콘텐츠를 먼저 생성한 뒤 보조 언어는 번역 API에서 분기

## 9-3. GET `/api/admin/site-content/:id`

### 목적

콘텐츠 상세 조회

### 권한

* `content.read`

### 응답 특징

* 본문 payload
* 번역 상태 요약
* 발행 이력
* SEO 연결 정보
* 변경 이력 요약

## 9-4. PATCH `/api/admin/site-content/:id`

### 목적

콘텐츠 수정

### 권한

* `content.update`

### 수정 가능 범위

* `title`
* `status`
* `payloadJson`
* `sortOrder`
* `isVisible`
* `publishedAt`

## 9-5. POST `/api/admin/site-content/:id/publish`

### 목적

기본 언어 콘텐츠 발행

### 권한

* `content.publish`

### 발행 전 검사

* 기본 언어 입력 존재
* 필수 schema 필드 충족
* canonical/domain rule 충족
* 발행 승인 필요 시 approval status 검사

---

# 10. 사이트 SEO API

## 10-1. GET `/api/admin/site-seo/:serviceId`

### 목적

서비스별 SEO 설정 조회

### 권한

* `content.read`

### 응답 필드 예시

```json
{
  "success": true,
  "data": {
    "serviceId": 1,
    "canonicalHost": "www.jinbizman.com",
    "defaultOgImageUrl": "https://www.jinbizman.com/og/default.png",
    "sitemapEnabled": true,
    "hreflangEnabled": true,
    "supportedLocales": ["ko", "en", "ja", "fr", "es"]
  }
}
```

## 10-2. PATCH `/api/admin/site-seo/:serviceId`

### 목적

서비스별 SEO 설정 수정

### 권한

* `system.update` 또는 제한된 `content.publish`

### 사전조건

* canonical host는 `www.jinbizman.com` 이외 값 금지
* locale별 alternate 링크 생성 규칙 유지
* `hreflang` 비활성화는 super admin만 허용

---

# 11. 번역/언어 운영 API

## 11-1. GET `/api/admin/contents/:id/translations`

### 목적

특정 콘텐츠의 locale별 번역 상태 조회

### 권한

* `translation.read`

## 11-2. POST `/api/admin/contents/:id/translations`

### 목적

보조 언어 번역 생성

### 권한

* `translation.create`

### 입력 예시

```json
{
  "locale": "en",
  "title": "Home",
  "slug": "/en",
  "seoTitle": "JINBIZ MANAGEMENT",
  "seoDescription": "AI services and platform business company.",
  "payloadJson": {
    "headline": "A company building better business execution with AI services and platforms"
  },
  "status": "draft"
}
```

### 검증 규칙

* `locale`는 공식 지원 언어 중 하나
* 기본 언어와 동일 locale 생성 금지
* locale별 slug unique
* payload schema 일치

## 11-3. PATCH `/api/admin/contents/:id/translations/:locale`

### 목적

번역 수정

### 권한

* `translation.update`

### 수정 가능 범위

* `title`
* `slug`
* `seoTitle`
* `seoDescription`
* `payloadJson`
* `status`

## 11-4. POST `/api/admin/contents/:id/translations/:locale/publish`

### 목적

번역 검수 완료 후 locale별 발행

### 권한

* `translation.publish`

### 발행 전 검사

* 기본 언어가 published 상태인지
* locale별 필수 필드 존재
* slug unique
* SEO title/description 최소 길이 충족

### 실패 규칙

* 기본 언어 미발행이면 `PRECONDITION_FAILED`
* 검수 권한 없으면 `FORBIDDEN`

---

# 12. 뉴스/공지 관리자 API

카테고리:

* `press`
* `disclosure`
* `notice`

## 12-1. GET `/api/admin/news`

### 목적

뉴스/공지 목록 조회

### 권한

* `content.read`

### 쿼리

* `category=press|disclosure|notice`
* `status`
* `locale`
* `q`
* `page`
* `pageSize`

## 12-2. POST `/api/admin/news`

### 목적

뉴스/공지 초안 생성

### 권한

* `content.create`

### 입력 예시

```json
{
  "category": "press",
  "title": "JINBIZ MANAGEMENT, Eureka World 공개 예정",
  "summary": "대표 AI 서비스 공개 소식",
  "body": "본문...",
  "status": "draft",
  "publishedAt": null
}
```

## 12-3. PATCH `/api/admin/news/:id`

### 목적

뉴스/공지 수정

### 권한

* `content.update`

## 12-4. POST `/api/admin/news/:id/publish`

### 목적

뉴스/공지 발행

### 권한

* `content.publish`

### 발행 규칙

* 기본 언어 초안 존재
* 카테고리 필수
* slug unique
* 필요 시 번역 상태 요약 포함
* 공개 URL은 항상 `https://www.jinbizman.com/...`

---

# 13. 문의/리드 관리자 API

## 13-1. GET `/api/admin/inquiries`

### 목적

문의 목록 조회

### 권한

* `inquiry.read`

### 쿼리

* `status`
* `assignedUserId`
* `locale`
* `inquiryType`
* `q`
* `page`
* `pageSize`

## 13-2. GET `/api/admin/inquiries/:id`

### 목적

문의 상세 조회

### 권한

* `inquiry.read`

## 13-3. PATCH `/api/admin/inquiries/:id/status`

### 목적

문의 상태 변경

### 권한

* `inquiry.update`

### 입력 예시

```json
{
  "status": "in_progress"
}
```

## 13-4. PATCH `/api/admin/inquiries/:id/assign`

### 목적

담당자 배정

### 권한

* `inquiry.update`

### 입력 예시

```json
{
  "assignedUserId": 21
}
```

## 13-5. POST `/api/admin/inquiries/:id/notes`

### 목적

내부 메모 추가

### 권한

* `inquiry.update`

### 입력 예시

```json
{
  "body": "대표 검토 후 플랫폼 협업 제안 예정"
}
```

## 13-6. POST `/api/admin/inquiries/:id/convert`

### 목적

문의를 리드 또는 사업기회로 전환

### 권한

* `lead.create` 또는 `opportunity.manage`

### 입력 예시

```json
{
  "mode": "lead",
  "ownerUserId": 14,
  "projectId": null,
  "memo": "사업 개발 검토 대상"
}
```

### 처리 규칙

* 문의 상태는 `converted`
* `leads` 또는 `opportunities` 생성
* 필요 시 기존 프로젝트 연결
* 전환 이력 audit 저장

---

# 14. 관리자 대시보드 보조 API

이 문서는 `/api/admin/*` 중심이므로, 관리자 셸이 안정적으로 뜨려면 최소 overview 집계 API가 필요합니다.

## 14-1. GET `/api/admin/dashboard/overview`

### 목적

관리자 첫 화면의 핵심 지표 조회

### 권한

* `dashboard.read`

### 응답 예시

```json
{
  "success": true,
  "data": {
    "cards": {
      "pendingApprovals": 3,
      "newInquiries": 7,
      "overdueWbs": 5,
      "unsubmittedReports": 2,
      "unsubmittedLogs": 4
    },
    "alerts": [
      {
        "type": "wbs_delayed",
        "label": "지연 WBS",
        "count": 5
      }
    ],
    "recentChanges": [
      {
        "targetType": "service",
        "targetId": 1,
        "actionType": "service.update",
        "createdAt": "2026-03-29T13:00:00.000Z"
      }
    ]
  }
}
```

### 응답 규칙

* 카드 지표
* 경고 목록
* 최근 변경 이력
* 모바일 카드형 UI와 데스크톱 매트릭스 UI가 모두 가능하도록 항목 그룹화

---

# 15. 관리자 UI용 lookup API

관리자 폼에서 필요한 선택지를 직접 하드코딩하지 않기 위해 최소 조회 엔드포인트를 둡니다.

## 15-1. GET `/api/admin/lookups/users`

### 목적

담당자/운영자/배정자 선택용 사용자 목록

### 권한

* `lookup.read`

### 응답 필드

* `id`
* `name`
* `email`
* `departmentName`
* `status`

## 15-2. GET `/api/admin/lookups/projects`

### 목적

문의 → 프로젝트 연결, 콘텐츠 → 프로젝트 연결 후보 제공

### 권한

* `lookup.read`

## 15-3. GET `/api/admin/lookups/content-types`

### 목적

서비스별 콘텐츠 타입 선택지 제공

### 권한

* `lookup.read`

## 15-4. GET `/api/admin/lookups/locales`

### 목적

지원 locale과 비활성 locale 제공

### 권한

* `lookup.read`

---

# 16. 관리자 API와 반응형 UI 연결 규칙

## 16-1. 목록 API 설계 규칙

* 카드/테이블 공통 필드 제공
* `status`, `title`, `subtitle`, `updatedAt`, `owner`, `localeBadge` 같은 공통 요약 필드 제공
* 상세 본문/이력은 목록에서 제외

## 16-2. 상세 API 설계 규칙

* 상세 drawer/page에서 필요한 full payload만 제공
* 번역, 첨부, 승인, 변경 이력, SEO 데이터를 포함
* relation은 얕게 포함하되 과도한 중첩 금지

## 16-3. 관리자 주요 화면에 필요한 응답 연결

* `ServiceHubPage` → `ServiceSummary`, `ServiceDetail`
* `SiteContentPage` → `SiteContentSummary`, locale status summary
* `NewsAdminPage` → 뉴스 summary/detail
* `InquiriesPage` → `InquirySummary`, `InquiryDetail`
* `DashboardPage` → dashboard overview grouped response

---

# 17. 보안, Rate Limit, Queue, 관측성

## 17-1. 보안 기준

* 관리자 API는 로그인된 사용자만 접근
* JWT/HttpOnly cookie 사용
* 비밀정보 하드코딩 금지
* `JWT_SECRET`, `DATABASE_URL`, 이메일 API 키는 Secrets 관리
* 관리자 변경 행위는 감사로그 필수

## 17-2. Rate Limit 기준

* `/api/admin/*`에 사용자 기준 기본 제한
* 대량 변경/발행 요청에는 stricter rule 가능

## 17-3. Queue 분리 기준

* 알림 발송
* 변경 통지
* 발행 후 캐시 무효화
* SEO/sitemap 재생성
* 감사로그 후처리
* 번역 검수 알림

## 17-4. 구조화 로그 기준

* `request_id`
* `user_id`
* `service_id`
* `locale`
* `action_type`
* `status_code`
* `error_code`
* `duration_ms`

---

# 18. 테스트 기준

## 18-1. 1차 필수 테스트

* 권한 없는 서비스 등록 차단
* 서비스 코드 중복 차단
* 기본 언어 없이 번역 발행 차단
* locale별 slug 중복 차단
* canonical host 강제 검증
* 문의 상태 변경 감사로그 생성
* 문의 전환 시 리드 생성
* 서비스 목록 summary/detail 분리 확인
* 번역 publish 권한 분리 확인
* 대시보드 overview 응답 그룹 구조 확인

## 18-2. 권장 테스트 레벨

* 단위 테스트: validator, domain helper, locale helper, permission checker
* 통합 테스트: admin routes + DB mock
* Workers runtime 테스트: Hono route + middleware + env bindings

---

# 19. 구현 우선순위

## 19-1. 추천 구현 순서

1. 공통 `response.ts`, `errors.ts`, `request-id`, `auth`, `require-permission`
2. `services.ts`
3. `site-content.ts`
4. `translations.ts`
5. `site-seo.ts`
6. `news.ts`
7. `inquiries.ts`
8. `dashboard.ts`
9. `lookups.ts`
10. 감사로그/Queue/Rate Limit 강화
11. OpenAPI 문서화
12. 관리자 UI 연결

## 19-2. 5단계 배포 완료 기준과의 연결

### 1단계
* 서비스 허브 목록/등록 기본 골격

### 2단계
* 사이트 콘텐츠 / 번역 / SEO 기본 운영

### 3단계
* 뉴스/공지 관리자 운영 및 문의 관리

### 4단계
* 게시 승인, 감사로그 일부, 관리자 운영 흐름 완성

### 5단계
* 권한 세분화, 평가 근거 연결 준비, 보안/테스트/운영 기준 강화

---

# 20. 문서 교체용 최종 체크리스트

## 20-1. 이 문서가 기존 `admin-api.md`를 즉시 대체할 수 있어야 하는 이유

* 관리자 API 범위를 서비스 허브, 사이트 콘텐츠, SEO, 번역, 뉴스, 문의, 대시보드, lookup으로 분리했습니다.
* 공통 응답 형식, 오류 코드, 상태값 표준, 퍼미션 코드, 스코프를 포함했습니다.
* `www.jinbizman.com` 기준 도메인 정책을 관리자 API 레벨에 반영했습니다.
* 공식 지원 언어 5개와 번역 발행 규칙을 포함했습니다.
* summary/detail 응답 구조와 반응형 UI 연결 규칙을 포함했습니다.
* 감사로그, Queue, Rate Limit, 테스트 기준을 포함했습니다.
* 기존 문서들에서 반복되는 핵심 원칙인 서비스 허브, 다국어, 권한 분리, 문의 리드 전환을 누락 없이 묶었습니다.
* 관리자 셸에서 실제 필요한 overview/lookup 성격의 보조 API도 포함했습니다.

## 20-2. 최종 검수 체크리스트

### 서비스 허브
* 서비스 CRUD 가능
* domain / env / locale / permissionTemplate 관리 가능
* 서비스 변경 이력 조회 가능

### 사이트 운영
* 콘텐츠 목록/상세 분리
* 콘텐츠 publish 규칙 존재
* SEO 설정 조회/수정 가능

### 번역 운영
* locale별 생성/수정/발행 가능
* 기본 언어 없이 보조 언어 발행 차단
* 미발행 언어 fallback 금지

### 뉴스 운영
* `press / disclosure / notice` 카테고리 구분
* `draft / review / published / archived` 상태 관리
* 발행 요청/발행 처리 가능

### 문의/리드 운영
* 문의 목록/상세/상태 변경 가능
* 담당자 배정 가능
* 내부 메모 가능
* 리드/사업기회 전환 가능

### 관리자 운영 보조
* overview 지표 제공
* lookup 데이터 제공
* UI의 card/table/detail 구조와 충돌 없음

### 보안/운영
* HttpOnly cookie 기반 인증
* permission + scope 검사
* audit 로그 생성
* canonical host 강제
* summary/detail 구조 유지

---

## 변경 요약

* `docs/api/admin-api.md`를 **서비스 허브 중심 관리자 API 문서**로 재정의했습니다.
* 관리자 API 범위를 `/api/admin/*` 기준으로 명확히 분리했습니다.
* 서비스, 사이트 콘텐츠, SEO, 번역, 뉴스, 문의/리드 운영 명세를 포함했습니다.
* `www.jinbizman.com` 기준 canonical/SEO 정책을 반영했습니다.
* 5개 언어 공식 지원과 번역 발행 규칙을 반영했습니다.
* 반응형 웹앱을 가능하게 하는 summary/detail 응답 원칙을 반영했습니다.
* 권한, 스코프, 감사로그, Rate Limit, Queue, 테스트 기준을 포함했습니다.
* 기존 초안에는 없었던 관리자 대시보드 overview와 lookup API를 보조 계층으로 추가해 실제 구현 착수성을 높였습니다.

---

## 다음 단계

가장 자연스러운 다음 작업은 **이 문서를 기준으로 `worker/routes/admin/*.ts` 실제 코드 골격과 `src/lib/types.ts` 관리자 응답 타입 세트를 바로 생성하는 것**입니다.
