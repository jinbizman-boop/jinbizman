import type { Env } from "../types";
import { getSql } from "../lib/db";
import { ok } from "../lib/response";

export async function healthRoute(env: Env): Promise<Response> {
  const sql = getSql(env);
  const rows = await sql`SELECT now() AS database_time`;
  return ok({ status: "ok", environment: env.APP_ENV, database: "connected", databaseTime: rows[0]?.database_time ?? null });
}
