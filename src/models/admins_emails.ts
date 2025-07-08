import { pool } from "../config/db";

async function createAdminEmailsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins_emails (
      id INTEGER NOT NULL,
      uid TEXT PRIMARY KEY,
      emails TEXT[] NOT NULL,
      store_id INTEGER NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  const res = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'admins_emails';
  `);

  const existingCols = res.rows.map((row) => row.column_name);

  const expected: Record<string, string> = {
    id: `ALTER TABLE admins_emails ADD COLUMN id SERIAL NOT NULL`,
    uid: `ALTER TABLE admins_emails ADD COLUMN uid TEXT PRIMARY KEY`,
    emails: `ALTER TABLE admins_emails ADD COLUMN emails TEXT[] NOT NULL`,
    store_id: `ALTER TABLE admins_emails ADD COLUMN store_id INTEGER NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE`,
    timestamp: `ALTER TABLE admins_emails ADD COLUMN timestamp TIMESTAMP NOT NULL DEFAULT NOW()`,
  };

  for (const [col, sql] of Object.entries(expected)) {
    if (!existingCols.includes(col)) {
      await pool.query(sql);
    }
  }
}

export default createAdminEmailsTable;
