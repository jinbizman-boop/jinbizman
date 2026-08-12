import { expect, test, type Page } from "@playwright/test";

const envelope = (data: unknown) => ({ success: true, data });

async function mockAdminSession(page: Page, permissions: string[]) {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ contentType: "application/json", body: JSON.stringify(envelope({ id: 7, email: "ux-test@jinbizman.com", name: "UX Test", roles: ["fixture"], permissions })) });
  });
  await page.route("**/api/admin/dashboard", async (route) => {
    await route.fulfill({ contentType: "application/json", body: JSON.stringify(envelope({ active_projects: 1, open_tasks: 1, pending_approvals: 0, open_inquiries: 0, active_users: 1 })) });
  });
  await page.route("**/api/admin/operations-summary", async (route) => {
    await route.fulfill({ contentType: "application/json", body: JSON.stringify(envelope([{ module: "fixture", status: "ok" }])) });
  });
  await page.route("**/api/admin/projects", async (route) => {
    await route.fulfill({ contentType: "application/json", body: JSON.stringify(envelope([{ id: 1, code: "P-A", name: "Project A" }])) });
  });
  await page.route("**/api/admin/wbs?projectId=1", async (route) => {
    await route.fulfill({ contentType: "application/json", body: JSON.stringify(envelope([{ id: 10, title: "Scoped task", status: "todo", progress_percent: 0 }])) });
  });
}

test("authenticated user without route permission sees forbidden state on direct URL", async ({ page }) => {
  await mockAdminSession(page, ["todo.read"]);
  await page.goto("/admin/settings");
  await expect(page.getByRole("heading", { name: "권한이 없습니다." })).toBeVisible();
  await expect(page.locator('a[href="/admin/settings"]')).toHaveCount(0);
});

test("read-only project user sees project data without write actions", async ({ page }) => {
  await mockAdminSession(page, ["project.read", "wbs.read"]);
  await page.goto("/admin/projects");
  await expect(page.getByText("Scoped task")).toBeVisible();
  await expect(page.getByRole("heading", { name: "프로젝트 생성" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "WBS 저장" })).toHaveCount(0);
  await expect(page.locator('a[href="/admin/services"]')).toHaveCount(0);
});

test("super admin permission set exposes representative navigation", async ({ page }) => {
  await mockAdminSession(page, ["project.read", "system.read", "audit.read", "service.read", "content.read", "role.read", "integration.read", "email_template.read", "budget.read", "expense.read", "evaluation.read", "approval.read"]);
  await page.goto("/admin/dashboard");
  await expect(page.locator('a[href="/admin/services"]')).toHaveCount(1);
  await expect(page.locator('a[href="/admin/settings"]')).toHaveCount(1);
  await expect(page.locator('a[href="/admin/audit-logs"]')).toHaveCount(1);
});
