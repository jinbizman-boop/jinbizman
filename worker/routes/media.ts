import type { Env } from "../types";
import { getAuthUser, hasPermission } from "../lib/auth";
import { getSql } from "../lib/db";
import { fail, ok } from "../lib/response";

const MAX_MEDIA_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml", "application/pdf"]);

function safeFileName(value: string): string {
  return value.normalize("NFKC").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120) || "file";
}

export async function adminMediaUploadRoute(request: Request, env: Env): Promise<Response> {
  const user = await getAuthUser(request, env);
  if (!user) return fail("UNAUTHORIZED", "로그인이 필요합니다.", 401);
  if (!hasPermission(user, "content.update")) return fail("FORBIDDEN", "미디어를 업로드할 권한이 없습니다.", 403);
  if (!env.MEDIA_BUCKET) return fail("MEDIA_STORAGE_NOT_CONFIGURED", "Cloudflare R2 MEDIA_BUCKET 바인딩이 필요합니다.", 503);

  const form = await request.formData();
  const serviceId = Number(form.get("serviceId"));
  const file = form.get("file");
  if (!Number.isInteger(serviceId) || serviceId <= 0 || !(file instanceof File)) {
    return fail("VALIDATION_ERROR", "서비스와 업로드 파일이 필요합니다.", 422);
  }
  if (file.size <= 0 || file.size > MAX_MEDIA_BYTES) return fail("FILE_SIZE_INVALID", "파일은 10MB 이하만 업로드할 수 있습니다.", 422);
  if (!ALLOWED_TYPES.has(file.type)) return fail("FILE_TYPE_INVALID", "PNG/JPEG/WebP/SVG/PDF 파일만 업로드할 수 있습니다.", 422);

  const sql = getSql(env);
  const serviceRows = await sql`SELECT id, service_code FROM services WHERE id = ${serviceId} LIMIT 1`;
  if (!serviceRows[0]) return fail("NOT_FOUND", "서비스를 찾을 수 없습니다.", 404);

  const key = `site-media/${String(serviceRows[0].service_code)}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  await env.MEDIA_BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { originalName: file.name, uploadedBy: String(user.id), serviceId: String(serviceId) },
  });

  try {
    const metadata = JSON.stringify({ r2Key: key, originalName: file.name });
    const rows = await sql`
      INSERT INTO attachments(target_type,target_id,service_id,uploaded_by,file_name,file_url,mime_type,file_size_bytes,metadata_json)
      VALUES('site_media',${serviceId},${serviceId},${user.id},${file.name},'',${file.type},${file.size},${metadata}::jsonb)
      RETURNING id,file_name,mime_type,file_size_bytes,created_at
    `;
    const id = Number(rows[0].id);
    const fileUrl = `/api/public/media/${id}`;
    await sql`UPDATE attachments SET file_url=${fileUrl} WHERE id=${id}`;
    return ok({ ...rows[0], file_url: fileUrl }, { status: 201 });
  } catch (error) {
    await env.MEDIA_BUCKET.delete(key);
    throw error;
  }
}

export async function publicMediaRoute(env: Env, attachmentId: number): Promise<Response> {
  if (!env.MEDIA_BUCKET) return fail("MEDIA_STORAGE_NOT_CONFIGURED", "미디어 저장소가 연결되지 않았습니다.", 503);
  const sql = getSql(env);
  const rows = await sql`
    SELECT id,file_name,mime_type,metadata_json
    FROM attachments
    WHERE id=${attachmentId} AND target_type='site_media'
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) return fail("NOT_FOUND", "미디어를 찾을 수 없습니다.", 404);
  const meta = row.metadata_json as Record<string, unknown> | undefined;
  const key = typeof meta?.r2Key === "string" ? meta.r2Key : "";
  if (!key) return fail("NOT_FOUND", "미디어 저장 키를 찾을 수 없습니다.", 404);
  const object = await env.MEDIA_BUCKET.get(key);
  if (!object) return fail("NOT_FOUND", "미디어 객체를 찾을 수 없습니다.", 404);
  const headers = new Headers({
    "content-type": String(row.mime_type || object.httpMetadata?.contentType || "application/octet-stream"),
    "cache-control": "public, max-age=31536000, immutable",
    "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(String(row.file_name || "media"))}`,
  });
  if (object.httpEtag) headers.set("etag", object.httpEtag);
  return new Response(object.body, { status: 200, headers });
}
