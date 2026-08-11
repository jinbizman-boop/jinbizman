-- 001_core_org_auth.sql
-- Scope:
--   - departments
--   - users
--   - roles
--   - permissions
--   - role_permissions
--   - user_roles
--
-- Notes:
--   - Seed data must stay in db/seeds/*, not here.
--   - This file is the first migration in the 10-step split structure.
--   - Designed to be safe, readable, and production-ready for Neon Postgres.

BEGIN;

-- ------------------------------------------------------------
-- Extensions
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS citext;

-- ------------------------------------------------------------
-- Enums
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('active', 'invited', 'suspended', 'retired');
  END IF;
END $$;

-- ------------------------------------------------------------
-- Shared updated_at trigger
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'set_updated_at'
      AND pg_function_is_visible(oid)
  ) THEN
    CREATE FUNCTION set_updated_at()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $fn$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $fn$;
  END IF;
END $$;

-- ------------------------------------------------------------
-- departments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
  id            BIGSERIAL PRIMARY KEY,
  code          TEXT NOT NULL,
  name          TEXT NOT NULL,
  parent_id     BIGINT NULL REFERENCES departments(id) ON DELETE SET NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT departments_code_uk UNIQUE (code),
  CONSTRAINT departments_code_not_blank_chk CHECK (btrim(code) <> ''),
  CONSTRAINT departments_name_not_blank_chk CHECK (btrim(name) <> ''),
  CONSTRAINT departments_sort_order_nonnegative_chk CHECK (sort_order >= 0)
);

CREATE INDEX IF NOT EXISTS departments_parent_id_idx
  ON departments(parent_id);

CREATE INDEX IF NOT EXISTS departments_is_active_idx
  ON departments(is_active);

CREATE INDEX IF NOT EXISTS departments_sort_order_idx
  ON departments(sort_order);

CREATE UNIQUE INDEX IF NOT EXISTS departments_code_lower_uk
  ON departments (lower(code));

DROP TRIGGER IF EXISTS trg_departments_set_updated_at ON departments;
CREATE TRIGGER trg_departments_set_updated_at
BEFORE UPDATE ON departments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- users
-- invited users may exist before password is set
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              BIGSERIAL PRIMARY KEY,
  email           CITEXT NOT NULL,
  password_hash   TEXT NULL,
  name            TEXT NOT NULL,
  phone           TEXT NULL,
  status          user_status NOT NULL DEFAULT 'invited',
  department_id   BIGINT NULL REFERENCES departments(id) ON DELETE SET NULL,
  job_family      TEXT NULL,
  job_role        TEXT NULL,
  joined_at       DATE NULL,
  left_at         DATE NULL,
  last_login_at   TIMESTAMPTZ NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT users_email_uk UNIQUE (email),
  CONSTRAINT users_email_not_blank_chk CHECK (btrim(email::text) <> ''),
  CONSTRAINT users_name_not_blank_chk CHECK (btrim(name) <> ''),
  CONSTRAINT users_date_range_chk CHECK (
    left_at IS NULL OR joined_at IS NULL OR left_at >= joined_at
  ),
  CONSTRAINT users_password_required_chk CHECK (
    status = 'invited' OR password_hash IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS users_department_id_idx
  ON users(department_id);

CREATE INDEX IF NOT EXISTS users_status_idx
  ON users(status);

CREATE INDEX IF NOT EXISTS users_job_family_idx
  ON users(job_family);

CREATE INDEX IF NOT EXISTS users_job_role_idx
  ON users(job_role);

CREATE INDEX IF NOT EXISTS users_last_login_at_idx
  ON users(last_login_at DESC);

DROP TRIGGER IF EXISTS trg_users_set_updated_at ON users;
CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- roles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id            BIGSERIAL PRIMARY KEY,
  code          TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT NULL,
  is_system     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT roles_code_uk UNIQUE (code),
  CONSTRAINT roles_code_not_blank_chk CHECK (btrim(code) <> ''),
  CONSTRAINT roles_name_not_blank_chk CHECK (btrim(name) <> '')
);

CREATE UNIQUE INDEX IF NOT EXISTS roles_code_lower_uk
  ON roles (lower(code));

CREATE INDEX IF NOT EXISTS roles_is_system_idx
  ON roles(is_system);

DROP TRIGGER IF EXISTS trg_roles_set_updated_at ON roles;
CREATE TRIGGER trg_roles_set_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- permissions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS permissions (
  id            BIGSERIAL PRIMARY KEY,
  code          TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT NULL,
  group_key     TEXT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT permissions_code_uk UNIQUE (code),
  CONSTRAINT permissions_code_not_blank_chk CHECK (btrim(code) <> ''),
  CONSTRAINT permissions_name_not_blank_chk CHECK (btrim(name) <> '')
);

CREATE UNIQUE INDEX IF NOT EXISTS permissions_code_lower_uk
  ON permissions (lower(code));

CREATE INDEX IF NOT EXISTS permissions_group_key_idx
  ON permissions(group_key);

DROP TRIGGER IF EXISTS trg_permissions_set_updated_at ON permissions;
CREATE TRIGGER trg_permissions_set_updated_at
BEFORE UPDATE ON permissions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- role_permissions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_permissions (
  id             BIGSERIAL PRIMARY KEY,
  role_id        BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id  BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT role_permissions_role_permission_uk UNIQUE (role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS role_permissions_role_id_idx
  ON role_permissions(role_id);

CREATE INDEX IF NOT EXISTS role_permissions_permission_id_idx
  ON role_permissions(permission_id);

-- ------------------------------------------------------------
-- user_roles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_roles (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id     BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT user_roles_user_role_uk UNIQUE (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS user_roles_user_id_idx
  ON user_roles(user_id);

CREATE INDEX IF NOT EXISTS user_roles_role_id_idx
  ON user_roles(role_id);

COMMIT;