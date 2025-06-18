import { Pool } from "pg";

const vsp_pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.VSP_DB_NAME,
  user: process.env.VSP_DB_USER,
  password: process.env.DB_PASSWORD,
});

const vp_pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.VP_DB_NAME,
  user: process.env.VP_DB_USER,
  password: process.env.DB_PASSWORD,
});

export { vsp_pool, vp_pool };
