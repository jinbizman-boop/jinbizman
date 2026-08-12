# JINBIZ MANAGEMENT Authentication Contract

## Web Auth

- `POST /api/auth/login` validates credentials and issues `jinbiz_session`.
- `GET /api/auth/me` resolves the current user from the HttpOnly cookie.
- `POST /api/auth/logout` clears the cookie and records a logout event when a user is present.
- Cookie policy: `HttpOnly`, `Path=/`, `SameSite=Strict`, `Secure` in production, TTL from `SESSION_TTL_SECONDS`.

## Mobile Auth

- `POST /api/v1/auth/login` returns `accessToken`, `refreshToken`, `expiresIn`, `refreshExpiresIn`, `tokenType`, and `user`.
- `POST /api/v1/auth/refresh` accepts a refresh token, revokes the old mobile session row, and issues a rotated token pair.
- `GET /api/v1/auth/me` requires a Bearer access token and returns the same normalized `AuthUser` shape used by web RBAC.
- `POST /api/v1/auth/logout` revokes the current mobile refresh session only.

## Token Types

- Access token claims: `sub`, `iat`, `exp`, `jti`, `session_id`, `token_type=access`.
- Refresh token claims: `sub`, `iat`, `exp`, `jti`, `session_id`, `token_type=refresh`.
- Access token TTL uses `SESSION_TTL_SECONDS` with a one-hour upper bound.
- Refresh tokens are rejected by normal bearer auth and cannot be used as access tokens.

## Refresh Token Storage

- The server stores only `sha256(refreshToken)` in `auth_sessions.refresh_token_hash`.
- The refresh token plaintext is returned once to the client and must not be logged or persisted by the server.
- Mobile client storage must use iOS Keychain, Android Keystore, or Expo SecureStore.

## Rotation And Revocation

- Refresh rotation revokes the previous `auth_sessions` row with `revoke_reason='rotated'`.
- Logout revokes the current row with `revoke_reason='logout'`.
- Expired, revoked, malformed, wrong-type, or unknown refresh tokens return `401`.
- Suspended or retired users cannot refresh; inactive accounts return `403`.

## Device Session

- `auth_sessions` records `session_jti`, `user_id`, `device_id`, `platform`, `app_version`, `user_agent`, `ip_hash`, `created_at`, `last_used_at`, `expires_at`, `revoked_at`, and `revoke_reason`.
- `device_id` is an app-generated random installation identifier, not a hardware fingerprint.
- "Logout all devices" is outside GAP-P1-002.

## RBAC And Scope Integration

- Web cookie auth and mobile bearer auth normalize to the same `AuthUser`.
- Role, permission, and scope checks from `worker/lib/authorization.ts` apply equally to both transports.
- `super_admin` keeps RBAC scope bypass only; business validation is not bypassed.

## Secret Handling

- `JWT_SECRET` remains server-side only.
- `DATABASE_URL`, `JWT_SECRET`, refresh tokens, and admin passwords must not be committed, logged, or exposed to clients.
