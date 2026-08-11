# 2026-08-10 Enterprise Benchmark & Trust Layer

- Samsung Electronics / SK / Hyundai Motor / Hyundai Group / Saltlux 공식 사이트 기반 기업 신뢰·사업·편집형 콘텐츠 패턴 재검토
- NAVER WORKS / Hiworks / DaouOffice 공식 제품 구조 기반 ERP 운영 흐름 재검토
- 5개 언어 홈에 enterprise proof / project status / NOW AT JINBIZ 레이어 추가
- 회사소개에서 검증되지 않은 2018 설립 단정, 임직원 100명, 자본금 24억원, 예시 수상·인증 제거
- 외부 확인 가능한 2020년 대외 활동 기록 수준으로 회사 연혁 표현 정합화
- Worker/Neon 연결 성공 시 ERP 대시보드 정적 샘플을 숨기고 live operations 데이터만 표시
- 운영 폼의 demo 명칭 제거 및 포털 시연 표현을 실제 운영 흐름 표현으로 수정
- 5개 언어 홈에 최소·검증 가능한 Organization JSON-LD 추가
- 상세 기준은 `BENCHMARK_RESEARCH_20260810.md` 참조

# 2026-08-09 World-Class Production Hardening

- 공개 `worldclass.css/js` 실제 연결 및 micro-interaction/접근성 보강
- ERP `erp-worldclass.css`, production/core/operations/live data bridges 연결
- Worker API: 서비스/콘텐츠/뉴스/문의·리드/프로젝트/WBS/보고/결재/평가/운영 모듈 확장
- DB 011 production hardening + 012 workplace operations 추가
- 로그인 잠금/로그인 이력/audit/rate limit/security headers/email delivery log 추가
- 고정 데모 관리자 seed 및 문서 비밀번호 제거
- 문의 5개 언어 페이지를 실제 Worker API 처리 안내와 일치시킴
- Node 13/13, Python 77/77, typecheck/build/JS syntax 최종 PASS

# 변경 이력

## 2026-08-05 · 홈페이지 콘텐츠 + Stitch ERP 최종 통합

- 기존 JINBIZ 홈페이지·ERP 전체 패키지와 `adminERP_stitch_ai` 통합
- 원본 ZIP 2개를 `source-files/`에 보존
- Stitch 원본 시안 screen.png 15개, code.html 15개 보존
- 메인 홈에 문제 정의, 프로젝트 4종, 신뢰 근거, 초기 소식 추가
- 회사소개에 회사 정의, 존재 이유, 변화 과정, 핵심 역량, Company Facts 추가
- 사업소개에 4개 프로젝트 상세 연결과 상태 투명성 강화
- 뉴스레터 초기 공식 게시물 5개 추가
- 문의하기에 8개 유형, 선택 필드, 보안 안내, 5단계 처리 흐름, FAQ 추가
- 프로젝트 상세 4종 × 5개 언어 = 20개 생성
- 초기 뉴스 상세 5종 × 5개 언어 = 25개 생성
- sitemap 90개 공개 URL로 재생성
- 전체 화면 미리보기 갱신
- ERP 공통 셸을 Stitch 기반 라벤더·블루·바이올렛 디자인으로 고도화
- 대시보드, 서비스 허브, WBS, 업무보고, 평가, 콘텐츠 운영 핵심 패턴 추가
- ERP 44개 화면의 인코딩된 배지·진행률·스위치 313개 복원
- 재발 방지 자동 테스트 추가
- 정적 테스트 38개, 공개 브라우저 QA, ERP 브라우저 QA, JavaScript 문법검사 통과

## 2026-08-04 · 홈페이지 + ERP 통합본

- JINBIZ 5개 언어 공식 홈페이지 복원
- ERP 16개 업무 영역, 82개 업무 화면 추가
- 관리자 로그인, 통합 시작 화면, 전체 화면 인덱스 추가
- 서비스 허브·홈페이지 운영·뉴스·문의/리드 구현
- 프로젝트/WBS·업무보고·결재·조직/권한 구현
- 근태·휴가·타임시트·예산·지출·OCR 구현
- 목표/OKR·지식관리·AI 문의·평가·리포트 구현
- IA·API·DB·운영 문서와 SQL 세트 포함

## 2026-08-08 — Main page & shared shell refinement
- Public top navigation fixed to Company / Business / Newsletter / Contact; Home removed.
- Added desktop dropdown and mobile accordion submenus.
- Added company legal/basic information to footer.
- Standardized responsive typography and reduced section spacing.
- Split main-page image assets into independent paths under `assets/images/home/`.
- Rebuilt Korean home Hero, WHY JINBIZ, Business Structure, and 5-domain Business Portfolio.
- Removed requested home sections: principles, flagship AI, future duplicate portfolio, evidence, latest/newsroom/contact blocks.

## 2026-08-08 Round 2
- Centered public navigation and section-anchor submenus
- Simplified footer
- Rebuilt Company, Business, Newsletter, Contact pages per feedback
- Removed Company preview from Home
- Added wide contact form and Life Service experience previews
- 57 automated tests passed

## 2026-08-10 — Enterprise Re-audit / Performance & Signature pass

- 삼성전자·SK·현대자동차/그룹·현대그룹·솔트룩스 및 NAVER WORKS·Hiworks·DaouOffice 공식 자료 기준 재비교
- 홈/사업 공개 이미지 웹 해상도 최적화: source image payload 약 51.1MB → 6.7MB
- Hero preload priority / below-the-fold lazy loading 적용
- 외부 CDN webfont import 제거
- CSP의 미사용 third-party font/image 허용 제거
- CSS/DOM 기반 `Human → AI → Real Output` JINBIZ hero signature signal 추가
- 성능/마크업/CSP 회귀 테스트 추가

## 2026-08-10 Production 100% hardening
- Production build now requires native Vite; sandbox fallback is isolated to `build:sandbox`.
- Exact-pinned direct dependencies and npm reproducibility policy added.
- Admin cookie writes now reject missing Origin unless Bearer authentication is used.
- Public Newsroom normalized to Press / Disclosure / Notice and category-aware URLs.
- Obsolete MPA sitemap routes removed; legal routes added.
- Duplicate top-level SEO effect removed.
- Inquiry background notification response wording corrected.
- Release preflight gate added.
- Final automated verification: 67/67 tests PASS.

## 2026-08-10 — World-Class Art Direction Rebuild
- Rebuilt public visual hierarchy from flat card repetition to cinematic/editorial stage composition.
- Added premium Hero manifesto, editorial rail, proof layer, spatial portfolio, domain atlas, and Cybertron blueprint.
- Rebuilt ERP shell as a precision command center with contextual command bar, decision queue and operations radar.
- Added design-quality regression tests and retained all existing Worker/ERP/release contracts.

## 2026-08-10 — Design Rebuild v4
- Replaced theatrical premium/demo styling with restrained enterprise editorial art direction.
- Removed visible release-candidate/status theatrics from public and ERP chrome.
- Added artdirection.css and made sandbox build include it.
- Updated design-quality regression tests.
