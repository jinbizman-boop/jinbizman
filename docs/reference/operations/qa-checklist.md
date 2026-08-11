### 이번 단계 목표

* `docs/operations/qa-checklist.md`를 **실제 검수자가 바로 체크 가능한 실행형 QA 체크리스트 최종본**으로 재작성합니다.
* 외부 홈페이지와 내부 ERP를 따로 보지 않고, **하나의 운영 체계**로 검수할 수 있게 정리합니다.
* 이번 문서는 5단계 배포 완료 기준, 다국어, canonical 도메인, 반응형, 권한, 데이터 흐름까지 함께 검수하도록 고도화합니다.

### 변경 파일

* `docs/operations/qa-checklist.md`

### 실행 명령어

```bash
npm install
npm run dev
npx wrangler dev
curl http://127.0.0.1:8787/api/health
curl http://127.0.0.1:8787/api/locales
curl "http://127.0.0.1:8787/api/news?category=press&locale=ko"
```

### 확인 방법

* 외부 사이트, 관리자 ERP, API, 권한, 데이터 흐름, 다국어, 도메인, 반응형, 배포 단계별 기준이 모두 포함되어 있는지 확인
* `문의 저장 + 알림 분리`, `WBS 없는 보고 금지`, `evidence 없는 평가 확정 금지`, `www.jinbizman.com`, `5개 언어`, `반응형 ERP`가 QA 항목으로 내려와 있는지 확인
* 배포 전, 배포 직후, 회귀 테스트까지 한 문서 안에서 바로 실행 가능한지 확인

### 문제 발생 시

* 페이지별 화면만 보면 공통 운영 규칙이 빠집니다.
* 외부/내부를 나눠서만 보면 서비스 허브·문의·뉴스·locale·canonical 같은 공통 데이터 흐름 검증이 약해집니다.
* 다국어를 단순 번역 확인으로만 보면 slug, 발행 상태, canonical, SEO 문제가 빠집니다.
* 업무보고/일지를 UI 저장 여부만 보면 WBS 연결, 지연 사유, 진척률 집계 검증이 빠집니다.

아래 내용을 그대로 `C:\Users\jinbi\Desktop\jinbizman\docs\operations\qa-checklist.md`에 넣으면 됩니다.

````md
# JINBIZ QA Checklist 최신형 완성형 최종본

## 이번 단계 목표

* 첨부 기준 문서들과 지금까지 확정된 채팅 방향을 모두 반영해 **`docs/operations/qa-checklist.md` 최신형 완성형 최종본**을 다시 정리합니다.
* 이번 문서는 `JINBIZ`의 외부 홈페이지와 내부 ERP를 함께 받치는 운영 문서 중, **개발 완료 전후에 실제로 바로 돌릴 수 있는 QA 체크리스트**만 집중적으로 다루는 실행 기준서입니다.
* 기존 확정안에 아래 3가지를 정식 요구사항으로 추가 확정합니다.

  * **PC, 모바일, 태블릿 등 모든 기기와 모든 환경에서 깨지거나 이탈되지 않는 반응형 웹앱**
  * **한국어, 영어, 일본어, 불어, 스페인어 공식 지원**
  * **대표 도메인 `www.jinbizman.com` 사용**

* 이번 최종본은 단순 테스트 아이디어 모음이 아니라 **실제 검수자가 바로 체크 가능한 항목형 QA 문서**로 작성합니다.
* `HomePage-Main-Guide`, `MangePage-Main-Guide`, `Develop-Total-Guide`, `Frontend-Develop-Guide`, `Backend-Develop-Guide`, `Development-Execution`, `incident-playbook.md`, `release-checklist.md`에 공통으로 반영된 **외부 5개 페이지 / 서비스 허브 / 뉴스·공지 / 문의 저장+알림 / 프로젝트·WBS / 업무보고·업무일지 / 결재 / 평가 근거 / 5개 언어 / canonical 도메인 / 반응형 / 5단계 배포 완료 기준**을 QA 항목으로 재조립합니다.

---

## 변경 파일

이번 단계는 문서화 단계라 실제 코드 수정은 없습니다.

다만 이 문서를 기준으로 직접 연결될 핵심 파일은 아래가 맞습니다.

* `src/pages/HomePage.tsx`
* `src/pages/CompanyPage.tsx`
* `src/pages/BusinessPage.tsx`
* `src/pages/NewsletterPage.tsx`
* `src/pages/ContactPage.tsx`
* `src/pages/admin/DashboardPage.tsx`
* `src/pages/admin/services/*`
* `src/pages/admin/site/*`
* `src/pages/admin/news/*`
* `src/pages/admin/inquiries/*`
* `src/pages/admin/wbs/*`
* `src/pages/admin/approvals/*`
* `src/pages/admin/evaluations/*`
* `src/pages/admin/system/*`
* `src/components/common/*`
* `src/components/sections/*`
* `src/components/admin/*`
* `src/lib/api.ts`
* `src/lib/navigation.ts`
* `src/lib/i18n.ts`
* `src/lib/responsive.ts`
* `src/lib/seo.ts`
* `worker/routes/public/*`
* `worker/routes/admin/*`
* `worker/routes/erp/*`
* `worker/routes/system/*`
* `worker/lib/auth.ts`
* `worker/lib/permissions.ts`
* `worker/lib/locale.ts`
* `worker/lib/domain.ts`
* `worker/lib/seo.ts`
* `worker/lib/rate-limit.ts`
* `worker/lib/logger.ts`
* `worker/middleware/*`
* `db/migrations/*`

---

## 실행 명령어

기본 확인 흐름은 아래 기준으로 둡니다.

```bash
npm install
npm run dev
npx wrangler dev
````

기능 QA 중 자주 쓰는 기본 점검 흐름은 아래를 기준으로 둡니다.

```bash
curl http://127.0.0.1:8787/api/health
curl http://127.0.0.1:8787/api/locales
curl "http://127.0.0.1:8787/api/news?category=press&locale=ko"
curl "http://127.0.0.1:8787/api/site/pages/company?locale=ko"
```

운영 배포 전후 점검 예시는 아래를 기준으로 둡니다.

```bash
curl https://www.jinbizman.com/api/health
curl https://www.jinbizman.com/api/locales
curl "https://www.jinbizman.com/api/news?category=press&locale=ko"
curl "https://www.jinbizman.com/api/site/pages/company?locale=ko"
```

관리자/ERP 점검 시 권장 확인 흐름은 아래를 기준으로 둡니다.

```bash
curl -I https://www.jinbizman.com
curl -I https://www.jinbizman.com/company
curl -I https://www.jinbizman.com/en/company
curl -I https://www.jinbizman.com/newsletter
curl -I https://www.jinbizman.com/contact
```

---

## 확인 방법

아래가 맞으면 이번 QA checklist 문서는 정상으로 봐도 됩니다.

* QA 범위가 **외부 공개 사이트 / 관리자 ERP / API / 권한 / 데이터 흐름 / 다국어 / 도메인 / SEO / 반응형 / 배포 완료 기준 / 회귀 테스트**로 구분되어 있는지
* 외부 사이트가 **AI 서비스 회사 인식 / 5개 메뉴 / 뉴스레터 3탭 / 문의 저장 구조** 기준으로 체크되도록 정리되어 있는지
* 관리자 ERP가 **서비스 허브 / WBS / 업무보고·업무일지 / 결재 / 평가 근거** 기준으로 체크되도록 정리되어 있는지
* API/백엔드 체크 항목에 `/api/health`, `/api/inquiries`, `/api/news`, `/api/site/pages/:slug`, `/api/locales`, 권한/스코프, queue 분리, request_id, audit log, rate limit이 들어 있는지
* 다국어 항목에 **5개 언어 / locale별 slug / 미발행 locale 숨김 / canonical `www.jinbizman.com` / hreflang / locale-aware SEO** 기준이 포함되어 있는지
* 반응형 항목이 단순 UI가 아니라 외부와 내부 핵심 흐름이 모바일/태블릿에서도 동작하는지 확인하도록 되어 있는지
* 5단계 배포 완료 기준이 QA 단계에도 연결되어 있는지
* 배포 전 / 배포 직후 / 회귀 테스트 기준이 포함되어 있는지
* 실패 시 바로 확인할 파일·원인·수정 포인트가 함께 적혀 있는지
* 문서 마지막 체크리스트만 봐도 기존 파일을 즉시 대체할 수 있는지 확인 가능한지

---

## 문제 발생 시

* QA 항목을 페이지별로만 보면 공통 규칙(권한, locale, canonical, WBS 연결)이 빠집니다.
* 외부 사이트와 ERP를 따로 테스트하면 서비스 허브/문의/뉴스/공개 페이지의 같은 데이터 흐름 검증이 약해집니다.
* 문의 저장과 알림을 같은 성공/실패로 체크하면 운영상 중요한 분리 원칙을 놓칩니다.
* 업무보고/업무일지를 UI 저장 여부만 보면 WBS 연결, 진척률 집계, 지연 사유 코드까지 검증하지 못합니다.
* 평가 화면 점수 입력만 보면 evidence 기반 구조가 무너집니다.
* 다국어를 문구 번역만 체크하면 locale별 slug, 발행 상태, canonical, SEO 메타 문제를 놓칩니다.
* 반응형을 데스크톱 확인만 하면 모바일/태블릿 운영 불가 문제를 놓칩니다.
* 5단계 배포 완료 기준을 QA와 연결하지 않으면 “기능은 있는데 운영 기준 미달” 상태가 생깁니다.

---

# 1. 최종 정의

이 문서에서 말하는 QA checklist의 정답은 단순한 “화면 잘 보이나요?” 수준의 체크리스트가 아닙니다.

정답은 아래입니다.

> **JINBIZ QA Checklist는 외부 회사소개형 AI 서비스 홈페이지와 내부 WBS 중심 ERP를 하나의 운영 체계로 보고, 화면·API·권한·데이터 흐름·다국어·도메인·SEO·반응형·배포 기준을 단계적으로 검수하는 실행형 체크리스트다.**

이 문서는 아래 전제를 반드시 지켜야 합니다.

* 외부 홈페이지는 **회사소개형 AI 서비스 기업 홈페이지**다.
* 내부 시스템은 **CMS가 아닌 ERP**다.
* 핵심 엔진은 **서비스 허브 + 프로젝트/WBS + 아침 업무보고 + 퇴근 업무일지 + 결재 + 평가 근거 데이터**다.
* 대표 도메인은 **`www.jinbizman.com`** 이다.
* 공식 지원 언어는 **`ko`, `en`, `ja`, `fr`, `es`** 다.
* 문의는 **이메일 알림 + 관리자 저장** 둘 다 기준이다.
* 모든 업무보고/일지는 **WBS를 참조**해야 한다.
* 평가는 점수보다 **근거 데이터가 먼저** 보여야 한다.
* 모든 화면은 **로딩 / 빈 상태 / 에러 / 권한 없음** 기본 상태를 가져야 한다.
* 외부와 내부 모두 **반응형 웹앱** 기준을 충족해야 한다.

---

# 2. QA 범위 정의

JINBIZ QA는 아래 9개 축으로 진행합니다.

1. 외부 공개 사이트 QA
2. 관리자 ERP QA
3. API / 백엔드 QA
4. 권한 / 보안 QA
5. 데이터 흐름 QA
6. 다국어 / 도메인 / SEO QA
7. 반응형 / 기기 QA
8. 배포 단계별 완료 기준 QA
9. 회귀 테스트 QA

즉, 단순 페이지 시각 확인이 아니라 **브랜드 경험 + 운영 흐름 + 백엔드 규칙 + 배포 기준**을 함께 봐야 합니다.

---

# 3. QA 수행 원칙

## 3-1. 화면과 데이터 흐름을 함께 본다

페이지가 보여도 저장/조회/승인/집계가 끊기면 실패입니다.

## 3-2. 외부와 내부를 분리하지 않는다

문의, 뉴스, 서비스 허브, locale, canonical은 외부와 내부를 같이 봐야 합니다.

## 3-3. WBS 중심 규칙을 우선 검수한다

업무보고/업무일지/평가는 WBS 연결 여부가 가장 먼저입니다.

## 3-4. 기본 상태 4가지를 항상 확인한다

모든 화면은 아래 4가지를 가집니다.

* 로딩
* 빈 상태
* 에러
* 권한 없음

## 3-5. 반응형과 다국어는 마지막이 아니라 처음부터 확인한다

모바일/태블릿과 5개 언어는 마감 직전 옵션이 아닙니다.

## 3-6. 저장 경로와 후처리 경로를 분리해서 본다

문의, 알림, 배포 후처리, 캐시 무효화, sitemap 생성, audit 후처리는 각각 따로 봐야 합니다.

## 3-7. summary / detail 구조를 분리해서 본다

목록은 summary, 상세는 detail 응답 기준으로 검증해야 하며, 목록 응답에 과도한 payload가 섞이지 않는지 확인해야 합니다.

---

# 4. 사전 준비 체크리스트

## 4-1. 환경 준비

* [ ] `npm install` 완료
* [ ] `npm run dev` 실행 가능
* [ ] `npx wrangler dev` 실행 가능
* [ ] `.dev.vars` 또는 필요한 secrets/vars 주입 완료
* [ ] `DATABASE_URL`, `JWT_SECRET`, `APP_BASE_URL`, `ADMIN_ALLOWED_ORIGINS` 확인
* [ ] `APP_BASE_URL`이 `https://www.jinbizman.com` 기준으로 설정되어 있음
* [ ] 관리자용 테스트 계정 준비
* [ ] locale 테스트용 더미 콘텐츠 준비 (`ko`, `en`, `ja`, `fr`, `es`)
* [ ] 프로젝트/WBS 테스트 데이터 준비
* [ ] 문의 테스트용 샘플 데이터 준비
* [ ] 결재 테스트용 샘플 문서 준비
* [ ] 평가 cycle / evidence 테스트 데이터 준비
* [ ] 모바일/태블릿 테스트 기기 또는 브라우저 에뮬레이션 준비

## 4-2. 기본 API 준비

* [ ] `/api/health` 응답 확인
* [ ] `/api/locales` 응답 확인
* [ ] `/api/news` 응답 확인
* [ ] `/api/site/pages/:slug` 응답 확인
* [ ] `/api/inquiries` 테스트 가능
* [ ] 관리자 로그인/세션 확인 가능
* [ ] request_id 추적 가능
* [ ] audit log 조회 가능
* [ ] queue 바인딩 또는 후처리 상태 확인 가능

## 4-3. 테스트 계정 권한 준비

* [ ] `super_admin`
* [ ] `service_admin`
* [ ] `project_pm`
* [ ] `site_editor`
* [ ] `translation_editor`
* [ ] `translation_reviewer`
* [ ] `viewer`

---

# 5. 외부 공개 사이트 QA

# 5-1. 공통 내비게이션 QA

* [ ] 헤더에 `메인 홈 / 회사소개 / 사업소개 / 뉴스레터 / 문의하기` 5개 메뉴가 모두 보임
* [ ] 메뉴 순서가 바뀌지 않음
* [ ] 문의하기 CTA가 헤더에 존재함
* [ ] LanguageSwitcher가 헤더 또는 푸터에서 접근 가능함
* [ ] 모바일에서 햄버거 메뉴로 5개 메뉴에 접근 가능함
* [ ] 현재 페이지 active 상태가 맞게 표시됨
* [ ] 페이지 전환 후 locale이 유지됨
* [ ] 푸터에 회사 정보, 법적 링크, 언어 선택기, `www.jinbizman.com` 표기가 있음
* [ ] locale 전환 후 현재 메뉴 위치가 유지됨
* [ ] 잘못된 경로에서 NotFoundPage가 정상 노출됨

# 5-2. 메인 홈 QA

* [ ] 첫 화면 3초 안에 AI 서비스 회사로 인식됨
* [ ] Hero에 메인 헤드라인, 설명, CTA가 존재함
* [ ] 핵심 메시지 3카드가 보임
* [ ] 회사소개 프리뷰가 존재함
* [ ] 사업소개 프리뷰가 존재함
* [ ] 유레카월드 강조 섹션이 존재함
* [ ] 뉴스레터 유도 섹션이 존재함
* [ ] 문의 유도 섹션이 존재함
* [ ] Hero CTA가 회사소개/사업소개로 올바르게 이동함
* [ ] 모바일에서 Hero CTA가 세로 스택으로 자연스럽게 보임
* [ ] 다국어 전환 시 헤드라인/버튼이 이탈하지 않음
* [ ] 로딩/빈 상태/에러 상태가 구조적으로 준비되어 있음

# 5-3. 회사소개 QA

* [ ] 회사 개요 섹션 존재
* [ ] 회사 정의 섹션 존재
* [ ] 비전 섹션 존재
* [ ] 핵심 가치 섹션 존재
* [ ] 연혁 섹션 존재
* [ ] 대표 인사말이 없음
* [ ] 과도한 문의 유도 섹션이 없음
* [ ] 모바일에서 연혁이 세로 타임라인 또는 자연스러운 단일 열로 보임
* [ ] 다국어 전환 시 카드 높이/문장 길이 차이로 레이아웃이 깨지지 않음

# 5-4. 사업소개 QA

* [ ] 페이지에 사업 개요가 존재함
* [ ] 사업 순서가 `AI 서비스 → 플랫폼 사업 → 기획 서비스`로 유지됨
* [ ] AI 서비스 섹션에 유레카월드 설명이 존재함
* [ ] 플랫폼 사업 섹션에 생활형/산업 혁신형 구조가 보임
* [ ] 기획 서비스가 기반 역량으로 표현됨
* [ ] 하단 CTA가 존재함
* [ ] 순서가 locale 전환 후에도 바뀌지 않음
* [ ] 모바일에서 각 사업 섹션이 1열로 자연스럽게 내려감
* [ ] 긴 영어/불어 문자열로 카드 높이가 깨지지 않음

# 5-5. 뉴스레터 QA

* [ ] 상단 탭이 `보도자료 / 공시정보 / 공지사항` 3개로 보임
* [ ] 메뉴명은 뉴스레터로 유지됨
* [ ] 리스트가 있을 때 정상 노출됨
* [ ] 콘텐츠가 없을 때 EmptyState가 노출됨
* [ ] 구독 폼이 1차 오픈 기준으로 노출되지 않음
* [ ] 상세 페이지 라우트가 동작함
* [ ] locale별 게시 상태가 올바르게 반영됨
* [ ] 미발행 locale 콘텐츠는 노출되지 않음
* [ ] 모바일에서 탭 폭/텍스트가 깨지지 않음
* [ ] 카테고리 query/path 전환 시 상태가 유지됨
* [ ] 리스트 summary와 상세 내용이 서로 일치함

# 5-6. 문의하기 QA

* [ ] 문의 페이지 헤더가 존재함
* [ ] 안내문이 존재함
* [ ] 필수 입력 필드가 모두 있음

  * [ ] 이름
  * [ ] 회사명 또는 소속
  * [ ] 이메일
  * [ ] 연락처
  * [ ] 문의 유형
  * [ ] 문의 내용
* [ ] 이름 필수 검증이 동작함
* [ ] 이메일 형식 검증이 동작함
* [ ] 문의 내용 최소 길이 검증이 동작함
* [ ] 제출 중 버튼이 비활성화됨
* [ ] 제출 성공 후 완료 메시지가 보임
* [ ] 완료 메시지가 locale별로 올바르게 보임
* [ ] 모바일에서 1열 폼으로 자연스럽게 보임
* [ ] 데스크톱에서 2열 구조가 자연스럽게 보임
* [ ] 문의 제출 후 관리자 저장이 확인됨
* [ ] 문의 제출 후 이메일 알림 후처리 경로가 분리되어 있는지 확인 가능함
* [ ] 중복 클릭/재전송 방지 흐름이 있음

---

# 6. 관리자 ERP QA

# 6-1. 관리자 공통 셸 QA

* [ ] AdminShell이 정상 렌더링됨
* [ ] SidebarNav가 존재함
* [ ] Topbar가 존재함
* [ ] Breadcrumb가 존재함
* [ ] PageHeader가 존재함
* [ ] 권한 없는 메뉴는 숨겨짐
* [ ] 권한 없는 직접 URL 접근 시 차단됨
* [ ] 로딩 / 빈 상태 / 에러 / 권한 없음 상태가 기본 제공됨
* [ ] 모바일에서 오프캔버스 사이드바가 동작함
* [ ] 태블릿에서 축소 사이드바 또는 적절한 메뉴 구조가 동작함
* [ ] LanguageSwitcher 또는 언어 관련 편집 진입 경로가 존재함

# 6-2. 대시보드 QA

* [ ] 오늘 해야 할 일 카드가 보임
* [ ] 업무보고 미제출자 카드가 보임
* [ ] 업무일지 미제출자 카드가 보임
* [ ] 지연 WBS 카드가 보임
* [ ] 승인 대기 카드가 보임
* [ ] 신규 문의 카드가 보임
* [ ] 위험 프로젝트 카드가 보임
* [ ] 카드 클릭 시 관련 상세 화면으로 이동 가능
* [ ] 수치와 상세 데이터가 일치함
* [ ] 로딩 중 skeleton 또는 적절한 placeholder가 보임

# 6-3. 서비스 허브 QA

* [ ] 전체 서비스 목록 조회 가능
* [ ] 새 서비스 등록 가능
* [ ] 서비스 상태값 관리 가능
* [ ] 도메인/환경 설정 가능
* [ ] 언어 설정 가능
* [ ] 권한 템플릿 연결 가능
* [ ] 서비스 변경 로그 확인 가능
* [ ] 새 서비스 등록 후 관리자 메뉴 연결 구조를 확인 가능
* [ ] 서비스 등록 권한 없는 계정은 접근/저장 불가
* [ ] summary 목록과 detail 화면 응답이 분리되어 동작함

# 6-4. 홈페이지 운영 QA

* [ ] 페이지 관리 화면 접근 가능
* [ ] 메인 홈 / 회사소개 / 사업소개 / 문의 페이지 관리 가능
* [ ] 공통 컴포넌트/CTA/푸터 정보 수정 가능
* [ ] SEO/OG 설정 가능
* [ ] 미디어 라이브러리 접근 가능
* [ ] 배포 이력 조회 가능
* [ ] 변경 승인 플로우 존재
* [ ] 언어별 번역 탭 또는 편집 구조 존재
* [ ] locale별 slug/SEO 입력 가능
* [ ] draft / review / published / archived 상태가 구분됨

# 6-5. 뉴스/공지 운영 QA

* [ ] 보도자료 / 공시정보 / 공지사항 카테고리 분리됨
* [ ] 글 등록 가능
* [ ] 수정 가능
* [ ] 임시저장 가능
* [ ] 발행 요청 가능
* [ ] 게시 승인 플로우 존재
* [ ] 예약 발행 구조 확인 가능
* [ ] 버전 이력 조회 가능
* [ ] 언어별 제목/본문/SEO/slug 편집 가능
* [ ] 언어별 발행 상태 분리됨
* [ ] locale별 summary/detail이 외부 사이트와 일치함

# 6-6. 문의/리드 QA

* [ ] 문의 목록 조회 가능
* [ ] 상태 변경 가능
* [ ] 담당자 배정 가능
* [ ] 내부 메모 기록 가능
* [ ] 리드 전환 가능
* [ ] 사업기회 연결 가능
* [ ] 프로젝트 전환 흐름 확인 가능
* [ ] locale별 문의 분포 확인 가능
* [ ] 문의 상세와 목록 요약 정보가 일치함
* [ ] 저장 성공/알림 실패 분리 판단이 가능함

# 6-7. 프로젝트 / WBS QA

* [ ] 프로젝트 목록 조회 가능
* [ ] 프로젝트 생성 가능
* [ ] 멤버 지정 가능
* [ ] WBS 템플릿 선택 가능
* [ ] WBS 생성 가능
* [ ] WBS 상태 변경 가능
* [ ] 우선순위/기한/담당자 수정 가능
* [ ] 의존성 등록 가능
* [ ] 산출물 연결 가능
* [ ] 이슈/리스크 연결 가능
* [ ] 진행률이 0~100 범위로 유지됨
* [ ] 프로젝트 진척률 집계가 시작됨
* [ ] 칸반/리스트/간트 중 최소 1개 뷰가 정상 동작함
* [ ] WBS 없는 프로젝트 흐름이 허용되지 않도록 설계됨
* [ ] requiresApproval=true 인 WBS의 직접 done 처리가 차단됨

# 6-8. 업무보고 / 업무일지 QA

* [ ] 아침 업무보고 화면 접근 가능
* [ ] 퇴근 업무일지 화면 접근 가능
* [ ] WBS 선택 없는 제출이 차단됨
* [ ] 날짜/프로젝트 선택 구조가 정상임
* [ ] 예상 시간 입력 검증이 동작함
* [ ] 실제 진척률 0~100 검증이 동작함
* [ ] 지연 사유 입력이 가능함
* [ ] 다음 액션 입력이 가능함
* [ ] 제출 후 대시보드 집계에 반영됨
* [ ] 미제출자 집계가 정상 동작함
* [ ] 동일 사용자/동일 날짜/동일 프로젝트 중복 정책이 의도대로 동작함

# 6-9. 전자결재 QA

* [ ] 결재 작성 가능
* [ ] 결재 대기함 조회 가능
* [ ] 결재 진행함 조회 가능
* [ ] 결재 완료함 조회 가능
* [ ] 반려함 조회 가능
* [ ] 승인/반려/수정요청 액션 가능
* [ ] 결재선이 올바르게 표시됨
* [ ] 서비스 등록 승인, 게시 승인, 일정 연장 승인 등 최소 서식 구조 확인 가능
* [ ] 승인 후 상태 반영이 정상 동작함
* [ ] 종료 문서 재액션이 차단됨

# 6-10. 평가 QA

* [ ] 평가 주기 목록 조회 가능
* [ ] 평가 항목 조회 가능
* [ ] 평가 대상자별 화면 접근 가능
* [ ] evidence 요약이 먼저 보임
* [ ] 점수 입력 가능
* [ ] 코멘트 입력 가능
* [ ] finalize 권한 없는 사용자는 확정 불가
* [ ] evidence 없는 상태에서 확정이 차단됨
* [ ] 평가 화면이 점수만 보이지 않고 근거 데이터를 함께 보여줌
* [ ] cycle 상태에 따라 입력/확정 가능 범위가 달라짐

# 6-11. 시스템 관리 / 감사로그 QA

* [ ] 시스템 설정 조회 가능
* [ ] 코드 관리/서비스 유형/WBS 스타일 등 기본 구조 접근 가능
* [ ] 이메일 템플릿/알림 정책 구조 확인 가능
* [ ] 감사로그 조회 가능
* [ ] 감사로그에 request_id, actor, action, target이 남음
* [ ] locale 설정, domain/SEO 공통 설정 화면이 존재함
* [ ] 민감한 설정은 제한된 권한만 수정 가능
* [ ] canonical host가 `www.jinbizman.com`으로 고정 유지됨

---

# 7. API / 백엔드 QA

# 7-1. 공통 API QA

* [ ] `/api/health` 응답 성공
* [ ] 응답 형식이 `{ success: true, data: ... }` 또는 `{ success: false, error: ... }`를 유지함
* [ ] request_id가 로그나 응답 헤더/내부 추적에 연결됨
* [ ] validation error 시 명확한 에러 코드 반환
* [ ] unauthorized / forbidden / not found / conflict 구분됨
* [ ] summary / detail 응답 구조가 일관됨

# 7-2. Public API QA

* [ ] `GET /api/health` 성공
* [ ] `GET /api/locales` 성공
* [ ] `GET /api/news` 성공
* [ ] `GET /api/news/:slug` 성공
* [ ] `GET /api/site/pages/:slug` 성공
* [ ] `POST /api/inquiries` 성공
* [ ] 문의 validation 실패 시 적절한 에러 반환
* [ ] 미발행 locale 콘텐츠는 공개 API에서 숨김 처리됨
* [ ] canonical / alternate URL 정보가 정책대로 노출됨

# 7-3. Admin API QA

* [ ] `GET /api/admin/services` 권한 사용자만 접근 가능
* [ ] `POST /api/admin/services` 권한 없는 사용자 차단
* [ ] `GET /api/admin/contents/:id/translations` 정상 동작
* [ ] `POST /api/admin/contents/:id/translations` 저장 가능
* [ ] `PATCH /api/admin/contents/:id/translations/:locale` 수정 가능
* [ ] `GET /api/admin/inquiries` 조회 가능
* [ ] 문의 상태 변경 API 정상 동작
* [ ] 번역 publish 권한과 일반 편집 권한이 분리됨

# 7-4. ERP API QA

* [ ] `GET /api/erp/projects` 정상 동작
* [ ] `POST /api/erp/projects` 정상 동작
* [ ] `POST /api/erp/wbs` 정상 동작
* [ ] `POST /api/erp/daily-reports` 정상 동작
* [ ] `POST /api/erp/daily-logs` 정상 동작
* [ ] `GET /api/erp/approvals` 정상 동작
* [ ] `PATCH /api/erp/approvals/:id/action` 정상 동작
* [ ] `GET /api/erp/evaluations/:cycleId` 또는 동등한 평가 조회 라우트 정상 동작
* [ ] evidence 조회와 score 입력이 분리되어 있음

# 7-5. 문의 저장 + 알림 분리 QA

* [ ] 문의 저장 성공 여부와 알림 성공 여부를 분리해 판단 가능
* [ ] 저장 성공 / 알림 실패 시 사용자 응답은 저장 성공 기준 유지
* [ ] 관리자 알림 지연 시 재처리 경로 또는 queue 상태 확인 가능
* [ ] 문의 유실 없이 후처리만 재시도 가능
* [ ] 알림 실패가 장애로 기록되더라도 저장 데이터는 유지됨

# 7-6. Rate Limit / 보안 QA

* [ ] `/api/inquiries` rate limit 동작
* [ ] `/api/auth/login` rate limit 동작
* [ ] `/api/news` / `/api/site/pages/:slug` rate limit 정책 확인
* [ ] JWT_SECRET / DATABASE_URL 등이 하드코딩되지 않음
* [ ] 민감정보는 secrets로 관리됨
* [ ] 일반 설정과 secrets 구분이 됨
* [ ] 인증 실패/권한 실패 로그가 구조화되어 남음

---

# 8. 권한 / 보안 QA

## 8-1. 로그인 / 세션 QA

* [ ] 로그인 성공 시 세션 발급
* [ ] 비로그인 상태에서 관리자 접근 차단
* [ ] 로그아웃 동작
* [ ] `/api/auth/me`로 현재 사용자 확인 가능
* [ ] HttpOnly cookie 또는 세션 저장 구조 확인 가능
* [ ] 세션 만료 시 적절한 재로그인 흐름 제공

## 8-2. 역할 / 스코프 QA

* [ ] super_admin은 전체 메뉴 접근 가능
* [ ] service_admin은 서비스 관련 메뉴 위주로 접근 가능
* [ ] project_pm은 프로젝트/WBS 관련 메뉴 접근 가능
* [ ] site_editor / news_operator는 발행 권한과 일반 편집 권한이 구분됨
* [ ] viewer는 읽기 전용
* [ ] translation_editor / translation_reviewer 권한 분리됨
* [ ] 서비스 scope / 프로젝트 scope / self scope가 적용됨
* [ ] 직접 URL 진입과 API 호출 모두에서 동일하게 차단됨

## 8-3. 감사로그 QA

* [ ] 주요 쓰기 동작에 감사로그가 남음
* [ ] actor_user_id 기록됨
* [ ] target_type / target_id 기록됨
* [ ] action_type 기록됨
* [ ] before/after 또는 요약 이력 확인 가능
* [ ] request_id와 연동 가능
* [ ] audit_logs가 append-only 원칙을 해치지 않음

---

# 9. 데이터 흐름 QA

## 9-1. 서비스 허브 → 공개 사이트 QA

* [ ] 서비스 등록 후 운영 대상 서비스가 관리자에서 식별됨
* [ ] 서비스 콘텐츠 생성 후 공개 페이지와 연결 가능
* [ ] locale/domain 설정이 공개 경로에 반영됨
* [ ] 서비스 변경 이력이 관리자에서 조회 가능함

## 9-2. 문의 → 리드 → 프로젝트 QA

* [ ] 문의 저장
* [ ] 담당자 배정
* [ ] 리드 전환
* [ ] 사업기회 생성
* [ ] 프로젝트 생성 연결
* [ ] 문의 상태가 `converted`로 반영됨

## 9-3. 프로젝트 → WBS → 업무보고/일지 QA

* [ ] 프로젝트 생성
* [ ] WBS 생성
* [ ] 아침 업무보고에서 WBS 선택
* [ ] 퇴근 업무일지에서 동일 WBS 참조
* [ ] 집계에 반영
* [ ] 대시보드 수치와 상세 목록이 일치함

## 9-4. WBS / 산출물 / 결재 → 평가 QA

* [ ] WBS 이력 존재
* [ ] 산출물 또는 일지/결재 이력 존재
* [ ] evidence 생성/조회 가능
* [ ] 점수 입력 가능
* [ ] finalize 가능
* [ ] 근거 없는 점수/확정 흐름이 차단됨

---

# 10. 다국어 / 도메인 / SEO QA

## 10-1. 지원 언어 QA

* [ ] `ko`, `en`, `ja`, `fr`, `es` 전부 노출 가능
* [ ] 기본 locale이 `ko`
* [ ] `/api/locales` 결과와 프론트 LanguageSwitcher가 일치함

## 10-2. locale별 발행 상태 QA

* [ ] locale별 제목/본문/slug 분리
* [ ] locale별 SEO title/description 분리
* [ ] locale별 게시 상태 분리
* [ ] 미발행 locale fallback 금지
* [ ] 번역 미완료 locale는 숨김
* [ ] 기본 언어 없이 보조 언어 단독 발행이 차단됨

## 10-3. slug / unique QA

* [ ] 동일 locale 내 slug 중복 차단
* [ ] 서로 다른 locale의 slug 분리 허용 여부가 정책대로 동작
* [ ] 뉴스 상세와 페이지 상세 모두 locale-aware slug 사용
* [ ] 관리자 저장 단계에서 slug 충돌이 사전 검증됨

## 10-4. canonical / domain QA

* [ ] canonical이 `https://www.jinbizman.com` 기준
* [ ] 비-www 직접 노출이 canonical 기준이 아님
* [ ] 뉴스 상세 / 문의 완료 / locale 페이지 모두 canonical 정책 유지
* [ ] alternate / hreflang 구조 확인 가능
* [ ] 잘못된 host가 SEO meta에 삽입되지 않음

## 10-5. SEO QA

* [ ] HomePage 메타 정상
* [ ] CompanyPage 메타 정상
* [ ] BusinessPage 메타 정상
* [ ] NewsletterPage 메타 정상
* [ ] ContactPage 메타 정상
* [ ] locale 전환 시 SEO meta도 같이 바뀜
* [ ] OG / title / description이 각 언어 정책과 일치함

---

# 11. 반응형 / 기기 QA

## 11-1. 테스트 기기/브라우저 범위

* [ ] iPhone Safari
* [ ] Android Chrome
* [ ] iPad 세로
* [ ] iPad 가로
* [ ] 데스크톱 Chrome
* [ ] 데스크톱 Edge

## 11-2. 외부 공개 사이트 반응형 QA

* [ ] 헤더 메뉴가 모바일에서 정상 접근 가능
* [ ] Hero CTA가 겹치지 않음
* [ ] 핵심 카드가 모바일 1열, 태블릿 2열, 데스크톱 다열로 자연스럽게 변함
* [ ] 회사소개 연혁이 모바일에서 자연스럽게 흐름
* [ ] 뉴스 탭이 모바일에서 깨지지 않음
* [ ] 문의 폼이 모바일 1열로 자연스럽게 보임
* [ ] 긴 영어/불어/일본어 문자열로 버튼/카드 이탈 없음
* [ ] 가로 스크롤이 발생하지 않음

## 11-3. 관리자 ERP 반응형 QA

* [ ] 모바일 오프캔버스 사이드바 동작
* [ ] 태블릿에서 축소 사이드바 또는 자연스러운 내비게이션 동작
* [ ] 대시보드 카드가 모바일에서 읽을 수 있음
* [ ] 서비스 목록이 모바일에서 카드형 또는 안전한 가로 스크롤로 보임
* [ ] 문의 목록이 모바일에서 확인 가능
* [ ] WBS 보드가 최소한 요약 뷰로 사용 가능
* [ ] 업무보고/일지 폼이 모바일 단일 컬럼으로 사용 가능
* [ ] 결재 목록과 승인 액션이 모바일/태블릿에서도 가능
* [ ] 평가 evidence 화면이 모바일에서도 최소 확인 가능
* [ ] locale가 긴 경우에도 필터/탭/버튼이 깨지지 않음

---

# 12. 5단계 배포 완료 기준 연동 QA

## 12-1. 1단계 완료 기준 QA

* [ ] 외부 5개 페이지 정적 구조 확인
* [ ] 공통 디자인 토큰 적용
* [ ] 5개 메뉴 구조 고정
* [ ] 대표 도메인/locale 구조 초안 확인

## 12-2. 2단계 완료 기준 QA

* [ ] 문의 폼과 기본 public API 연결
* [ ] locale 구조 반영
* [ ] canonical 기본 구조 반영
* [ ] 외부 페이지 기본 반응형 확인

## 12-3. 3단계 완료 기준 QA

* [ ] 관리자 셸 완성
* [ ] 서비스 허브 기본
* [ ] 뉴스/공지 기본
* [ ] 문의/리드 기본
* [ ] 감사로그 일부 확인

## 12-4. 4단계 완료 기준 QA

* [ ] 프로젝트/WBS 동작
* [ ] 아침 업무보고 동작
* [ ] 퇴근 업무일지 동작
* [ ] 뉴스레터 리스트/상세와 관리자 발행 연결
* [ ] 게시 승인 플로우 동작
* [ ] 기본 전자결재 동작
* [ ] 감사로그 주요 변경 이력 저장

## 12-5. 5단계 완료 기준 QA

* [ ] 평가 근거 데이터가 점수 전에 보임
* [ ] 권한 세분화 확인
* [ ] 보안 강화 확인
* [ ] Rate Limit 연계 확인
* [ ] 구조화 로그 기본 확인
* [ ] 문의 시나리오 핵심 테스트 통과
* [ ] WBS 시나리오 핵심 테스트 통과
* [ ] 외부 사이트 공개 가능
* [ ] 내부 ERP는 권한 사용자만 접근 가능

---

# 13. 배포 전 QA 체크리스트

## 13-1. 외부 공개 전

* [ ] 5개 메뉴 구조 확인
* [ ] 뉴스레터 3탭 구조 확인
* [ ] 문의 제출 확인
* [ ] locale별 페이지 확인
* [ ] canonical / hreflang 확인
* [ ] 모바일/태블릿 확인
* [ ] NotFound 처리 확인

## 13-2. ERP 공개 전

* [ ] 관리자 로그인 확인
* [ ] 권한별 메뉴 노출 확인
* [ ] 서비스 허브 확인
* [ ] 문의/리드 확인
* [ ] 프로젝트/WBS 확인
* [ ] 업무보고/일지 확인
* [ ] 결재 확인
* [ ] 평가 evidence 확인
* [ ] 감사로그 확인

## 13-3. 운영 설정 확인

* [ ] APP_BASE_URL = `https://www.jinbizman.com`
* [ ] ADMIN_ALLOWED_ORIGINS가 운영 정책과 일치
* [ ] secrets/vars 구분 확인
* [ ] queue 바인딩 확인
* [ ] health check 동작 확인

---

# 14. 배포 직후 Smoke Test

## 14-1. 외부 공개 사이트

* [ ] `/` 응답 정상
* [ ] `/company` 응답 정상
* [ ] `/business` 응답 정상
* [ ] `/newsletter` 응답 정상
* [ ] `/contact` 응답 정상
* [ ] `/en`, `/ja`, `/fr`, `/es` locale 진입 가능
* [ ] 문의 제출 실사용 테스트 1건 성공

## 14-2. API

* [ ] `/api/health` 성공
* [ ] `/api/locales` 성공
* [ ] `/api/news` 성공
* [ ] `/api/site/pages/:slug` 성공
* [ ] `/api/inquiries` 성공

## 14-3. ERP

* [ ] 관리자 로그인 성공
* [ ] 대시보드 접근 성공
* [ ] 서비스 허브 접근 성공
* [ ] 프로젝트/WBS 접근 성공
* [ ] 업무보고/일지 저장 성공
* [ ] 결재 조회 성공
* [ ] 평가 evidence 조회 성공

---

# 15. 회귀 테스트 우선순위

변경이 생기면 최소 아래는 항상 다시 확인합니다.

## 15-1. 공개 사이트 회귀

* [ ] HomePage
* [ ] NewsletterPage
* [ ] ContactPage
* [ ] locale 전환
* [ ] canonical/meta

## 15-2. 관리자 회귀

* [ ] 대시보드
* [ ] 서비스 허브
* [ ] 문의/리드
* [ ] 프로젝트/WBS
* [ ] 업무보고/일지
* [ ] 결재
* [ ] 평가 evidence

## 15-3. 공통 회귀

* [ ] auth
* [ ] permission
* [ ] request_id / audit log
* [ ] rate limit
* [ ] summary/detail 응답 구조

---

# 16. 실패 시 바로 확인할 파일 / 원인 후보

## 16-1. 문의 제출 실패

### 우선 확인 파일

* `src/pages/ContactPage.tsx`
* `src/lib/validators.ts`
* `worker/routes/public/inquiries.ts`
* `worker/lib/rate-limit.ts`

### 원인 후보

* validation 오류
* rate limit 오동작
* DB 저장 실패
* queue 후처리 혼동

## 16-2. locale 전환 실패

### 우선 확인 파일

* `src/lib/i18n.ts`
* `src/components/common/LanguageSwitcher.tsx`
* `worker/routes/public/locales.ts`
* `worker/lib/locale.ts`

### 원인 후보

* locale 목록 불일치
* 미발행 locale 노출
* 잘못된 라우트 매핑

## 16-3. canonical 오류

### 우선 확인 파일

* `src/lib/seo.ts`
* `worker/lib/domain.ts`
* `worker/lib/seo.ts`
* system settings 관련 파일

### 원인 후보

* APP_BASE_URL 오설정
* domain helper 오동작
* locale-aware canonical 생성 오류

## 16-4. WBS 없는 업무보고 허용

### 우선 확인 파일

* `src/pages/admin/wbs/DailyReportPage.tsx`
* `src/pages/admin/wbs/DailyLogPage.tsx`
* `worker/routes/erp/daily-reports.ts`
* `worker/routes/erp/daily-logs.ts`

### 원인 후보

* 프론트 필수값 검증 누락
* 백엔드 Zod 검증 누락
* FK/업무 규칙 누락

## 16-5. 평가 근거 없이 finalize 가능

### 우선 확인 파일

* `src/pages/admin/evaluations/*`
* `worker/routes/erp/evaluations.ts`
* evaluation 관련 validator/permission 파일

### 원인 후보

* evidence 존재 검사 누락
* finalize 권한 검사 누락
* 상태 전이 로직 누락

## 16-6. 반응형 깨짐

### 우선 확인 파일

* `src/lib/responsive.ts`
* `src/components/common/*`
* `src/components/admin/*`
* 해당 페이지 TSX

### 원인 후보

* 고정 폭/고정 높이 사용
* 다국어 문자열 길이 미고려
* 모바일 대체 뷰 누락
* 사이드바/탭/테이블 처리 누락

---

# 17. 수동 QA 보고 기록 템플릿

## 17-1. 기본 기록 형식

* 테스트 일시:
* 테스트 환경:
* 브라우저/기기:
* 테스트 계정:
* 대상 모듈:
* 결과:

  * Pass / Fail / Blocked
* 증상 요약:
* 재현 절차:
* 기대 결과:
* 실제 결과:
* 관련 request_id:
* 스크린샷/영상:
* 우선순위:

  * Critical / High / Medium / Low
* 담당자:
* 수정 예정 버전:

## 17-2. 버그 우선순위 기준

### Critical

* 전체 서비스 불가
* 문의 저장 불가
* 로그인 불가
* 데이터 손실 가능
* 권한 우회 가능

### High

* 핵심 기능 일부 불가
* WBS/업무보고/결재/평가 흐름 중단
* 특정 locale 전체 미노출
* 반응형 깨짐으로 핵심 작업 불가

### Medium

* 일부 화면 오류
* 특정 필터/탭 동작 이상
* 일부 기기에서만 사용성 저하

### Low

* 문구 오탈자
* 정렬 문제
* 빈 상태 문구 개선 필요

---

# 18. 문서 교체용 최종 체크리스트

## 18-1. 이 문서가 기존 `qa-checklist.md`를 즉시 대체할 수 있어야 하는 이유

* 외부 공개 사이트, 관리자 ERP, API, 권한, 데이터 흐름, 다국어, 도메인, 반응형, 배포 단계까지 QA 범위를 모두 포함했습니다.
* 5개 메뉴 구조, 뉴스레터 3탭, 문의 저장+알림, 서비스 허브, 프로젝트/WBS, 업무보고/일지, 결재, 평가 evidence 구조를 모두 체크 가능하게 정리했습니다.
* locale, slug, canonical, `www.jinbizman.com`, 미발행 locale 숨김 같은 핵심 운영 정책을 QA 기준으로 반영했습니다.
* 5단계 배포 완료 기준을 QA 항목과 직접 연결했습니다.
* 배포 전/직후/smoke test/회귀 테스트 기준까지 포함했습니다.
* 실패 시 바로 확인할 파일과 원인 후보까지 포함했습니다.
* 수동 QA 결과를 바로 기록할 수 있는 보고 템플릿까지 포함했습니다.

## 18-2. 최종 검수 체크리스트

### 외부 사이트

* AI 서비스 회사 인식
* 5개 메뉴
* 뉴스레터 3탭
* 문의 저장 구조
* 5개 언어
* canonical `www.jinbizman.com`
* 반응형

### 관리자 ERP

* 서비스 허브
* 문의/리드
* 프로젝트/WBS
* 업무보고/일지
* 결재
* 평가 evidence
* 감사로그
* 권한별 메뉴 노출

### API / 백엔드

* `/api/health`
* `/api/locales`
* `/api/news`
* `/api/site/pages/:slug`
* `/api/inquiries`
* rate limit
* request_id
* audit log
* 저장/후처리 분리

### 배포 기준

* 1단계~5단계 완료 기준과 연결
* 배포 전/후 smoke test
* 회귀 테스트 우선순위
* 수동 QA 보고 템플릿 포함

---

## 변경 요약

* `docs/operations/qa-checklist.md`를 **JINBIZ 전용 실행형 QA 체크리스트**로 재정의했습니다.
* 외부 공개 사이트와 내부 ERP를 하나의 운영 체계로 보고 QA 범위를 재구성했습니다.
* 문의 저장+알림, 서비스 허브, WBS, 업무보고/일지, 결재, 평가 evidence, locale/canonical, 반응형 기준을 QA 항목으로 반영했습니다.
* 5단계 배포 완료 기준과 QA 항목을 직접 연결했습니다.
* 배포 전/후 점검, smoke test, 회귀 테스트, 실패 시 확인 파일, 수동 QA 보고 템플릿까지 포함했습니다.