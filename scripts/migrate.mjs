import { Pool, neonConfig } from "@neondatabase/serverless";
import WebSocket from "ws";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

neonConfig.webSocketConstructor = WebSocket;

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");
const pool = new Pool({ connectionString: url });
const client = await pool.connect();
try {
  await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (filename text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);
  const dir = resolve("db/migrations");
  const files = (await readdir(dir)).filter((name) => /^\d+_.*\.sql$/.test(name)).sort();
  for (const filename of files) {
    const applied = await client.query("SELECT 1 FROM schema_migrations WHERE filename = $1", [filename]);
    if (applied.rowCount) { console.log(`skip ${filename}`); continue; }
    const rawSql = await readFile(resolve(dir, filename), "utf8");
    // Migration files are human-readable and may include their own BEGIN/COMMIT markers.
    // The runner owns the transaction so schema_migrations is committed atomically with the schema change.
    const sql = rawSql
      .replace(/^\s*BEGIN;\s*/i, "")
      .replace(/\s*COMMIT;\s*$/i, "");
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations(filename) VALUES($1)", [filename]);
      await client.query("COMMIT");
      console.log(`applied ${filename}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
} finally {
  client.release();
  await pool.end();
}
