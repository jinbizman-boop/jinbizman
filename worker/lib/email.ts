import type { Env } from "../types";
import { getSql } from "./db";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export interface InquiryEmailInput {
  inquiryId: number;
  inquiryType: string;
  companyName: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  locale: string;
  requestId: string;
}

async function logDelivery(env: Env, input: InquiryEmailInput, status: "sent" | "skipped" | "failed", providerId = "", errorMessage = ""): Promise<void> {
  try {
    const sql = getSql(env);
    await sql`
      INSERT INTO email_delivery_logs (
        message_type, provider, provider_id, related_type, related_id,
        recipient, status, error_message, request_id, metadata_json
      ) VALUES (
        'inquiry.created', 'resend', ${providerId}, 'inquiry', ${input.inquiryId},
        ${env.INQUIRY_NOTIFY_TO || "jinbizman@gmail.com"}, ${status}, ${errorMessage}, ${input.requestId},
        ${JSON.stringify({ locale: input.locale, inquiryType: input.inquiryType })}::jsonb
      )
    `;
  } catch (error) {
    console.error("email_delivery_log_failed", error instanceof Error ? error.message : error);
  }
}

export async function sendInquiryNotification(env: Env, input: InquiryEmailInput): Promise<void> {
  const recipient = env.INQUIRY_NOTIFY_TO?.trim();
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.INQUIRY_EMAIL_FROM?.trim();
  if (!recipient || !apiKey || !from) {
    await logDelivery(env, input, "skipped", "", "Email provider is not configured");
    return;
  }

  const subject = `[JINBIZ 문의 #${input.inquiryId}] ${input.inquiryType} · ${input.name}`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.7;color:#13213a">
      <h2 style="margin:0 0 18px">새 홈페이지 문의가 접수되었습니다.</h2>
      <table style="border-collapse:collapse;width:100%;max-width:720px">
        <tr><th style="text-align:left;padding:8px;border-bottom:1px solid #e5eaf2">문의 번호</th><td style="padding:8px;border-bottom:1px solid #e5eaf2">#${input.inquiryId}</td></tr>
        <tr><th style="text-align:left;padding:8px;border-bottom:1px solid #e5eaf2">유형</th><td style="padding:8px;border-bottom:1px solid #e5eaf2">${escapeHtml(input.inquiryType)}</td></tr>
        <tr><th style="text-align:left;padding:8px;border-bottom:1px solid #e5eaf2">회사/소속</th><td style="padding:8px;border-bottom:1px solid #e5eaf2">${escapeHtml(input.companyName || "-")}</td></tr>
        <tr><th style="text-align:left;padding:8px;border-bottom:1px solid #e5eaf2">이름</th><td style="padding:8px;border-bottom:1px solid #e5eaf2">${escapeHtml(input.name)}</td></tr>
        <tr><th style="text-align:left;padding:8px;border-bottom:1px solid #e5eaf2">이메일</th><td style="padding:8px;border-bottom:1px solid #e5eaf2">${escapeHtml(input.email)}</td></tr>
        <tr><th style="text-align:left;padding:8px;border-bottom:1px solid #e5eaf2">연락처</th><td style="padding:8px;border-bottom:1px solid #e5eaf2">${escapeHtml(input.phone || "-")}</td></tr>
        <tr><th style="text-align:left;padding:8px;border-bottom:1px solid #e5eaf2">언어</th><td style="padding:8px;border-bottom:1px solid #e5eaf2">${escapeHtml(input.locale)}</td></tr>
      </table>
      <h3 style="margin:24px 0 8px">문의 내용</h3>
      <div style="white-space:pre-wrap;padding:16px;border-radius:12px;background:#f5f8fd">${escapeHtml(input.message)}</div>
      <p style="margin-top:18px;color:#64748b">ERP 문의/리드 메뉴에서 담당자 지정과 후속 이력을 관리할 수 있습니다.</p>
    </div>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        "user-agent": "jinbiz-management/1.1",
        "idempotency-key": `inquiry-${input.inquiryId}-${input.requestId}`
      },
      body: JSON.stringify({ from, to: [recipient], subject, html, reply_to: input.email })
    });
    const payload = await response.json().catch(() => ({})) as { id?: string; message?: string };
    if (!response.ok) throw new Error(payload.message || `Resend request failed (${response.status})`);
    await logDelivery(env, input, "sent", payload.id || "");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email delivery error";
    await logDelivery(env, input, "failed", "", message);
    console.error("inquiry_email_failed", { inquiryId: input.inquiryId, message });
  }
}
