import pool from "../db.js";

async function createUserTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY
    );
  `);

  const res = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'users';
  `);
  const existingCols = res.rows.map((row) => row.column_name);

  const expected = {
    email: "ALTER TABLE users ADD COLUMN email TEXT UNIQUE NOT NULL",
    password: "ALTER TABLE users ADD COLUMN password TEXT NOT NULL",
    created_at:
      "ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT NOW()",
  };

  for (const [col, sql] of Object.entries(expected)) {
    if (!existingCols.includes(col)) {
      await pool.query(sql);
    }
  }
}

export default createUserTable;
