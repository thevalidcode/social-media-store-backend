import createPanelsTable from "./panels";
import createProvidersTable from "./providers";
import createCategoriesTable from "./categories";
import createUserTable from "./user";
import createServiceTable from "./service";
import createDesignStylesTable from "./design_styles";
import createCurrenciesTable from "./currencies";
import createAdminTable from "./admin";

(async (): Promise<void> => {
  try {
    await createPanelsTable();
    await createProvidersTable();
    await createCategoriesTable();
    await createUserTable();
    await createAdminTable();
    await createServiceTable();
    await createDesignStylesTable();
    await createCurrenciesTable();

    console.log("Tables created successfully.");
    process.exit(0);
  } catch (err: any) {
    console.error("Failed to create tables:", err?.message || err);
    process.exit(1);
  }
})();
