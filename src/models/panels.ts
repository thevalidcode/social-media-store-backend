import { pool } from "../config/db";

async function createPanelsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS panels (
      panel_id SERIAL PRIMARY KEY,
      uid TEXT UNIQUE NOT NULL,
      ssl BOOLEAN NOT NULL DEFAULT false,
      plan TEXT NOT NULL DEFAULT 'starter',
      timestamp TIMESTAMP DEFAULT NOW()
    );
  `);

  const res = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'panels';
  `);

  const existingCols = res.rows.map((row) => row.column_name);

  const expected: Record<string, string> = {
    panel_id: `ALTER TABLE panels ADD COLUMN panel_id SERIAL PRIMARY KEY`,
    uid: `ALTER TABLE panels ADD COLUMN uid TEXT UNIQUE NOT NULL`,
    ssl: `ALTER TABLE panels ADD COLUMN ssl BOOLEAN NOT NULL DEFAULT false`,
    plan: `ALTER TABLE panels ADD COLUMN plan TEXT NOT NULL DEFAULT 'starter'`,
    timestamp: `ALTER TABLE panels ADD COLUMN timestamp TIMESTAMP DEFAULT NOW()`,
  };

  for (const [col, sql] of Object.entries(expected)) {
    if (!existingCols.includes(col)) {
      await pool.query(sql);
    }
  }
}

export default createPanelsTable;
