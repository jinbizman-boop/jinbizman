import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { API_CONTRACTS, EXPECTED_API_SUMMARY, contractKey, parseWorkerIndexContracts } from '../tests/fixtures/api-contracts.mjs';
const root=process.cwd(); const errors=[]; const warnings=[];
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
for(const group of ['dependencies','devDependencies']) for(const [name,version] of Object.entries(pkg[group]||{})) if(!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) errors.push(`${group}.${name} is not exact: ${version}`);
for(const required of ['src/main.tsx','worker/index.ts','wrangler.jsonc','public/robots.txt','public/sitemap.xml','db/migrations/013_remaining_admin_operations.sql','db/migrations/014_mobile_auth_sessions.sql']) if(!fs.existsSync(required)) errors.push(`missing ${required}`);
for(const required of [
  'BASELINE.md',
  'DB_INVENTORY.md',
  'API_INVENTORY.md',
  'SCREEN_INVENTORY.md',
  'RTM.md',
  'BACKLOG.md',
  'AUTHORIZATION_MATRIX.md',
  'API_VERSIONING.md',
  'AUTH_CONTRACT.md',
  'API_SECURITY_POLICY.md',
  'AUDIT_MATRIX.md',
  'AUDIT_POLICY.md',
  'API_TEST_STRATEGY.md'
]) if(!fs.existsSync(required)) errors.push(`missing ${required}`);
const migrations=fs.readdirSync('db/migrations').filter(x=>/^\d{3}_.*\.sql$/.test(x)).sort();
for(let i=0;i<migrations.length;i++){const want=String(i+1).padStart(3,'0'); if(!migrations[i].startsWith(want+'_')) errors.push(`migration sequence gap near ${migrations[i]}`)}
const sourceContracts = await parseWorkerIndexContracts();
const sourceKeys = new Set(sourceContracts.map(contractKey));
const registryKeys = new Set(API_CONTRACTS.map(contractKey));
const sourceOnly = [...sourceKeys].filter(key=>!registryKeys.has(key)).sort();
const registryOnly = [...registryKeys].filter(key=>!sourceKeys.has(key)).sort();
if(sourceOnly.length) errors.push(`source-only API contracts: ${sourceOnly.join(', ')}`);
if(registryOnly.length) errors.push(`registry-only API contracts: ${registryOnly.join(', ')}`);
if(API_CONTRACTS.length !== EXPECTED_API_SUMMARY.phaseOneCurrentContracts) errors.push(`API contract count drift: ${API_CONTRACTS.length}`);
if(new Set(API_CONTRACTS.map(contract=>contractKey(contract))).size !== API_CONTRACTS.length) errors.push('duplicate API method+path contract in registry');
const runtimeRoots=['src','worker','public'];
const toolingRoots=['scripts'];
const pathPatterns=[/[A-Za-z]:\\/g,/(^|[^A-Za-z0-9_-])\/(?:Users|home|mnt\/data)\//g,/file:\/\//g];
const runtimeOnlyPatterns=[/localhost/g,/127\.0\.0\.1/g];
function walkWithPatterns(d,patterns){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name); if(e.isDirectory()) walkWithPatterns(p,patterns); else if(path.basename(p)==='release-check.mjs') continue; else if(/\.(?:ts|tsx|js|mjs|json|html|css|xml|txt)$/.test(e.name)){const t=fs.readFileSync(p,'utf8'); for(const re of patterns) if(re.test(t)) errors.push(`local or non-production URL/path in ${p}`);}}}
for(const d of runtimeRoots) if(fs.existsSync(d)) walkWithPatterns(d,[...pathPatterns,...runtimeOnlyPatterns]);
for(const d of toolingRoots) if(fs.existsSync(d)) walkWithPatterns(d,pathPatterns);
const sitemap=fs.readFileSync('public/sitemap.xml','utf8'); for(const bad of ['/404','/search','/policy','/newsletter/detail']) if(sitemap.includes(bad)) errors.push(`obsolete sitemap route ${bad}`);
if(!fs.existsSync('package-lock.json')) warnings.push('package-lock.json is not present; run npm install once in a normal npm registry environment and commit the generated lockfile before production deployment. Direct dependencies are exact-pinned.');
if(fs.existsSync('dist/assets/app.js')) warnings.push('dist/assets/app.js is the sandbox fallback bundle. npm run deploy always runs native Vite first, so this file is not accepted as a production-build proof.');
if(fs.existsSync('dist/index.html')) { const c=spawnSync(process.execPath,['--check','dist/assets/app.js'],{stdio:'ignore'}); if(fs.existsSync('dist/assets/app.js') && c.status!==0) errors.push('sandbox bundle syntax invalid'); }
console.log(JSON.stringify({ok:errors.length===0,errors,warnings,migrations:migrations.length},null,2));
process.exit(errors.length?1:0);
