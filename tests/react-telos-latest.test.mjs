import test from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs';
const read=(p)=>fs.readFileSync(p,'utf8');
test('latest TELOS-derived admin quality patterns are implemented as JINBIZ-native components',()=>{
  const shell=read('src/admin/AdminShell.tsx'), table=read('src/admin/components/DataTable.tsx'), pages=read('src/admin/pages.tsx');
  assert.match(shell,/admin-skip-link/); assert.match(shell,/focusFirstNav/); assert.match(table,/<caption/); assert.match(table,/scope="col"/);
  assert.match(pages,/WorkflowPanel/); assert.match(pages,/RevisionDiff/); assert.match(pages,/\/api\/admin\/contents\/\$\{selectedId\}/);
});
test('legal policy routes are first-class React routes',()=>{const app=read('src/App.tsx'), shell=read('src/public/PublicShell.tsx'); for(const route of ['/privacy','/terms','/email-policy']){assert.match(app,new RegExp(route.replace('/','\\/'))); assert.match(shell,new RegExp(route.replace('/','\\/')));}});
test('browser QA matrix covers desktop mobile tablet and cross-browser contracts',()=>{const cfg=read('playwright.config.ts'); for(const token of ['chromium-1440','firefox-1440','webkit-1440','mobile-chromium-390','mobile-webkit-390','tablet-768','desktop-1920']) assert.match(cfg,new RegExp(token)); assert.match(cfg,/Production E2E is blocked/);});
