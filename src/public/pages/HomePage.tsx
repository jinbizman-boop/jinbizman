import { useEffect, useState } from "react";
import { publicCopies, projectsByLocale, businessDomains } from "../../content/public";
import type { Locale } from "../../content/locales";
import { apiFetch, toArray } from "../../lib/api";
import { AppLink, publicRoute } from "../../lib/router";
import { Seo } from "../../lib/seo";
import { IntelligenceFlow } from "../components/IntelligenceFlow";
import { ResponsiveMedia } from "../components/ResponsiveMedia";
import { SectionTitle } from "../components/SectionTitle";
import { StatusBadge } from "../components/StatusBadge";
import { VideoHero } from "../components/VideoHero";

interface NewsItem { id?: number; title?: string; summary?: string; category?: string; slug?: string; published_at?: string; publishedAt?: string }

export function HomePage({ locale }: { locale: Locale }) {
  const copy = publicCopies[locale];
  const projects = projectsByLocale[locale];
  const [news, setNews] = useState<NewsItem[]>([]);
  useEffect(() => { void apiFetch<unknown>(`/api/public/news?locale=${locale}`).then((data) => setNews(toArray<NewsItem>(data).slice(0, 3))).catch(() => setNews([])); }, [locale]);
  return <>
    <Seo locale={locale} path="/" title={`JINBIZ MANAGEMENT | ${copy.hero.kicker}`} description={copy.why.body} />

    <section className="hero hero-home premium-hero">
      <VideoHero poster="/assets/images/home/hero-main.webp" alt={copy.hero.kicker} />
      <div className="hero-shade"/><div className="hero-grid"/>
      <div className="shell hero-layout">
        <div className="hero-copy reveal">
          <div className="hero-meta-line"><span className="eyebrow light">{copy.hero.kicker}</span><span>SEOUL · JEONBUK · GLOBAL</span></div>
          <h1>{copy.hero.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
          <p>{copy.hero.subtitle}</p>
          <div className="hero-actions"><AppLink href={publicRoute(locale, "/business")} className="btn btn-primary">{copy.hero.primary}<span>↗</span></AppLink><AppLink href={publicRoute(locale, "/company")} className="btn btn-ghost-light">{copy.hero.secondary}</AppLink></div>
        </div>
        <aside className="hero-manifesto hero-signal" aria-label="JINBIZ operating manifesto">
          <div className="manifesto-head"><span>JINBIZ / PRINCIPLE</span><strong>01 — 03</strong></div>
          <div className="manifesto-row"><small>01</small><div><span>HUMAN</span><b>IMAGINATION</b></div></div>
          <div className="manifesto-row"><small>02</small><div><span>AI</span><b>EXECUTION</b></div></div>
          <div className="manifesto-row"><small>03</small><div><span>REAL</span><b>OUTPUT</b></div></div>
          
        </aside>
      </div>
      <div className="shell hero-editorial-rail" aria-label="JINBIZ operating signals">
        <span><b>IDEA</b><small>Human direction</small></span><i>→</i><span><b>STRUCTURE</b><small>System thinking</small></span><i>→</i><span><b>EXECUTION</b><small>AI + operations</small></span><i>→</i><span><b>RESULT</b><small>Real output</small></span>
      </div>
    </section>

    <section className="proof-strip"><div className="shell proof-grid">{copy.proof.map((item, index) => <div key={item.label}><small>{String(index + 1).padStart(2,"0")}</small><strong>{item.value}</strong><span>{item.label}</span></div>)}</div></section>

    <section className="section editorial-index">
      <div className="shell editorial-index-grid">
        <div className="editorial-index-label"><span>01</span><small>WHY JINBIZ</small></div>
        <div className="editorial-index-copy"><SectionTitle eyebrow={copy.why.eyebrow} title={copy.why.title} body={copy.why.body}/><div className="barrier-list"><article><b>01</b><h3>Capital</h3><p>Start small, validate early, scale only what works.</p></article><article><b>02</b><h3>People</h3><p>Use AI and operating standards to fill execution gaps.</p></article><article><b>03</b><h3>Technology</h3><p>Connect planning, software and operations into one understandable flow.</p></article></div></div>
        <figure className="editorial-index-media"><ResponsiveMedia src="/assets/images/home/why-jinbiz.webp" alt="JINBIZ connected execution"/><figcaption>Strategy, technology and operations in one execution system</figcaption></figure>
      </div>
    </section>

    <section className="section section-soft flow-stage"><div className="shell"><div className="section-number">02</div><SectionTitle eyebrow={copy.execution.eyebrow} title={copy.execution.title} body={copy.execution.body}/><IntelligenceFlow steps={copy.execution.steps}/></div></section>

    <section className="section matrix-section"><div className="shell"><div className="matrix-heading"><div className="section-number on-dark">03</div><SectionTitle eyebrow={copy.matrix.eyebrow} title={copy.matrix.title} body={copy.matrix.body} dark/></div><div className="execution-matrix">{copy.matrix.tracks.map((track) => <AppLink key={track.id} href={publicRoute(locale, "/business")} className="matrix-row"><span>{track.id}</span><div><h3>{track.title}</h3><p>{track.summary}</p></div><div className="tag-cluster">{track.tags.map((tag) => <b key={tag}>{tag}</b>)}</div><em>↗</em></AppLink>)}</div></div></section>

    <section className="section feature-stage"><div className="shell feature-story"><div className="feature-media"><ResponsiveMedia src="/assets/images/source/eureka-workspace.webp" alt="Eureka World AI workspace"/><div className="feature-media-label"><span>FLAGSHIP / 01</span><b>WORK-ORIENTED AI</b></div></div><div className="feature-copy"><span className="eyebrow">{copy.eureka.eyebrow}</span><h2>{copy.eureka.title}</h2><p>{copy.eureka.body}</p><ul>{copy.eureka.points.map((point) => <li key={point}>{point}</li>)}</ul><AppLink href={publicRoute(locale, "/projects/eureka-world")} className="btn btn-primary">{copy.eureka.cta}<span>↗</span></AppLink></div></div></section>

    <section className="section section-soft portfolio-stage"><div className="shell"><div className="portfolio-heading"><div><span className="section-number">04</span><SectionTitle eyebrow="PROJECT PORTFOLIO" title={copy.projectsTitle}/></div><p>Current projects are shown with their real operating status. Development, planning and validation remain explicitly distinct.</p></div><div className="project-grid premium-project-grid">{projects.map((project, index) => <AppLink href={publicRoute(locale, `/projects/${project.slug}`)} className={`project-card project-card-${index + 1}`} key={project.slug}><div className="project-image"><ResponsiveMedia src={project.image} alt={project.name}/><StatusBadge status={project.status}/><span className="project-index">0{index + 1}</span></div><div className="project-card-copy"><span>{project.category}</span><h3>{project.name}</h3><p>{project.summary}</p><em>View project ↗</em></div></AppLink>)}</div></div></section>

    <section className="section domains-section domain-atlas"><div className="shell"><div className="domain-atlas-head"><span className="section-number">05</span><SectionTitle eyebrow="FUTURE BUSINESS DOMAINS" title={copy.domainsTitle} body={locale === "ko" ? "현재 실행 사업과 구분된 중장기 확장 포트폴리오입니다." : "A long-term portfolio clearly separated from current operating businesses."}/></div><div className="domain-list">{businessDomains.map((domain, index) => <article className="domain-row" key={domain.code}><span>{String(index + 1).padStart(2, "0")}</span><div><small>{domain.code} · CYBERTRON {domain.role.toUpperCase()}</small><h3>{domain.title}</h3><p>{domain.body}</p></div><ResponsiveMedia src={domain.image} alt={domain.title}/></article>)}</div></div></section>

    <section className="section cybertron-section cybertron-blueprint"><div className="shell cybertron-layout"><div><div className="section-number on-dark">06</div><SectionTitle eyebrow={copy.cybertron.eyebrow} title={copy.cybertron.title} body={copy.cybertron.body} dark/><AppLink href={publicRoute(locale, "/business#cybertron")} className="btn btn-ghost-light">Explore business vision <span>↗</span></AppLink></div><div className="cybertron-orbit" aria-label="Cybertron business domain map"><div className="blueprint-crosshair"/><div className="cybertron-core">CYBERTRON<small>FUTURE SYSTEM</small></div>{businessDomains.map((d, index) => <span key={d.code} style={{ "--orbit-index": index } as React.CSSProperties}><b>{String(index + 1).padStart(2,"0")}</b>{d.code}</span>)}</div></div></section>

    <section className="section newsroom-stage"><div className="shell"><div className="newsroom-heading"><span className="section-number">07</span><SectionTitle eyebrow={copy.activity.eyebrow} title={copy.activity.title} body={copy.activity.body}/></div>{news.length ? <div className="news-grid">{news.map((item, index) => <AppLink key={item.id ?? index} href={publicRoute(locale, `/newsletter/${item.category || "notice"}/${item.slug || item.id || index}`)} className="news-card"><span>{item.category || "UPDATE"}</span><h3>{item.title || "JINBIZ Update"}</h3><p>{item.summary || "Official JINBIZ project and company update."}</p><time>{item.published_at || item.publishedAt || "2026"}</time></AppLink>)}</div> : <div className="activity-fallback"><article><span>PROJECT</span><h3>Eureka World</h3><p>AI workspace development continues with document, design, content and project workflows.</p></article><article><span>ERP</span><h3>Integrated operations</h3><p>Service, project, WBS, approvals and evidence-based evaluation are connected in one operating system.</p></article><article><span>GLOBAL</span><h3>Five-language publishing</h3><p>KO / EN / JA / FR / ES content can be published and managed independently.</p></article></div>}</div></section>

    <section className="section section-soft trust-stage"><div className="shell trust-panel"><div><span className="eyebrow">{copy.trust.eyebrow}</span><h2>{copy.trust.title}</h2><p>{copy.trust.body}</p></div><div className="trust-facts"><div><span>Official domain</span><strong>www.jinbizman.com</strong></div><div><span>Public record</span><strong>2020 →</strong></div><div><span>Operating model</span><strong>Website + ERP</strong></div></div></div></section>
    <section className="section final-cta"><div className="shell"><span className="eyebrow">NEXT EXECUTION</span><h2>{copy.cta.title}</h2><p>{copy.cta.body}</p><AppLink href={publicRoute(locale, "/contact")} className="btn btn-primary">{copy.cta.button}<span>↗</span></AppLink></div></section>
  </>;
}
