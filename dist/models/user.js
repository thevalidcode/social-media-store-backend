"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
async function createUserTable() {
    await db_1.pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER NOT NULL,
      ref_code INTEGER GENERATED ALWAYS AS IDENTITY UNIQUE,
      uid TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      username TEXT NOT NULL,
      api_key TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'Online',
      panel_id INTEGER NOT NULL REFERENCES panels(panel_id) ON DELETE CASCADE,
      balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
      spent NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
      last_seen TIMESTAMP NOT NULL DEFAULT NOW(),
      currency TEXT NOT NULL DEFAULT 'USD',
      ref INTEGER REFERENCES users(ref_code) ON DELETE SET NULL
    );
`);
    const res = await db_1.pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'users';
  `);
    const existingCols = res.rows.map((row) => row.column_name);
    const expected = {
        id: `ALTER TABLE users ADD COLUMN id INTEGER NOT NULL`,
        ref_code: `ALTER TABLE users ADD COLUMN ref_code INTEGER GENERATED ALWAYS AS IDENTITY UNIQUE`,
        uid: `ALTER TABLE users ADD COLUMN uid TEXT PRIMARY KEY`,
        email: `ALTER TABLE users ADD COLUMN email TEXT NOT NULL`,
        password: `ALTER TABLE users ADD COLUMN password TEXT NOT NULL`,
        username: `ALTER TABLE users ADD COLUMN username TEXT NOT NULL`,
        api_key: `ALTER TABLE users ADD COLUMN api_key TEXT UNIQUE NOT NULL`,
        status: `ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'Online'`,
        panel_id: `ALTER TABLE users ADD COLUMN panel_id INTEGER NOT NULL REFERENCES panels(panel_id) ON DELETE CASCADE`,
        balance: `ALTER TABLE users ADD COLUMN balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00`,
        spent: `ALTER TABLE users ADD COLUMN spent NUMERIC(10, 2) NOT NULL DEFAULT 0.00`,
        timestamp: `ALTER TABLE users ADD COLUMN timestamp TIMESTAMP NOT NULL DEFAULT NOW()`,
        last_seen: `ALTER TABLE users ADD COLUMN last_seen TIMESTAMP NOT NULL DEFAULT NOW()`,
        currency: `ALTER TABLE users ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD'`,
        ref: `ALTER TABLE users ADD COLUMN ref INTEGER REFERENCES users(ref_code) ON DELETE SET NULL`,
    };
    for (const [col, sql] of Object.entries(expected)) {
        if (!existingCols.includes(col)) {
            await db_1.pool.query(sql);
        }
    }
}
exports.default = createUserTable;
