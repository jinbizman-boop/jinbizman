# JINBIZ Public API 명세서 최신형 완성형 최종본

## 이번 단계 목표

* 첨부 기준 문서들과 지금까지 확정된 채팅 방향을 모두 반영해 **`docs/api/public-api.md` 최신형 완성형 최종본**을 다시 정리합니다.
* 이번 문서는 `JINBIZ`의 외부 홈페이지와 내부 ERP를 함께 받치는 API 중, **`/api/*` 공개 영역만 집중적으로 다루는 Public API 실행 기준서**입니다.
* 기존 확정안에 아래 3가지를 정식 요구사항으로 추가 확정합니다.

  * **PC, 모바일, 태블릿 등 모든 기기와 모든 환경에서 깨지거나 이탈되지 않는 반응형 웹앱을 가능하게 하는 summary/detail 응답 구조**
  * **한국어, 영어, 일본어, 불어, 스페인어 공식 지원**
  * **대표 도메인 `www.jinbizman.com` 사용**

* 이번 최종본은 보기 좋은 개요 문서가 아니라 **바로 구현 착수 가능한 Public API 기준서**로 작성합니다.
* `HomePage-Main-Guide`, `Develop-Total-Guide`, `Frontend-Develop-Guide`, `Backend-Develop-Guide`, `Development-Execution`, `MangePage-Main-Guide`에 공통으로 반영된 **외부 5개 페이지 / 뉴스레터 3탭 / 문의 저장 + 관리자 저장 + 알림 / 5개 언어 / canonical / locale / auth 기본 흐름**을 Public API 범위에 맞게 재조립합니다.
* 기존 문서의 구조적 연속성은 유지하되, 실제 구현에서 바로 사용할 수 있도록 **locale 우선순위, canonical/alternate 생성 규칙, cache-control, rate limit, summary/detail 응답, 후처리 분리, 공개 auth 최소 범위, 5단계 배포 완료 기준 연계**를 더 촘촘하게 보강합니다.

---

## 변경 파일

이번 단계는 문서화 단계라 실제 코드 수정 파일은 없습니다.

다만 이 문서를 기준으로 바로 연결될 핵심 백엔드 파일은 아래가 맞습니다.

* `worker/routes/public/inquiries.ts`
* `worker/routes/public/news.ts`
* `worker/routes/public/site-pages.ts`
* `worker/routes/public/locales.ts`
* `worker/routes/public/auth.ts`
* `worker/routes/system/health.ts`
* `worker/lib/db.ts`
* `worker/lib/locale.ts`
* `worker/lib/domain.ts`
* `worker/lib/seo.ts`
* `worker/lib/response.ts`
* `worker/lib/errors.ts`
* `worker/lib/rate-limit.ts`
* `worker/lib/logger.ts`
* `worker/lib/validators.ts`
* `worker/middleware/request-id.ts`
* `db/migrations/*`

관련 프론트 연결 파일은 아래가 맞습니다.

* `src/lib/api.ts`
* `src/lib/types.ts`
* `src/lib/i18n.ts`
* `src/lib/seo.ts`
* `src/pages/HomePage.tsx`
* `src/pages/CompanyPage.tsx`
* `src/pages/BusinessPage.tsx`
* `src/pages/NewsletterPage.tsx`
* `src/pages/ContactPage.tsx`
* `src/components/common/LanguageSwitcher.tsx`
* `src/components/common/EmptyState.tsx`
* `src/components/common/ErrorState.tsx`
* `src/components/common/LoadingState.tsx`

---

## 실행 명령어

```bash
npm install
npm run dev
npx wrangler dev
```

Public API 문서 적용 후 실제 개발 착수 시 권장 흐름은 아래를 유지합니다.

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

아래가 맞으면 이번 Public API 문서는 정상으로 봐도 됩니다.

* Public API 범위가 **health / locales / site pages / news / inquiries / auth**로 명확히 분리되어 있는지
* 관리자 API와 ERP API가 Public API와 섞이지 않고 별도 그룹으로 유지되는지
* 공개 페이지와 공개 콘텐츠가 **한국어 / 영어 / 일본어 / 불어 / 스페인어** 기준으로 동작하는지
* canonical/SEO URL 기준이 항상 **`https://www.jinbizman.com`** 인지
* `/api/news`와 `/api/news/:slug`가 뉴스레터의 실제 구조인 **보도자료 / 공시정보 / 공지사항**과 연결되는지
* `/api/inquiries`가 단순 저장이 아니라 **DB 저장 + 후처리 분리** 구조인지
* `/api/site/pages/:slug`가 외부 5개 페이지의 콘텐츠 모델을 제공할 수 있는지
* `/api/locales`가 언어 전환 UI와 `hreflang` 생성에 필요한 최소 정보를 주는지
* 목록 API와 상세 API가 분리되어 **반응형 UI에서 카드/리스트/상세로 안전하게 쓸 수 있는지**
* 문서 마지막 체크리스트로 기존 파일을 즉시 대체할 수 있는지 확인 가능한지

---

## 문제 발생 시

* Public API와 관리자 API 경계를 흐리게 두면 권한/캐시/보안 구조가 무너집니다.
* 다국어를 단순 문자열 덧붙이기로 처리하면 언어별 발행, slug, SEO 관리가 불가능해집니다.
* `www.jinbizman.com` 기준 canonical을 강제하지 않으면 공개 URL과 검색엔진 메타가 꼬입니다.
* 목록 응답에 상세 payload를 모두 실으면 모바일 카드 뷰와 데스크톱 리스트 모두 비효율적이 됩니다.
* 문의 저장과 이메일 발송을 같은 요청에서 끝내려고 하면 실패 지점이 많아집니다.
* 뉴스 상세 slug를 locale별로 분리하지 않으면 SEO와 공유 링크 정책이 깨집니다.
* 미발행 언어를 fallback으로 노출하면 “공식 5개 언어 운영 + 검수형 발행” 원칙이 무너집니다.
* `/api/auth/me` 응답을 과하게 비대하게 만들면 공개 페이지 초기 렌더링이 불필요하게 무거워집니다.
* 5단계 배포 완료 기준과 연결하지 않으면 “화면은 보이지만 운영 기준 미달” 상태가 남습니다.

---

# 1. 최종 정의

이 문서에서 말하는 Public API의 정답은 단순한 “외부 페이지용 데이터 몇 개”가 아닙니다.

정답은 아래입니다.

> **JINBIZ Public API는 회사소개형 AI 서비스 기업 홈페이지의 공개 경험을 위해 필요한 건강 체크, 언어 정보, 페이지 콘텐츠, 뉴스/공지, 문의, 공개 세션 상태를 하나의 도메인 정책과 하나의 다국어 정책 안에서 제공하는 공개 API 계층이다.**

이 API는 아래 전제를 반드시 지켜야 합니다.

* 외부 홈페이지는 **회사소개형 AI 서비스 기업 홈페이지**다.
* 상단 메뉴는 **메인 홈 / 회사소개 / 사업소개 / 뉴스레터 / 문의하기** 5개로 고정된다.
* 뉴스레터는 실제로 **보도자료 / 공시정보 / 공지사항** 구조다.
* 문의는 **저장 + 관리자 저장 + 알림 후처리** 구조다.
* Public API는 관리자 API와 별도로 **비인증 또는 공개 접근 가능한 데이터만** 다룬다.
* 대표 공개 도메인은 항상 **`www.jinbizman.com`** 이다.
* 공식 지원 언어는 항상 **`ko`, `en`, `ja`, `fr`, `es`** 이다.
* 미발행 언어는 fallback이 아니라 **미공개 처리**가 원칙이다.
* 반응형 웹앱을 위해 Public API는 **목록 요약 응답과 상세 응답을 분리**해야 한다.
* 5단계 배포 완료 기준 중 Public 범위는 **반응형 / 다국어 / 도메인 / 문의 저장 / 뉴스 연결 / 공개 auth 최소 범위**까지 포함한다.

---

# 2. 문서 범위

이 문서는 아래 경로만 다룹니다.

## 2-1. 핵심 Public API 라우트

* `/api/health`
* `/api/locales`
* `/api/site/pages/:slug`
* `/api/news`
* `/api/news/:slug`
* `/api/inquiries`
* `/api/auth/login`
* `/api/auth/logout`
* `/api/auth/me`

## 2-2. 이 문서에서 직접 다루지 않는 라우트

* Admin API: `/api/admin/services`, `/api/admin/site-content`, `/api/admin/site-seo`, `/api/admin/translations`, `/api/admin/news`, `/api/admin/inquiries`
* ERP API: `/api/erp/projects`, `/api/erp/wbs`, `/api/erp/daily-reports`, `/api/erp/daily-logs`, `/api/erp/evaluations`
* System API: `/api/system/audit-logs`, `/api/system/settings`, `/api/docs`

단, Public API는 관리자 API와 이어지는 흐름을 고려해야 하므로, 공개 뉴스는 관리자 발행 상태와 연결되고, 문의는 관리자 문의/리드 흐름으로 이어지며, locale과 canonical 정책도 서비스 허브 구조를 전제로 설계합니다.

---

# 3. Public API 설계 원칙

## 3-1. 공개 경험 우선 원칙

Public API는 아래 공개 경험 단위 기준으로 나눕니다.

* health
* locales
* site pages
* news
* inquiries
* auth

## 3-2. summary / detail 분리 원칙

모든 목록 API는 카드/리스트에 필요한 최소 필드만 제공합니다.

예시:

* 목록 API: 제목, 카테고리, 요약, slug, 발행일, locale badge
* 상세 API: 본문, SEO, canonical, 첨부, 번역 alternate links

이렇게 해야 모바일 카드 뷰와 데스크톱 리스트/상세 뷰를 모두 안정적으로 구성할 수 있습니다.

## 3-3. 다국어 검수형 원칙

* 기본 언어 없이 보조 언어 단독 공개 금지
* locale별 title/slug/SEO/body/status 분리
* 미발행 언어는 fallback 노출 금지
* `ko`, `en`, `ja`, `fr`, `es` 외 locale 허용 금지

## 3-4. 도메인 고정 원칙

* canonical host는 항상 `www.jinbizman.com`
* `jinbizman.com` 직접 노출 금지
* Public API가 생성하는 모든 canonical URL, alternate link, OG URL은 `https://www.jinbizman.com` 기준

## 3-5. 문의 후처리 분리 원칙

* 문의 저장은 요청 경로에서 즉시 성공 응답
* 이메일/관리자 알림은 Queue 또는 후처리로 분리
* 이메일 실패가 문의 저장 성공을 망치면 안 됨

## 3-6. 캐시 친화 원칙

* `GET /api/health`, `GET /api/locales`, `GET /api/news`, `GET /api/site/pages/:slug`는 공개 캐시 전략 고려
* `POST /api/inquiries`, `/api/auth/*`는 캐시 금지
* locale/slug/canonical에 따라 응답이 달라지므로 query와 header 규칙을 일관되게 유지

## 3-7. 5단계 배포 완료 기준 반영 원칙

Public API 문서는 아래 단계 완료 기준을 직접 만족해야 합니다.

* 1단계: 외부 브랜드 골격과 외부 5개 페이지 연결 가능
* 2단계: 반응형/다국어/도메인 체계 완성
* 3단계: 문의 저장, 관리자 저장 흐름, 이메일 알림 후처리 분리
* 4단계: 뉴스레터 리스트/상세와 관리자 발행 연결
* 5단계: 공개 auth 최소 범위, Rate Limit, 보안, 테스트, 운영 기준 강화

즉 Public API는 **페이지 콘텐츠 제공, locale 정책, canonical 정책, 문의 저장 + 후처리, 뉴스 발행 연결, 공개 세션 상태**까지 포함해야 완성입니다.

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

## 4-3. 공개 상태값 표준

* 콘텐츠/뉴스: `draft | review | published | archived`
* 번역 상태: `draft | in_translation | review | published | hidden`
* 문의: `new | in_progress | resolved | converted`
* 사용자 세션: `authenticated | anonymous`

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
    "timestamp": "2026-03-29T15:30:00.000Z"
  }
}
```

## 4-5. 인증 원칙

* Public API는 기본적으로 공개 접근 허용
* `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`는 세션 처리 대상
* 세션은 HttpOnly cookie 저장 기본
* JWT payload는 `userId`, `roles`, `departmentId` 정도만 저장
* 민감정보는 Secrets 사용
* 일반 설정은 vars 사용

## 4-6. locale 해석 우선순위

Public API에서 locale은 아래 순서로 해석합니다.

1. query `?locale=`
2. `X-Locale` header
3. 경로 prefix에서 이미 해석된 locale
4. 기본 locale `ko`

단, 해석 결과가 공식 지원 언어가 아니면 `ko`로 강제하지 않고 **요청 검증 오류 또는 공개 자원 미존재로 처리**해야 합니다. 공개 콘텐츠 조회에서는 미발행 locale을 `NOT_FOUND`로 처리합니다.

## 4-7. 공개 링크 / canonical 원칙

* canonical URL은 항상 `https://www.jinbizman.com`
* locale별 alternate URL은 실제 발행된 언어만 노출
* `canonicalUrl`, `alternateUrls`, `ogImageUrl`이 있다면 같은 host 기준으로 생성
* 미발행 locale은 `alternateUrls`에서 제외

---

# 5. 공통 타입 설계 기준

## 5-1. HealthInfo

```ts
export interface HealthInfo {
  status: "ok";
  timestamp: string;
  version?: string;
}
```

## 5-2. LocaleInfo

```ts
export interface LocaleInfo {
  code: "ko" | "en" | "ja" | "fr" | "es";
  label: string;
  isDefault: boolean;
  isPublished: boolean;
}
```

## 5-3. SitePageSummary

```ts
export interface SitePageSummary {
  slug: string;
  title: string;
  locale: "ko" | "en" | "ja" | "fr" | "es";
  status: "published";
  canonicalUrl: string;
  updatedAt: string;
}
```

## 5-4. SitePageDetail

```ts
export interface SitePageDetail {
  slug: string;
  title: string;
  locale: "ko" | "en" | "ja" | "fr" | "es";
  body: Record<string, unknown>;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  alternateUrls: Array<{
    locale: "ko" | "en" | "ja" | "fr" | "es";
    url: string;
  }>;
  updatedAt: string;
}
```

## 5-5. NewsSummary

```ts
export interface NewsSummary {
  id: number;
  category: "press" | "disclosure" | "notice";
  title: string;
  summary: string;
  slug: string;
  locale: "ko" | "en" | "ja" | "fr" | "es";
  publishedAt: string;
}
```

## 5-6. NewsDetail

```ts
export interface NewsDetail {
  id: number;
  category: "press" | "disclosure" | "notice";
  title: string;
  summary: string;
  body: string;
  slug: string;
  locale: "ko" | "en" | "ja" | "fr" | "es";
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  alternateUrls: Array<{
    locale: "ko" | "en" | "ja" | "fr" | "es";
    url: string;
  }>;
  publishedAt: string;
}
```

## 5-7. InquiryCreateInput

```ts
export interface InquiryCreateInput {
  inquiryType: string;
  companyName: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  locale: "ko" | "en" | "ja" | "fr" | "es";
}
```

## 5-8. PublicSessionInfo

```ts
export interface PublicSessionInfo {
  isAuthenticated: boolean;
  userId?: number;
  roles?: string[];
}
```

---

# 6. Public API 라우트 맵

## 6-1. Public API 그룹

* `/api/health`
* `/api/locales`
* `/api/site/pages/:slug`
* `/api/news`
* `/api/news/:slug`
* `/api/inquiries`
* `/api/auth/login`
* `/api/auth/logout`
* `/api/auth/me`

## 6-2. 실제 연결 파일 기준

* `worker/routes/system/health.ts`
* `worker/routes/public/locales.ts`
* `worker/routes/public/site-pages.ts`
* `worker/routes/public/news.ts`
* `worker/routes/public/inquiries.ts`
* `worker/routes/public/auth.ts`

---

# 7. Health API

## 7-1. GET `/api/health`

### 목적

배포 상태와 기본 서비스 상태 확인

### 권한

* 공개

### 응답 예시

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-03-29T15:30:00.000Z",
    "version": "v1.0.0"
  }
}
```

### 구현 규칙

* 인증 없이 호출 가능
* DB ping까지 포함하는 깊은 health는 별도 내부 health 또는 system health로 분리 가능
* public health는 과도한 내부 정보를 노출하지 않음
* `Cache-Control: no-store` 권장

---

# 8. Locales API

## 8-1. GET `/api/locales`

### 목적

공개 페이지의 언어 전환 UI와 `hreflang` 생성에 필요한 locale 정보 제공

### 권한

* 공개

### 응답 예시

```json
{
  "success": true,
  "data": {
    "defaultLocale": "ko",
    "items": [
      { "code": "ko", "label": "한국어", "isDefault": true, "isPublished": true },
      { "code": "en", "label": "English", "isDefault": false, "isPublished": true },
      { "code": "ja", "label": "日本語", "isDefault": false, "isPublished": true },
      { "code": "fr", "label": "Français", "isDefault": false, "isPublished": true },
      { "code": "es", "label": "Español", "isDefault": false, "isPublished": true }
    ]
  }
}
```

### 구현 규칙

* 공식 지원 언어만 반환
* 프론트 `LanguageSwitcher`와 바로 연결 가능한 형태 유지
* default locale은 항상 `ko`
* 정의된 순서는 항상 `ko, en, ja, fr, es`

---

# 9. 사이트 페이지 API

외부 홈페이지는 아래 5개 페이지 구조를 기반으로 운영합니다.

* `/`
* `/company`
* `/business`
* `/newsletter`
* `/contact`

다국어는 locale prefix를 사용합니다.

* `/en/...`
* `/ja/...`
* `/fr/...`
* `/es/...`

## 9-1. GET `/api/site/pages/:slug`

### 목적

공개 페이지 콘텐츠 조회

### 권한

* 공개

### 쿼리

* `locale`
* `preview` (선택, 공개 API에서는 제한적으로만 허용)

### 응답 예시

```json
{
  "success": true,
  "data": {
    "slug": "company",
    "title": "회사소개",
    "locale": "ko",
    "body": {
      "pageHeader": {
        "title": "회사소개",
        "description": "진비즈 매니지먼트의 방향과 정체성을 소개합니다."
      },
      "sections": []
    },
    "seoTitle": "회사소개 | JINBIZ MANAGEMENT",
    "seoDescription": "JINBIZ MANAGEMENT의 방향과 정체성을 소개합니다.",
    "canonicalUrl": "https://www.jinbizman.com/company",
    "alternateUrls": [
      { "locale": "en", "url": "https://www.jinbizman.com/en/company" },
      { "locale": "ja", "url": "https://www.jinbizman.com/ja/company" }
    ],
    "updatedAt": "2026-03-29T10:00:00.000Z"
  }
}
```

### 검증 규칙

* locale 미지정 시 기본값은 `ko`
* locale이 미발행이면 공개적으로는 `NOT_FOUND` 처리
* canonical은 항상 `www.jinbizman.com`

### 구현 규칙

* 현재는 상세 위주 API로 시작
* `body`는 콘텐츠 모델 기반 JSON 허용
* page별 구성은 프론트가 section 컴포넌트로 렌더링
* `preview=true`는 공개 API에서 기본 비활성, 서명 토큰 또는 제한된 검수 상황에서만 허용 권장
* `Cache-Control`은 공개 발행 상태에 맞춰 `s-maxage` 중심 전략 사용 가능

---

# 10. 뉴스 API

뉴스레터는 이름만 뉴스레터이고 실제 운영 구조는 아래 3개 카테고리입니다.

* `press`
* `disclosure`
* `notice`

## 10-1. GET `/api/news`

### 목적

공개 뉴스/공지 목록 조회

### 권한

* 공개

### 쿼리

* `category=press|disclosure|notice`
* `locale`
* `page`
* `pageSize`
* `q`

### 응답 예시

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 101,
        "category": "press",
        "title": "JINBIZ MANAGEMENT, Eureka World 공개 예정",
        "summary": "대표 AI 서비스 공개 소식",
        "slug": "jinbiz-eureka-world-launch",
        "locale": "ko",
        "publishedAt": "2026-04-02T09:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 구현 규칙

* 공개 상태가 `published`인 항목만 반환
* locale별 발행 상태 분리
* 목록 응답은 summary만 제공
* 모바일 카드 뷰와 데스크톱 리스트 모두 같은 응답으로 렌더링 가능해야 함
* 기본 정렬은 `publishedAt desc`

## 10-2. GET `/api/news/:slug`

### 목적

공개 뉴스/공지 상세 조회

### 권한

* 공개

### 쿼리

* `locale`

### 응답 예시

```json
{
  "success": true,
  "data": {
    "id": 101,
    "category": "press",
    "title": "JINBIZ MANAGEMENT, Eureka World 공개 예정",
    "summary": "대표 AI 서비스 공개 소식",
    "body": "본문...",
    "slug": "jinbiz-eureka-world-launch",
    "locale": "ko",
    "seoTitle": "JINBIZ MANAGEMENT, Eureka World 공개 예정",
    "seoDescription": "대표 AI 서비스 공개 소식",
    "canonicalUrl": "https://www.jinbizman.com/newsletter/press/jinbiz-eureka-world-launch",
    "alternateUrls": [
      {
        "locale": "en",
        "url": "https://www.jinbizman.com/en/newsletter/press/jinbiz-eureka-world-launch"
      }
    ],
    "publishedAt": "2026-04-02T09:00:00.000Z"
  }
}
```

### 검증 규칙

* locale 미지정 시 기본값은 `ko`
* 미발행 locale은 `NOT_FOUND`
* slug는 locale별 unique 정책 준수

### 구현 규칙

* canonical/alternateUrls 포함
* 첨부파일/OG 이미지가 있으면 별도 필드 추가 가능
* 뉴스 상세 라우트는 프론트의 `/newsletter/:category/:slug` 와 연결
* `summary`는 상세에서도 유지해 공유/메타/관련 글 영역에서 재사용 가능하도록 한다

---

# 11. 문의 API

문의는 단순 폼 저장이 아니라, 저장 후 관리자 ERP의 문의/리드 흐름으로 이어지는 출발점입니다.

## 11-1. POST `/api/inquiries`

### 목적

공개 문의 등록

### 권한

* 공개

### 입력 예시

```json
{
  "inquiryType": "business",
  "companyName": "JINBIZ",
  "name": "홍길동",
  "email": "test@example.com",
  "phone": "010-0000-0000",
  "message": "AI 서비스 협업 문의드립니다.",
  "locale": "ko"
}
```

### 검증 규칙

* `name` 필수
* `email` 형식 필수
* `message` 10자 이상
* locale은 공식 지원 언어만 허용
* 기본 rate limit 적용

### 처리 순서

1. rate limit 확인
2. Zod 검증
3. DB 저장
4. 요청 단위 로그 기록
5. 이메일/관리자 알림 Queue 발행
6. 성공 응답

### 성공 응답 예시

```json
{
  "success": true,
  "data": {
    "inquiryId": 5001,
    "locale": "ko",
    "message": "문의가 정상적으로 접수되었습니다."
  }
}
```

### 핵심 규칙

* 이메일 실패가 문의 저장 성공을 망치면 안 됨
* 문의는 기본 상태 `new`
* 이후 관리자 API에서 상태 변경, 담당자 배정, 리드 전환 가능해야 함
* 반응형 폼 UX를 위해 오류 메시지는 필드 단위로 매핑 가능한 형태가 권장됨

---

# 12. Auth API

Public API 범위에서 auth는 외부/내부 공용 세션 진입점을 최소 범위로 제공합니다.

## 12-1. POST `/api/auth/login`

### 목적

로그인 처리

### 권한

* 공개

### 입력 예시

```json
{
  "email": "admin@jinbizman.com",
  "password": "********"
}
```

### 처리 규칙

* 유효 사용자 확인
* password 검증
* signed JWT 발급
* HttpOnly cookie 저장

### 응답 예시

```json
{
  "success": true,
  "data": {
    "message": "로그인되었습니다."
  }
}
```

## 12-2. POST `/api/auth/logout`

### 목적

로그아웃 처리

### 권한

* 인증 사용자

### 처리 규칙

* 세션 cookie 만료
* 필요 시 refresh/session 토큰 무효화

## 12-3. GET `/api/auth/me`

### 목적

현재 세션 상태 조회

### 권한

* 공개 호출 가능, 세션 없으면 anonymous 응답

### 응답 예시

```json
{
  "success": true,
  "data": {
    "isAuthenticated": false
  }
}
```

또는

```json
{
  "success": true,
  "data": {
    "isAuthenticated": true,
    "userId": 1,
    "roles": ["super_admin"]
  }
}
```

### 구현 규칙

* 외부 페이지 초기 렌더링에서 과도하게 무겁지 않게 최소 정보만 반환
* 관리자 셸 진입 전 세션 확인과 연결 가능
* 캐시 금지
* anonymous/authenticated 분기만 명확히 제공하고 상세 프로필은 별도 내부 API로 분리 가능

---

# 13. 페이징, 필터, 정렬 표준

## 13-1. 공통 쿼리 파라미터

* `page`
* `pageSize`
* `q`
* `sortBy`
* `sortOrder`
* `locale`

## 13-2. 공통 응답 형태

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

## 13-3. 정렬 기본값

* 뉴스 목록: `publishedAt desc`
* 페이지 응답: 단건 조회 기준, 정렬 없음
* locales: 정의된 순서 `ko, en, ja, fr, es`

---

# 14. Public API와 반응형 UI 연결 규칙

반응형은 CSS만으로 해결되지 않습니다. Public API는 모바일 카드형, 태블릿 요약형, 데스크톱 상세형 UI를 동시에 지원할 수 있도록 설계해야 합니다.

## 14-1. 목록 API 설계 규칙

* 카드/리스트 공통 필드 제공
* title, summary, slug, publishedAt, category, locale badge 같은 공통 요약 필드 제공
* 상세 본문은 목록에서 제외

## 14-2. 상세 API 설계 규칙

* 상세 page에서 필요한 full payload만 제공
* canonical, alternateUrls, SEO 데이터를 포함

## 14-3. 외부 주요 화면에 필요한 응답 연결

* `HomePage` → `site pages` payload
* `CompanyPage` → `site pages` payload
* `BusinessPage` → `site pages` payload
* `NewsletterPage` → `NewsSummary[]`
* `NewsletterDetailPage` → `NewsDetail`
* `ContactPage` → `POST /api/inquiries`
* `LanguageSwitcher` → `/api/locales`

---

# 15. 보안, Rate Limit, Queue, 관측성

## 15-1. 보안 기준

* 공개 API 중 쓰기 요청은 최소한의 rate limit 적용
* 로그인/문의 API는 stricter rate limit 고려
* 비밀정보 하드코딩 금지
* `JWT_SECRET`, `DATABASE_URL`, 이메일 API 키는 Secrets 관리

## 15-2. Rate Limit 기준

우선 적용 대상:

* `/api/inquiries`
* `/api/auth/login`
* `/api/news`
* `/api/site/pages/:slug`

## 15-3. Queue 분리 기준

* 문의 접수 후 이메일 발송
* 관리자 알림 생성
* 필요 시 sitemap/캐시 무효화 후처리

## 15-4. 구조화 로그 기준

* `request_id`
* `locale`
* `action_type`
* `status_code`
* `error_code`
* `duration_ms`

---

# 16. 캐시 및 헤더 전략

## 16-1. 공개 조회 API

권장 대상:

* `/api/health`
* `/api/locales`
* `/api/news`
* `/api/news/:slug`
* `/api/site/pages/:slug`

권장 방향:

* `ETag` 또는 `Last-Modified` 고려
* CDN 캐시 시 locale과 slug 차이를 캐시 키에 반영
* preview 응답은 캐시 금지

## 16-2. 저장 / 세션 API

비캐시 대상:

* `/api/inquiries`
* `/api/auth/login`
* `/api/auth/logout`
* `/api/auth/me`

권장 헤더:

```http
Cache-Control: no-store
```

---

# 17. 테스트 기준

## 17-1. 1차 필수 테스트

* `/api/health` 응답 정상
* `/api/locales` 5개 언어 반환
* 미발행 locale 페이지 조회 차단
* 미발행 locale 뉴스 상세 조회 차단
* locale별 slug 충돌 방지
* canonical host 강제 검증
* 문의 등록 검증 실패
* 문의 등록 성공
* 문의 저장 성공과 알림 후처리 분리 확인
* `/api/auth/me` anonymous/authenticated 응답 분기 확인

## 17-2. 권장 테스트 레벨

* 단위 테스트: validator, domain helper, locale helper
* 통합 테스트: public routes + DB mock
* Workers runtime 테스트: Hono route + middleware + env bindings

---

# 18. 구현 우선순위

## 18-1. 추천 구현 순서

1. 공통 `response.ts`, `errors.ts`, `request-id`, `locale.ts`, `domain.ts`
2. `health.ts`
3. `locales.ts`
4. `site-pages.ts`
5. `news.ts`
6. `inquiries.ts`
7. `auth.ts`
8. Queue/Rate Limit 강화
9. OpenAPI 문서화
10. 외부 5개 페이지 연결

## 18-2. 5단계 배포 완료 기준과의 연결

### 1단계
* `health`, 외부 페이지 라우트 골격, 외부 브랜드 5개 메뉴 연결 가능 상태

### 2단계
* locale / canonical / 5개 언어 구조
* `www.jinbizman.com` 기준 URL 정책
* 미발행 locale 숨김

### 3단계
* 문의 등록, 저장, 성공 응답, 후처리 분리
* ERP에서 문의 목록 조회 연결 가능

### 4단계
* 뉴스 리스트/상세, locale별 발행 상태, 외부 뉴스레터 연결
* 관리자 발행 데이터와 외부 상세 페이지 연결

### 5단계
* 공개 auth 기본, SEO/alternate 정교화, 보안/테스트/운영 기준 강화
* 문의 API Rate Limit 적용
* 핵심 시나리오 테스트 통과

---

# 19. 문서 교체용 최종 체크리스트

## 19-1. 이 문서가 기존 `public-api.md`를 즉시 대체할 수 있어야 하는 이유

* Public API 범위를 health, locales, site pages, news, inquiries, auth로 분리했습니다.
* 공통 응답 형식, 오류 코드, 상태값 표준을 포함했습니다.
* `www.jinbizman.com` 기준 canonical/SEO 정책을 Public API 레벨에 반영했습니다.
* 공식 지원 언어 5개와 미발행 언어 숨김 규칙을 포함했습니다.
* summary/detail 응답 구조와 반응형 UI 연결 규칙을 포함했습니다.
* 문의 저장 + 알림 후처리 분리 규칙을 포함했습니다.
* 기존 문서들에서 반복되는 핵심 원칙인 외부 5개 페이지, 뉴스레터 3탭, 문의 저장 구조, 다국어 운영, 공개 auth 최소 범위를 누락 없이 묶었습니다.
* 기존 초안에는 없던 locale 해석 우선순위, 캐시/헤더 전략, preview 제한 원칙, 5단계 배포 완료 기준 연계를 추가해 실제 구현 착수성을 높였습니다.

## 19-2. 최종 검수 체크리스트

### Health
* 공개 health 응답 가능

### Locales
* 5개 언어 조회 가능
* 기본 언어 `ko` 고정

### Site Pages
* 외부 5개 페이지 콘텐츠 조회 가능
* locale별 canonical/alternate 제공 가능

### News
* `press / disclosure / notice` 카테고리 구분
* published 상태만 공개
* locale별 상세 조회 가능

### Inquiries
* 문의 등록 가능
* 유효성 검증 가능
* 저장과 후처리 분리 가능

### Auth
* login/logout/me 기본 흐름 가능
* anonymous/authenticated 분기 가능

### 보안/운영
* canonical host 강제
* rate limit 적용
* summary/detail 구조 유지
* locale fallback 금지
* 5단계 배포 완료 기준 반영

---

## 변경 요약

* `docs/api/public-api.md`를 **공개 영역 전용 Public API 문서**로 재정의했습니다.
* Public API 범위를 `/api/health`, `/api/locales`, `/api/site/pages/:slug`, `/api/news`, `/api/inquiries`, `/api/auth/*` 기준으로 명확히 분리했습니다.
* 외부 5개 페이지, 뉴스레터 3탭, 문의 저장 구조를 반영했습니다.
* `www.jinbizman.com` 기준 canonical/SEO 정책을 반영했습니다.
* 5개 언어 공식 지원과 미발행 언어 숨김 규칙을 반영했습니다.
* 반응형 웹앱을 가능하게 하는 summary/detail 응답 원칙을 반영했습니다.
* 권한 최소화, Rate Limit, Queue, 테스트 기준을 포함했습니다.
* 기존 초안에는 부족했던 locale 우선순위, 헤더/캐시 전략, 공개 auth 최소 범위, 5단계 배포 완료 기준 연계를 보강했습니다.

---

## 다음 단계

가장 자연스러운 다음 작업은 **이 문서를 기준으로 `worker/routes/public/*.ts` 실제 코드 골격과 `src/lib/types.ts` Public 응답 타입 세트를 바로 생성하는 것**입니다.
