import type { Locale } from "../../content/locales";
import { Seo } from "../../lib/seo";

const copy: Record<Locale, { privacy: string; terms: string; email: string; intro: string }> = {
  ko: { privacy: "개인정보처리방침", terms: "이용조건", email: "이메일 무단수집 거부", intro: "JINBIZ MANAGEMENT의 공개 서비스 운영 정책입니다." },
  en: { privacy: "Privacy Policy", terms: "Terms of Use", email: "Email Collection Policy", intro: "Public service operating policies for JINBIZ MANAGEMENT." },
  ja: { privacy: "プライバシーポリシー", terms: "利用条件", email: "メール収集ポリシー", intro: "JINBIZ MANAGEMENTの公開サービス運営方針です。" },
  fr: { privacy: "Politique de confidentialité", terms: "Conditions d’utilisation", email: "Politique de collecte des e-mails", intro: "Politiques d’exploitation du service public de JINBIZ MANAGEMENT." },
  es: { privacy: "Política de privacidad", terms: "Condiciones de uso", email: "Política de recopilación de correo", intro: "Políticas operativas del servicio público de JINBIZ MANAGEMENT." },
};

export type LegalKind = "privacy" | "terms" | "email-policy";

export function legalLabel(locale: Locale, kind: LegalKind) {
  const item = copy[locale];
  return kind === "privacy" ? item.privacy : kind === "terms" ? item.terms : item.email;
}

export function LegalPage({ locale, kind }: { locale: Locale; kind: LegalKind }) {
  const item = copy[locale];
  const title = legalLabel(locale, kind);
  return <>
    <Seo locale={locale} path={`/${kind}`} title={`${title} | JINBIZ MANAGEMENT`} description={item.intro}/>
    <section className="page-hero compact"><div className="shell"><span className="eyebrow">PUBLIC POLICY</span><h1>{title}</h1><p>{item.intro}</p></div></section>
    <section className="section"><div className="shell legal-document">
      {kind === "privacy" ? <>
        <h2>Privacy & data handling</h2>
        <p>JINBIZ MANAGEMENT는 문의 접수와 서비스 운영에 필요한 최소한의 개인정보만 수집하며, 수집 목적이 달성되거나 법적 보관 의무가 종료되면 안전하게 파기하는 것을 원칙으로 합니다.</p>
        <h3>수집 항목</h3><p>이름, 회사 또는 소속, 이메일, 연락처, 문의 유형, 문의 내용과 서비스 이용 과정에서 필요한 최소 운영 기록.</p>
        <h3>이용 목적</h3><p>문의 처리, 담당자 배정, 서비스 운영, 보안·감사 기록, 법적 의무 이행.</p>
        <h3>문의</h3><p>개인정보 관련 문의는 jinbizman@gmail.com 으로 접수할 수 있습니다.</p>
      </> : kind === "terms" ? <>
        <h2>Terms for public website use</h2>
        <p>본 웹사이트의 콘텐츠는 JINBIZ MANAGEMENT의 공식 회사·사업·서비스 정보를 제공하기 위한 것입니다. 공개 정보는 사전 고지 없이 개선될 수 있으며, 별도 계약이나 제안의 효력은 서면 합의가 있는 경우에만 발생합니다.</p>
        <h3>지식재산권</h3><p>별도 표시가 없는 JINBIZ 브랜드, 문구, 디자인, 소프트웨어 및 편집 콘텐츠의 권리는 JINBIZ MANAGEMENT 또는 정당한 권리자에게 있습니다.</p>
        <h3>외부 링크</h3><p>Family Site 및 외부 사이트의 운영·개인정보처리는 각 사이트 정책을 따릅니다.</p>
      </> : <>
        <h2>Unauthorized email collection</h2>
        <p>본 사이트에 게시된 이메일 주소를 전자우편 수집 프로그램이나 기타 기술적 장치를 이용하여 무단으로 수집하는 행위를 금지합니다.</p>
        <p>서비스 또는 사업 관련 연락은 공식 문의 페이지 또는 공개된 대표 이메일을 사용해 주세요.</p>
      </>}
      <p className="legal-updated">Updated: 2026-08-10 · Canonical domain: www.jinbizman.com</p>
    </div></section>
  </>;
}
