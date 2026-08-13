const TIMESHEET_SUBMIT_STATUSES = ["draft", "submitted"] as const;

type TimesheetSubmitStatus = typeof TIMESHEET_SUBMIT_STATUSES[number];

type TimesheetSubmission = {
  projectId: number;
  wbsTaskId: number;
  workDate: string;
  hours: number;
  description: string;
  status: TimesheetSubmitStatus;
};

export type TimesheetSubmissionResult =
  | { ok: true; value: TimesheetSubmission }
  | { ok: false; code: "VALIDATION_ERROR" };

type SqlExecutor = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Array<Record<string, unknown>>>;

function integer(value: unknown, min = 1): number | null {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isInteger(number) && number >= min ? number : null;
}

function numeric(value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): number | null {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : null;
}

function text(value: unknown, maxLength: number, required = false): string | null {
  if (typeof value !== "string") return required ? null : "";
  const result = value.trim();
  if (required && !result) return null;
  if (result.length > maxLength) return null;
  return result;
}

function oneOf<T extends string>(value: unknown, values: readonly T[], fallback?: T): T | null {
  if (typeof value === "string" && values.includes(value as T)) return value as T;
  return fallback ?? null;
}

function dateText(value: unknown): string | null {
  const result = text(value, 10, true);
  return result && /^\d{4}-\d{2}-\d{2}$/.test(result) ? result : null;
}

export function parseTimesheetSubmission(body: Record<string, unknown>): TimesheetSubmissionResult {
  const projectId = integer(body.projectId);
  const wbsTaskId = integer(body.wbsTaskId);
  const workDate = dateText(body.workDate);
  const hours = numeric(body.hours, 0.25, 24);
  const description = text(body.description, 5000) ?? "";
  const status = oneOf(body.status, TIMESHEET_SUBMIT_STATUSES, "submitted") ?? "submitted";

  if (!projectId || !wbsTaskId || !workDate || !hours) {
    return { ok: false, code: "VALIDATION_ERROR" };
  }

  return {
    ok: true,
    value: { projectId, wbsTaskId, workDate, hours, description, status },
  };
}

export async function validateTimesheetWbsProjectLink(
  sql: SqlExecutor,
  projectId: number,
  wbsTaskId: number
): Promise<boolean> {
  const link = await sql`SELECT id FROM wbs_tasks WHERE id = ${wbsTaskId} AND project_id = ${projectId} LIMIT 1`;
  return Boolean(link[0]);
}
