import { pool } from "../config/db";

async function createRefillsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS refills (
      id INTEGER NOT NULL,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
      uid TEXT PRIMARY KEY,
      user_uid TEXT NOT NULL,
      provider_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      provider_order_id INTEGER NOT NULL,
      provider TEXT NOT NULL,
      provider_error TEXT,
      store_id INTEGER NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE
    );
  `);

  const res = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'refills';
  `);

  const existingCols = res.rows.map((row) => row.column_name);

  const expected: Record<string, string> = {
    id: `ALTER TABLE refills ADD COLUMN id INTEGER NOT NULL`,
    timestamp: `ALTER TABLE refills ADD COLUMN timestamp TIMESTAMP NOT NULL DEFAULT NOW()`,
    uid: `ALTER TABLE refills ADD COLUMN uid TEXT PRIMARY KEY`,
    user_uid: `ALTER TABLE refills ADD COLUMN user_uid TEXT NOT NULL`,
    provider_id: `ALTER TABLE refills ADD COLUMN provider_id INTEGER NOT NULL`,
    status: `ALTER TABLE refills ADD COLUMN status TEXT NOT NULL DEFAULT 'Pending'`,
    provider_order_id: `ALTER TABLE refills ADD COLUMN provider_order_id INTEGER NOT NULL`,
    provider: `ALTER TABLE refills ADD COLUMN provider TEXT NOT NULL`,
    provider_error: `ALTER TABLE refills ADD COLUMN provider_error TEXT`,
    store_id: `ALTER TABLE refills ADD COLUMN store_id INTEGER NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE`,
  };

  for (const [col, sql] of Object.entries(expected)) {
    if (!existingCols.includes(col)) {
      await pool.query(sql);
    }
  }
}

export default createRefillsTable;
