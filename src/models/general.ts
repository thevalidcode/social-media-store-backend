import { pool } from "../config/db";

async function createDesignStylesTable() {
  await pool.query(`
  CREATE TABLE IF NOT EXISTS general (
    id INTEGER NOT NULL,
    uid TEXT PRIMARY KEY,
    store_id INTEGER NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Store',
    logo_url TEXT DEFAULT 'https://validpanel.com/assets/ValidPanel-CLfY079M.png',
    favicon_url TEXT DEFAULT 'https://validpanel.com/assets/ValidPanel-CLfY079M.png',
    default_client_currency TEXT
  );
`);

  const res = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'general';
  `);

  const existingCols = res.rows.map((row) => row.column_name);

  const expected: Record<string, string> = {
    id: "ALTER TABLE general ADD COLUMN id INTEGER NOT NULL",
    uid: "ALTER TABLE general ADD COLUMN uid TEXT PRIMARY KEY",
    store_id:
      "ALTER TABLE general ADD COLUMN store_id INTEGER NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE",
    title: `ALTER TABLE general ADD COLUMN title TEXT NOT NULL DEFAULT 'Store'`,
    logo_url: `ALTER TABLE general ADD COLUMN logo_url TEXT DEFAULT 'https://validpanel.com/assets/ValidPanel-CLfY079M.png'`,
    favicon_url: `ALTER TABLE general ADD COLUMN favicon_url TEXT DEFAULT 'https://validpanel.com/assets/ValidPanel-CLfY079M.png'`,
    default_client_currency:
      "ALTER TABLE general ADD COLUMN default_client_currency TEXT",
  };

  for (const [col, sql] of Object.entries(expected)) {
    if (!existingCols.includes(col)) {
      await pool.query(sql);
    }
  }
}

export default createDesignStylesTable;
