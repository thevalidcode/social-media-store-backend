"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vp_pool = exports.vsp_pool = void 0;
const pg_1 = require("pg");
const env_1 = require("./env");
const vsp_pool = new pg_1.Pool({
    host: env_1.env.DB_HOST,
    port: Number(env_1.env.DB_PORT),
    database: env_1.env.VSP_DB_NAME,
    user: env_1.env.VSP_DB_USER,
    password: env_1.env.DB_PASSWORD,
});
exports.vsp_pool = vsp_pool;
const vp_pool = new pg_1.Pool({
    host: env_1.env.DB_HOST,
    port: Number(env_1.env.DB_PORT),
    database: env_1.env.VP_DB_NAME,
    user: env_1.env.VP_DB_USER,
    password: env_1.env.DB_PASSWORD,
});
exports.vp_pool = vp_pool;
