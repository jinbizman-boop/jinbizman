# JINBIZ 홈페이지 + ERP Go-Live 체크리스트

## A. 소스 패키지에서 완료된 항목

- [x] 공식 홈페이지 5개 언어 구조 및 canonical/hreflang
- [x] 최신 Company / UHDM 중심 Business / Newsletter / Contact 콘텐츠 회귀검증
- [x] Family Site 실제 URL 연결 및 불필요 화살표 제거
- [x] 공개 페이지 World-class visual/interactions 레이어 연결
- [x] ERP 공통 디자인/반응형/접근성 레이어 연결
- [x] 서비스 허브, 홈페이지 콘텐츠, 뉴스/공지, 문의/리드 실 API
- [x] 프로젝트/WBS, 업무보고/업무일지 실 API 및 업무 규칙
- [x] 전자결재 초안/상신/승인/반려/보완요청 실 API
- [x] 평가 근거/점수/확정 precondition 실 API
- [x] 개인 To-do, 근태, 휴가, 타임시트, 투입률 운영 데이터 모델/API
- [x] 프로젝트 예산/지출/정산 운영 데이터 모델/API
- [x] 목표/KPI, 게시판, 지식문서, 연동 메타데이터, 이메일 템플릿 운영 API
- [x] 조직/역할, 공통코드, 결재서식, 프로젝트 회의/이슈, 배포이력, 사이트 배너/네비게이션, 지식서식 운영 API
- [x] R2 미디어 업로드/공개 조회 API 및 미설정 환경 fail-closed
- [x] 001~013 Neon SQL 마이그레이션 및 원자적 migration runner
- [x] JWT HttpOnly/SameSite 세션, 5회 로그인 실패 잠금, 로그인 이력
- [x] RBAC/permission, 감사로그, request ID, Rate Limit, 보안 헤더
- [x] 문의 DB 저장 후 이메일 알림 후처리 및 delivery log
- [x] 프로덕션 seed에서 고정 관리자 비밀번호 제거
- [x] TypeScript typecheck / Node Worker tests / Python 정적 회귀 / build 통과

## B. 실제 Cloudflare/Neon 계정에서 반드시 수행할 항목

- [ ] Neon production database 생성 및 `DATABASE_URL` 확보
- [ ] `npm run db:migrate` 실행
- [ ] `npm run db:seed` 실행
- [ ] `ADMIN_EMAIL`, `ADMIN_PASSWORD` 환경변수로 `npm run admin:create` 실행
- [ ] Cloudflare `DATABASE_URL`, `JWT_SECRET`, `RESEND_API_KEY` Secrets 등록
- [ ] 실제 미디어 업로드 운영 시 R2 `jinbiz-media` 생성 및 `MEDIA_BUCKET` binding 연결
- [ ] Resend 등 이메일 발신 도메인/주소 검증
- [ ] `www.jinbizman.com` Custom Domain/DNS 연결
- [ ] `jinbizman.com` → `www.jinbizman.com` 301 실제 응답 확인
- [ ] production `/api/health` DB connected 확인
- [ ] 로그인 실패 잠금/성공/로그아웃 smoke test
- [ ] 서비스 → 프로젝트 → WBS → 업무보고/일지 → 결재 → 평가 E2E smoke test
- [ ] 공개 문의 → ERP 저장 → 이메일 delivery log 확인
- [ ] 실제 모바일 Safari / Android Chrome / iPad / Chrome / Edge 시각 회귀 확인
- [ ] 개인정보처리방침·이용조건 최종 법무 검수
- [ ] EN/JA/FR/ES 핵심 브랜드 문구 원어민 검수

## C. 외부 제공자 연결 전까지 의도적으로 비활성인 확장 기능

OCR, 사내 RAG/AI 검색, 외부 AI 자동 브리핑처럼 별도 제공자·인덱스가 필요한 기능은 가짜 성공 결과를 만들지 않습니다. R2는 미디어 라이브러리용 실제 구현이 있으나 운영 bucket binding 전에는 fail-closed 상태입니다. 실제 제공자 자격증명과 데이터 소스를 연결한 후 활성화하십시오.

## D. 완료 판정 규칙

이 저장소는 **프로덕션 소스 패키지**입니다. B 항목은 사용자의 실제 Cloudflare/Neon/도메인/이메일 계정에서만 검증할 수 있으므로, 해당 smoke test가 끝나기 전에는 라이브 운영 100%라고 판정하지 않습니다.
