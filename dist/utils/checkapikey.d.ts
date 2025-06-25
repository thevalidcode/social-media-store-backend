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
declare const checkApiKey: (api_key: string) => Promise<ApiKeyCheckResponse>;
/**
 * Checks if the provided API key belongs to an admin of a specific panel.
 *
 * @param api_key - The API key to check.
 * @param panel_id - The panel ID context.
 * @returns Result object with adminData or error.
 */
declare const checkAdminApiKey: (api_key: string, panel_id: number) => Promise<ApiKeyCheckResponse>;
/**
 * Checks if an API key belongs to either a user or admin in a panel.
 *
 * @param api_key - The API key to check.
 * @param panel_id - The panel ID context.
 * @returns Result object with userData or adminData, or error.
 */
declare const checkKey: (api_key: string, panel_id: number) => Promise<ApiKeyCheckResponse>;
export { checkApiKey, checkAdminApiKey, checkKey };
