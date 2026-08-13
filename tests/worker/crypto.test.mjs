import { pbkdf2Sync, randomBytes } from "node:crypto";
import { pbkdf2Async } from "@noble/hashes/pbkdf2.js";
import { sha256 as nobleSha256 } from "@noble/hashes/sha2.js";
import { utf8ToBytes } from "@noble/hashes/utils.js";
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

test("worker password verifier uses portable noble PBKDF2 without native PBKDF2 APIs", async () => {
  const source = await readFile("worker/lib/crypto.ts", "utf8");
  assert.match(source, /@noble\/hashes\/pbkdf2\.js/);
  assert.match(source, /@noble\/hashes\/sha2\.js/);
  assert.match(source, /@noble\/hashes\/utils\.js/);
  assert.match(source, /pbkdf2Async/);
  assert.doesNotMatch(source, /from "node:crypto"/);
  assert.doesNotMatch(source, /\bpbkdf2Sync\b/);
  assert.doesNotMatch(source, /node:crypto[\s\S]*\bpbkdf2\b/);
  assert.doesNotMatch(source, /timingSafeEqual/);
  assert.doesNotMatch(source, /crypto\.subtle\.deriveBits[\s\S]*PBKDF2/);
});

test("password verification supports non-zero-offset salt views", async () => {
  const password = "offset-view-password-not-secret";
  const backing = randomBytes(48);
  const salt = backing.subarray(13, 31);
  assert.notEqual(salt.byteOffset, 0);
  const hash = pbkdf2Sync(password, salt, 210000, 32, "sha256");
  const stored = `pbkdf2-sha256$210000$${base64Url(Buffer.from(salt))}$${base64Url(hash)}`;

  assert.equal(await verifyPassword(password, stored), true);
});

test("password verification remains compatible with create-admin hash generation", async () => {
  const password = "create-admin-compatible-not-secret";
  const salt = randomBytes(18);
  const hash = pbkdf2Sync(password, salt, 210000, 32, "sha256");
  const stored = `pbkdf2-sha256$210000$${base64Url(salt)}$${base64Url(hash)}`;

  const createAdminSource = await readFile("scripts/create-admin.mjs", "utf8");
  assert.match(createAdminSource, /pbkdf2Sync\(ADMIN_PASSWORD, salt, iterations, 32, "sha256"\)/);
  assert.equal(await verifyPassword(password, stored), true);
});

test("noble PBKDF2 output matches Node SHA-256 reference bytes", async () => {
  const password = "node-noble-byte-equality-not-secret";
  const salt = randomBytes(18);
  const nodeReference = pbkdf2Sync(password, salt, 210000, 32, "sha256");
  const nobleDerived = await pbkdf2Async(nobleSha256, utf8ToBytes(password), salt, { c: 210000, dkLen: 32 });

  assert.deepEqual(Buffer.from(nobleDerived), nodeReference);
});

test("JWT sign and verify remains compatible with WebCrypto HMAC", async () => {
  const token = await signJwt({ sub: "1", email: "admin@example.com", name: "Admin", exp: Math.floor(Date.now() / 1000) + 60 }, "test-secret-not-production");
  const payload = await verifyJwt(token, "test-secret-not-production");
  assert.equal(payload?.sub, "1");
  assert.equal(await verifyJwt(token, "wrong-secret"), null);
});
