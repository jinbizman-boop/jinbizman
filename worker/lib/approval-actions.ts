type SqlTag = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Array<Record<string, unknown>>>;

export type ApprovalActionType = "approve" | "reject" | "request_changes";
export type ApprovalLineStatus = "approved" | "rejected" | "request_changes";

export interface ApprovalActionAtomicInput {
  documentId: number;
  actorUserId: number;
  actionType: ApprovalActionType;
  lineStatus: ApprovalLineStatus;
  comment: string;
}

export interface ApprovalActionAtomicResult {
  document: Record<string, unknown>;
  actionId: number;
  lineId: number;
  updatedWbs: boolean;
}

export async function applyApprovalActionAtomic(
  sql: SqlTag,
  input: ApprovalActionAtomicInput
): Promise<ApprovalActionAtomicResult | null> {
  const rows = await sql`
    WITH target_line AS (
      SELECT l.id AS line_id
      FROM approval_documents d
      JOIN approval_lines l ON l.approval_document_id = d.id
      WHERE d.id = ${input.documentId}
        AND d.status = 'submitted'
        AND l.approver_user_id = ${input.actorUserId}
        AND l.line_status = 'pending'
      ORDER BY l.sequence_no ASC
      LIMIT 1
    ), updated_line AS (
      UPDATE approval_lines l SET
        line_status = ${input.lineStatus},
        acted_at = now(),
        updated_at = now()
      FROM target_line t
      WHERE l.id = t.line_id
        AND l.line_status = 'pending'
      RETURNING l.id, l.approval_document_id
    ), inserted_action AS (
      INSERT INTO approval_actions (approval_document_id, approval_line_id, approver_user_id, action_type, comment)
      SELECT ${input.documentId}, ul.id, ${input.actorUserId}, ${input.actionType}, ${input.comment}
      FROM updated_line ul
      RETURNING id, approval_line_id
    ), remaining_required AS (
      SELECT count(*)::int AS count
      FROM approval_lines l
      WHERE l.approval_document_id = ${input.documentId}
        AND l.is_required = TRUE
        AND l.line_status = 'pending'
        AND NOT EXISTS (SELECT 1 FROM updated_line ul WHERE ul.id = l.id)
    ), updated_document AS (
      UPDATE approval_documents d SET
        status = CASE
          WHEN ${input.actionType} = 'reject' THEN 'rejected'
          WHEN ${input.actionType} = 'approve' AND (SELECT count FROM remaining_required) = 0 THEN 'approved'
          ELSE 'submitted'
        END,
        completed_at = CASE
          WHEN ${input.actionType} = 'reject' THEN now()
          WHEN ${input.actionType} = 'approve' AND (SELECT count FROM remaining_required) = 0 THEN now()
          ELSE completed_at
        END,
        updated_at = now()
      WHERE d.id = ${input.documentId}
        AND EXISTS (SELECT 1 FROM inserted_action)
      RETURNING d.*
    ), updated_wbs AS (
      UPDATE wbs_tasks w SET
        approval_completed_at = now(),
        updated_at = now()
      FROM updated_document d
      WHERE d.status = 'approved'
        AND d.related_wbs_task_id IS NOT NULL
        AND w.id = d.related_wbs_task_id
      RETURNING w.id
    )
    SELECT d.*,
           (SELECT id FROM inserted_action LIMIT 1) AS approval_action_id,
           (SELECT approval_line_id FROM inserted_action LIMIT 1) AS approval_line_id,
           (SELECT count(*)::int FROM updated_wbs) AS updated_wbs_count
    FROM updated_document d
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    document: row,
    actionId: Number(row.approval_action_id),
    lineId: Number(row.approval_line_id),
    updatedWbs: Number(row.updated_wbs_count || 0) > 0,
  };
}
