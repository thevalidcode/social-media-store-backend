import createUserTable from "./user";
import createServiceTable from "./service";

/**
 * Initializes database table creation scripts.
 */
(async (): Promise<void> => {
  try {
    await createUserTable();
    await createServiceTable();

    console.log("✅ Tables created successfully.");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Failed to create tables:", err?.message || err);
    process.exit(1);
  }
})();
