import { projectsByLocale, publicCopies } from "../../content/public";
import type { Locale } from "../../content/locales";
import { AppLink, publicRoute } from "../../lib/router";
import { Seo } from "../../lib/seo";
import { ResponsiveMedia } from "../components/ResponsiveMedia";
import { StatusBadge } from "../components/StatusBadge";

export function ProjectPage({ locale, slug }: { locale: Locale; slug: string }) {
  const project = projectsByLocale[locale].find((item) => item.slug === slug); const c = publicCopies[locale];
  if (!project) return <NotFoundPage locale={locale}/>;
  return <><Seo locale={locale} path={`/projects/${slug}`} title={`${project.name} | JINBIZ MANAGEMENT`} description={project.summary}/><section className="project-hero"><div className="shell project-hero-grid"><div><StatusBadge status={project.status}/><span className="eyebrow">{project.category}</span><h1>{project.name}</h1><p>{project.summary}</p><div className="hero-actions"><AppLink href={publicRoute(locale,"/contact")} className="btn btn-primary">{c.nav.contact}</AppLink><AppLink href={publicRoute(locale,"/business")} className="btn btn-secondary">Business</AppLink></div></div><ResponsiveMedia src={project.image} alt={project.name} eager/></div></section><section className="section"><div className="shell"><div className="project-capabilities">{project.points.map((point, i) => <article key={point}><span>0{i+1}</span><h2>{point}</h2><p>{slug === "eureka-world" ? "Work is structured, routed, executed and reviewed before it becomes a reusable project asset." : "This capability is developed as part of the project’s verified planning and implementation scope."}</p></article>)}</div></div></section><section className="section matrix-section"><div className="shell project-status-panel"><span>PUBLIC STATUS</span><h2>Current state: {project.status}</h2><p>JINBIZ distinguishes development, planning and validation from launched operation. Detailed internal architecture is not published on the public website.</p></div></section></>;
}

export function NotFoundPage({ locale }: { locale: Locale }) { return <section className="section"><div className="shell state-panel"><span className="eyebrow">404</span><h1>Page not found</h1><AppLink href={publicRoute(locale,"/")} className="btn btn-primary">JINBIZ Home</AppLink></div></section>; }
