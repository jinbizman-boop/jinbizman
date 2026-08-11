import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(); const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')); const exists=p=>fs.existsSync(path.join(root,p));
test('React/Vite single-app runtime contract is declared',()=>{assert.equal(pkg.dependencies.react,'19.2.8');assert.equal(pkg.dependencies['react-dom'],'19.2.8');assert.ok(pkg.devDependencies.vite);assert.ok(pkg.devDependencies['@vitejs/plugin-react']);assert.equal(pkg.scripts.build,'vite build');assert.equal(pkg.scripts['dev:worker'],'wrangler dev --local');});
test('React entry points and legacy visual reference are separated',()=>{for(const f of ['vite.config.ts','src/main.tsx','src/App.tsx','src/styles/tokens.css','src/styles/global.css','legacy-reference/index.html'])assert.ok(exists(f),`${f} missing`);assert.ok(!exists('pages'),'legacy pages must not remain runtime root');assert.ok(!exists('admin'),'legacy admin must not remain runtime root');});
test('wrangler uses SPA fallback',()=>{const w=fs.readFileSync(path.join(root,'wrangler.jsonc'),'utf8');assert.match(w,/single-page-application/);});
test('worker protects React admin routes and exempts only /admin/login',()=>{const w=fs.readFileSync(path.join(root,'worker/index.ts'),'utf8');assert.match(w,/url\.pathname !== "\/admin\/login"/);assert.match(w,/new URL\("\/admin\/login"/);assert.doesNotMatch(w,/login\.html/);});

test('legacy assets are reference-only',()=>{assert.equal(fs.existsSync('assets'),false);assert.equal(fs.existsSync('legacy-reference/assets'),true);});
