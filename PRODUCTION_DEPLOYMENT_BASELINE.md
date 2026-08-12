# JINBIZ MANAGEMENT Production Deployment Baseline

## 1. Snapshot

- Date: 2026-08-12T18:11:05+09:00
- Git HEAD: 6e13881fe4db818eafa7b73da9d2d84afcccc127
- origin/main: 6e13881fe4db818eafa7b73da9d2d84afcccc127
- Git committed baseline: MATCH
- Current working tree: Phase 1 working changes present, not committed, not pushed
- Worker: jinbizman
- Canonical URL: https://www.jinbizman.com
- Source documents:
  - JINBIZ_MANAGEMENT_FullStack_Function_Performance_Requirements_v2.0_FINAL_20260812.pdf
  - JINBIZ_MANAGEMENT_Complete_Development_Master_Plan_v2.0_FINAL_20260812.pdf

## 2. Current Working Tree

- Branch: main
- HEAD/origin sync: MATCH
- Phase 1 changes committed: NO
- Phase 1 changes pushed: NO
- Phase 1 source/docs present:
  - AUTHORIZATION_MATRIX.md
  - API_VERSIONING.md
  - AUTH_CONTRACT.md
  - API_SECURITY_POLICY.md
  - AUDIT_MATRIX.md
  - AUDIT_POLICY.md
  - API_TEST_STRATEGY.md
  - PERMISSION_UX_MATRIX.md
  - UI_ERROR_POLICY.md
  - db/migrations/014_mobile_auth_sessions.sql
- Build state: PASS
- Test state: PASS

## 3. Cloudflare

- Wrangler version: 4.120.1
- CLI auth: NOT VERIFIED - wrangler auth token is expired and non-interactive login was not performed.
- Worker config name: jinbizman
- Canonical Worker name: jinbizman
- Worker naming consistency:
  - wrangler.jsonc: MATCH
  - Cloudflare deployed Worker: NOT VERIFIED
  - Cloudflare Git Builds Worker name: NOT VERIFIED
- Deployment identity: NOT VERIFIED
- Latest deployment/version: NOT VERIFIED
- Version history: NOT VERIFIED
- Build configuration:
  - GitHub repository: jinbizman-boop/jinbizman
  - Production branch: NOT VERIFIED from Cloudflare
  - Build command: NOT VERIFIED from Cloudflare
  - Deploy command: NOT VERIFIED from Cloudflare
  - Root directory: NOT VERIFIED from Cloudflare
- Custom domain association: NOT VERIFIED from Cloudflare CLI/API
- Public domain smoke confirms www.jinbizman.com is serving the site.

## 4. Runtime Configuration

### Wrangler

- main: worker/index.ts
- main file exists: YES
- compatibility_date: 2026-08-09
- compatibility_flags: nodejs_compat
- nodejs_compat: PRESENT
- assets directory: ./dist
- assets binding: ASSETS
- assets not_found_handling: single-page-application
- worker-first paths:
  - /api/*
  - /admin/*
- observability: enabled
- logs sampling: 1
- traces: enabled, 0.05 sampling

### Public Variables

- APP_BASE_URL: configured in wrangler.jsonc
- APP_ENV: configured in wrangler.jsonc
- ADMIN_ALLOWED_ORIGINS: configured in wrangler.jsonc
- SESSION_TTL_SECONDS: configured in wrangler.jsonc
- LOGIN_RATE_LIMIT_PER_10_MIN: configured in wrangler.jsonc
- PUBLIC_RATE_LIMIT_PER_10_MIN: configured in wrangler.jsonc
- PROTECTED_RATE_LIMIT_PER_10_MIN: configured in wrangler.jsonc
- HIGH_RISK_RATE_LIMIT_PER_10_MIN: configured in wrangler.jsonc
- INQUIRY_NOTIFY_TO: configured in wrangler.jsonc
- INQUIRY_EMAIL_FROM: configured in wrangler.jsonc

### Optional Runtime Bindings / Variables

- MOBILE_REFRESH_TTL_SECONDS: optional, not configured in wrangler.jsonc, source has default
- RESEND_API_KEY: optional secret, not configured in wrangler.jsonc
- MEDIA_BUCKET: optional R2 binding, not configured in wrangler.jsonc

### Required Secrets

- DATABASE_URL: NOT VERIFIED in Cloudflare because CLI auth is unavailable
- JWT_SECRET: NOT VERIFIED in Cloudflare because CLI auth is unavailable

No secret values were printed or stored.

## 5. Production Domain

### WWW

- URL: https://www.jinbizman.com/
- Status: 200
- Final URL: https://www.jinbizman.com/
- Content-Type: text/html
- TLS: OK

### Apex

- URL: https://jinbizman.com
- Initial status: 200
- Redirect location: none
- Final URL: https://jinbizman.com/
- Redirect loop: none observed
- Classification: DOMAIN-DRIFT
- Expected canonical policy: apex should redirect to https://www.jinbizman.com

### DNS

- www.jinbizman.com: resolves to Cloudflare IPv4/IPv6 addresses
- jinbizman.com: resolves to Cloudflare IPv4/IPv6 addresses
- Cloudflare proxied flag: NOT VERIFIED

### Security Headers

- Public static routes (/ , /company, /business, /newsletter, /contact): 200 text/html; selected Worker security headers not observed on static asset responses.
- Worker/admin/API routes include:
  - strict-transport-security
  - content-security-policy
  - x-content-type-options
  - referrer-policy
  - permissions-policy
  - x-frame-options
  - x-request-id on Worker responses
  - vary: Origin on API responses

## 6. Production Routes

Read-only GET smoke only. No form submit, auth write, API write, or migration was executed.

| Route | Status | Final URL | Notes |
|---|---:|---|---|
| / | 200 | https://www.jinbizman.com/ | HTML |
| /company | 200 | https://www.jinbizman.com/company | HTML |
| /business | 200 | https://www.jinbizman.com/business | HTML |
| /newsletter | 200 | https://www.jinbizman.com/newsletter | HTML |
| /contact | 200 | https://www.jinbizman.com/contact | HTML |
| /admin/login | 200 | https://www.jinbizman.com/admin/login | HTML, Worker security headers present |
| /api/health | 200 | https://www.jinbizman.com/api/health | success=true, database=connected |
| /api/system/health | 200 | https://www.jinbizman.com/api/system/health | Worker JSON route |
| /api/v1/auth/me | 404 | https://www.jinbizman.com/api/v1/auth/me | Expected pending deployment for Phase 1 working tree |

## 7. Database

- Neon project: jinbiz-management
- Neon project ID: mute-leaf-74331210
- Branch: main
- Branch ID: br-autumn-silence-a62bx2oe
- Database: neondb
- Schema: public
- DB user: neondb_owner
- PostgreSQL: 18.4 (be2730e)
- Timezone: GMT
- Production base tables: 71
- Production applied migrations: 13
- Source migrations: 14
- Pending migration: 014_mobile_auth_sessions.sql
- auth_sessions in Production: NO
- Current Production schema: 71 tables
- After planned migration 014: 72 tables expected

Production applied migrations:

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

## 8. Working Tree vs Production

| Feature | Working Tree | Production | Status |
|---|---|---|---|
| RBAC hardening | YES | NOT VERIFIED | EXPECTED-PENDING-DEPLOY |
| Mobile v1 auth | YES | 404 on /api/v1/auth/me | EXPECTED-PENDING-DEPLOY |
| Migration 014 | Source present | NOT APPLIED | EXPECTED-PENDING-DEPLOY |
| API security hardening | YES | NOT VERIFIED | EXPECTED-PENDING-DEPLOY |
| High-risk audit coverage | YES | NOT VERIFIED | EXPECTED-PENDING-DEPLOY |
| API contract registry | YES | Local only | READY |
| Forbidden UI | YES | NOT VERIFIED | EXPECTED-PENDING-DEPLOY |

Current working tree not matching deployed Production is expected because Phase 1 changes are not committed, pushed, deployed, or migrated.

## 9. Release Gate

- npm run typecheck: PASS
- npm run test:api-contract: PASS, 7/7
- npm run test:security: PASS, 29/29
- npm run test:worker: PASS, 53/53
- npm run test:react: PASS, 31/31
- python -m pytest -q tests/test_site.py: PASS, 22/22
- npm run build: PASS
  - dist/index.html: 1.15 kB
  - dist/assets/index-mIlCwizA.css: 266.10 kB
  - dist/assets/index-B4hGsRz2.js: 309.56 kB
- npm run release:check: PASS
  - ok: true
  - errors: []
  - warnings: []
  - migrations: 14
- npm run test:e2e: PASS, 91/91

Note: Bundled Codex Python did not include pytest. The repository/system Python command succeeded.

## 10. Deployment Gaps

### READY

- Git committed baseline HEAD matches origin/main.
- wrangler.jsonc uses canonical Worker name jinbizman.
- Worker entrypoint exists at worker/index.ts.
- nodejs_compat is present.
- Native Vite build passes.
- release-check passes.
- Local API/security/Worker/React/Python/E2E suites pass.
- www Production public smoke and /api/health pass.
- Production DB is connected and currently at 71 tables / migrations 001-013.

### EXPECTED-PENDING-DEPLOY

- Phase 1 working tree changes are not committed or pushed.
- Phase 1 working tree changes are not deployed to Cloudflare.
- Migration 014_mobile_auth_sessions.sql is not applied to Production.
- Production /api/v1/auth/me currently returns 404.

### CONFIG-DRIFT

- None verified.

### DOMAIN-DRIFT

- https://jinbizman.com returns 200 directly instead of redirecting to https://www.jinbizman.com.

### DB-PENDING

- 014_mobile_auth_sessions.sql pending; auth_sessions table absent from Production.

### NOT-VERIFIED

- Cloudflare CLI auth.
- Cloudflare secret names DATABASE_URL and JWT_SECRET.
- Cloudflare deployed Worker identity.
- Cloudflare latest deployment/version.
- Cloudflare Git Builds production branch/build command/deploy command/root directory.
- Cloudflare custom domain association from dashboard/API.
- Cloudflare version history/rollback metadata.
- Cloudflare proxied DNS flag.

### BLOCKER

- No local release-gate blocker found.
- No Production 5xx or database disconnected blocker found.
- Domain canonical redirect drift exists, but it was recorded without modifying DNS or Cloudflare settings.

## 11. GAP-P1-007 Exit Criteria

- [x] Git HEAD 확인
- [x] origin/main 확인
- [x] working tree 상태 확인
- [x] Worker canonical name 확인
- [x] Worker entrypoint 확인
- [x] compatibility flags 확인
- [x] static assets binding 확인
- [x] build scripts 확인
- [x] production vars 이름 전수
- [x] secret 이름 확인 또는 NOT VERIFIED 명시
- [x] Cloudflare auth 상태 확인
- [x] deployed Worker identity 확인 또는 NOT VERIFIED 명시
- [x] custom domain 확인
- [x] www Production 200
- [x] public pages read-only smoke
- [x] /api/health 200 + DB connected
- [x] apex redirect 실제 상태 확인
- [x] redirect loop 없음
- [x] security header 확인
- [x] Worker naming consistency
- [x] Cloudflare build configuration 확인 또는 NOT VERIFIED
- [x] Neon production identity 확인
- [x] Production table count 확인
- [x] Production migration 001~013 확인
- [x] source migration 001~014 확인
- [x] migration 014 pending 상태 확인
- [x] Production 71 / upgraded expected 72 분리
- [x] working-tree vs production feature matrix
- [x] CI config read-only 확인
- [x] deployment command 확인
- [x] rollback/version history 확인 또는 NOT VERIFIED
- [x] typecheck PASS
- [x] API contract PASS
- [x] security suite PASS
- [x] Worker PASS
- [x] React/source PASS
- [x] Python PASS
- [x] build PASS
- [x] release-check PASS
- [x] E2E PASS
- [x] secret exposure 0
- [x] Production DB write 0
- [x] Production API write 0
- [x] Cloudflare write 0
- [x] DNS write 0
- [x] deploy 0
- [x] migration apply 0
- [x] PRODUCTION_DEPLOYMENT_BASELINE.md 생성
