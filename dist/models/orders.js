"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
async function createOrdersTable() {
    await db_1.pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER NOT NULL,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
      uid TEXT PRIMARY KEY,
      user_uid TEXT NOT NULL,
      service_id INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'Pending',
      sync_order BOOLEAN NOT NULL DEFAULT true,
      synced BOOLEAN NOT NULL DEFAULT false,
      provider_currency TEXT,
      provider_price NUMERIC(10, 2),
      provider_order_id INTEGER,
      provider TEXT,
      provider_error TEXT,
      quantity INTEGER NOT NULL,
      retry_count INTEGER,
      url TEXT NOT NULL,
      last_run_time TIMESTAMP,
      comments TEXT NOT NULL DEFAULT '',
      drip_feed BOOLEAN NOT NULL DEFAULT false,
      interval INTEGER DEFAULT 0,
      runs INTEGER DEFAULT 0,
      processed_runs INTEGER DEFAULT 0,
      start INTEGER NOT NULL DEFAULT 0,
      user_initial_balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
      user_final_balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
      price NUMERIC(10, 2) NOT NULL DEFAULT 0,
      remains INTEGER NOT NULL DEFAULT 0,
      panel_id INTEGER NOT NULL REFERENCES panels(panel_id) ON DELETE CASCADE
    );
  `);
    const res = await db_1.pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'orders';
  `);
    const existingCols = res.rows.map((row) => row.column_name);
    const expected = {
        id: `ALTER TABLE orders ADD COLUMN id INTEGER NOT NULL`,
        timestamp: `ALTER TABLE orders ADD COLUMN timestamp TIMESTAMP NOT NULL DEFAULT NOW()`,
        uid: `ALTER TABLE orders ADD COLUMN uid TEXT PRIMARY KEY`,
        user_uid: `ALTER TABLE orders ADD COLUMN user_uid TEXT NOT NULL`,
        service_id: `ALTER TABLE orders ADD COLUMN service_id INTEGER NOT NULL`,
        status: `ALTER TABLE orders ADD COLUMN status TEXT NOT NULL DEFAULT 'Pending'`,
        sync_order: `ALTER TABLE orders ADD COLUMN sync_order BOOLEAN NOT NULL DEFAULT`,
        synced: `ALTER TABLE orders ADD COLUMN synced BOOLEAN NOT NULL DEFAULT false`,
        currency: `ALTER TABLE orders ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD'`,
        provider_currency: `ALTER TABLE orders ADD COLUMN provider_currency TEXT`,
        provider_price: `ALTER TABLE orders ADD COLUMN provider_price NUMERIC(10, 2)`,
        provider_order_id: `ALTER TABLE orders ADD COLUMN provider_order_id INTEGER`,
        provider: `ALTER TABLE orders ADD COLUMN provider TEXT`,
        provider_error: `ALTER TABLE orders ADD COLUMN provider_error TEXT`,
        quantity: `ALTER TABLE orders ADD COLUMN quantity INTEGER NOT NULL`,
        retry_count: `ALTER TABLE orders ADD COLUMN retry_count INTEGER`,
        last_run_time: `ALTER TABLE orders ADD COLUMN last_run_time TIMESTAMP`,
        url: `ALTER TABLE orders ADD COLUMN url TEXT NOT NULL`,
        comments: `ALTER TABLE orders ADD COLUMN comments TEXT NOT NULL DEFAULT ''`,
        drip_feed: `ALTER TABLE orders ADD COLUMN drip_feed BOOLEAN NOT NULL DEFAULT false`,
        interval: `ALTER TABLE orders ADD COLUMN interval INTEGER DEFAULT 0`,
        runs: `ALTER TABLE orders ADD COLUMN runs INTEGER DEFAULT 0`,
        processed_runs: `ALTER TABLE orders ADD COLUMN processed_runs INTEGER DEFAULT 0`,
        start: `ALTER TABLE orders ADD COLUMN start INTEGER NOT NULL DEFAULT 0`,
        user_initial_balance: `ALTER TABLE orders ADD COLUMN user_initial_balance NUMERIC(10, 2) NOT NULL DEFAULT 0`,
        user_final_balance: `ALTER TABLE orders ADD COLUMN user_final_balance NUMERIC(10, 2) NOT NULL DEFAULT 0`,
        price: `ALTER TABLE orders ADD COLUMN price NUMERIC(10, 2) NOT NULL DEFAULT 0`,
        remains: `ALTER TABLE orders ADD COLUMN remains INTEGER NOT NULL DEFAULT 0`,
        panel_id: `ALTER TABLE orders ADD COLUMN panel_id INTEGER NOT NULL REFERENCES panels(panel_id) ON DELETE CASCADE`,
    };
    for (const [col, sql] of Object.entries(expected)) {
        if (!existingCols.includes(col)) {
            await db_1.pool.query(sql);
        }
    }
}
exports.default = createOrdersTable;
