import type { AuthUser, Env } from "../types";
import { getAuthUser, hasPermission } from "../lib/auth";
import { writeAuditLog } from "../lib/audit";
import { getSql } from "../lib/db";
import { fail, ok } from "../lib/response";
import { oneOf, readJson, text } from "../lib/validation";

const TODO_STATUS = ["todo", "in_progress", "done", "cancelled"] as const;
const TODO_PRIORITY = ["low", "medium", "high", "urgent"] as const;
const LEAVE_TYPES = ["annual", "half_day_am", "half_day_pm", "sick", "special", "unpaid"] as const;
const LEAVE_STATUS = ["draft", "submitted", "approved", "rejected", "cancelled"] as const;
const TIMESHEET_STATUS = ["draft", "submitted", "approved", "rejected"] as const;
const EXPENSE_STATUS = ["draft", "submitted", "approved", "rejected", "paid", "cancelled"] as const;
const GOAL_OWNER_TYPES = ["user", "department", "project"] as const;
const GOAL_STATUS = ["draft", "active", "achieved", "closed", "cancelled"] as const;
const PUBLISH_STATUS = ["draft", "published", "archived"] as const;
const INTEGRATION_STATUS = ["disconnected", "configured", "healthy", "degraded", "error", "disabled"] as const;
const LOCALES = ["ko", "en", "ja", "fr", "es"] as const;

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

function numeric(value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): number | null {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : null;
}

function dateText(value: unknown): string | null {
  const result = text(value, 10, true);
  return result && /^\d{4}-\d{2}-\d{2}$/.test(result) ? result : null;
}

function isoDateTime(value: unknown): string | null {
  const result = text(value, 60, true);
  if (!result) return null;
  const parsed = new Date(result);
  return Number.isFinite(parsed.valueOf()) ? parsed.toISOString() : null;
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function requestedUserId(request: Request, auth: AuthUser, managePermission?: string): number {
  if (!managePermission || !hasPermission(auth, managePermission)) return auth.id;
  const raw = new URL(request.url).searchParams.get("userId");
  return integer(raw) ?? auth.id;
}

// ---------------------------------------------------------------------------
// To-do
// ---------------------------------------------------------------------------
export async function todoListRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "todo.read");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  await sql`
    INSERT INTO todo_items (user_id, wbs_task_id, source_type, title, description, status, priority, due_at, created_by, completed_at)
    SELECT w.assignee_user_id,
           w.id,
           'wbs',
           w.title,
           w.description,
           CASE WHEN w.status = 'done' THEN 'done' WHEN w.status = 'in_progress' THEN 'in_progress' ELSE 'todo' END,
           CASE WHEN w.priority IN ('low','medium','high','urgent') THEN w.priority ELSE 'medium' END,
           CASE WHEN w.due_date IS NOT NULL THEN (w.due_date::timestamp + interval '23 hours 59 minutes') AT TIME ZONE 'Asia/Seoul' ELSE NULL END,
           w.assignee_user_id,
           CASE WHEN w.status = 'done' THEN now() ELSE NULL END
    FROM wbs_tasks w
    WHERE w.assignee_user_id = ${auth.id}
    ON CONFLICT (user_id, wbs_task_id) WHERE wbs_task_id IS NOT NULL DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      status = CASE WHEN todo_items.source_type = 'wbs' THEN EXCLUDED.status ELSE todo_items.status END,
      priority = EXCLUDED.priority,
      due_at = EXCLUDED.due_at,
      completed_at = CASE WHEN EXCLUDED.status = 'done' THEN COALESCE(todo_items.completed_at, now()) ELSE NULL END,
      updated_at = now()
  `;
  const rows = await sql`
    SELECT t.*, w.project_id, p.name AS project_name
    FROM todo_items t
    LEFT JOIN wbs_tasks w ON w.id = t.wbs_task_id
    LEFT JOIN projects p ON p.id = w.project_id
    WHERE t.user_id = ${auth.id}
    ORDER BY (t.status = 'done') ASC, t.due_at ASC NULLS LAST, t.priority DESC, t.id DESC
    LIMIT 200
  `;
  return ok({ items: rows });
}

export async function todoCreateRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "todo.create");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const title = text(body.title, 255, true);
  const description = text(body.description, 5000) ?? "";
  const priority = oneOf(body.priority, TODO_PRIORITY, "medium") ?? "medium";
  const dueAt = body.dueAt ? isoDateTime(body.dueAt) : null;
  if (!title || (body.dueAt && !dueAt)) return fail("VALIDATION_ERROR", "할 일 제목 또는 마감일을 확인해주세요.", 422);
  const sql = getSql(env);
  const rows = await sql`
    INSERT INTO todo_items (user_id, source_type, title, description, priority, due_at, created_by)
    VALUES (${auth.id}, 'personal', ${title}, ${description}, ${priority}, ${dueAt}, ${auth.id})
    RETURNING *
  `;
  await writeAuditLog(request, env, auth, { actionType: "todo.create", targetType: "todo_item", targetId: Number(rows[0].id), after: rows[0], statusCode: 201 });
  return ok(rows[0], { status: 201 });
}

export async function todoUpdateRoute(request: Request, env: Env, id: number): Promise<Response> {
  const auth = await requirePermission(request, env, "todo.update");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const sql = getSql(env);
  const beforeRows = await sql`SELECT * FROM todo_items WHERE id = ${id} AND user_id = ${auth.id} LIMIT 1`;
  if (!beforeRows[0]) return fail("NOT_FOUND", "할 일을 찾을 수 없습니다.", 404);
  const status = body.status === undefined ? null : oneOf(body.status, TODO_STATUS);
  const priority = body.priority === undefined ? null : oneOf(body.priority, TODO_PRIORITY);
  const title = body.title === undefined ? null : text(body.title, 255, true);
  const dueAt = body.dueAt === undefined ? null : (body.dueAt === null || body.dueAt === "" ? "" : isoDateTime(body.dueAt));
  if ((body.status !== undefined && !status) || (body.priority !== undefined && !priority) || (body.title !== undefined && !title) || (body.dueAt !== undefined && dueAt === null)) {
    return fail("VALIDATION_ERROR", "할 일 상태, 우선순위, 제목 또는 마감일을 확인해주세요.", 422);
  }
  if (beforeRows[0].source_type === "wbs" && (body.title !== undefined || body.status !== undefined)) {
    return fail("PRECONDITION_FAILED", "WBS에서 생성된 할 일의 제목/상태는 WBS에서 변경해주세요.", 412);
  }
  const rows = await sql`
    UPDATE todo_items SET
      title = COALESCE(${title}, title),
      status = COALESCE(${status}, status),
      priority = COALESCE(${priority}, priority),
      due_at = CASE WHEN ${body.dueAt === undefined} THEN due_at WHEN ${dueAt === ""} THEN NULL ELSE ${dueAt}::timestamptz END,
      completed_at = CASE WHEN ${status} = 'done' THEN COALESCE(completed_at, now()) WHEN ${status}::text IS NOT NULL THEN NULL ELSE completed_at END,
      updated_at = now()
    WHERE id = ${id} AND user_id = ${auth.id}
    RETURNING *
  `;
  await writeAuditLog(request, env, auth, { actionType: "todo.update", targetType: "todo_item", targetId: id, before: beforeRows[0], after: rows[0] });
  return ok(rows[0]);
}

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------
export async function attendanceListRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "attendance.read");
  if (auth instanceof Response) return auth;
  const userId = requestedUserId(request, auth, "attendance.manage");
  const sql = getSql(env);
  const rows = await sql`
    SELECT a.*, u.name AS user_name
    FROM attendance_records a
    JOIN users u ON u.id = a.user_id
    WHERE a.user_id = ${userId}
    ORDER BY a.work_date DESC
    LIMIT 90
  `;
  return ok({ userId, items: rows });
}

export async function attendancePunchRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "attendance.punch");
  if (auth instanceof Response) return auth;
  const body = (await readJson(request)) ?? {};
  const action = oneOf(body.action, ["clock_in", "clock_out"] as const);
  const sql = getSql(env);
  const current = await sql`
    SELECT * FROM attendance_records
    WHERE user_id = ${auth.id} AND work_date = (now() AT TIME ZONE 'Asia/Seoul')::date
    LIMIT 1
  `;
  const inferredAction = action ?? (!current[0]?.clock_in_at ? "clock_in" : "clock_out");
  if (inferredAction === "clock_out" && !current[0]?.clock_in_at) return fail("PRECONDITION_FAILED", "출근 기록 후 퇴근할 수 있습니다.", 412);
  if (inferredAction === "clock_in" && current[0]?.clock_in_at) return fail("CONFLICT", "오늘 출근 기록이 이미 있습니다.", 409);
  if (inferredAction === "clock_out" && current[0]?.clock_out_at) return fail("CONFLICT", "오늘 퇴근 기록이 이미 있습니다.", 409);
  const rows = inferredAction === "clock_in"
    ? await sql`
        INSERT INTO attendance_records (user_id, work_date, clock_in_at, work_status)
        VALUES (${auth.id}, (now() AT TIME ZONE 'Asia/Seoul')::date, now(), 'working')
        ON CONFLICT (user_id, work_date) DO UPDATE SET clock_in_at = COALESCE(attendance_records.clock_in_at, now()), work_status = 'working', updated_at = now()
        RETURNING *
      `
    : await sql`
        UPDATE attendance_records SET
          clock_out_at = now(),
          work_status = 'completed',
          work_minutes = GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (now() - clock_in_at)) / 60)::int),
          updated_at = now()
        WHERE user_id = ${auth.id} AND work_date = (now() AT TIME ZONE 'Asia/Seoul')::date
        RETURNING *
      `;
  await writeAuditLog(request, env, auth, { actionType: `attendance.${inferredAction}`, targetType: "attendance_record", targetId: Number(rows[0].id), before: current[0], after: rows[0] });
  return ok(rows[0]);
}

export async function attendanceCorrectionRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "attendance.read");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const workDate = dateText(body.workDate);
  const reason = text(body.reason, 2000, true);
  if (!workDate || !reason) return fail("VALIDATION_ERROR", "정정 요청일과 사유를 확인해주세요.", 422);
  const sql = getSql(env);
  const rows = await sql`
    UPDATE attendance_records SET correction_status = 'requested', correction_reason = ${reason}, updated_at = now()
    WHERE user_id = ${auth.id} AND work_date = ${workDate}
    RETURNING *
  `;
  if (!rows[0]) return fail("NOT_FOUND", "정정할 근태 기록을 찾을 수 없습니다.", 404);
  await writeAuditLog(request, env, auth, { actionType: "attendance.correction.request", targetType: "attendance_record", targetId: Number(rows[0].id), after: rows[0] });
  return ok(rows[0]);
}

export async function attendanceCorrectionDecisionRoute(request: Request, env: Env, id: number): Promise<Response> {
  const auth = await requirePermission(request, env, "attendance.manage");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const status = oneOf(body.status, ["approved", "rejected"] as const);
  if (!status) return fail("VALIDATION_ERROR", "정정 처리 상태를 확인해주세요.", 422);
  const sql = getSql(env);
  const before = (await sql`SELECT * FROM attendance_records WHERE id = ${id} LIMIT 1`)[0];
  if (!before) return fail("NOT_FOUND", "근태 기록을 찾을 수 없습니다.", 404);
  if (String(before.correction_status) !== "requested") return fail("CONFLICT", "정정 요청 상태가 아닙니다.", 409);
  const clockInAt = body.clockInAt ? isoDateTime(body.clockInAt) : null;
  const clockOutAt = body.clockOutAt ? isoDateTime(body.clockOutAt) : null;
  if ((body.clockInAt && !clockInAt) || (body.clockOutAt && !clockOutAt)) return fail("VALIDATION_ERROR", "출퇴근 시각 형식을 확인해주세요.", 422);
  const rows = await sql`
    UPDATE attendance_records SET
      correction_status = ${status},
      clock_in_at = CASE WHEN ${status} = 'approved' AND ${clockInAt}::timestamptz IS NOT NULL THEN ${clockInAt}::timestamptz ELSE clock_in_at END,
      clock_out_at = CASE WHEN ${status} = 'approved' AND ${clockOutAt}::timestamptz IS NOT NULL THEN ${clockOutAt}::timestamptz ELSE clock_out_at END,
      work_minutes = CASE
        WHEN ${status} = 'approved' AND COALESCE(${clockOutAt}::timestamptz, clock_out_at) IS NOT NULL AND COALESCE(${clockInAt}::timestamptz, clock_in_at) IS NOT NULL
        THEN GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (COALESCE(${clockOutAt}::timestamptz, clock_out_at) - COALESCE(${clockInAt}::timestamptz, clock_in_at))) / 60)::int)
        ELSE work_minutes
      END,
      updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  await writeAuditLog(request, env, auth, { actionType: `attendance.correction.${status}`, targetType: "attendance_record", targetId: id, before, after: rows[0] });
  return ok(rows[0]);
}

// ---------------------------------------------------------------------------
// Leave
// ---------------------------------------------------------------------------
export async function leaveSummaryRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "leave.read");
  if (auth instanceof Response) return auth;
  const userId = requestedUserId(request, auth, "leave.manage");
  const sql = getSql(env);
  const balance = await sql`
    SELECT *, (granted_days + adjusted_days - used_days) AS remaining_days
    FROM leave_balances
    WHERE user_id = ${userId} AND balance_year = EXTRACT(YEAR FROM (now() AT TIME ZONE 'Asia/Seoul'))::int
    LIMIT 1
  `;
  const requests = await sql`
    SELECT r.*, u.name AS user_name
    FROM leave_requests r JOIN users u ON u.id = r.user_id
    WHERE r.user_id = ${userId}
    ORDER BY r.created_at DESC LIMIT 100
  `;
  return ok({ userId, balance: balance[0] ?? null, items: requests });
}

export async function leaveBalanceUpsertRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "leave.manage");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const userId = integer(body.userId);
  const balanceYear = integer(body.balanceYear, 2000);
  const grantedDays = numeric(body.grantedDays, 0, 366);
  const adjustedDays = numeric(body.adjustedDays ?? 0, -366, 366);
  if (!userId || !balanceYear || balanceYear > 2100 || grantedDays === null || adjustedDays === null) return fail("VALIDATION_ERROR", "사용자, 연도, 연차 부여값을 확인해주세요.", 422);
  const sql = getSql(env);
  const rows = await sql`
    INSERT INTO leave_balances (user_id, balance_year, granted_days, adjusted_days, used_days)
    VALUES (${userId}, ${balanceYear}, ${grantedDays}, ${adjustedDays}, 0)
    ON CONFLICT (user_id, balance_year) DO UPDATE SET granted_days = EXCLUDED.granted_days, adjusted_days = EXCLUDED.adjusted_days, updated_at = now()
    RETURNING *, (granted_days + adjusted_days - used_days) AS remaining_days
  `;
  await writeAuditLog(request, env, auth, { actionType: "leave.balance.upsert", targetType: "leave_balance", targetId: Number(rows[0].id), after: rows[0] });
  return ok(rows[0]);
}

export async function leaveCreateRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "leave.create");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const leaveType = oneOf(body.leaveType, LEAVE_TYPES, "annual") ?? "annual";
  const startDate = dateText(body.startDate);
  const endDate = dateText(body.endDate);
  const requestedDays = numeric(body.requestedDays, 0.5, 366);
  const reason = text(body.reason, 5000) ?? "";
  if (!startDate || !endDate || !requestedDays || endDate < startDate) return fail("VALIDATION_ERROR", "휴가 기간과 사용 일수를 확인해주세요.", 422);
  const sql = getSql(env);
  if (["annual", "half_day_am", "half_day_pm"].includes(leaveType)) {
    const balance = await sql`
      SELECT (granted_days + adjusted_days - used_days) AS remaining_days
      FROM leave_balances
      WHERE user_id = ${auth.id} AND balance_year = EXTRACT(YEAR FROM ${startDate}::date)::int
      LIMIT 1
    `;
    if (balance[0] && Number(balance[0].remaining_days) < requestedDays) return fail("PRECONDITION_FAILED", "잔여 연차가 부족합니다.", 412);
  }
  const rows = await sql`
    INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, requested_days, reason, status)
    VALUES (${auth.id}, ${leaveType}, ${startDate}, ${endDate}, ${requestedDays}, ${reason}, 'submitted')
    RETURNING *
  `;
  await writeAuditLog(request, env, auth, { actionType: "leave.submit", targetType: "leave_request", targetId: Number(rows[0].id), after: rows[0], statusCode: 201 });
  return ok(rows[0], { status: 201 });
}

export async function leaveDecisionRoute(request: Request, env: Env, id: number): Promise<Response> {
  const auth = await requirePermission(request, env, "leave.manage");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const status = oneOf(body.status, ["approved", "rejected", "cancelled"] as const);
  if (!status) return fail("VALIDATION_ERROR", "휴가 처리 상태를 확인해주세요.", 422);
  const sql = getSql(env);
  const beforeRows = await sql`SELECT * FROM leave_requests WHERE id = ${id} LIMIT 1`;
  const before = beforeRows[0];
  if (!before) return fail("NOT_FOUND", "휴가 신청을 찾을 수 없습니다.", 404);
  if (!["submitted", "draft"].includes(String(before.status))) return fail("CONFLICT", "이미 처리된 휴가 신청입니다.", 409);
  const consumesAnnual = status === "approved" && ["annual", "half_day_am", "half_day_pm"].includes(String(before.leave_type));
  if (consumesAnnual) {
    const balanceRows = await sql`
      SELECT (granted_days + adjusted_days - used_days) AS remaining_days
      FROM leave_balances
      WHERE user_id = ${Number(before.user_id)} AND balance_year = EXTRACT(YEAR FROM ${String(before.start_date)}::date)::int
      LIMIT 1
    `;
    if (!balanceRows[0]) return fail("PRECONDITION_FAILED", "해당 연도의 연차 잔액을 먼저 설정해주세요.", 412);
    if (Number(balanceRows[0].remaining_days) < Number(before.requested_days)) return fail("PRECONDITION_FAILED", "잔여 연차가 부족합니다.", 412);
  }
  const rows = await sql`
    WITH updated AS (
      UPDATE leave_requests SET
        status = ${status},
        decided_by = ${auth.id},
        decided_at = CASE WHEN ${status} IN ('approved','rejected') THEN now() ELSE NULL END,
        updated_at = now()
      WHERE id = ${id}
      RETURNING *
    ), balance AS (
      UPDATE leave_balances b SET
        used_days = b.used_days + (SELECT requested_days FROM updated),
        updated_at = now()
      WHERE ${consumesAnnual}
        AND b.user_id = (SELECT user_id FROM updated)
        AND b.balance_year = EXTRACT(YEAR FROM (SELECT start_date FROM updated))::int
      RETURNING id
    )
    SELECT * FROM updated
  `;
  await writeAuditLog(request, env, auth, { actionType: `leave.${status}`, targetType: "leave_request", targetId: id, before, after: rows[0] });
  return ok(rows[0]);
}

// ---------------------------------------------------------------------------
// Timesheets / allocations
// ---------------------------------------------------------------------------
export async function timesheetListRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "timesheet.read");
  if (auth instanceof Response) return auth;
  const canReview = hasPermission(auth, "timesheet.review");
  const userId = canReview ? integer(new URL(request.url).searchParams.get("userId")) : auth.id;
  const sql = getSql(env);
  const rows = await sql`
    SELECT t.*, u.name AS user_name, p.name AS project_name, w.title AS wbs_title
    FROM timesheets t
    JOIN users u ON u.id = t.user_id
    JOIN projects p ON p.id = t.project_id
    LEFT JOIN wbs_tasks w ON w.id = t.wbs_task_id
    WHERE (${userId}::bigint IS NULL OR t.user_id = ${userId})
    ORDER BY t.work_date DESC, t.id DESC LIMIT 200
  `;
  const allocations = await sql`
    SELECT a.*, p.name AS project_name, u.name AS user_name
    FROM project_resource_allocations a
    JOIN projects p ON p.id = a.project_id JOIN users u ON u.id = a.user_id
    WHERE (${canReview} OR a.user_id = ${auth.id})
    ORDER BY a.allocation_month DESC, a.project_id LIMIT 200
  `;
  return ok({ items: rows, allocations });
}

export async function timesheetCreateRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "timesheet.create");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const projectId = integer(body.projectId);
  const wbsTaskId = body.wbsTaskId ? integer(body.wbsTaskId) : null;
  const workDate = dateText(body.workDate);
  const hours = numeric(body.hours, 0.25, 24);
  const description = text(body.description, 5000) ?? "";
  const status = oneOf(body.status, ["draft", "submitted"] as const, "submitted") ?? "submitted";
  if (!projectId || !workDate || !hours) return fail("VALIDATION_ERROR", "프로젝트, 작업일, 시간을 확인해주세요.", 422);
  const sql = getSql(env);
  if (wbsTaskId) {
    const link = await sql`SELECT id FROM wbs_tasks WHERE id = ${wbsTaskId} AND project_id = ${projectId} LIMIT 1`;
    if (!link[0]) return fail("VALIDATION_ERROR", "선택한 WBS가 프로젝트에 속하지 않습니다.", 422);
  }
  const rows = await sql`
    INSERT INTO timesheets (user_id, project_id, wbs_task_id, work_date, hours, description, status)
    VALUES (${auth.id}, ${projectId}, ${wbsTaskId}, ${workDate}, ${hours}, ${description}, ${status})
    ON CONFLICT (user_id, project_id, wbs_task_id, work_date) DO UPDATE SET
      hours = EXCLUDED.hours, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = now()
    RETURNING *
  `;
  await writeAuditLog(request, env, auth, { actionType: "timesheet.submit", targetType: "timesheet", targetId: Number(rows[0].id), projectId, after: rows[0], statusCode: 201 });
  return ok(rows[0], { status: 201 });
}

export async function timesheetReviewRoute(request: Request, env: Env, id: number): Promise<Response> {
  const auth = await requirePermission(request, env, "timesheet.review");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const status = oneOf(body.status, ["approved", "rejected"] as const);
  if (!status) return fail("VALIDATION_ERROR", "검토 상태를 확인해주세요.", 422);
  const sql = getSql(env);
  const before = (await sql`SELECT * FROM timesheets WHERE id = ${id} LIMIT 1`)[0];
  if (!before) return fail("NOT_FOUND", "타임시트를 찾을 수 없습니다.", 404);
  const rows = await sql`
    UPDATE timesheets SET status = ${status}, reviewed_by = ${auth.id}, reviewed_at = now(), updated_at = now()
    WHERE id = ${id} RETURNING *
  `;
  await writeAuditLog(request, env, auth, { actionType: `timesheet.${status}`, targetType: "timesheet", targetId: id, projectId: Number(before.project_id), before, after: rows[0] });
  return ok(rows[0]);
}

export async function allocationUpsertRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "project.member.manage");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const projectId = integer(body.projectId);
  const userId = integer(body.userId);
  const month = dateText(body.allocationMonth);
  const percent = numeric(body.allocationPercent, 0, 100);
  if (!projectId || !userId || !month || percent === null || !/^\d{4}-\d{2}-01$/.test(month)) return fail("VALIDATION_ERROR", "프로젝트, 구성원, 월(YYYY-MM-01), 투입률을 확인해주세요.", 422);
  const sql = getSql(env);
  const total = await sql`
    SELECT COALESCE(sum(allocation_percent), 0) AS total
    FROM project_resource_allocations
    WHERE user_id = ${userId} AND allocation_month = ${month} AND project_id <> ${projectId}
  `;
  if (Number(total[0].total) + percent > 100) return fail("PRECONDITION_FAILED", "동일 월의 총 투입률이 100%를 초과합니다.", 412);
  const rows = await sql`
    INSERT INTO project_resource_allocations (project_id, user_id, allocation_month, allocation_percent, note)
    VALUES (${projectId}, ${userId}, ${month}, ${percent}, ${text(body.note, 2000) ?? ""})
    ON CONFLICT (project_id, user_id, allocation_month) DO UPDATE SET
      allocation_percent = EXCLUDED.allocation_percent, note = EXCLUDED.note, updated_at = now()
    RETURNING *
  `;
  await writeAuditLog(request, env, auth, { actionType: "resource_allocation.upsert", targetType: "project_resource_allocation", targetId: Number(rows[0].id), projectId, after: rows[0] });
  return ok(rows[0]);
}

// ---------------------------------------------------------------------------
// Budget / expense
// ---------------------------------------------------------------------------
export async function budgetListRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "budget.read");
  if (auth instanceof Response) return auth;
  const projectId = integer(new URL(request.url).searchParams.get("projectId"));
  const sql = getSql(env);
  const rows = await sql`
    SELECT b.*, p.name AS project_name,
           CASE WHEN b.planned_amount > 0 THEN ROUND((b.spent_amount / b.planned_amount) * 100, 2) ELSE 0 END AS execution_rate
    FROM project_budgets b JOIN projects p ON p.id = b.project_id
    WHERE (${projectId}::bigint IS NULL OR b.project_id = ${projectId})
    ORDER BY b.project_id, b.category_code LIMIT 300
  `;
  return ok({ items: rows });
}

export async function budgetUpsertRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "budget.manage");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const projectId = integer(body.projectId);
  const categoryCode = text(body.categoryCode, 80, true);
  const categoryName = text(body.categoryName, 160, true);
  const planned = numeric(body.plannedAmount, 0);
  if (!projectId || !categoryCode || !categoryName || planned === null) return fail("VALIDATION_ERROR", "프로젝트, 예산 비목, 금액을 확인해주세요.", 422);
  const sql = getSql(env);
  const rows = await sql`
    INSERT INTO project_budgets (project_id, category_code, category_name, planned_amount, currency)
    VALUES (${projectId}, ${categoryCode}, ${categoryName}, ${planned}, ${text(body.currency, 3) ?? "KRW"})
    ON CONFLICT (project_id, category_code) DO UPDATE SET category_name = EXCLUDED.category_name, planned_amount = EXCLUDED.planned_amount, updated_at = now()
    RETURNING *
  `;
  await writeAuditLog(request, env, auth, { actionType: "budget.upsert", targetType: "project_budget", targetId: Number(rows[0].id), projectId, after: rows[0] });
  return ok(rows[0]);
}

export async function expenseListRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "expense.read");
  if (auth instanceof Response) return auth;
  const canManage = hasPermission(auth, "expense.manage");
  const sql = getSql(env);
  const rows = await sql`
    SELECT e.*, u.name AS requester_name, p.name AS project_name, b.category_name
    FROM expense_requests e
    JOIN users u ON u.id = e.requester_user_id
    LEFT JOIN projects p ON p.id = e.project_id
    LEFT JOIN project_budgets b ON b.id = e.budget_id
    WHERE (${canManage} OR e.requester_user_id = ${auth.id})
    ORDER BY e.expense_date DESC, e.id DESC LIMIT 300
  `;
  return ok({ items: rows });
}

export async function expenseCreateRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "expense.create");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const projectId = body.projectId ? integer(body.projectId) : null;
  const budgetId = body.budgetId ? integer(body.budgetId) : null;
  const expenseDate = dateText(body.expenseDate);
  const description = text(body.description, 5000, true);
  const supply = numeric(body.supplyAmount, 0);
  const tax = numeric(body.taxAmount ?? 0, 0);
  const status = oneOf(body.status, ["draft", "submitted"] as const, "submitted") ?? "submitted";
  if (!expenseDate || !description || supply === null || tax === null) return fail("VALIDATION_ERROR", "지출일, 내용, 금액을 확인해주세요.", 422);
  const sql = getSql(env);
  if (budgetId && projectId) {
    const link = await sql`SELECT id FROM project_budgets WHERE id = ${budgetId} AND project_id = ${projectId} LIMIT 1`;
    if (!link[0]) return fail("VALIDATION_ERROR", "선택한 예산 비목이 프로젝트에 속하지 않습니다.", 422);
  }
  const rows = await sql`
    INSERT INTO expense_requests (requester_user_id, project_id, budget_id, expense_date, vendor_name, description, supply_amount, tax_amount, currency, status)
    VALUES (${auth.id}, ${projectId}, ${budgetId}, ${expenseDate}, ${text(body.vendorName, 255) ?? ""}, ${description}, ${supply}, ${tax}, ${text(body.currency, 3) ?? "KRW"}, ${status})
    RETURNING *
  `;
  await writeAuditLog(request, env, auth, { actionType: "expense.submit", targetType: "expense_request", targetId: Number(rows[0].id), projectId, after: rows[0], statusCode: 201 });
  return ok(rows[0], { status: 201 });
}

export async function expenseUpdateRoute(request: Request, env: Env, id: number): Promise<Response> {
  const auth = await requirePermission(request, env, "expense.manage");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const status = oneOf(body.status, EXPENSE_STATUS);
  if (!status) return fail("VALIDATION_ERROR", "지출 상태를 확인해주세요.", 422);
  const sql = getSql(env);
  const before = (await sql`SELECT * FROM expense_requests WHERE id = ${id} LIMIT 1`)[0];
  if (!before) return fail("NOT_FOUND", "지출 요청을 찾을 수 없습니다.", 404);
  if (String(before.status) === "paid" && status !== "paid") return fail("PRECONDITION_FAILED", "지급 완료된 지출은 상태를 되돌릴 수 없습니다.", 412);
  const rows = await sql`
    WITH updated AS (
      UPDATE expense_requests SET status = ${status}, updated_at = now() WHERE id = ${id} RETURNING *
    ), budget_update AS (
      UPDATE project_budgets b SET
        spent_amount = b.spent_amount + CASE WHEN ${String(before.status) !== "paid"} AND ${status} = 'paid' THEN (SELECT total_amount FROM updated) ELSE 0 END,
        committed_amount = b.committed_amount + CASE WHEN ${String(before.status) === "draft"} AND ${status} IN ('submitted','approved') THEN (SELECT total_amount FROM updated) ELSE 0 END,
        updated_at = now()
      WHERE b.id = (SELECT budget_id FROM updated) AND b.id IS NOT NULL
      RETURNING b.id
    )
    SELECT * FROM updated
  `;
  await writeAuditLog(request, env, auth, { actionType: `expense.${status}`, targetType: "expense_request", targetId: id, projectId: before.project_id ? Number(before.project_id) : null, before, after: rows[0] });
  return ok(rows[0]);
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------
export async function goalListRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "goal.read");
  if (auth instanceof Response) return auth;
  const canManage = hasPermission(auth, "goal.manage");
  const sql = getSql(env);
  const rows = await sql`
    SELECT g.*, u.name AS owner_user_name, d.name AS department_name, p.name AS project_name
    FROM goals g
    LEFT JOIN users u ON u.id = g.owner_user_id
    LEFT JOIN departments d ON d.id = g.department_id
    LEFT JOIN projects p ON p.id = g.project_id
    WHERE (${canManage} OR g.owner_user_id = ${auth.id})
    ORDER BY g.status, g.updated_at DESC LIMIT 300
  `;
  return ok({ items: rows });
}

export async function goalCreateRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "goal.manage");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const ownerType = oneOf(body.ownerType, GOAL_OWNER_TYPES, "user") ?? "user";
  const ownerUserId = ownerType === "user" ? (integer(body.ownerUserId) ?? auth.id) : null;
  const departmentId = ownerType === "department" ? integer(body.departmentId) : null;
  const projectId = ownerType === "project" ? integer(body.projectId) : null;
  const cycleLabel = text(body.cycleLabel, 80, true);
  const titleValue = text(body.title, 255, true);
  const targetValue = body.targetValue === undefined || body.targetValue === null ? null : numeric(body.targetValue, -Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
  if (!cycleLabel || !titleValue || (ownerType === "department" && !departmentId) || (ownerType === "project" && !projectId) || (body.targetValue !== undefined && body.targetValue !== null && targetValue === null)) {
    return fail("VALIDATION_ERROR", "목표 소유자, 주기, 제목, 목표값을 확인해주세요.", 422);
  }
  const sql = getSql(env);
  const rows = await sql`
    INSERT INTO goals (owner_type, owner_user_id, department_id, project_id, cycle_label, title, metric_name, target_value, current_value, unit, status, weight, created_by)
    VALUES (${ownerType}, ${ownerUserId}, ${departmentId}, ${projectId}, ${cycleLabel}, ${titleValue}, ${text(body.metricName, 160) ?? ""}, ${targetValue}, ${body.currentValue === undefined ? null : numeric(body.currentValue, -Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)}, ${text(body.unit, 40) ?? ""}, ${oneOf(body.status, GOAL_STATUS, "active") ?? "active"}, ${numeric(body.weight ?? 1, 0, 100) ?? 1}, ${auth.id})
    RETURNING *
  `;
  await writeAuditLog(request, env, auth, { actionType: "goal.create", targetType: "goal", targetId: Number(rows[0].id), projectId, after: rows[0], statusCode: 201 });
  return ok(rows[0], { status: 201 });
}

export async function goalUpdateRoute(request: Request, env: Env, id: number): Promise<Response> {
  const auth = await requirePermission(request, env, "goal.manage");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const status = body.status === undefined ? null : oneOf(body.status, GOAL_STATUS);
  const currentValue = body.currentValue === undefined ? null : numeric(body.currentValue, -Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
  if ((body.status !== undefined && !status) || (body.currentValue !== undefined && currentValue === null)) return fail("VALIDATION_ERROR", "목표 상태 또는 현재값을 확인해주세요.", 422);
  const sql = getSql(env);
  const before = (await sql`SELECT * FROM goals WHERE id = ${id} LIMIT 1`)[0];
  if (!before) return fail("NOT_FOUND", "목표를 찾을 수 없습니다.", 404);
  const rows = await sql`
    UPDATE goals SET status = COALESCE(${status}, status), current_value = CASE WHEN ${body.currentValue === undefined} THEN current_value ELSE ${currentValue}::numeric END, updated_at = now()
    WHERE id = ${id} RETURNING *
  `;
  await writeAuditLog(request, env, auth, { actionType: "goal.update", targetType: "goal", targetId: id, projectId: before.project_id ? Number(before.project_id) : null, before, after: rows[0] });
  return ok(rows[0]);
}

// ---------------------------------------------------------------------------
// Board / knowledge
// ---------------------------------------------------------------------------
export async function boardListRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "board.read");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const rows = await sql`
    SELECT b.*, u.name AS author_name FROM board_posts b
    LEFT JOIN users u ON u.id = b.author_user_id
    WHERE b.status <> 'archived' ORDER BY b.is_pinned DESC, b.published_at DESC NULLS LAST, b.id DESC LIMIT 200
  `;
  return ok({ items: rows });
}

export async function boardCreateRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "board.manage");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const titleValue = text(body.title, 255, true);
  const bodyValue = text(body.body, 50000, true);
  const status = oneOf(body.status, PUBLISH_STATUS, "published") ?? "published";
  if (!titleValue || !bodyValue) return fail("VALIDATION_ERROR", "게시물 제목과 본문을 확인해주세요.", 422);
  const sql = getSql(env);
  const rows = await sql`
    INSERT INTO board_posts (category, title, body, status, is_pinned, author_user_id, published_at)
    VALUES (${text(body.category, 80) ?? "notice"}, ${titleValue}, ${bodyValue}, ${status}, ${bool(body.isPinned)}, ${auth.id}, CASE WHEN ${status} = 'published' THEN now() ELSE NULL END)
    RETURNING *
  `;
  await writeAuditLog(request, env, auth, { actionType: "board.create", targetType: "board_post", targetId: Number(rows[0].id), after: rows[0], statusCode: 201 });
  return ok(rows[0], { status: 201 });
}

export async function knowledgeListRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "knowledge.read");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const rows = await sql`
    SELECT k.*, u.name AS owner_name FROM knowledge_documents k
    LEFT JOIN users u ON u.id = k.owner_user_id
    WHERE k.status <> 'archived' ORDER BY k.updated_at DESC LIMIT 200
  `;
  return ok({ items: rows });
}

export async function knowledgeCreateRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "knowledge.manage");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const titleValue = text(body.title, 255, true);
  const bodyValue = text(body.body, 100000, true);
  const tags = Array.isArray(body.tags) ? body.tags.map((v) => text(v, 60, true)).filter((v): v is string => Boolean(v)).slice(0, 30) : [];
  if (!titleValue || !bodyValue) return fail("VALIDATION_ERROR", "지식 문서 제목과 본문을 확인해주세요.", 422);
  const status = oneOf(body.status, PUBLISH_STATUS, "published") ?? "published";
  const sql = getSql(env);
  const rows = await sql`
    INSERT INTO knowledge_documents (category, title, body, tags, status, owner_user_id, source_url)
    VALUES (${text(body.category, 80) ?? "manual"}, ${titleValue}, ${bodyValue}, ${tags}, ${status}, ${auth.id}, ${text(body.sourceUrl, 2000) ?? ""})
    RETURNING *
  `;
  await writeAuditLog(request, env, auth, { actionType: "knowledge.create", targetType: "knowledge_document", targetId: Number(rows[0].id), after: rows[0], statusCode: 201 });
  return ok(rows[0], { status: 201 });
}

// ---------------------------------------------------------------------------
// Integrations / email templates
// ---------------------------------------------------------------------------
export async function integrationListRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "integration.read");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const rows = await sql`SELECT id, code, name, integration_type, status, config_json, last_checked_at, last_error, updated_at FROM integrations ORDER BY name`;
  return ok({ items: rows });
}

function containsSecretKey(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (["secret", "token", "apikey", "api_key", "password", "credential", "credentials"].includes(key.toLowerCase())) return true;
    if (containsSecretKey(child)) return true;
  }
  return false;
}

export async function integrationUpsertRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "integration.manage");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const code = text(body.code, 120, true);
  const name = text(body.name, 255, true);
  const integrationType = text(body.integrationType, 80, true);
  const status = oneOf(body.status, INTEGRATION_STATUS, "configured") ?? "configured";
  const config = body.config && typeof body.config === "object" && !Array.isArray(body.config) ? body.config : {};
  if (!code || !name || !integrationType || containsSecretKey(config)) return fail("VALIDATION_ERROR", "연동 기본값을 확인해주세요. 비밀정보는 Cloudflare Secrets에 저장해야 합니다.", 422);
  const sql = getSql(env);
  const rows = await sql`
    INSERT INTO integrations (code, name, integration_type, status, config_json, last_checked_at, last_error)
    VALUES (${code}, ${name}, ${integrationType}, ${status}, ${JSON.stringify(config)}::jsonb, now(), '')
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, integration_type = EXCLUDED.integration_type, status = EXCLUDED.status, config_json = EXCLUDED.config_json, last_checked_at = now(), updated_at = now()
    RETURNING *
  `;
  await writeAuditLog(request, env, auth, { actionType: "integration.upsert", targetType: "integration", targetId: Number(rows[0].id), after: { ...rows[0], config_json: "[non-secret metadata]" } });
  return ok(rows[0]);
}

export async function emailTemplateListRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "email_template.read");
  if (auth instanceof Response) return auth;
  const sql = getSql(env);
  const rows = await sql`SELECT id, code, locale, name, subject_template, html_template, text_template, is_active, updated_at FROM email_templates ORDER BY code, locale`;
  return ok({ items: rows });
}

export async function emailTemplateUpsertRoute(request: Request, env: Env): Promise<Response> {
  const auth = await requirePermission(request, env, "email_template.manage");
  if (auth instanceof Response) return auth;
  const body = await readJson(request);
  if (!body) return fail("INVALID_JSON", "올바른 JSON 요청이 필요합니다.");
  const code = text(body.code, 120, true);
  const locale = oneOf(body.locale, LOCALES, "ko") ?? "ko";
  const name = text(body.name, 255, true);
  const subject = text(body.subjectTemplate, 1000, true);
  const html = text(body.htmlTemplate, 100000, true);
  if (!code || !name || !subject || !html) return fail("VALIDATION_ERROR", "템플릿 코드, 이름, 제목, HTML을 확인해주세요.", 422);
  const sql = getSql(env);
  const rows = await sql`
    INSERT INTO email_templates (code, locale, name, subject_template, html_template, text_template, is_active, updated_by)
    VALUES (${code}, ${locale}, ${name}, ${subject}, ${html}, ${text(body.textTemplate, 100000) ?? ""}, ${bool(body.isActive, true)}, ${auth.id})
    ON CONFLICT (code, locale) DO UPDATE SET name = EXCLUDED.name, subject_template = EXCLUDED.subject_template, html_template = EXCLUDED.html_template, text_template = EXCLUDED.text_template, is_active = EXCLUDED.is_active, updated_by = EXCLUDED.updated_by, updated_at = now()
    RETURNING *
  `;
  await writeAuditLog(request, env, auth, { actionType: "email_template.upsert", targetType: "email_template", targetId: Number(rows[0].id), after: { id: rows[0].id, code, locale, name, is_active: rows[0].is_active } });
  return ok(rows[0]);
}
