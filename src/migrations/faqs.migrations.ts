import { pool } from "../config/db";

async function createFAQsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      position INTEGER NOT NULL,
      uid TEXT PRIMARY KEY,
      store_id INTEGER NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  const res = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'faqs';
  `);

  const existingCols = res.rows.map((row) => row.column_name);

  const expected: Record<string, string> = {
    id: `ALTER TABLE faqs ADD COLUMN id INTEGER NOT NULL`,
    question: `ALTER TABLE faqs ADD COLUMN question TEXT NOT NULL`,
    answer: `ALTER TABLE faqs ADD COLUMN answer TEXT NOT NULL`,
    status: `ALTER TABLE faqs ADD COLUMN status TEXT NOT NULL DEFAULT 'active'`,
    position: `ALTER TABLE faqs ADD COLUMN position INTEGER NOT NULL`,
    uid: `ALTER TABLE faqs ADD COLUMN uid TEXT PRIMARY KEY`,
    store_id: `ALTER TABLE faqs ADD COLUMN store_id INTEGER NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE`,
    timestamp: `ALTER TABLE faqs ADD COLUMN timestamp TIMESTAMP NOT NULL DEFAULT NOW()`,
  };

  for (const [col, sql] of Object.entries(expected)) {
    if (!existingCols.includes(col)) {
      await pool.query(sql);
    }
  }
}

export default createFAQsTable;
