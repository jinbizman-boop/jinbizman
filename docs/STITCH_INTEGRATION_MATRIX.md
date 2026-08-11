[최신 상태 안내] 이 문서는 제작 과정의 이전 검증 기록입니다. Mock/localStorage/정적 시연 관련 설명은 2026-08-09 production hardening 이전 상태이며, 현재 운영 기준은 README.md와 docs/PRODUCTION-WORLDCLASS-UPGRADE-20260809.md를 우선합니다.

# JINBIZ ERP Stitch AI 통합 매트릭스

## 목적

`adminERP_stitch_ai(1).zip`에 포함된 15개 디자인 시안의 정보 구조와 시각 언어를 기존 JINBIZ 홈페이지 + ERP 정적 구현본에 통합하기 위한 적용 근거를 기록한다. 원본 `code.html`과 `screen.png`는 `docs/stitch-admin-reference/`에 그대로 보존하며, 실제 운영 화면은 기존 82개 ERP 화면의 링크·스크립트·데이터 훅을 유지한 상태에서 공통 디자인과 핵심 모듈 패턴을 적용한다.

## 통합 원칙

1. 기존 ERP의 82개 화면과 인터랙션 훅을 삭제하지 않는다.
2. Stitch 시안의 특정 공공사업·전주트랙 데이터는 JINBIZ 운영 데이터로 사용하지 않는다.
3. 라벤더 사이드바, 화이트 캔버스, 블루·바이올렛 포인트, KPI 카드, AI 액션 센터, 위험 프로젝트와 근거 우선 평가 패턴만 재해석한다.
4. 디자인 원본은 참고 자료로 보존하되 `docs/stitch-admin-reference/`의 HTML은 실제 서비스 라우트가 아니므로 active runtime 링크 검사에서 제외한다.
5. 반응형, 키보드 접근, 기존 localStorage 시연과 ERP 공통 스크립트가 우선한다.

## 시안별 적용

| Stitch 원본 | 핵심 패턴 | 실제 적용 화면 | 적용 내용 |
|---|---|---|---|
| `v2_1` | 통합 대시보드, AI 권고, 위험 프로젝트 | `admin/dashboard.html` | `AI 업무 추천 및 긴급`, `집중 관리 프로젝트`, 프로젝트 위험 라벨과 바로가기 |
| `v2_2` | 서비스 허브, 서비스 등록 CTA | `admin/services.html`, `admin/service-new.html` | `서비스 운영 포트폴리오`, `Register New Service`, 도메인·언어·권한 중심 서비스 운영 |
| `v2_3` | 오전 보고, 퇴근 일지, 팀 제출 상태 | `admin/daily-report.html`, `admin/daily-log.html`, `admin/team-submissions.html` | WBS 연결형 오전 보고와 팀 제출 현황 스트립 |
| `v2_4` | AI 평가 요약, 산출물 근거 | `admin/evaluation-evidence.html` | 점수보다 먼저 보이는 `AI 성과 분석 요약`과 `주요 산출물 증빙` |
| `wbs`, `wbs_v2` | WBS 칸반, 위험 요약 | `admin/wbs-board.html` | 프로젝트 WBS 대시보드, 승인 대기·리스크 요약 |
| `_6` | 글로벌 콘텐츠, 번역, SEO | `admin/site-content.html`, `admin/site-seo.html`, `admin/site-translations.html` | 글로벌 콘텐츠 & 뉴스 센터, 도메인 & SEO 상태 패널 |
| `_3`, `jinbiz` | 라벤더 내비게이션과 밝은 ERP 셸 | ERP 82개 전체 | `--stitch-sidebar-bg`, `--stitch-primary`, `--stitch-violet` 공통 토큰 적용 |
| `_4`, `_5` | 운영 카드·상세 패널 | 문의·결재·프로젝트 화면 | 기존 카드·드로어 패턴의 밀도와 상태 강조에 참고 |
| `_1`, `_2`, `ai_1`, `ai_2` | 공공사업·AI 운영 예시 | 원본 보존만 | JINBIZ와 직접 관련 없는 사업 데이터는 적용하지 않고 정보 위계만 참고 |

## 공통 디자인 토큰

- `--stitch-primary: #4f63f6`
- `--stitch-violet: #8b6cf6`
- `--stitch-sidebar-bg: #f0edff`
- `--stitch-canvas: #f7f8fc`
- `--stitch-line: #e3e2ef`

## 검증 대상

- ERP 82개 화면 공통 셸 존재
- 모바일 오프캔버스 사이드바와 데스크톱 고정 사이드바
- 기존 명령 검색, 칸반 드래그, 보고 항목 추가, 결재, 평가 점수, OCR, AI 도우미 동작
- 관리자 핵심 6개 화면의 신규 Stitch 패턴 렌더링
- 데스크톱·태블릿·모바일 가로 넘침과 깨진 자산 여부

## 시각 무결성 보강

통합 후 실제 브라우저 캡처에서 ERP 표 일부가 상태 배지·진행률·스위치용 HTML을 문자로 표시하는 문제를 발견했다. 44개 ERP 화면의 313개 인코딩 조각을 실제 UI 요소로 복원하고, `test_admin_tables_do_not_render_encoded_html_fragments` 회귀 테스트를 추가했다. 수정 후 ERP 82개 데스크톱 화면과 32개 태블릿·모바일 사례를 다시 검증해 오류 0을 확인했다.
