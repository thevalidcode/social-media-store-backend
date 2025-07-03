import { pool } from "../config/db";

async function createCurrenciesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS currencies (
      id SERIAL PRIMARY KEY,
      uid TEXT UNIQUE NOT NULL,
      timestamp TIMESTAMP DEFAULT NOW(),
      quotes JSONB NOT NULL
    );
  `);

  const res = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'currencies';
  `);

  const existingCols = res.rows.map((row) => row.column_name);

  const expected: Record<string, string> = {
    id: "ALTER TABLE currencies ADD COLUMN id SERIAL PRIMARY KEY",
    uid: "ALTER TABLE currencies ADD COLUMN uid TEXT UNIQUE NOT NULL",
    timestamp:
      "ALTER TABLE currencies ADD COLUMN timestamp TIMESTAMP DEFAULT NOW()",
    quotes: "ALTER TABLE currencies ADD COLUMN quotes JSONB NOT NULL",
  };

  for (const [col, sql] of Object.entries(expected)) {
    if (!existingCols.includes(col)) {
      await pool.query(sql);
    }
  }
}

export default createCurrenciesTable;
