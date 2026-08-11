import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=(p)=>fs.readFileSync(p,'utf8');

test('production build never silently falls back from Vite',()=>{
  const pkg=JSON.parse(read('package.json'));
  assert.equal(pkg.scripts.build,'vite build');
  assert.equal(pkg.scripts['build:sandbox'],'node scripts/build-fallback.mjs');
});

test('direct dependency versions are exact for reproducible installs',()=>{
  const pkg=JSON.parse(read('package.json'));
  for(const group of ['dependencies','devDependencies']) for(const [name,version] of Object.entries(pkg[group]||{})) {
    assert.match(version,/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/,`${name} must be exact, got ${version}`);
  }
});

test('cookie-authenticated admin writes fail closed without a trusted Origin',()=>{
  const src=read('worker/lib/request.ts');
  assert.match(src,/if \(!origin\) return false;/);
});

test('public newsroom exposes only the three approved public categories',()=>{
  const src=read('src/public/pages/NewsletterPage.tsx');
  assert.match(src,/\["press", "disclosure", "notice"\]/);
  assert.doesNotMatch(src,/"project"/);
  assert.match(src,/\/newsletter\/\$\{item\.category/);
});

test('sitemap contains only current React public route families',()=>{
  const map=read('public/sitemap.xml');
  for(const obsolete of ['/404','/search','/policy','/newsletter/detail']) assert.doesNotMatch(map,new RegExp(obsolete.replace('/','\\/')));
  for(const current of ['/privacy','/terms','/email-policy']) assert.match(map,new RegExp(current.replace('/','\\/')));
});

test('release check exists and is wired into package scripts',()=>{
  const pkg=JSON.parse(read('package.json'));
  assert.equal(pkg.scripts['release:check'],'node scripts/release-check.mjs');
  assert.ok(fs.existsSync('scripts/release-check.mjs'));
});

test('App delegates SEO to page components instead of mounting a competing generic Seo',()=>{
  const src=read('src/App.tsx');
  assert.doesNotMatch(src,/const seoTitle/);
  assert.doesNotMatch(src,/<Seo locale=\{locale\} path=\{seoPath\}/);
});

test('inquiry response reports background scheduling accurately instead of claiming a queue',()=>{
  const src=read('worker/routes/public.ts');
  assert.match(src,/notificationScheduled: true/);
  assert.doesNotMatch(src,/notificationQueued: true/);
});
