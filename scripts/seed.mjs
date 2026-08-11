import { Pool, neonConfig } from "@neondatabase/serverless";
import WebSocket from "ws";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

neonConfig.webSocketConstructor = WebSocket;

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

// Production-safe seed only. User accounts are created separately with `npm run admin:create`.
const foundationalSeeds = [
  "departments.sql",
  "roles.sql",
  "permissions.sql",
  "role_permissions.sql",
];

const pool = new Pool({ connectionString: url });
const client = await pool.connect();
try {
  for (const filename of foundationalSeeds) {
    const sql = await readFile(resolve("db/seeds", filename), "utf8");
    await client.query(sql);
    console.log(`seeded ${filename}`);
  }
} finally {
  client.release();
  await pool.end();
}
