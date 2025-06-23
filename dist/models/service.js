"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
async function createServiceTable() {
    await db_1.vsp_pool.query(`
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY
    );
  `);
    const res = await db_1.vsp_pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'services';
  `);
    const existingCols = res.rows.map((row) => row.column_name);
    const expected = {
        name: "ALTER TABLE services ADD COLUMN name TEXT NOT NULL",
        price: "ALTER TABLE services ADD COLUMN price NUMERIC NOT NULL",
        status: "ALTER TABLE services ADD COLUMN status TEXT DEFAULT 'active'",
    };
    for (const [col, sql] of Object.entries(expected)) {
        if (!existingCols.includes(col)) {
            await db_1.vsp_pool.query(sql);
        }
    }
}
exports.default = createServiceTable;
