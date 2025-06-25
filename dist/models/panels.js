"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
async function createPanelsTable() {
    await db_1.pool.query(`
    CREATE TABLE IF NOT EXISTS panels (
      panel_id SERIAL PRIMARY KEY,
      uid TEXT UNIQUE NOT NULL,
      ssl BOOLEAN NOT NULL DEFAULT false,
      plan TEXT NOT NULL DEFAULT 'starter',
      timestamp TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
    const res = await db_1.pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'panels';
  `);
    const existingCols = res.rows.map((row) => row.column_name);
    const expected = {
        panel_id: `ALTER TABLE panels ADD COLUMN panel_id SERIAL PRIMARY KEY`,
        uid: `ALTER TABLE panels ADD COLUMN uid TEXT UNIQUE NOT NULL`,
        ssl: `ALTER TABLE panels ADD COLUMN ssl BOOLEAN NOT NULL DEFAULT false`,
        plan: `ALTER TABLE panels ADD COLUMN plan TEXT NOT NULL DEFAULT 'starter'`,
        timestamp: `ALTER TABLE panels ADD COLUMN timestamp TIMESTAMP NOT NULL DEFAULT NOW()`,
    };
    for (const [col, sql] of Object.entries(expected)) {
        if (!existingCols.includes(col)) {
            await db_1.pool.query(sql);
        }
    }
}
exports.default = createPanelsTable;
