-- 014_mobile_auth_sessions.sql
-- Adds revocable mobile refresh-token sessions without storing refresh tokens in plaintext.
BEGIN;

CREATE TABLE IF NOT EXISTS auth_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_jti TEXT NOT NULL UNIQUE,
  refresh_token_hash TEXT NOT NULL UNIQUE,
  device_id TEXT NOT NULL DEFAULT '',
  platform TEXT NOT NULL DEFAULT 'unknown',
  app_version TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  ip_hash TEXT NOT NULL DEFAULT '',
  rotated_from_session_id BIGINT NULL REFERENCES auth_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ NULL,
  revoke_reason TEXT NOT NULL DEFAULT '',
  CONSTRAINT auth_sessions_session_jti_not_blank CHECK (btrim(session_jti) <> ''),
  CONSTRAINT auth_sessions_refresh_hash_not_blank CHECK (btrim(refresh_token_hash) <> ''),
  CONSTRAINT auth_sessions_platform_allowed CHECK (platform IN ('ios','android','web','unknown')),
  CONSTRAINT auth_sessions_expiry_after_create CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_active
  ON auth_sessions(user_id, expires_at)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_auth_sessions_session_active
  ON auth_sessions(session_jti)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_auth_sessions_refresh_hash
  ON auth_sessions(refresh_token_hash);

COMMIT;
