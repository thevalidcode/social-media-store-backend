import { pool } from "../config/db";

async function createUploadLogsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS upload_logs (
      store_id INTEGER NOT NULL,
      id SERIAL NOT NULL,
      uid TEXT PRIMARY KEY,
      size INTEGER NOT NULL,
      url TEXT NOT NULL,
      filename TEXT NOT NULL,
      mimetype TEXT NOT NULL,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  const res = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'upload_logs';
  `);

  const existingCols = res.rows.map((row) => row.column_name);

  const expected: Record<string, string> = {
    store_id: `ALTER TABLE upload_logs ADD COLUMN store_id INTEGER NOT NULL`,
    uid: `ALTER TABLE upload_logs ADD COLUMN uid TEXT PRIMARY KEY`,
    id: `ALTER TABLE upload_logs ADD COLUMN id SERIAL NOT NULL`,
    size: `ALTER TABLE upload_logs ADD COLUMN size INTEGER NOT NULL`,
    url: `ALTER TABLE upload_logs ADD COLUMN url TEXT NOT NULL`,
    filename: `ALTER TABLE upload_logs ADD COLUMN filename TEXT NOT NULL`,
    mimetype: `ALTER TABLE upload_logs ADD COLUMN mimetype TEXT NOT NULL`,
    timestamp: `ALTER TABLE upload_logs ADD COLUMN timestamp TIMESTAMP NOT NULL DEFAULT NOW()`,
  };

  for (const [col, sql] of Object.entries(expected)) {
    if (!existingCols.includes(col)) {
      await pool.query(sql);
    }
  }
}

export default createUploadLogsTable;
