import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "qa-artifacts");
const SCREENSHOT_DIR = path.join(OUTPUT_DIR, "screenshots");
const BASE_URL = process.env.QA_BASE_URL ?? "http://127.0.0.1:4173";
const SHOULD_SERVE = process.argv.includes("--serve");
const ALLOW_ISSUES = process.env.QA_ALLOW_ISSUES === "1";

const viewports = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "mobile-390", width: 390, height: 844 },
];

const publicBasePaths = [
  "/",
  "/company",
  "/business",
  "/newsletter",
  "/newsletter/notice/qa-notice",
  "/contact",
  "/privacy",
  "/terms",
  "/email-policy",
];
const localePrefixes = ["", "/en", "/ja", "/fr", "/es"];
const adminKeys = [
  "dashboard", "services", "site-content", "news", "inquiries", "leads", "opportunities",
  "projects", "daily-work", "todos", "approvals", "attendance", "leave", "timesheets",
  "users", "departments", "roles", "permissions", "budgets", "expenses", "goals",
  "evaluations", "board", "knowledge", "media", "service-deployments", "site-banners",
  "site-navigation", "approval-templates", "code-groups", "integrations", "email-templates",
  "audit-logs", "settings",
];
const allPermissions = [
  "project.read", "project.create", "project.update", "wbs.read", "wbs.create", "wbs.update",
  "system.read", "system.update", "audit.read", "service.read", "service.create", "service.update",
  "content.read", "content.update", "content.publish", "news.read", "news.create", "news.update",
  "news.publish", "inquiry.read", "inquiry.update", "lead.convert", "lead.update",
  "opportunity.manage", "daily_report.create", "daily_log.create", "todo.read", "todo.manage",
  "approval.read", "approval.create", "approval.act", "attendance.read", "attendance.punch",
  "attendance.manage", "leave.read", "leave.create", "leave.manage", "timesheet.read",
  "timesheet.create", "timesheet.review", "user.read", "user.update", "role.read", "budget.read",
  "budget.manage", "expense.read", "expense.create", "expense.manage", "goal.read", "goal.manage",
  "evaluation.read", "evaluation.score", "evaluation.finalize", "board.read", "board.manage",
  "knowledge.read", "knowledge.manage", "integration.read", "integration.manage",
  "email_template.read", "email_template.manage",
];

const envelope = (data) => JSON.stringify({ success: true, data });
const now = new Date().toISOString();

function localizedPath(prefix, pathname) {
  if (!prefix) return pathname;
  return pathname === "/" ? prefix : `${prefix}${pathname}`;
}

function safeName(value) {
  const clean = value.replace(/^\/+/, "").replace(/[^a-zA-Z0-9가-힣_-]+/g, "-").replace(/^-|-$/g, "");
  return clean || "home";
}

async function discoverProjectPaths() {
  try {
    const source = await fs.readFile(path.join(ROOT, "src/content/public.ts"), "utf8");
    const slugs = [...source.matchAll(/slug:\s*["']([^"']+)["']/g)].map((match) => match[1]);
    return [...new Set(slugs)].filter((slug) => !slug.includes("/")).map((slug) => `/projects/${slug}`);
  } catch {
    return [];
  }
}

async function waitForServer(url, timeoutMs = 60_000) {
  const started = Date.now();
  let lastError = "";
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status < 500) return;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`로컬 미리보기 서버가 열리지 않았습니다: ${lastError}`);
}

function startPreviewServer() {
  const command = process.platform === "win32" ? "npm.cmd" : "npm";
  return spawn(command, ["run", "preview", "--", "--host", "127.0.0.1", "--port", "4173"], {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env },
  });
}

async function installApiMocks(page) {
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname;
    const method = request.method();

    let data;
    if (pathname === "/api/auth/me") {
      data = { id: 7, email: "visual-qa@jinbizman.com", name: "Visual QA", roles: ["super_admin"], permissions: allPermissions };
    } else if (pathname === "/api/admin/dashboard") {
      data = { active_projects: 6, open_tasks: 18, pending_approvals: 4, open_inquiries: 7, active_users: 12 };
    } else if (pathname === "/api/admin/operations-summary") {
      data = [
        { module: "Homepage", status: "healthy", owner: "운영팀", updated_at: now },
        { module: "ERP", status: "active", owner: "PMO", updated_at: now },
        { module: "Database", status: "healthy", owner: "개발팀", updated_at: now },
      ];
    } else if (pathname === "/api/public/news") {
      data = [
        { id: 1, title: "JINBIZ UI·UX 고도화 검증", summary: "기업형 홈페이지와 ERP 화면을 검증합니다.", category: "notice", slug: "qa-notice", published_at: "2026-08-20" },
        { id: 2, title: "서비스 운영 업데이트", summary: "서비스 허브와 WBS 운영 현황입니다.", category: "press", slug: "operations-update", published_at: "2026-08-19" },
      ];
    } else if (pathname.startsWith("/api/public/news/")) {
      data = { id: 1, title: "JINBIZ UI·UX 고도화 검증", summary: "기업형 홈페이지와 ERP 화면을 검증합니다.", body: "Desktop, Tablet, Mobile 전체 화면을 검증하는 QA 콘텐츠입니다.", category: "notice", slug: "qa-notice", published_at: "2026-08-20" };
    } else if (pathname === "/api/admin/projects") {
      data = [{ id: 1, code: "P-UIUX-001", name: "공식 홈페이지·ERP 고도화", status: "active", owner: "JINBIZ PMO", updated_at: now }];
    } else if (pathname === "/api/admin/wbs") {
      data = [
        { id: 11, title: "Desktop 1440 QA", status: "in_progress", progress_percent: 80, priority: "high" },
        { id: 12, title: "Tablet 768 QA", status: "review", progress_percent: 90, priority: "medium" },
        { id: 13, title: "Mobile 390 QA", status: "todo", progress_percent: 40, priority: "high" },
      ];
    } else if (pathname === "/api/system/settings") {
      data = { canonical_host: "www.jinbizman.com", default_locale: "ko", supported_locales: ["ko", "en", "ja", "fr", "es"], environment: "visual-qa" };
    } else if (method === "GET") {
      data = [{ id: 1, title: "운영 샘플", name: "JINBIZ Sample", status: "active", owner: "담당자", updated_at: now }];
    } else {
      data = { id: 1, status: "ok", updated_at: now };
    }

    await route.fulfill({ status: 200, contentType: "application/json; charset=utf-8", body: envelope(data) });
  });
}

async function capture(page, routePath, viewport, kind, results) {
  const consoleErrors = [];
  const pageErrors = [];
  const onConsole = (message) => { if (message.type() === "error") consoleErrors.push(message.text()); };
  const onPageError = (error) => pageErrors.push(error.message);
  page.on("console", onConsole);
  page.on("pageerror", onPageError);

  const result = { kind, viewport: viewport.name, route: routePath, status: "ok", overflowPx: 0, brokenImages: [], consoleErrors, pageErrors, screenshot: "" };
  try {
    await page.goto(`${BASE_URL}${routePath}`, { waitUntil: "networkidle", timeout: 45_000 });
    await page.waitForTimeout(250);
    const diagnostics = await page.evaluate(() => ({
      overflowPx: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      brokenImages: [...document.images]
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.getAttribute("src") || "unknown"),
      bodyTextLength: document.body.innerText.trim().length,
    }));
    result.overflowPx = diagnostics.overflowPx;
    result.brokenImages = diagnostics.brokenImages;
    if (diagnostics.bodyTextLength < 20) result.status = "empty";

    const relative = path.join("screenshots", viewport.name, kind, `${safeName(routePath)}.png`);
    const absolute = path.join(OUTPUT_DIR, relative);
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    await page.screenshot({ path: absolute, fullPage: true, animations: "disabled" });
    result.screenshot = relative.replaceAll("\\", "/");
  } catch (error) {
    result.status = "error";
    pageErrors.push(error instanceof Error ? error.message : String(error));
  } finally {
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
    results.push(result);
  }
}

async function writeReport(results) {
  const p0 = results.filter((item) => item.status !== "ok" || item.overflowPx > 2 || item.brokenImages.length || item.pageErrors.length);
  const p1 = results.filter((item) => item.consoleErrors.length && !p0.includes(item));
  const report = {
    generatedAt: new Date().toISOString(),
    baseURL: BASE_URL,
    totals: { screens: results.length, p0: p0.length, p1: p1.length },
    results,
  };
  await fs.writeFile(path.join(OUTPUT_DIR, "visual-qa-report.json"), `${JSON.stringify(report, null, 2)}\n`);

  const lines = [
    "# JINBIZ Visual QA Summary",
    "",
    `- 생성일: ${report.generatedAt}`,
    `- 전체 렌더링: ${results.length}`,
    `- P0: ${p0.length}`,
    `- P1: ${p1.length}`,
    "",
    "## P0",
    ...(p0.length ? p0.map((item) => `- ${item.viewport} · ${item.route} · status=${item.status} · overflow=${item.overflowPx}px · broken=${item.brokenImages.length} · pageErrors=${item.pageErrors.length}`) : ["- 없음"]),
    "",
    "## P1",
    ...(p1.length ? p1.map((item) => `- ${item.viewport} · ${item.route} · consoleErrors=${item.consoleErrors.length}`) : ["- 없음"]),
    "",
    "상세 결과는 `visual-qa-report.json`, 화면 이미지는 `screenshots/`에서 확인합니다.",
  ];
  await fs.writeFile(path.join(OUTPUT_DIR, "visual-qa-summary.md"), `${lines.join("\n")}\n`);
  return { p0: p0.length, p1: p1.length };
}

let server;
let browser;
try {
  await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

  if (SHOULD_SERVE) {
    server = startPreviewServer();
    await waitForServer(BASE_URL);
  }

  const projectPaths = await discoverProjectPaths();
  const publicPaths = [...new Set([...publicBasePaths, ...projectPaths])];
  const results = [];
  browser = await chromium.launch({ headless: true });

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      locale: "ko-KR",
      timezoneId: "Asia/Seoul",
      reducedMotion: "reduce",
      colorScheme: "light",
    });
    await installApiMocks(context);
    const page = await context.newPage();

    for (const prefix of localePrefixes) {
      for (const pathname of publicPaths) {
        await capture(page, localizedPath(prefix, pathname), viewport, "public", results);
      }
    }
    for (const key of adminKeys) {
      await capture(page, `/admin/${key}`, viewport, "admin", results);
    }
    await context.close();
  }

  const summary = await writeReport(results);
  console.log(`Visual QA complete: ${results.length} screens, P0=${summary.p0}, P1=${summary.p1}`);
  if (summary.p0 > 0 && !ALLOW_ISSUES) process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  if (server && !server.killed) server.kill("SIGTERM");
}
