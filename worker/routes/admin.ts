import type { AuthUser, Env } from "../types";
import { getAuthUser, hasPermission } from "../lib/auth";
import { writeAuditLog } from "../lib/audit";
import { getSql } from "../lib/db";
import { fail, ok } from "../lib/response";
import { oneOf, readJson, text } from "../lib/validation";

async function requirePermission(request: Request, env: Env, permission: string): Promise<AuthUser | Response> {
  const user = await getAuthUser(request, env);
  if (!user) return fail("UNAUTHORIZED", "로그인이 필요합니다.", 401);
  if (!hasPermission(user, permission)) return fail("FORBIDDEN", "이 작업을 수행할 권한이 없습니다.", 403);
  return user;
}

export async function adminDashboardRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "project.read");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const [summary] = await sql`
    SELECT
      (SELECT count(*) FROM projects WHERE status NOT IN ('completed','cancelled')) AS active_projects,
      (SELECT count(*) FROM wbs_tasks WHERE status IN ('todo','in_progress','review','approval_wait','delayed','blocked')) AS open_tasks,
      (SELECT count(*) FROM approval_documents WHERE status = 'submitted') AS pending_approvals,
      (SELECT count(*) FROM inquiries WHERE status IN ('new','in_progress')) AS open_inquiries,
      (SELECT count(*) FROM users WHERE status = 'active') AS active_users
  `;
  return ok(summary);
}

export async function adminInquiriesRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "inquiry.read");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const rows = await sql`
    SELECT id, inquiry_type, company_name, name, email::text AS email, phone, message, locale, status, lead_status, created_at, updated_at
    FROM inquiries ORDER BY created_at DESC LIMIT 200
  `;
  return ok(rows);
}

export async function adminInquiryUpdateRoute(request: Request, env: Env, inquiryId: number): Promise<Response> {
  const auth = await requirePermission(request, env, "inquiry.update");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const statuses = ["new", "in_progress", "resolved", "converted"] as const;
  const leadStatuses = ["new", "qualified", "proposal", "won", "lost"] as const;
  const status = oneOf(body.status, statuses);
  const leadStatus = oneOf(body.leadStatus, leadStatuses);
  const note = text(body.internalNote, 5000);
  if (!status && !leadStatus && note === null) return fail("VALIDATION_ERROR", "변경할 항목이 없습니다.", 422);
  const sql = getSql(env);
  const beforeRows = await sql`SELECT * FROM inquiries WHERE id = ${inquiryId} LIMIT 1`;
  const before = beforeRows[0];
  if (!before) return fail("NOT_FOUND", "문의를 찾을 수 없습니다.", 404);
  const rows = await sql`
    UPDATE inquiries SET
      status = COALESCE(${status}, status),
      lead_status = COALESCE(${leadStatus}, lead_status),
      internal_note = COALESCE(${note}, internal_note),
      converted_at = CASE WHEN COALESCE(${status}, status) = 'converted' THEN COALESCE(converted_at, now()) ELSE converted_at END,
      updated_at = now()
    WHERE id = ${inquiryId}
    RETURNING id, status, lead_status, internal_note, updated_at
  `;
  if (!rows[0]) return fail("NOT_FOUND", "문의를 찾을 수 없습니다.", 404);
  await writeAuditLog(request, env, auth, {
    actionType: "inquiry.update", targetType: "inquiry", targetId: inquiryId, before, after: rows[0]
  });
  return ok(rows[0]);
}

export async function adminProjectsRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "project.read");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const rows = await sql`
    SELECT p.id, p.code AS project_code, p.name, p.status, p.start_date, p.end_date,
           COALESCE(round(avg(w.actual_progress)::numeric, 1), 0) AS progress_percent,
           count(w.id) AS task_count
    FROM projects p
    LEFT JOIN wbs_tasks w ON w.project_id = p.id
    GROUP BY p.id
    ORDER BY p.updated_at DESC
    LIMIT 200
  `;
  return ok(rows);
}

export async function adminWbsRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "wbs.read");
  if (auth instanceof Response) return auth;
  const url = new URL(request.url);
  const projectId = Number(url.searchParams.get("projectId"));
  if (!Number.isInteger(projectId) || projectId <= 0) return fail("VALIDATION_ERROR", "projectId가 필요합니다.", 422);
  const sql = getSql(env);
  const rows = await sql`
    SELECT id, project_id, parent_task_id, title, task_type, assignee_user_id, status, actual_progress AS progress_percent, start_date, due_date, updated_at
    FROM wbs_tasks WHERE project_id = ${projectId}
    ORDER BY sort_order ASC, id ASC
  `;
  return ok(rows);
}

export async function adminApprovalsRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "approval.read");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const rows = await sql`
    SELECT id, document_type, title, status, requester_user_id, submitted_at AS requested_at, completed_at, updated_at
    FROM approval_documents ORDER BY updated_at DESC LIMIT 200
  `;
  return ok(rows);
}

export async function adminEvaluationsRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "evaluation.read");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const rows = await sql`
    SELECT id, id::text AS cycle_code, name, status, start_date AS starts_at, end_date AS ends_at, finalized_at, updated_at
    FROM evaluation_cycles ORDER BY updated_at DESC LIMIT 100
  `;
  return ok(rows);
}

export async function adminServicesRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "service.read");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const rows = await sql`SELECT * FROM services ORDER BY updated_at DESC LIMIT 200`;
  return ok(rows);
}

export async function adminNewsRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "news.read");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const rows = await sql`
    SELECT id, category, title, slug, summary, status, is_pinned, published_at, created_at, updated_at
    FROM news_posts ORDER BY updated_at DESC LIMIT 200
  `;
  return ok(rows);
}

export async function adminContentsRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "content.read");
  if (auth instanceof Response) return auth;
  const url = new URL(request.url);
  const serviceId = Number(url.searchParams.get("serviceId"));
  const typeCode = (url.searchParams.get("typeCode") ?? "").trim();
  const sql = getSql(env);
  const rows = await sql`
    SELECT i.id, i.service_id, s.service_name, i.content_type_id, t.type_code, t.name AS content_type_name,
           i.title, i.slug, i.status, i.sort_order, i.payload_json, i.published_at, i.updated_at
    FROM service_content_items i
    JOIN services s ON s.id = i.service_id
    JOIN service_content_types t ON t.id = i.content_type_id
    WHERE (${Number.isInteger(serviceId) && serviceId > 0 ? serviceId : null}::bigint IS NULL OR i.service_id = ${Number.isInteger(serviceId) && serviceId > 0 ? serviceId : null})
      AND (${typeCode || null}::text IS NULL OR t.type_code = ${typeCode || null})
    ORDER BY i.service_id, t.sort_order, i.sort_order, i.id
    LIMIT 500
  `;
  return ok(rows);
}

export async function adminUsersRoute(request: Request, env: Env): Promise<Response> {
  const auth = await getAuthUser(request, env);
  if (!auth) return fail("UNAUTHORIZED", "로그인이 필요합니다.", 401);
  if (!hasPermission(auth, "user.read") && !hasPermission(auth, "approval.create") && !hasPermission(auth, "evaluation.read")) {
    return fail("FORBIDDEN", "사용자 목록을 조회할 권한이 없습니다.", 403);
  }
  const sql = getSql(env);
  const rows = await sql`
    SELECT u.id, u.name, u.email::text AS email, u.department_id, d.name AS department_name, u.job_family, u.job_role
    FROM users u LEFT JOIN departments d ON d.id = u.department_id
    WHERE u.status = 'active'
    ORDER BY COALESCE(d.sort_order, 999999), u.name
    LIMIT 500
  `;
  return ok(rows);
}

export async function adminApprovalDetailRoute(request: Request, env: Env, documentId: number): Promise<Response> {
  const auth = await requirePermission(request, env, "approval.read");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const docs = await sql`
    SELECT d.*, u.name AS requester_name, p.name AS project_name, s.service_name
    FROM approval_documents d
    LEFT JOIN users u ON u.id = d.requester_user_id
    LEFT JOIN projects p ON p.id = d.project_id
    LEFT JOIN services s ON s.id = d.service_id
    WHERE d.id = ${documentId} LIMIT 1
  `;
  if (!docs[0]) return fail("NOT_FOUND", "결재 문서를 찾을 수 없습니다.", 404);
  const lines = await sql`
    SELECT l.*, u.name AS approver_name, u.email::text AS approver_email
    FROM approval_lines l JOIN users u ON u.id = l.approver_user_id
    WHERE l.approval_document_id = ${documentId}
    ORDER BY l.sequence_no
  `;
  const actions = await sql`
    SELECT a.*, u.name AS approver_name
    FROM approval_actions a JOIN users u ON u.id = a.approver_user_id
    WHERE a.approval_document_id = ${documentId}
    ORDER BY a.acted_at, a.id
  `;
  return ok({ document: docs[0], lines, actions });
}

export async function adminEvaluationItemsRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "evaluation.read");
  if (auth instanceof Response) return auth;
  const cycleId = Number(new URL(request.url).searchParams.get("cycleId"));
  if (!Number.isInteger(cycleId) || cycleId <= 0) return fail("VALIDATION_ERROR", "cycleId가 필요합니다.", 422);
  const sql = getSql(env);
  const rows = await sql`
    SELECT id, cycle_id, code, name, item_group, weight, sort_order, description, business_domain_code
    FROM evaluation_items
    WHERE cycle_id = ${cycleId} AND is_active = TRUE
    ORDER BY sort_order, id
  `;
  return ok(rows);
}

export async function adminContentTypesRoute(request: Request, env: Env, serviceId: number): Promise<Response> {
  const auth = await requirePermission(request, env, "content.read");
  if (auth instanceof Response) return auth;
  if (!Number.isInteger(serviceId) || serviceId <= 0) return fail("VALIDATION_ERROR", "serviceId를 확인해주세요.", 422);
  const sql = getSql(env);
  const rows = await sql`
    SELECT id, service_id, type_code, name, category, sort_order, schema_json, is_active
    FROM service_content_types
    WHERE service_id = ${serviceId} AND is_active = TRUE
    ORDER BY sort_order, id
  `;
  return ok(rows);
}

export async function adminDepartmentsRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "user.read");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const rows = await sql`
    SELECT d.id, d.code, d.name, d.parent_id, p.name AS parent_name, d.sort_order, d.is_active,
           count(u.id)::int AS user_count
    FROM departments d
    LEFT JOIN departments p ON p.id = d.parent_id
    LEFT JOIN users u ON u.department_id = d.id AND u.status = 'active'
    GROUP BY d.id, p.name
    ORDER BY d.sort_order, d.name
  `;
  return ok(rows);
}

export async function adminRolesRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "role.read");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const rows = await sql`
    SELECT r.id, r.code, r.name, r.description, r.is_system,
           COALESCE(array_agg(DISTINCT p.code) FILTER (WHERE p.code IS NOT NULL), ARRAY[]::text[]) AS permissions,
           count(DISTINCT ur.user_id)::int AS user_count
    FROM roles r
    LEFT JOIN role_permissions rp ON rp.role_id = r.id
    LEFT JOIN permissions p ON p.id = rp.permission_id
    LEFT JOIN user_roles ur ON ur.role_id = r.id
    GROUP BY r.id
    ORDER BY r.is_system DESC, r.name
  `;
  return ok(rows);
}

export async function adminPermissionsRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "role.read");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const rows = await sql`SELECT id, code, name, description, group_key FROM permissions ORDER BY group_key, code`;
  return ok(rows);
}

export async function adminLoginEventsRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "audit.read");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const rows = await sql`
    SELECT l.id, l.user_id, u.name AS user_name, l.email::text AS email, l.event_type, l.ip_hash,
           l.user_agent, l.request_id, l.created_at
    FROM login_events l LEFT JOIN users u ON u.id = l.user_id
    ORDER BY l.created_at DESC LIMIT 300
  `;
  return ok(rows);
}

export async function adminLeadsRoute(request: Request, env: Env): Promise<Response> {
  const user = await getAuthUser(request, env);
  if (!user) return fail("UNAUTHORIZED", "로그인이 필요합니다.", 401);
  if (!hasPermission(user, "inquiry.read") && !hasPermission(user, "lead.update") && !hasPermission(user, "opportunity.manage")) return fail("FORBIDDEN", "리드 조회 권한이 없습니다.", 403);
  const sql = getSql(env);
  const rows = await sql`
    SELECT l.id, l.inquiry_id, l.company_name, l.contact_name, l.email::text AS email, l.phone, l.source_channel,
           l.lead_type, l.status, l.score, l.converted_to_project, l.created_at, u.name AS owner_name, s.service_name
    FROM leads l
    LEFT JOIN users u ON u.id = l.owner_user_id
    LEFT JOIN services s ON s.id = l.service_id
    ORDER BY l.updated_at DESC LIMIT 300
  `;
  return ok(rows);
}

export async function adminOpportunitiesRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "opportunity.manage");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const rows = await sql`
    SELECT o.id, o.lead_id, o.title, o.stage, o.expected_value, o.currency_code, o.expected_close_date,
           o.project_id, o.created_at, u.name AS owner_name, s.service_name, l.company_name
    FROM opportunities o
    LEFT JOIN users u ON u.id = o.owner_user_id
    LEFT JOIN services s ON s.id = o.service_id
    LEFT JOIN leads l ON l.id = o.lead_id
    ORDER BY o.updated_at DESC LIMIT 300
  `;
  return ok(rows);
}

export async function adminServiceDomainsRoute(request: Request, env: Env, serviceId: number): Promise<Response> {
  const auth = await requirePermission(request, env, "service.read");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const rows = await sql`SELECT id, service_id, domain, locale, is_canonical, updated_at FROM service_domains WHERE service_id = ${serviceId} ORDER BY locale`;
  return ok(rows);
}

export async function adminServiceChangesRoute(request: Request, env: Env, serviceId: number): Promise<Response> {
  const auth = await requirePermission(request, env, "service.read");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const rows = await sql`
    SELECT c.id, c.action_type, c.target_type, c.target_id, c.actor_user_id, u.name AS actor_name, c.created_at
    FROM service_change_logs c LEFT JOIN users u ON u.id = c.actor_user_id
    WHERE c.service_id = ${serviceId}
    ORDER BY c.created_at DESC LIMIT 300
  `;
  return ok(rows);
}

export async function adminWbsTemplatesRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "wbs.read");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const rows = await sql`
    SELECT t.id, t.code, t.name, t.job_family, t.work_style, t.is_active, t.business_domain_code, t.cybertron_module_code,
           count(i.id)::int AS item_count
    FROM wbs_templates t LEFT JOIN wbs_template_items i ON i.template_id = t.id
    GROUP BY t.id ORDER BY t.updated_at DESC
  `;
  return ok(rows);
}

export async function adminOperationsSummaryRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "project.read");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const [row] = await sql`
    SELECT
      (SELECT count(*)::int FROM projects WHERE status = 'active') AS active_projects,
      (SELECT count(*)::int FROM wbs_tasks WHERE status IN ('delayed','blocked')) AS risk_tasks,
      (SELECT count(*)::int FROM inquiries WHERE status IN ('new','in_progress')) AS open_inquiries,
      (SELECT count(*)::int FROM leads WHERE status NOT IN ('won','lost')) AS open_leads,
      (SELECT count(*)::int FROM approval_documents WHERE status = 'submitted') AS pending_approvals,
      (SELECT count(*)::int FROM expense_requests WHERE status IN ('draft','submitted','approved')) AS open_expenses,
      (SELECT COALESCE(sum(planned_amount),0) FROM project_budgets) AS planned_budget,
      (SELECT COALESCE(sum(spent_amount),0) FROM project_budgets) AS spent_budget,
      (SELECT count(*)::int FROM evaluation_evidences) AS evaluation_evidences
  `;
  return ok(row);
}
