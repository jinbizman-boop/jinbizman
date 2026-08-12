# JINBIZ MANAGEMENT API Security Policy

## Origin Policy

Cookie-authenticated web writes must come from a trusted origin. The production allowlist is:

- `https://www.jinbizman.com`
- `https://jinbizman.com`

Missing or untrusted `Origin` on cookie web writes returns `403 FORBIDDEN_ORIGIN`.

## Cookie vs Bearer Boundary

- Legacy web auth uses `jinbiz_session` HttpOnly cookies.
- `/api/v1/*` mobile auth uses `Authorization: Bearer`.
- Mobile Bearer requests do not require a browser `Origin` header.
- Bearer auth still requires token validation, rate limit, RBAC, scope, validation, and business rules.

## CORS Allowlist

CORS never uses `Access-Control-Allow-Origin: *`.

Allowed origins receive:

```text
Access-Control-Allow-Origin: <exact origin>
Access-Control-Allow-Credentials: true
Vary: Origin
```

Disallowed origins receive no permissive `Access-Control-Allow-Origin`.

## Preflight

`OPTIONS` returns a no-body `204` with:

- Methods: `GET, POST, PATCH, PUT, OPTIONS`
- Headers: `Content-Type`, `Authorization`, `X-Request-ID`, `Idempotency-Key`
- Max age: `86400`

## Allowed Methods

Known API paths have a method allowlist. Unsupported methods on known paths return:

- `405 METHOD_NOT_ALLOWED`
- `Allow` header with the supported methods

Unknown paths continue to return `404 NOT_FOUND`.

## Rate Limit Classes

| API Class | Example Routes | Limit | Window | Bucket Key | 429 | Retry-After |
|---|---|---:|---:|---|---|---|
| AUTH | `POST /api/auth/login`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh` | `LOGIN_RATE_LIMIT_PER_10_MIN`, default 10 | 10 min | IP hash or endpoint class | `RATE_LIMITED` | `600` |
| PUBLIC_WRITE | `POST /api/public/inquiries` | `PUBLIC_RATE_LIMIT_PER_10_MIN`, default 20 | 10 min | IP hash + endpoint group | `RATE_LIMITED` | `600` |
| PUBLIC_READ | `GET /api/public/news`, `GET /api/public/services` | CDN/edge policy | N/A | N/A | N/A | N/A |
| PROTECTED_WRITE | general `/api/admin/*`, `/api/erp/*`, `/api/system/*` writes | `PROTECTED_RATE_LIMIT_PER_10_MIN`, default 120 | 10 min | authenticated user id or IP hash + endpoint group | `RATE_LIMITED` | `600` |
| HIGH_RISK_WRITE | approval actions, evaluation finalize, system settings, integrations, role/admin operations | `HIGH_RISK_RATE_LIMIT_PER_10_MIN`, default 30 | 10 min | authenticated user id or IP hash + endpoint group | `RATE_LIMITED` | `600` |

The existing `api_rate_limits` table is reused. No new database table is introduced by GAP-P1-003.

## Body Limits

| Body Class | Routes | Max |
|---|---|---:|
| General JSON | most JSON write endpoints | 256KB |
| CMS JSON | contents, translations, news, knowledge, email templates | 1MB |
| Media upload | `POST /api/admin/media` | 10MB current implementation limit |

Oversized requests return `413 PAYLOAD_TOO_LARGE`.

## Content-Type Policy

JSON write endpoints require `application/json`.

Exceptions:

- `POST /api/admin/media` requires `multipart/form-data`.
- Logout/refresh endpoints may use Bearer transport without a JSON body.

Wrong content type returns `415 UNSUPPORTED_MEDIA_TYPE`.

## Malformed JSON

Malformed JSON returns `400 INVALID_JSON`. Stack traces, SQL, filesystem paths, and secret values must not be exposed.

## Pagination

List-style query limits are capped at `100`. Smaller route-specific caps are allowed, such as public news `limit <= 30`.

## Filter And Sort Whitelist

Runtime SQL ordering uses static `ORDER BY` clauses. User-provided `sort` or `order` values must be mapped through explicit allowlists before SQL usage.

## Path And Query Limits

Dynamic numeric `:id` path segments must be positive safe integers. Invalid numeric IDs return `400 INVALID_PATH_PARAMETER` before DB access.

String inputs such as slug, locale, status, category, and search parameters must use existing validation helpers or route-specific allowlists.

## File Upload Boundary

Current media upload accepts PNG, JPEG, WebP, SVG, and PDF up to 10MB through R2-backed `MEDIA_BUCKET`. The v2.0 50MB attachment target is a future R2/media policy item and is outside GAP-P1-003.

## Error Handling

API abuse and malformed requests should terminate as consistent 4xx responses. The global 500 handler remains generic and does not expose internal details.

## Request ID

Every API response keeps `x-request-id`. Client-provided IDs are accepted only when they are short safe tokens; otherwise the Worker generates `crypto.randomUUID()`.
