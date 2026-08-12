import type { Env } from "../types";
import { getSql } from "../lib/db";
import { consumePublicRateLimit, rateLimitResponse } from "../lib/rate-limit";
import { fail, ok } from "../lib/response";
import { email, oneOf, readJson, text } from "../lib/validation";
import { getRequestId } from "../lib/request";
import { sendInquiryNotification } from "../lib/email";

export const LOCALES = ["ko", "en", "ja", "fr", "es"] as const;
const NEWS_CATEGORIES = ["press", "disclosure", "notice", "company_news", "ir", "careers", "resources"] as const;

export async function publicLocalesRoute(env: Env): Promise<Response> {
  const sql = getSql(env);
  const rows = await sql`
    SELECT locale, count(*) FILTER (WHERE status = 'published' AND published_at <= now())::int AS published_news_count
    FROM (
      SELECT 'ko'::text AS locale, status, published_at FROM news_posts
      UNION ALL
      SELECT locale::text, status, published_at FROM news_post_translations
    ) n
    GROUP BY locale
  `;
  const counts = new Map(rows.map((row) => [String(row.locale), Number(row.published_news_count || 0)]));
  return ok({
    defaultLocale: "ko",
    locales: [
      { code: "ko", label: "Korean", nativeLabel: "한국어", publishedNewsCount: counts.get("ko") || 0 },
      { code: "en", label: "English", nativeLabel: "English", publishedNewsCount: counts.get("en") || 0 },
      { code: "ja", label: "Japanese", nativeLabel: "日本語", publishedNewsCount: counts.get("ja") || 0 },
      { code: "fr", label: "French", nativeLabel: "Français", publishedNewsCount: counts.get("fr") || 0 },
      { code: "es", label: "Spanish", nativeLabel: "Español", publishedNewsCount: counts.get("es") || 0 }
    ]
  });
}

export async function publicServicesRoute(env: Env): Promise<Response> {
  const sql = getSql(env);
  const rows = await sql`
    SELECT service_code, service_name, service_type, brand_name, domain, default_locale, supported_locales,
           business_domain_code, cybertron_module_code
    FROM services
    WHERE status = 'active'
    ORDER BY service_name ASC
  `;
  return ok(rows);
}

export async function publicNewsRoute(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const locale = oneOf(url.searchParams.get("locale"), LOCALES, "ko") ?? "ko";
  const category = oneOf(url.searchParams.get("category"), NEWS_CATEGORIES);
  const requestedLimit = Number(url.searchParams.get("limit") ?? 12);
  const limit = Number.isFinite(requestedLimit) ? Math.min(30, Math.max(1, Math.trunc(requestedLimit))) : 12;
  const sql = getSql(env);
  const rows = locale === "ko"
    ? await sql`
      SELECT id, category, title, slug, summary, published_at, is_pinned
      FROM news_posts
      WHERE status = 'published' AND published_at <= now()
        AND (${category}::text IS NULL OR category = ${category})
      ORDER BY is_pinned DESC, published_at DESC
      LIMIT ${limit}
    `
    : await sql`
      SELECT p.id, p.category, t.title, t.slug, t.summary,
             COALESCE(t.published_at, p.published_at) AS published_at, p.is_pinned
      FROM news_posts p
      JOIN news_post_translations t ON t.news_post_id = p.id AND t.locale = ${locale}
      WHERE p.status = 'published' AND p.published_at <= now()
        AND t.status = 'published' AND t.published_at <= now()
        AND (${category}::text IS NULL OR p.category = ${category})
      ORDER BY p.is_pinned DESC, COALESCE(t.published_at, p.published_at) DESC
      LIMIT ${limit}
    `;
  return ok({ locale, items: rows });
}

export async function publicNewsDetailRoute(request: Request, env: Env, slug: string): Promise<Response> {
  const url = new URL(request.url);
  const locale = oneOf(url.searchParams.get("locale"), LOCALES, "ko") ?? "ko";
  const cleanSlug = text(slug, 255, true);
  if (!cleanSlug) return fail("VALIDATION_ERROR", "?щ컮瑜??댁뒪 寃쎈줈媛 ?꾩슂?⑸땲??", 422);
  const sql = getSql(env);
  const rows = locale === "ko"
    ? await sql`
      SELECT p.id, p.category, p.title, p.slug, p.summary, p.body, p.published_at, p.updated_at,
             p.is_pinned, s.service_code
      FROM news_posts p
      LEFT JOIN services s ON s.id = p.service_id
      WHERE lower(p.slug) = lower(${cleanSlug}) AND p.status = 'published' AND p.published_at <= now()
      LIMIT 1
    `
    : await sql`
      SELECT p.id, p.category, t.title, t.slug, t.summary, t.body,
             COALESCE(t.published_at, p.published_at) AS published_at, t.updated_at,
             p.is_pinned, s.service_code, t.seo_title, t.seo_description
      FROM news_posts p
      JOIN news_post_translations t ON t.news_post_id = p.id AND t.locale = ${locale}
      LEFT JOIN services s ON s.id = p.service_id
      WHERE lower(t.slug) = lower(${cleanSlug})
        AND p.status = 'published' AND p.published_at <= now()
        AND t.status = 'published' AND t.published_at <= now()
      LIMIT 1
    `;
  return rows[0] ? ok({ locale, item: rows[0] }) : fail("NOT_FOUND", "寃뚯떆臾쇱쓣 李얠쓣 ???놁뒿?덈떎.", 404);
}

export async function publicSitePageRoute(request: Request, env: Env, pageKey: string): Promise<Response> {
  const url = new URL(request.url);
  const locale = oneOf(url.searchParams.get("locale"), LOCALES, "ko") ?? "ko";
  const key = text(pageKey, 255, true);
  if (!key) return fail("VALIDATION_ERROR", "?щ컮瑜?pageKey媛 ?꾩슂?⑸땲??", 422);
  const sql = getSql(env);
  const rows = locale === "ko"
    ? await sql`
      SELECT ci.id, ct.type_code, ci.title, ci.slug, ci.payload_json, ci.published_at, ci.updated_at
      FROM service_content_items ci
      JOIN services s ON s.id = ci.service_id AND s.service_code = 'jinbiz-main' AND s.status = 'active'
      JOIN service_content_types ct ON ct.id = ci.content_type_id
      WHERE (lower(ci.slug) = lower(${key}) OR lower(ct.type_code) = lower(${key}))
        AND ci.status = 'published' AND ci.published_at <= now()
      ORDER BY ci.sort_order ASC, ci.id ASC
    `
    : await sql`
      SELECT ci.id, ct.type_code, t.title, t.slug, t.payload_json, t.seo_title, t.seo_description,
             t.published_at, t.updated_at
      FROM service_content_items ci
      JOIN services s ON s.id = ci.service_id AND s.service_code = 'jinbiz-main' AND s.status = 'active'
      JOIN service_content_types ct ON ct.id = ci.content_type_id
      JOIN service_translations t ON t.service_content_item_id = ci.id AND t.locale = ${locale}
      WHERE (lower(t.slug) = lower(${key}) OR lower(ct.type_code) = lower(${key}))
        AND ci.status = 'published' AND ci.published_at <= now()
        AND t.status = 'published' AND t.published_at <= now()
      ORDER BY ci.sort_order ASC, ci.id ASC
    `;
  return rows.length ? ok({ locale, pageKey: key, items: rows }) : fail("NOT_FOUND", "怨듦컻???섏씠吏 肄섑뀗痢좊? 李얠쓣 ???놁뒿?덈떎.", 404);
}

export async function publicInquiryRoute(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (!(await consumePublicRateLimit(request, env, "inquiry"))) return rateLimitResponse("Too many inquiry requests. Please try again later.");
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "?щ컮瑜?JSON ?붿껌???꾩슂?⑸땲??");
  const inquiryType = text(body.inquiryType, 80, true);
  const companyName = text(body.companyName, 255) ?? "";
  const name = text(body.name, 120, true);
  const emailValue = email(body.email);
  const phone = text(body.phone, 50) ?? "";
  const message = text(body.message, 5000, true);
  const locale = oneOf(body.locale, LOCALES, "ko") ?? "ko";
  if (!inquiryType || !name || !emailValue || !message || message.length < 10) {
    return fail("VALIDATION_ERROR", "?꾩닔 ?낅젰媛믪쓣 ?뺤씤?댁＜?몄슂.", 422);
  }
  const sql = getSql(env);
  const rows = await sql`
    INSERT INTO inquiries (inquiry_type, company_name, name, email, phone, message, locale, source_channel)
    VALUES (${inquiryType}, ${companyName}, ${name}, ${emailValue}, ${phone}, ${message}, ${locale}, 'website')
    RETURNING id, status, created_at
  `;
  const inquiryId = Number(rows[0].id);
  const requestId = getRequestId(request);
  ctx.waitUntil(sendInquiryNotification(env, {
    inquiryId, inquiryType, companyName, name, email: emailValue, phone, message, locale, requestId
  }));
  return ok({ inquiryId, status: rows[0].status, createdAt: rows[0].created_at, notificationScheduled: true }, { status: 201 });
}
