import { neon } from "@neondatabase/serverless";
import type { Env } from "../types";

export type SqlClient = ReturnType<typeof neon>;

export function getSql(env: Env): SqlClient {
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  return neon(env.DATABASE_URL);
}
