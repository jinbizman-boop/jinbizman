import type { AuthUser, Env } from "../types";
import { getAuthUser, hasPermission } from "../lib/auth";
import { writeAuditLog } from "../lib/audit";
import { getSql } from "../lib/db";
import { fail, ok } from "../lib/response";
import { oneOf, readJson, text } from "../lib/validation";
import { LOCALES } from "./public";

const SERVICE_STATUSES = ["draft", "active", "maintenance", "retired"] as const;
const ENV_TYPES = ["local", "staging", "production"] as const;
const CONTENT_STATUSES = ["draft", "review", "published", "archived"] as const;
const TRANSLATION_STATUSES = ["draft", "in_translation", "review", "published", "hidden"] as const;
const NEWS_CATEGORIES = ["press", "disclosure", "notice", "company_news", "ir", "careers", "resources"] as const;
const BUSINESS_DOMAINS = ["ai", "materials", "energy", "defense", "welfare"] as const;
const CYBERTRON_MODULES = ["brain", "frame", "heart", "shield", "senses"] as const;

async function requirePermission(request: Request, env: Env, permission: string): Promise<AuthUser | Response> {
  const user = await getAuthUser(request, env);
  if (!user) return fail("UNAUTHORIZED", "로그인이 필요합니다.", 401);
  if (!hasPermission(user, permission)) return fail("FORBIDDEN", "이 작업을 수행할 권한이 없습니다.", 403);
  return user;
}

function positiveInteger(value: unknown): number | null {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function optionalPositiveInteger(value: unknown): number | null {
  return value === null || value === undefined || value === "" ? null : positiveInteger(value);
}

function localeArray(value: unknown, defaultLocale: string): string[] | null {
  if (!Array.isArray(value)) return [defaultLocale];
  const locales = [...new Set(value.map(String).filter((item) => (LOCALES as readonly string[]).includes(item)))];
  if (!locales.includes(defaultLocale)) locales.unshift(defaultLocale);
  return locales.length ? locales : null;
}

export async function adminServiceCreateRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "service.create");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const serviceCode = text(body.serviceCode, 120, true);
  const serviceName = text(body.serviceName, 255, true);
  const serviceType = text(body.serviceType, 80, true);
  const brandName = text(body.brandName, 255) ?? "";
  const domain = text(body.domain, 255, true);
  const status = oneOf(body.status, SERVICE_STATUSES, "draft") ?? "draft";
  const envType = oneOf(body.envType, ENV_TYPES, "production") ?? "production";
  const defaultLocale = oneOf(body.defaultLocale, LOCALES, "ko") ?? "ko";
  const supportedLocales = localeArray(body.supportedLocales, defaultLocale);
  const permissionTemplateCode = text(body.permissionTemplateCode, 120) ?? "";
  const contentModelCode = text(body.contentModelCode, 120) ?? "";
  const businessDomainCode = oneOf(body.businessDomainCode, BUSINESS_DOMAINS);
  const cybertronModuleCode = oneOf(body.cybertronModuleCode, CYBERTRON_MODULES);
  if (!serviceCode || !serviceName || !serviceType || !domain || !supportedLocales) {
    return fail("VALIDATION_ERROR", "서비스 코드, 이름, 유형, 도메인을 확인해주세요.", 422);
  }
  const sql = getSql(env);
  const csv = supportedLocales.join(",");
  try {
    const rows = await sql`
      WITH inserted AS (
        INSERT INTO services (
          service_code, service_name, service_type, brand_name, status, domain, env_type,
          default_locale, supported_locales, i18n_enabled, permission_template_code, content_model_code,
          business_domain_code, cybertron_module_code, operator_user_id
        ) VALUES (
          ${serviceCode}, ${serviceName}, ${serviceType}, ${brandName}, ${status}, ${domain}, ${envType},
          ${defaultLocale}, string_to_array(${csv}, ',')::varchar(10)[], ${supportedLocales.length > 1},
          ${permissionTemplateCode}, ${contentModelCode}, ${businessDomainCode}, ${cybertronModuleCode}, ${auth.id}
        )
        RETURNING *
      ), domain_row AS (
        INSERT INTO service_domains (service_id, domain, locale, is_canonical)
        SELECT id, ${domain}, ${defaultLocale}, TRUE FROM inserted
        ON CONFLICT (service_id, locale) DO NOTHING
      )
      SELECT * FROM inserted
    `;
    const created = rows[0];
    const createdServiceId = Number(created.id);
    const isCorporate = /corporate|corp_site/i.test(contentModelCode) || /website|official/i.test(serviceType);
    const defaultTypes = isCorporate
      ? [
          ["hero_section", "메인 히어로", "page", 10],
          ["company_overview", "회사 소개", "page", 20],
          ["business_items", "사업 소개", "page", 30],
          ["newsletter_landing", "뉴스/공지 랜딩", "page", 40],
          ["contact_landing", "문의 랜딩", "page", 50],
          ["footer_legal_block", "푸터 법적 정보", "config", 60],
        ]
      : [
          ["hero_section", "서비스 히어로", "page", 10],
          ["feature_cards", "핵심 기능 카드", "page", 20],
          ["service_announcements", "서비스 공지", "collection", 30],
        ];
    for (const [typeCode, name, category, sortOrder] of defaultTypes) {
      await sql`
        INSERT INTO service_content_types (service_id, type_code, name, category, sort_order, schema_json, is_active)
        VALUES (${createdServiceId}, ${typeCode}, ${name}, ${category}, ${sortOrder}, '{}'::jsonb, TRUE)
        ON CONFLICT (service_id, type_code) DO NOTHING
      `;
    }
    for (const locale of supportedLocales) {
      await sql`
        INSERT INTO service_domains (service_id, domain, locale, is_canonical)
        VALUES (${createdServiceId}, ${domain}, ${locale}, ${locale === defaultLocale})
        ON CONFLICT (service_id, locale) DO NOTHING
      `;
    }
    await writeAuditLog(request, env, auth, {
      actionType: "service.create", targetType: "service", targetId: Number(created.id), serviceId: Number(created.id), after: created, statusCode: 201
    });
    return ok(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "서비스를 생성할 수 없습니다.";
    if (/unique|duplicate/i.test(message)) return fail("CONFLICT", "이미 사용 중인 서비스 코드 또는 도메인입니다.", 409);
    throw error;
  }
}

export async function adminServiceUpdateRoute(request: Request, env: Env, serviceId: number): Promise<Response> {
  const auth = await requirePermission(request, env, "service.update");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const sql = getSql(env);
  const beforeRows = await sql`SELECT * FROM services WHERE id = ${serviceId} LIMIT 1`;
  if (!beforeRows[0]) return fail("NOT_FOUND", "서비스를 찾을 수 없습니다.", 404);
  const serviceName = body.serviceName === undefined ? null : text(body.serviceName, 255, true);
  const status = body.status === undefined ? null : oneOf(body.status, SERVICE_STATUSES);
  const domain = body.domain === undefined ? null : text(body.domain, 255, true);
  const envType = body.envType === undefined ? null : oneOf(body.envType, ENV_TYPES);
  const businessDomainCode = body.businessDomainCode === undefined ? null : oneOf(body.businessDomainCode, BUSINESS_DOMAINS);
  const cybertronModuleCode = body.cybertronModuleCode === undefined ? null : oneOf(body.cybertronModuleCode, CYBERTRON_MODULES);
  const rows = await sql`
    UPDATE services SET
      service_name = COALESCE(${serviceName}, service_name),
      status = COALESCE(${status}, status),
      domain = COALESCE(${domain}, domain),
      env_type = COALESCE(${envType}, env_type),
      business_domain_code = CASE WHEN ${body.businessDomainCode === undefined} THEN business_domain_code ELSE ${businessDomainCode} END,
      cybertron_module_code = CASE WHEN ${body.cybertronModuleCode === undefined} THEN cybertron_module_code ELSE ${cybertronModuleCode} END,
      updated_at = now()
    WHERE id = ${serviceId}
    RETURNING *
  `;
  if (domain) {
    await sql`UPDATE service_domains SET domain = ${domain}, updated_at = now() WHERE service_id = ${serviceId} AND is_canonical = TRUE`;
  }
  await writeAuditLog(request, env, auth, {
    actionType: "service.update", targetType: "service", targetId: serviceId, serviceId,
    before: beforeRows[0], after: rows[0]
  });
  return ok(rows[0]);
}

export async function adminContentCreateRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "content.create");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const serviceId = positiveInteger(body.serviceId);
  const contentTypeId = positiveInteger(body.contentTypeId);
  const title = text(body.title, 255, true);
  const slug = text(body.slug, 255, true);
  const status = oneOf(body.status, CONTENT_STATUSES, "draft") ?? "draft";
  const payloadJson = typeof body.payload === "object" && body.payload !== null ? JSON.stringify(body.payload) : "{}";
  if (!serviceId || !contentTypeId || !title || !slug) return fail("VALIDATION_ERROR", "서비스, 콘텐츠 유형, 제목, slug가 필요합니다.", 422);
  const sql = getSql(env);
  const rows = await sql`
    INSERT INTO service_content_items (service_id, content_type_id, title, slug, status, payload_json, published_at, created_by, updated_by)
    VALUES (${serviceId}, ${contentTypeId}, ${title}, ${slug}, ${status}, ${payloadJson}::jsonb,
            CASE WHEN ${status} = 'published' THEN now() ELSE NULL END, ${auth.id}, ${auth.id})
    RETURNING *
  `;
  await writeAuditLog(request, env, auth, { actionType: "content.create", targetType: "service_content_item", targetId: Number(rows[0].id), serviceId, after: rows[0], statusCode: 201 });
  return ok(rows[0], { status: 201 });
}

export async function adminTranslationUpsertRoute(request: Request, env: Env, contentId: number, locale: string): Promise<Response> {
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const permission = text(body.status, 40) === "published" ? "translation.publish" : "translation.update";
  const auth = await requirePermission(request, env, permission);
  if (auth instanceof Response) return auth;
  const normalizedLocale = oneOf(locale, LOCALES);
  const title = text(body.title, 255, true);
  const slug = text(body.slug, 255, true);
  const seoTitle = text(body.seoTitle, 255) ?? "";
  const seoDescription = text(body.seoDescription, 1000) ?? "";
  const status = oneOf(body.status, TRANSLATION_STATUSES, "draft") ?? "draft";
  const payloadJson = typeof body.payload === "object" && body.payload !== null ? JSON.stringify(body.payload) : "{}";
  if (!normalizedLocale || normalizedLocale === "ko" || !title || !slug) return fail("VALIDATION_ERROR", "보조 언어, 제목, slug를 확인해주세요.", 422);
  const sql = getSql(env);
  const parentRows = await sql`SELECT service_id FROM service_content_items WHERE id = ${contentId} LIMIT 1`;
  if (!parentRows[0]) return fail("NOT_FOUND", "콘텐츠를 찾을 수 없습니다.", 404);
  const rows = await sql`
    INSERT INTO service_translations (service_content_item_id, locale, title, slug, seo_title, seo_description, payload_json, status, published_at)
    VALUES (${contentId}, ${normalizedLocale}, ${title}, ${slug}, ${seoTitle}, ${seoDescription}, ${payloadJson}::jsonb, ${status},
            CASE WHEN ${status} = 'published' THEN now() ELSE NULL END)
    ON CONFLICT (service_content_item_id, locale) DO UPDATE SET
      title = EXCLUDED.title, slug = EXCLUDED.slug, seo_title = EXCLUDED.seo_title,
      seo_description = EXCLUDED.seo_description, payload_json = EXCLUDED.payload_json,
      status = EXCLUDED.status,
      published_at = CASE WHEN EXCLUDED.status = 'published' THEN COALESCE(service_translations.published_at, now()) ELSE NULL END,
      updated_at = now()
    RETURNING *
  `;
  const serviceId = Number(parentRows[0].service_id);
  await writeAuditLog(request, env, auth, { actionType: status === "published" ? "translation.publish" : "translation.update", targetType: "service_translation", targetId: Number(rows[0].id), serviceId, after: rows[0] });
  return ok(rows[0]);
}

export async function adminNewsCreateRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "news.create");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const category = oneOf(body.category, NEWS_CATEGORIES, "notice") ?? "notice";
  const title = text(body.title, 255, true);
  const slug = text(body.slug, 255, true);
  const summary = text(body.summary, 2000) ?? "";
  const articleBody = text(body.body, 50000) ?? "";
  const status = oneOf(body.status, CONTENT_STATUSES, "draft") ?? "draft";
  const serviceId = optionalPositiveInteger(body.serviceId);
  if (!title || !slug) return fail("VALIDATION_ERROR", "제목과 slug가 필요합니다.", 422);
  const sql = getSql(env);
  const rows = await sql`
    INSERT INTO news_posts (category, service_id, title, slug, summary, body, status, published_at, author_user_id, created_by, updated_by)
    VALUES (${category}, ${serviceId}, ${title}, ${slug}, ${summary}, ${articleBody}, ${status},
            CASE WHEN ${status} = 'published' THEN now() ELSE NULL END, ${auth.id}, ${auth.id}, ${auth.id})
    RETURNING *
  `;
  await writeAuditLog(request, env, auth, { actionType: "news.create", targetType: "news_post", targetId: Number(rows[0].id), serviceId, after: rows[0], statusCode: 201 });
  return ok(rows[0], { status: 201 });
}

export async function adminInquiryConvertRoute(request: Request, env: Env, inquiryId: number): Promise<Response> {
  const auth = await requirePermission(request, env, "lead.create");
  if (auth instanceof Response) return auth;
  const body = await readJson(request) ?? {};
  const serviceId = optionalPositiveInteger(body.serviceId);
  const sql = getSql(env);
  const sourceRows = await sql`SELECT * FROM inquiries WHERE id = ${inquiryId} LIMIT 1`;
  const source = sourceRows[0];
  if (!source) return fail("NOT_FOUND", "문의를 찾을 수 없습니다.", 404);
  const rows = await sql`
    WITH created AS (
      INSERT INTO leads (inquiry_id, service_id, owner_user_id, company_name, contact_name, email, phone, source_channel, lead_type, status, notes)
      SELECT ${inquiryId}, ${serviceId}, ${auth.id}, company_name, name, email, phone, source_channel, inquiry_type, 'new', internal_note
      FROM inquiries
      WHERE id = ${inquiryId} AND NOT EXISTS (SELECT 1 FROM leads WHERE inquiry_id = ${inquiryId})
      RETURNING id
    ), updated AS (
      UPDATE inquiries SET status = 'converted', lead_status = 'new', converted_at = COALESCE(converted_at, now()), updated_at = now()
      WHERE id = ${inquiryId}
    )
    SELECT id FROM created
    UNION ALL
    SELECT id FROM leads WHERE inquiry_id = ${inquiryId}
    LIMIT 1
  `;
  const leadId = Number(rows[0]?.id || 0);
  await writeAuditLog(request, env, auth, { actionType: "inquiry.convert", targetType: "inquiry", targetId: inquiryId, serviceId, before: source, after: { leadId, status: "converted" } });
  return ok({ inquiryId, leadId, status: "converted" });
}

export async function adminContentUpdateRoute(request: Request, env: Env, contentId: number): Promise<Response> {
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const requestedStatus = body.status === undefined ? undefined : oneOf(body.status, CONTENT_STATUSES);
  if (body.status !== undefined && !requestedStatus) return fail("VALIDATION_ERROR", "콘텐츠 상태를 확인해주세요.", 422);
  const permission = requestedStatus === "published" ? "content.publish" : "content.update";
  const auth = await requirePermission(request, env, permission);
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const before = (await sql`SELECT * FROM service_content_items WHERE id = ${contentId} LIMIT 1`)[0];
  if (!before) return fail("NOT_FOUND", "콘텐츠를 찾을 수 없습니다.", 404);
  const titleValue = body.title === undefined ? null : text(body.title, 255, true);
  const slug = body.slug === undefined ? null : text(body.slug, 255, true);
  const payloadJson = body.payload === undefined ? null : (typeof body.payload === "object" && body.payload !== null ? JSON.stringify(body.payload) : null);
  if ((body.title !== undefined && !titleValue) || (body.slug !== undefined && !slug) || (body.payload !== undefined && payloadJson === null)) {
    return fail("VALIDATION_ERROR", "콘텐츠 제목, slug 또는 payload를 확인해주세요.", 422);
  }
  const rows = await sql`
    UPDATE service_content_items SET
      title = COALESCE(${titleValue}, title),
      slug = COALESCE(${slug}, slug),
      status = COALESCE(${requestedStatus ?? null}, status),
      payload_json = CASE WHEN ${payloadJson}::text IS NULL THEN payload_json ELSE ${payloadJson}::jsonb END,
      published_at = CASE
        WHEN ${requestedStatus ?? null} = 'published' THEN COALESCE(published_at, now())
        WHEN ${requestedStatus ?? null}::text IS NOT NULL AND ${requestedStatus ?? null} <> 'published' THEN NULL
        ELSE published_at
      END,
      updated_by = ${auth.id}, updated_at = now()
    WHERE id = ${contentId}
    RETURNING *
  `;
  await writeAuditLog(request, env, auth, { actionType: requestedStatus === "published" ? "content.publish" : "content.update", targetType: "service_content_item", targetId: contentId, serviceId: Number(before.service_id), before, after: rows[0] });
  return ok(rows[0]);
}

export async function adminNewsUpdateRoute(request: Request, env: Env, newsId: number): Promise<Response> {
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const requestedStatus = body.status === undefined ? undefined : oneOf(body.status, CONTENT_STATUSES);
  if (body.status !== undefined && !requestedStatus) return fail("VALIDATION_ERROR", "뉴스 상태를 확인해주세요.", 422);
  const permission = requestedStatus === "published" ? "news.publish" : "news.update";
  const auth = await requirePermission(request, env, permission);
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const before = (await sql`SELECT * FROM news_posts WHERE id = ${newsId} LIMIT 1`)[0];
  if (!before) return fail("NOT_FOUND", "뉴스/공지 글을 찾을 수 없습니다.", 404);
  const category = body.category === undefined ? null : oneOf(body.category, NEWS_CATEGORIES);
  const titleValue = body.title === undefined ? null : text(body.title, 255, true);
  const slug = body.slug === undefined ? null : text(body.slug, 255, true);
  const summary = body.summary === undefined ? null : text(body.summary, 2000);
  const articleBody = body.body === undefined ? null : text(body.body, 50000);
  if ((body.category !== undefined && !category) || (body.title !== undefined && !titleValue) || (body.slug !== undefined && !slug) || summary === null || articleBody === null) {
    return fail("VALIDATION_ERROR", "뉴스/공지 입력값을 확인해주세요.", 422);
  }
  const rows = await sql`
    UPDATE news_posts SET
      category = COALESCE(${category}, category),
      title = COALESCE(${titleValue}, title),
      slug = COALESCE(${slug}, slug),
      summary = COALESCE(${summary}, summary),
      body = COALESCE(${articleBody}, body),
      status = COALESCE(${requestedStatus ?? null}, status),
      is_pinned = CASE WHEN ${body.isPinned === undefined} THEN is_pinned ELSE ${Boolean(body.isPinned)} END,
      published_at = CASE
        WHEN ${requestedStatus ?? null} = 'published' THEN COALESCE(published_at, now())
        WHEN ${requestedStatus ?? null}::text IS NOT NULL AND ${requestedStatus ?? null} <> 'published' THEN NULL
        ELSE published_at
      END,
      updated_by = ${auth.id}, updated_at = now()
    WHERE id = ${newsId}
    RETURNING *
  `;
  await writeAuditLog(request, env, auth, { actionType: requestedStatus === "published" ? "news.publish" : "news.update", targetType: "news_post", targetId: newsId, serviceId: before.service_id ? Number(before.service_id) : null, before, after: rows[0] });
  return ok(rows[0]);
}

export async function adminNewsTranslationUpsertRoute(request: Request, env: Env, newsId: number, locale: string): Promise<Response> {
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const normalizedLocale = oneOf(locale, LOCALES);
  const status = oneOf(body.status, TRANSLATION_STATUSES, "draft") ?? "draft";
  const permission = status === "published" ? "news.publish" : "news.update";
  const auth = await requirePermission(request, env, permission);
  if (auth instanceof Response) return auth;
  const titleValue = text(body.title, 255, true);
  const slug = text(body.slug, 255, true);
  const summary = text(body.summary, 2000) ?? "";
  const articleBody = text(body.body, 50000) ?? "";
  const seoTitle = text(body.seoTitle, 255) ?? "";
  const seoDescription = text(body.seoDescription, 1000) ?? "";
  if (!normalizedLocale || normalizedLocale === "ko" || !titleValue || !slug) return fail("VALIDATION_ERROR", "보조 언어, 제목, slug를 확인해주세요.", 422);
  const sql = getSql(env);
  const parent = (await sql`SELECT id, service_id FROM news_posts WHERE id = ${newsId} LIMIT 1`)[0];
  if (!parent) return fail("NOT_FOUND", "뉴스/공지 글을 찾을 수 없습니다.", 404);
  try {
    const rows = await sql`
      INSERT INTO news_post_translations (news_post_id, locale, title, summary, body, slug, seo_title, seo_description, status, published_at)
      VALUES (${newsId}, ${normalizedLocale}, ${titleValue}, ${summary}, ${articleBody}, ${slug}, ${seoTitle}, ${seoDescription}, ${status},
              CASE WHEN ${status} = 'published' THEN now() ELSE NULL END)
      ON CONFLICT (news_post_id, locale) DO UPDATE SET
        title = EXCLUDED.title, summary = EXCLUDED.summary, body = EXCLUDED.body, slug = EXCLUDED.slug,
        seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description, status = EXCLUDED.status,
        published_at = CASE WHEN EXCLUDED.status = 'published' THEN COALESCE(news_post_translations.published_at, now()) ELSE NULL END,
        updated_at = now()
      RETURNING *
    `;
    await writeAuditLog(request, env, auth, { actionType: status === "published" ? "news.translation.publish" : "news.translation.update", targetType: "news_post_translation", targetId: Number(rows[0].id), serviceId: parent.service_id ? Number(parent.service_id) : null, after: rows[0] });
    return ok(rows[0]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/default locale must be published/i.test(message)) return fail("PRECONDITION_FAILED", "한국어 원문이 먼저 발행되어야 보조 언어를 발행할 수 있습니다.", 412);
    throw error;
  }
}
