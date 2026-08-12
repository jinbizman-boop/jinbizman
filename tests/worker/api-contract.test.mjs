import test from "node:test";
import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import {
  API_CONTRACTS,
  EXPECTED_API_SUMMARY,
  concretePath,
  contractKey,
  parseWorkerIndexContracts,
} from "../fixtures/api-contracts.mjs";

function countBy(items, key) {
  return items.reduce((counts, item) => {
    const value = item[key];
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function diffSets(left, right) {
  return [...left].filter((value) => !right.has(value)).sort();
}

async function parseAllowedMethodSpecs() {
  const source = await readFile("worker/lib/api-security.ts", "utf8");
  return [...source.matchAll(/\{\s*pattern:\s*\/(.+?)\/,\s*methods:\s*\[([^\]]+)\]\s*\}/gs)].map((match) => ({
    pattern: new RegExp(match[1]),
    methods: [...match[2].matchAll(/"([A-Z]+)"/g)].map((methodMatch) => methodMatch[1]),
  }));
}

async function readWorkerSourceCorpus() {
  const roots = ["worker/lib", "worker/routes"];
  const files = ["worker/index.ts"];
  for (const root of roots) {
    for (const name of await readdir(root)) {
      if (name.endsWith(".ts")) files.push(`${root}/${name}`);
    }
  }
  return (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
}

function allowedMethodsForConcretePath(specs, path) {
  return specs.find((spec) => spec.pattern.test(path))?.methods ?? null;
}

test("API contract registry has no duplicates and matches the Phase 1 current baseline", () => {
  const keys = API_CONTRACTS.map(contractKey);
  assert.equal(keys.length, new Set(keys).size, "duplicate method+path contract found");
  assert.equal(API_CONTRACTS.length, EXPECTED_API_SUMMARY.phaseOneCurrentContracts);
  assert.equal(new Set(API_CONTRACTS.map((contract) => contract.path)).size, EXPECTED_API_SUMMARY.uniquePaths);
  assert.deepEqual({ DELETE: 0, ...countBy(API_CONTRACTS, "method") }, EXPECTED_API_SUMMARY.methods);
});

test("worker/index.ts route surface stays in sync with the API contract registry", async () => {
  const sourceContracts = await parseWorkerIndexContracts();
  const sourceKeys = new Set(sourceContracts.map(contractKey));
  const registryKeys = new Set(API_CONTRACTS.map(contractKey));

  assert.deepEqual(diffSets(sourceKeys, registryKeys), [], "source-only route contracts must be added to the registry");
  assert.deepEqual(diffSets(registryKeys, sourceKeys), [], "registry-only route contracts must match worker/index.ts");
});

test("allowed method policy is no wider than the registered API contracts", async () => {
  const specs = await parseAllowedMethodSpecs();
  const methodsByPath = new Map();
  for (const contract of API_CONTRACTS) {
    const methods = methodsByPath.get(contract.path) ?? new Set();
    methods.add(contract.method);
    methodsByPath.set(contract.path, methods);
  }

  for (const [path, methods] of methodsByPath.entries()) {
    const allowed = allowedMethodsForConcretePath(specs, concretePath(path));
    assert.ok(allowed, `${path} must have an allowed-method policy`);
    assert.deepEqual([...allowed].sort(), [...methods].sort(), `${path} allowed methods must match source routes`);
  }
});

test("response envelope and error family contracts remain stable", async () => {
  const response = await readFile("worker/lib/response.ts", "utf8");
  const sourceCorpus = await readWorkerSourceCorpus();

  assert.match(response, /success: true, data/);
  assert.match(response, /success: false, error: \{ code, message/);
  for (const code of [
    "INVALID_JSON",
    "UNAUTHORIZED",
    "FORBIDDEN",
    "NOT_FOUND",
    "CONFLICT",
    "PAYLOAD_TOO_LARGE",
    "UNSUPPORTED_MEDIA_TYPE",
    "ACCOUNT_LOCKED",
    "RATE_LIMITED",
    "INTERNAL_ERROR",
  ]) {
    assert.match(`${sourceCorpus}\n${response}`, new RegExp(code));
  }
});

test("authorization and audit matrices cover protected and high-risk routes", async () => {
  const authorizationMatrix = await readFile("AUTHORIZATION_MATRIX.md", "utf8");
  const auditMatrix = await readFile("AUDIT_MATRIX.md", "utf8");
  const protectedContracts = API_CONTRACTS.filter((contract) =>
    ["Admin", "ERP", "System"].includes(contract.classification)
      && contract.path !== "/api/system/business-domains"
  );
  const highRiskWriteContracts = API_CONTRACTS.filter((contract) =>
    contract.access === "WRITE"
      && (contract.path.startsWith("/api/admin/") || contract.path.startsWith("/api/erp/") || contract.path.startsWith("/api/system/"))
  );

  for (const contract of protectedContracts) {
    assert.match(authorizationMatrix, new RegExp(contract.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${contractKey(contract)} missing from authorization matrix`);
  }

  for (const contract of highRiskWriteContracts.filter((contract) => contract.path !== "/api/admin/media")) {
    assert.match(auditMatrix, new RegExp(contract.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${contractKey(contract)} missing from audit matrix`);
  }
});

test("migration and schema regression distinguish current production from planned 014 upgrade", async () => {
  const migrations = (await readdir("db/migrations")).filter((name) => /^\d{3}_.*\.sql$/.test(name)).sort();
  assert.equal(migrations.length, 14);
  assert.equal(migrations.at(-1), "014_mobile_auth_sessions.sql");
  migrations.forEach((migration, index) => {
    assert.equal(migration.slice(0, 3), String(index + 1).padStart(3, "0"));
  });

  const dbInventory = await readFile("DB_INVENTORY.md", "utf8");
  const mobileAuthMigration = await readFile("db/migrations/014_mobile_auth_sessions.sql", "utf8");
  assert.match(dbInventory, /Base tables:\s*71/i);
  assert.match(mobileAuthMigration, /CREATE TABLE IF NOT EXISTS auth_sessions/i);
});

test("security regression documentation and release-gate source files are present", async () => {
  for (const file of [
    "BASELINE.md",
    "DB_INVENTORY.md",
    "API_INVENTORY.md",
    "SCREEN_INVENTORY.md",
    "RTM.md",
    "BACKLOG.md",
    "AUTHORIZATION_MATRIX.md",
    "API_VERSIONING.md",
    "AUTH_CONTRACT.md",
    "API_SECURITY_POLICY.md",
    "AUDIT_MATRIX.md",
    "AUDIT_POLICY.md",
    "API_TEST_STRATEGY.md",
  ]) {
    await access(file);
  }
});
