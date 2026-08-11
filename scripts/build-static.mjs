import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const entries = [
  "index.html", "favicon.svg", "robots.txt", "sitemap.xml", "portal.html", "all-screens-preview.html",
  "QA_REPORT.md", "VERIFICATION_LOG.txt", "assets", "pages", "admin", "components", "en", "ja", "fr", "es"
];
for (const entry of entries) {
  const source = resolve(root, entry);
  if (!existsSync(source)) continue;
  await cp(source, resolve(dist, entry), { recursive: true });
}
console.log(`Built static assets into ${dist}`);
