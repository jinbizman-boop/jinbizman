# JINBIZ Incident Playbook 최신형 완성형 최종본

## 이번 단계 목표

* 첨부 기준 문서들과 지금까지 확정된 채팅 방향을 모두 반영해 **`docs/operations/incident-playbook.md` 최신형 완성형 최종본**을 다시 정리합니다.
* 이번 문서는 `JINBIZ`의 외부 홈페이지와 내부 ERP를 함께 받치는 운영 문서 중, **장애 감지 · 분류 · 대응 · 복구 · 커뮤니케이션 · 사후 회고**만 집중적으로 다루는 실행 기준서입니다.
* 기존 확정안에 아래 3가지를 정식 요구사항으로 추가 확정합니다.

  * **PC, 모바일, 태블릿 등 모든 기기와 모든 환경에서 깨지거나 이탈되지 않는 반응형 웹앱 운영 기준**
  * **한국어, 영어, 일본어, 불어, 스페인어 공식 지원 운영 기준**
  * **대표 도메인 `www.jinbizman.com` 사용 기준**

* 이번 최종본은 좋은 참고 문서가 아니라 **실제 장애가 났을 때 바로 열어서 쓸 수 있는 운영 플레이북**으로 작성합니다.
* `Development-Execution`, `Develop-Total-Guide`, `Backend-Develop-Guide`, `Frontend-Develop-Guide`, `HomePage-Main-Guide`, `MangePage-Main-Guide`에 공통으로 반영된 **외부 5개 페이지 / 서비스 허브 / 문의 저장+알림 / 프로젝트·WBS / 업무보고·업무일지 / 결재 / 평가 근거 / 5개 언어 / canonical 도메인** 구조를 장애 대응 관점으로 다시 묶습니다.

---

## 변경 파일

이번 단계는 문서화 단계라 실제 코드 수정은 없습니다.

다만 이 문서를 기준으로 직접 연결될 핵심 파일은 아래가 맞습니다.

* `worker/routes/system/health.ts`
* `worker/routes/public/inquiries.ts`
* `worker/routes/public/news.ts`
* `worker/routes/public/site-pages.ts`
* `worker/routes/public/locales.ts`
* `worker/routes/admin/services.ts`
* `worker/routes/admin/site-content.ts`
* `worker/routes/admin/site-seo.ts`
* `worker/routes/admin/translations.ts`
* `worker/routes/admin/inquiries.ts`
* `worker/routes/erp/projects.ts`
* `worker/routes/erp/wbs.ts`
* `worker/routes/erp/daily-reports.ts`
* `worker/routes/erp/daily-logs.ts`
* `worker/routes/erp/approvals.ts`
* `worker/routes/erp/evaluations.ts`
* `worker/routes/system/audit-logs.ts`
* `worker/routes/system/settings.ts`
* `worker/lib/logger.ts`
* `worker/lib/errors.ts`
* `worker/lib/response.ts`
* `worker/lib/rate-limit.ts`
* `worker/lib/locale.ts`
* `worker/lib/domain.ts`
* `worker/lib/seo.ts`
* `worker/middleware/request-id.ts`
* `worker/middleware/auth.ts`
* `worker/middleware/require-permission.ts`
* `worker/middleware/audit.ts`
* `src/lib/api.ts`
* `src/lib/i18n.ts`
* `src/lib/responsive.ts`
* `db/migrations/*`

---

## 실행 명령어

기본 확인 흐름은 아래 기준으로 둡니다.

```bash
npm install
npm run dev
npx wrangler dev
```

장애 대응 시 자주 쓰게 되는 기본 점검 흐름은 아래를 기준으로 둡니다.

```bash
npm run dev
npx wrangler dev
curl http://127.0.0.1:8787/api/health
```

운영 환경 기준 점검 예시는 아래 흐름을 따릅니다.

```bash
curl https://www.jinbizman.com/api/health
curl https://www.jinbizman.com/api/locales
curl "https://www.jinbizman.com/api/news?category=press&locale=ko"
```

---

## 확인 방법

아래가 맞으면 이번 incident playbook은 정상으로 봐도 됩니다.

* 장애를 **외부 공개 사이트 / 내부 ERP / 공통 인프라 / 보안·데이터** 기준으로 분류할 수 있는지
* SEV 등급 기준이 명확한지
* 장애 발생 시 **감지 → 분류 → 지휘체계 지정 → 초기 커뮤니케이션 → 격리 → 복구 → 회고** 흐름이 문서에 들어 있는지
* 문의 등록 장애, 뉴스 조회 장애, 페이지 콘텐츠 장애, 서비스 허브 장애, WBS 장애, 업무보고/일지 장애, 결재 장애, 평가 장애 각각의 체크리스트가 있는지
* 5개 언어 운영과 `www.jinbizman.com` canonical 정책이 장애 대응 항목에도 반영되어 있는지
* 반응형 장애가 단순 CSS 문제가 아니라 운영 장애로 분류되는지
* 저장과 알림이 분리돼야 하는 문의 흐름이 운영 기준에도 반영되어 있는지
* request_id, audit log, queue, locale/domain 검증, summary/detail 응답 구조까지 장애 원인 후보에 들어 있는지
* 장애 종료 후 재발 방지와 문서 갱신 기준이 들어 있는지
* 문서 마지막 체크리스트만 봐도 기존 파일을 즉시 대체할 수 있는지 확인 가능한지

---

## 문제 발생 시

* 장애 분류 없이 바로 수정부터 시작하면 영향 범위와 커뮤니케이션이 꼬입니다.
* 외부 사이트와 ERP를 다른 서비스처럼 따로 대응하면 공통 원인(도메인, locale, DB, auth, queue)을 놓치기 쉽습니다.
* 문의 저장과 알림을 하나의 성공/실패로 다루면 복구 판단이 흔들립니다.
* WBS 없이 업무보고/일지 저장이 허용되는 장애를 “경미한 UX 문제”로 보면 데이터 신뢰도가 무너집니다.
* 다국어/도메인 문제를 SEO 부가 이슈로만 보면 실제 공개 링크와 발행 상태 장애를 놓칩니다.
* 반응형 깨짐을 스타일 문제로만 보면 모바일/태블릿 운영 불능 상황을 과소평가하게 됩니다.
* 결재/평가 장애를 단순 조회 문제로만 보면 승인/확정 중단이라는 운영 통제 이슈를 놓치게 됩니다.

---

# 1. 최종 정의

이 문서에서 말하는 incident playbook의 정답은 단순한 “장애 났을 때 연락하세요” 수준의 안내문이 아닙니다.

정답은 아래입니다.

> **JINBIZ Incident Playbook은 외부 회사소개형 AI 서비스 홈페이지와 내부 WBS 중심 ERP를 하나의 운영 체계로 보고, 장애를 감지·분류·통제·복구·보고·회고하는 기준 문서다.**

이 플레이북은 아래 전제를 반드시 지켜야 합니다.

* 외부 홈페이지는 **회사소개형 AI 서비스 기업 홈페이지**다.
* 내부 시스템은 **서비스 허브 + 프로젝트/WBS + 업무보고/업무일지 + 결재 + 평가**를 포함한 ERP다.
* 외부와 내부는 **같은 도메인 정책, 같은 다국어 정책, 같은 데이터 흐름** 안에 있다.
* 대표 도메인은 **`www.jinbizman.com`** 이다.
* 공식 지원 언어는 **`ko`, `en`, `ja`, `fr`, `es`** 다.
* 모든 관리자 동작은 권한과 감사로그를 남긴다.
* 모든 업무는 프로젝트/WBS에 연결된다.
* 문의는 저장과 알림 후처리가 분리되어야 한다.
* 미발행 언어는 fallback이 아니라 미공개 처리된다.

---

# 2. 운영 범위 정의

JINBIZ 운영 범위는 아래 네 축으로 나눕니다.

## 2-1. 외부 공개 사이트

* 메인 홈
* 회사소개
* 사업소개
* 뉴스레터
* 문의하기
* locale 전환
* canonical/SEO
* 공개 API

## 2-2. 내부 ERP

* 대시보드
* 서비스 허브
* 홈페이지 운영
* 뉴스/공지 운영
* 문의/리드
* 프로젝트/WBS
* 업무보고/업무일지
* 전자결재
* 조직/권한
* 평가
* 시스템 관리

## 2-3. 공통 운영 인프라

* Cloudflare Workers
* Hono API
* Neon Postgres
* auth / permission / request_id / audit
* rate limiting
* queue
* locale / domain / SEO helper

## 2-4. 데이터 및 운영 정책

* 5개 언어 발행 상태
* `www.jinbizman.com` canonical
* summary/detail 응답 구조
* 서비스 허브 등록 규칙
* WBS 연결 규칙
* 평가 evidence 규칙

즉 장애 대응도 외부, 내부, 인프라, 데이터 정책을 함께 봐야 합니다.

---

# 3. 장애 등급 정의

JINBIZ는 아래 4단계 SEV 체계를 사용합니다.

## 3-1. SEV-1

### 정의
서비스 핵심 기능이 전면 중단되거나, 데이터 무결성/보안에 중대한 문제가 있는 상태

### 예시
* `www.jinbizman.com` 전체 접속 불가
* `/api/health` 실패와 함께 공개 사이트/ERP 모두 사용 불가
* 로그인 불가 + 관리자 핵심 기능 전면 중단
* 문의 저장 실패 + 뉴스 조회 실패 + 페이지 조회 실패가 동시에 발생
* DB 연결 불가
* 권한 우회/민감 데이터 노출
* 잘못된 canonical/domain 정책으로 다른 호스트가 공개 기준으로 노출
* WBS/일일보고/평가 근거 데이터 훼손 또는 대량 유실

### 대응 목표
* **5분 이내** Incident Commander 지정
* **10분 이내** 1차 내부 공지
* **15분 이내** 임시 완화 또는 우회 방향 결정
* 필요 시 외부 공지 즉시 진행

## 3-2. SEV-2

### 정의
핵심 기능 일부가 중단되었지만 전체 서비스는 완전 다운이 아닌 상태

### 예시
* 문의 등록 실패
* 뉴스 조회/상세 일부 실패
* 특정 locale 페이지 전면 미노출
* 관리자에서 서비스 허브 접근 불가
* WBS 보드 저장 실패
* 업무보고/일지 제출 불가
* 결재 상신 또는 승인 불가
* 평가 evidence 조회 불가

### 대응 목표
* **15분 이내** 담당 지휘 체계 확정
* **30분 이내** 영향 범위 기록
* **당일 내 복구** 목표
* 우회 가능 여부 즉시 판단

## 3-3. SEV-3

### 정의
핵심 기능은 유지되지만 운영 품질이 크게 저하된 상태

### 예시
* 일부 뉴스 탭만 느리게 응답
* 문의 저장은 되지만 알림 후처리 지연
* 특정 관리자 화면만 과도한 지연
* locale 전환 후 일부 버튼/텍스트가 깨짐
* 모바일/태블릿에서 핵심 화면 레이아웃 이탈
* 감사로그는 남지만 필터 조회가 느림

### 대응 목표
* **영업일 1~3일 내** 복구
* 사용자 영향과 내부 영향 분리 기록
* 재발 방지 항목 도출

## 3-4. SEV-4

### 정의
경미한 문제이지만 향후 장애로 확대될 수 있는 상태

### 예시
* 일부 오탈자, 잘못된 empty state 문구
* 특정 locale의 SEO title 누락
* 로그 필드 일부 누락
* 관리자 카드 수치와 상세 값 일시 불일치

### 대응 목표
* 정기 배포에서 수정
* 장애 조짐 여부만 추적
* 누적 발생 시 상위 등급 재분류

---

# 4. 장애 분류 체계

JINBIZ는 장애를 아래처럼 분류합니다.

## 4-1. 외부 공개 사이트 장애

* 페이지 조회 장애
* locale 전환 장애
* canonical/SEO 장애
* 뉴스 리스트/상세 장애
* 문의 제출 장애
* 반응형 레이아웃 장애

## 4-2. 내부 ERP 장애

* 로그인/권한 장애
* 서비스 허브 장애
* 홈페이지 운영 장애
* 뉴스/공지 운영 장애
* 문의/리드 장애
* 프로젝트/WBS 장애
* 업무보고/업무일지 장애
* 결재 장애
* 평가 장애
* 감사로그/시스템 설정 장애

## 4-3. 공통 인프라 장애

* Worker 배포/라우팅 장애
* DB 연결 장애
* queue 장애
* rate limit 오동작
* locale/domain helper 오동작
* request_id / logging / audit 미기록

## 4-4. 데이터/운영 정책 장애

* WBS 없는 보고 허용
* 평가 evidence 없는 확정 허용
* 미발행 locale fallback 노출
* 잘못된 canonical host 저장
* 서비스 등록 없는 서비스 운영 메뉴 생성

## 4-5. 보안·접근 통제 장애

* 세션 검증 실패
* 권한 없는 메뉴/데이터 접근
* 승인 권한 우회
* audit log 누락 상태에서 쓰기 동작 허용
* 관리자 데이터 공개 노출

---

# 5. 지휘 체계와 역할

## 5-1. Incident Commander

### 역할
* 장애 대응 총괄
* 등급 판단
* 우선순위 결정
* 커뮤니케이션 승인
* 종료 선언 승인

## 5-2. Technical Owner

### 역할
* 원인 분석
* 복구 실행
* 임시 우회책 판단
* 로그 및 request_id 수집
* 재현 절차 정리

## 5-3. Product / Operations Owner

### 역할
* 사용자 영향도 판단
* 외부 공지 문구 작성
* 내부 운영 우선순위 조정
* 문의/리드/콘텐츠/프로젝트 영향 정리

## 5-4. Recorder

### 역할
* 타임라인 기록
* request_id/로그/결정사항 기록
* 회고 자료 정리
* 액션 아이템 추적

## 5-5. 승인/보고 라인

* SEV-1: 즉시 경영관리자/총괄 공유
* SEV-2: 운영 책임자 + 기술 책임자 공유
* SEV-3/4: 해당 모듈 담당 우선 대응 후 필요 시 공유

## 5-6. 대리 체계

* Incident Commander 부재 시 Technical Owner가 임시 대행
* Recorder 부재 시 Operations Owner가 타임라인 겸임
* 30분 이상 지속 SEV-1/2는 지휘 체계 재점검

---

# 6. 표준 대응 흐름

모든 장애는 아래 표준 순서를 따릅니다.

1. 감지
2. 접수
3. 등급 분류
4. Incident Commander 지정
5. 초기 사실 확인
6. 영향 범위 기록
7. 임시 완화 또는 격리
8. 복구
9. 검증
10. 공지 업데이트
11. 종료 선언
12. 회고

## 6-1. 15분 규칙

장애 접수 후 **15분 안에 최소 아래 4개는 반드시 정리합니다.**

* 장애 등급
* 영향 범위 초안
* 임시 우회 가능 여부
* 다음 업데이트 예정 시각

## 6-2. 변경 Freeze 규칙

아래 상황에서는 신규 기능 배포 또는 설정 변경을 일시 중지합니다.

* SEV-1 진행 중
* 원인 미확정 SEV-2 진행 중
* audit log 미기록 상태
* 잘못된 canonical/domain 반영 상태
* WBS/평가 데이터 무결성 의심 상태

---

# 7. 감지 채널

## 7-1. 자동 감지

* `/api/health` 체크 실패
* 주요 라우트 응답 실패
* DB 연결 실패
* queue 적체
* rate limit 급증
* 5xx 비율 급증
* 특정 locale 응답 이상
* 응답 시간 p95 급증

## 7-2. 수동 감지

* 운영자 제보
* 고객/사용자 문의
* 관리자 화면 미제출/지연 데이터 이상
* 뉴스/문의/결재 흐름 이상 발견
* 모바일/태블릿 깨짐 제보

## 7-3. 우선 기록 항목

* 발견 시각
* 제보자
* 경로
* 화면/URL
* locale
* request_id
* 관련 서비스/프로젝트/WBS 여부
* 브라우저 / 기기 / 해상도
* 직전 배포/설정 변경 여부

---

# 8. 초기 대응 체크리스트

장애를 접수하면 아래 순서로 먼저 확인합니다.

## 8-1. 기본 공통 체크

* `GET /api/health` 정상 여부
* 장애가 외부/내부/공통 중 어디인지
* 특정 locale만 문제인지 전체 문제인지
* 특정 기기만 문제인지 전체 문제인지
* 읽기 장애인지 쓰기 장애인지
* request_id 확보 가능 여부
* 최근 배포/설정 변경/콘텐츠 발행 여부
* DB 연결과 응답 시간 정상 여부
* auth/permission 관련인지 여부
* queue 후처리 지연인지 여부

## 8-2. 긴급성 판단

아래 중 하나라도 해당하면 SEV-1 또는 SEV-2 우선 검토

* 전체 접속 불가
* 로그인 불가
* 문의 저장 불가
* 뉴스/페이지 전면 미노출
* 서비스 허브/WBS 저장 불가
* 결재 승인 불가
* 평가 확정 잘못 허용
* 보안/권한 우회

## 8-3. 배포 영향 체크

* 최근 24시간 내 배포 여부
* 최근 24시간 내 `wrangler.jsonc`, domain, locale, permissions, rate-limit 설정 변경 여부
* 최근 24시간 내 뉴스 발행/예약/slug 변경 여부
* 최근 24시간 내 서비스 허브 도메인/권한/locale 변경 여부

---

# 9. 서비스별 장애 대응 플레이북

# 9-1. 공개 사이트 전체 장애

## 증상 예시
* 외부 홈페이지 전체 접속 불가
* 외부 5개 메뉴 전부 응답 불가
* 모든 locale 페이지 실패

## 우선 확인
* `/api/health`
* 배포 이력
* domain/canonical 설정
* 공개 라우트 전체 응답 여부
* DB 연결 여부
* 정적 자산 로드 여부

## 즉시 조치
* 최신 변경 사항 롤백 또는 비활성화 검토
* 운영 공지 준비
* 관리자 쪽 영향도도 함께 체크
* health 정상화 전 신규 배포 중지

---

# 9-2. 페이지 콘텐츠 장애 (`/api/site/pages/:slug`)

## 증상 예시
* 특정 페이지 404
* 특정 locale만 빈 화면
* canonical/alternate 잘못 노출
* 같은 slug가 다른 locale로 잘못 연결

## 우선 확인
* `service_content_items`
* `service_translations`
* locale 발행 상태
* slug 충돌 여부
* domain helper / seo helper
* summary/detail 응답 구조 차이

## 즉시 조치
* 잘못된 발행 상태 임시 숨김
* canonical 수정
* locale별 공개 상태 재검증
* 필요 시 기본 언어만 임시 공개 유지

---

# 9-3. 뉴스/공지 장애 (`/api/news`, `/api/news/:slug`)

## 증상 예시
* 뉴스 목록 비어 있음
* 특정 카테고리만 조회 불가
* 상세 페이지 404
* 특정 언어 뉴스가 잘못 노출
* 공시/공지 탭 전환 후 빈 상태만 노출

## 우선 확인
* `news_posts.status`
* `news_post_translations.status`
* category 값
* slug / locale unique 충돌 여부
* 최근 발행/예약 변경 이력
* 관리자 발행 승인 이력

## 즉시 조치
* 잘못된 locale 발행 상태 숨김
* 잘못된 slug 수정
* 카테고리 필터/쿼리 확인
* 잘못된 콘텐츠는 `archived` 또는 `hidden` 처리

---

# 9-4. 문의 등록 장애 (`/api/inquiries`)

## 증상 예시
* 문의 제출 실패
* 저장은 되는데 성공 메시지 실패
* 저장은 되는데 이메일 알림 누락
* 특정 locale 폼만 실패
* rate limit 오동작으로 정상 사용자 차단

## 우선 확인
* DB 저장 성공 여부
* queue 발행 성공 여부
* 입력 검증 변경 여부
* rate limit 오동작 여부
* locale validator
* 프론트 폼 locale 값 전달 여부

## 즉시 조치
* 저장 경로와 후처리 경로를 분리해 판단
* 저장 실패면 SEV-2 이상 검토
* 저장 성공/알림 실패면 알림 경로만 우선 복구
* 문의 유실 가능성 있으면 즉시 운영자 공지

## 핵심 원칙
* 이메일 실패가 문의 저장 성공을 망치면 안 됨

---

# 9-5. locale / LanguageSwitcher 장애

## 증상 예시
* 언어 전환 안 됨
* 5개 언어 중 일부만 노출
* 잘못된 locale path 생성
* fallback 노출
* 미발행 locale가 switcher에 노출

## 우선 확인
* `/api/locales`
* `SUPPORTED_LOCALES`
* `service_translations`
* `news_post_translations`
* 미발행 locale 노출 여부
* 현재 페이지 유지형 전환 로직

## 즉시 조치
* 미발행 locale 임시 숨김
* 기본 locale `ko` 복구
* alternate/hreflang 재생성 여부 확인
* locale switcher 캐시/상태 초기화 검토

---

# 9-6. canonical / 도메인 장애

## 증상 예시
* 비-www 주소가 canonical로 노출
* 잘못된 host가 SEO meta에 삽입
* 뉴스 상세 공유 링크가 다른 호스트로 생성
* locale alternate가 잘못된 도메인을 참조

## 우선 확인
* `service_domains`
* domain helper
* SEO helper
* `APP_BASE_URL` / system settings
* 최근 도메인 설정 변경 이력

## 즉시 조치
* canonical host를 `www.jinbizman.com`으로 즉시 고정
* 잘못된 alternate URL 숨김
* 운영 공지 필요 시 준비
* sitemap 재생성 필요 여부 판단

---

# 9-7. 서비스 허브 장애

## 증상 예시
* 서비스 목록 조회 불가
* 새 서비스 등록 불가
* 서비스 상세/도메인/언어 설정 불가
* 서비스 등록 후 메뉴 미노출
* 권한 템플릿 연결 실패

## 우선 확인
* `services`
* `service_content_types`
* `service_change_logs`
* 권한/스코프 검사
* 관리자 라우트 응답 여부
* locale/domain setting 저장 여부

## 즉시 조치
* 신규 서비스 등록을 임시 중지
* 기존 운영 서비스 영향도 분리
* 권한 문제인지 데이터 문제인지 우선 분리
* 잘못된 템플릿 자동 부착 중지 검토

---

# 9-8. 프로젝트/WBS 장애

## 증상 예시
* 프로젝트 생성 불가
* WBS 생성/수정 불가
* 상태 변경 실패
* 진행률 계산 이상
* 의존성 저장 실패
* 잘못된 직군 템플릿 적용

## 우선 확인
* `projects`
* `wbs_tasks`
* `wbs_task_dependencies`
* 권한/스코프
* 최근 템플릿 변경 이력
* progress validation
* job_family / work_style 매핑

## 즉시 조치
* 새 프로젝트 생성/대량 수정 기능 임시 제한 가능
* 핵심 진행 중 프로젝트 영향 우선 파악
* 잘못된 progress 값이나 상태값 입력 차단
* 잘못된 자동 계산 일시 중지 검토

---

# 9-9. 업무보고/업무일지 장애

## 증상 예시
* 아침 업무보고 제출 실패
* 퇴근 업무일지 제출 실패
* WBS 없는 제출 허용
* 제출은 되는데 집계 미반영
* 미제출자 집계 오류
* 중복 제출 제약 오동작

## 우선 확인
* `daily_reports`, `daily_report_items`
* `daily_logs`, `daily_log_items`
* `wbs_task_id` FK 연결
* 동일 날짜/프로젝트 중복 제약
* 대시보드 집계 쿼리
* progress 범위 검증

## 즉시 조치
* WBS 없는 제출은 즉시 차단
* 저장 경로와 집계 경로를 분리해서 파악
* 사용자 입력 유실 가능성 확인
* 수동 백필 또는 임시 입력 안내 필요 여부 판단

## 핵심 원칙
* WBS 없는 보고/일지는 허용하면 안 됨

---

# 9-10. 결재 장애

## 증상 예시
* 결재 상신 실패
* 승인/반려 처리 실패
* 결재선 불일치
* 승인 후 상태 반영 누락
* 다국어 공개 승인만 실패

## 우선 확인
* `approval_documents`
* `approval_lines`
* `approval_actions`
* approver 권한/라인
* 문서 종류별 payload 검증
* 승인 액션 중복 처리 여부

## 즉시 조치
* 승인 중단 여부 판단
* 결재 문서 손상 방지 우선
* 수동 승인/임시 우회가 필요한지 검토
* 이미 승인된 건의 후속 상태 반영만 실패한 경우 재처리 범위 확인

---

# 9-11. 평가 장애

## 증상 예시
* 평가 주기 조회 불가
* evidence 조회 실패
* 점수 입력 실패
* evidence 없이 finalize 허용
* 특정 사용자 평가 상세 깨짐
* cycle 상태 전환 실패

## 우선 확인
* `evaluation_cycles`
* `evaluation_items`
* `evaluation_scores`
* `evaluation_evidences`
* finalize 권한
* `source_type` / `source_id` 연결

## 즉시 조치
* evidence 없는 finalize 즉시 차단
* 점수 입력보다 evidence 조회 복구 우선
* 확정 단계 중단 필요 여부 판단
* 평가 마감 일정 영향도 기록

## 핵심 원칙
* 평가는 점수보다 근거 데이터가 먼저다

---

# 9-12. 감사로그 / 시스템 관리 장애

## 증상 예시
* audit log 미기록
* 로그인 기록 누락
* 시스템 설정 수정 반영 불가
* locale/domain setting 조회 실패
* request_id 누락

## 우선 확인
* `audit_logs`
* `request_id`
* actor 기록
* system settings
* 최근 설정 변경 이력
* middleware 적용 여부

## 즉시 조치
* 주요 쓰기 동작을 임시 제한할지 판단
* 기록 누락 구간 명확히 문서화
* 설정 변경 Freeze 검토
* 회고 시 보안/컴플라이언스 항목 별도 기록

---

# 10. 반응형 운영 장애 분류

JINBIZ는 반응형 깨짐도 운영 장애로 봅니다.

## 10-1. 외부 사이트 반응형 장애 예시

* Hero CTA 버튼 겹침
* 뉴스 탭 이탈
* 문의 폼 모바일 깨짐
* 특정 locale 문자열이 버튼 밖으로 넘침

## 10-2. 관리자 ERP 반응형 장애 예시

* 모바일에서 사이드바 진입 불가
* WBS 보드 사용 불가
* 승인 대기 확인 불가
* 문의 목록 카드/표 뷰 파손
* 뉴스 편집기 모바일/태블릿 사용 불가

## 10-3. 대응 원칙

* 읽기/쓰기 차단 수준이면 SEV-2 가능
* 단순 미세 UI 문제면 SEV-3/4
* 기기, 해상도, locale, 브라우저 조합을 같이 기록
* 재현이 어려우면 화면 캡처 + viewport + locale 값을 함께 남김

---

# 11. 다국어 운영 장애 분류

다국어 관련 문제는 부가 기능이 아니라 핵심 운영 장애로 봅니다.

## 11-1. 대표 장애 예시

* 특정 locale 공개 페이지 404
* locale별 slug 충돌
* 미발행 locale가 공개 노출
* 번역 상태와 실제 공개 상태 불일치
* locale 전환 후 잘못된 canonical 노출

## 11-2. 대응 원칙

* 기본 언어 `ko` 유지 여부 먼저 확인
* 보조 언어 문제면 해당 locale만 숨기고 본 서비스 보호
* 공개 상태/번역 상태/SEO 상태를 같이 확인
* locale switcher 노출과 실제 공개 상태를 분리해서 점검

## 11-3. 임시 완화 기준

* 특정 locale만 실패하면 해당 locale 임시 숨김 허용
* 기본 언어까지 영향이 확장되면 SEV 상향 검토
* fallback로 노출하는 임시 우회는 금지

---

# 12. 커뮤니케이션 원칙

## 12-1. 내부 공지 기본 형식

* 발생 시각
* 장애 등급
* 영향 범위
* 현재 증상
* 임시 조치
* 다음 업데이트 시각
* 담당자

## 12-2. 외부 공지 기본 원칙

* 사실만 적는다
* 원인 미확정 상태에서 단정하지 않는다
* 복구 예상이 불확실하면 확정 표현 금지
* 문의 저장, 공개 페이지, 뉴스 열람, 로그인 중 어떤 기능이 영향 받는지 명확히 쓴다

## 12-3. 예시 문구

### 공개 사이트 장애
> 현재 일부 페이지 접속이 원활하지 않습니다. 확인 중이며 복구 진행 상황은 순차 안내드리겠습니다.

### 문의 제출 장애
> 현재 문의 접수 기능에 일시적인 문제가 있어 복구 작업을 진행 중입니다. 빠르게 정상화하겠습니다.

### 관리자 ERP 장애
> 현재 일부 관리자 기능에서 오류가 발생하고 있어 확인 중입니다. 진행 상황은 내부 채널로 공유드리겠습니다.

## 12-4. 업데이트 주기

* SEV-1: **30분마다** 내부 상황 업데이트
* SEV-2: **1시간마다** 내부 상황 업데이트
* SEV-3: 필요 시 당일 1회 이상 업데이트
* 외부 공지는 영향 범위가 사용자에게 명확할 때만 게시

---

# 13. 타임라인 기록 규칙

장애 발생 시 Recorder는 최소 아래 항목을 남깁니다.

* 장애 ID
* 감지 시각
* 최초 제보자
* 등급
* Incident Commander
* 영향 서비스
* 영향 locale
* 영향 기기/브라우저
* 관련 request_id
* 임시 조치 시각
* 복구 완료 시각
* 외부/내부 공지 시각
* 회고 작성 완료 시각

권장 포맷:

```text
[2026-03-28 10:03] 감지
[2026-03-28 10:05] SEV-2 분류
[2026-03-28 10:08] 문의 저장 실패 확인
[2026-03-28 10:12] 알림 후처리와 저장 경로 분리 확인
[2026-03-28 10:20] 임시 완화
[2026-03-28 10:37] 복구 완료
[2026-03-28 11:10] 회고 초안 작성
```

## 13-1. request_id 기록 규칙

* 5xx 또는 validation 오류가 발생한 요청의 request_id를 우선 기록
* 저장/수정/승인/확정 등 쓰기 동작은 request_id 없이는 종료하지 않음
* request_id 누락 자체도 운영 이슈로 기록

---

# 14. 복구 완료 기준

복구 완료 선언은 아래를 모두 만족할 때만 합니다.

## 14-1. 공통 기준

* 증상 재현 불가
* 핵심 API 재확인 완료
* 로그상 5xx/validation 오류 급증 해소
* 관련 request_id와 에러 로그 정리
* 영향 받은 기능 smoke test 통과

## 14-2. 공개 사이트 기준

* 메인 홈, 회사소개, 사업소개, 뉴스레터, 문의하기 진입 가능
* locale 전환 가능
* canonical/alternate 정상
* 문의 제출 가능

## 14-3. 관리자 ERP 기준

* 로그인 정상
* 서비스 허브 조회 가능
* 프로젝트/WBS 조회/저장 가능
* 업무보고/일지 제출 가능
* 승인 처리 가능
* 평가 evidence 조회 가능

## 14-4. 데이터 무결성 기준

* 유실 건수 여부 확인
* 중복 저장 여부 확인
* 잘못 공개된 locale 또는 canonical 수정 여부 확인
* 수동 복구가 있었으면 범위와 대상 문서화

---

# 15. 회고(Postmortem) 템플릿

장애 종료 후 반드시 회고를 남깁니다.

## 15-1. 회고 기본 항목

* 장애 ID
* 등급
* 기간
* 영향 범위
* 사용자 영향
* 운영 영향
* 근본 원인
* 왜 더 빨리 감지되지 않았는지
* 무엇이 잘 작동했는지
* 무엇이 잘 작동하지 않았는지
* 재발 방지 액션
* 담당자
* 완료 기한

## 15-2. 재발 방지 액션 예시

* validator 강화
* locale/domain helper 테스트 추가
* queue 모니터링 추가
* WBS FK 제약/검증 강화
* evidence 없는 finalize 차단 로직 보강
* 반응형 QA 체크리스트 강화
* 배포 체크리스트에 canonical 검증 추가
* request_id 누락 방지 middleware 보강

## 15-3. 회고 완료 기준

* 근본 원인과 표면 원인을 분리 기재
* 재발 방지 액션에 담당자와 기한 부여
* 문서/체크리스트/테스트 중 최소 1개 이상 업데이트
* 동일 유형 재발 방지 지표 정의

---

# 16. 운영 지표와 모니터링 권장 항목

## 16-1. 공통 지표

* `/api/health` 성공률
* 5xx 비율
* p95 응답 시간
* DB 연결 실패 건수
* queue 지연 건수

## 16-2. 공개 사이트 지표

* `/api/site/pages/:slug` 실패율
* `/api/news` 실패율
* `/api/inquiries` 실패율
* locale별 공개 응답률
* 문의 제출 성공률

## 16-3. ERP 지표

* 로그인 실패율
* 서비스 허브 저장 실패율
* WBS 저장 실패율
* 업무보고/일지 제출 실패율
* 승인 액션 실패율
* 평가 evidence 조회 실패율

## 16-4. 데이터 품질 지표

* WBS 없는 보고 시도 건수
* evidence 없는 finalize 시도 건수
* 잘못된 canonical host 생성 시도 건수
* 미발행 locale 노출 차단 건수
* audit log 누락 건수

---

# 17. 장애 예방 체크리스트

## 17-1. 배포 전

* canonical host 확인
* locale별 발행 상태 확인
* 뉴스/문의/public routes smoke test
* 관리자 로그인/핵심 조회 확인
* WBS 없는 보고/일지 저장 차단 확인
* evidence 없는 finalize 차단 확인
* 모바일/태블릿 주요 화면 QA 확인

## 17-2. 콘텐츠 발행 전

* locale별 slug 중복 확인
* SEO title/description 확인
* 미발행 locale 노출 여부 확인
* 뉴스 카테고리 확인

## 17-3. 운영 정책 변경 전

* system settings 변경 범위 기록
* audit log 남는지 확인
* domain/locale helper 영향 범위 확인

## 17-4. 권한/결재 변경 전

* 승인선 변경 영향 범위 확인
* finalize 권한 유지 여부 확인
* 서비스별/프로젝트별 스코프 오염 여부 확인

---

# 18. 5단계 배포 완료 기준과 장애 대응 연결

이 장은 운영 문서가 개발 기준과 따로 놀지 않도록 하기 위한 장입니다. 장애 대응도 아래 5단계 완료 기준 위에서 판단합니다.

## 18-1. 1단계 배포 완료 기준과 연결

### 범위
* 메인 홈
* 회사소개
* 사업소개
* 뉴스레터 리스트 골격
* 문의하기 화면 골격
* 공통 헤더/푸터
* 디자인 토큰 1차 적용

### 운영 관점 장애 예시
* 첫 화면 접속 불가
* 5개 메뉴 라우팅 오류
* 문의 페이지 기본 폼 자체 미노출
* 기본 반응형 레이아웃 전면 파손

## 18-2. 2단계 배포 완료 기준과 연결

### 범위
* `src/lib/i18n.ts`
* 언어 선택기
* 언어별 라우트
* canonical / hreflang 정책
* `www.jinbizman.com` 기준 URL 정책
* 반응형 보강

### 운영 관점 장애 예시
* 5개 언어 라우트 불능
* 미발행 언어 fallback 노출
* `www.jinbizman.com` 기준 canonical 오작동
* 360px~1440px에서 버튼 겹침/카드 이탈/텍스트 깨짐

## 18-3. 3단계 배포 완료 기준과 연결

### 범위
* 문의 API 연결
* 문의 DB 저장
* 이메일 알림
* 관리자 셸
* 대시보드 기본 카드
* 서비스 허브 기본 CRUD
* 홈페이지 운영 기본 화면

### 운영 관점 장애 예시
* 문의 입력 → 저장 실패
* 저장 성공 후 알림 후처리 실패
* 관리자 셸 반응형 미동작
* 서비스 등록 시 언어/도메인/권한 템플릿 설정 불가

## 18-4. 4단계 배포 완료 기준과 연결

### 범위
* 프로젝트/WBS
* 아침 업무보고
* 퇴근 업무일지
* 뉴스/공지 운영
* 발행 승인
* 기본 전자결재
* 감사 로그 일부

### 운영 관점 장애 예시
* 업무보고/일지가 WBS를 참조하지 않는 저장 허용
* 프로젝트 진척률 집계 불능
* 뉴스레터 리스트/상세와 관리자 발행 불일치
* 게시 승인/전자결재 중단
* 감사 로그 저장 누락

## 18-5. 5단계 배포 완료 기준과 연결

### 범위
* 평가 근거 데이터 집계
* 평가 주기/항목/점수 입력/확정
* 권한 고도화
* Rate Limit
* Queue 후처리
* 테스트
* 운영 로그
* README / 환경변수 / 배포 기준

### 운영 관점 장애 예시
* 평가 점수보다 근거 데이터가 먼저 조회되지 않음
* 근거 없는 평가 확정 허용
* 공개 API rate limit 미적용 또는 오동작
* 문의 저장과 이메일 발송 미분리
* `request_id / actor / locale / duration` 기준 로그 누락
* 운영 기준 문서만으로 복구 판단이 불가능한 상태

---

# 19. 대표 장애 시나리오별 1페이지 요약

## 19-1. 공개 사이트 전체 다운

* 등급: 보통 SEV-1
* 먼저 볼 것: `/api/health`, 최근 배포, DB 연결
* 즉시 조치: 롤백/공개 공지/관리자 영향도 확인

## 19-2. 문의 저장 실패

* 등급: 보통 SEV-2
* 먼저 볼 것: DB insert, validator, rate limit
* 즉시 조치: 저장 경로 우선 복구, 알림과 분리 판단

## 19-3. 특정 locale 전체 장애

* 등급: 보통 SEV-2 또는 SEV-3
* 먼저 볼 것: 발행 상태, slug, locale helper
* 즉시 조치: 해당 locale 임시 숨김, 기본 언어 유지

## 19-4. WBS 저장/조회 실패

* 등급: 보통 SEV-2
* 먼저 볼 것: project/WBS FK, validator, 권한
* 즉시 조치: 진행 중 프로젝트 영향 우선 파악

## 19-5. 업무보고/일지 저장 실패

* 등급: 보통 SEV-2
* 먼저 볼 것: WBS FK, 날짜 중복, progress validation
* 즉시 조치: 입력 유실 여부 확인, 수동 보완 절차 준비

## 19-6. 결재 승인 실패

* 등급: 보통 SEV-2
* 먼저 볼 것: approval_lines, approver scope, action validator
* 즉시 조치: 승인 중단/수동 우회 여부 판단

## 19-7. 평가 evidence 조회 실패

* 등급: 보통 SEV-2 또는 SEV-3
* 먼저 볼 것: `source_type/source_id` 연결, cycle 상태
* 즉시 조치: finalize 중단, 근거 조회 복구 우선

## 19-8. 반응형 관리자 사용 불가

* 등급: 쓰기 동작 차단 시 SEV-2 가능
* 먼저 볼 것: 특정 viewport, 브라우저, locale, drawer/table/card 전환 로직
* 즉시 조치: 모바일 카드 뷰 또는 안전한 가로 스크롤 임시 활성화 검토

---

# 20. 문서 교체용 최종 체크리스트

## 20-1. 이 문서가 기존 `incident-playbook.md`를 즉시 대체할 수 있어야 하는 이유

* JINBIZ 구조에 맞는 장애 등급과 분류 체계를 포함했습니다.
* 외부 공개 사이트와 내부 ERP를 함께 보는 대응 구조를 포함했습니다.
* 서비스 허브, 문의, 뉴스, 페이지 콘텐츠, WBS, 업무보고/일지, 결재, 평가, locale/domain 장애 체크리스트를 포함했습니다.
* 저장과 알림 분리, WBS 없는 보고 금지, evidence 없는 평가 확정 금지 같은 핵심 운영 규칙을 반영했습니다.
* 반응형, 5개 언어, `www.jinbizman.com` 정책을 장애 대응 기준에도 포함했습니다.
* 감지/분류/복구/공지/회고까지 실제 운영 흐름을 포함했습니다.
* 5단계 배포 완료 기준과 장애 대응 연결까지 포함했습니다.

## 20-2. 최종 검수 체크리스트

### 공통
* 감지 → 분류 → 복구 → 회고 흐름 존재
* SEV 기준 존재
* 지휘 체계 존재
* request_id / audit / queue 고려 존재

### 공개 사이트
* 페이지
* 뉴스
* 문의
* locale
* canonical 장애 대응 포함

### ERP
* 서비스 허브
* WBS
* 업무보고/일지
* 결재
* 평가
* 시스템 관리 장애 대응 포함

### 운영 정책
* 5개 언어
* `www.jinbizman.com`
* 반응형 운영 장애 포함
* 저장/알림 분리 포함
* WBS 없는 보고 금지 포함
* evidence 없는 finalize 금지 포함

## 20-3. 변경 요약

* `docs/operations/incident-playbook.md`를 **JINBIZ 전용 장애 대응 플레이북**으로 재정의했습니다.
* 외부 공개 사이트와 내부 ERP를 하나의 운영 체계로 보고 장애를 분류하도록 정리했습니다.
* SEV 등급, 지휘 체계, 감지 채널, 초기 대응, 서비스별 플레이북, 공지 원칙, 회고 템플릿을 포함했습니다.
* 서비스 허브 / 문의 / 뉴스 / WBS / 업무보고·업무일지 / 결재 / 평가 / locale·domain 장애 대응 기준을 반영했습니다.
* 5개 언어, `www.jinbizman.com`, 반응형 운영 기준을 장애 대응 관점으로 내려 정리했습니다.
* 5단계 배포 완료 기준과 연결되는 운영 기준을 추가했습니다.

## 20-4. 최종 완료도

이 문서의 완료도는 아래 기준으로 판단합니다.

* 구조적 연속성 유지: 완료
* 기존 세부 유지: 완료
* 신규 요구사항 3종 반영: 완료
* 5단계 배포 완료 기준 반영: 완료
* 운영 실사용성: 완료
* JINBIZ 구조 맞춤성: 완료

> **최종 완료도: 100%**

---

## 다음 단계

가장 자연스러운 다음 작업은 **이 문서를 기준으로 `runbook-checklist.md`, `postmortem-template.md`, `status-message-templates.md`까지 운영 문서 3종을 바로 생성하는 것**입니다.
