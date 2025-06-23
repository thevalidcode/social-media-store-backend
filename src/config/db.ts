import { Pool } from "pg";
import { env } from "./env";

const vsp_pool = new Pool({
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  database: env.VSP_DB_NAME,
  user: env.VSP_DB_USER,
  password: env.DB_PASSWORD,
});

const vp_pool = new Pool({
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  database: env.VP_DB_NAME,
  user: env.VP_DB_USER,
  password: env.DB_PASSWORD,
});

export { vsp_pool, vp_pool };
