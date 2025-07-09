import { pool } from "../config/db";

async function createUserTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER NOT NULL,
      ref_code INTEGER GENERATED ALWAYS AS IDENTITY UNIQUE,
      uid TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      image TEXT,
      password TEXT NOT NULL,
      username TEXT NOT NULL,
      api_key TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      status TEXT NOT NULL DEFAULT 'active',
      store_id INTEGER NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
      balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
      spent NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
      last_seen TIMESTAMP NOT NULL DEFAULT NOW(),
      currency TEXT NOT NULL DEFAULT 'USD',
      ref INTEGER REFERENCES users(ref_code) ON DELETE SET NULL
    );
`);

  const res = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'users';
  `);

  const existingCols = res.rows.map((row) => row.column_name);

  const expected: Record<string, string> = {
    id: `ALTER TABLE users ADD COLUMN id INTEGER NOT NULL`,
    ref_code: `ALTER TABLE users ADD COLUMN ref_code INTEGER GENERATED ALWAYS AS IDENTITY UNIQUE`,
    uid: `ALTER TABLE users ADD COLUMN uid TEXT PRIMARY KEY`,
    email: `ALTER TABLE users ADD COLUMN email TEXT NOT NULL`,
    image: `ALTER TABLE users ADD COLUMN image TEXT`,
    password: `ALTER TABLE users ADD COLUMN password TEXT NOT NULL`,
    username: `ALTER TABLE users ADD COLUMN username TEXT NOT NULL`,
    api_key: `ALTER TABLE users ADD COLUMN api_key TEXT UNIQUE NOT NULL`,
    role: `ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'`,
    status: `ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active'`,
    store_id: `ALTER TABLE users ADD COLUMN store_id INTEGER NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE`,
    balance: `ALTER TABLE users ADD COLUMN balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00`,
    spent: `ALTER TABLE users ADD COLUMN spent NUMERIC(10, 2) NOT NULL DEFAULT 0.00`,
    timestamp: `ALTER TABLE users ADD COLUMN timestamp TIMESTAMP NOT NULL DEFAULT NOW()`,
    last_seen: `ALTER TABLE users ADD COLUMN last_seen TIMESTAMP NOT NULL DEFAULT NOW()`,
    currency: `ALTER TABLE users ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD'`,
    ref: `ALTER TABLE users ADD COLUMN ref INTEGER REFERENCES users(ref_code) ON DELETE SET NULL`,
  };

  for (const [col, sql] of Object.entries(expected)) {
    if (!existingCols.includes(col)) {
      await pool.query(sql);
    }
  }
}

export default createUserTable;
