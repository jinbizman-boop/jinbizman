# JINBIZ MANAGEMENT Phase 1 Pre-Deploy Gate

## 1. Git Baseline

- Checked at: 2026-08-12T18:20:01+09:00
- Repository: git@github.com:jinbizman-boop/jinbizman.git
- Branch: main
- Committed baseline HEAD: 6e13881fe4db818eafa7b73da9d2d84afcccc127
- origin/main: 6e13881fe4db818eafa7b73da9d2d84afcccc127
- Committed baseline sync: MATCH
- Current working tree: Phase 0 / Phase 1 working changes present
- Phase 1 committed: NO
- Phase 1 pushed: NO
- Production deployment: Cloudflare Worker `jinbizman`, current version `9974c168-dad7-426b-8ace-a93be160b7cd`

The current Phase 1 working tree is intentionally separate from the committed baseline and current Production deployment.

## 2. Wrangler Authentication

- Wrangler version: 4.120.1
- Auth status: VALID
- Auth email: jinbizman@gmail.com
- Credential type: OAuth token
- Account present: YES

No token or credential value was printed or recorded.

## 3. Cloudflare Account

- Account name: Jinbizman@gmail.com's Account
- Account ID: dd66373cd6f32d3cddfee542fc262cc0
- Token permissions: read/write scopes are present in Wrangler output; no write command was executed.

## 4. Worker Identity

### Source Config

- wrangler.jsonc name: jinbizman
- main: worker/index.ts
- compatibility_date: 2026-08-09
- compatibility_flags: nodejs_compat
- assets directory: ./dist
- assets binding: ASSETS
- SPA fallback: single-page-application
- Worker-first paths:
  - /api/*
  - /admin/*

### Cloudflare Service

- Service ID: jinbizman
- Default environment: production
- Script ID: jinbizman
- Script tag: dbab1efc944c4afe92bcc33a27e78595
- Modified on: 2026-08-11T09:02:44.423641Z
- Last deployed from: wrangler
- Handlers: fetch
- Has assets: true
- Has modules: true
- Compatibility date: 2026-08-09
- Compatibility flags: nodejs_compat
- Observability: enabled

### Identity Verdict

- wrangler.jsonc -> Cloudflare Worker: MATCH
- Canonical Worker name: jinbizman
- Deployment target: jinbizman

## 5. Deployment Identity

- Current deployment ID: 4a571a52-46c0-4d74-8512-ff58eb93f366
- Current deployment created: 2026-08-11T09:02:43.336446Z
- Source: wrangler
- Strategy: percentage
- Current traffic:
  - version: 9974c168-dad7-426b-8ace-a93be160b7cd
  - percentage: 100
- Current version number: 11
- Current version created: 2026-08-11T09:02:42.595535Z
- Version source: wrangler
- Version ETag: 7f6a3b4db4bf34c7657c4d38eb690399d62be5ff2683637e54ba9eb0678ae21e

Cloudflare deployment metadata does not include a Git commit SHA. Current deployed source-to-Git relationship is therefore UNVERIFIABLE by commit metadata.

## 6. Custom Domain

Cloudflare Workers custom domain records were queried read-only through the Cloudflare API using the authenticated Wrangler OAuth context. No domain or DNS mutation was executed.

| Hostname | Service | Environment | Enabled | Verdict |
|---|---|---|---|---|
| www.jinbizman.com | jinbizman | production | true | MATCH |
| jinbizman.com | jinbizman | production | true | MATCH |

Existing apex behavior:

- https://jinbizman.com/ returns 200 directly.
- It does not redirect to https://www.jinbizman.com/.
- Classification: DOMAIN-DRIFT, not a deployment identity blocker.

## 7. Runtime Variables

### Source wrangler.jsonc

- APP_BASE_URL: configured
- APP_ENV: configured
- ADMIN_ALLOWED_ORIGINS: configured
- SESSION_TTL_SECONDS: configured
- LOGIN_RATE_LIMIT_PER_10_MIN: configured
- PUBLIC_RATE_LIMIT_PER_10_MIN: configured
- PROTECTED_RATE_LIMIT_PER_10_MIN: configured
- HIGH_RISK_RATE_LIMIT_PER_10_MIN: configured
- INQUIRY_NOTIFY_TO: configured
- INQUIRY_EMAIL_FROM: configured

### Current Deployed Version Bindings

- ADMIN_ALLOWED_ORIGINS: PRESENT
- APP_BASE_URL: PRESENT
- APP_ENV: PRESENT
- ASSETS: PRESENT
- DATABASE_URL: PRESENT as secret_text
- INQUIRY_EMAIL_FROM: PRESENT
- INQUIRY_NOTIFY_TO: PRESENT
- JWT_SECRET: PRESENT as secret_text
- LOGIN_RATE_LIMIT_PER_10_MIN: PRESENT
- PUBLIC_RATE_LIMIT_PER_10_MIN: PRESENT
- SESSION_TTL_SECONDS: PRESENT

### Variable Verdict

- Existing Production vars needed by currently deployed Worker: MATCH
- Phase 1 source vars not present in current deployed version:
  - PROTECTED_RATE_LIMIT_PER_10_MIN
  - HIGH_RISK_RATE_LIMIT_PER_10_MIN
- Classification: EXPECTED-PENDING-DEPLOY because current Production is not the Phase 1 working tree.

## 8. Secret Presence

Read-only `wrangler secret list --name jinbizman --format json` confirmed secret names only.

- DATABASE_URL: PRESENT
- JWT_SECRET: PRESENT

Secret values were not read, printed, stored, or modified.

## 9. Build Configuration

### Repository Scripts

- build: npm run build -> vite build
- release check: npm run release:check -> node scripts/release-check.mjs
- deploy command in package.json: npm run build && npm run release:check && wrangler deploy

### Cloudflare Deployment Source

- Current latest deployment source: wrangler
- Current latest version source: wrangler
- Current script last_deployed_from: wrangler

### Cloudflare Git Build Configuration

- Production branch: NOT VERIFIED
- Build command: NOT VERIFIED
- Deploy command: NOT VERIFIED
- Root directory: NOT VERIFIED
- Worker/service: Current deployed Worker service verified as jinbizman

Build configuration is not treated as PASS by assumption. The verified deployed source is Wrangler, not Git Build metadata.

## 10. Version/Rollback

- Version history exists: YES
- Deployment history exists: YES
- Current version: 9974c168-dad7-426b-8ace-a93be160b7cd
- Current version number: 11
- Previous visible version: ba1c3afc-3418-492a-b99e-1b65e51c6cc9
- Earlier visible version matching prior user-reported deployment: ddfff82e-ea28-467a-bfab-01f0258c4840
- Rollback command availability: Wrangler exposes `wrangler rollback [version-id]`
- Rollback executed: NO

## 11. Production Smoke

GET-only verification. No login, refresh, logout, form submit, or write endpoint was called.

| URL | Status | Final URL | Result |
|---|---:|---|---|
| https://www.jinbizman.com/ | 200 | https://www.jinbizman.com/ | OK |
| https://www.jinbizman.com/api/health | 200 | https://www.jinbizman.com/api/health | database=connected |
| https://jinbizman.com/ | 200 | https://jinbizman.com/ | DOMAIN-DRIFT, direct apex 200 |
| https://www.jinbizman.com/api/v1/auth/me | 404 | https://www.jinbizman.com/api/v1/auth/me | Phase 1 not deployed |

## 12. Neon Production

- Project: jinbiz-management
- Project ID: mute-leaf-74331210
- Branch: main
- Branch ID: br-autumn-silence-a62bx2oe
- Database: neondb
- Schema: public
- DB user: neondb_owner
- PostgreSQL: 18.4 (be2730e)
- Timezone: GMT
- Base tables: 71
- Applied migrations: 13
- Applied range: 001~013
- auth_sessions: absent

Production SQL executed in this gate was SELECT-only.

## 13. Production vs Working Tree

| Feature | Working Tree | Production Evidence | Verdict |
|---|---|---|---|
| RBAC/scope hardening | PRESENT | No deployment commit metadata; current version predates this working tree | NOT DEPLOYED / UNVERIFIABLE |
| /api/v1/auth/* | PRESENT | GET /api/v1/auth/me = 404 | NOT DEPLOYED |
| Migration 014 | PRESENT | schema_migrations = 001~013, auth_sessions absent | NOT APPLIED |
| API security hardening | PRESENT | deployed vars lack Phase 1 rate limit vars | NOT DEPLOYED |
| Audit hardening | PRESENT | no deployment commit metadata | NOT DEPLOYED / UNVERIFIABLE |
| API contract regression foundation | PRESENT | local-only tests/docs | NOT DEPLOYED |
| Forbidden UX | PRESENT | no deployment commit metadata | NOT DEPLOYED / UNVERIFIABLE |

Phase 1 deployed: NO

## 14. Pending Migration 014

- Source migration count: 14
- Source latest migration: 014_mobile_auth_sessions.sql
- Production applied migration count: 13
- Production pending migration: 014_mobile_auth_sessions.sql
- Production auth_sessions table: absent
- Current Production expected tables: 71
- Expected after applying migration 014: 72
- Migration 014 applied in this gate: NO

## 15. Deployment Dependency Order

Recommended order for a future approved Phase 1 Production application. This gate did not execute these steps.

1. Re-run final local release gate from the current working tree.
2. Review final Git diff and secret scan.
3. Commit Phase 0 / Phase 1 documentation and implementation changes.
4. Push to `origin/main`.
5. Apply Production migration `014_mobile_auth_sessions.sql` to Neon after explicit approval.
6. Deploy Worker `jinbizman` from the approved source using the verified deploy target.
7. Verify Cloudflare current deployment/version points to the new Worker version.
8. Run Production read-only health and public smoke.
9. Run controlled auth smoke for legacy web and `/api/v1/auth/*` after explicit approval.
10. Treat apex-to-www redirect as a separate domain task; do not bundle it into Worker identity verification.
11. Start 24h/72h monitoring and rollback readiness checks.

## 16. Blockers

### BLOCKER

- None found for Worker identity, custom domain target, required secret presence, current Production health, or Neon identity.

### NON-BLOCKER / EXPECTED

- Phase 1 working tree is not committed.
- Phase 1 working tree is not pushed.
- Phase 1 working tree is not deployed.
- `/api/v1/auth/me` returns 404 in current Production.
- Migration 014 is pending.
- `auth_sessions` table is absent in current Production.
- Cloudflare Git Build configuration remains NOT VERIFIED; current deployed source is verified as Wrangler.

### DOMAIN-DRIFT

- `https://jinbizman.com/` returns 200 directly instead of redirecting to `https://www.jinbizman.com/`.
- This is a domain/canonicalization drift and should be handled separately from the Phase 1 Worker deployment target.

## 17. Pre-Deploy Gate Result

- Wrangler auth VALID: PASS
- Cloudflare account 확인: PASS
- Worker name = jinbizman: PASS
- Deployed Worker identity 확인: PASS
- Custom www domain Worker association 확인: PASS
- Latest deployment/version 확인: PASS
- Runtime public config 확인 가능한 범위 기록: PASS
- DATABASE_URL secret presence 확인: PASS
- JWT_SECRET secret presence 확인: PASS
- Build configuration 확인 또는 명확한 NOT VERIFIED: PASS
- Current Production vs working tree 구분: PASS
- Production health 200: PASS
- Neon 71 tables 확인: PASS
- Production migrations 001~013: PASS
- 014 pending 확인: PASS
- auth_sessions Production 없음: PASS
- rollback/version history 확인: PASS
- pre-deploy blockers 정리: PASS
- deployment dependency order 확정: PASS
- write/change/deploy 0: PASS

Final gate verdict: PASS

Write safety:

- Production DB write: 0
- Production API write: 0
- Cloudflare write: 0
- DNS write: 0
- Migration apply: 0
- Deploy: 0
- Git commit: 0
- Git push: 0
