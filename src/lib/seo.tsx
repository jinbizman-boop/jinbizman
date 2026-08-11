import { useEffect } from "react";
import { SUPPORTED_LOCALES, localizedPath, type Locale } from "../content/locales";

const BASE = "https://www.jinbizman.com";

function ensureMeta(selector: string, attrs: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
}

export function Seo({ locale, path, title, description, image = "/assets/images/og/homepage-og.png", type = "website" }: { locale: Locale; path: string; title: string; description: string; image?: string; type?: string }) {
  useEffect(() => {
    const canonical = `${BASE}${localizedPath(locale, path)}`;
    document.documentElement.lang = locale;
    document.title = title;
    ensureMeta('meta[name="description"]', { name: "description", content: description });
    ensureMeta('meta[property="og:title"]', { property: "og:title", content: title });
    ensureMeta('meta[property="og:description"]', { property: "og:description", content: description });
    ensureMeta('meta[property="og:type"]', { property: "og:type", content: type });
    ensureMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    ensureMeta('meta[property="og:image"]', { property: "og:image", content: `${BASE}${image}` });

    document.querySelectorAll('link[data-jinbiz-seo]').forEach((el) => el.remove());
    const canonicalLink = document.createElement("link");
    canonicalLink.rel = "canonical";
    canonicalLink.href = canonical;
    canonicalLink.dataset.jinbizSeo = "true";
    document.head.appendChild(canonicalLink);
    for (const alt of SUPPORTED_LOCALES) {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = alt;
      link.href = `${BASE}${localizedPath(alt, path)}`;
      link.dataset.jinbizSeo = "true";
      document.head.appendChild(link);
    }
    let json = document.getElementById("jinbiz-organization-jsonld");
    if (!json) {
      json = document.createElement("script");
      json.id = "jinbiz-organization-jsonld";
      json.setAttribute("type", "application/ld+json");
      document.head.appendChild(json);
    }
    json.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: "JINBIZ MANAGEMENT", url: BASE, logo: `${BASE}/assets/images/brand/jinbiz-logo-horizontal.png` });
  }, [description, image, locale, path, title, type]);
  return null;
}
