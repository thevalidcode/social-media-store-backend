import {  getDocs  } from '../crud.js';
import {  vsp_pool  } from '../db.js';

const checkapiKey = async (api_key) => {
  try {
    // Query users table to find user with matching api_key
    const query = `SELECT * FROM users WHERE api_key = $1 LIMIT 1`;
    const result = await vsp_pool.query(query, [api_key]);

    if (result.rowCount === 1) {
      return { message: "API key is valid.", userData: result.rows[0] };
    }

    return { error: "Invalid API Key" };
  } catch (error) {
    return { error: "Invalid API Key" };
  }
};

async function checkAdminApiKey(api_key, panel_id) {
  try {
    const allAdmins = await getDocs("admins", panel_id);
    const adminData = allAdmins.find((admin) => admin.api_key === api_key);
    if (adminData) {
      return { message: "API key is valid.", adminData: adminData };
    }
    return { error: "Invalid API key." };
  } catch (error) {
    return { error: "An error occurred while checking the API key." };
  }
}

async function checkKey(api_key, panel_id) {
  try {
    const allAdmins = await getDocs("admins", panel_id);
    const allUsers = await getDocs("users", panel_id);
    const adminData = allAdmins.find((admin) => admin.api_key === api_key);
    const userData = allUsers.find((user) => user.api_key === api_key);
    if (userData || adminData) {
      return {
        message: "API key is valid.",
        [userData ? "userData" : "adminData"]: userData || adminData,
      };
    }
    return { error: "Invalid API key." };
  } catch (error) {
    return { error: error.message };
  }
}

export {  checkapiKey, checkAdminApiKey, checkKey  };
