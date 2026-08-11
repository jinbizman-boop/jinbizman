import { useState, type FormEvent } from "react";
import type { Locale } from "../../content/locales";
import { publicCopies } from "../../content/public";
import { apiFetch } from "../../lib/api";
import { Seo } from "../../lib/seo";

export function ContactPage({ locale }: { locale: Locale }) {
  const c = publicCopies[locale].contact; const [status, setStatus] = useState<"idle"|"sending"|"success"|"error">("idle");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus("sending"); const fd = new FormData(event.currentTarget);
    const payload = { inquiryType: String(fd.get("inquiryType") || "general"), companyName: String(fd.get("companyName") || ""), name: String(fd.get("name") || ""), email: String(fd.get("email") || ""), phone: String(fd.get("phone") || ""), message: String(fd.get("message") || ""), locale };
    if (!payload.name || !payload.email.includes("@") || payload.message.length < 10) { setStatus("error"); return; }
    try { await apiFetch("/api/public/inquiries", { method: "POST", body: JSON.stringify(payload) }); setStatus("success"); event.currentTarget.reset(); } catch { setStatus("error"); }
  }
  return <><Seo locale={locale} path="/contact" title={`${c.kicker} | JINBIZ MANAGEMENT`} description={c.body}/><section className="page-heading"><div className="shell"><span className="eyebrow">{c.kicker}</span><h1>{c.title}</h1><p>{c.body}</p></div></section><section className="section"><div className="shell contact-layout"><div className="contact-info"><h2>JINBIZ MANAGEMENT</h2><p>jinbizman@gmail.com</p><p>010-7768-8504</p><p>전북특별자치도 덕진구 세병로 112</p><div className="contact-principle"><strong>Inquiry → Lead → Opportunity → Project</strong><span>문의는 ERP에 저장되고 이후 사업기회와 프로젝트로 전환 가능한 흐름을 가집니다.</span></div></div><form className="contact-form" onSubmit={submit}><label>{c.type}<select name="inquiryType"><option value="general">General</option><option value="business">Business</option><option value="partnership">Partnership</option><option value="media">Media / News</option></select></label><div className="form-grid"><label>{c.name}<input name="name" required /></label><label>{c.company}<input name="companyName" /></label><label>{c.email}<input name="email" type="email" required /></label><label>{c.phone}<input name="phone" /></label></div><label>{c.message}<textarea name="message" rows={8} minLength={10} required /></label><button className="btn btn-primary" disabled={status === "sending"}>{status === "sending" ? "Sending…" : c.submit}</button>{status === "success" ? <p className="form-success">{c.success}</p> : null}{status === "error" ? <p className="form-error">{c.error}</p> : null}</form></div></section></>;
}
