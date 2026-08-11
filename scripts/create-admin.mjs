import { Pool, neonConfig } from "@neondatabase/serverless";
import WebSocket from "ws";
import { pbkdf2Sync, randomBytes } from "node:crypto";

neonConfig.webSocketConstructor = WebSocket;

const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = "JINBIZ Admin" } = process.env;
if (!DATABASE_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error("DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD are required");
if (ADMIN_PASSWORD.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters");
const iterations = 210000;
const salt = randomBytes(18);
const hash = pbkdf2Sync(ADMIN_PASSWORD, salt, iterations, 32, "sha256");
const b64u = (buffer) => buffer.toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
const passwordHash = `pbkdf2-sha256$${iterations}$${b64u(salt)}$${b64u(hash)}`;
const pool = new Pool({ connectionString: DATABASE_URL });
const client = await pool.connect();
try {
  await client.query("BEGIN");
  const result = await client.query(`
    INSERT INTO users(email, password_hash, name, status)
    VALUES($1,$2,$3,'active')
    ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash, name=EXCLUDED.name, status='active', updated_at=now()
    RETURNING id
  `,[ADMIN_EMAIL.toLowerCase(),passwordHash,ADMIN_NAME]);
  await client.query(`INSERT INTO user_roles(user_id, role_id)
    SELECT $1, r.id FROM roles r WHERE r.code='super_admin'
    ON CONFLICT(user_id, role_id) DO NOTHING`,[result.rows[0].id]);
  await client.query("COMMIT");
  console.log(`Admin ready: ${ADMIN_EMAIL}`);
} catch(error) {
  await client.query("ROLLBACK"); throw error;
} finally {
  client.release(); await pool.end();
}
