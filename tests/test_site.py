import json, re, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'src'

def read(rel): return (ROOT/rel).read_text(encoding='utf-8')
class ReactSiteTests(unittest.TestCase):
    def test_react_vite_runtime_files_exist(self):
        for p in ['index.html','vite.config.ts','src/main.tsx','src/App.tsx','src/styles/tokens.css','src/styles/global.css','worker/index.ts','wrangler.jsonc']:
            self.assertTrue((ROOT/p).is_file(),p)
    def test_legacy_mpa_is_reference_only(self):
        self.assertTrue((ROOT/'legacy-reference/index.html').is_file())
        self.assertFalse((ROOT/'pages').exists())
        self.assertFalse((ROOT/'admin').exists())
        self.assertFalse((ROOT/'assets').exists())
    def test_five_official_locales_are_centralized(self):
        text=read('src/content/locales.ts')
        for locale in ['ko','en','ja','fr','es']: self.assertIn(f'"{locale}"',text)
    def test_public_route_tree_covers_core_pages_and_news_project_detail(self):
        text=read('src/App.tsx')
        for route in ['/company','/business','/newsletter','/contact','/projects/','/privacy','/terms','/email-policy']: self.assertIn(route,text)
        for component in ['HomePage','CompanyPage','BusinessPage','NewsletterPage','NewsDetailPage','ContactPage','ProjectPage']: self.assertIn(component,text)
    def test_business_structure_preserved(self):
        text=read('src/content/public.ts')
        for token in ['AI Service','Platform Business','Planning Foundation','materials','energy','defense','welfare','Cybertron']:
            self.assertRegex(text,re.escape(token),token)
    def test_four_named_projects_preserved(self):
        text=read('src/content/public.ts')
        for token in ['Eureka World','Salary Hijacking','All Review','New Retro Games']: self.assertIn(token,text)
    def test_company_public_facts_are_explicit_and_no_unverified_big_company_claims(self):
        text=read('src/content/public.ts')
        for token in ['330-25-01693','김진원','www.jinbizman.com','2020년부터 확인 가능']: self.assertIn(token,text)
        for forbidden in ['임직원 100명','자본금 24억원','매출 100억']: self.assertNotIn(forbidden,text)
    def test_contact_and_news_use_worker_api(self):
        c=read('src/public/pages/ContactPage.tsx'); n=read('src/public/pages/NewsletterPage.tsx')
        self.assertIn('/api/public/inquiries',c); self.assertIn('/api/public/news',n)
        self.assertNotIn('localStorage',c+n)
    def test_seo_is_runtime_managed_for_canonical_hreflang_and_jsonld(self):
        text=read('src/lib/seo.tsx')
        for token in ['canonical','hreflang','Organization','www.jinbizman.com','SUPPORTED_LOCALES']: self.assertIn(token,text)
    def test_accessibility_contract(self):
        shell=read('src/public/PublicShell.tsx'); css=read('src/styles/global.css')
        self.assertIn('skip-link',shell); self.assertIn('aria-label',shell); self.assertIn('prefers-reduced-motion',css)
        contact=read('src/public/pages/ContactPage.tsx'); self.assertGreaterEqual(contact.count('<label'),5)
    def test_jinbiz_signature_and_editorial_patterns_exist(self):
        home=read('src/public/pages/HomePage.tsx'); css=read('src/styles/global.css')
        for token in ['hero-signal','proof-strip','IntelligenceFlow','execution-matrix','cybertron-orbit']: self.assertIn(token,home+css)
    def test_admin_modules_cover_integrated_operating_os(self):
        text=read('src/content/admin.ts')
        keys=['services','site-content','news','inquiries','leads','opportunities','projects','daily-work','todos','approvals','attendance','leave','timesheets','budgets','expenses','goals','evaluations','knowledge','media','audit-logs','settings']
        for key in keys: self.assertIn(f'key: "{key}"',text)
    def test_core_erp_write_flows_are_real_api_calls(self):
        text=read('src/admin/pages.tsx')
        endpoints=['/api/erp/projects','/api/erp/wbs','/api/erp/daily-reports','/api/erp/daily-logs','/api/erp/approvals','/api/erp/evaluations/scores','/api/admin/media']
        for endpoint in endpoints: self.assertIn(endpoint,text)
    def test_worker_spa_admin_auth_gate(self):
        text=read('worker/index.ts'); self.assertIn('url.pathname !== "/admin/login"',text); self.assertIn('new URL("/admin/login"',text); self.assertNotIn('/admin/login.html',text)
    def test_db_has_fourteen_ordered_migrations(self):
        files=sorted((ROOT/'db/migrations').glob('*.sql')); self.assertEqual(len(files),14); self.assertEqual(files[0].name[:3],'001'); self.assertEqual(files[-1].name[:3],'014')
    def test_media_budget_and_local_only_font_policy(self):
        images=[p for p in (ROOT/'public/assets/images').rglob('*') if p.suffix.lower() in {'.webp','.avif','.jpg','.jpeg','.png'}]
        total=sum(p.stat().st_size for p in images); largest=max(p.stat().st_size for p in images)
        self.assertLess(total,12*1024*1024); self.assertLess(largest,int(1.2*1024*1024))
        self.assertNotRegex(read('src/styles/global.css'),r'@import\s+url')
    def test_no_obvious_hardcoded_live_secrets(self):
        patterns=[r'sk-proj-[A-Za-z0-9_-]{20,}',r'npg_[A-Za-z0-9]{20,}',r'-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----']
        files=list(SRC.rglob('*.ts'))+list(SRC.rglob('*.tsx'))+list((ROOT/'worker').rglob('*.ts'))
        blob='\n'.join(p.read_text(encoding='utf-8',errors='ignore') for p in files)
        for pattern in patterns: self.assertIsNone(re.search(pattern,blob),pattern)
    def test_fallback_production_dist_is_complete_spa(self):
        for p in ['dist/index.html','dist/assets/app.js','dist/assets/app.css','dist/favicon.svg']:
            self.assertTrue((ROOT/p).is_file(),p)
        html=read('dist/index.html'); self.assertIn('/assets/app.js',html); self.assertIn('/assets/app.css',html)
    def test_source_package_excludes_node_modules_contract(self):
        self.assertIn('node_modules',read('.gitignore'))
    def test_latest_telos_quality_patterns_are_reinterpreted_for_jinbiz(self):
        shell=read('src/admin/AdminShell.tsx'); table=read('src/admin/components/DataTable.tsx'); pages=read('src/admin/pages.tsx')
        for token in ['admin-skip-link','focusFirstNav']: self.assertIn(token,shell)
        for token in ['<caption','scope="col"']: self.assertIn(token,table)
        for token in ['WorkflowPanel','RevisionDiff']: self.assertIn(token,pages)
    def test_playwright_device_matrix_contract_exists(self):
        cfg=read('playwright.config.ts')
        for token in ['chromium-1440','firefox-1440','webkit-1440','mobile-chromium-390','mobile-webkit-390','tablet-768','desktop-1920']: self.assertIn(token,cfg)
        self.assertIn('Production E2E is blocked',cfg)
    def test_qa_results_when_present_are_clean(self):
        p=ROOT/'qa-results.json'
        if p.is_file():
            data=json.loads(p.read_text(encoding='utf-8'))
            self.assertEqual(data.get('errors',[]),[])
if __name__=='__main__': unittest.main()
