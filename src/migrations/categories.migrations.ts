import { pool } from "../config/db";

async function createCategoriesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER NOT NULL,
      name TEXT NOT NULL,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
      status TEXT NOT NULL DEFAULT 'active',
      description TEXT NOT NULL DEFAULT '',
      position INTEGER NOT NULL,
      uid TEXT PRIMARY KEY,
      store_id INTEGER NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE
    );
  `);

  const res = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'categories';
  `);

  const existingCols = res.rows.map((row) => row.column_name);

  const expected: Record<string, string> = {
    id: `ALTER TABLE categories ADD COLUMN id INTEGER NOT NULL`,
    name: `ALTER TABLE categories ADD COLUMN name TEXT NOT NULL`,
    timestamp: `ALTER TABLE categories ADD COLUMN timestamp TIMESTAMP NOT NULL DEFAULT NOW()`,
    status: `ALTER TABLE categories ADD COLUMN status TEXT  NOT NULL  DEFAULT 'active'`,
    description: `ALTER TABLE categories ADD COLUMN description TEXT NOT NULL DEFAULT ''`,
    position: `ALTER TABLE categories ADD COLUMN position INTEGER NOT NULL`,
    uid: `ALTER TABLE categories ADD COLUMN uid TEXT PRIMARY KEY`,
    store_id: `ALTER TABLE categories ADD COLUMN store_id INTEGER NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE`,
  };

  for (const [col, sql] of Object.entries(expected)) {
    if (!existingCols.includes(col)) {
      await pool.query(sql);
    }
  }
}

export default createCategoriesTable;
