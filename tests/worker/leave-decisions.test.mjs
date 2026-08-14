import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { applyLeaveDecisionAtomic } from "../../worker/lib/leave-decisions.ts";

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

test("leave approval emits one guarded atomic statement with canonical balance deduction", async () => {
  const sql = makeSql([{
    updated_count: 1,
    balance_update_count: 1,
    target_count: 1,
    eligible_count: 1,
    requires_balance: true,
    leave_request: { id: 31, status: "approved", requested_days: "2.00" },
  }]);

  const result = await applyLeaveDecisionAtomic(sql, {
    leaveRequestId: 31,
    actorUserId: 7,
    nextStatus: "approved",
  });

  assert.equal(sql.calls.length, 1);
  assert.equal(result.kind, "applied");
  assert.equal(result.leaveRequest.status, "approved");
  assert.equal(result.balanceUpdated, true);
  assert.match(sql.calls[0].text, /WITH\s+target_request/i);
  assert.match(sql.calls[0].text, /lr\.status\s+IN\s+\('submitted',\s*'draft'\)/i);
  assert.match(sql.calls[0].text, /lr\.requested_days\s*>\s*0/i);
  assert.match(sql.calls[0].text, /lr\.status\s*=\s*er\.previous_status/i);
  assert.match(sql.calls[0].text, /used_days\s*=\s*b\.used_days\s*\+\s*\(SELECT\s+requested_days\s+FROM\s+updated_request\)/i);
  assert.match(sql.calls[0].text, /lb\.granted_days\s*\+\s*lb\.adjusted_days\s*-\s*lb\.used_days[\s\S]*>=\s*tr\.requested_days/i);
});

test("leave rejection is atomic and does not update balance", async () => {
  const sql = makeSql([{
    updated_count: 1,
    balance_update_count: 0,
    target_count: 1,
    eligible_count: 1,
    requires_balance: false,
    leave_request: { id: 31, status: "rejected", requested_days: "2.00" },
  }]);

  const result = await applyLeaveDecisionAtomic(sql, {
    leaveRequestId: 31,
    actorUserId: 7,
    nextStatus: "rejected",
  });

  assert.equal(sql.calls.length, 1);
  assert.equal(result.kind, "applied");
  assert.equal(result.leaveRequest.status, "rejected");
  assert.equal(result.balanceUpdated, false);
});

test("leave duplicate or stale decision returns no applied mutation", async () => {
  const sql = makeSql([{
    updated_count: 0,
    balance_update_count: 0,
    target_count: 0,
    eligible_count: 0,
    requires_balance: null,
    leave_request: null,
  }]);

  const result = await applyLeaveDecisionAtomic(sql, {
    leaveRequestId: 31,
    actorUserId: 7,
    nextStatus: "approved",
  });

  assert.equal(sql.calls.length, 1);
  assert.equal(result.kind, "conflict");
});

test("leave insufficient balance returns a business result without mutation", async () => {
  const sql = makeSql([{
    updated_count: 0,
    balance_update_count: 0,
    target_count: 1,
    eligible_count: 0,
    requires_balance: true,
    leave_request: null,
  }]);

  const result = await applyLeaveDecisionAtomic(sql, {
    leaveRequestId: 31,
    actorUserId: 7,
    nextStatus: "approved",
  });

  assert.equal(sql.calls.length, 1);
  assert.equal(result.kind, "insufficient_balance");
});

test("concurrent leave approvals can resolve to one applied result and one conflict", async () => {
  const results = [
    [{
      updated_count: 1,
      balance_update_count: 1,
      target_count: 1,
      eligible_count: 1,
      requires_balance: true,
      leave_request: { id: 31, status: "approved", requested_days: "2.00" },
    }],
    [{
      updated_count: 0,
      balance_update_count: 0,
      target_count: 0,
      eligible_count: 0,
      requires_balance: null,
      leave_request: null,
    }],
  ];
  const calls = [];
  const sql = async (strings, ...values) => {
    calls.push({ text: strings.join("?"), values });
    return results.shift();
  };

  const [first, second] = await Promise.all([
    applyLeaveDecisionAtomic(sql, { leaveRequestId: 31, actorUserId: 7, nextStatus: "approved" }),
    applyLeaveDecisionAtomic(sql, { leaveRequestId: 31, actorUserId: 7, nextStatus: "approved" }),
  ]);

  assert.equal(calls.length, 2);
  assert.deepEqual([first.kind, second.kind].sort(), ["applied", "conflict"]);
  assert.equal(first.kind === "applied" ? first.balanceUpdated : second.balanceUpdated, true);
});

test("leave decision route preserves approver scope check before atomic mutation", async () => {
  const source = await readFile("worker/routes/operations.ts", "utf8");
  const routeStart = source.indexOf("export async function leaveDecisionRoute");
  const scopeCheck = source.indexOf("assertTeamScope(sql, auth, Number(before.user_id)", routeStart);
  const mutation = source.indexOf("applyLeaveDecisionAtomic(sql", routeStart);

  assert.notEqual(routeStart, -1);
  assert.notEqual(scopeCheck, -1);
  assert.notEqual(mutation, -1);
  assert.ok(scopeCheck < mutation);
});

test("leave decision statement failure cannot run follow-up mutation queries", async () => {
  const sql = makeSql(new Error("simulated statement failure"));

  await assert.rejects(
    () => applyLeaveDecisionAtomic(sql, {
      leaveRequestId: 31,
      actorUserId: 7,
      nextStatus: "approved",
    }),
    /simulated statement failure/
  );

  assert.equal(sql.calls.length, 1);
});
