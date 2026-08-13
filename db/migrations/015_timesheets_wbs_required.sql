-- Phase 2 P2-001 Remediation Batch 1
-- Enforce the Phase 1 contract that each timesheet entry references a WBS task.

ALTER TABLE timesheets
  ALTER COLUMN wbs_task_id SET NOT NULL;
