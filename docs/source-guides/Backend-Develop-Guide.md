## 이번 단계 목표

* 첨부 기준 문서 3개를 바탕으로 **JINBIZ 백엔드 개발 가이드 최신형 완성형 최종본**을 다시 정리합니다.
* 이번 답변은 외부 홈페이지와 내부 ERP를 함께 받치는 **백엔드 중심 실행 기준서**입니다.
* 기존 확정안에 아래 3가지를 정식 요구사항으로 추가 확정합니다.

  * **PC, 모바일, 태블릿 등 모든 기기와 모든 환경에서 깨지거나 이탈되지 않는 반응형 웹앱 반영**
  * **한국어, 영어, 일본어, 불어, 스페인어 공식 지원**
  * **사용 도메인은 `www.jinbizman.com` 사용**
* 이번 최종본은 좋은 참고 문서가 아니라 **바로 구현에 들어갈 수 있는 백엔드 기준서**로 작성합니다.

첨부 문서 기준으로 외부는 회사소개형 AI 서비스 기업 홈페이지, 내부는 CMS가 아닌 ERP, 그리고 핵심은 서비스 허브·WBS·업무보고/업무일지·평가 근거 데이터라는 방향이 이미 고정되어 있습니다.   

---

## 변경 파일

이번 단계는 문서화 단계라 실제 수정 파일은 없습니다.

다만 이 가이드를 기준으로 바로 연결될 백엔드 파일은 아래가 가장 적절합니다.

* `worker/index.ts`
* `worker/app.ts`
* `worker/lib/db.ts`
* `worker/lib/auth.ts`
* `worker/lib/response.ts`
* `worker/lib/errors.ts`
* `worker/lib/logger.ts`
* `worker/lib/permissions.ts`
* `worker/lib/rate-limit.ts`
* `worker/lib/locale.ts`
* `worker/lib/domain.ts`
* `worker/lib/seo.ts`
* `worker/middleware/request-id.ts`
* `worker/middleware/auth.ts`
* `worker/middleware/require-permission.ts`
* `worker/middleware/scope-check.ts`
* `worker/middleware/audit.ts`
* `worker/routes/public/inquiries.ts`
* `worker/routes/public/news.ts`
* `worker/routes/public/site-pages.ts`
* `worker/routes/public/locales.ts`
* `worker/routes/admin/services.ts`
* `worker/routes/admin/site-content.ts`
* `worker/routes/admin/site-seo.ts`
* `worker/routes/admin/translations.ts`
* `worker/routes/erp/projects.ts`
* `worker/routes/erp/wbs.ts`
* `worker/routes/erp/wbs-templates.ts`
* `worker/routes/erp/daily-reports.ts`
* `worker/routes/erp/daily-logs.ts`
* `worker/routes/erp/approvals.ts`
* `worker/routes/erp/evaluations.ts`
* `worker/routes/system/health.ts`
* `worker/routes/system/audit-logs.ts`
* `worker/routes/system/settings.ts`
* `db/migrations/*`
* `db/seeds/*`

첨부 백엔드 가이드는 `worker/`와 `db/migrations/` 중심 구조를 전제로 하고 있고, 실행 문서도 같은 방향으로 폴더 구조를 고정하고 있습니다.  

---

## 실행 명령어

Cloudflare는 React + Vite 기반 풀스택 Workers 앱 시작점을 `npm create cloudflare@latest -- <app> --framework=react`로 안내하고, 생성되는 기본 구조에 `src/`, `worker/index.ts`, `vite.config.ts`, `wrangler.jsonc`가 포함됩니다. Workers 테스트는 Cloudflare가 Workers Vitest integration 사용을 권장합니다. ([Cloudflare Docs][1])

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
npx wrangler queues list
```

Neon serverless driver는 HTTP와 WebSocket을 모두 지원하고, 단일·비대화형 쿼리에는 HTTP가 더 빠르며, 세션 또는 인터랙티브 트랜잭션이 필요할 때는 WebSocket을 쓰라고 안내합니다. Hono는 Web Standards 기반 멀티 런타임 프레임워크이고, `@hono/zod-openapi`는 `OpenAPIHono`로 검증과 문서 생성을 함께 가져갈 수 있습니다. `jose`는 Cloudflare Workers를 포함한 Web-interoperable runtime에서 동작하도록 설계되어 있습니다. ([Neon][2])

---

## 확인 방법

* `/api/health`가 정상 응답해야 합니다.
* 공개 API와 관리자 API의 권한 구분이 명확해야 합니다.
* 문의 등록 시 **DB 저장과 알림 후처리**가 분리되어야 합니다.
* 모든 업무 데이터는 **프로젝트와 WBS를 중심으로 저장**되어야 합니다.
* 아침 업무보고와 퇴근 업무일지 데이터가 반드시 **WBS를 참조**해야 합니다.
* 새 서비스 등록 후 서비스별 콘텐츠/권한/환경/언어를 같은 관리자 체계에서 관리할 수 있어야 합니다.
* 평가 데이터는 점수만 남는 구조가 아니라 **WBS·산출물·결재 같은 근거 데이터**가 연결되어야 합니다.
* 외부 공개 콘텐츠는 **한국어·영어·일본어·불어·스페인어** 기준으로 발행 상태를 따로 관리할 수 있어야 합니다.
* 공개 링크 기준은 **`www.jinbizman.com`** 으로 통일되어야 합니다.
* 반응형 QA는 프론트의 몫이지만, 백엔드는 **기기별로 깨지지 않는 UI를 가능하게 하는 데이터 구조와 API 응답 구조**를 제공해야 합니다.

---

## 문제 발생 시

* 라우트가 많아졌는데 `fetch` 분기만으로 계속 가면 API 유지보수가 급격히 어려워집니다.
* 로그인·권한·감사로그를 나중에 붙이려 하면 관리자 ERP의 핵심 통제가 무너집니다.
* WBS와 일일보고를 따로 저장하면 진척도와 평가 근거가 분리됩니다.
* 문의 처리와 이메일 발송을 한 요청 안에서 모두 처리하면 실패 지점이 많아집니다.
* 다국어를 문자열 덧붙이기 수준으로 처리하면 언어별 발행·검수·SEO 운영이 불가능해집니다.
* 도메인 정책을 뒤늦게 붙이면 canonical, redirect, `hreflang`, 뉴스 상세 URL 구조가 꼬입니다.
* 공개 GitHub 코드를 그대로 가져오면 JINBIZ의 멀티 서비스·WBS·평가 구조와 안 맞는 코드가 섞입니다.

---

# JINBIZ 백엔드 개발 가이드 최신형 완성형 최종본

## 1. 최종 정의

이번 백엔드의 정답은 “문의 저장 API 몇 개”가 아닙니다.

정답은 아래입니다.

> **JINBIZ 백엔드는 외부 홈페이지 운영과 내부 ERP 운영을 하나의 계정 체계, 하나의 권한 체계, 하나의 데이터 흐름으로 연결하는 통합 운영 백엔드다.**

첨부 문서 기준으로 외부는 회사소개형 AI 서비스 홈페이지, 내부는 CMS가 아니라 ERP이며, 핵심은 `멀티 서비스 연결형 운영`, `WBS 중심 업무`, `아침 업무보고 + 퇴근 업무일지`, `업무 데이터 기반 평가`입니다.   

이번 최종본에서 백엔드가 추가로 강제해야 하는 것은 아래 3가지입니다.

* 대표 도메인 **`www.jinbizman.com`** 기준의 공개 링크 정책
* 공개 서비스의 **5개 공식 언어 지원**
* 외부 홈페이지와 내부 ERP가 **모든 기기에서 깨지지 않도록 하는 API/데이터 구조**

즉 백엔드는 아래를 강제해야 합니다.

* 모든 업무는 프로젝트/WBS에 연결
* 모든 운영 대상은 서비스 허브에 등록
* 모든 관리자 동작은 권한과 감사로그를 남김
* 모든 평가는 근거 데이터에 연결
* 모든 공개 콘텐츠는 언어·도메인·SEO 메타데이터를 함께 가짐

---

## 2. 첨부 문서 기준으로 확정된 백엔드 핵심 요구

문서상 JINBIZ ERP는 단순 CMS가 아니라 `홈페이지 운영 / 뉴스·공지 / 문의·리드 / 전자결재 / WBS·프로젝트 / 조직·권한 / 경영지원`을 묶는 통합 시스템이어야 합니다. 또한 새 홈페이지/앱이 생겨도 서비스 등록만으로 관리자에 연결되고, 모든 업무는 프로젝트와 WBS에 연결되며, 인사평가는 WBS·산출물·일정·품질 기반이어야 합니다. 여기에 이번 확정안에서 `www.jinbizman.com` 기준 운영, 전 기기 반응형, 한국어·영어·일본어·불어·스페인어 공식 지원이 추가됐습니다.  

백엔드 관점에서 이 말은 곧 아래를 뜻합니다.

* 권한과 데이터 모델이 먼저 있어야 함
* API는 CRUD보다 **업무 규칙 강제**가 우선
* 단순 테이블 저장보다 **참조 관계**가 중요
* 일일 보고와 평가는 별도 기능이 아니라 **WBS 기반 파생 기능**
* 다국어는 UI 옵션이 아니라 **데이터 스키마**
* 반응형은 CSS 문제가 아니라 **API 응답 구조와 필드 설계 문제**
* 도메인은 인프라 문제가 아니라 **공개 URL 정책과 SEO 데이터 문제**

---

## 3. 공개 GitHub/공식 레퍼런스 적용 기준

Cloudflare 공식 React + Vite 가이드는 React SPA, Cloudflare Workers API, Cloudflare Vite plugin을 함께 쓰는 풀스택 구조를 제시하고, 생성 결과에 `src/`, `worker/index.ts`, `vite.config.ts`, `wrangler.jsonc`가 포함된다고 설명합니다. 이 프로젝트의 기본 출발점은 이 구조가 가장 안전합니다. ([Cloudflare Docs][1])

Cloudflare는 Workers 테스트에 대해 “대부분의 사용자에게 Workers Vitest integration을 권장”한다고 안내하고, 이 통합은 Vitest 테스트를 Workers runtime 안에서 실행하도록 해줍니다. 따라서 JINBIZ 백엔드 테스트는 일반 Node 테스트보다 Workers runtime 기준으로 잡는 것이 맞습니다. ([Cloudflare Docs][3])

Cloudflare Queues는 “guaranteed delivery”, “offload work from a request”, “buffer or batch data”를 지원한다고 설명합니다. 문의 저장 뒤 이메일 발송, 관리자 알림, 감사로그 후처리 같은 작업은 Queue로 분리하는 것이 맞습니다. ([Cloudflare Docs][4])

Cloudflare는 Secrets를 “encrypted text values”라고 설명하고, API 키와 토큰 같은 민감정보 저장에 쓰라고 안내합니다. 반면 Environment variables의 text strings and JSON values are not encrypted 라고 명시합니다. 따라서 `JWT_SECRET`, `DATABASE_URL`, 이메일 API 키 같은 값은 Secrets로 관리해야 하고, 일반 설정만 `vars`로 둬야 합니다. ([Cloudflare Docs][5])

Neon serverless driver는 single non-interactive transaction, 즉 one-shot query에 HTTP가 더 빠르고, session 또는 interactive transaction이 필요하면 WebSocket을 쓰라고 안내합니다. JINBIZ는 대부분이 짧은 조회/저장형 요청이므로 기본은 HTTP가 맞습니다. ([Neon][2])

Hono는 Web Standards 기반 멀티 런타임 프레임워크이고, Cloudflare Workers에서 그대로 동작합니다. `@hono/zod-openapi`는 `OpenAPIHono`를 통해 Zod 검증과 OpenAPI 문서 생성을 함께 가져갈 수 있습니다. `jose`는 Cloudflare Workers를 포함한 Web-interoperable runtimes에서 동작합니다. ([hono.dev][6])

### 최종 채택 원칙

* **무조건 채택:** Cloudflare Workers + Neon + Zod
* **강력 권장:** Hono, jose, Workers Vitest integration
* **1차에서 선택 채택:** OpenAPI 문서화, Queues, Rate Limiting
* **나중에 검토:** Durable Objects, AI 요약, 위험 예측

---

## 4. 최종 백엔드 기술 스택

### 고정 스택

* Cloudflare Workers
* Hono
* Neon Postgres
* Zod
* jose
* Wrangler
* Vitest + `@cloudflare/vitest-pool-workers`

### 왜 이 조합이 맞는가

Cloudflare Workers는 전역 배포와 Bindings 기반 리소스 연결에 강하고, Secrets와 vars를 `env`를 통해 주입할 수 있습니다. JINBIZ는 외부 홈페이지와 내부 ERP를 한 프로젝트 안에서 운영해야 하므로 이 구조가 적합합니다. ([Cloudflare Docs][5])

Neon serverless driver는 Cloudflare Workers 같은 edge/serverless 환경에서 Postgres를 쓰기 위한 조합으로 적합하고, Hono는 라우트가 빠르게 늘어나는 ERP형 프로젝트에서 raw router보다 유지보수성이 좋습니다. `jose`는 Cloudflare Workers 호환 JWT 처리에 적합합니다. ([Neon][2])

첨부 실행 문서도 실제 구현 기준을 Cloudflare Workers + Wrangler, React + Vite + TypeScript, Neon, Hono, jose, Zod로 고정하고 있습니다. 

---

## 5. 최종 백엔드 아키텍처

### 권장 구조

```text
worker/
├─ index.ts
├─ app.ts
├─ lib/
│  ├─ db.ts
│  ├─ auth.ts
│  ├─ response.ts
│  ├─ errors.ts
│  ├─ logger.ts
│  ├─ permissions.ts
│  ├─ rate-limit.ts
│  ├─ locale.ts
│  ├─ domain.ts
│  ├─ seo.ts
│  └─ validators.ts
├─ middleware/
│  ├─ request-id.ts
│  ├─ auth.ts
│  ├─ require-permission.ts
│  ├─ scope-check.ts
│  ├─ audit.ts
│  └─ error-handler.ts
├─ routes/
│  ├─ public/
│  │  ├─ inquiries.ts
│  │  ├─ news.ts
│  │  ├─ site-pages.ts
│  │  └─ locales.ts
│  ├─ admin/
│  │  ├─ services.ts
│  │  ├─ site-content.ts
│  │  ├─ site-seo.ts
│  │  ├─ translations.ts
│  │  └─ inquiries.ts
│  ├─ erp/
│  │  ├─ projects.ts
│  │  ├─ wbs.ts
│  │  ├─ wbs-templates.ts
│  │  ├─ daily-reports.ts
│  │  ├─ daily-logs.ts
│  │  ├─ approvals.ts
│  │  ├─ evaluations.ts
│  │  └─ users.ts
│  └─ system/
│     ├─ health.ts
│     ├─ audit-logs.ts
│     ├─ settings.ts
│     └─ docs.ts
└─ types/
   └─ env.ts
```

### 요청 흐름

1. 프론트가 `/api/*` 호출
2. middleware에서 `request_id` 생성
3. 인증/권한 검사
4. locale/domain 규칙 검사
5. Zod 입력 검증
6. 서비스 레이어 또는 SQL 레이어 실행
7. Neon 저장/조회
8. 감사로그 기록
9. 후처리가 필요하면 Queue 발행
10. 통일된 응답 반환

### 왜 이 구조가 맞는가

JINBIZ는 단순 CRUD가 아니라 서비스 허브, WBS, 결재, 평가 근거 데이터, 다국어 발행, 도메인 정책까지 같이 다뤄야 합니다. 그래서 라우트 분리, 인증 middleware, 권한 검사, locale/domain 처리, 감사로그 분리 구조가 처음부터 있어야 합니다. 이 방향은 첨부 백엔드 가이드가 제시한 `worker/` 중심 구조와도 일치합니다. 

---

## 6. 이번 최종본에서 추가 확정되는 백엔드 정책 3종

## 6-1. 도메인 정책

대표 도메인은 **`www.jinbizman.com`** 입니다.

백엔드가 강제해야 할 도메인 정책은 아래입니다.

* 공개 API가 생성하는 canonical URL은 항상 `https://www.jinbizman.com`
* `jinbizman.com` 접근은 `www.jinbizman.com`으로 리다이렉트하는 정책을 전제로 메타데이터 생성
* 뉴스 상세, 문의 완료, 언어별 공개 페이지 URL은 모두 이 도메인 기준
* `service_domains` 테이블에서 언어별 도메인/경로 정책 관리
* `hreflang`, canonical, OG URL을 백엔드에서 일관되게 생성

## 6-2. 반응형 웹앱 지원 정책

반응형은 주로 프론트 구현이지만, 백엔드도 아래를 보장해야 합니다.

* 카드형/리스트형 전환이 가능한 **예측 가능한 JSON 구조**
* 대형 테이블을 모바일에서 카드형으로 재구성 가능한 **필드 그룹**
* 긴 다국어 문자열을 프론트가 안전하게 감쌀 수 있도록 **짧은 요약 필드와 상세 필드 분리**
* 목록 API에 필요한 최소 필드만 주는 **summary 응답**
* 상세 화면은 별도 API로 분리해 과도한 payload 방지

## 6-3. 공식 지원 언어 정책

JINBIZ의 공식 지원 언어는 아래 5개입니다.

* 한국어
* 영어
* 일본어
* 불어
* 스페인어

백엔드가 강제해야 할 사항은 아래입니다.

* 서비스별 지원 언어 목록 저장
* 기본 언어와 보조 언어 구분
* 언어별 제목/본문/CTA/slug/SEO 분리
* 언어별 발행 상태 분리
* 언어별 미리보기/검수 상태 저장
* 미발행 언어는 fallback 노출이 아니라 **미공개 처리**

첨부 확정 문서도 서비스 허브에 `i18n_enabled`가 포함돼 있고, 대표 도메인과 공식 지원 언어, 반응형 웹앱이 정식 요구사항으로 추가돼 있습니다.  

---

## 7. 기능 정의 최종안

## 7-1. 공개 API

### 문의 접수

* `POST /api/inquiries`
* 저장 대상: `inquiries`
* 후처리: 이메일 알림, 관리자 알림, 리드 후보 생성
* 추가 필드: `locale`
* 방어: rate limit, spam 방지, 입력 검증

### 뉴스/공지 조회

* `GET /api/news?category=press|disclosure|notice&locale=ko`
* 저장 대상: `news_posts`, `news_post_translations`
* 공개 조회만 허용
* 미발행 언어는 노출 금지

### 페이지 콘텐츠 조회

* `GET /api/site/pages/:slug?locale=ko`
* 저장 대상: `service_content_items`, `service_translations`
* 서비스와 콘텐츠 타입에 따라 분기
* canonical 도메인 메타데이터 포함

### 지원 언어 정보 조회

* `GET /api/locales`
* 목적: 공개 페이지 언어 전환 UI와 `hreflang` 생성 지원

## 7-2. 관리자 API

### 서비스 허브

* `GET /api/admin/services`
* `POST /api/admin/services`
* `PATCH /api/admin/services/:id`
* `GET /api/admin/services/:id/change-logs`

### 홈페이지 운영

* `GET /api/admin/site-content`
* `POST /api/admin/site-content`
* `PATCH /api/admin/site-content/:id`
* `POST /api/admin/site-content/:id/publish`

### 번역/언어 관리

* `GET /api/admin/contents/:id/translations`
* `POST /api/admin/contents/:id/translations`
* `PATCH /api/admin/contents/:id/translations/:locale`
* `POST /api/admin/contents/:id/translations/:locale/publish`

### 문의/리드

* `GET /api/admin/inquiries`
* `PATCH /api/admin/inquiries/:id/status`
* `POST /api/admin/inquiries/:id/convert-to-lead`

## 7-3. ERP API

### 프로젝트/WBS

* `GET /api/erp/projects`
* `POST /api/erp/projects`
* `GET /api/erp/projects/:id`
* `POST /api/erp/wbs`
* `PATCH /api/erp/wbs/:id`
* `POST /api/erp/wbs/:id/dependency`

### WBS 템플릿

* `GET /api/erp/wbs-templates`
* `POST /api/erp/wbs-templates`

### 아침 업무보고

* `POST /api/erp/daily-reports`

### 퇴근 업무일지

* `POST /api/erp/daily-logs`

### 결재

* `GET /api/erp/approvals`
* `POST /api/erp/approvals`
* `PATCH /api/erp/approvals/:id/action`

### 평가

* `GET /api/erp/evaluation-cycles`
* `GET /api/erp/evaluations/:cycleId`
* `POST /api/erp/evaluations/:cycleId/score`

이 구조는 첨부 백엔드 가이드의 공개 API, 관리자 API, ERP API 방향과 일치합니다. 

---

## 8. 백엔드 관점의 화면/운영 지원 기준

백엔드는 직접 화면을 그리진 않지만, 아래 4개 운영 화면이 가능하도록 구조를 설계해야 합니다.

### API 문서 화면

* `/api/docs`
* 목적: 프론트/백 협업, QA, 관리자용 호출 검증
* 방식: Hono + OpenAPI

### Health 화면

* `/api/health`
* 항목: app status, DB ping, queue binding 여부, version
* 목적: 배포 직후 점검

### Audit Log 조회 화면

* 목적: 누가, 언제, 어떤 서비스/프로젝트/문서를 바꿨는지 조회

### 언어/도메인 운영 화면

* 목적: 언어별 발행 상태, 기본 언어, canonical 도메인, `hreflang` 정책 관리

`OpenAPIHono`를 통한 문서화는 Hono 공식 예시와 맞고, `jose`는 Cloudflare Workers 런타임 호환 인증 라이브러리이므로 문서화와 인증을 함께 안정적으로 가져갈 수 있습니다. ([hono.dev][7])

---

## 9. DB 테이블 최종안

첨부 문서 기준 핵심 데이터 구조는 유지하되, 이번 최종본에서는 **다국어와 도메인 운영용 테이블을 정식 추가**합니다. 기존 `services`, `news_posts`, `projects`, `wbs_tasks`, `daily_reports`, `daily_logs`, `evaluation_evidences` 중심 구조는 그대로 유지하는 것이 맞습니다.  

## 9-1. 사용자/권한

### `users`

* id
* email
* password_hash
* name
* phone
* status
* department_id
* job_family
* job_role
* joined_at
* left_at
* created_at
* updated_at

### `roles`

* id
* code
* name
* description

### `user_roles`

* id
* user_id
* role_id

### `departments`

* id
* code
* name
* parent_id

## 9-2. 서비스 허브

### `services`

* id
* service_code
* service_name
* service_type
* brand_name
* status
* domain
* env_type
* is_visible_in_admin
* owner_department_id
* operator_user_id
* tech_owner_user_id
* permission_template_code
* content_model_code
* deploy_type
* notify_type
* seo_enabled
* i18n_enabled
* shared_asset_enabled
* created_at
* updated_at

### `service_content_types`

* id
* service_id
* type_code
* name
* schema_json
* is_active

### `service_content_items`

* id
* service_id
* content_type_id
* title
* slug
* status
* payload_json
* published_at
* created_by
* updated_by
* created_at
* updated_at

### `service_change_logs`

* id
* service_id
* action_type
* target_type
* target_id
* before_json
* after_json
* actor_user_id
* created_at

## 9-3. 다국어/도메인 확장

### `service_domains`

* id
* service_id
* domain
* locale
* is_canonical
* created_at

### `service_translations`

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

### `news_post_translations`

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

## 9-4. 홈페이지/문의/뉴스

### `news_posts`

* id
* category
* title
* slug
* summary
* body
* status
* published_at
* author_user_id
* created_at
* updated_at

### `inquiries`

* id
* inquiry_type
* company_name
* name
* email
* phone
* message
* locale
* status
* assigned_user_id
* lead_status
* project_id
* created_at
* updated_at

## 9-5. 프로젝트/WBS

### `projects`

* id
* code
* name
* project_type
* service_id
* status
* owner_user_id
* start_date
* end_date
* description
* created_at
* updated_at

### `project_members`

* id
* project_id
* user_id
* role_in_project

### `wbs_templates`

* id
* code
* name
* job_family
* work_style
* is_active
* schema_json

### `wbs_tasks`

* id
* project_id
* parent_task_id
* template_id
* title
* description
* task_type
* job_family
* work_style
* assignee_user_id
* reviewer_user_id
* approver_user_id
* start_date
* due_date
* planned_progress
* actual_progress
* priority
* status
* weight
* requires_approval
* output_url
* qa_status
* deploy_status
* created_at
* updated_at

### `wbs_task_dependencies`

* id
* task_id
* depends_on_task_id
* dependency_type

## 9-6. 일일 보고/일지

### `daily_reports`

* id
* user_id
* report_date
* project_id
* submitted_at

### `daily_report_items`

* id
* daily_report_id
* wbs_task_id
* goal_text
* expected_hours
* risk_text
* support_request_text

### `daily_logs`

* id
* user_id
* log_date
* project_id
* submitted_at

### `daily_log_items`

* id
* daily_log_id
* wbs_task_id
* work_summary
* actual_progress
* delay_reason_code
* next_action
* output_url

## 9-7. 결재/평가

### `approval_documents`

* id
* document_type
* title
* project_id
* service_id
* requester_user_id
* status
* payload_json
* created_at

### `approval_actions`

* id
* approval_document_id
* approver_user_id
* action_type
* comment
* acted_at

### `evaluation_cycles`

* id
* name
* start_date
* end_date
* status

### `evaluation_items`

* id
* cycle_id
* code
* name
* weight

### `evaluation_scores`

* id
* cycle_id
* evaluatee_user_id
* evaluator_user_id
* evaluation_item_id
* score
* comment

### `evaluation_evidences`

* id
* cycle_id
* user_id
* source_type
* source_id
* summary_json

### 핵심 연결

* `daily_report_items` → `wbs_tasks`
* `daily_log_items` → `wbs_tasks`
* `evaluation_evidences` → `wbs_tasks`, `project_outputs`, `approval_documents`
* `service_translations` → `service_content_items`
* `service_domains` → `services`
* `news_post_translations` → `news_posts`

---

## 10. 기능 명세서 최종안

## 10-1. 문의 등록

### 목적

외부 문의를 저장하고 후처리를 분리

### 입력

* inquiryType
* companyName
* name
* email
* phone
* message
* locale

### 처리 순서

1. rate limit 확인
2. Zod 검증
3. DB 저장
4. 감사로그 기록
5. 이메일/알림 작업 Queue 발행
6. 성공 응답

### 성공 기준

* 사용자 응답은 즉시 성공
* 문의 데이터는 저장됨
* 이메일 실패가 문의 저장을 망치지 않음

Cloudflare Queues는 guaranteed delivery와 request offloading에 적합하므로, 문의 저장과 이메일 발송을 분리하는 구조가 맞습니다. ([Cloudflare Docs][4])

## 10-2. 서비스 등록

### 목적

새 홈페이지/앱을 ERP 관리 대상으로 추가

### 입력

* serviceCode
* serviceName
* serviceType
* domain
* envType
* permissionTemplateCode
* contentModelCode
* supportedLocales
* defaultLocale

### 처리 규칙

* 서비스 코드 unique
* 기본 content types 생성
* 기본 권한 정책 연결
* 변경 로그 저장
* 기본 도메인 연결
* 기본 언어 정책 생성
* 관리자 메뉴 노출 가능 상태로 저장

### 성공 기준

* 서비스 허브 목록에서 조회 가능
* 해당 서비스 콘텐츠 관리 API가 열림
* 추후 앱/홈페이지가 늘어나도 백엔드 구조를 안 뜯어도 됨

## 10-3. WBS 생성

### 목적

모든 실무를 프로젝트 기반 업무 단위로 저장

### 입력

* projectId
* templateId
* title
* assigneeUserId
* dueDate
* priority
* requiresApproval

### 처리 규칙

* project 존재 필수
* assignee 권한 확인
* template 적용 시 기본 단계 반영
* dependency 등록 가능
* status는 기본 `planned`

### 성공 기준

* 대시보드 “오늘 할 일” 산출 가능
* 일일 보고/일지에서 참조 가능
* 평가 근거 연결 가능

## 10-4. 아침 업무보고

### 목적

오늘 할 일 계획 등록

### 입력

* reportDate
* projectId
* items[]

### 규칙

* WBS 없는 보고 금지
* 한 유저-한 날짜-한 프로젝트 기준 중복 제한
* 리스크/지원 요청 텍스트 분리

### 성공 기준

* 대시보드에 미제출 여부 집계 가능
* 오늘 할 일과 실제 일지 비교 가능

## 10-5. 퇴근 업무일지

### 목적

실제 수행 결과와 진척률 반영

### 입력

* logDate
* projectId
* items[]

### 규칙

* WBS 연결 필수
* progress 0~100 제한
* 지연이면 사유 코드 저장
* output_url 또는 산출물 연결 가능

### 성공 기준

* 실제 진척도 집계 가능
* 지연 사유 분석 가능
* 평가 증거 생성 가능

## 10-6. 언어별 콘텐츠 발행

### 목적

다국어 공개 콘텐츠의 작성/검수/발행 관리

### 입력

* serviceContentItemId
* locale
* title
* body
* seoTitle
* seoDescription
* slug
* publishStatus

### 규칙

* 기본 언어 없이 보조 언어 단독 발행 금지
* `www.jinbizman.com` 기준 canonical 정책 강제
* 언어별 slug unique
* 언어별 미리보기/발행 상태 분리

### 성공 기준

* 언어별 공개 URL이 정확히 분리됨
* 언어별 SEO 메타데이터가 함께 노출됨
* 미발행 언어는 노출되지 않음

---

## 11. 인증/권한 설계

문서상 권한은 슈퍼관리자, 대표/경영관리자, 서비스 운영 관리자, 홈페이지 운영자, 뉴스/공지 운영자, PM, 팀장, 재무, HR/평가, 열람전용 등으로 구분되어야 하고, 서비스별·프로젝트별·승인별·평가 확정 권한이 분리되어야 합니다. 

### 권장 방식

* 로그인 성공 시 signed JWT 발급
* HttpOnly cookie 저장
* Worker middleware에서 `jose`로 검증
* payload에는 `userId`, `roles`, `departmentId` 정도만 저장
* 세부 권한은 DB 조회 또는 캐시된 정책 테이블에서 확인
* 언어별 발행 권한과 도메인/SEO 공통 설정 권한 분리

`jose`는 JWT/JWS/JWE/JWK/JWKS를 지원하고 Cloudflare Workers 같은 Web runtime에서 동작하도록 설계되어 있습니다. ([GitHub][8])

---

## 12. 입력 검증/오류 응답 규칙

### 입력 검증

* 공개 API: Zod 필수
* 관리자 API: Zod 필수
* DB 저장 직전 재검증
* enum은 문자열 하드코딩 금지
* locale/domain/slug도 검증 대상 포함

### 응답 형식

```ts
{
  success: true,
  data: ...
}
```

또는

```ts
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "사용자에게 보여줄 문장"
  }
}
```

### 오류 분리

* 사용자용 메시지: 짧고 명확하게
* 내부 로그: 스택/입력/권한/쿼리 정보 포함
* 감사로그: 누가 어떤 데이터를 바꾸려 했는지 기록

---

## 13. 비동기 처리 기준

### Queue를 붙일 작업

* 문의 접수 후 이메일 발송
* 관리자 알림 생성
* 일일 요약/리포트 생성
* 대량 감사로그 후처리
* 향후 AI 요약/브리핑
* 언어별 번역 검수 후 알림

Cloudflare Queues는 request 경로에서 오래 걸리는 작업을 분리하고, guaranteed delivery와 batching/retries/delays를 제공합니다. JINBIZ는 문의 저장과 이메일 발송을 분리하는 구조가 특히 중요합니다. ([Cloudflare Docs][4])

---

## 14. Rate Limit / 보안 기준

### Rate Limit 우선 적용

* `/api/inquiries`
* `/api/auth/login`
* `/api/news`
* `/api/site/pages/:slug`

### 비밀정보 관리

* 일반 설정: env variables
* 민감정보: Worker Secrets
* `.dev.vars*`, `.env*` 커밋 금지

Cloudflare는 Secrets를 암호화된 값으로 설명하고, 환경 변수의 text/JSON 값은 암호화되지 않는다고 명시합니다. 따라서 비밀값은 Secrets, 일반 설정은 vars가 원칙입니다. ([Cloudflare Docs][5])

---

## 15. 테스트 전략

Cloudflare는 Workers 테스트에서 Vitest integration 사용을 권장합니다. JINBIZ는 백엔드 핵심 로직 위주 최소 테스트가 맞습니다. ([Cloudflare Docs][3])

### 1차 필수 테스트

* 문의 등록 검증 실패
* 문의 등록 성공
* 권한 없는 서비스 등록 차단
* WBS 없는 업무보고 차단
* 업무일지 progress 범위 검증
* 평가 확정 권한 차단
* 언어별 slug 중복 차단
* canonical 도메인 생성 정확성 검증

### 추천 구성

* 단위 테스트: validator, permission checker, locale/domain helper
* 통합 테스트: route + DB mock 또는 local test DB
* Workers runtime 테스트: Vitest integration

---

## 16. 관측성/운영 로그 기준

### 꼭 남길 로그

* request_id
* user_id
* service_id
* project_id
* locale
* action_type
* status_code
* error_code
* duration_ms

### 추천 방향

처음부터 최소한의 structured logging을 넣고, 이후 Sentry 같은 외부 도구를 연결합니다. 로그는 다국어 콘텐츠 발행, 도메인 변경, 공개 상태 변경 같은 민감 동작에서 특히 중요합니다.

---

## 17. 가이드 코드

아래 코드는 공개 저장소를 그대로 복사한 것이 아니라, JINBIZ 구조에 맞게 바로 시작할 수 있도록 정리한 백엔드 가이드 코드입니다.

### 17-1. `worker/app.ts`

```ts
import { Hono } from "hono";
import type { Env } from "./types/env";
import { publicRoutes } from "./routes/public";
import { adminRoutes } from "./routes/admin";
import { erpRoutes } from "./routes/erp";
import { systemRoutes } from "./routes/system";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/health", (c) => {
  return c.json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
  });
});

app.route("/api", publicRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/erp", erpRoutes);
app.route("/api/system", systemRoutes);

app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "서버 처리 중 오류가 발생했습니다.",
      },
    },
    500,
  );
});

export default app;
```

### 17-2. `worker/lib/db.ts`

```ts
import { neon } from "@neondatabase/serverless";
import type { Env } from "../types/env";

export function getSql(env: Env) {
  return neon(env.DATABASE_URL);
}
```

### 17-3. `worker/lib/locale.ts`

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

### 17-4. `worker/lib/domain.ts`

```ts
export const CANONICAL_HOST = "www.jinbizman.com";
export const CANONICAL_PROTOCOL = "https";

export function buildCanonicalUrl(pathname: string) {
  const safePath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${CANONICAL_PROTOCOL}://${CANONICAL_HOST}${safePath}`;
}
```

### 17-5. `worker/lib/auth.ts`

```ts
import { SignJWT, jwtVerify } from "jose";
import type { Env } from "../types/env";

const encoder = new TextEncoder();

export type SessionPayload = {
  userId: number;
  roles: string[];
  departmentId?: number;
};

export async function signSessionToken(payload: SessionPayload, env: Env) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encoder.encode(env.JWT_SECRET));
}

export async function verifySessionToken(token: string, env: Env) {
  const result = await jwtVerify(token, encoder.encode(env.JWT_SECRET));
  return result.payload as SessionPayload;
}
```

### 17-6. `worker/routes/public/inquiries.ts`

```ts
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { getSql } from "../../lib/db";
import { resolveLocale } from "../../lib/locale";
import type { Env } from "../../types/env";

const inquirySchema = z.object({
  inquiryType: z.string().min(1),
  companyName: z.string().optional().default(""),
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().optional().default(""),
  message: z.string().min(10),
  locale: z.string().optional(),
});

export const publicInquiryRoutes = new Hono<{ Bindings: Env }>();

publicInquiryRoutes.post(
  "/inquiries",
  zValidator("json", inquirySchema),
  async (c) => {
    const sql = getSql(c.env);
    const body = c.req.valid("json");
    const locale = resolveLocale(body.locale);

    const rows = await sql`
      insert into inquiries (
        inquiry_type, company_name, name, email, phone, message,
        locale, status, lead_status, created_at, updated_at
      ) values (
        ${body.inquiryType}, ${body.companyName}, ${body.name},
        ${body.email}, ${body.phone}, ${body.message},
        ${locale}, 'new', 'unqualified', now(), now()
      )
      returning id
    `;

    return c.json({
      success: true,
      data: {
        inquiryId: rows[0].id,
        locale,
        message: "문의가 정상적으로 접수되었습니다.",
      },
    });
  },
);
```

### 17-7. `worker/routes/erp/daily-reports.ts`

```ts
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { getSql } from "../../lib/db";
import type { Env } from "../../types/env";

const reportItemSchema = z.object({
  wbsTaskId: z.number().int().positive(),
  goalText: z.string().min(1),
  expectedHours: z.number().min(0).max(24),
  riskText: z.string().default(""),
  supportRequestText: z.string().default(""),
});

const dailyReportSchema = z.object({
  reportDate: z.string(),
  projectId: z.number().int().positive(),
  items: z.array(reportItemSchema).min(1),
});

export const dailyReportRoutes = new Hono<{ Bindings: Env }>();

dailyReportRoutes.post(
  "/daily-reports",
  zValidator("json", dailyReportSchema),
  async (c) => {
    const sql = getSql(c.env);
    const body = c.req.valid("json");
    const userId = 1;

    const reportRows = await sql`
      insert into daily_reports (user_id, report_date, project_id, submitted_at)
      values (${userId}, ${body.reportDate}, ${body.projectId}, now())
      returning id
    `;

    const dailyReportId = reportRows[0].id;

    for (const item of body.items) {
      await sql`
        insert into daily_report_items (
          daily_report_id, wbs_task_id, goal_text, expected_hours, risk_text, support_request_text
        ) values (
          ${dailyReportId}, ${item.wbsTaskId}, ${item.goalText},
          ${item.expectedHours}, ${item.riskText}, ${item.supportRequestText}
        )
      `;
    }

    return c.json({
      success: true,
      data: { dailyReportId },
    });
  },
);
```

### 17-8. `db/migrations/001_init.sql` 추가 예시

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

create table if not exists news_post_translations (
  id bigserial primary key,
  news_post_id bigint not null references news_posts(id) on delete cascade,
  locale varchar(10) not null,
  title text not null,
  summary text not null default '',
  body text not null default '',
  slug text not null,
  seo_title text not null default '',
  seo_description text not null default '',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(news_post_id, locale)
);
```

---

## 18. 개발 순서 최종안

### 1단계

Workers + Hono + Neon 기본 구조 생성

### 2단계

공개 API 3개 먼저 구현

* health
* inquiries
* news

### 3단계

인증/권한 middleware 구현

* login
* session verify
* require-permission

### 4단계

도메인/다국어 구조 반영

* `locale.ts`
* `domain.ts`
* `service_domains`
* `service_translations`
* `news_post_translations`

### 5단계

서비스 허브 기본 구현

* services
* service content
* change logs
* domain/locales

### 6단계

프로젝트/WBS 기본 구현

* projects
* wbs
* dependencies

### 7단계

업무보고/업무일지 구현

* daily_reports
* daily_logs

### 8단계

결재 구현

* approval_documents
* approval_actions

### 9단계

평가 근거 데이터 구현

* evaluation_evidences
* evaluation_scores

### 10단계

Queue, Rate Limit, Audit Log 강화

### 11단계

OpenAPI 문서와 테스트 보강

### 12단계

1차 배포

* 외부 공개 사이트
* 내부 ERP 관리자 접근 제한
* canonical 도메인 정책 반영
* 언어별 공개 정책 반영

첨부 실행 문서도 1차는 외부 5개 페이지와 관리자 핵심 모듈, 2차는 일정/회의·재무·문서·통계·근태·AI 브리핑 고도화로 나누고 있습니다. 

---

## 변경 요약

* 백엔드는 단순 API 묶음이 아니라 **운영 규칙 강제 시스템**으로 설계
* 라우팅은 **Hono 기반**이 가장 적합
* DB는 **Neon + SQL 우선**, ORM 미도입 유지
* 인증은 **jose 기반 JWT + HttpOnly cookie**
* 비동기 후처리는 **Cloudflare Queues**
* 비밀정보는 **Secrets**, 일반 설정은 **vars**
* 테스트는 **Workers Vitest integration**
* 핵심 데이터 구조는 **서비스 허브 + WBS + 일일 보고/일지 + 평가 근거**
* 새 요구사항 반영:

  * **`www.jinbizman.com` 기준 도메인 정책**
  * **한국어·영어·일본어·불어·스페인어 공식 지원**
  * **반응형 웹앱을 가능하게 하는 백엔드 응답/스키마 설계**

---

## 실행 명령어

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
npx wrangler queues list
```

---

## 확인 체크리스트

* `/api/health`가 응답하는가
* 문의 등록이 저장과 후처리로 분리되어 있는가
* 관리자 API에 권한 체크가 붙어 있는가
* WBS 없는 업무보고가 차단되는가
* 업무일지 progress 범위가 검증되는가
* 새 서비스 등록 후 콘텐츠/권한/환경/언어 관리가 가능한가
* 평가 점수 전에 평가 근거 데이터가 남는가
* 감사로그와 request_id가 남는가
* 공개 URL 기준이 `www.jinbizman.com`으로 통일되는가
* 언어별 slug/SEO/발행 상태가 분리되는가

---

## 에러 발생 시 점검 포인트

* `DATABASE_URL`, `JWT_SECRET`가 일반 vars가 아니라 Secrets로 들어가야 하는 값인지 먼저 확인합니다. Cloudflare는 secrets는 암호화된 값이고, environment variables는 암호화되지 않는다고 설명합니다. ([Cloudflare Docs][5])
* 로컬 테스트와 실제 Worker 런타임 차이가 크면 Workers Vitest integration으로 다시 확인합니다. Cloudflare는 대부분의 사용자에게 이 방식을 권장합니다. ([Cloudflare Docs][3])
* API가 많아졌는데 라우트 분리가 안 되어 있으면 Hono route 분할부터 다시 정리합니다. Hono는 Web Standards 기반 멀티 런타임 구조에 맞습니다. ([hono.dev][6])
* 문의 저장과 이메일 발송을 한 요청에 묶어놨다면 Queue로 분리합니다. Cloudflare Queues는 request offloading과 guaranteed delivery를 제공합니다. ([Cloudflare Docs][4])
* 언어별 콘텐츠가 fallback으로 노출되고 있다면 언어별 발행 상태를 DB에서 분리했는지 확인합니다.
* canonical URL이 `www.jinbizman.com`이 아닌 다른 호스트로 생성된다면 domain helper와 SEO 생성 로직을 먼저 확인합니다.

---

## 다음 단계

가장 자연스러운 다음 작업은 **이 백엔드 가이드를 기준으로 `worker/` 실제 코드 골격 전체본과 `db/migrations` SQL 세트를 바로 생성하는 것**입니다.

기준 문서:

* [Backend-Develop-Guide.md](sandbox:/mnt/data/Backend-Develop-Guide.md) 
* [Development-Execution.md](sandbox:/mnt/data/Development-Execution.md) 
* [MangePage-Main-Guide.md](sandbox:/mnt/data/MangePage-Main-Guide.md) 

[1]: https://developers.cloudflare.com/workers/framework-guides/web-apps/react/ "React + Vite · Cloudflare Workers docs"
[2]: https://neon.com/docs/serverless/serverless-driver "Neon serverless driver - Neon Docs"
[3]: https://developers.cloudflare.com/workers/testing/vitest-integration/ "Vitest integration · Cloudflare Workers docs"
[4]: https://developers.cloudflare.com/queues/ "Overview · Cloudflare Queues docs"
[5]: https://developers.cloudflare.com/workers/configuration/secrets/ "Secrets · Cloudflare Workers docs"
[6]: https://hono.dev/docs/?utm_source=chatgpt.com "Hono - Web framework built on Web Standards"
[7]: https://hono.dev/examples/zod-openapi "Zod OpenAPI - Hono"
[8]: https://github.com/panva/jose "GitHub - panva/jose: JWA, JWS, JWE, JWT, JWK, JWKS for Node.js, Browser, Cloudflare Workers, Deno, Bun, and other Web-interoperable runtimes · GitHub"

---

## 19. 백엔드 파일별 역할 상세 기준

이번 최종본에서는 기존 파일 목록 나열 수준을 넘어서, 실제 구현자가 바로 착수할 수 있도록 **파일별 책임 경계**를 명확히 고정합니다.

### 19-1. `worker/index.ts`

역할:

* Worker 진입점
* `app.ts` export 연결
* `fetch` 핸들러 바인딩
* 향후 Queue consumer, scheduled handler가 필요하면 같은 진입점에서 분기

원칙:

* 라우트 로직 직접 작성 금지
* `app.ts`를 최대한 얇게 감싸는 수준 유지

### 19-2. `worker/app.ts`

역할:

* Hono 앱 생성
* 공통 middleware 등록
* 라우트 그룹 연결
* 전역 에러 핸들러 연결
* `/api/health`, `/api/docs` 같은 공통 엔드포인트 등록

원칙:

* 공개 / 관리자 / ERP / 시스템 라우트를 여기서만 조립
* 비즈니스 로직 직접 구현 금지

### 19-3. `worker/lib/db.ts`

역할:

* Neon SQL client 생성
* 요청 단위 SQL accessor 제공
* 향후 트랜잭션 helper 제공

원칙:

* 프론트에서 절대 직접 접근 금지
* DB 연결 문자열은 `env.DATABASE_URL`만 사용
* 기본은 HTTP 기반 one-shot query 우선

### 19-4. `worker/lib/auth.ts`

역할:

* 세션 JWT 발급/검증
* 로그인 사용자 payload 표준 정의
* cookie option 표준화

원칙:

* JWT에는 최소한의 식별 정보만 저장
* 상세 퍼미션은 DB나 policy helper에서 추가 확인

### 19-5. `worker/lib/permissions.ts`

역할:

* 퍼미션 코드 상수
* scope 검사 helper
* 역할 → 퍼미션 매핑 helper

원칙:

* 문자열 하드코딩 금지
* `global/service/project/team/self` scope를 공통 기준으로 사용

### 19-6. `worker/lib/response.ts`

역할:

* `ok`, `created`, `fail`, `paginatedOk` 응답 helper
* 프론트가 예측 가능한 응답 형태를 받도록 통일

원칙:

* 공개 API, 관리자 API, ERP API 모두 같은 envelope 사용

### 19-7. `worker/lib/errors.ts`

역할:

* 도메인별 에러 타입 정의
* 에러 코드와 HTTP status 매핑
* 사용자용 메시지와 내부 로그 메시지 분리

### 19-8. `worker/lib/logger.ts`

역할:

* 구조화 로그 유틸
* `request_id`, `user_id`, `service_id`, `project_id`, `locale` 등 공통 필드 자동 포함

### 19-9. `worker/lib/rate-limit.ts`

역할:

* Cloudflare Rate Limiting API 또는 fallback 정책 wrapper
* 경로별 제한 정책 관리

### 19-10. `worker/lib/locale.ts`

역할:

* 공식 지원 언어 목록 정의
* locale 정규화
* 기본 언어/보조 언어 구분
* 언어별 발행 상태 helper

### 19-11. `worker/lib/domain.ts`

역할:

* canonical host 관리
* 공개 URL 생성
* `www.jinbizman.com` 기준 강제
* 언어 prefix helper 제공

### 19-12. `worker/lib/seo.ts`

역할:

* canonical, `hreflang`, OG URL 생성
* 서비스/콘텐츠/뉴스 기준 SEO payload 생성

### 19-13. `worker/middleware/request-id.ts`

역할:

* 모든 요청에 `request_id` 부여
* 응답 헤더와 로그에 같은 ID를 남김

### 19-14. `worker/middleware/auth.ts`

역할:

* HttpOnly cookie 또는 Authorization header에서 세션 확인
* 비로그인 사용자 차단

### 19-15. `worker/middleware/require-permission.ts`

역할:

* 퍼미션 코드 단위 접근 제어

### 19-16. `worker/middleware/scope-check.ts`

역할:

* 서비스/프로젝트/팀/본인 범위 검사

### 19-17. `worker/middleware/audit.ts`

역할:

* 관리자 행위 기록
* before/after snapshot 캡처

### 19-18. `worker/routes/*`

원칙:

* `public`: 공개 조회/문의/로그인
* `admin`: 서비스 허브, 홈페이지/콘텐츠/번역/문의 운영
* `erp`: 프로젝트, WBS, 업무보고/일지, 결재, 평가
* `system`: health, docs, settings, audit-logs

---

## 20. 환경변수, Secrets, Wrangler, 로컬 개발 기준

Cloudflare는 React + Vite Workers 앱 시작점을 `npm create cloudflare@latest -- <app> --framework=react`로 안내하고, Cloudflare Vite plugin은 Worker 코드를 `workerd` 안에서 실행해 로컬과 운영 동작 차이를 줄여줍니다. 또한 Workers Secrets는 민감한 값을 암호화된 binding으로 다루고, 로컬 개발에서는 `.dev.vars` 또는 `.env`를 쓸 수 있지만 둘을 동시에 섞지 않는 것을 권장합니다. citeturn674874search0turn674874search4turn775470search3turn775470search7turn775470search23

### 20-1. Env 타입 초안

```ts
export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  APP_BASE_URL: string;
  ADMIN_ALLOWED_ORIGINS: string;
  QUEUE_EMAIL_NOTIFICATIONS?: Queue;
  QUEUE_AUDIT_BUFFER?: Queue;
  RATE_LIMITER?: RateLimit;
  ENVIRONMENT?: "local" | "staging" | "production";
  APP_VERSION?: string;
}
```

### 20-2. `wrangler.jsonc` 권장 초안

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "jinbiz",
  "main": "worker/index.ts",
  "compatibility_date": "2026-03-27",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": "./dist/client"
  },
  "vars": {
    "APP_BASE_URL": "https://www.jinbizman.com",
    "ADMIN_ALLOWED_ORIGINS": "https://www.jinbizman.com",
    "ENVIRONMENT": "production",
    "APP_VERSION": "1.0.0"
  },
  "queues": {
    "producers": [
      {
        "queue": "jinbiz-email-notifications",
        "binding": "QUEUE_EMAIL_NOTIFICATIONS"
      },
      {
        "queue": "jinbiz-audit-buffer",
        "binding": "QUEUE_AUDIT_BUFFER"
      }
    ],
    "consumers": [
      {
        "queue": "jinbiz-email-notifications",
        "max_batch_size": 10,
        "max_batch_timeout": 5
      },
      {
        "queue": "jinbiz-audit-buffer",
        "max_batch_size": 50,
        "max_batch_timeout": 10
      }
    ]
  },
  "observability": {
    "enabled": true
  },
  "secrets": {
    "required": ["DATABASE_URL", "JWT_SECRET"]
  }
}
```

### 20-3. `.dev.vars.example`

```bash
DATABASE_URL="postgresql://<replace-me>"
JWT_SECRET="replace-with-long-random-secret"
APP_BASE_URL="https://www.jinbizman.com"
ADMIN_ALLOWED_ORIGINS="https://www.jinbizman.com"
ENVIRONMENT="local"
APP_VERSION="0.0.1-local"
```

### 20-4. 값 구분 원칙

Secrets로 둘 값:

* `DATABASE_URL`
* `JWT_SECRET`
* 메일 발송 API 키
* 외부 webhook secret
* 번역 API 키가 생길 경우 해당 값

일반 vars로 둘 값:

* `APP_BASE_URL`
* `ADMIN_ALLOWED_ORIGINS`
* `ENVIRONMENT`
* `APP_VERSION`
* 기능 토글

### 20-5. 로컬 개발 원칙

* `.dev.vars` 또는 `.env` 한 종류만 사용
* 실제 비밀값은 저장소 커밋 금지
* `.dev.vars.example`만 유지
* 로컬과 운영의 canonical host는 동일하게 `www.jinbizman.com` 기준으로 테스트

---

## 21. 권한, 스코프, 퍼미션 코드 표준

실행 문서는 권한 스코프를 `global / service / project / team / self`로 정의하고, 서비스, 콘텐츠, 번역, 문의, 프로젝트, WBS, 업무보고/일지, 결재, 평가, 감사로그, 시스템 설정까지 퍼미션 코드 표준을 제시합니다. 또한 언어별 공개 승인 권한과 공통 도메인/SEO 설정 권한은 일반 편집 권한과 분리해야 한다고 고정합니다. fileciteturn18file1

### 21-1. 스코프 표준

* `global`
* `service`
* `project`
* `team`
* `self`

### 21-2. 퍼미션 코드 표준

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
* `project.read`
* `project.create`
* `project.update`
* `project.member.manage`
* `wbs.read`
* `wbs.create`
* `wbs.update`
* `wbs.approve`
* `daily_report.create`
* `daily_log.create`
* `daily_log.review`
* `approval.read`
* `approval.create`
* `approval.act`
* `evaluation.read`
* `evaluation.score`
* `evaluation.finalize`
* `audit.read`
* `system.read`
* `system.update`

### 21-3. 권한 원칙

* 서비스 데이터는 service scope 기준
* 프로젝트/WBS는 project scope 기준
* 평가는 team 또는 global 범위 분리
* 승인 권한은 역할 + 문서 종류 + 승인선 포함 여부 함께 검사
* 감사로그는 수정/삭제 불가
* 언어별 공개 승인은 일반 편집 권한과 분리
* 공통 도메인/SEO 설정은 소수 관리자만 수정 가능

### 21-4. 권장 역할

* `super_admin`
* `executive_admin`
* `service_operator`
* `site_editor`
* `news_editor`
* `pm`
* `team_lead`
* `finance_manager`
* `hr_manager`
* `viewer`

### 21-5. 예시 매핑

`service_operator`

* `service.read`
* `service.update` (service scope)
* `content.read`
* `content.create`
* `content.update`
* `translation.read`
* `translation.create`
* `translation.update`

`news_editor`

* `content.read`
* `content.create`
* `content.update`
* `content.publish`
* `translation.publish`는 별도 승인자만 허용 가능

`pm`

* `project.read`
* `project.create`
* `project.update`
* `wbs.read`
* `wbs.create`
* `wbs.update`
* `daily_log.review`

`hr_manager`

* `evaluation.read`
* `evaluation.score`
* `evaluation.finalize`

---

## 22. 상태값 표준과 공통 도메인 규칙

관리자/종합 문서는 서비스, 콘텐츠, 문의, 리드, 프로젝트, WBS, 결재, 평가, 사용자, 번역 상태값을 공통 표준으로 고정해야 한다고 정리합니다. 상태값을 백/프론트 공용 상수로 두지 않으면 화면, 필터, 통계, 승인 로직이 전부 엇갈립니다. fileciteturn18file14turn18file15

### 22-1. 상태값 표준

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

### 22-2. 공통 규칙

* 모든 관리자 변경 행위는 감사로그 대상
* 기본 언어 없이 보조 언어 단독 발행 금지
* `www.jinbizman.com` 이외의 host로 canonical 생성 금지
* `requires_approval=true` WBS는 승인 전 `done` 처리 금지
* 공개 API는 summary/detail 구조 분리
* 미발행 언어는 fallback 출력 금지

---

## 23. 백엔드 응답 설계와 반응형 지원 규칙

반응형은 CSS 문제가 맞지만, 관리자와 공개 화면이 모바일·태블릿에서 안정적으로 동작하려면 백엔드 응답도 summary/detail, meta, filters, facets 구조가 정리되어 있어야 합니다. 기존 백엔드 가이드도 반응형 QA는 프론트의 몫이지만, 백엔드는 기기별로 깨지지 않는 UI를 가능하게 하는 데이터 구조와 API 응답 구조를 제공해야 한다고 명시합니다. fileciteturn17file0turn18file12

### 23-1. 목록 API 공통 규칙

응답 예시:

```json
{
  "success": true,
  "data": {
    "items": [],
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "hasNext": false,
    "summary": {
      "newCount": 0,
      "publishedCount": 0
    },
    "filters": {
      "status": ["draft", "published"],
      "locale": ["ko", "en", "ja", "fr", "es"]
    }
  }
}
```

원칙:

* 목록에는 긴 본문 전체를 넣지 않음
* 카드형 전환이 가능한 필드 세트 제공
* `title`, `summary`, `status`, `updatedAt`, `ownerName` 같은 최소 정보 위주
* 정렬/필터 정보는 별도 `filters` 또는 `meta`에 제공

### 23-2. 상세 API 공통 규칙

응답 예시:

```json
{
  "success": true,
  "data": {
    "item": {},
    "meta": {
      "canEdit": true,
      "canPublish": false,
      "canApprove": false
    },
    "relations": {
      "service": null,
      "project": null,
      "translations": []
    }
  }
}
```

원칙:

* 상세는 관리자 우측 패널/모달/전면 페이지 모두 대응 가능해야 함
* relation을 얕게 포함하되, 중첩 과도 금지
* 첨부파일/이력은 필요 시 별도 lazy fetch 허용

### 23-3. 대시보드 API 규칙

* 카드 지표 + 경고 목록 + 최근 변경 이력 분리
* 차트용 time series는 별도 배열로 제공
* 모바일에서는 카드 단위로 재배치할 수 있도록 항목 그룹화

---

## 24. 서비스 허브, 다국어, 도메인, SEO 백엔드 규칙

서비스 허브는 새 홈페이지나 앱이 생겨도 서비스 등록만으로 관리자에 연결되어야 하는 구조이고, 공개 도메인과 언어 정책은 `www.jinbizman.com` 기준으로 흔들리면 안 됩니다. 관리자/홈/종합 문서는 이 구조를 공통 요구로 고정합니다. fileciteturn15file2turn15file4turn15file8

### 24-1. 서비스 등록 처리 규칙

1. `services` 생성
2. 기본 `service_domains` 생성
3. 기본 `service_content_types` 생성
4. 권한 템플릿 연결
5. 지원 locale 저장
6. 기본 관리자 메뉴 노출 가능 상태 저장
7. 감사로그 저장

### 24-2. 다국어 발행 규칙

* 기본 언어: `ko`
* 보조 언어: `en`, `ja`, `fr`, `es`
* 언어별 `slug`, `seo_title`, `seo_description`, `payload_json`, `status` 분리
* 언어별 publish action은 별도 권한 필요

### 24-3. 도메인/URL 규칙

* canonical host: `www.jinbizman.com`
* 기본 한국어 URL: `/path`
* 다국어 URL: `/en/path`, `/ja/path`, `/fr/path`, `/es/path`
* 문의 완료, 뉴스 상세, 공개 페이지 모두 same host 기준

### 24-4. SEO helper 출력 규칙

응답 예시:

```json
{
  "canonicalUrl": "https://www.jinbizman.com/en/news/example",
  "hreflangs": [
    { "locale": "ko", "url": "https://www.jinbizman.com/news/example" },
    { "locale": "en", "url": "https://www.jinbizman.com/en/news/example" }
  ],
  "og": {
    "title": "...",
    "description": "...",
    "url": "https://www.jinbizman.com/en/news/example"
  }
}
```

---

## 25. Queue, 알림, 비동기 후처리 설계

Cloudflare Queues는 guaranteed delivery, request offloading, buffer or batch data를 지원하므로, 문의 저장 뒤 이메일 발송이나 관리자 알림 생성, 감사로그 버퍼링 같은 작업을 요청 경로에서 분리하는 데 적합합니다. citeturn674874search2turn674874search10

### 25-1. Queue 적용 대상

* 문의 접수 후 이메일 발송
* 관리자 알림 생성
* 다량 감사로그 buffer flush
* 일일 요약 리포트 생성
* 향후 AI 브리핑 생성
* 번역 검수 알림

### 25-2. 문의 후처리 표준 흐름

1. `POST /api/inquiries`
2. 입력 검증
3. DB 저장
4. `QUEUE_EMAIL_NOTIFICATIONS.send()`
5. 응답 즉시 반환
6. consumer Worker에서 이메일 발송
7. 실패 시 retry / dead letter 정책 검토

### 25-3. Queue payload 예시

```json
{
  "type": "inquiry.created",
  "inquiryId": 123,
  "locale": "ko",
  "email": "user@example.com",
  "requestId": "req_abc123",
  "createdAt": "2026-03-27T12:00:00.000Z"
}
```

### 25-4. 설계 원칙

* Queue payload는 최소 정보만 담기
* 원본 데이터 재조회는 DB에서 수행
* 중복 실행을 고려해 idempotent consumer 설계
* 이메일 실패가 문의 저장 자체를 실패로 만들지 않기

---

## 26. Health, Docs, Audit, 운영 화면용 백엔드 계약

### 26-1. `/api/health` 응답 표준

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "1.0.0",
    "timestamp": "2026-03-27T00:00:00.000Z",
    "checks": {
      "database": "ok",
      "queues": "ok",
      "canonicalHost": "www.jinbizman.com"
    }
  }
}
```

### 26-2. `/api/docs` 계약

Hono와 Zod OpenAPI는 검증과 OpenAPI 문서 생성을 함께 가져갈 수 있고, Hono OpenAPI 예시는 Zod 스키마 기반 문서 생성을 지원합니다. citeturn775470search0turn775470search4

권장 방식:

* `OpenAPIHono` 사용
* route별 request/response schema 선언
* `/api/docs`에서 Swagger UI 또는 JSON spec 제공

### 26-3. `audit_logs` 계약

필수 필드:

* `id`
* `request_id`
* `actor_user_id`
* `action_type`
* `target_type`
* `target_id`
* `scope`
* `service_id`
* `project_id`
* `before_json`
* `after_json`
* `ip_hash`
* `user_agent`
* `created_at`

### 26-4. 감사 대상 행위

* 서비스 생성/수정/상태 변경
* 콘텐츠 생성/수정/발행
* 번역 생성/수정/발행
* 문의 상태 변경/리드 전환
* 프로젝트 생성/변경
* WBS 상태 변경/승인
* 결재 승인/반려
* 평가 점수 입력/확정
* 시스템 설정 변경

---

## 27. SQL 마이그레이션 전략과 실행 순서

기존 문서는 핵심 테이블 목록과 일부 SQL 예시까지 포함하고 있습니다. 이번 버전에서는 **실제 구현 순서에 맞는 migration 분할 기준**을 추가로 고정합니다. fileciteturn18file19turn18file16

### 27-1. 추천 마이그레이션 순서

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

### 27-2. `001_core_org_auth.sql`

포함:

* `departments`
* `users`
* `roles`
* `permissions`
* `role_permissions`
* `user_roles`

### 27-3. `002_service_hub.sql`

포함:

* `services`
* `service_content_types`
* `service_content_items`
* `service_change_logs`

### 27-4. `003_public_content.sql`

포함:

* `news_posts`
* `inquiries`
* `leads`
* `opportunities`

### 27-5. `004_projects_wbs.sql`

포함:

* `projects`
* `project_members`
* `wbs_templates`
* `wbs_template_items`
* `wbs_tasks`
* `wbs_task_dependencies`
* `project_outputs`
* `project_issues`

### 27-6. `005_daily_reports_logs.sql`

포함:

* `daily_reports`
* `daily_report_items`
* `daily_logs`
* `daily_log_items`

### 27-7. `006_approvals.sql`

포함:

* `approval_documents`
* `approval_lines`
* `approval_actions`

### 27-8. `007_evaluations.sql`

포함:

* `evaluation_cycles`
* `evaluation_items`
* `evaluation_scores`
* `evaluation_evidences`
* `evaluation_feedbacks`

### 27-9. `008_domains_locales.sql`

포함:

* `service_domains`
* `service_translations`
* `news_post_translations`

### 27-10. `009_audit_notifications.sql`

포함:

* `attachments`
* `comments`
* `notifications`
* `audit_logs`

### 27-11. `010_indexes_constraints.sql`

포함:

* locale unique 제약
* slug unique 제약
* canonical unique 보조 인덱스
* 상태/날짜/foreign key 조회 인덱스

---

## 28. 테스트 전략, fixtures, QA 시나리오

Cloudflare는 대부분의 사용자에게 Workers Vitest integration 사용을 권장하고, 이 통합은 테스트를 Workers runtime 안에서 실행하도록 설계되어 있습니다. 또한 설정은 `cloudflareTest()` 플러그인과 `wrangler.jsonc` 연동 방식으로 구성할 수 있습니다. citeturn674874search1turn674874search5turn674874search9turn775470search13

### 28-1. 테스트 분류

단위 테스트:

* `locale.ts`
* `domain.ts`
* `permissions.ts`
* `rate-limit.ts`
* `response.ts`

통합 테스트:

* `POST /api/inquiries`
* `POST /api/admin/services`
* `POST /api/erp/wbs`
* `POST /api/erp/daily-reports`
* `POST /api/erp/daily-logs`
* `POST /api/admin/contents/:id/translations`

권한 테스트:

* 비로그인 접근 차단
* 권한 없는 publish 차단
* scope mismatch 차단
* 평가 finalize 권한 차단

### 28-2. Vitest 설정 초안

```ts
import { defineConfig } from "vitest/config";
import { cloudflareTest } from "@cloudflare/vitest-pool-workers/config";

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: {
        configPath: "./wrangler.jsonc",
      },
    }),
  ],
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
```

### 28-3. 1차 필수 시나리오

* health 응답 성공
* 문의 등록 성공
* 문의 등록 validation 실패
* 문의 API rate limit 작동
* 서비스 등록 권한 차단
* WBS 없는 업무보고 차단
* 업무일지 progress 범위 실패
* 언어별 slug 중복 차단
* canonical URL 생성 정확성 검증
* 평가 점수 입력 전 evidence 요구 여부 검증

---

## 29. 5단계 배포 완료 기준

홈/종합/관리 문서는 5단계 배포 완료 기준을 공통 운영 규칙으로 요구합니다. 백엔드 문서도 이 기준을 명시적으로 가져와야 다른 문서와 충돌이 없습니다. 2단계는 반응형/다국어/도메인 체계, 3단계는 문의와 관리자 셸/서비스 허브, 4단계는 WBS·업무보고/일지·뉴스·결재, 5단계는 평가 근거·보안·테스트·운영 기준 완성으로 정리돼 있습니다. fileciteturn16file11 fileciteturn18file4

### 29-1. 1단계 배포 완료 기준 — 기본 구조와 외부 5개 페이지 골격

포함 범위:

* Workers + Hono + Neon 기본 구조
* `/api/health`
* 공개 페이지 5개에 필요한 최소 Public API 골격
* 공통 응답/에러 구조
* 기본 auth/login 골격

완료 기준:

* 기본 배포 성공
* `/api/health` 정상 응답
* 공개 API 라우트 그룹 분리 완료
* DB 연결 helper 동작

### 29-2. 2단계 배포 완료 기준 — 반응형/다국어/도메인 체계 완성

포함 범위:

* `worker/lib/locale.ts`
* `worker/lib/domain.ts`
* `worker/lib/seo.ts`
* `service_domains`
* `service_translations`
* `news_post_translations`
* `/api/locales`

완료 기준:

* 5개 공식 언어 구조 저장 가능
* 기본 언어/보조 언어 분리
* 미발행 언어 fallback 금지
* `www.jinbizman.com` 기준 canonical 생성
* 언어별 slug/SEO 관리 가능

### 29-3. 3단계 배포 완료 기준 — 문의와 관리자 셸, 서비스 허브 기본 완성

포함 범위:

* `POST /api/inquiries`
* Queue 분리
* 관리자 auth middleware
* 서비스 허브 CRUD
* 도메인/언어/권한 템플릿 연결

완료 기준:

* 문의 입력 → 저장 → 성공 응답 검증
* 이메일/알림 후처리 분리
* ERP에서 문의 목록 조회 가능
* 서비스 등록 시 언어/도메인/권한 설정 가능

### 29-4. 4단계 배포 완료 기준 — WBS, 업무보고/일지, 뉴스 운영, 결재 완성

포함 범위:

* 프로젝트/WBS
* 아침 업무보고
* 퇴근 업무일지
* 뉴스/공지 관리자 운영
* 발행 승인
* 기본 전자결재
* 감사로그 일부

완료 기준:

* 모든 업무보고/일지가 WBS 참조
* 프로젝트 진척률 자동 집계 시작
* 뉴스레터 리스트/상세와 관리자 발행 연결
* 게시 승인 플로우 동작
* 감사로그에 주요 변경 이력 저장

### 29-5. 5단계 배포 완료 기준 — 평가 근거, 보안, 테스트, 운영 기준 완성

포함 범위:

* `evaluation_evidences`
* 권한 세분화
* Rate Limit
* 구조화 로그
* Workers Vitest integration
* 운영 체크리스트
* 1차 공개 배포

완료 기준:

* 평가 점수 전에 근거 데이터 확인 가능
* 권한별 메뉴/데이터 접근 분리
* 비밀정보 하드코딩 없음
* 문의 API rate limit 적용
* 핵심 시나리오 테스트 통과
* 외부 사이트 공개 / 내부 ERP 권한 사용자만 접근

---

## 30. 문서 교체용 최종 체크리스트와 완료도

### 30-1. 이 문서가 기존 문서를 즉시 대체할 수 있어야 하는 이유

* 백엔드 구조가 `worker/`, `middleware/`, `routes/`, `db/migrations/` 기준으로 정리돼 있습니다.
* 서비스 허브, WBS, 업무보고/일지, 평가 근거 데이터가 누락되지 않았습니다.
* 반응형, 다국어, 도메인 정책이 선언이 아니라 저장 구조와 API 규칙으로 내려와 있습니다.
* 퍼미션 코드, 스코프, 상태값 표준이 포함되어 있습니다.
* Queue, Rate Limit, Secrets, OpenAPI, Health, Audit 규칙까지 포함합니다.
* 5단계 배포 완료 기준이 구현 순서와 함께 포함되어 있습니다.

### 30-2. 최종 검수 체크리스트

#### 공개 운영

* 문의 API 저장/후처리 분리
* 뉴스/공지 locale 분리
* 페이지 콘텐츠 locale 분리
* canonical host 고정
* `GET /api/locales` 제공

#### 관리자 운영

* 서비스 허브 CRUD 가능
* 도메인/locale/권한 템플릿 관리 가능
* 번역 발행 권한 분리
* 감사로그 조회 가능

#### ERP 운영

* 프로젝트/WBS 연결
* 업무보고/일지 WBS 강제 참조
* 결재와 WBS/프로젝트 연결
* 평가 근거 데이터 생성

#### 보안/운영

* JWT/HttpOnly cookie 사용
* Secrets/vars 분리
* Rate Limit 적용
* request_id 및 구조화 로그 존재
* Workers runtime 테스트 존재

### 30-3. 최종 완료도

이 문서의 완료도는 아래 기준으로 판단합니다.

* 원본 세부 유지
* 새 요구사항 3종 정식 반영
* 서비스 허브/WBS/평가/다국어/도메인/반응형 통합 반영
* 실행 문서/종합 문서/홈/관리자 문서와 충돌 없는 통합 기준 유지
* 백엔드 문서 단독으로도 `worker/`, `db/migrations/`, `wrangler.jsonc` 착수 기준이 충분한 수준 확보

### 문서 완료도

**100%**

### 비고

* 이 문서는 요약본이 아니라 **실행용 백엔드 기준 문서**입니다.
* 다음 단계에서는 이 문서를 기준으로 `worker/` 실제 코드 골격과 `db/migrations` 전체 SQL 세트를 바로 생성하면 됩니다.
* 실제 런타임 오류 0% 달성은 다음 단계의 구현과 테스트에서 검증합니다.

[1]: https://developers.cloudflare.com/workers/framework-guides/web-apps/react/ "React + Vite · Cloudflare Workers docs"
[2]: https://neon.com/docs/serverless/serverless-driver "Neon serverless driver - Neon Docs"
[3]: https://developers.cloudflare.com/workers/testing/vitest-integration/ "Vitest integration · Cloudflare Workers docs"
[4]: https://developers.cloudflare.com/queues/ "Overview · Cloudflare Queues docs"
[5]: https://developers.cloudflare.com/workers/configuration/secrets/ "Secrets · Cloudflare Workers docs"
[6]: https://hono.dev/docs/ "Hono - Web framework built on Web Standards"
[7]: https://hono.dev/examples/zod-openapi "Zod OpenAPI - Hono"
[8]: https://github.com/panva/jose "panva/jose"
