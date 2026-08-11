import { useEffect, useState } from "react";
import { publicCopies } from "../../content/public";
import type { Locale } from "../../content/locales";
import { apiFetch, toArray } from "../../lib/api";
import { AppLink, publicRoute } from "../../lib/router";
import { Seo } from "../../lib/seo";
import { SectionTitle } from "../components/SectionTitle";

interface NewsItem { id?: number; title?: string; summary?: string; body?: string; category?: string; slug?: string; status?: string; published_at?: string; publishedAt?: string }
const categories = ["press", "disclosure", "notice"] as const;
const categoryLabels: Record<Locale, Record<(typeof categories)[number], string>> = {
  ko: { press: "보도자료", disclosure: "공시정보", notice: "공지사항" },
  en: { press: "Press", disclosure: "Disclosures", notice: "Notices" },
  ja: { press: "プレスリリース", disclosure: "公開情報", notice: "お知らせ" },
  fr: { press: "Presse", disclosure: "Informations publiques", notice: "Avis" },
  es: { press: "Prensa", disclosure: "Información pública", notice: "Avisos" },
};

export function NewsletterPage({ locale }: { locale: Locale }) {
  const c = publicCopies[locale].newsletter;
  const [items, setItems] = useState<NewsItem[]>([]); const [loading, setLoading] = useState(true); const [category, setCategory] = useState<(typeof categories)[number]>("press");
  useEffect(() => { setLoading(true); void apiFetch<unknown>(`/api/public/news?locale=${locale}&category=${category}`).then((d) => setItems(toArray<NewsItem>(d))).catch(() => setItems([])).finally(() => setLoading(false)); }, [locale, category]);
  return <>
    <Seo locale={locale} path="/newsletter" title={`${c.kicker} | JINBIZ MANAGEMENT`} description={c.body}/>
    <section className="page-heading"><div className="shell"><span className="eyebrow">{c.kicker}</span><h1>{c.title}</h1><p>{c.body}</p></div></section>
    <section className="section"><div className="shell"><div className="filter-tabs" role="tablist">{categories.map((tab) => <button key={tab} type="button" role="tab" aria-selected={category === tab} className={category === tab ? "is-active" : ""} onClick={() => setCategory(tab)}>{categoryLabels[locale][tab]}</button>)}</div>{loading ? <div className="state-panel">Loading official updates…</div> : items.length ? <div className="editorial-news-list">{items.map((item, index) => <AppLink key={item.id ?? index} href={publicRoute(locale, `/newsletter/${item.category || category}/${item.slug || item.id || index}`)} className="editorial-news-row"><span>{item.category || "UPDATE"}</span><div><h2>{item.title || "JINBIZ Update"}</h2><p>{item.summary || "Official company and project update."}</p></div><time>{item.published_at || item.publishedAt || "2026"}</time><em>↗</em></AppLink>)}</div> : <div className="state-panel"><strong>{c.empty}</strong><p>JINBIZ does not fabricate news to fill an empty state.</p></div>}</div></section>
  </>;
}

export function NewsDetailPage({ locale, slug }: { locale: Locale; slug: string }) {
  const [item, setItem] = useState<NewsItem | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(true); void apiFetch<unknown>(`/api/public/news/${encodeURIComponent(slug)}?locale=${locale}`).then((d) => setItem(d as NewsItem)).catch(() => setItem(null)).finally(() => setLoading(false)); }, [locale, slug]);
  if (loading) return <section className="section"><div className="shell state-panel">Loading…</div></section>;
  if (!item) return <section className="section"><div className="shell state-panel"><h1>Not found</h1><AppLink href={publicRoute(locale,"/newsletter")} className="btn btn-primary">Back to newsroom</AppLink></div></section>;
  return <><Seo locale={locale} path={`/newsletter/${item.category || "notice"}/${slug}`} title={`${item.title || "JINBIZ Update"} | JINBIZ MANAGEMENT`} description={item.summary || "JINBIZ official update"} type="article"/><article className="section article-page"><div className="shell article-shell"><span className="eyebrow">{item.category || "NEWS"}</span><h1>{item.title}</h1><p className="article-summary">{item.summary}</p><time>{item.published_at || item.publishedAt}</time><div className="article-body">{String(item.body || "").split(/\n{2,}/).map((p) => <p key={p}>{p}</p>)}</div></div></article></>;
}
