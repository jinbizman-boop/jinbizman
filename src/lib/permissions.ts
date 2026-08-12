import { ApiError } from "./api";
import type { AuthUser } from "./auth";

export type PermissionAction = "read" | "write" | "approve";

export interface ModulePermissionContract {
  read: string[];
  write?: string[];
  approve?: string[];
}

export const PROTECTED_ADMIN_SCREEN_COUNT = 35;

export const MODULE_PERMISSIONS: Record<string, ModulePermissionContract> = {
  "dashboard": { read: ["project.read", "system.read", "audit.read"] },
  "services": { read: ["service.read"], write: ["service.create", "service.update"] },
  "site-content": { read: ["content.read"], write: ["content.update", "content.publish"] },
  "news": { read: ["news.read"], write: ["news.create", "news.update", "news.publish"] },
  "inquiries": { read: ["inquiry.read"], write: ["inquiry.update"], approve: ["lead.convert"] },
  "leads": { read: ["inquiry.read", "lead.update", "opportunity.manage"], write: ["lead.update", "opportunity.manage"] },
  "opportunities": { read: ["opportunity.manage"], write: ["opportunity.manage"] },
  "projects": { read: ["project.read", "wbs.read"], write: ["project.create", "project.update", "wbs.create", "wbs.update"] },
  "daily-work": { read: ["project.read", "wbs.read", "daily_report.create", "daily_log.create"], write: ["daily_report.create", "daily_log.create"] },
  "todos": { read: ["todo.read"], write: ["todo.manage", "wbs.update"] },
  "approvals": { read: ["approval.read"], write: ["approval.create"], approve: ["approval.act"] },
  "attendance": { read: ["attendance.read", "attendance.punch"], write: ["attendance.punch"], approve: ["attendance.manage"] },
  "leave": { read: ["leave.read", "leave.create"], write: ["leave.create"], approve: ["leave.manage"] },
  "timesheets": { read: ["timesheet.read", "timesheet.create"], write: ["timesheet.create"], approve: ["timesheet.review"] },
  "users": { read: ["user.read"], write: ["user.update"] },
  "departments": { read: ["user.read", "system.read"], write: ["system.update"] },
  "roles": { read: ["role.read"], write: ["system.update"] },
  "permissions": { read: ["role.read"], write: ["system.update"] },
  "budgets": { read: ["budget.read"], write: ["budget.manage"] },
  "expenses": { read: ["expense.read", "expense.create"], write: ["expense.create"], approve: ["expense.manage"] },
  "goals": { read: ["goal.read"], write: ["goal.manage"] },
  "evaluations": { read: ["evaluation.read"], write: ["evaluation.score"], approve: ["evaluation.finalize"] },
  "board": { read: ["board.read"], write: ["board.manage"] },
  "knowledge": { read: ["knowledge.read"], write: ["knowledge.manage"] },
  "media": { read: ["content.update"], write: ["content.update"] },
  "service-deployments": { read: ["service.read"], write: ["service.update"] },
  "site-banners": { read: ["content.read"], write: ["content.update"] },
  "site-navigation": { read: ["content.read"], write: ["content.update"] },
  "approval-templates": { read: ["approval.read"], write: ["approval.create"] },
  "code-groups": { read: ["system.read"], write: ["system.update"] },
  "integrations": { read: ["integration.read"], write: ["integration.manage"] },
  "email-templates": { read: ["email_template.read"], write: ["email_template.manage"] },
  "audit-logs": { read: ["audit.read"] },
  "settings": { read: ["system.read"], write: ["system.update"] },
};

export const permissionDeniedMessage = "이 작업을 수행할 권한이 없습니다.";

function permissionSet(user: AuthUser | null | undefined): Set<string> {
  return new Set(user?.permissions ?? []);
}

export function hasPermission(user: AuthUser | null | undefined, code: string): boolean {
  return permissionSet(user).has(code);
}

export function hasAnyPermission(user: AuthUser | null | undefined, codes: readonly string[] | undefined): boolean {
  if (!codes?.length) return true;
  const permissions = permissionSet(user);
  return codes.some((code) => permissions.has(code));
}

export function hasAllPermissions(user: AuthUser | null | undefined, codes: readonly string[] | undefined): boolean {
  if (!codes?.length) return true;
  const permissions = permissionSet(user);
  return codes.every((code) => permissions.has(code));
}

export function canAccessModule(user: AuthUser | null | undefined, moduleKey: string): boolean {
  const contract = MODULE_PERMISSIONS[moduleKey];
  return Boolean(contract && hasAnyPermission(user, contract.read));
}

export function canUseAction(user: AuthUser | null | undefined, moduleKey: string, action: PermissionAction): boolean {
  const contract = MODULE_PERMISSIONS[moduleKey];
  if (!contract) return false;
  const required = contract[action];
  return hasAnyPermission(user, required);
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

export function isForbiddenError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 403;
}
