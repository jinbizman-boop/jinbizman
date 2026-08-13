import { pbkdf2Sync, randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";
import { signJwt, verifyJwt, verifyPassword } from "../../worker/lib/crypto.ts";

function base64Url(buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

test("admin password verification supports production PBKDF2 hashes", async () => {
  const password = "sample-password-not-secret";
  const salt = randomBytes(18);
  const hash = pbkdf2Sync(password, salt, 210000, 32, "sha256");
  const stored = `pbkdf2-sha256$210000$${base64Url(salt)}$${base64Url(hash)}`;

  assert.match(stored, /^pbkdf2-sha256\$210000\$[A-Za-z0-9_-]+\$[A-Za-z0-9_-]+$/);
  assert.equal(await verifyPassword(password, stored), true);
  assert.equal(await verifyPassword("wrong-password", stored), false);
});

test("password verification supports legacy 100000 iteration PBKDF2 hashes", async () => {
  const password = "legacy-password-not-secret";
  const salt = randomBytes(18);
  const hash = pbkdf2Sync(password, salt, 100000, 32, "sha256");
  const stored = `pbkdf2-sha256$100000$${base64Url(salt)}$${base64Url(hash)}`;

  assert.equal(await verifyPassword(password, stored), true);
});

test("password verification rejects malformed hashes without throwing", async () => {
  assert.equal(await verifyPassword("sample-password-not-secret", ""), false);
  assert.equal(await verifyPassword("sample-password-not-secret", "pbkdf2-sha256$99999$salt$hash"), false);
  assert.equal(await verifyPassword("sample-password-not-secret", "pbkdf2-sha256$210000$bad salt$bad hash"), false);
  assert.equal(await verifyPassword("sample-password-not-secret", "other$210000$salt$hash"), false);
});

test("worker password verifier uses Web Crypto PBKDF2 without node:crypto PBKDF2", async () => {
  const source = await readFile("worker/lib/crypto.ts", "utf8");
  assert.match(source, /crypto\.subtle\.importKey[\s\S]*PBKDF2/);
  assert.match(source, /crypto\.subtle\.deriveBits/);
  assert.doesNotMatch(source, /from "node:crypto"/);
  assert.doesNotMatch(source, /\bpbkdf2\(/);
  assert.doesNotMatch(source, /pbkdf2Sync/);
});

test("JWT sign and verify remains compatible with WebCrypto HMAC", async () => {
  const token = await signJwt({ sub: "1", email: "admin@example.com", name: "Admin", exp: Math.floor(Date.now() / 1000) + 60 }, "test-secret-not-production");
  const payload = await verifyJwt(token, "test-secret-not-production");
  assert.equal(payload?.sub, "1");
  assert.equal(await verifyJwt(token, "wrong-secret"), null);
});
