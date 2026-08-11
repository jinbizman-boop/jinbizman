import { pbkdf2Sync, randomBytes } from "node:crypto";
import test from "node:test";
import assert from "node:assert/strict";
import { verifyPassword } from "../../worker/lib/crypto.ts";

function base64Url(buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

test("admin password verification supports production PBKDF2 hashes", async () => {
  const password = "sample-password-not-secret";
  const salt = randomBytes(18);
  const hash = pbkdf2Sync(password, salt, 210000, 32, "sha256");
  const stored = `pbkdf2-sha256$210000$${base64Url(salt)}$${base64Url(hash)}`;

  assert.equal(await verifyPassword(password, stored), true);
  assert.equal(await verifyPassword("wrong-password", stored), false);
});
