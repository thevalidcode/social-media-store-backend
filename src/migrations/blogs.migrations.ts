import { pool } from "../config/db";

async function createBlogsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS blogs (
      id INTEGER NOT NULL,
      title TEXT NOT NULL,
      cover_image TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      position INTEGER NOT NULL,
      uid TEXT PRIMARY KEY,
      store_id INTEGER NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  const res = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'blogs';
  `);

  const existingCols = res.rows.map((row) => row.column_name);

  const expected: Record<string, string> = {
    id: `ALTER TABLE blogs ADD COLUMN id INTEGER NOT NULL`,
    title: `ALTER TABLE blogs ADD COLUMN title TEXT NOT NULL`,
    content: `ALTER TABLE blogs ADD COLUMN content TEXT NOT NULL`,
    cover_image: `ALTER TABLE blogs ADD COLUMN cover_image TEXT NOT NULL DEFAULT ''`,
    description: `ALTER TABLE blogs ADD COLUMN description TEXT NOT NULL DEFAULT ''`,
    status: `ALTER TABLE blogs ADD COLUMN status TEXT NOT NULL DEFAULT 'active'`,
    position: `ALTER TABLE blogs ADD COLUMN position INTEGER NOT NULL`,
    uid: `ALTER TABLE blogs ADD COLUMN uid TEXT PRIMARY KEY`,
    store_id: `ALTER TABLE blogs ADD COLUMN store_id INTEGER NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE`,
    timestamp: `ALTER TABLE blogs ADD COLUMN timestamp TIMESTAMP NOT NULL DEFAULT NOW()`,
  };

  for (const [col, sql] of Object.entries(expected)) {
    if (!existingCols.includes(col)) {
      await pool.query(sql);
    }
  }
}

export default createBlogsTable;
