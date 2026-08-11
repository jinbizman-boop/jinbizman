import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

test("database has thirteen ordered production migrations", async () => {
  const files = (await readdir("db/migrations")).filter((name) => name.endsWith(".sql")).sort();
  assert.equal(files.length, 13);
  assert.equal(files[0].startsWith("001_"), true);
  assert.equal(files[10].startsWith("011_"), true);
  assert.equal(files[11].startsWith("012_"), true);
  assert.equal(files[12].startsWith("013_"), true);
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
  assert.equal(files.length, 13);
  assert.equal(files.at(-1), "013_remaining_admin_operations.sql");
  const sql = await readFile(`db/migrations/${files.at(-1)}`, "utf8");
  for (const table of [
    "common_code_groups", "common_codes", "approval_templates", "approval_template_steps",
    "project_meetings", "meeting_action_items", "service_deployments", "site_banners",
    "site_navigation_items", "knowledge_templates"
  ]) assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS\\s+${table}\\b`, "i"));
});
