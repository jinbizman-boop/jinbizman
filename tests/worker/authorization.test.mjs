import test from "node:test";
import assert from "node:assert/strict";
import {
  assertProjectScope,
  assertSelfScope,
  assertServiceScope,
  assertTeamScope,
  authorizePermission,
  isAuthorizationFailure,
} from "../../worker/lib/authorization.ts";

const memberA = {
  id: 7,
  email: "member-a@example.test",
  name: "Member A",
  status: "active",
  departmentId: 10,
  permissions: ["project.read", "wbs.update", "attendance.read", "service.update"],
};

const memberB = {
  ...memberA,
  id: 8,
  email: "member-b@example.test",
  name: "Member B",
  departmentId: 20,
};

const teamLeadA = {
  ...memberA,
  permissions: ["attendance.manage", "leave.manage", "timesheet.review"],
};

const superAdmin = {
  ...memberA,
  permissions: ["system.update", "project.read", "wbs.update", "service.update", "attendance.manage"],
};

function fakeSql(strings, ...values) {
  const query = String.raw({ raw: strings }, ...values.map((_, index) => `$${index + 1}`));
  if (query.includes("FROM project_members")) {
    const [projectId, userId] = values.map(Number);
    return Promise.resolve(projectId === 101 && userId === 7 ? [{ id: 1 }] : []);
  }
  if (query.includes("FROM services")) {
    const [serviceId, userId, departmentId] = values.map(Number);
    const allowed = serviceId === 501 && (userId === 7 || departmentId === 10);
    return Promise.resolve(allowed ? [{ id: serviceId }] : []);
  }
  if (query.includes("FROM users")) {
    const [targetUserId, departmentId] = values.map(Number);
    const departments = new Map([
      [7, 10],
      [8, 20],
      [9, 10],
    ]);
    return Promise.resolve(departments.get(targetUserId) === departmentId ? [{ id: targetUserId }] : []);
  }
  return Promise.resolve([]);
}

test("authorization helper returns 401 for anonymous protected access", async () => {
  const result = await authorizePermission(null, "project.read");
  assert.ok(result instanceof Response);
  assert.equal(result.status, 401);
});

test("authorization helper returns 403 for authenticated user without permission", async () => {
  const result = await authorizePermission(memberA, "system.update");
  assert.ok(result instanceof Response);
  assert.equal(result.status, 403);
});

test("authorization helper allows users with the required permission", async () => {
  const result = await authorizePermission(memberA, "project.read");
  assert.equal(result, memberA);
});

test("self scope allows own resource and denies foreign user resource", () => {
  assert.equal(assertSelfScope(memberA, 7), null);
  const denied = assertSelfScope(memberA, 8);
  assert.ok(isAuthorizationFailure(denied));
  assert.equal(denied.status, 403);
});

test("self scope allows an explicit global/manage permission", () => {
  assert.equal(assertSelfScope(teamLeadA, 8, "attendance.manage"), null);
});

test("project scope denies cross-project access unless member or global bypass", async () => {
  assert.equal(await assertProjectScope(fakeSql, memberA, 101), null);
  const denied = await assertProjectScope(fakeSql, memberA, 202);
  assert.ok(isAuthorizationFailure(denied));
  assert.equal(denied.status, 403);
  assert.equal(await assertProjectScope(fakeSql, superAdmin, 202), null);
});

test("service scope denies unrelated service access", async () => {
  assert.equal(await assertServiceScope(fakeSql, memberA, 501), null);
  const denied = await assertServiceScope(fakeSql, memberB, 501);
  assert.ok(isAuthorizationFailure(denied));
  assert.equal(denied.status, 403);
});

test("team scope allows same department and denies other department", async () => {
  assert.equal(await assertTeamScope(fakeSql, teamLeadA, 9), null);
  const denied = await assertTeamScope(fakeSql, teamLeadA, 8);
  assert.ok(isAuthorizationFailure(denied));
  assert.equal(denied.status, 403);
});
