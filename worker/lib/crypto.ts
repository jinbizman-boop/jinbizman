import { pbkdf2Async } from "@noble/hashes/pbkdf2.js";
import { sha256 as nobleSha256 } from "@noble/hashes/sha2.js";
import { utf8ToBytes } from "@noble/hashes/utils.js";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(normalized);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmac(secret: string, value: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

async function derivePbkdf2(password: string, salt: Uint8Array, iterations: number, length: number): Promise<Uint8Array> {
  return await pbkdf2Async(nobleSha256, utf8ToBytes(password), salt, { c: iterations, dkLen: length });
}

function equalBytes(actual: Uint8Array, expected: Uint8Array): boolean {
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let index = 0; index < actual.length; index += 1) diff |= actual[index] ^ expected[index];
  return diff === 0;
}

export async function signJwt(payload: object, secret: string): Promise<string> {
  const header = base64UrlEncode(encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const input = `${header}.${body}`;
  return `${input}.${base64UrlEncode(await hmac(secret, input))}`;
}

export async function verifyJwt<T extends Record<string, unknown>>(token: string, secret: string): Promise<T | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const input = `${parts[0]}.${parts[1]}`;
  const expected = await hmac(secret, input);
  const actual = base64UrlDecode(parts[2]);
  if (actual.length !== expected.length) return null;
  let diff = 0;
  for (let index = 0; index < actual.length; index += 1) diff |= actual[index] ^ expected[index];
  if (diff !== 0) return null;
  try {
    const payload = JSON.parse(decoder.decode(base64UrlDecode(parts[1]))) as T & { exp?: number };
    if (typeof payload.exp === "number" && payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4) return false;
  const [scheme, iterationText, saltText, expectedText] = parts;
  if (scheme !== "pbkdf2-sha256") return false;
  const iterations = Number(iterationText);
  if (!Number.isInteger(iterations) || iterations < 100000) return false;
  if (!/^[A-Za-z0-9_-]+$/.test(saltText) || !/^[A-Za-z0-9_-]+$/.test(expectedText)) return false;
  try {
    const saltBytes = base64UrlDecode(saltText);
    const expected = base64UrlDecode(expectedText);
    const actual = await derivePbkdf2(password, saltBytes, iterations, expected.length);
    return equalBytes(actual, expected);
  } catch (error) {
    console.error("password_verify_crypto_failed", error instanceof Error ? error.name : "Error");
    return false;
  }
}

export async function sha256(value: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
  return Array.from(digest).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
