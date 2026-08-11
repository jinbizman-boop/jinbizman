import type { AuthUser, Env } from "../types";
import { getAuthUser, hasPermission } from "../lib/auth";
import { writeAuditLog } from "../lib/audit";
import { getSql } from "../lib/db";
import { fail, ok } from "../lib/response";
import { oneOf, readJson, text } from "../lib/validation";

const PROJECT_STATUSES = ["planned", "active", "paused", "completed", "cancelled"] as const;
const WBS_STATUSES = ["todo", "in_progress", "review", "approval_wait", "done", "delayed", "blocked"] as const;
const APPROVAL_ACTIONS = ["approve", "reject", "request_changes"] as const;
const EVALUATION_STATUSES = ["draft", "open", "scoring", "finalized", "closed"] as const;
const BUSINESS_DOMAINS = ["ai", "materials", "energy", "defense", "welfare"] as const;
const CYBERTRON_MODULES = ["brain", "frame", "heart", "shield", "senses"] as const;

async function requirePermission(request: Request, env: Env, permission: string): Promise<AuthUser | Response> {
  const user = await getAuthUser(request, env);
  if (!user) return fail("UNAUTHORIZED", "로그인이 필요합니다.", 401);
  if (!hasPermission(user, permission)) return fail("FORBIDDEN", "이 작업을 수행할 권한이 없습니다.", 403);
  return user;
}

function integer(value: unknown, min = 1): number | null {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isInteger(number) && number >= min ? number : null;
}

function optionalInteger(value: unknown, min = 1): number | null {
  return value === undefined || value === null || value === "" ? null : integer(value, min);
}

function dateText(value: unknown): string | null {
  const result = text(value, 10, true);
  return result && /^\d{4}-\d{2}-\d{2}$/.test(result) ? result : null;
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export async function erpProjectCreateRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "project.create");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const code = text(body.code, 120, true);
  const name = text(body.name, 255, true);
  const projectType = text(body.projectType, 80, true);
  const serviceId = optionalInteger(body.serviceId);
  const ownerUserId = optionalInteger(body.ownerUserId) ?? auth.id;
  const status = oneOf(body.status, PROJECT_STATUSES, "planned") ?? "planned";
  const startDate = body.startDate ? dateText(body.startDate) : null;
  const endDate = body.endDate ? dateText(body.endDate) : null;
  const description = text(body.description, 10000) ?? "";
  const businessDomainCode = oneOf(body.businessDomainCode, BUSINESS_DOMAINS);
  const cybertronModuleCode = oneOf(body.cybertronModuleCode, CYBERTRON_MODULES);
  if (!code || !name || !projectType || (body.startDate && !startDate) || (body.endDate && !endDate)) {
    return fail("VALIDATION_ERROR", "프로젝트 코드, 이름, 유형 또는 날짜 형식을 확인해주세요.", 422);
  }
  const sql = getSql(env);
  const rows = await sql`
    INSERT INTO projects (
      code, name, project_type, service_id, status, owner_user_id, start_date, end_date, description,
      business_domain_code, cybertron_module_code
    ) VALUES (
      ${code}, ${name}, ${projectType}, ${serviceId}, ${status}, ${ownerUserId}, ${startDate}, ${endDate}, ${description},
      ${businessDomainCode}, ${cybertronModuleCode}
    )
    RETURNING *
  `;
  const created = rows[0];
  await sql`
    INSERT INTO project_members (project_id, user_id, role_in_project)
    VALUES (${Number(created.id)}, ${ownerUserId}, 'owner')
    ON CONFLICT (project_id, user_id) DO NOTHING
  `;
  await writeAuditLog(request, env, auth, { actionType: "project.create", targetType: "project", targetId: Number(created.id), projectId: Number(created.id), serviceId, after: created, statusCode: 201 });
  return ok(created, { status: 201 });
}

export async function erpWbsCreateRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "wbs.create");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const projectId = integer(body.projectId);
  const title = text(body.title, 255, true);
  const templateId = optionalInteger(body.templateId);
  const parentTaskId = optionalInteger(body.parentTaskId);
  const assigneeUserId = optionalInteger(body.assigneeUserId);
  const reviewerUserId = optionalInteger(body.reviewerUserId);
  const approverUserId = optionalInteger(body.approverUserId);
  const description = text(body.description, 10000) ?? "";
  const taskType = text(body.taskType, 80) ?? "task";
  const jobFamily = text(body.jobFamily, 80) ?? "";
  const workStyle = text(body.workStyle, 80) ?? "";
  const priority = text(body.priority, 40) ?? "medium";
  const status = oneOf(body.status, WBS_STATUSES, "todo") ?? "todo";
  const startDate = body.startDate ? dateText(body.startDate) : null;
  const dueDate = body.dueDate ? dateText(body.dueDate) : null;
  const requiresApproval = bool(body.requiresApproval);
  const weight = Number(body.weight ?? 1);
  if (!projectId || !title || !Number.isFinite(weight) || weight < 0 || (body.startDate && !startDate) || (body.dueDate && !dueDate)) {
    return fail("VALIDATION_ERROR", "프로젝트, 업무명, 일정 또는 가중치를 확인해주세요.", 422);
  }
  const sql = getSql(env);
  const rows = await sql`
    INSERT INTO wbs_tasks (
      project_id, parent_task_id, template_id, title, description, task_type, job_family, work_style,
      assignee_user_id, reviewer_user_id, approver_user_id, start_date, due_date, priority, status,
      weight, requires_approval, actual_progress
    ) VALUES (
      ${projectId}, ${parentTaskId}, ${templateId}, ${title}, ${description}, ${taskType}, ${jobFamily}, ${workStyle},
      ${assigneeUserId}, ${reviewerUserId}, ${approverUserId}, ${startDate}, ${dueDate}, ${priority}, ${status},
      ${weight}, ${requiresApproval}, ${status === "done" ? 100 : 0}
    )
    RETURNING *
  `;
  await writeAuditLog(request, env, auth, { actionType: "wbs.create", targetType: "wbs_task", targetId: Number(rows[0].id), projectId, after: rows[0], statusCode: 201 });
  return ok(rows[0], { status: 201 });
}

export async function erpWbsUpdateRoute(request: Request, env: Env, taskId: number): Promise<Response> {
  const auth = await requirePermission(request, env, "wbs.update");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const sql = getSql(env);
  const beforeRows = await sql`SELECT * FROM wbs_tasks WHERE id = ${taskId} LIMIT 1`;
  const before = beforeRows[0];
  if (!before) return fail("NOT_FOUND", "WBS 업무를 찾을 수 없습니다.", 404);
  const status = body.status === undefined ? null : oneOf(body.status, WBS_STATUSES);
  const actualProgress = body.actualProgress === undefined ? null : integer(body.actualProgress, 0);
  if (actualProgress !== null && actualProgress > 100) return fail("VALIDATION_ERROR", "진척률은 0~100 사이여야 합니다.", 422);
  if (status === "done" && Boolean(before.requires_approval) && !before.approval_completed_at) {
    return fail("PRECONDITION_FAILED", "승인이 필요한 WBS는 승인 완료 후 종료할 수 있습니다.", 412);
  }
  const title = body.title === undefined ? null : text(body.title, 255, true);
  const dueDate = body.dueDate === undefined ? null : dateText(body.dueDate);
  const rows = await sql`
    UPDATE wbs_tasks SET
      title = COALESCE(${title}, title),
      status = COALESCE(${status}, status),
      actual_progress = CASE
        WHEN ${status} = 'done' THEN 100
        WHEN ${actualProgress}::int IS NOT NULL THEN ${actualProgress}
        ELSE actual_progress
      END,
      due_date = CASE WHEN ${body.dueDate === undefined} THEN due_date ELSE ${dueDate}::date END,
      updated_at = now()
    WHERE id = ${taskId}
    RETURNING *
  `;
  await writeAuditLog(request, env, auth, { actionType: "wbs.update", targetType: "wbs_task", targetId: taskId, projectId: Number(before.project_id), before, after: rows[0] });
  return ok(rows[0]);
}

function normalizeDailyReportItems(value: unknown): Array<Record<string, unknown>> | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 50) return null;
  const result: Array<Record<string, unknown>> = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const input = item as Record<string, unknown>;
    const wbsTaskId = integer(input.wbsTaskId);
    const goalText = text(input.goalText, 5000, true);
    const expectedHours = Number(input.expectedHours ?? 0);
    if (!wbsTaskId || !goalText || !Number.isFinite(expectedHours) || expectedHours < 0 || expectedHours > 24) return null;
    result.push({
      wbs_task_id: wbsTaskId,
      goal_text: goalText,
      expected_hours: expectedHours,
      collaboration_needed: bool(input.collaborationNeeded),
      has_preceding_issue: bool(input.hasPrecedingIssue),
      risk_text: text(input.riskText, 5000) ?? "",
      support_request_text: text(input.supportRequestText, 5000) ?? ""
    });
  }
  return result;
}

export async function erpDailyReportCreateRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "daily_report.create");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const reportDate = dateText(body.reportDate);
  const projectId = integer(body.projectId);
  const items = normalizeDailyReportItems(body.items);
  if (!reportDate || !projectId || !items) return fail("VALIDATION_ERROR", "보고일, 프로젝트, WBS 항목을 확인해주세요.", 422);
  const sql = getSql(env);
  const itemsJson = JSON.stringify(items);
  const rows = await sql`
    WITH report AS (
      INSERT INTO daily_reports (
        user_id, department_id, report_date, project_id, today_focus, top_priority_text,
        expected_blockers_text, support_request_target, expects_approval, submitted_at
      ) VALUES (
        ${auth.id}, (SELECT department_id FROM users WHERE id = ${auth.id}), ${reportDate}, ${projectId},
        ${text(body.todayFocus, 5000) ?? ""}, ${text(body.topPriorityText, 5000) ?? ""},
        ${text(body.expectedBlockersText, 5000) ?? ""}, ${text(body.supportRequestTarget, 5000) ?? ""},
        ${bool(body.expectsApproval)}, now()
      )
      ON CONFLICT (user_id, report_date, project_id) DO UPDATE SET
        today_focus = EXCLUDED.today_focus,
        top_priority_text = EXCLUDED.top_priority_text,
        expected_blockers_text = EXCLUDED.expected_blockers_text,
        support_request_target = EXCLUDED.support_request_target,
        expects_approval = EXCLUDED.expects_approval,
        submitted_at = now(), updated_at = now()
      RETURNING id
    ), cleared AS (
      DELETE FROM daily_report_items WHERE daily_report_id = (SELECT id FROM report)
    ), inserted AS (
      INSERT INTO daily_report_items (
        daily_report_id, wbs_task_id, goal_text, expected_hours, collaboration_needed,
        has_preceding_issue, risk_text, support_request_text
      )
      SELECT (SELECT id FROM report), x.wbs_task_id, x.goal_text, x.expected_hours,
             x.collaboration_needed, x.has_preceding_issue, x.risk_text, x.support_request_text
      FROM jsonb_to_recordset(${itemsJson}::jsonb) AS x(
        wbs_task_id bigint, goal_text text, expected_hours numeric,
        collaboration_needed boolean, has_preceding_issue boolean, risk_text text, support_request_text text
      )
      RETURNING id
    )
    SELECT id FROM report
  `;
  const reportId = Number(rows[0].id);
  await writeAuditLog(request, env, auth, { actionType: "daily_report.submit", targetType: "daily_report", targetId: reportId, projectId, after: { reportDate, itemCount: items.length } });
  return ok({ dailyReportId: reportId, submitted: true, itemCount: items.length }, { status: 201 });
}

function normalizeDailyLogItems(value: unknown): Array<Record<string, unknown>> | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 50) return null;
  const result: Array<Record<string, unknown>> = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const input = item as Record<string, unknown>;
    const wbsTaskId = integer(input.wbsTaskId);
    const workSummary = text(input.workSummary, 5000, true);
    const actualProgress = integer(input.actualProgress, 0);
    const isCompleted = bool(input.isCompleted, actualProgress === 100);
    const delayReasonCode = text(input.delayReasonCode, 80) ?? "";
    const nextAction = text(input.nextAction, 5000) ?? "";
    if (!wbsTaskId || !workSummary || actualProgress === null || actualProgress > 100) return null;
    if (!isCompleted && (!delayReasonCode || !nextAction)) return null;
    if (isCompleted && actualProgress !== 100) return null;
    result.push({
      wbs_task_id: wbsTaskId,
      work_summary: workSummary,
      is_completed: isCompleted,
      actual_progress: actualProgress,
      output_url: text(input.outputUrl, 2000) ?? "",
      delay_reason_code: delayReasonCode,
      issue_memo: text(input.issueMemo, 5000) ?? "",
      next_action: nextAction
    });
  }
  return result;
}

export async function erpDailyLogCreateRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "daily_log.create");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const logDate = dateText(body.logDate);
  const projectId = integer(body.projectId);
  const items = normalizeDailyLogItems(body.items);
  if (!logDate || !projectId || !items) return fail("VALIDATION_ERROR", "일지 날짜, 프로젝트, WBS 항목을 확인해주세요.", 422);
  const sql = getSql(env);
  const completedTaskIds = items
    .filter((item) => item.is_completed === true)
    .map((item) => Number(item.wbs_task_id));
  if (completedTaskIds.length > 0) {
    const approvalBlocks = await sql`
      SELECT id
      FROM wbs_tasks
      WHERE project_id = ${projectId}
        AND id = ANY(${completedTaskIds}::bigint[])
        AND requires_approval = TRUE
        AND approval_completed_at IS NULL
      LIMIT 1
    `;
    if (approvalBlocks[0]) {
      return fail("PRECONDITION_FAILED", "승인이 필요한 WBS는 결재 승인 후 완료 처리할 수 있습니다.", 412);
    }
  }
  const itemsJson = JSON.stringify(items);
  const rows = await sql`
    WITH daily_log AS (
      INSERT INTO daily_logs (
        user_id, department_id, log_date, project_id, daily_summary, collaboration_summary,
        pending_approval_summary, has_blocker, support_needed_text, submitted_at
      ) VALUES (
        ${auth.id}, (SELECT department_id FROM users WHERE id = ${auth.id}), ${logDate}, ${projectId},
        ${text(body.dailySummary, 5000) ?? ""}, ${text(body.collaborationSummary, 5000) ?? ""},
        ${text(body.pendingApprovalSummary, 5000) ?? ""}, ${bool(body.hasBlocker)}, ${text(body.supportNeededText, 5000) ?? ""}, now()
      )
      ON CONFLICT (user_id, log_date, project_id) DO UPDATE SET
        daily_summary = EXCLUDED.daily_summary,
        collaboration_summary = EXCLUDED.collaboration_summary,
        pending_approval_summary = EXCLUDED.pending_approval_summary,
        has_blocker = EXCLUDED.has_blocker,
        support_needed_text = EXCLUDED.support_needed_text,
        submitted_at = now(), updated_at = now()
      RETURNING id
    ), cleared AS (
      DELETE FROM daily_log_items WHERE daily_log_id = (SELECT id FROM daily_log)
    ), inserted AS (
      INSERT INTO daily_log_items (
        daily_log_id, wbs_task_id, work_summary, is_completed, actual_progress,
        output_url, delay_reason_code, issue_memo, next_action
      )
      SELECT (SELECT id FROM daily_log), x.wbs_task_id, x.work_summary, x.is_completed, x.actual_progress,
             x.output_url, x.delay_reason_code, x.issue_memo, x.next_action
      FROM jsonb_to_recordset(${itemsJson}::jsonb) AS x(
        wbs_task_id bigint, work_summary text, is_completed boolean, actual_progress integer,
        output_url text, delay_reason_code varchar, issue_memo text, next_action text
      )
      RETURNING wbs_task_id, actual_progress, is_completed
    ), updated_tasks AS (
      UPDATE wbs_tasks w SET
        actual_progress = i.actual_progress,
        status = CASE
          WHEN i.is_completed THEN 'done'
          WHEN i.actual_progress > 0 AND w.status = 'todo' THEN 'in_progress'
          ELSE w.status
        END,
        output_url = CASE WHEN x.output_url <> '' THEN x.output_url ELSE w.output_url END,
        updated_at = now()
      FROM inserted i
      JOIN jsonb_to_recordset(${itemsJson}::jsonb) AS x(wbs_task_id bigint, output_url text) ON x.wbs_task_id = i.wbs_task_id
      WHERE w.id = i.wbs_task_id AND w.project_id = ${projectId}
    )
    SELECT id FROM daily_log
  `;
  const logId = Number(rows[0].id);
  await writeAuditLog(request, env, auth, { actionType: "daily_log.submit", targetType: "daily_log", targetId: logId, projectId, after: { logDate, itemCount: items.length } });
  return ok({ dailyLogId: logId, submitted: true, itemCount: items.length }, { status: 201 });
}

export async function erpApprovalCreateRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "approval.create");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const documentType = text(body.documentType, 80, true);
  const title = text(body.title, 255, true);
  const projectId = optionalInteger(body.projectId);
  const serviceId = optionalInteger(body.serviceId);
  const relatedWbsTaskId = optionalInteger(body.relatedWbsTaskId);
  const businessDomainCode = oneOf(body.businessDomainCode, BUSINESS_DOMAINS);
  const approverUserIds = Array.isArray(body.approverUserIds)
    ? [...new Set(body.approverUserIds.map((value) => integer(value)).filter((value): value is number => value !== null))]
    : [];
  const requestedStatus = body.status === "draft" ? "draft" : "submitted";
  if (!documentType || !title || (requestedStatus === "submitted" && approverUserIds.length < 1)) {
    return fail("VALIDATION_ERROR", requestedStatus === "submitted" ? "문서 유형, 제목, 승인자를 확인해주세요." : "문서 유형과 제목을 확인해주세요.", 422);
  }
  const sql = getSql(env);
  const lineJson = JSON.stringify(approverUserIds.map((approverUserId, index) => ({ sequence_no: index + 1, approver_user_id: approverUserId })));
  const payloadJson = typeof body.payload === "object" && body.payload !== null ? JSON.stringify(body.payload) : "{}";
  const rows = await sql`
    WITH doc AS (
      INSERT INTO approval_documents (
        document_type, title, project_id, service_id, requester_user_id, related_wbs_task_id,
        status, payload_json, submitted_at, business_domain_code
      ) VALUES (
        ${documentType}, ${title}, ${projectId}, ${serviceId}, ${auth.id}, ${relatedWbsTaskId},
        ${requestedStatus}, ${payloadJson}::jsonb, CASE WHEN ${requestedStatus} = 'submitted' THEN now() ELSE NULL END, ${businessDomainCode}
      )
      RETURNING id
    ), lines AS (
      INSERT INTO approval_lines (approval_document_id, sequence_no, approver_user_id, line_role, is_required, line_status)
      SELECT (SELECT id FROM doc), x.sequence_no, x.approver_user_id, 'approver', TRUE, 'pending'
      FROM jsonb_to_recordset(${lineJson}::jsonb) AS x(sequence_no integer, approver_user_id bigint)
      RETURNING id
    )
    SELECT id FROM doc
  `;
  const documentId = Number(rows[0].id);
  await writeAuditLog(request, env, auth, { actionType: requestedStatus === "submitted" ? "approval.submit" : "approval.draft.create", targetType: "approval_document", targetId: documentId, projectId, serviceId, after: { title, approverUserIds, status: requestedStatus }, statusCode: 201 });
  return ok({ approvalDocumentId: documentId, status: requestedStatus }, { status: 201 });
}

export async function erpApprovalActionRoute(request: Request, env: Env, documentId: number): Promise<Response> {
  const auth = await requirePermission(request, env, "approval.act");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const actionType = oneOf(body.actionType, APPROVAL_ACTIONS);
  const comment = text(body.comment, 5000) ?? "";
  if (!actionType) return fail("VALIDATION_ERROR", "승인, 반려 또는 보완요청 액션이 필요합니다.", 422);
  const sql = getSql(env);
  const docs = await sql`SELECT * FROM approval_documents WHERE id = ${documentId} LIMIT 1`;
  const doc = docs[0];
  if (!doc) return fail("NOT_FOUND", "결재 문서를 찾을 수 없습니다.", 404);
  if (!["submitted"].includes(String(doc.status))) return fail("PRECONDITION_FAILED", "현재 상태에서는 결재 처리할 수 없습니다.", 412);
  const lines = await sql`
    SELECT * FROM approval_lines
    WHERE approval_document_id = ${documentId} AND approver_user_id = ${auth.id} AND line_status = 'pending'
    ORDER BY sequence_no ASC LIMIT 1
  `;
  const line = lines[0];
  if (!line) return fail("FORBIDDEN", "현재 사용자의 처리 대기 결재선이 없습니다.", 403);
  const lineStatus = actionType === "approve" ? "approved" : actionType === "reject" ? "rejected" : "request_changes";
  await sql`
    INSERT INTO approval_actions (approval_document_id, approval_line_id, approver_user_id, action_type, comment)
    VALUES (${documentId}, ${Number(line.id)}, ${auth.id}, ${actionType}, ${comment})
  `;
  await sql`UPDATE approval_lines SET line_status = ${lineStatus}, acted_at = now(), updated_at = now() WHERE id = ${Number(line.id)}`;
  if (actionType === "reject") {
    await sql`UPDATE approval_documents SET status = 'rejected', completed_at = now(), updated_at = now() WHERE id = ${documentId}`;
  } else if (actionType === "request_changes") {
    await sql`UPDATE approval_documents SET status = 'submitted', updated_at = now() WHERE id = ${documentId}`;
  } else {
    const pending = await sql`SELECT count(*)::int AS count FROM approval_lines WHERE approval_document_id = ${documentId} AND is_required = TRUE AND line_status = 'pending'`;
    if (Number(pending[0]?.count || 0) === 0) {
      await sql`UPDATE approval_documents SET status = 'approved', completed_at = now(), updated_at = now() WHERE id = ${documentId}`;
      if (doc.related_wbs_task_id) {
        await sql`UPDATE wbs_tasks SET approval_completed_at = now(), updated_at = now() WHERE id = ${Number(doc.related_wbs_task_id)}`;
      }
    }
  }
  const afterRows = await sql`SELECT * FROM approval_documents WHERE id = ${documentId}`;
  await writeAuditLog(request, env, auth, { actionType: `approval.${actionType}`, targetType: "approval_document", targetId: documentId, projectId: doc.project_id ? Number(doc.project_id) : null, serviceId: doc.service_id ? Number(doc.service_id) : null, before: doc, after: afterRows[0] });
  return ok(afterRows[0]);
}

export async function erpEvaluationCycleCreateRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "evaluation.finalize");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const name = text(body.name, 255, true);
  const startDate = dateText(body.startDate);
  const endDate = dateText(body.endDate);
  const status = oneOf(body.status, EVALUATION_STATUSES, "draft") ?? "draft";
  if (!name || !startDate || !endDate) return fail("VALIDATION_ERROR", "평가 주기명과 시작/종료일이 필요합니다.", 422);
  const sql = getSql(env);
  const rows = await sql`
    INSERT INTO evaluation_cycles (name, start_date, end_date, status, description, created_by)
    VALUES (${name}, ${startDate}, ${endDate}, ${status}, ${text(body.description, 5000) ?? ""}, ${auth.id})
    RETURNING *
  `;
  await writeAuditLog(request, env, auth, { actionType: "evaluation.cycle.create", targetType: "evaluation_cycle", targetId: Number(rows[0].id), after: rows[0], statusCode: 201 });
  return ok(rows[0], { status: 201 });
}

export async function erpEvaluationEvidenceRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "evaluation.read");
  if (auth instanceof Response) return auth;
  const url = new URL(request.url);
  const cycleId = integer(url.searchParams.get("cycleId"));
  const userId = integer(url.searchParams.get("userId"));
  if (!cycleId || !userId) return fail("VALIDATION_ERROR", "cycleId와 userId가 필요합니다.", 422);
  const sql = getSql(env);
  const rows = await sql`
    SELECT id, source_type, source_id, service_id, project_id, summary_json, occurred_at
    FROM evaluation_evidences
    WHERE cycle_id = ${cycleId} AND user_id = ${userId}
    ORDER BY occurred_at DESC
  `;
  return ok({ cycleId, userId, items: rows, evidenceCount: rows.length });
}

export async function erpEvaluationScoreRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "evaluation.score");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const cycleId = integer(body.cycleId);
  const evaluateeUserId = integer(body.evaluateeUserId);
  const evaluationItemId = integer(body.evaluationItemId);
  const score = Number(body.score);
  const comment = text(body.comment, 5000) ?? "";
  if (!cycleId || !evaluateeUserId || !evaluationItemId || !Number.isFinite(score) || score < 0 || score > 100) {
    return fail("VALIDATION_ERROR", "평가 주기, 대상, 항목, 점수를 확인해주세요.", 422);
  }
  const sql = getSql(env);
  try {
    const rows = await sql`
      INSERT INTO evaluation_scores (cycle_id, evaluatee_user_id, evaluator_user_id, evaluation_item_id, score, comment)
      VALUES (${cycleId}, ${evaluateeUserId}, ${auth.id}, ${evaluationItemId}, ${score}, ${comment})
      ON CONFLICT (cycle_id, evaluatee_user_id, evaluator_user_id, evaluation_item_id) DO UPDATE SET
        score = EXCLUDED.score, comment = EXCLUDED.comment, updated_at = now()
      RETURNING *
    `;
    await writeAuditLog(request, env, auth, { actionType: "evaluation.score", targetType: "evaluation_score", targetId: Number(rows[0].id), after: rows[0] });
    return ok(rows[0]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/requires at least one evaluation_evidences/i.test(message)) {
      return fail("PRECONDITION_FAILED", "평가 근거 데이터가 먼저 필요합니다.", 412);
    }
    throw error;
  }
}

export async function erpEvaluationFinalizeRoute(request: Request, env: Env, cycleId: number): Promise<Response> {
  const auth = await requirePermission(request, env, "evaluation.finalize");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const beforeRows = await sql`SELECT * FROM evaluation_cycles WHERE id = ${cycleId} LIMIT 1`;
  if (!beforeRows[0]) return fail("NOT_FOUND", "평가 주기를 찾을 수 없습니다.", 404);
  const counts = await sql`
    SELECT
      (SELECT count(*)::int FROM evaluation_evidences WHERE cycle_id = ${cycleId}) AS evidence_count,
      (SELECT count(*)::int FROM evaluation_scores WHERE cycle_id = ${cycleId}) AS score_count
  `;
  if (Number(counts[0]?.evidence_count || 0) < 1 || Number(counts[0]?.score_count || 0) < 1) {
    return fail("PRECONDITION_FAILED", "평가 근거와 점수가 모두 준비되어야 확정할 수 있습니다.", 412);
  }
  const rows = await sql`
    UPDATE evaluation_cycles SET status = 'finalized', finalized_at = now(), updated_at = now()
    WHERE id = ${cycleId}
    RETURNING *
  `;
  await writeAuditLog(request, env, auth, { actionType: "evaluation.finalize", targetType: "evaluation_cycle", targetId: cycleId, before: beforeRows[0], after: rows[0] });
  return ok(rows[0]);
}

export async function erpEvaluationReadinessRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "evaluation.read");
  if (auth instanceof Response) return auth;
  const url = new URL(request.url);
  const cycleId = Number(url.searchParams.get("cycleId"));
  if (!Number.isInteger(cycleId) || cycleId <= 0) return fail("VALIDATION_ERROR", "cycleId가 필요합니다.", 422);
  const sql = getSql(env);
  const cycle = (await sql`SELECT id, name, status FROM evaluation_cycles WHERE id = ${cycleId} LIMIT 1`)[0];
  if (!cycle) return fail("NOT_FOUND", "평가 주기를 찾을 수 없습니다.", 404);
  const [summary] = await sql`
    SELECT
      (SELECT count(*) FROM evaluation_evidences WHERE cycle_id = ${cycleId}) AS evidence_count,
      (SELECT count(*) FROM evaluation_scores WHERE cycle_id = ${cycleId}) AS score_count,
      (SELECT count(DISTINCT user_id) FROM evaluation_evidences WHERE cycle_id = ${cycleId}) AS evidence_user_count,
      (SELECT count(DISTINCT evaluatee_user_id) FROM evaluation_scores WHERE cycle_id = ${cycleId}) AS score_user_count
  `;
  const evidenceCount = Number(summary.evidence_count ?? 0);
  const scoreCount = Number(summary.score_count ?? 0);
  const canFinalize = cycle.status !== "finalized" && cycle.status !== "closed" && evidenceCount > 0 && scoreCount > 0;
  return ok({ cycle, ...summary, can_finalize: canFinalize });
}
