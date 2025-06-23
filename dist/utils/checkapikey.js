"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkKey = exports.checkAdminApiKey = exports.checkApiKey = void 0;
const crud_1 = require("../crud");
const db_1 = require("../config/db");
/**
 * Checks if a global API key exists in the 'users' table in PostgreSQL.
 *
 * @param api_key - The API key to validate.
 * @returns Result object with userData or error.
 */
const checkApiKey = async (api_key) => {
    try {
        const query = `SELECT * FROM users WHERE api_key = $1 LIMIT 1`;
        const result = await db_1.vsp_pool.query(query, [api_key]);
        if (result.rowCount === 1) {
            return { message: "API key is valid.", userData: result.rows[0] };
        }
        return { error: "Invalid API key." };
    }
    catch {
        return { error: "Invalid API key." };
    }
};
exports.checkApiKey = checkApiKey;
/**
 * Checks if the provided API key belongs to an admin of a specific panel.
 *
 * @param api_key - The API key to check.
 * @param panel_id - The panel ID context.
 * @returns Result object with adminData or error.
 */
const checkAdminApiKey = async (api_key, panel_id) => {
    try {
        const allAdmins = await (0, crud_1.getDocs)("admins", panel_id);
        const adminData = allAdmins.find((admin) => admin.api_key === api_key);
        if (adminData) {
            return { message: "API key is valid.", adminData };
        }
        return { error: "Invalid API key." };
    }
    catch {
        return { error: "An error occurred while checking the API key." };
    }
};
exports.checkAdminApiKey = checkAdminApiKey;
/**
 * Checks if an API key belongs to either a user or admin in a panel.
 *
 * @param api_key - The API key to check.
 * @param panel_id - The panel ID context.
 * @returns Result object with userData or adminData, or error.
 */
const checkKey = async (api_key, panel_id) => {
    try {
        const allAdmins = await (0, crud_1.getDocs)("admins", panel_id);
        const allUsers = await (0, crud_1.getDocs)("users", panel_id);
        const adminData = allAdmins.find((admin) => admin.api_key === api_key);
        const userData = allUsers.find((user) => user.api_key === api_key);
        if (userData || adminData) {
            return {
                message: "API key is valid.",
                ...(userData ? { userData } : { adminData }),
            };
        }
        return { error: "Invalid API key." };
    }
    catch (error) {
        return { error: error.message || "An unknown error occurred." };
    }
};
exports.checkKey = checkKey;
