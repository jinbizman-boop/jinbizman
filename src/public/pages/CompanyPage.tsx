import { publicCopies, companyFacts, historyItems } from "../../content/public";
import type { Locale } from "../../content/locales";
import { Seo } from "../../lib/seo";
import { ResponsiveMedia } from "../components/ResponsiveMedia";
import { SectionTitle } from "../components/SectionTitle";

export function CompanyPage({ locale }: { locale: Locale }) {
  const c = publicCopies[locale].company;
  return <>
    <Seo locale={locale} path="/company" title={`${c.kicker} | JINBIZ MANAGEMENT`} description={c.intro}/>
    <section className="page-hero"><ResponsiveMedia src="/assets/images/source/company-network.webp" alt={c.title} eager/><div className="hero-shade"/><div className="shell page-hero-copy"><span className="eyebrow light">{c.kicker}</span><h1>{c.title}</h1></div></section>
    <section className="section"><div className="shell"><SectionTitle eyebrow="COMPANY INTRODUCTION" title={c.introTitle} body={c.intro}/><div className="barrier-list"><article><b>01</b><h3>CAPITAL</h3><p>초기 검증 비용과 시간을 작은 실행 단위로 줄입니다.</p></article><article><b>02</b><h3>PEOPLE</h3><p>AI와 표준화된 실행 체계로 전문 인력의 공백을 보완합니다.</p></article><article><b>03</b><h3>TECHNOLOGY</h3><p>기획·AI·플랫폼·운영을 이해 가능한 하나의 흐름으로 연결합니다.</p></article></div></div></section>
    <section className="section section-soft"><div className="shell mission-grid"><article><span>MISSION</span><h2>{c.mission}</h2></article><article><span>VISION</span><h2>{c.vision}</h2></article></div></section>
    <section className="section"><div className="shell"><SectionTitle eyebrow="CORE VALUES" title={c.valuesTitle}/><div className="value-grid">{c.values.map((value, i) => <article key={value.title}><span>0{i + 1}</span><h3>{value.title}</h3><p>{value.body}</p></article>)}</div></div></section>
    <section className="section section-soft"><div className="shell"><SectionTitle eyebrow="COMPANY FACTS" title={c.factsTitle}/><div className="facts-grid">{companyFacts.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></div></section>
    <section className="section"><div className="shell company-story-grid"><div><SectionTitle eyebrow="HISTORY & PUBLIC INFORMATION" title={c.historyTitle}/><div className="timeline">{historyItems.map(([year, title, body]) => <article key={year}><time>{year}</time><div><h3>{title}</h3><p>{body}</p></div></article>)}</div></div><aside className="public-policy"><span>PUBLIC INFORMATION POLICY</span><h2>{c.policyTitle}</h2><p>{c.policy}</p><ul><li>State labels: development / planning / validation</li><li>Verified facts first</li><li>Official updates through jinbizman.com</li></ul></aside></div></section>
    <section className="section location-section"><div className="shell split-story"><div><SectionTitle eyebrow="LOCATION" title="JINBIZ MANAGEMENT" body="전북특별자치도 덕진구 세병로 112"/><p>방문 전 미팅 일정을 확정해 주세요.</p><a className="btn btn-primary" href="https://map.naver.com" target="_blank" rel="noreferrer">Map ↗</a></div><ResponsiveMedia src="/assets/images/source/company-team.webp" alt="JINBIZ location and team" className="story-media"/></div></section>
  </>;
}
