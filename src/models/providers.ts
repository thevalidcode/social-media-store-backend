import { pool } from "../config/db";

async function createProvidersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS providers (
      id INTEGER NOT NULL,
      uid TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      domain TEXT UNIQUE NOT NULL,
      sync BOOLEAN NOT NULL DEFAULT FALSE,
      percentage REAL DEFAULT 0,
      panel_id INTEGER REFERENCES panels(panel_id) ON DELETE CASCADE
    );
  `);

  const res = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'providers';
  `);

  const existingCols = res.rows.map((row) => row.column_name);

  const expected: Record<string, string> = {
    id: `ALTER TABLE providers ADD COLUMN id INTEGER NOT NULL`,
    uid: `ALTER TABLE providers ADD COLUMN uid TEXT PRIMARY KEY`,
    key: `ALTER TABLE providers ADD COLUMN key UNIQUE TEXT NOT NULL`,
    domain: `ALTER TABLE providers ADD COLUMN domain TEXT UNIQUE NOT NULL`,
    sync: `ALTER TABLE providers ADD COLUMN sync BOOLEAN NOT NULL DEFAULT FALSE`,
    percentage: `ALTER TABLE providers ADD COLUMN percentage REAL  DEFAULT 0`,
    panel_id: `ALTER TABLE providers ADD COLUMN panel_id INTEGER REFERENCES panels(panel_id) ON DELETE CASCADE`,
  };

  for (const [col, sql] of Object.entries(expected)) {
    if (!existingCols.includes(col)) {
      await pool.query(sql);
    }
  }
}

export default createProvidersTable;
