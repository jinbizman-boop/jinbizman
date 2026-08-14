import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

test("database has eighteen ordered production migrations", async () => {
  const files = (await readdir("db/migrations")).filter((name) => name.endsWith(".sql")).sort();
  assert.equal(files.length, 18);
  assert.equal(files[0].startsWith("001_"), true);
  assert.equal(files[10].startsWith("011_"), true);
  assert.equal(files[11].startsWith("012_"), true);
  assert.equal(files[12].startsWith("013_"), true);
  assert.equal(files[13].startsWith("014_"), true);
  assert.equal(files[14].startsWith("015_"), true);
  assert.equal(files[15].startsWith("016_"), true);
  assert.equal(files[16].startsWith("017_"), true);
  assert.equal(files[17].startsWith("018_"), true);
});

test("runtime rate limit table is part of migration 009", async () => {
  const sql = await readFile("db/migrations/009_audit_notifications.sql", "utf8");
  assert.match(sql, /CREATE TABLE IF NOT EXISTS api_rate_limits/);
});

test("production hardening migration covers login, business classification and delivery logs", async () => {
  const sql = await readFile("db/migrations/011_production_hardening.sql", "utf8");
  assert.match(sql, /failed_login_count/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS login_events/);
  assert.match(sql, /business_domain_code/);
  assert.match(sql, /cybertron_module_code/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS email_delivery_logs/);
  assert.match(sql, /company_news/);
  assert.match(sql, /careers/);
  assert.match(sql, /resources/);
});


test("workplace operations migration covers collaboration, HR and finance modules", async () => {
  const sql = await readFile("db/migrations/012_workplace_operations.sql", "utf8");
  for (const table of [
    "todo_items", "attendance_records", "leave_balances", "leave_requests",
    "project_resource_allocations", "timesheets", "project_budgets", "expense_requests",
    "goals", "board_posts", "knowledge_documents", "integrations", "email_templates"
  ]) {
    assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  }
  assert.match(sql, /allocation_percent/);
  assert.match(sql, /integrations_no_secret_keys_chk/);
});

test("remaining admin operations migration closes visible ERP module gaps", async () => {
  const files = (await readdir("db/migrations")).filter((name) => name.endsWith(".sql")).sort();
  assert.equal(files.length, 18);
  assert.equal(files[12], "013_remaining_admin_operations.sql");
  const sql = await readFile("db/migrations/013_remaining_admin_operations.sql", "utf8");
  for (const table of [
    "common_code_groups", "common_codes", "approval_templates", "approval_template_steps",
    "project_meetings", "meeting_action_items", "service_deployments", "site_banners",
    "site_navigation_items", "knowledge_templates"
  ]) assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS\\s+${table}\\b`, "i"));
});

test("mobile auth migration stores revocable device sessions without plaintext refresh tokens", async () => {
  const sql = await readFile("db/migrations/014_mobile_auth_sessions.sql", "utf8");
  assert.match(sql, /CREATE TABLE IF NOT EXISTS auth_sessions/);
  assert.match(sql, /refresh_token_hash TEXT NOT NULL UNIQUE/i);
  assert.doesNotMatch(sql, /refresh_token\s+TEXT/i);
  assert.match(sql, /revoked_at TIMESTAMPTZ NULL/i);
  assert.match(sql, /rotated_from_session_id BIGINT NULL REFERENCES auth_sessions/i);
});

test("timesheet WBS requirement migration makes the WBS reference not nullable", async () => {
  const sql = await readFile("db/migrations/015_timesheets_wbs_required.sql", "utf8");
  assert.match(sql, /ALTER TABLE\s+timesheets/i);
  assert.match(sql, /ALTER COLUMN\s+wbs_task_id\s+SET NOT NULL/i);
  assert.doesNotMatch(sql, /\b(?:UPDATE|DELETE|TRUNCATE|DROP TABLE|DROP COLUMN)\b/i);
});

test("public news list migration adds only the intended composite index", async () => {
  const sql = await readFile("db/migrations/016_news_posts_list_index.sql", "utf8");
  assert.match(sql, /CREATE INDEX\s+ix_news_posts_status_pinned_published_at/i);
  assert.match(sql, /ON news_posts\s*\(\s*status,\s*is_pinned DESC,\s*published_at DESC\s*\)/i);
  assert.doesNotMatch(sql, /\b(?:DROP INDEX|REINDEX|UPDATE|DELETE|TRUNCATE|DROP TABLE|DROP COLUMN|ALTER TABLE)\b/i);
  assert.doesNotMatch(sql, /\b(?:approval_documents|expense_requests)\b/i);
});

test("approval document recency migration adds only the intended updated-at index", async () => {
  const sql = await readFile("db/migrations/017_approval_documents_updated_at_index.sql", "utf8");
  assert.match(sql, /CREATE INDEX\s+ix_approval_documents_updated_at/i);
  assert.match(sql, /ON approval_documents\s*\(\s*updated_at DESC\s*\)/i);
  assert.doesNotMatch(sql, /\b(?:DROP INDEX|REINDEX|UPDATE|DELETE|TRUNCATE|DROP TABLE|DROP COLUMN|ALTER TABLE)\b/i);
  assert.doesNotMatch(sql, /\bexpense_requests\b/i);
});

test("expense request recency migration adds only the intended expense-date index", async () => {
  const sql = await readFile("db/migrations/018_expense_requests_expense_date_id_index.sql", "utf8");
  assert.match(sql, /CREATE INDEX\s+ix_expense_requests_expense_date_id/i);
  assert.match(sql, /ON expense_requests\s*\(\s*expense_date DESC,\s*id DESC\s*\)/i);
  assert.doesNotMatch(sql, /\b(?:DROP INDEX|REINDEX|UPDATE|DELETE|TRUNCATE|DROP TABLE|DROP COLUMN|ALTER TABLE)\b/i);
  assert.doesNotMatch(sql, /\b(?:approval_documents|news_posts)\b/i);
});
