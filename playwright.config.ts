import { defineConfig, devices } from "@playwright/test";
const environment = process.env.JINBIZ_ENV ?? "local";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4173";
if (environment === "production" && process.env.JINBIZ_ALLOW_PRODUCTION_E2E !== "1") {
  throw new Error("Production E2E is blocked unless JINBIZ_ALLOW_PRODUCTION_E2E=1 is explicitly approved.");
}
export default defineConfig({
  testDir: "./tests/e2e", fullyParallel: true, forbidOnly: Boolean(process.env.CI), retries: process.env.CI ? 2 : 0, timeout: 45_000,
  expect: { timeout: 10_000, toHaveScreenshot: { animations: "disabled", maxDiffPixelRatio: 0.01 } },
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure", video: "retain-on-failure", locale: "ko-KR", timezoneId: "Asia/Seoul", reducedMotion: "reduce", serviceWorkers: "block" },
  projects: [
    { name: "chromium-1440", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "firefox-1440", use: { ...devices["Desktop Firefox"], viewport: { width: 1440, height: 900 } } },
    { name: "webkit-1440", use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile-chromium-390", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
    { name: "mobile-webkit-390", use: { ...devices["iPhone 14"], viewport: { width: 390, height: 844 } } },
    { name: "tablet-768", use: { ...devices["iPad (gen 7)"], viewport: { width: 768, height: 1024 } } },
    { name: "desktop-1920", use: { ...devices["Desktop Chrome"], viewport: { width: 1920, height: 1080 } } },
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER === "1" ? undefined : { command: "npm run build && python serve.py --directory dist --port 4173", url: baseURL, reuseExistingServer: !process.env.CI, timeout: 120_000 },
});
