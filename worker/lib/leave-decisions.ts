type SqlTag = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Array<Record<string, unknown>>>;

export type LeaveDecisionStatus = "approved" | "rejected" | "cancelled";

export interface LeaveDecisionInput {
  leaveRequestId: number;
  actorUserId: number;
  nextStatus: LeaveDecisionStatus;
}

export type LeaveDecisionResult =
  | {
      kind: "applied";
      leaveRequest: Record<string, unknown>;
      balanceUpdated: boolean;
    }
  | {
      kind: "conflict";
    }
  | {
      kind: "insufficient_balance";
    };

export async function applyLeaveDecisionAtomic(
  sql: SqlTag,
  input: LeaveDecisionInput
): Promise<LeaveDecisionResult> {
  const rows = await sql`
    WITH target_request AS (
      SELECT lr.*,
             lr.status AS previous_status,
             (${input.nextStatus} = 'approved'
               AND lr.leave_type IN ('annual', 'half_day_am', 'half_day_pm')) AS requires_balance
      FROM leave_requests lr
      WHERE lr.id = ${input.leaveRequestId}
        AND lr.status IN ('submitted', 'draft')
        AND lr.requested_days > 0
    ), eligible_request AS (
      SELECT tr.*, lb.id AS balance_id
      FROM target_request tr
      LEFT JOIN leave_balances lb
        ON lb.user_id = tr.user_id
       AND lb.balance_year = EXTRACT(YEAR FROM tr.start_date)::int
      WHERE tr.requires_balance = FALSE
         OR (
           lb.id IS NOT NULL
           AND (lb.granted_days + lb.adjusted_days - lb.used_days) >= tr.requested_days
         )
    ), updated_request AS (
      UPDATE leave_requests lr SET
        status = ${input.nextStatus},
        decided_by = ${input.actorUserId},
        decided_at = CASE WHEN ${input.nextStatus} IN ('approved','rejected') THEN now() ELSE NULL END,
        updated_at = now()
      FROM eligible_request er
      WHERE lr.id = er.id
        AND lr.status = er.previous_status
      RETURNING lr.*, er.requires_balance, er.balance_id
    ), updated_balance AS (
      UPDATE leave_balances b SET
        used_days = b.used_days + (SELECT requested_days FROM updated_request),
        updated_at = now()
      WHERE b.id = (SELECT balance_id FROM updated_request)
        AND (SELECT requires_balance FROM updated_request) = TRUE
      RETURNING b.id
    )
    SELECT
      (SELECT count(*)::int FROM target_request) AS target_count,
      (SELECT count(*)::int FROM eligible_request) AS eligible_count,
      (SELECT count(*)::int FROM updated_request) AS updated_count,
      (SELECT count(*)::int FROM updated_balance) AS balance_update_count,
      (SELECT requires_balance FROM target_request LIMIT 1) AS requires_balance,
      (SELECT to_jsonb(updated_request.*) FROM updated_request LIMIT 1) AS leave_request
  `;

  const row = rows[0];
  if (!row || Number(row.updated_count || 0) < 1) {
    const targetCount = Number(row?.target_count || 0);
    const eligibleCount = Number(row?.eligible_count || 0);
    const requiresBalance = row?.requires_balance === true || row?.requires_balance === "true";
    if (targetCount > 0 && eligibleCount < 1 && requiresBalance) return { kind: "insufficient_balance" };
    return { kind: "conflict" };
  }

  return {
    kind: "applied",
    leaveRequest: row.leave_request as Record<string, unknown>,
    balanceUpdated: Number(row.balance_update_count || 0) > 0,
  };
}
