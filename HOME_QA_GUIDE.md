# JINBIZ 집에서 실행·화면 QA·배포하는 방법

이 문서는 `feature/uiux-enterprise-hardening-20260820` 브랜치 기준입니다.

## 1. 준비물

- Windows 10/11
- Node.js 20.19 이상
- npm 10 이상
- VS Code
- Git
- 실제 운영 검증 시 Cloudflare 계정과 Neon DB 접속 정보

실제 `DATABASE_URL`, `JWT_SECRET`, 이메일 API 키는 ZIP이나 GitHub에 넣지 않습니다.

## 2. 가장 쉬운 자동 검증

압축을 푼 폴더에서 `RUN_HOME_QA.bat`를 더블클릭합니다.

자동으로 아래 작업을 순서대로 수행합니다.

1. `npm ci`
2. Playwright Chromium 설치
3. TypeScript 검사
4. Worker/React 테스트
5. Vite 프로덕션 빌드
6. Desktop 1440 / Tablet 768 / Mobile 390 화면 캡처
7. 공개 홈페이지 5개 언어 + ERP 35개 화면 QA 보고서 생성

결과는 다음 폴더에 생성됩니다.

```text
qa-artifacts/
├─ visual-qa-summary.md
├─ visual-qa-report.json
└─ screenshots/
   ├─ desktop-1440/
   ├─ tablet-768/
   └─ mobile-390/
```

## 3. 수동 실행 명령어

```bash
npm ci
npx playwright install chromium
npm run typecheck
npm test
npm run build
set QA_ALLOW_ISSUES=1
node scripts/capture-visual-qa.mjs --serve
```

PowerShell에서는 아래처럼 설정합니다.

```powershell
$env:QA_ALLOW_ISSUES="1"
node scripts/capture-visual-qa.mjs --serve
```

## 4. P0 / P1 판단

### P0

- 페이지 렌더링 실패
- 가로 넘침 2px 초과
- 깨진 이미지
- JavaScript page error
- 본문이 사실상 비어 있음

### P1

- 브라우저 console error
- 자동 렌더링은 됐지만 추가 확인이 필요한 상태

`visual-qa-summary.md`에서 P0부터 수정합니다.

## 5. 실제 ERP 데이터까지 연결하기

`.dev.vars.example`을 복사하여 `.dev.vars`를 만듭니다.

```env
DATABASE_URL=실제_Neon_Postgres_URL
JWT_SECRET=충분히_긴_랜덤_문자열
```

로컬 Worker 실행:

```bash
npm run dev:worker
```

주의: 프론트에서 DB에 직접 연결하지 않습니다. DB 연결은 Worker만 수행합니다.

## 6. Git main 반영 전 검증

```bash
npm run verify
```

통과한 뒤 현재 브랜치와 `main`을 비교합니다.

```bash
git status
git log --oneline --decorate -10
git diff main...HEAD -- src package.json package-lock.json wrangler.jsonc
```

관련 없는 파일이나 실제 비밀값이 포함되지 않았는지 확인합니다.

## 7. Cloudflare 운영 배포

최초 1회 로그인:

```bash
npx wrangler login
```

운영 비밀값 등록:

```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put JWT_SECRET
```

배포 전 최종 검증:

```bash
npm run verify
npm run release:check
```

운영 배포:

```bash
npm run deploy
```

## 8. 배포 후 확인 URL

```text
https://www.jinbizman.com
https://www.jinbizman.com/company
https://www.jinbizman.com/business
https://www.jinbizman.com/newsletter
https://www.jinbizman.com/contact
https://www.jinbizman.com/admin/login
https://www.jinbizman.com/api/health
```

추가 확인:

- `https://jinbizman.com`이 `https://www.jinbizman.com`으로 이동하는지
- 관리자 로그인과 로그아웃이 정상인지
- 문의 저장이 DB에 반영되는지
- Desktop/Tablet/Mobile에서 가로 넘침이 없는지
- 한국어·영어·일본어·불어·스페인어 경로가 정상인지

## 9. 배포 실패 시 우선 점검

### 빌드 실패

```bash
npm ci
npm run typecheck
npm run build
```

### 관리자 로그인 500

- `JWT_SECRET` 등록 여부
- `DATABASE_URL` 등록 여부
- `wrangler.jsonc`의 `nodejs_compat`
- 관리자 계정 생성 여부

### DB 연결 오류

- Neon URL의 `sslmode=require`
- 비밀번호 특수문자 인코딩
- 운영 Worker secret에 실제 값이 들어갔는지

### 화면이 이전 상태로 보임

- 현재 브랜치와 커밋 확인
- Cloudflare 배포 로그의 commit SHA 확인
- 브라우저 강력 새로고침
- 캐시 무효화 후 재확인
