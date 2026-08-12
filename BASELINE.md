# JINBIZ MANAGEMENT Production Baseline

## Baseline Metadata

- Baseline date: 2026-08-12T14:54:18.0499503+09:00
- Project: JINBIZ MANAGEMENT official homepage + ERP
- Production URL: https://www.jinbizman.com
- Repository: git@github.com:jinbizman-boop/jinbizman.git
- Branch: main
- Source of Truth PDFs:
  - C:/Users/Telos_PC_17/Downloads/JINBIZ_MANAGEMENT_FullStack_Function_Performance_Requirements_v2.0_FINAL_20260812.pdf
  - C:/Users/Telos_PC_17/Downloads/JINBIZ_MANAGEMENT_Complete_Development_Master_Plan_v2.0_FINAL_20260812.pdf
- P0 scope: P0-001 - Git/Deployment baseline record only

## Git

- Repository root: C:/Users/Telos_PC_17/Desktop/jinbizman_official_homepage
- Local HEAD: 6e13881fe4db818eafa7b73da9d2d84afcccc127
- Local short SHA: 6e13881
- Origin Main HEAD: 6e13881fe4db818eafa7b73da9d2d84afcccc127
- Local/Remote Sync: MATCH
- Ahead/Behind: none reported by `git status --short --branch`
- Working Tree: clean before BASELINE.md creation
- Branch: main
- Latest Commit: fix: stabilize production admin password verification
- Commit Author: jinbizman-boop <jinbizman@gmail.com>
- Author Date: Tue Aug 11 18:02:12 2026 +0900
- Commit Date: Tue Aug 11 18:02:12 2026 +0900
- Remote URL:
  - fetch: git@github.com:jinbizman-boop/jinbizman.git
  - push: git@github.com:jinbizman-boop/jinbizman.git
- Recent commits:
  - 6e13881 fix: stabilize production admin password verification
  - 6646fd6 fix: Cloudflare Worker 관리자 비밀번호 검증 안정화
  - 60633be fix: production 관리자 로그인 PBKDF2 검증 수정
  - 967dc67 feat: JINBIZ 공식 홈페이지 및 ERP 통합 운영본

## Source Structure

- src: present
- worker: present
- db: present
- public: present
- tests: present
- scripts: present
- wrangler.jsonc: present
- package.json: present
- package-lock.json: present
- README.md: present
- .github: not present

## Database Migration Source

- Migration count: 13
- First migration: 001_core_org_auth.sql
- Latest migration: 013_remaining_admin_operations.sql
- Migration files:
  - 001_core_org_auth.sql
  - 002_service_hub.sql
  - 003_public_content.sql
  - 004_projects_wbs.sql
  - 005_daily_reports_logs.sql
  - 006_approvals.sql
  - 007_evaluations.sql
  - 008_domains_locales.sql
  - 009_audit_notifications.sql
  - 010_indexes_constraints.sql
  - 011_production_hardening.sql
  - 012_workplace_operations.sql
  - 013_remaining_admin_operations.sql
- Migration execution status: NOT VERIFIED in P0-001; source files only were inspected

## Cloudflare Worker

- Worker name from wrangler.jsonc: jinbizman
- Official expected Worker name: jinbizman
- Worker name mismatch: no mismatch in local config
- Worker entry: worker/index.ts
- Compatibility date: 2026-08-09
- Compatibility flags:
  - nodejs_compat
- Assets:
  - directory: ./dist
  - binding: ASSETS
  - not_found_handling: single-page-application
- Worker-first paths:
  - /api/*
  - /admin/*
- Public environment variable names in wrangler.jsonc:
  - APP_BASE_URL
  - ADMIN_ALLOWED_ORIGINS
  - APP_ENV
  - SESSION_TTL_SECONDS
  - PUBLIC_RATE_LIMIT_PER_10_MIN
  - LOGIN_RATE_LIMIT_PER_10_MIN
  - INQUIRY_NOTIFY_TO
  - INQUIRY_EMAIL_FROM
- Observability:
  - enabled: true
  - logs.head_sampling_rate: 1
  - traces.enabled: true
  - traces.head_sampling_rate: 0.05
- Production domain related local config:
  - APP_BASE_URL: https://www.jinbizman.com
  - ADMIN_ALLOWED_ORIGINS includes https://www.jinbizman.com and https://jinbizman.com
- Cloudflare CLI authentication: NOT VERIFIED
  - `npx wrangler whoami` failed because the Wrangler auth token is expired in a non-interactive environment.
- Cloudflare account: NOT VERIFIED
- Current deployment/version: NOT VERIFIED
- workers.dev URL: NOT VERIFIED
- Custom domain binding in Cloudflare dashboard: NOT VERIFIED by CLI; production URLs were checked directly below

## Cloudflare Build

- Repository: jinbizman-boop/jinbizman
- Production branch: main in Git; Cloudflare dashboard setting NOT VERIFIED
- Build command:
  - package script `build`: vite build
  - Cloudflare Build dashboard value: NOT VERIFIED
- Deploy command:
  - package script `deploy`: npm run build && npm run release:check && wrangler deploy
  - Cloudflare Build dashboard value: NOT VERIFIED
- Root directory: repository root assumed by local config; Cloudflare Build dashboard value NOT VERIFIED
- Latest deployment commit: NOT VERIFIED
- Latest build status: NOT VERIFIED
- Verification status: Cloudflare Build settings require Dashboard or authenticated Wrangler/API access

## Domain

- Canonical: https://www.jinbizman.com
- Homepage status: 200
- Homepage content: JINBIZ MANAGEMENT page detected
- HTTPS: working for https://www.jinbizman.com
- Apex redirect: NOT REDIRECTING at baseline
  - https://jinbizman.com returned HTTP 200 with JINBIZ page content instead of 301/302 to https://www.jinbizman.com
- Custom domain status: https://www.jinbizman.com is serving production content

## Production Health

- Homepage: https://www.jinbizman.com returned HTTP 200
- /api/health: https://www.jinbizman.com/api/health returned HTTP 200
- Worker response: JSON health response detected
- Environment: production
- Database: connected
- Health databaseTime: 2026-08-12T05:54:18.990Z
- Checked at: 2026-08-12T14:54:18.0499503+09:00

## Git Ignore / Security

- Secret files excluded: yes
  - .dev.vars ignored
  - .dev.vars.* ignored
  - .env ignored
  - .env.* ignored
- node_modules excluded: yes
- dist excluded: yes
- archive/reference excluded: yes
  - archive/ ignored
  - legacy-reference/ ignored
  - reference-design/ ignored
  - source-files/ ignored
  - project-inputs/ ignored
- large ZIP excluded: yes, `*.zip` ignored
- test report excluded: yes, test-results/ ignored
- playwright report excluded: yes, playwright-report/ ignored
- coverage excluded: yes, coverage/ ignored
- QA artifacts excluded: yes, qa-results.json and QA/report artifacts ignored
- Current ignored artifacts present:
  - dist/
  - node_modules/
  - archive/
  - legacy-reference/
  - reference-design/
  - source-files/
  - project-inputs/
  - test-results/
  - .pytest_cache/
  - other ignored report/reference artifacts listed by `git status --ignored --short`
- Secret exposure: no secret values were read, printed, or written during P0-001

## Known Baseline Warnings

- Cloudflare CLI authentication is expired; account, Worker version, workers.dev URL, latest deployment commit, latest build status, and Dashboard Build settings are NOT VERIFIED.
- Apex domain https://jinbizman.com returned HTTP 200 instead of redirecting to https://www.jinbizman.com at baseline.
- .github/ is not present in the repository root at baseline.
- Ignored historical/reference/build artifacts are present locally but are ignored by Git.
- Migration execution status was not checked in P0-001; only migration source files were recorded.

## P0-001 Exit Criteria

- [x] Git local/remote baseline captured
- [x] Working tree state captured
- [x] Cloudflare Worker identity captured from wrangler.jsonc
- [x] Build configuration captured or explicitly NOT VERIFIED
- [x] Production canonical domain captured
- [x] Production health captured
- [x] No source/runtime/DB configuration changed
