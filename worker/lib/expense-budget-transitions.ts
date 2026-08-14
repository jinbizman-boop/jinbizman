type SqlTag = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Array<Record<string, unknown>>>;

export type ExpenseStatus = "draft" | "submitted" | "approved" | "rejected" | "paid" | "cancelled";

export interface ExpenseBudgetTransitionInput {
  expenseId: number;
  nextStatus: ExpenseStatus;
}

export interface ExpenseBudgetTransitionResult {
  expense: Record<string, unknown>;
  previousStatus: string;
  budgetUpdated: boolean;
}

export async function applyExpenseBudgetTransitionAtomic(
  sql: SqlTag,
  input: ExpenseBudgetTransitionInput
): Promise<ExpenseBudgetTransitionResult | null> {
  const rows = await sql`
    WITH eligible_expense AS (
      SELECT e.*, e.status AS previous_status
      FROM expense_requests e
      LEFT JOIN project_budgets b
        ON b.id = e.budget_id
       AND b.project_id = e.project_id
      LEFT JOIN approval_documents ad ON ad.id = e.approval_document_id
      WHERE e.id = ${input.expenseId}
        AND (
          (e.status = 'draft' AND ${input.nextStatus} IN ('submitted', 'cancelled'))
          OR (e.status = 'submitted' AND ${input.nextStatus} IN ('approved', 'rejected', 'cancelled'))
          OR (e.status = 'approved' AND ${input.nextStatus} IN ('paid', 'cancelled'))
        )
        AND (
          ${input.nextStatus} NOT IN ('submitted', 'approved', 'paid')
          OR (e.budget_id IS NOT NULL AND b.id IS NOT NULL)
        )
        AND (
          ${input.nextStatus} <> 'paid'
          OR e.approval_document_id IS NULL
          OR ad.status = 'approved'
        )
    ), updated_expense AS (
      UPDATE expense_requests e SET
        status = ${input.nextStatus},
        updated_at = now()
      FROM eligible_expense ee
      WHERE e.id = ee.id
        AND e.status = ee.previous_status
      RETURNING e.*, ee.previous_status
    ), budget_update AS (
      UPDATE project_budgets b SET
        spent_amount = b.spent_amount + CASE
          WHEN ${input.nextStatus} = 'paid'
            AND (SELECT previous_status FROM updated_expense) <> 'paid'
          THEN (SELECT total_amount FROM updated_expense)
          ELSE 0
        END,
        committed_amount = b.committed_amount + CASE
          WHEN (SELECT previous_status FROM updated_expense) = 'draft'
            AND ${input.nextStatus} IN ('submitted', 'approved')
          THEN (SELECT total_amount FROM updated_expense)
          ELSE 0
        END,
        updated_at = now()
      WHERE b.id = (SELECT budget_id FROM updated_expense)
        AND b.project_id = (SELECT project_id FROM updated_expense)
        AND (
          (${input.nextStatus} = 'paid' AND (SELECT previous_status FROM updated_expense) <> 'paid')
          OR ((SELECT previous_status FROM updated_expense) = 'draft' AND ${input.nextStatus} IN ('submitted', 'approved'))
        )
      RETURNING b.id
    )
    SELECT ue.*,
           (SELECT count(*)::int FROM budget_update) AS budget_update_count
    FROM updated_expense ue
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    expense: row,
    previousStatus: String(row.previous_status),
    budgetUpdated: Number(row.budget_update_count || 0) > 0,
  };
}
