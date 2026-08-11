## 이번 단계 목표

* 첨부 기준 문서들과 지금까지 확정된 채팅 방향을 모두 반영해 **`docs/operations/release-checklist.md` 최신형 완성형 최종본**을 다시 정리합니다.

* 이번 문서는 외부 홈페이지와 내부 ERP를 함께 받치는 운영 문서 중, **배포 직전 / 배포 중 / 배포 직후 / 롤백 판단 / 종료 선언**에 바로 사용할 수 있는 실행형 릴리즈 체크리스트만 집중적으로 다룹니다.

* 기존 확정안에 아래 3가지를 정식 요구사항으로 추가 확정합니다.

  * **PC, 모바일, 태블릿 등 모든 기기와 모든 환경에서 깨지거나 이탈되지 않는 반응형 웹앱**
  * **한국어, 영어, 일본어, 불어, 스페인어 공식 지원**
  * **대표 도메인 `www.jinbizman.com` 사용**

* 이번 최종본은 좋은 참고 문서가 아니라 **실제 릴리즈 담당자가 체크박스를 따라가며 바로 배포할 수 있는 운영 기준서**로 작성합니다.

* `Development-Execution`, `Develop-Total-Guide`, `Frontend-Develop-Guide`, `Backend-Develop-Guide`, `HomePage-Main-Guide`, `MangePage-Main-Guide`, `incident-playbook.md`, `qa-checklist.md`에 공통으로 반영된 **외부 5개 페이지 / 서비스 허브 / 뉴스·공지 / 문의 저장+알림 / 프로젝트·WBS / 업무보고·업무일지 / 결재 / 평가 근거 / 5개 언어 / canonical 도메인 / 5단계 배포 완료 기준**을 릴리즈 체크리스트로 재조립합니다.

---

## 변경 파일

이번 단계는 문서화 단계라 실제 코드 수정은 없습니다.

다만 이 문서를 기준으로 직접 연결될 핵심 파일은 아래가 맞습니다.

* `src/pages/HomePage.tsx`
* `src/pages/CompanyPage.tsx`
* `src/pages/BusinessPage.tsx`
* `src/pages/NewsletterPage.tsx`
* `src/pages/ContactPage.tsx`
* `src/pages/admin/*`
* `src/components/common/LanguageSwitcher.tsx`
* `src/lib/i18n.ts`
* `src/lib/responsive.ts`
* `src/lib/seo.ts`
* `src/lib/api.ts`
* `worker/index.ts`
* `worker/app.ts`
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
* `wrangler.jsonc`
* `.dev.vars.example`
* `README.md`

---

## 실행 명령어

기본 배포 흐름은 아래 기준으로 둡니다.

```bash
npm install
npm run build
npx wrangler dev
npx wrangler deploy
```

배포 직후 기본 smoke test 흐름은 아래를 기준으로 둡니다.

```bash
curl https://www.jinbizman.com/api/health
curl https://www.jinbizman.com/api/locales
curl "https://www.jinbizman.com/api/news?category=press&locale=ko"
curl "https://www.jinbizman.com/api/site/pages/company?locale=ko"
```

운영 저장형 기능 확인 흐름은 아래를 권장합니다.

```bash
curl -X POST https://www.jinbizman.com/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "inquiryType":"business",
    "companyName":"QA TEST",
    "name":"릴리즈체크",
    "email":"qa@example.com",
    "phone":"010-0000-0000",
    "message":"릴리즈 체크용 테스트 문의입니다.",
    "locale":"ko"
  }'
```

---

## 확인 방법

아래가 맞으면 이번 release checklist 문서는 정상으로 봐도 됩니다.

* 릴리즈 단계가 **사전 준비 → 배포 전 점검 → 배포 실행 → 배포 직후 smoke test → 기능별 핵심 검수 → 운영 공지/종료 → 롤백 판단** 순서로 정리되어 있는지
* 외부 공개 사이트와 내부 ERP가 **같은 릴리즈 기준** 안에 묶여 있는지
* 외부 5개 페이지, 뉴스레터 3탭, 문의 저장 구조가 체크리스트에 포함되어 있는지
* 서비스 허브, 프로젝트/WBS, 업무보고·업무일지, 결재, 평가 evidence가 관리자 배포 항목에 포함되어 있는지
* 5개 언어, `www.jinbizman.com`, canonical/hreflang, 미발행 locale 숨김 기준이 포함되어 있는지
* 반응형이 디자인 검수 항목이 아니라 **릴리즈 차단 조건**으로 들어 있는지
* 문의 저장과 알림 후처리가 분리된 성공 기준으로 적혀 있는지
* `/api/health`, `/api/locales`, `/api/news`, `/api/site/pages/:slug`와 관리자 핵심 시나리오가 smoke test에 포함되어 있는지
* 롤백 조건과 임시 완화 우선순위가 명확한지
* 문서 마지막 체크리스트만 봐도 기존 파일을 즉시 대체할 수 있는지 확인 가능한지

---

## 문제 발생 시

* 릴리즈 체크리스트를 외부 공개 사이트 기준으로만 만들면 ERP 핵심 운영 기능이 빠집니다.
* 배포 직후 smoke test 없이 “화면이 열리니 끝”으로 보면 문의/locale/WBS/결재처럼 저장형 기능 장애를 놓칩니다.
* 문의 저장과 알림을 같은 성공 기준으로 보면 실제 운영 영향 판단이 흔들립니다.
* WBS 없는 업무보고/업무일지 저장 허용을 단순 UI 이슈로 보면 데이터 신뢰도가 무너집니다.
* 다국어와 canonical을 체크리스트 마지막에 덧붙이면 실제 배포에서 빠집니다.
* 반응형을 스타일 후순위로 두면 모바일/태블릿 운영 불가 상태로도 배포가 진행됩니다.
* 롤백 조건이 없으면 장애 상태에서 수정과 배포를 반복하며 피해를 키울 수 있습니다.

---

# 1. 최종 정의

이 문서에서 말하는 release checklist의 정답은 단순한 “배포 전에 한 번 보자” 수준의 메모가 아닙니다.

정답은 아래입니다.

> **JINBIZ Release Checklist는 외부 회사소개형 AI 서비스 홈페이지와 내부 WBS 중심 ERP를 하나의 운영 체계로 보고, 배포 직전 검수·배포 실행·배포 직후 확인·릴리즈 종료·롤백 판단까지 표준화한 실행형 운영 문서다.**

이 체크리스트는 아래 전제를 반드시 지켜야 합니다.

* 외부 홈페이지는 **회사소개형 AI 서비스 기업 홈페이지**다.
* 내부 시스템은 **서비스 허브 + 프로젝트/WBS + 업무보고·업무일지 + 결재 + 평가 근거 데이터**를 가진 ERP다.
* 외부와 내부는 **같은 브랜드 / 같은 도메인 정책 / 같은 다국어 정책 / 같은 운영 체계**를 공유한다.
* 대표 도메인은 **`www.jinbizman.com`** 이다.
* 공식 지원 언어는 **`ko`, `en`, `ja`, `fr`, `es`** 다.
* 모든 화면은 **반응형 웹앱** 기준을 충족해야 한다.
* 문의는 **저장 성공**과 **알림 후처리 성공**을 분리해서 본다.
* 업무보고/업무일지는 **WBS 참조 필수**다.
* 평가는 점수보다 **evidence 구조**가 먼저 보장돼야 한다.
* 내부 ERP는 권한 사용자만 접근 가능해야 한다.

---

# 2. 릴리즈 단계 정의

JINBIZ 릴리즈는 아래 7단계로 진행합니다.

1. **사전 준비**
2. **배포 전 점검**
3. **릴리즈 프리즈 확인**
4. **배포 실행**
5. **배포 직후 smoke test**
6. **핵심 기능 검수**
7. **릴리즈 종료 또는 롤백**

즉, 단순히 `wrangler deploy`를 실행하는 것이 릴리즈의 끝이 아니라, **기능·운영·도메인·locale·반응형·권한 기준까지 검수한 뒤 종료 선언**을 해야 합니다.

---

# 3. 릴리즈 공통 원칙

## 3-1. 외부와 내부를 분리하지 않는다

외부 홈페이지와 내부 ERP는 같은 프로젝트이므로 같은 릴리즈 기준 안에서 봐야 합니다.

## 3-2. 저장형 기능을 우선 본다

조회형 페이지보다 아래 저장형 기능이 먼저 중요합니다.

* 문의 제출
* 뉴스/공지 발행
* 서비스 등록
* 프로젝트/WBS 저장
* 업무보고/일지 저장
* 결재 승인
* 평가 점수/근거 조회

## 3-3. locale / canonical / 반응형은 옵션이 아니다

* 5개 언어
* `www.jinbizman.com`
* 모바일/태블릿 대응

이 세 가지는 릴리즈 차단 조건으로 봅니다.

## 3-4. smoke test 없는 배포 종료 금지

최소 health, public pages, locale, 문의, 관리자 로그인, WBS 흐름은 확인해야 합니다.

## 3-5. 롤백 조건을 먼저 정하고 배포한다

배포 전에 “어떤 경우 즉시 롤백할지”가 정해져 있어야 합니다.

## 3-6. 저장 성공과 후처리 성공을 분리한다

문의, 알림, queue, 캐시 무효화, sitemap, 감사 후처리는 각각 따로 판단합니다.

## 3-7. 5단계 배포 완료 기준을 릴리즈 게이트로 사용한다

기능이 있다고 끝이 아니라, **해당 단계 완료 기준을 실제 충족하는지**를 보고 배포 여부를 판단합니다.

---

# 4. 사전 준비 체크리스트

## 4-1. 환경 / 설정 준비

* [ ] `npm install` 완료
* [ ] `npm run build` 성공
* [ ] `npx wrangler dev` 로컬 실행 확인
* [ ] 필요한 migration 적용 여부 확인
* [ ] `.dev.vars` 또는 운영 secrets/vars 값 최신 상태 확인
* [ ] `DATABASE_URL` 정상
* [ ] `JWT_SECRET` 정상
* [ ] `APP_BASE_URL=https://www.jinbizman.com` 확인
* [ ] `ADMIN_ALLOWED_ORIGINS=https://www.jinbizman.com` 확인
* [ ] locale 설정이 `ko`, `en`, `ja`, `fr`, `es` 기준으로 유지됨
* [ ] rate limit / queue / logging / audit 관련 바인딩 확인
* [ ] 운영용 테스트 계정 준비
* [ ] 문의 테스트용 샘플 데이터 준비
* [ ] WBS 테스트용 프로젝트/태스크 준비
* [ ] 평가 evidence 테스트 데이터 준비
* [ ] smoke test 담당자와 확인 담당자 지정 완료

## 4-2. 릴리즈 범위 확인

* [ ] 이번 배포 범위가 명확함
* [ ] 외부 공개 사이트 영향 범위 확인
* [ ] 관리자 ERP 영향 범위 확인
* [ ] schema/migration 포함 여부 확인
* [ ] locale/SEO/domain 영향 여부 확인
* [ ] 권한/메뉴 노출 영향 여부 확인
* [ ] 롤백 필요 시 되돌릴 단위 확인
* [ ] known issue 목록 최신화 완료

## 4-3. 릴리즈 프리즈 확인

* [ ] 배포 직전 불필요한 추가 커밋 중단
* [ ] 승인되지 않은 기능이 포함되지 않음
* [ ] 문서와 실제 배포 범위가 일치함
* [ ] 릴리즈 노트 초안 준비 완료

---

# 5. 배포 전 점검 체크리스트

# 5-1. 외부 공개 사이트 기본 점검

* [ ] `메인 홈 / 회사소개 / 사업소개 / 뉴스레터 / 문의하기` 5개 메뉴 구조 유지
* [ ] 첫 화면 3초 안에 AI 서비스 회사로 인식되는지 확인
* [ ] 회사소개에 대표 인사말이 없는지 확인
* [ ] 사업소개 순서가 `AI 서비스 → 플랫폼 사업 → 기획 서비스`인지 확인
* [ ] 뉴스레터가 `보도자료 / 공시정보 / 공지사항` 구조인지 확인
* [ ] 문의하기가 정상 폼 구조인지 확인
* [ ] 유레카월드가 작업 중심 AI 서비스 수준으로 노출되는지 확인

# 5-2. 관리자 ERP 기본 점검

* [ ] 관리자 상위 메뉴 구조가 유지됨

  * [ ] 대시보드
  * [ ] 서비스 허브
  * [ ] 홈페이지 운영
  * [ ] 뉴스/공지
  * [ ] 문의/리드
  * [ ] 프로젝트/WBS
  * [ ] 업무보고/업무일지
  * [ ] 전자결재
  * [ ] 조직/권한
  * [ ] 평가
  * [ ] 시스템 관리
* [ ] 관리자 로그인 가능
* [ ] 권한 없는 메뉴 숨김 확인
* [ ] 주요 쓰기 화면 접근 가능

# 5-3. API / 백엔드 사전 점검

* [ ] `/api/health` 정상
* [ ] `/api/locales` 정상
* [ ] `/api/news` 정상
* [ ] `/api/site/pages/:slug` 정상
* [ ] `/api/inquiries` validation 정상
* [ ] 관리자 API 인증 정상
* [ ] ERP API 인증/권한 정상
* [ ] request_id / audit log / logger 구조 정상
* [ ] summary / detail 응답 구조 유지

# 5-4. 데이터 / 규칙 점검

* [ ] WBS 없는 업무보고 저장 차단 확인
* [ ] WBS 없는 업무일지 저장 차단 확인
* [ ] `actual_progress` 0~100 검증 확인
* [ ] evidence 없는 평가 finalize 차단 확인
* [ ] locale별 slug 중복 정책 확인
* [ ] canonical host가 `www.jinbizman.com`인지 확인
* [ ] 미발행 locale fallback 금지 확인
* [ ] 문의 저장 성공과 알림 후처리 성공이 분리되는지 확인

---

# 6. 다국어 / 도메인 / SEO 배포 전 체크리스트

## 6-1. 언어 구조

* [ ] 지원 언어 5개(`ko`, `en`, `ja`, `fr`, `es`) 모두 정상 등록
* [ ] 기본 언어 `ko`
* [ ] LanguageSwitcher 정상 동작
* [ ] locale별 페이지 진입 가능
* [ ] locale별 미발행 콘텐츠 숨김 처리

## 6-2. URL 구조

* [ ] 한국어 기본 루트(`/`, `/company`, `/business`, `/newsletter`, `/contact`) 정상
* [ ] `/en/...` 정상
* [ ] `/ja/...` 정상
* [ ] `/fr/...` 정상
* [ ] `/es/...` 정상

## 6-3. canonical / alternate / hreflang

* [ ] canonical이 항상 `https://www.jinbizman.com`
* [ ] 비-www가 canonical 기준이 아님
* [ ] alternate links/hreflang 생성 구조 확인
* [ ] 뉴스 상세 locale alternate 구조 확인
* [ ] 잘못된 host가 메타에 삽입되지 않음

## 6-4. SEO 메타

* [ ] HomePage 메타 정상
* [ ] CompanyPage 메타 정상
* [ ] BusinessPage 메타 정상
* [ ] NewsletterPage 메타 정상
* [ ] ContactPage 메타 정상
* [ ] locale 전환 시 meta도 같이 바뀜

---

# 7. 반응형 배포 전 체크리스트

## 7-1. 테스트 기기 / 브라우저

* [ ] iPhone Safari
* [ ] Android Chrome
* [ ] iPad 세로
* [ ] iPad 가로
* [ ] 데스크톱 Chrome
* [ ] 데스크톱 Edge

## 7-2. 외부 공개 사이트 반응형

* [ ] 헤더 메뉴 모바일 접근 가능
* [ ] Hero CTA 겹침 없음
* [ ] 카드 1열/2열/다열 전환 자연스러움
* [ ] 뉴스 탭 깨짐 없음
* [ ] 문의 폼 모바일 1열 정상
* [ ] 긴 locale 문자열 이탈 없음
* [ ] 360px~1440px 이상에서 가로 스크롤 없음

## 7-3. 관리자 ERP 반응형

* [ ] 모바일 오프캔버스 사이드바 동작
* [ ] 태블릿 내비게이션 정상
* [ ] 대시보드 카드 읽기 가능
* [ ] 서비스 목록 모바일 접근 가능
* [ ] 문의 목록 모바일 접근 가능
* [ ] WBS 보드 최소 요약 사용 가능
* [ ] 업무보고/일지 폼 모바일 입력 가능
* [ ] 결재 액션 모바일/태블릿 가능
* [ ] 평가 evidence 화면 최소 확인 가능
* [ ] 관리자 탭/카드/표/폼 이탈 없음

## 7-4. 릴리즈 차단 조건

아래 중 하나라도 해당하면 배포를 중단하거나 롤백 우선 검토합니다.

* [ ] 외부 핵심 CTA 클릭 불가
* [ ] 문의 폼 모바일 입력 불가
* [ ] 관리자 모바일 내비게이션 진입 불가
* [ ] WBS/결재/평가 핵심 화면이 모바일/태블릿에서 실사용 불가
* [ ] 특정 locale 문자열로 버튼/카드가 깨짐
* [ ] 가로 스크롤이 핵심 흐름에서 발생

---

# 8. 배포 실행 체크리스트

## 8-1. 실행 전 마지막 확인

* [ ] 빌드 성공
* [ ] 릴리즈 범위 재확인
* [ ] migration 포함 여부 재확인
* [ ] 롤백 기준 재확인
* [ ] 담당자/모니터링 준비 완료
* [ ] 운영 채널 대기 상태 확인
* [ ] 릴리즈 노트 초안 준비 완료

## 8-2. 배포 실행

```bash
npm run build
npx wrangler deploy
```

## 8-3. 실행 직후 기록

* [ ] 배포 시각 기록
* [ ] 배포한 커밋/버전 기록
* [ ] 주요 변경 사항 기록
* [ ] 관련 request_id 또는 로그 기준 기록
* [ ] 운영자 공유 완료

---

# 9. 배포 직후 Smoke Test

# 9-1. Public Smoke Test

* [ ] `https://www.jinbizman.com/` 성공
* [ ] `https://www.jinbizman.com/company` 성공
* [ ] `https://www.jinbizman.com/business` 성공
* [ ] `https://www.jinbizman.com/newsletter` 성공
* [ ] `https://www.jinbizman.com/contact` 성공
* [ ] `/en`, `/ja`, `/fr`, `/es` locale 페이지 진입 성공
* [ ] `/api/health` 성공
* [ ] `/api/locales` 성공
* [ ] `/api/news` 성공
* [ ] `/api/site/pages/company` 성공
* [ ] 문의 제출 실사용 테스트 1건 성공

# 9-2. ERP Smoke Test

* [ ] 관리자 로그인 성공
* [ ] 대시보드 접근 성공
* [ ] 서비스 허브 접근 성공
* [ ] 문의 목록 접근 성공
* [ ] 프로젝트 목록 접근 성공
* [ ] WBS 보드 접근 성공
* [ ] 아침 업무보고 화면 접근 성공
* [ ] 퇴근 업무일지 화면 접근 성공
* [ ] 결재 목록 접근 성공
* [ ] 평가 evidence 조회 성공
* [ ] 감사로그 조회 성공

# 9-3. 저장형 기능 Smoke Test

* [ ] 서비스 1건 조회/수정 성공
* [ ] 뉴스/공지 1건 임시저장 또는 수정 성공
* [ ] WBS 1건 생성 또는 수정 성공
* [ ] 업무보고 1건 제출 성공
* [ ] 업무일지 1건 제출 성공
* [ ] 결재 1건 상신 또는 승인 성공
* [ ] 평가 점수 또는 evidence 조회 정상

---

# 10. 외부 공개 사이트 핵심 기능 릴리즈 체크리스트

# 10-1. HomePage

* [ ] Hero 정상 노출
* [ ] 핵심 메시지 3카드 노출
* [ ] 회사소개 프리뷰 노출
* [ ] 사업소개 프리뷰 노출
* [ ] 유레카월드 강조 섹션 노출
* [ ] 뉴스레터 유도 섹션 노출
* [ ] 문의 유도 섹션 노출

# 10-2. CompanyPage

* [ ] 회사 개요 노출
* [ ] 회사 정의 노출
* [ ] 비전 노출
* [ ] 핵심 가치 노출
* [ ] 연혁 노출
* [ ] 불필요한 문의 유도 없음

# 10-3. BusinessPage

* [ ] AI 서비스 섹션 노출
* [ ] 플랫폼 사업 섹션 노출
* [ ] 기획 서비스 섹션 노출
* [ ] How We Work 노출
* [ ] 하단 CTA 정상

# 10-4. NewsletterPage

* [ ] 보도자료 탭
* [ ] 공시정보 탭
* [ ] 공지사항 탭
* [ ] EmptyState 또는 리스트 정상
* [ ] 상세 페이지 진입 가능

# 10-5. ContactPage

* [ ] 필수 필드 정상
* [ ] validation 정상
* [ ] 저장 성공
* [ ] 완료 메시지 노출
* [ ] locale별 메시지 정상
* [ ] 저장 성공/알림 후처리 상태를 분리해서 판단 가능

---

# 11. 관리자 ERP 핵심 기능 릴리즈 체크리스트

# 11-1. 서비스 허브

* [ ] 서비스 목록 조회 가능
* [ ] 서비스 등록 가능
* [ ] 상태/도메인/환경 수정 가능
* [ ] 언어 설정 가능
* [ ] 권한 템플릿 연결 가능
* [ ] 변경 로그 확인 가능

# 11-2. 홈페이지 운영

* [ ] 페이지 관리 접근 가능
* [ ] 공통 CTA/푸터 수정 가능
* [ ] SEO/OG 설정 가능
* [ ] 번역 탭 접근 가능
* [ ] locale별 slug/SEO 저장 가능

# 11-3. 뉴스/공지 운영

* [ ] 보도자료 등록 가능
* [ ] 공시정보 등록 가능
* [ ] 공지사항 등록 가능
* [ ] 언어별 제목/본문/SEO 저장 가능
* [ ] 발행 요청 가능
* [ ] 승인 연결 가능

# 11-4. 문의/리드

* [ ] 문의 목록 조회 가능
* [ ] 상태 변경 가능
* [ ] 담당자 배정 가능
* [ ] 메모 기록 가능
* [ ] 리드 전환 가능
* [ ] 프로젝트 연결 가능

# 11-5. 프로젝트 / WBS

* [ ] 프로젝트 생성 가능
* [ ] WBS 생성 가능
* [ ] 담당자 지정 가능
* [ ] 상태 변경 가능
* [ ] 의존성 저장 가능
* [ ] 산출물 연결 가능
* [ ] 진척률 집계 시작
* [ ] requiresApproval=true인 WBS의 직접 done 차단 확인

# 11-6. 업무보고 / 업무일지

* [ ] 아침 업무보고 제출 가능
* [ ] 퇴근 업무일지 제출 가능
* [ ] WBS 없는 제출 차단
* [ ] progress 검증 정상
* [ ] 지연 사유 기록 가능
* [ ] 대시보드 집계 반영

# 11-7. 전자결재

* [ ] 결재 작성 가능
* [ ] 결재 대기/진행/완료 조회 가능
* [ ] 승인/반려/수정요청 가능
* [ ] 결재선 표시 정상
* [ ] 승인 후 상태 반영 정상
* [ ] 종료 문서 재액션 차단

# 11-8. 평가

* [ ] 평가 주기 조회 가능
* [ ] 평가 항목 조회 가능
* [ ] evidence 조회 가능
* [ ] 점수 입력 가능
* [ ] evidence 없는 finalize 차단
* [ ] finalize 권한 분리 확인
* [ ] 점수 전에 근거 데이터가 먼저 확인 가능

# 11-9. 시스템 관리 / 감사로그

* [ ] 시스템 설정 조회 가능
* [ ] locale 설정 확인 가능
* [ ] 도메인/SEO 공통 설정 확인 가능
* [ ] 감사로그 조회 가능
* [ ] 주요 쓰기 동작 감사로그 남음

---

# 12. 저장형 기능 특별 체크리스트

릴리즈 직후 아래 저장형 기능은 반드시 직접 한 번씩 저장해 봅니다.

## 12-1. 외부 저장형

* [ ] 문의 1건 제출
* [ ] 문의가 DB에 저장됨
* [ ] 관리자 목록에서 조회됨
* [ ] 알림 후처리 경로 확인 가능

## 12-2. 관리자 저장형

* [ ] 서비스 1건 생성 또는 수정
* [ ] 뉴스/공지 1건 임시저장 또는 수정
* [ ] 프로젝트 1건 생성 또는 수정
* [ ] WBS 1건 생성 또는 수정
* [ ] 업무보고 1건 제출
* [ ] 업무일지 1건 제출
* [ ] 결재 1건 상신 또는 승인
* [ ] 평가 점수 1건 저장 또는 evidence 조회

---

# 13. 5단계 배포 완료 기준 연동 체크리스트

# 13-1. 1단계 완료 기준 릴리즈 체크

* [ ] 외부 5개 페이지 정적 구조 완성
* [ ] 공통 디자인 토큰 적용
* [ ] 5개 메뉴 구조 고정
* [ ] 도메인/locale 구조 초안 반영

# 13-2. 2단계 완료 기준 릴리즈 체크

* [ ] 문의 폼 + 기본 Public API 연결
* [ ] locale 구조 반영
* [ ] canonical 기본 반영
* [ ] 외부 반응형 기본 완료
* [ ] 5개 언어 라우트 구조 동작
* [ ] 미발행 locale 숨김 처리 확인

# 13-3. 3단계 완료 기준 릴리즈 체크

* [ ] 관리자 셸 완성
* [ ] 서비스 허브 기본 완료
* [ ] 뉴스/공지 기본 완료
* [ ] 문의/리드 기본 완료
* [ ] 감사로그 일부 확인 가능
* [ ] 서비스 등록 시 언어/도메인/권한 템플릿 설정 가능

# 13-4. 4단계 완료 기준 릴리즈 체크

* [ ] 프로젝트/WBS 완료
* [ ] 아침 업무보고 완료
* [ ] 퇴근 업무일지 완료
* [ ] 뉴스 운영 + 관리자 발행 연결 완료
* [ ] 발행 승인 플로우 완료
* [ ] 기본 전자결재 완료
* [ ] 감사로그 주요 변경 저장 확인

# 13-5. 5단계 완료 기준 릴리즈 체크

* [ ] 평가 근거 데이터 집계 완료
* [ ] 권한 세분화 완료
* [ ] 보안 강화 완료
* [ ] 문의 API rate limit 적용
* [ ] 구조화 로그 확인
* [ ] 핵심 시나리오 테스트 통과
* [ ] 외부 사이트 공개 가능
* [ ] 내부 ERP는 권한 사용자만 접근 가능

---

# 14. 롤백 판단 기준

아래 중 하나라도 해당하면 **즉시 롤백 또는 긴급 완화**를 검토합니다.

## 14-1. 외부 공개 사이트 롤백 기준

* [ ] 전체 공개 사이트 접속 불가
* [ ] 외부 5개 페이지 중 핵심 페이지 다수 실패
* [ ] 문의 제출 불가
* [ ] locale 전환 전면 실패
* [ ] canonical이 잘못된 호스트로 노출
* [ ] 모바일에서 핵심 CTA/문의 흐름 사용 불가

## 14-2. 관리자 ERP 롤백 기준

* [ ] 로그인 불가
* [ ] 서비스 허브 접근 불가
* [ ] WBS 저장/조회 불가
* [ ] 업무보고/일지 제출 불가
* [ ] 결재 승인 불가
* [ ] evidence 없는 평가 finalize 허용
* [ ] 감사로그 미기록

## 14-3. 공통 인프라 롤백 기준

* [ ] `/api/health` 실패
* [ ] DB 연결 실패
* [ ] auth/permission 전면 오동작
* [ ] rate limit 오동작으로 핵심 API 차단
* [ ] queue 문제로 저장 경로까지 실패
* [ ] request_id / error logging 추적 불가

---

# 15. 롤백 전 임시 완화 우선순위

롤백 전에 아래 임시 완화가 가능한지 먼저 봅니다.

1. 특정 locale 임시 숨김
2. 특정 뉴스/콘텐츠 비공개 전환
3. 특정 관리자 기능 임시 비활성화
4. 발행/승인만 임시 중단
5. 쓰기 기능 제한 후 읽기 유지
6. 문의 저장은 유지하고 알림 후처리만 지연 처리

단, 아래는 완화보다 롤백 우선입니다.

* DB 연결 실패
* 로그인 전면 실패
* 문의 저장 불가
* WBS/업무보고 핵심 저장 불가
* 권한 우회/보안 문제

---

# 16. 릴리즈 종료 선언 기준

릴리즈 종료는 아래 조건을 모두 만족할 때만 선언합니다.

* [ ] 배포 성공
* [ ] smoke test 성공
* [ ] 외부 5개 페이지 확인 완료
* [ ] 문의 저장 확인 완료
* [ ] locale/canonical 확인 완료
* [ ] 관리자 로그인/핵심 쓰기 기능 확인 완료
* [ ] 서비스 허브/WBS/업무보고/일지/결재/평가 evidence 주요 흐름 확인 완료
* [ ] 반응형 주요 화면 확인 완료
* [ ] 운영 채널 공유 완료
* [ ] 장애/우회 이슈 없거나 문서화 완료

---

# 17. 릴리즈 후 기록 항목

배포가 끝나면 최소 아래를 남깁니다.

* 배포 시각
* 배포자
* 커밋/버전
* 포함 범위
* migration 포함 여부
* locale/domain/SEO 영향 여부
* smoke test 결과
* 미해결 known issue
* 롤백 필요 여부
* 다음 점검 시각

권장 포맷:

```text
배포 시각:
배포 버전:
배포자:
주요 변경:
영향 범위:
Smoke test:
Known issue:
롤백 여부:
비고:
```

---

# 18. 실패 시 바로 확인할 파일 / 원인 후보

## 18-1. 공개 페이지 미노출

### 우선 확인 파일

* `src/routes.tsx` 또는 라우트 파일
* `src/lib/seo.ts`
* `worker/routes/public/site-pages.ts`
* `worker/lib/domain.ts`

### 원인 후보

* locale route 매핑 오류
* canonical/domain helper 오류
* 콘텐츠 발행 상태 문제

## 18-2. 문의 제출 실패

### 우선 확인 파일

* `src/pages/ContactPage.tsx`
* `src/lib/validators.ts`
* `worker/routes/public/inquiries.ts`
* `worker/lib/rate-limit.ts`

### 원인 후보

* validation 오류
* rate limit 오동작
* DB 저장 실패
* 알림 후처리와 저장 경로 혼동

## 18-3. locale / canonical 오류

### 우선 확인 파일

* `src/lib/i18n.ts`
* `src/components/common/LanguageSwitcher.tsx`
* `worker/routes/public/locales.ts`
* `worker/lib/locale.ts`
* `worker/lib/domain.ts`
* `worker/lib/seo.ts`

### 원인 후보

* locale 목록 불일치
* 미발행 locale 노출
* APP_BASE_URL 오설정
* canonical helper 오류

## 18-4. WBS 흐름 실패

### 우선 확인 파일

* `src/pages/admin/wbs/*`
* `worker/routes/erp/wbs.ts`
* `worker/routes/erp/daily-reports.ts`
* `worker/routes/erp/daily-logs.ts`

### 원인 후보

* WBS validator 누락
* FK 규칙 누락
* progress/status 검증 누락

## 18-5. 평가 evidence 구조 실패

### 우선 확인 파일

* `src/pages/admin/evaluations/*`
* `worker/routes/erp/evaluations.ts`
* evaluation 관련 validator/permission 파일

### 원인 후보

* evidence 존재 검사 누락
* finalize 권한 누락
* source_type/source_id 연결 오류

---

# 19. 릴리즈 담당자 역할 분리

## 19-1. Release Owner

* 배포 승인
* 범위 확정
* 종료 선언
* 롤백 최종 판단

## 19-2. Technical Owner

* 배포 실행
* smoke test 수행
* 로그 확인
* 복구 또는 롤백 실행

## 19-3. QA Owner

* 체크리스트 확인
* 반응형 / locale / 핵심 저장형 기능 검증
* known issue 기록

## 19-4. Recorder

* 배포 시각 기록
* 변경 범위 기록
* 이슈 및 대응 시간 기록
* 종료 문서화

---

# 20. 문서 교체용 최종 체크리스트

## 20-1. 이 문서가 기존 `release-checklist.md`를 즉시 대체할 수 있어야 하는 이유

* 배포 전 / 배포 중 / 배포 직후 / 종료 / 롤백까지 전체 흐름이 포함되어 있습니다.
* 외부 공개 사이트와 내부 ERP를 하나의 릴리즈 기준으로 묶었습니다.
* 외부 5개 페이지, 뉴스레터 3탭, 문의 저장 구조를 모두 체크하도록 반영했습니다.
* 서비스 허브, 프로젝트/WBS, 업무보고·업무일지, 결재, 평가 evidence 구조를 모두 체크하도록 반영했습니다.
* 5개 언어, `www.jinbizman.com`, canonical, 미발행 locale 숨김, 반응형 기준이 포함되어 있습니다.
* 5단계 배포 완료 기준을 릴리즈 체크리스트에 직접 연결했습니다.
* 롤백 기준과 임시 완화 우선순위까지 포함했습니다.
* 릴리즈 담당자 역할 분리와 종료 선언 기준까지 포함했습니다.

## 20-2. 최종 검수 체크리스트

### 외부 공개 사이트

* 5개 메뉴
* 뉴스레터 3탭
* 문의 제출
* 5개 언어
* canonical `www.jinbizman.com`
* 반응형

### 관리자 ERP

* 로그인
* 서비스 허브
* 문의/리드
* 프로젝트/WBS
* 업무보고/일지
* 결재
* 평가 evidence
* 감사로그

### API / 공통

* `/api/health`
* `/api/locales`
* `/api/news`
* `/api/site/pages/:slug`
* `/api/inquiries`
* request_id / audit log
* rate limit
* 저장/후처리 분리

### 운영 기준

* 1단계~5단계 완료 기준과 연결
* smoke test
* 롤백 조건
* 종료 선언 기준
* 역할 분리 기준

---

## 변경 요약

* `docs/operations/release-checklist.md`를 **JINBIZ 전용 실행형 릴리즈 체크리스트**로 재정의했습니다.
* 외부 공개 사이트와 내부 ERP를 하나의 릴리즈 기준으로 묶었습니다.
* 배포 전 점검, 배포 실행, 배포 직후 smoke test, 핵심 기능 검수, 롤백 판단, 종료 선언까지 전 과정을 포함했습니다.
* 5개 언어, `www.jinbizman.com`, canonical, 반응형, WBS 연결, 평가 evidence 구조를 릴리즈 차단 조건까지 포함해 반영했습니다.
* 5단계 배포 완료 기준을 릴리즈 체크리스트와 직접 연결했습니다.
* 릴리즈 역할 분리와 후속 기록 기준까지 추가했습니다.