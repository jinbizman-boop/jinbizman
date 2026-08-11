import { businessDomains, publicCopies, projectsByLocale } from "../../content/public";
import type { Locale } from "../../content/locales";
import { AppLink, publicRoute } from "../../lib/router";
import { Seo } from "../../lib/seo";
import { ResponsiveMedia } from "../components/ResponsiveMedia";
import { SectionTitle } from "../components/SectionTitle";

export function BusinessPage({ locale }: { locale: Locale }) {
  const c = publicCopies[locale]; const b = c.business;
  return <>
    <Seo locale={locale} path="/business" title={`${b.kicker} | JINBIZ MANAGEMENT`} description={b.intro}/>
    <section className="page-hero business-hero premium-page-hero"><ResponsiveMedia src="/assets/images/source/connected-industry.webp" alt={b.title} eager/><div className="hero-shade"/><div className="shell page-hero-copy"><span className="eyebrow light">{b.kicker}</span><h1>{b.title}</h1><p>{b.intro}</p><div className="page-hero-index"><span>BUSINESS SYSTEM</span><strong>03 / 05 / 01</strong></div></div></section>

    <section className="section business-editorial"><div className="shell"><div className="portfolio-heading"><div><span className="section-number">01</span><SectionTitle eyebrow="CURRENT EXECUTION" title={b.tracksTitle}/></div><p>Three execution tracks define how JINBIZ works today. They are separated from the long-term industrial portfolio below.</p></div><div className="business-track-grid premium-track-grid">{c.matrix.tracks.map((track, idx) => <article key={track.id}><div className="track-media"><ResponsiveMedia src={["/assets/images/home/business-ai-service.webp","/assets/images/home/business-life-service.webp","/assets/images/home/business-consult-service.webp"][idx]} alt={track.title}/><span className="track-index">0{idx+1}</span></div><div className="track-copy"><span>{track.id}</span><h2>{track.title}</h2><p>{track.summary}</p><div className="tag-cluster">{track.tags.map((tag) => <b key={tag}>{tag}</b>)}</div></div></article>)}</div></div></section>

    <section className="section matrix-section"><div className="shell"><div className="matrix-heading"><span className="section-number on-dark">02</span><SectionTitle eyebrow="SERVICE PORTFOLIO" title={c.projectsTitle} body={c.matrix.body} dark/></div><div className="execution-matrix">{projectsByLocale[locale].map((project, index) => <AppLink key={project.slug} href={publicRoute(locale, `/projects/${project.slug}`)} className="matrix-row"><span>{String(index + 1).padStart(2,"0")}</span><div><h3>{project.name}</h3><p>{project.summary}</p></div><div className="tag-cluster">{project.points.map((p) => <b key={p}>{p}</b>)}</div><em>↗</em></AppLink>)}</div></div></section>

    <section className="section domain-atlas" id="future-domains"><div className="shell"><div className="domain-atlas-head"><span className="section-number">03</span><SectionTitle eyebrow="FUTURE PORTFOLIO" title={b.domainsTitle} body={c.cybertron.body}/></div><div className="domain-gallery premium-domain-gallery">{businessDomains.map((d,index) => <article key={d.code}><div className="domain-visual"><ResponsiveMedia src={d.image} alt={d.title}/><span>{String(index+1).padStart(2,"0")}</span></div><small>{d.code} / CYBERTRON {d.role.toUpperCase()}</small><h3>{d.title}</h3><p>{d.body}</p></article>)}</div></div></section>

    <section className="section cybertron-section cybertron-blueprint" id="cybertron"><div className="shell cybertron-layout"><div><span className="section-number on-dark">04</span><SectionTitle eyebrow="CYBERTRON PROJECT" title={b.cybertronTitle} body={b.cybertronBody} dark/><p className="on-dark-copy">AI = Brain · Materials = Frame · Energy = Heart · Defense = Shield · Welfare = Senses</p></div><div className="cybertron-stack blueprint-stack">{businessDomains.map((d, i) => <div key={d.code}><span>0{i+1}</span><b>{d.code}</b><small>{d.role}</small></div>)}</div></div></section>

    <section className="section process-stage"><div className="shell"><div className="portfolio-heading"><div><span className="section-number">05</span><SectionTitle eyebrow="HOW WE WORK" title={b.howTitle}/></div><p>Every stage maps to an operational object in the ERP: inquiry, service, project, WBS, approval, output and evidence.</p></div><div className="process-rail">{b.how.map((step, index) => <article key={step}><b>{String(index+1).padStart(2,"0")}</b><h3>{step}</h3><span>Execution stage</span></article>)}</div></div></section>
    <section className="section final-cta"><div className="shell"><span className="eyebrow">BUSINESS CONTACT</span><h2>{c.cta.title}</h2><p>{c.cta.body}</p><AppLink href={publicRoute(locale, "/contact")} className="btn btn-primary">{c.cta.button}<span>↗</span></AppLink></div></section>
  </>;
}
