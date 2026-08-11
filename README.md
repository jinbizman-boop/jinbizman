# JINBIZ MANAGEMENT Official Website + ERP

JINBIZ MANAGEMENT의 공식 B2B AI 홈페이지와 WBS 중심 ERP를 하나의 React/Vite/TypeScript 애플리케이션, Cloudflare Worker API, Neon Postgres migration으로 운영하는 production source package입니다.

## Official Domain

- Canonical: `https://www.jinbizman.com`
- Bare domain policy: `https://jinbizman.com` redirects to `https://www.jinbizman.com`
- Public locales: `ko`, `en`, `ja`, `fr`, `es`

## Tech Stack

- Frontend: React + Vite + TypeScript
- Runtime/API: Cloudflare Workers
- Database: Neon Postgres
- DB access: Worker only
- Styling: TELOS design-master proportions rebranded for JINBIZ
- Package manager: npm

## Public Routes

- Korean default: `/`, `/company`, `/business`, `/newsletter`, `/contact`
- Locales: `/en/*`, `/ja/*`, `/fr/*`, `/es/*`
- News detail: `/newsletter/:slug`
- Projects: `/projects/:slug`
- Legal: `/privacy`, `/terms`, `/email-policy`

## ERP Model

The ERP is not a CMS-only back office. It connects:

`Inquiry -> Lead -> Opportunity -> Project -> WBS -> My Task -> Daily Report -> Daily Log -> Output -> Approval -> Evaluation Evidence`

It also covers Service Hub, Website CMS, News, RBAC, attendance/leave, timesheets, resource allocation, budget/expense, KPI/evaluation, knowledge, media, notifications, audit logs and settings.

## Folder Structure

- `src/`: React public website and ERP UI
- `worker/`: Cloudflare Worker API, auth, RBAC, rate limit, security headers
- `db/`: Neon Postgres migrations and seeds
- `public/`: production static assets, robots and sitemap
- `scripts/`: migration, admin creation and release checks
- `tests/`: worker, React, source and Playwright checks
- `docs/`: operating and source guidance

Reference and legacy folders such as `archive/`, `legacy-reference/`, `reference-design/`, `source-files/`, `project-inputs/`, and `jinbiz_media_pack/` are not production source of truth and are ignored by Git.

## Local Setup

```bash
npm install
npm ci
npm run typecheck
npm test
python -m pytest -q tests/test_site.py
npm run build
npm run release:check
```

Worker local runtime:

```bash
npx wrangler dev --local
```

## Environment Variables

Copy `.dev.vars.example` to `.dev.vars` for local development. Never commit real secrets.

Required Cloudflare Worker secrets:

- `DATABASE_URL`
- `JWT_SECRET`

Optional email secrets:

- `RESEND_API_KEY`
- `EMAIL_FROM` or `INQUIRY_EMAIL_FROM`
- `INQUIRY_NOTIFY_TO`

## Database Migration

Production migrations are ordered from `db/migrations/001_*.sql` through `013_*.sql`. Apply them only through the migration process:

```bash
npm run db:migrate
```

Do not make manual production schema edits outside migration files.

## Admin Account

Create the initial admin with environment variables:

```bash
$env:DATABASE_URL="postgresql://..."
$env:ADMIN_EMAIL="admin@jinbizman.com"
$env:ADMIN_PASSWORD="replace-with-strong-password"
npm run admin:create
```

No fixed administrator password is included.

## Cloudflare Deployment

```bash
npm run build
npm run release:check
npx wrangler deploy
```

Set `DATABASE_URL`, `JWT_SECRET`, and any email secrets through Cloudflare Secrets. Configure `MEDIA_BUCKET` only when R2 media upload is required.

## Common Issues

- `DATABASE_URL is required`: local `.dev.vars` or shell env is missing.
- `JWT_SECRET` login failures: Worker secret is missing or differs between requests.
- Browser E2E blocked locally: report as environment-blocked, not PASS.
- Vite build failure: do not treat fallback/sandbox build as production success.

## Production Checklist

See `GO_LIVE_CHECKLIST.md` for DNS, Cloudflare, Neon, email, R2, migration, admin and browser QA tasks.
