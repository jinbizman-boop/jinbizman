import test from "node:test";
import assert from "node:assert/strict";
import { applyApprovalActionAtomic } from "../../worker/lib/approval-actions.ts";

function makeSql(resultOrError) {
  const calls = [];
  const sql = async (strings, ...values) => {
    calls.push({ text: strings.join("?"), values });
    if (resultOrError instanceof Error) throw resultOrError;
    return resultOrError;
  };
  sql.calls = calls;
  return sql;
}

test("approval action mutation is emitted as one guarded atomic statement", async () => {
  const sql = makeSql([{ id: 10, status: "approved", approval_action_id: 91, approval_line_id: 41, updated_wbs_count: 1 }]);

  const result = await applyApprovalActionAtomic(sql, {
    documentId: 10,
    actorUserId: 7,
    actionType: "approve",
    lineStatus: "approved",
    comment: "Approved",
  });

  assert.equal(sql.calls.length, 1);
  assert.equal(result.document.status, "approved");
  assert.equal(result.actionId, 91);
  assert.equal(result.lineId, 41);
  assert.equal(result.updatedWbs, true);
  assert.match(sql.calls[0].text, /WITH\s+target_line/i);
  assert.match(sql.calls[0].text, /UPDATE\s+approval_lines[\s\S]+line_status\s*=\s*'pending'/i);
  assert.match(sql.calls[0].text, /INSERT\s+INTO\s+approval_actions[\s\S]+FROM\s+updated_line/i);
  assert.match(sql.calls[0].text, /UPDATE\s+approval_documents/i);
});

test("approval action duplicate or concurrently processed line returns no mutation result", async () => {
  const sql = makeSql([]);

  const result = await applyApprovalActionAtomic(sql, {
    documentId: 10,
    actorUserId: 7,
    actionType: "approve",
    lineStatus: "approved",
    comment: "",
  });

  assert.equal(sql.calls.length, 1);
  assert.equal(result, null);
});

test("approval action reject uses the same atomic boundary without WBS completion", async () => {
  const sql = makeSql([{ id: 10, status: "rejected", approval_action_id: 92, approval_line_id: 42, updated_wbs_count: 0 }]);

  const result = await applyApprovalActionAtomic(sql, {
    documentId: 10,
    actorUserId: 7,
    actionType: "reject",
    lineStatus: "rejected",
    comment: "Reject",
  });

  assert.equal(sql.calls.length, 1);
  assert.equal(result.document.status, "rejected");
  assert.equal(result.actionId, 92);
  assert.equal(result.lineId, 42);
  assert.equal(result.updatedWbs, false);
  assert.ok(sql.calls[0].values.includes("reject"));
  assert.ok(sql.calls[0].values.includes("rejected"));
});

test("approval action atomic statement failure cannot run follow-up mutation queries", async () => {
  const sql = makeSql(new Error("simulated statement failure"));

  await assert.rejects(
    () => applyApprovalActionAtomic(sql, {
      documentId: 10,
      actorUserId: 7,
      actionType: "reject",
      lineStatus: "rejected",
      comment: "Reject",
    }),
    /simulated statement failure/
  );

  assert.equal(sql.calls.length, 1);
}
);
