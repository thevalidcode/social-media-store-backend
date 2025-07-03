import { pool } from "../config/db";

async function createRefillTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS refills (
      id INTEGER NOT NULL,
      uid TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'Pending',
      provider_id INTEGER NOT NULL,
      order_id INTEGER NOT NULL,
      provider TEXT NOT NULL,
      provider_error TEXT,
      url TEXT NOT NULL,
      panel_id INTEGER NOT NULL REFERENCES panels(panel_id) ON DELETE CASCADE,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  const res = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'refills';
  `);

  const existingCols = res.rows.map((row) => row.column_name);

  const expected: Record<string, string> = {
    id: `ALTER TABLE refills ADD COLUMN id SERIAL NOT NULL`,
    uid: `ALTER TABLE refills ADD COLUMN uid TEXT PRIMARY KEY`,
    status: `ALTER TABLE refills ADD COLUMN status TEXT NOT NULL DEFAULT 'Pending'`,
    provider_id: `ALTER TABLE refills ADD COLUMN provider_id INTEGER NOT NULL`,
    order_id: `ALTER TABLE refills ADD COLUMN order_id INTEGER NOT NULL`,
    provider: `ALTER TABLE refills ADD COLUMN provider TEXT NOT NULL`,
    provider_error: `ALTER TABLE refills ADD COLUMN provider_error TEXT`,
    url: `ALTER TABLE refills ADD COLUMN url TEXT NOT NULL`,
    panel_id: `ALTER TABLE refills ADD COLUMN panel_id INTEGER NOT NULL REFERENCES panels(panel_id) ON DELETE CASCADE`,
    timestamp: `ALTER TABLE refills ADD COLUMN timestamp TIMESTAMP NOT NULL DEFAULT NOW()`,
  };

  for (const [col, sql] of Object.entries(expected)) {
    if (!existingCols.includes(col)) {
      await pool.query(sql);
    }
  }
}

export default createRefillTable;
