export function asObject(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

export function text(value: unknown, maxLength: number, required = false): string | null {
  if (typeof value !== "string") return required ? null : "";
  const result = value.trim();
  if (required && !result) return null;
  if (result.length > maxLength) return null;
  return result;
}

export function email(value: unknown): string | null {
  const result = text(value, 320, true);
  if (!result) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result) ? result.toLowerCase() : null;
}

export function oneOf<T extends string>(value: unknown, values: readonly T[], fallback?: T): T | null {
  if (typeof value === "string" && values.includes(value as T)) return value as T;
  return fallback ?? null;
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;
  try {
    return asObject(await request.json());
  } catch {
    return null;
  }
}
