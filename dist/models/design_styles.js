"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
async function createDesignStylesTable() {
    await db_1.pool.query(`
    CREATE TABLE IF NOT EXISTS design_styles (
      id INTEGER NOT NULL,
      uid TEXT PRIMARY KEY,
      panel_id INTEGER NOT NULL REFERENCES panels(panel_id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      hex TEXT NOT NULL,
      schema JSONB NOT NULL
    );
  `);
    const res = await db_1.pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'design_styles';
  `);
    const existingCols = res.rows.map((row) => row.column_name);
    const expected = {
        id: "ALTER TABLE design_styles ADD COLUMN id INTEGER NOT NULL",
        uid: "ALTER TABLE design_styles ADD COLUMN uid TEXT PRIMARY KEY",
        panel_id: "ALTER TABLE design_styles ADD COLUMN panel_id INTEGER NOT NULL REFERENCES panels(panel_id) ON DELETE CASCADE",
        title: "ALTER TABLE design_styles ADD COLUMN title TEXT NOT NULL",
        hex: "ALTER TABLE design_styles ADD COLUMN hex TEXT NOT NULL",
        schema: "ALTER TABLE design_styles ADD COLUMN schema JSONB NOT NULL",
    };
    for (const [col, sql] of Object.entries(expected)) {
        if (!existingCols.includes(col)) {
            await db_1.pool.query(sql);
        }
    }
}
exports.default = createDesignStylesTable;
