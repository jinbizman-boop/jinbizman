# JINBIZ MANAGEMENT API Test Strategy

Snapshot: GAP-P1-005 working state, Git HEAD `6e13881fe4db818eafa7b73da9d2d84afcccc127`.

## Purpose

This strategy fixes the regression boundary for the current JINBIZ Worker API surface after Phase 1 authorization, mobile auth, API security, and audit hardening.

## Test Layers

| Layer | Command | Scope |
|---|---|---|
| TypeScript | `npm run typecheck` | Worker, React, scripts, and shared types |
| API contract | `npm run test:api-contract` | route registry, method/path drift, envelopes, docs, migration sequence |
| Security targeted | `npm run test:security` | authorization, mobile auth, API boundary, audit, and API contract tests |
| Worker | `npm run test:worker` | all Worker/source security and schema tests |
| React/source | `npm run test:react` | static public/admin/frontend contract tests |
| Python site | `python -m pytest -q tests/test_site.py` | generated site and release smoke checks |
| Build | `npm run build` | native Vite production build |
| Release gate | `npm run release:check` | production readiness static checks |
| E2E | `npm run test:e2e` | Playwright browser flows |

## Contract Registry

The machine-readable route registry lives in `tests/fixtures/api-contracts.mjs`.

- P0 Production API inventory baseline: 124 method+path contracts.
- Phase 1 current source baseline: 128 method+path contracts.
- Difference: four `/api/v1/auth/*` contracts added by GAP-P1-002.
- Current unique paths: 96.

The registry records method, path, class, auth requirement, permission/scope source, read/write access, and API version. `tests/worker/api-contract.test.mjs` parses `worker/index.ts` and fails when source-only, registry-only, duplicate, or method-policy drift appears.

## Risk-Based Coverage

The test foundation does not create one full integration test per route. Instead:

- P0 write and high-risk write routes are covered by contract, authorization, audit, and security boundary tests.
- Protected reads are covered by route registry, matrix drift, auth/permission regression, and representative scope tests.
- Public reads are covered by route contract and production-safe smoke layers.
- System/config routes are covered by permission, response, audit, and release-gate checks.

## Regression Areas

| Requirement/Area | Test Type | Representative Test | Coverage Status |
|---|---|---|---|
| AUTH | unit/source contract | legacy `/api/auth/*`, v1 `/api/v1/auth/*`, token type separation | POLICY COVERED |
| RBAC | unit/source contract | no permission -> 403, super admin allowed | POLICY COVERED |
| SCOPE | unit/source contract | self, project, service, team, IDOR denial | POLICY COVERED |
| ORIGIN | source contract | trusted web write, untrusted/missing origin denial, bearer/no-origin allowed | POLICY COVERED |
| CORS | source contract | exact allowlist, no wildcard, `Vary: Origin` | POLICY COVERED |
| RATE LIMIT | source contract | auth, public write, protected write, high-risk classes, `Retry-After` | POLICY COVERED |
| ABUSE | source contract | oversized body, content type, malformed JSON, path ID, pagination, sort safety | POLICY COVERED |
| AUDIT | source contract | high-risk write matrix, redaction, before/after, domain log split | POLICY COVERED |
| VERSIONING | source contract | legacy API remains, `/api/v1/auth/*` exists | POLICY COVERED |
| MIGRATION | source contract | 001-014 sequence, current 71-table Production baseline, planned 014 upgrade | POLICY COVERED |

## Auth Regression

Legacy Web auth remains cookie-based:

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

Mobile auth remains bearer-based:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`

Refresh tokens are hashed, revocable, rotated, and linked to `auth_sessions`. Tests must never print token values.

## Authorization Regression

`AUTHORIZATION_MATRIX.md` is the human-readable contract. `tests/worker/api-contract.test.mjs` checks that protected route paths are represented there, while `tests/worker/authorization.test.mjs` locks self, project, service, team, IDOR, anonymous, no-permission, and super-admin behavior.

## API Security Regression

`API_SECURITY_POLICY.md` is the policy document. `tests/worker/api-security.test.mjs` and `tests/worker/api-contract.test.mjs` lock:

- exact CORS allowlist and no wildcard ACAO,
- trusted origin for cookie writes,
- bearer/no-origin mobile boundary,
- allowed method policy,
- body-size and content-type rejection,
- malformed JSON rejection,
- pagination max 100,
- dynamic sort injection guard.

## Audit Regression

`AUDIT_MATRIX.md` and `AUDIT_POLICY.md` define high-risk write coverage. `tests/worker/audit.test.mjs` checks redaction, request/scope contract, and representative high-risk audit calls.

## Migration / Schema Regression

Production baseline remains 71 public base tables as captured in `DB_INVENTORY.md`.

Planned migration-upgraded schema includes migration `014_mobile_auth_sessions.sql`, adding `auth_sessions` for mobile refresh/session revocation. Production application of 014 remains outside this test strategy unless a later approved deployment step applies it.

## Release Gate

`npm run release:check` should remain fast and static. It checks exact dependency pins, required source/docs, migration ordering, canonical path hygiene, and required Phase 0/Phase 1 policy documents. It must not contact Production or mutate DB/Cloudflare state.

## Flaky Test Policy

Tests must avoid dependence on Production, real 10-minute rate windows, uncontrolled current time, actual credentials, token values, or Cloudflare dashboard state. Token and rate-limit tests should use source contracts, deterministic helpers, or local fixtures.

## Production Smoke Boundary

Production read-only smoke belongs to release/E2E procedures. Unit and Worker regression tests must not call `https://www.jinbizman.com`, Production Neon, or any Production write endpoint.
