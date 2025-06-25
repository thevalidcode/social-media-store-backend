"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
async function createStylesTable() {
    await db_1.pool.query(`
    CREATE TABLE IF NOT EXISTS styles (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      hex TEXT NOT NULL,
      schema JSONB NOT NULL
    );
  `);
    const res = await db_1.pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'styles';
  `);
    const existingCols = res.rows.map((row) => row.column_name);
    const expected = {
        title: "ALTER TABLE styles ADD COLUMN title TEXT NOT NULL",
        hex: "ALTER TABLE styles ADD COLUMN hex TEXT NOT NULL",
        schema: "ALTER TABLE styles ADD COLUMN schema JSONB NOT NULL",
    };
    for (const [col, sql] of Object.entries(expected)) {
        if (!existingCols.includes(col)) {
            await db_1.pool.query(sql);
        }
    }
}
exports.default = createStylesTable;
