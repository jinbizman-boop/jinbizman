import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const root = process.cwd();
const req = createRequire(import.meta.url);
const dist = path.join(root, 'dist');
const modules = new Map();
const moduleList = [];

function resolveFile(spec, fromFile) {
  if (spec.endsWith('.css')) return { type: 'css', file: path.resolve(path.dirname(fromFile), spec) };
  if (spec.startsWith('.') || spec.startsWith('/')) {
    const base = spec.startsWith('/') ? path.join(root, spec) : path.resolve(path.dirname(fromFile), spec);
    for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.jsx`, `${base}.json`, path.join(base,'index.ts'), path.join(base,'index.tsx'), path.join(base,'index.js')]) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return { type: path.extname(candidate).slice(1), file: candidate };
    }
    throw new Error(`Cannot resolve ${spec} from ${fromFile}`);
  }
  return { type: 'js', file: req.resolve(spec, { paths: [root] }) };
}

function transpile(file, raw) {
  if (/\.(ts|tsx)$/.test(file)) {
    return ts.transpileModule(raw, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  }
  if (file.endsWith('.json')) return `module.exports=${raw};`;
  return raw;
}

function addModule(file, type='js') {
  const key = `${type}:${file}`;
  if (modules.has(key)) return modules.get(key);
  const id = moduleList.length;
  modules.set(key, id);
  moduleList.push({ id, file, code: '' });
  if (type === 'css') { moduleList[id].code = 'module.exports={};'; return id; }
  let code = transpile(file, fs.readFileSync(file, 'utf8'));
  code = code.replace(/require\((['"])([^'"]+)\1\)/g, (_m,_q,spec) => {
    const resolved = resolveFile(spec, file);
    const dep = addModule(resolved.file, resolved.type === 'css' ? 'css' : 'js');
    return `__req(${dep})`;
  });
  moduleList[id].code = code;
  return id;
}

if (fs.existsSync(dist)) { try { fs.chmodSync(dist, 0o755); for (const item of fs.readdirSync(dist, { recursive: true })) { try { fs.chmodSync(path.join(dist, item), 0o755); } catch {} } } catch {} }
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist,'assets'), { recursive: true });
const entry = addModule(path.join(root,'src/main.tsx'));
const bundle = `(()=>{var process={env:{NODE_ENV:'production'}};const __mods={${moduleList.map(m=>`${m.id}:function(module,exports,__req){${m.code}\n}`).join(',\n')}};const __cache={};function __req(id){if(__cache[id])return __cache[id].exports;const module={exports:{}};__cache[id]=module;__mods[id](module,module.exports,__req);return module.exports;}__req(${entry});})();`;
fs.writeFileSync(path.join(dist,'assets/app.js'), bundle);
fs.writeFileSync(path.join(dist,'assets/app.css'), [
  'src/styles/tokens.css',
  'src/styles/global.css',
  'src/styles/artdirection.css',
  'src/styles/telos-master.css',
].map((file) => fs.readFileSync(path.join(root,file),'utf8')).join('\n'));

for (const source of ['public/assets','public/favicon.svg','public/robots.txt','public/sitemap.xml']) {
  const src = path.join(root, source); if (!fs.existsSync(src)) continue;
  const dest = path.join(dist, source.replace(/^public\/?/,''));
  fs.cpSync(src,dest,{recursive:true});
}
const html = fs.readFileSync(path.join(root,'index.html'),'utf8')
  .replace(/\s*<link rel="stylesheet" href="\/src\/styles\/tokens\.css" \/>/,'')
  .replace(/\s*<link rel="stylesheet" href="\/src\/styles\/global\.css" \/>/,'')
  .replace('<script type="module" src="/src/main.tsx"></script>','<link rel="stylesheet" href="/assets/app.css" /><script defer src="/assets/app.js"></script>');
fs.writeFileSync(path.join(dist,'index.html'), html);
console.log(`Fallback build complete: ${moduleList.length} bundled modules`);
