import { useEffect, useMemo, useState, type ReactNode } from "react";
import { localeLabels, SUPPORTED_LOCALES, type Locale } from "../content/locales";
import { publicCopies } from "../content/public";
import { AppLink, publicRoute, useRoute } from "../lib/router";
import { legalLabel } from "./pages/LegalPage";

const family = [
  ["Eureka World", "https://www.eurekaworld.co.kr"], ["급여납치", "https://www.salaryhijacking.com"], ["모든평가", "https://www.allreview.com"], ["New Retro Games", "https://www.retrogames.kr"],
] as const;

export function PublicShell({ children }: { children: ReactNode }) {
  const route = useRoute();
  const locale = route.locale;
  const copy = publicCopies[locale];
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setMenuOpen(false), [route.pathname]);

  const nav = useMemo(() => [
    [copy.nav.company, "/company", "01"], [copy.nav.business, "/business", "02"], [copy.nav.newsletter, "/newsletter", "03"], [copy.nav.contact, "/contact", "04"],
  ] as const, [copy]);

  function switchLocale(next: Locale) {
    const path = route.publicPath;
    window.history.pushState({}, "", publicRoute(next, path));
    window.dispatchEvent(new Event("jinbiz:navigate"));
  }

  return <div className="site-root site-frame">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className={`site-header${route.publicPath === "/" ? " is-transparent" : " is-solid"}${scrolled ? " is-scrolled" : ""}`}>
      <div className="shell header-row">
        <div className="brand-lockup">
          <AppLink href={publicRoute(locale, "/")} className="brand" ariaLabel="JINBIZ MANAGEMENT home">
            <img className="brand-logo-dark" src="/assets/images/brand/jinbiz-logo-horizontal.png" alt="JINBIZ MANAGEMENT" />
            <img className="brand-logo-light" src="/assets/images/brand/jinbiz-logo-horizontal-white.png" alt="" aria-hidden="true" />
          </AppLink>
        </div>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {nav.map(([label, path, index]) => <AppLink key={path} href={publicRoute(locale, path)} className={route.publicPath.startsWith(path) ? "is-active" : ""}><small className="nav-index" aria-hidden="true">{index}</small><span>{label}</span></AppLink>)}
        </nav>
        <div className="header-tools">
          <label className="locale-control"><span className="sr-only">Language</span><select value={locale} onChange={(e) => switchLocale(e.target.value as Locale)}>{SUPPORTED_LOCALES.map((item) => <option key={item} value={item}>{localeLabels[item]}</option>)}</select></label>
          <button type="button" className="menu-toggle" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}><span/><span/></button>
        </div>
      </div>
      <div className={`mobile-nav${menuOpen ? " is-open" : ""}`}>
        <nav aria-label="Mobile navigation">{nav.map(([label, path, index]) => <AppLink key={path} href={publicRoute(locale, path)}><small>{index}</small><span>{label}</span></AppLink>)}</nav>
      </div>
    </header>
    <main id="main-content">{children}</main>
    <footer className="site-footer">
      <div className="shell footer-lead">
        <span className="eyebrow light">JINBIZ MANAGEMENT</span>
        <h2>{copy.footer.statement}</h2>
        <AppLink href={publicRoute(locale, "/contact")} className="footer-contact-link">Start a conversation <span>↗</span></AppLink>
      </div>
      <div className="shell footer-grid">
        <div className="footer-brand"><img className="footer-brand-logo" src="/assets/images/brand/jinbiz-logo-horizontal-white.png" alt="JINBIZ MANAGEMENT" /><p>{copy.footer.statement}</p><strong>www.jinbizman.com</strong></div>
        <div><h3>Company</h3><AppLink href={publicRoute(locale, "/company")}>{copy.nav.company}</AppLink><AppLink href={publicRoute(locale, "/business")}>{copy.nav.business}</AppLink></div>
        <div><h3>Newsroom</h3><AppLink href={publicRoute(locale, "/newsletter")}>{copy.nav.newsletter}</AppLink><AppLink href={publicRoute(locale, "/contact")}>{copy.nav.contact}</AppLink></div>
        <div><h3>{copy.footer.family}</h3>{family.map(([label, href]) => <a key={href} href={href} target="_blank" rel="noreferrer">{label}</a>)}</div>
      </div>
      <div className="shell footer-meta"><div><span>대표 김진원 · 사업자등록번호 330-25-01693</span><span>전북특별자치도 덕진구 세병로 112</span><span>010-7768-8504 · jinbizman@gmail.com</span></div><div className="footer-policy-links"><AppLink href={publicRoute(locale, "/privacy")}>{legalLabel(locale, "privacy")}</AppLink><AppLink href={publicRoute(locale, "/terms")}>{legalLabel(locale, "terms")}</AppLink><AppLink href={publicRoute(locale, "/email-policy")}>{legalLabel(locale, "email-policy")}</AppLink><span>© 2026 JINBIZ MANAGEMENT</span></div></div>
    </footer>
  </div>;
}
