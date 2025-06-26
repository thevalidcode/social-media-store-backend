import { pool } from "../config/db";

async function createAdminTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL NOT NULL,
      uid TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      username TEXT NOT NULL,
      api_key TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'Online',
      panel_id INTEGER NOT NULL REFERENCES panels(panel_id) ON DELETE CASCADE,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
      last_seen TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  const res = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'admins';
  `);

  const existingCols = res.rows.map((row) => row.column_name);

  const expected: Record<string, string> = {
    id: `ALTER TABLE admins ADD COLUMN id SERIAL NOT NULL`,
    uid: `ALTER TABLE admins ADD COLUMN uid TEXT PRIMARY KEY`,
    email: `ALTER TABLE admins ADD COLUMN email TEXT NOT NULL`,
    password: `ALTER TABLE admins ADD COLUMN password TEXT NOT NULL`,
    username: `ALTER TABLE admins ADD COLUMN username TEXT NOT NULL`,
    api_key: `ALTER TABLE admins ADD COLUMN api_key TEXT UNIQUE NOT NULL`,
    status: `ALTER TABLE admins ADD COLUMN status TEXT NOT NULL DEFAULT 'Online'`,
    panel_id: `ALTER TABLE admins ADD COLUMN panel_id INTEGER NOT NULL REFERENCES panels(panel_id) ON DELETE CASCADE`,
    timestamp: `ALTER TABLE admins ADD COLUMN timestamp TIMESTAMP NOT NULL DEFAULT NOW()`,
    last_seen: `ALTER TABLE admins ADD COLUMN last_seen TIMESTAMP NOT NULL DEFAULT NOW()`,
  };

  for (const [col, sql] of Object.entries(expected)) {
    if (!existingCols.includes(col)) {
      await pool.query(sql);
    }
  }
}

export default createAdminTable;
