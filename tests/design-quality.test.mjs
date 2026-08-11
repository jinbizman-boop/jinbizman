import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=(p)=>fs.readFileSync(p,'utf8');

test('public homepage uses editorial composition with real media and varied section rhythms',()=>{
  const home=read('src/public/pages/HomePage.tsx');
  for(const token of ['hero-home','editorial-index','matrix-section','feature-stage','portfolio-stage','domain-atlas','cybertron-blueprint']) assert.match(home,new RegExp(token));
});

test('public shell keeps accessible navigation without demo-style status copy',()=>{
  const shell=read('src/public/PublicShell.tsx');
  for(const token of ['site-frame','brand-lockup','nav-index','locale-control']) assert.match(shell,new RegExp(token));
  assert.match(shell,/aria-label="Primary navigation"/);
  assert.doesNotMatch(shell,/Independent AI & Platform Studio|SOURCE READY|Release Candidate/);
});

test('ERP shell is operationally dense and avoids theatrical release-status chrome',()=>{
  const shell=read('src/admin/AdminShell.tsx');
  for(const token of ['admin-sidebar','admin-context','admin-user-context','MANAGEMENT SYSTEM']) assert.match(shell,new RegExp(token));
  assert.doesNotMatch(shell,/SOURCE READY|CONTROL SYSTEM \/ 2026|Source \/ Release Candidate/);
});

test('dashboard prioritizes actual operational metrics and decision queues',()=>{
  const pages=read('src/admin/pages.tsx');
  for(const token of ['command-hero','command-metrics','decision-queue','operations-radar']) assert.match(pages,new RegExp(token));
});

test('design system includes restrained editorial layer, motion safety and ERP responsive rules',()=>{
  const css=read('src/styles/tokens.css')+read('src/styles/global.css')+read('src/styles/artdirection.css');
  for(const token of ['--jd-bg:#f3f1ec','--jd-accent:#2149ff','--display-1','--admin-sidebar-width','@media(max-width:760px)','@media (prefers-reduced-motion: reduce)']) assert.match(css,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
});
