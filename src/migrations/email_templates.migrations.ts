import { pool } from "../config/db";

async function createEmailTemplatesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS email_templates (
      id INTEGER NOT NULL,
      uid TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      store_id INTEGER NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  const res = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'email_templates';
  `);

  const existingCols = res.rows.map((row) => row.column_name);

  const expected: Record<string, string> = {
    id: `ALTER TABLE email_templates ADD COLUMN id SERIAL NOT NULL`,
    uid: `ALTER TABLE email_templates ADD COLUMN uid TEXT PRIMARY KEY`,
    type: `ALTER TABLE email_templates ADD COLUMN type TEXT NOT NULL`,
    content: `ALTER TABLE email_templates ADD COLUMN content TEXT NOT NULL`,
    store_id: `ALTER TABLE email_templates ADD COLUMN store_id INTEGER NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE`,
    timestamp: `ALTER TABLE email_templates ADD COLUMN timestamp TIMESTAMP NOT NULL DEFAULT NOW()`,
  };

  for (const [col, sql] of Object.entries(expected)) {
    if (!existingCols.includes(col)) {
      await pool.query(sql);
    }
  }
}

export default createEmailTemplatesTable;
