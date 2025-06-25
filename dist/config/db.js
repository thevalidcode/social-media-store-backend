"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const env_1 = require("./env");
const pool = new pg_1.Pool({
    host: env_1.env.DB_HOST,
    port: Number(env_1.env.DB_PORT),
    database: env_1.env.DB_NAME,
    user: env_1.env.DB_USER,
    password: env_1.env.DB_PASSWORD,
});
exports.pool = pool;
