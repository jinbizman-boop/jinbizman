# JINBIZ MANAGEMENT API Versioning Policy

## Current Legacy API

- Legacy web API prefixes remain active: `/api/public`, `/api/auth`, `/api/admin`, `/api/erp`, and `/api/system`.
- Existing React web clients continue to use `/api/auth/*` cookie authentication and the current admin/ERP routes.
- Legacy routes are not removed or renamed by GAP-P1-002.

## Canonical v1 Policy

- `/api/v1/*` is the canonical versioned namespace for mobile-ready API contracts.
- GAP-P1-002 exposes the first v1 surface: `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/me`, and `/api/v1/auth/logout`.
- Future mobile ERP routes should be added under `/api/v1/erp/*` and share the same handler/business-rule layer as legacy routes.

## Backward Compatibility

- Additive response fields are backward compatible.
- Removing fields, changing field meaning, changing status codes, or relaxing/strengthening auth in a way that breaks existing clients is a breaking change.
- Legacy `/api/*` routes may coexist with v1 routes until a documented sunset window is approved.

## Deprecation Rules

- Deprecation requires a replacement v1 route, release notes, and a sunset date.
- P0 security fixes can restrict unsafe behavior immediately, but the replacement behavior must be documented.
- Deprecated endpoints should remain observable until removed.

## Mobile Client Policy

- Mobile clients use Bearer access tokens and refresh tokens, not web cookies.
- Refresh tokens must be stored by the client in iOS Keychain, Android Keystore, or Expo SecureStore.
- Refresh tokens must not be stored in AsyncStorage, localStorage, bundled `.env` files, source code, logs, screenshots, or analytics events.

## Auth Transport Policy

- Legacy web routes prefer `jinbiz_session` cookies and keep trusted Origin protection for cookie-authenticated writes.
- `/api/v1` routes prefer `Authorization: Bearer <accessToken>`.
- Refresh tokens are accepted only by `/api/v1/auth/refresh` and `/api/v1/auth/logout`.

## Error Compatibility

- `401` means unauthenticated, invalid, expired, revoked, or wrong token type.
- `403` means authenticated but blocked by account, permission, or scope policy.
- `423` remains available for account lockout where existing login policy uses it.
- Error envelopes keep the existing `{ success: false, error: { code, message } }` shape.

## Field Lifecycle

- New optional fields can be added in minor releases.
- Required request fields require a versioned contract update.
- Field removal or semantic changes require a new version or explicit migration plan.

## Sunset Policy

- No legacy route is sunset by this phase.
- A future sunset must identify affected clients, replacement route, compatibility period, and rollback criteria.
