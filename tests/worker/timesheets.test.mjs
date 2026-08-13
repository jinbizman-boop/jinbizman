import test from "node:test";
import assert from "node:assert/strict";
import {
  parseTimesheetSubmission,
  validateTimesheetWbsProjectLink,
} from "../../worker/lib/timesheets.ts";

test("timesheet submission accepts a valid WBS-linked entry", () => {
  const result = parseTimesheetSubmission({
    projectId: 10,
    wbsTaskId: 55,
    workDate: "2026-08-13",
    hours: 2.5,
    description: "Implementation work",
    status: "submitted",
  });

  assert.equal(result.ok, true);
  assert.equal(result.value.projectId, 10);
  assert.equal(result.value.wbsTaskId, 55);
  assert.equal(result.value.hours, 2.5);
  assert.equal(result.value.status, "submitted");
});

test("timesheet submission rejects a missing WBS task before DB insert", () => {
  const result = parseTimesheetSubmission({
    projectId: 10,
    workDate: "2026-08-13",
    hours: 2.5,
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, "VALIDATION_ERROR");
});

test("timesheet submission rejects an explicit null WBS task before DB insert", () => {
  const result = parseTimesheetSubmission({
    projectId: 10,
    wbsTaskId: null,
    workDate: "2026-08-13",
    hours: 2.5,
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, "VALIDATION_ERROR");
});

test("timesheet submission rejects a WBS task outside the selected project", async () => {
  const sql = async (_strings, wbsTaskId, projectId) => (
    Number(wbsTaskId) === 55 && Number(projectId) === 10 ? [{ id: 55 }] : []
  );

  assert.equal(await validateTimesheetWbsProjectLink(sql, 10, 55), true);
  assert.equal(await validateTimesheetWbsProjectLink(sql, 10, 77), false);
});
