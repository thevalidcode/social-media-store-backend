"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
async function createCurrenciesTable() {
    await db_1.pool.query(`
    CREATE TABLE IF NOT EXISTS currencies (
      id SERIAL PRIMARY KEY,
      uid TEXT UNIQUE NOT NULL,
      timestamp TIMESTAMP DEFAULT NOW(),
      quotes JSONB NOT NULL
    );
  `);
    const res = await db_1.pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'currencies';
  `);
    const existingCols = res.rows.map((row) => row.column_name);
    const expected = {
        id: "ALTER TABLE currencies ADD COLUMN id SERIAL PRIMARY KEY",
        uid: "ALTER TABLE currencies ADD COLUMN uid TEXT UNIQUE NOT NULL",
        timestamp: "ALTER TABLE currencies ADD COLUMN timestamp TIMESTAMP DEFAULT NOW()",
        quotes: "ALTER TABLE currencies ADD COLUMN quotes JSONB NOT NULL",
    };
    for (const [col, sql] of Object.entries(expected)) {
        if (!existingCols.includes(col)) {
            await db_1.pool.query(sql);
        }
    }
}
exports.default = createCurrenciesTable;
