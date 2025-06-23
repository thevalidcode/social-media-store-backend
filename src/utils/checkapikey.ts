import { getDocs } from "../crud";
import { vsp_pool } from "../config/db";

/**
 * Response format for API key checks.
 */
interface ApiKeyCheckResponse {
  message?: string;
  error?: string;
  userData?: Record<string, any>;
  adminData?: Record<string, any>;
}

/**
 * Checks if a global API key exists in the 'users' table in PostgreSQL.
 *
 * @param api_key - The API key to validate.
 * @returns Result object with userData or error.
 */
const checkApiKey = async (api_key: string): Promise<ApiKeyCheckResponse> => {
  try {
    const query = `SELECT * FROM users WHERE api_key = $1 LIMIT 1`;
    const result = await vsp_pool.query(query, [api_key]);

    if (result.rowCount === 1) {
      return { message: "API key is valid.", userData: result.rows[0] };
    }

    return { error: "Invalid API key." };
  } catch {
    return { error: "Invalid API key." };
  }
};

/**
 * Checks if the provided API key belongs to an admin of a specific panel.
 *
 * @param api_key - The API key to check.
 * @param panel_id - The panel ID context.
 * @returns Result object with adminData or error.
 */
const checkAdminApiKey = async (
  api_key: string,
  panel_id: number
): Promise<ApiKeyCheckResponse> => {
  try {
    const allAdmins = await getDocs("admins", panel_id);
    const adminData = allAdmins.find((admin: any) => admin.api_key === api_key);

    if (adminData) {
      return { message: "API key is valid.", adminData };
    }

    return { error: "Invalid API key." };
  } catch {
    return { error: "An error occurred while checking the API key." };
  }
};

/**
 * Checks if an API key belongs to either a user or admin in a panel.
 *
 * @param api_key - The API key to check.
 * @param panel_id - The panel ID context.
 * @returns Result object with userData or adminData, or error.
 */
const checkKey = async (
  api_key: string,
  panel_id: number
): Promise<ApiKeyCheckResponse> => {
  try {
    const allAdmins = await getDocs("admins", panel_id);
    const allUsers = await getDocs("users", panel_id);

    const adminData = allAdmins.find((admin: any) => admin.api_key === api_key);
    const userData = allUsers.find((user: any) => user.api_key === api_key);

    if (userData || adminData) {
      return {
        message: "API key is valid.",
        ...(userData ? { userData } : { adminData }),
      };
    }

    return { error: "Invalid API key." };
  } catch (error: any) {
    return { error: error.message || "An unknown error occurred." };
  }
};

export { checkApiKey, checkAdminApiKey, checkKey };
