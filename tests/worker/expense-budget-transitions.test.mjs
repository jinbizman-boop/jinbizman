import test from "node:test";
import assert from "node:assert/strict";
import { applyExpenseBudgetTransitionAtomic } from "../../worker/lib/expense-budget-transitions.ts";

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

test("expense transition emits one guarded atomic statement using DB amount and current status", async () => {
  const sql = makeSql([{ id: 77, status: "paid", previous_status: "approved", budget_update_count: 1 }]);

  const result = await applyExpenseBudgetTransitionAtomic(sql, {
    expenseId: 77,
    nextStatus: "paid",
  });

  assert.equal(sql.calls.length, 1);
  assert.equal(result.expense.status, "paid");
  assert.equal(result.previousStatus, "approved");
  assert.equal(result.budgetUpdated, true);
  assert.match(sql.calls[0].text, /WITH\s+eligible_expense/i);
  assert.match(sql.calls[0].text, /UPDATE\s+expense_requests/i);
  assert.match(sql.calls[0].text, /e\.status\s*=\s*ee\.previous_status/i);
  assert.match(sql.calls[0].text, /UPDATE\s+project_budgets/i);
  assert.match(sql.calls[0].text, /spent_amount\s*=\s*b\.spent_amount\s*\+/i);
  assert.match(sql.calls[0].text, /committed_amount\s*=\s*b\.committed_amount\s*\+/i);
  assert.match(sql.calls[0].text, /total_amount/i);
});

test("expense transition duplicate or stale status returns no mutation result", async () => {
  const sql = makeSql([]);

  const result = await applyExpenseBudgetTransitionAtomic(sql, {
    expenseId: 77,
    nextStatus: "paid",
  });

  assert.equal(sql.calls.length, 1);
  assert.equal(result, null);
});

test("expense transition requires matching project budget for budgeted statuses", async () => {
  const sql = makeSql([{ id: 77, status: "submitted", previous_status: "draft", budget_update_count: 1 }]);

  await applyExpenseBudgetTransitionAtomic(sql, {
    expenseId: 77,
    nextStatus: "submitted",
  });

  assert.match(sql.calls[0].text, /project_budgets\s+b/i);
  assert.match(sql.calls[0].text, /b\.project_id\s*=\s*e\.project_id/i);
  assert.match(sql.calls[0].text, /budget_id\s+IS\s+NOT\s+NULL/i);
});

test("expense transition reject path changes expense without budget delta", async () => {
  const sql = makeSql([{ id: 77, status: "rejected", previous_status: "submitted", budget_update_count: 0 }]);

  const result = await applyExpenseBudgetTransitionAtomic(sql, {
    expenseId: 77,
    nextStatus: "rejected",
  });

  assert.equal(sql.calls.length, 1);
  assert.equal(result.expense.status, "rejected");
  assert.equal(result.budgetUpdated, false);
});

test("expense transition atomic statement failure cannot run follow-up mutation queries", async () => {
  const sql = makeSql(new Error("simulated statement failure"));

  await assert.rejects(
    () => applyExpenseBudgetTransitionAtomic(sql, {
      expenseId: 77,
      nextStatus: "paid",
    }),
    /simulated statement failure/
  );

  assert.equal(sql.calls.length, 1);
});
