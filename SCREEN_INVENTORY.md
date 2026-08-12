# JINBIZ MANAGEMENT Screen/UI Inventory v2

## 1. Snapshot Metadata
- Date: 2026-08-12T15:30:00+09:00
- Git HEAD: 6e13881fe4db818eafa7b73da9d2d84afcccc127
- Production: https://www.jinbizman.com
- Source documents: `JINBIZ_MANAGEMENT_FullStack_Function_Performance_Requirements_v2.0_FINAL_20260812.pdf`; `JINBIZ_MANAGEMENT_Complete_Development_Master_Plan_v2.0_FINAL_20260812.pdf`
- Baseline inputs: `BASELINE.md`; `DB_INVENTORY.md`; `API_INVENTORY.md`
- Counting rule: route counts are canonical route entries handled by the React router, not 5-locale-expanded URL totals.

## 2. UI Summary
- Total routes: 48
- Public route entries: 8
- Admin/ERP protected route entries: 35
- Auth route entries: 1
- Legal route entries: 3
- Error/fallback route entries: 1
- Dynamic route entries: 3
- Protected route entries: 35
- Anonymous route entries: 13
- Route alias count: 2 (`/admin` -> dashboard, `/project/:slug` -> project detail)
- Page components: 18
- API-connected screens: 40
- No-API screens: 8
- Form screens: 7

## 3. Routing Architecture
- Entry point: `src/main.tsx` mounts `<App />` into `#root` with React StrictMode.
- Router: `src/lib/router.tsx` implements custom SPA navigation with `history.pushState`, `popstate`, and a `jinbiz:navigate` event.
- Locale routing: `localeFromPath()` recognizes `en`, `ja`, `fr`, `es`; Korean is the default and has no `/ko` prefix. `stripLocalePrefix()` maps localized public URLs to canonical public route matching.
- Public routing: `src/App.tsx` renders `PublicRoute`, then wraps all public/legal/error screens in `PublicShell`.
- Admin routing: `/admin` and `/admin/*` render `AdminRoute`; `/admin/login` renders `AdminLoginPage`; all other admin routes render `AdminShell`.
- Protected admin behavior: `AdminShell` calls `/api/auth/me`; unauthenticated users are redirected client-side to `/admin/login`. Worker also protects `/admin/*` except `/admin/login`.
- Fallback: unmatched public paths render `NotFoundPage` within `PublicShell`.

## 4. Public Screen Inventory

### PUB-SCR-001 - Home
- Route: `/`, plus locale aliases `/en`, `/ja`, `/fr`, `/es`
- Component: `HomePage` (`src/public/pages/HomePage.tsx`)
- Shell: `PublicShell` (`src/public/PublicShell.tsx`)
- Requirement: PUB-001, SEO-001, I18N-001
- Auth: anonymous
- Navigation: Header brand, footer, direct URL
- APIs: `GET /api/public/news?locale=:locale`
- DB Domain: public news (`news_posts`, `news_post_translations`)
- Actions: navigate to business, company, project detail, contact, newsletter detail
- Form: none
- States: loading PARTIAL (news silently falls back), empty YES (activity fallback), error PARTIAL (news catch fallback), forbidden N/A
- Responsive: RESPONSIVE; CSS breakpoints at 1100/1024/768/760 and smaller
- Accessibility: GOOD; skip link, semantic sections, image alt, aria labels on manifesto/orbit
- i18n: 5-LOCALE READY via `publicCopies` and locale route helper
- SEO: COMPLETE via `Seo`
- Tests: Source Contract (`public-react.test.mjs`, `design-quality.test.mjs`), Production GET, Playwright render check
- Production: 200 rendered
- Status: IMPLEMENTED

### PUB-SCR-002 - Company
- Route: `/company`, localized aliases
- Component: `CompanyPage` (`src/public/pages/CompanyPage.tsx`)
- Shell: `PublicShell`
- Requirement: PUB-002, SEO-001, I18N-001
- Auth: anonymous
- Navigation: Header, footer, home CTA
- APIs: none
- DB Domain: none
- Actions: external map link, internal navigation
- Form: none
- States: loading N/A, empty N/A, error N/A, forbidden N/A
- Responsive: RESPONSIVE
- Accessibility: PARTIAL; semantic headings/images present, external map link present, no form controls
- i18n: 5-LOCALE READY
- SEO: COMPLETE via `Seo`
- Tests: Playwright E2E (`tests/e2e/public.spec.ts`), source tests
- Production: 200 rendered
- Status: IMPLEMENTED

### PUB-SCR-003 - Business
- Route: `/business`, localized aliases
- Component: `BusinessPage` (`src/public/pages/BusinessPage.tsx`)
- Shell: `PublicShell`
- Requirement: PUB-003, BUS-001, SEO-001, I18N-001
- Auth: anonymous
- Navigation: Header, footer, home CTA, project cards
- APIs: none
- DB Domain: none
- Actions: navigate to project detail/contact
- Form: none
- States: loading N/A, empty N/A, error N/A, forbidden N/A
- Responsive: RESPONSIVE
- Accessibility: PARTIAL; headings and images present, no interactive controls beyond links
- i18n: 5-LOCALE READY
- SEO: COMPLETE via `Seo`
- Tests: Playwright E2E, source tests
- Production: 200 rendered
- Status: IMPLEMENTED

### PUB-SCR-004 - Newsletter List
- Route: `/newsletter`, localized aliases
- Component: `NewsletterPage` (`src/public/pages/NewsletterPage.tsx`)
- Shell: `PublicShell`
- Requirement: PUB-004, NEWS-001, SEO-001, I18N-001
- Auth: anonymous
- Navigation: Header, footer, home newsroom cards
- APIs: `GET /api/public/news?locale=:locale&category=:category`
- DB Domain: news (`news_posts`, `news_post_translations`)
- Actions: category tab switch, open news detail
- Form: none
- States: loading YES, empty YES, error PARTIAL (error collapses to empty), forbidden N/A
- Responsive: RESPONSIVE
- Accessibility: GOOD; `role="tablist"`, `role="tab"`, `aria-selected`
- i18n: 5-LOCALE READY
- SEO: COMPLETE via `Seo`
- Tests: Playwright E2E, `public-react.test.mjs`, `release-hardening.test.mjs`
- Production: 200 rendered
- Status: IMPLEMENTED

### PUB-SCR-005 - Newsletter Detail
- Route: `/newsletter/*` canonical inventory route; sitemap uses `/newsletter/:category/:slug`
- Component: `NewsDetailPage` (`src/public/pages/NewsletterPage.tsx`)
- Shell: `PublicShell`
- Requirement: PUB-004, NEWS-002, SEO-001, I18N-001
- Auth: anonymous
- Navigation: Newsletter list, home news cards, direct URL
- APIs: `GET /api/public/news/:slug?locale=:locale`
- DB Domain: news (`news_posts`, `news_post_translations`, `services`)
- Actions: back to newsroom on not found
- Form: none
- States: loading YES, empty/not-found YES, error PARTIAL, forbidden N/A
- Responsive: RESPONSIVE
- Accessibility: PARTIAL; article structure and heading present
- i18n: 5-LOCALE READY
- SEO: COMPLETE for found article, PARTIAL for not-found detail state
- Tests: Source Contract (`release-hardening.test.mjs`)
- Production: route shell available by GET; data depends on published DB content
- Status: IMPLEMENTED-PARTIAL

### PUB-SCR-006 - Contact
- Route: `/contact`, localized aliases
- Component: `ContactPage` (`src/public/pages/ContactPage.tsx`)
- Shell: `PublicShell`
- Requirement: PUB-005, CRM-001, SEO-001, I18N-001
- Auth: anonymous
- Navigation: Header, footer, CTA buttons
- APIs: `POST /api/public/inquiries`
- DB Domain: inquiries -> CRM flow (`inquiries`, later `leads`, `opportunities`, `projects`)
- Actions: submit inquiry
- Form: inquiry type, name, company, email, phone, message
- States: loading/submitting YES, empty N/A, error YES, forbidden N/A
- Validation: client MINIMAL/PARTIAL; server validation COMPLETE in Worker
- Responsive: RESPONSIVE
- Accessibility: PARTIAL; labels wrap inputs, semantic button, success/error text
- i18n: 5-LOCALE READY
- SEO: COMPLETE via `Seo`
- Tests: Source Contract, Python site tests, Production GET; no Production POST performed
- Production: 200 rendered
- Status: IMPLEMENTED

### PUB-SCR-007 - Project Detail
- Routes: `/projects/:slug`, alias `/project/:slug`, localized aliases
- Component: `ProjectPage` (`src/public/pages/ProjectPage.tsx`)
- Shell: `PublicShell`
- Requirement: PRJ-PUB-001, BUS-002, SEO-001, I18N-001
- Auth: anonymous
- Navigation: Home portfolio cards, Business portfolio rows, direct URL
- APIs: none; uses static `projectsByLocale`
- DB Domain: none
- Actions: navigate to contact/business
- Form: none
- States: loading N/A, empty N/A, error/not-found YES for missing slug, forbidden N/A
- Responsive: RESPONSIVE
- Accessibility: PARTIAL; headings, image alt, status badge
- i18n: 5-LOCALE READY
- SEO: COMPLETE on `/projects/:slug`; alias `/project/:slug` canonicalizes to `/projects/:slug`
- Tests: Source Contract, Python site tests, legacy browser QA references
- Production: 200 rendered for `/projects/eureka-world`
- Status: IMPLEMENTED

### PUB-SCR-008 - Public 404
- Route: unmatched public path
- Component: `NotFoundPage` (`src/public/pages/ProjectPage.tsx`)
- Shell: `PublicShell`
- Requirement: ERR-001
- Auth: anonymous
- Navigation: direct invalid URL only
- APIs: none
- DB Domain: none
- Actions: navigate home
- Form: none
- States: not-found YES
- Responsive: RESPONSIVE
- Accessibility: PARTIAL
- i18n: PARTIAL; button text is static English
- SEO: NONE; no `Seo` call in `NotFoundPage`
- Tests: No direct test found
- Production: SPA fallback route available
- Status: IMPLEMENTED-PARTIAL

## 5. Admin/ERP Screen Inventory

All Admin/ERP routes use `AdminShell` (`src/admin/AdminShell.tsx`) with sidebar, topbar, user context, logout action, mobile menu, skip link, and `getCurrentUser()` session gate. The alias `/admin` maps to dashboard.

| Screen ID | Route | Component | Requirement | APIs | DB Domain | Actions | Form | States | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| ERP-SCR-001 | `/admin`, `/admin/dashboard` | `DashboardPage` | ERP-DASH-001 | `/api/admin/dashboard`, `/api/admin/operations-summary`, `/api/auth/me` | projects, WBS, approvals, inquiries, users | view metrics | no | loading/error YES, empty PARTIAL | Source Contract | IMPLEMENTED |
| ERP-SCR-002 | `/admin/services` | `ModulePage` | SRV-001 | `/api/admin/services`, `/api/auth/me` | services | view table/detail | no | loading/empty/error YES | No direct | IMPLEMENTED-PARTIAL |
| ERP-SCR-003 | `/admin/site-content` | `SiteContentPage` | CMS-001 | `/api/admin/services`, `/api/admin/contents`, `PATCH /api/admin/contents/:id` | services, content, translations, audit | select service/content, workflow transition | no form, workflow buttons | empty/error PARTIAL | Source Contract | IMPLEMENTED |
| ERP-SCR-004 | `/admin/news` | `ModulePage` | NEWS-ADM-001 | `/api/admin/news` | news | view table/detail | no | loading/empty/error YES | No direct | IMPLEMENTED-PARTIAL |
| ERP-SCR-005 | `/admin/inquiries` | `ModulePage` | CRM-001 | `/api/admin/inquiries` | inquiries | view table/detail | no | loading/empty/error YES | No direct | IMPLEMENTED-PARTIAL |
| ERP-SCR-006 | `/admin/leads` | `ModulePage` | CRM-002 | `/api/admin/leads` | leads, services, users | view table/detail | no | loading/empty/error YES | No direct | IMPLEMENTED-PARTIAL |
| ERP-SCR-007 | `/admin/opportunities` | `ModulePage` | CRM-003 | `/api/admin/opportunities` | opportunities, leads | view table/detail | no | loading/empty/error YES | No direct | IMPLEMENTED-PARTIAL |
| ERP-SCR-008 | `/admin/projects` | `ProjectWbsPage` | PRJ-001, WBS-001 | `/api/admin/projects`, `/api/admin/wbs`, `POST /api/erp/projects`, `POST /api/erp/wbs`, `PATCH /api/erp/wbs/:id` | projects, project_members, wbs_tasks, audit | create project, create WBS, move status | yes | notice/error PARTIAL, empty PARTIAL | Direct | IMPLEMENTED |
| ERP-SCR-009 | `/admin/daily-work` | `DailyWorkPage` | DR-001, DL-001, WBS-002 | `/api/admin/projects`, `/api/admin/wbs`, `POST /api/erp/daily-reports`, `POST /api/erp/daily-logs` | daily reports/logs, WBS | submit morning report, submit evening log | yes | notice/error PARTIAL | Direct | IMPLEMENTED |
| ERP-SCR-010 | `/admin/todos` | `ModulePage` | TODO-001 | `/api/erp/todos` | todo_items, WBS | view table/detail | no | loading/empty/error YES | No direct | IMPLEMENTED-PARTIAL |
| ERP-SCR-011 | `/admin/approvals` | `ApprovalPage` | APR-001 | `/api/admin/approvals`, `/api/admin/users`, `POST /api/erp/approvals`, `POST /api/erp/approvals/:id/actions` | approval documents/lines/actions | create approval, approve/request changes/reject | yes | notice/error PARTIAL | Direct | IMPLEMENTED |
| ERP-SCR-012 | `/admin/attendance` | `ModulePage` | ATT-001 | `/api/erp/attendance` | attendance_records | view table/detail | no | loading/empty/error YES | Browser QA direct route reference | IMPLEMENTED-PARTIAL |
| ERP-SCR-013 | `/admin/leave` | `ModulePage` | LEAVE-001 | `/api/erp/leave` | leave_requests, leave_balances | view table/detail | no | loading/empty/error YES | No direct | IMPLEMENTED-PARTIAL |
| ERP-SCR-014 | `/admin/timesheets` | `ModulePage` | TIME-001 | `/api/erp/timesheets` | timesheets | view table/detail | no | loading/empty/error YES | No direct | IMPLEMENTED-PARTIAL |
| ERP-SCR-015 | `/admin/users` | `ModulePage` | ORG-001 | `/api/admin/users` | users, departments | view table/detail | no | loading/empty/error YES | Browser QA source reference | IMPLEMENTED-PARTIAL |
| ERP-SCR-016 | `/admin/departments` | `ModulePage` | ORG-002 | `/api/admin/departments` | departments, users | view table/detail | no | loading/empty/error YES | Direct endpoint source test | IMPLEMENTED-PARTIAL |
| ERP-SCR-017 | `/admin/roles` | `ModulePage` | RBAC-001 | `/api/admin/roles` | roles, permissions | view table/detail | no | loading/empty/error YES | Direct endpoint source test | IMPLEMENTED-PARTIAL |
| ERP-SCR-018 | `/admin/permissions` | `ModulePage` | RBAC-002 | `/api/admin/permissions` | permissions | view table/detail | no | loading/empty/error YES | No direct | IMPLEMENTED-PARTIAL |
| ERP-SCR-019 | `/admin/budgets` | `ModulePage` | FIN-001 | `/api/erp/budgets` | project_budgets | view table/detail | no | loading/empty/error YES | No direct | IMPLEMENTED-PARTIAL |
| ERP-SCR-020 | `/admin/expenses` | `ModulePage` | EXP-001 | `/api/erp/expenses` | expense_requests, budgets | view table/detail | no | loading/empty/error YES | No direct | IMPLEMENTED-PARTIAL |
| ERP-SCR-021 | `/admin/goals` | `ModulePage` | KPI-001 | `/api/erp/goals` | goals | view table/detail | no | loading/empty/error YES | No direct | IMPLEMENTED-PARTIAL |
| ERP-SCR-022 | `/admin/evaluations` | `EvaluationPage` | EVAL-001 | `/api/admin/evaluations`, `/api/admin/users`, `/api/admin/evaluations/items`, `/api/erp/evaluations/evidences`, `POST /api/erp/evaluations/scores`, `POST /api/erp/evaluations/cycles/:id/finalize` | evaluations, evidence, users | select cycle/user, score, finalize | yes | empty/error PARTIAL | Direct | IMPLEMENTED |
| ERP-SCR-023 | `/admin/board` | `ModulePage` | BOARD-001 | `/api/erp/board` | board_posts | view table/detail | no | loading/empty/error YES | No direct | IMPLEMENTED-PARTIAL |
| ERP-SCR-024 | `/admin/knowledge` | `ModulePage` | KNOW-001 | `/api/erp/knowledge` | knowledge_documents | view table/detail | no | loading/empty/error YES | Direct endpoint source test | IMPLEMENTED-PARTIAL |
| ERP-SCR-025 | `/admin/media` | `MediaPage` | MEDIA-001 | `POST /api/admin/media` | attachments, R2 | upload media | yes | notice/error PARTIAL | Direct | IMPLEMENTED |
| ERP-SCR-026 | `/admin/service-deployments` | `ModulePage` | SRV-DEP-001 | `/api/admin/service-deployments` | service_deployments | view table/detail | no | loading/empty/error YES | Direct endpoint source test | IMPLEMENTED-PARTIAL |
| ERP-SCR-027 | `/admin/site-banners` | `ModulePage` | CMS-BANNER-001 | `/api/admin/site-banners` | site_banners | view table/detail | no | loading/empty/error YES | Direct endpoint source test | IMPLEMENTED-PARTIAL |
| ERP-SCR-028 | `/admin/site-navigation` | `ModulePage` | CMS-NAV-001 | `/api/admin/site-navigation` | site_navigation_items | view table/detail | no | loading/empty/error YES | Direct endpoint source test | IMPLEMENTED-PARTIAL |
| ERP-SCR-029 | `/admin/approval-templates` | `ModulePage` | APR-TPL-001 | `/api/erp/approval-templates` | approval_templates | view table/detail | no | loading/empty/error YES | Direct endpoint source test | IMPLEMENTED-PARTIAL |
| ERP-SCR-030 | `/admin/code-groups` | `ModulePage` | SYS-CODE-001 | `/api/system/code-groups` | common_code_groups, common_codes | view table/detail | no | loading/empty/error YES | Direct endpoint source test | IMPLEMENTED-PARTIAL |
| ERP-SCR-031 | `/admin/integrations` | `ModulePage` | INT-001 | `/api/system/integrations` | integrations | view table/detail | no | loading/empty/error YES | No direct | IMPLEMENTED-PARTIAL |
| ERP-SCR-032 | `/admin/email-templates` | `ModulePage` | EMAIL-001 | `/api/system/email-templates` | email_templates | view table/detail | no | loading/empty/error YES | No direct | IMPLEMENTED-PARTIAL |
| ERP-SCR-033 | `/admin/audit-logs` | `ModulePage` | AUDIT-001 | `/api/system/audit-logs` | audit_logs, users | view table/detail | no | loading/empty/error YES | No direct | IMPLEMENTED-PARTIAL |
| ERP-SCR-034 | `/admin/settings` | `ModulePage` | SYS-SET-001 | `/api/system/settings` | system_settings | view detail/table | no | loading/empty/error YES | No direct | IMPLEMENTED-PARTIAL |

## 6. Auth/Legal/Error Screens

| Screen ID | Route | Component | Class | APIs | Form | SEO | Production | Status |
|---|---|---|---|---|---|---|---|---|
| AUTH-SCR-001 | `/admin/login` | `AdminLoginPage` | AUTH | `POST /api/auth/login` | email/password | GLOBAL-ONLY | 200 rendered | IMPLEMENTED |
| LEG-SCR-001 | `/privacy` | `LegalPage(kind=privacy)` | LEGAL | none | none | COMPLETE | 200 | IMPLEMENTED |
| LEG-SCR-002 | `/terms` | `LegalPage(kind=terms)` | LEGAL | none | none | COMPLETE | 200 | IMPLEMENTED |
| LEG-SCR-003 | `/email-policy` | `LegalPage(kind=email-policy)` | LEGAL | none | none | COMPLETE | 200 | IMPLEMENTED |
| ERR-SCR-001 | public fallback | `NotFoundPage` | ERROR | none | none | NONE | SPA fallback | IMPLEMENTED-PARTIAL |

## 7. Navigation Matrix
- Header: `/`, `/company`, `/business`, `/newsletter`, `/contact`; visibility anonymous.
- Locale switcher: preserves current `publicPath` across `ko`, `en`, `ja`, `fr`, `es`.
- Footer: company, business, newsletter, contact, privacy, terms, email policy, family external links.
- Home CTAs: business, company, contact, project details, newsletter details.
- Business: project detail links and contact CTA.
- Project detail: contact and business links.
- Admin sidebar: all 34 `adminModules` grouped from `src/content/admin.ts`; no client-side permission filtering found.
- Admin topbar: public website external link and logout.
- Direct URL only candidates: `/admin` alias, `/project/:slug` alias, public fallback 404, several generic admin modules that only appear via sidebar.
- NAVIGATION-ORPHAN CANDIDATE: none of the registered `adminModules` are orphaned from sidebar navigation.

## 8. Screen -> Component Matrix
- PublicShell: `PublicShell`, `AppLink`, locale selector, desktop/mobile nav, footer.
- Public child components: `Seo`, `ResponsiveMedia`, `SectionTitle`, `StatusBadge`, `VideoHero`, `IntelligenceFlow`.
- AdminShell: `AdminShell`, `StatePanel`, sidebar, topbar, mobile menu, logout.
- Admin child components: `AdminPageHeader`, `DataTable`, `MetricCard`, `WorkflowPanel`, `RevisionDiff`, `StatePanel`, `StatusBadge`.
- Generic admin screen: `ModulePage` consumes `adminModules` and renders `DataTable`, detail grid, or `StatePanel`.

## 9. Screen -> API Matrix
- Public API screens: Home -> public news; Newsletter list/detail -> public news; Contact -> public inquiries.
- Auth API screens: Login -> auth login; AdminShell -> auth me/logout.
- Specialized Admin/ERP API screens: dashboard, project/WBS, daily work, approvals, evaluations, site content, media.
- Generic ModulePage API screens: all `adminModules` with an `endpoint` not handled by a specialized component.
- UI-CALLS-UNKNOWN-API: none found in `src/`.
- API-NOT-USED-BY-UI: many backend endpoints from `API_INVENTORY.md` are backend/admin-operation/mobile-future capable but not directly invoked by current UI.

## 10. Screen -> DB Domain Matrix
- Direct frontend DB access found: 0. No `DATABASE_URL`, Neon client, Postgres client, pool, or connection string pattern found under `src/`.
- Public screens map through Worker APIs to news/inquiries.
- Admin/ERP screens map through Worker APIs to service/CMS/CRM/project/WBS/daily/approval/evaluation/org/workplace/finance/system tables.

## 11. Screen -> Requirement Mapping
- Home: PUB-001, SEO-001, I18N-001
- Company: PUB-002
- Business: PUB-003, BUS-001
- Newsletter list/detail: PUB-004, NEWS-001, NEWS-002
- Contact: PUB-005, CRM-001
- Legal: LEG-001
- Admin login: AUTH-001
- Dashboard: ERP-DASH-001
- Service Hub/CMS: SRV-001, CMS-001
- CRM screens: CRM-001, CRM-002, CRM-003
- Project/WBS/Daily: PRJ-001, WBS-001, DR-001, DL-001
- Approval/Evaluation: APR-001, EVAL-001
- Organization/RBAC: ORG-001, ORG-002, RBAC-001, RBAC-002
- Workplace/Finance/KPI/Knowledge/System: ATT-001, LEAVE-001, TIME-001, FIN-001, EXP-001, KPI-001, KNOW-001, AUDIT-001, SYS-SET-001

## 12. Form Inventory
- Contact inquiry: COMPLETE enough for current release; client validation is basic, server validation is authoritative.
- Admin login: COMPLETE; browser required fields and server error mapping.
- Project/WBS: PARTIAL; create project/task forms and status updates connected to API.
- Daily work: PARTIAL; report/log forms connected to WBS APIs.
- Approval: PARTIAL; create/action connected to APIs.
- Evaluation: PARTIAL; score/finalize connected to APIs and evidence gate UI exists.
- Media upload: PARTIAL; multipart upload connected to API/R2 path.

## 13. UI State Matrix
- Loading complete: 30 route entries.
- Empty complete: 30 route entries.
- Error complete: 34 route entries.
- Forbidden complete: 0 route entries; `StatePanel` supports `forbidden`, but no screen usage was found.
- AdminShell session loading: YES.
- ModulePage loading/empty/error: YES.
- Specialized admin screens: PARTIAL; many use notice/error text rather than full `StatePanel`.
- Public data screens: Newsletter has loading/empty; Home news silently falls back.

## 14. Responsive Matrix
- Public: RESPONSIVE across route entries; CSS breakpoints include 1100, 1024, 768/760 and smaller. Production Playwright read-only render succeeded at 390px for core public pages.
- Admin/ERP: PARTIAL; `AdminShell` has mobile sidebar and responsive CSS, but every dense module/table/modal workflow was not viewport-tested in this read-only phase.
- Responsive complete: 13 anonymous public/auth/legal/error route entries.
- Responsive partial: 35 protected Admin/ERP route entries.

## 15. Accessibility Inventory
- Public GOOD: skip link, semantic `main`, nav labels, image alt, aria labels, tab roles in newsletter.
- Admin PARTIAL: admin skip link, keyboard focus helper, table captions/scope in `DataTable`, sidebar labels and mobile menu aria attributes.
- Forms PARTIAL: labels wrap controls, but explicit `htmlFor`/`id` linkage is not consistently used.
- Dialog semantics: N/A; no modal/dialog route was found.
- Forbidden state: component type exists but no rendered route use found.

## 16. i18n Matrix
- Supported locales: `ko`, `en`, `ja`, `fr`, `es`.
- Public route locale support: 5-LOCALE READY through `publicRoute`, `localizedPath`, and `publicCopies`.
- API locale parameters: Home/newsletter/news detail use locale on public news APIs.
- Locale fallback behavior: `localeFromPath()` defaults unknown/default to `ko`; non-Korean supported prefixes are stripped before matching.
- Admin/ERP i18n: N/A/PARTIAL; internal UI is Korean-oriented and not part of public 5-language requirement.

## 17. SEO Matrix
- Public SEO: `Seo` sets title, description, canonical, OG title/description/type/url/image, hreflang, and Organization JSON-LD.
- Canonical base: `https://www.jinbizman.com`.
- Sitemap/robots: `sitemap.xml`, `public/sitemap.xml`, `robots.txt`, and `public/robots.txt` use `www.jinbizman.com`.
- SEO complete: 10 public/legal route entries.
- SEO partial: 1 project alias route (`/project/:slug`) shares canonical generated for `/projects/:slug`.
- SEO none/N/A: admin/auth/error routes.

## 18. Test Coverage Matrix
- Direct test coverage: 25 route entries.
- No direct test: 23 route entries.
- Unit/source contract tests: `tests/public-react.test.mjs`, `tests/admin-react.test.mjs`, `tests/design-quality.test.mjs`, `tests/design-restraint-v4.test.mjs`, `tests/react-migration.test.mjs`, `tests/react-telos-latest.test.mjs`, `tests/release-hardening.test.mjs`, `tests/worker/config.test.mjs`, `tests/test_site.py`.
- Playwright E2E: `tests/e2e/public.spec.ts` covers public routes and admin redirect behavior.
- Legacy QA drift: `tests/browser_qa_public.py` and `tests/browser_qa_erp.py` still reference older `.html` MPA routes; recorded as drift candidate, not modified.

## 19. Production Verification
- `https://www.jinbizman.com`: GET 200; Playwright rendered H1.
- `/company`: GET 200; Playwright rendered H1.
- `/business`: GET 200; Playwright rendered H1.
- `/newsletter`: GET 200; Playwright rendered H1.
- `/contact`: GET 200; Playwright rendered H1.
- `/admin/login`: GET 200; Playwright rendered H1.
- `/privacy`, `/terms`, `/email-policy`: GET 200.
- `/projects/eureka-world`: GET 200.
- `/en/company`, `/ja/business`, `/fr/contact`, `/es/newsletter`: GET 200.
- `/admin/dashboard`: unauthenticated GET redirected to `/admin/login`.
- Production write actions: 0.

## 20. Source vs v2.0 Document Drift
- MATCH: core public website routes, 5-language public route scheme, contact inquiry API connection, protected admin shell, ERP module registry, WBS/daily/approval/evaluation specialized workflows.
- ROUTE-DRIFT: legacy QA scripts reference `.html` routes from older MPA structure; current React routes do not use `.html`.
- COMPONENT-DRIFT: many ERP modules use generic `ModulePage` instead of module-specific screens.
- API-DRIFT: some APIs inventoried in P0-003 are not directly used by current UI; this may be backend-only/future-mobile capacity.
- NAVIGATION-DRIFT: no registered admin module orphan found; `/project/:slug` alias is direct/legacy-style.
- STATE-DRIFT: forbidden route state is not rendered anywhere despite `StatePanel` supporting it.
- I18N-DRIFT: public supports 5 locales; admin is not 5-locale UI.
- SEO-DRIFT: public `Seo` is broad, but fallback 404 has no SEO metadata and `/project/:slug` alias canonicalizes through project route logic.

## 21. Gap Candidates

### GAP-UI-001
Screen: Admin/ERP sidebar
Type: Permission UI mapping
Observed: All `adminModules` are visible in the sidebar after login; no client-side permission filtering was found.
Expected: UI visibility should eventually align with server permission/scope policy.
Related Requirement: RBAC-001
Risk: Users may see inaccessible modules and experience 403/API errors.
Suggested Review Phase: P1
Severity Candidate: P1 candidate

### GAP-UI-002
Screen: Admin/ERP protected screens
Type: Forbidden state
Observed: `StatePanel` supports `forbidden`, but no screen uses a forbidden state.
Expected: Protected screen inventory expects forbidden UI state for permission failures.
Related Requirement: AUTH/RBAC UI state
Risk: Permission failures may appear only as generic errors.
Suggested Review Phase: P1
Severity Candidate: P1 candidate

### GAP-UI-003
Screen: Generic Admin/ERP modules
Type: Component depth
Observed: Many operational modules render through `ModulePage` table/detail only.
Expected: v2.0 describes richer workflows for some modules such as leave, expenses, budgets, goals, board, knowledge, settings.
Related Requirement: ERP module requirements
Risk: Screens may be functionally read-only despite backend write APIs existing.
Suggested Review Phase: P1/P2
Severity Candidate: P1 candidate

### GAP-UI-004
Screen: Test suite references
Type: Test/navigation drift
Observed: legacy browser QA files still reference older `.html` public/admin routes.
Expected: tests should align with React canonical routes.
Related Requirement: Release verification
Risk: QA scripts may validate obsolete navigation assumptions.
Suggested Review Phase: P2
Severity Candidate: P2 candidate

### GAP-UI-005
Screen: Public fallback and aliases
Type: SEO/state drift
Observed: public 404 has no `Seo`; `/project/:slug` alias exists but SEO canonical behavior is centered on `/projects/:slug`.
Expected: public error/alias handling should be explicitly defined.
Related Requirement: SEO-001, ERR-001
Risk: ambiguous canonical/indexing behavior for fallback or legacy alias URLs.
Suggested Review Phase: P2
Severity Candidate: P2 candidate

## 22. P0-004 Exit Criteria
- [x] Frontend entrypoint 분석
- [x] Router 전수 분석
- [x] 전체 route 추출
- [x] Dynamic route 추출
- [x] Page component mapping
- [x] Shell/Layout mapping
- [x] 주요 child component mapping
- [x] Navigation mapping
- [x] Auth UI mapping
- [x] Permission UI mapping
- [x] API mapping
- [x] DB domain mapping
- [x] User action inventory
- [x] Form inventory
- [x] Loading 전수
- [x] Empty 전수
- [x] Error 전수
- [x] Forbidden 전수
- [x] Responsive inventory
- [x] Accessibility inventory
- [x] i18n inventory
- [x] SEO inventory
- [x] Production GET verification
- [x] Browser read-only render verification
- [x] Test mapping
- [x] Requirement mapping
- [x] Screen status classification
- [x] Source/document drift
- [x] Gap candidates
- [x] `SCREEN_INVENTORY.md` 생성
- [x] Source/API/DB/Cloudflare write 0건
