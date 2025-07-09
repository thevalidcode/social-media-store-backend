import { pool } from "../config/db";

async function createAffiliateSettingsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS affiliate_settings (
      id INTEGER NOT NULL,
      uid TEXT PRIMARY KEY,
      percent INTEGER NOT NULL,
      mode TEXT NOT NULL CHECK (mode IN ('fixed', 'percentage')) DEFAULT 'percentage',
      store_id INTEGER NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE
    );
  `);

  const res = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'affiliate_settings';
  `);

  const existingCols = res.rows.map((row) => row.column_name);

  const expected: Record<string, string> = {
    id: "ALTER TABLE affiliate_settings ADD COLUMN id INTEGER NOT NULL",
    uid: "ALTER TABLE affiliate_settings ADD COLUMN uid TEXT PRIMARY KEY",
    percent:
      "ALTER TABLE affiliate_settings ADD COLUMN percent INTEGER NOT NULL",
    mode: "ALTER TABLE affiliate_settings ADD COLUMN mode TEXT NOT NULL CHECK (mode IN ('fixed', 'percentage')) DEFAULT 'percentage'",
    store_id:
      "ALTER TABLE affiliate_settings ADD COLUMN store_id INTEGER NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE",
  };

  for (const [col, sql] of Object.entries(expected)) {
    if (!existingCols.includes(col)) {
      await pool.query(sql);
    }
  }
}

export default createAffiliateSettingsTable;
