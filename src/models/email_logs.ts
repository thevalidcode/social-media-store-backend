import { pool } from "../config/db";

async function createEmailLogsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS email_logs (
      id INTEGER NOT NULL,
      uid TEXT PRIMARY KEY,
      sender TEXT NOT NULL,
      receiver TEXT NOT NULL,
      subject TEXT NOT NULL,
      html TEXT NOT NULL,
      status TEXT NOT NULL,
      message_id TEXT,
      response TEXT,
      store_id INTEGER NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  const res = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'email_logs';
  `);

  const existingCols = res.rows.map((row) => row.column_name);

  const expected: Record<string, string> = {
    id: `ALTER TABLE email_logs ADD COLUMN id SERIAL NOT NULL`,
    uid: `ALTER TABLE email_logs ADD COLUMN uid TEXT PRIMARY KEY`,
    sender: `ALTER TABLE email_logs ADD COLUMN sender TEXT NOT NULL`,
    receiver: `ALTER TABLE email_logs ADD COLUMN receiver TEXT NOT NULL`,
    subject: `ALTER TABLE email_logs ADD COLUMN subject TEXT NOT NULL`,
    html: `ALTER TABLE email_logs ADD COLUMN html TEXT NOT NULL`,
    status: `ALTER TABLE email_logs ADD COLUMN status TEXT NOT NULL`,
    response: `ALTER TABLE email_logs ADD COLUMN response TEXT`,
    message_id: `ALTER TABLE email_logs ADD COLUMN message_id TEXT`,
    store_id: `ALTER TABLE email_logs ADD COLUMN store_id INTEGER NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE`,
    timestamp: `ALTER TABLE email_logs ADD COLUMN timestamp TIMESTAMP NOT NULL DEFAULT NOW()`,
  };

  for (const [col, sql] of Object.entries(expected)) {
    if (!existingCols.includes(col)) {
      await pool.query(sql);
    }
  }
}

export default createEmailLogsTable;
