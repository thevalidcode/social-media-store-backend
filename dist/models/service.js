"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
async function createServiceTable() {
    await db_1.pool.query(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER NOT NULL,
      uid TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'Default',
      min INTEGER NOT NULL DEFAULT 1,
      max INTEGER NOT NULL DEFAULT 1,
      position INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'active',
      provider_id INTEGER,
      provider_price NUMERIC(10, 2),
      panel_id INTEGER NOT NULL REFERENCES panels(panel_id) ON DELETE CASCADE,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
      sync_quantity BOOLEAN DEFAULT TRUE,
      sync_cat_and_name BOOLEAN DEFAULT TRUE,
      cancel BOOLEAN,
      network TEXT,
      refill BOOLEAN,
      percentage REAL,
      drip_feed BOOLEAN DEFAULT FALSE,
      provider TEXT,
      provider_currency TEXT,
      refill_days INTEGER,
      price NUMERIC(10, 2) NOT NULL DEFAULT 0.00
    );
  `);
    const res = await db_1.pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'services';
  `);
    const existingCols = res.rows.map((row) => row.column_name);
    const expected = {
        id: `ALTER TABLE services ADD COLUMN id INTEGER NOT NULL`,
        uid: `ALTER TABLE services ADD COLUMN uid TEXT PRIMARY KEY`,
        name: `ALTER TABLE services ADD COLUMN name TEXT NOT NULL`,
        description: `ALTER TABLE services ADD COLUMN description TEXT`,
        category: `ALTER TABLE services ADD COLUMN category TEXT NOT NULL`,
        type: `ALTER TABLE services ADD COLUMN type TEXT NOT NULL DEFAULT 'Default'`,
        min: `ALTER TABLE services ADD COLUMN min INTEGER NOT NULL DEFAULT 1`,
        max: `ALTER TABLE services ADD COLUMN max INTEGER NOT NULL DEFAULT 1`,
        position: `ALTER TABLE services ADD COLUMN position INTEGER NOT NULL DEFAULT 1`,
        status: `ALTER TABLE services ADD COLUMN status TEXT NOT NULL DEFAULT 'active'`,
        provider_id: `ALTER TABLE services ADD COLUMN provider_id INTEGER`,
        provider_price: `ALTER TABLE services ADD COLUMN provider_price NUMERIC(10, 2)`,
        panel_id: `ALTER TABLE services ADD COLUMN panel_id INTEGER NOT NULL REFERENCES panels(panel_id) ON DELETE CASCADE`,
        timestamp: `ALTER TABLE services ADD COLUMN timestamp TIMESTAMP NOT NULL DEFAULT NOW()`,
        sync_quantity: `ALTER TABLE services ADD COLUMN sync_quantity BOOLEAN DEFAULT TRUE`,
        sync_cat_and_name: `ALTER TABLE services ADD COLUMN sync_cat_and_name BOOLEAN DEFAULT TRUE`,
        cancel: `ALTER TABLE services ADD COLUMN cancel BOOLEAN`,
        network: `ALTER TABLE services ADD COLUMN network TEXT`,
        refill: `ALTER TABLE services ADD COLUMN refill BOOLEAN`,
        percentage: `ALTER TABLE services ADD COLUMN percentage REAL`,
        drip_feed: `ALTER TABLE services ADD COLUMN drip_feed BOOLEAN DEFAULT FALSE`,
        provider: `ALTER TABLE services ADD COLUMN provider TEXT`,
        provider_currency: `ALTER TABLE services ADD COLUMN provider_currency TEXT`,
        refill_days: `ALTER TABLE services ADD COLUMN refill_days INTEGER`,
        price: `ALTER TABLE services ADD COLUMN price NUMERIC(10, 2) NOT NULL DEFAULT 0.00`,
    };
    for (const [col, sql] of Object.entries(expected)) {
        if (!existingCols.includes(col)) {
            await db_1.pool.query(sql);
        }
    }
}
exports.default = createServiceTable;
