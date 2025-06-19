import createUserTable from "./user.js";
import createServiceTable from "./service.js";

(async () => {
  try {
    await createUserTable();
    await createServiceTable();

    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to create tables:", err.message);
    process.exit(1);
  }
})();
