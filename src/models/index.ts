import createStoresTable from "./stores";
import createProvidersTable from "./providers";
import createCategoriesTable from "./categories";
import createUserTable from "./user";
import createServiceTable from "./service";
import createDesignStylesTable from "./design_styles";
import createCurrenciesTable from "./currencies";
import createOrdersTable from "./orders";
import createAdminTable from "./admin";
import createRefillTable from "./refill";
import createAffiliateSettingsTable from "./affiliate_settings";

(async (): Promise<void> => {
  try {
    await createStoresTable();
    await createProvidersTable();
    await createCategoriesTable();
    await createUserTable();
    await createAffiliateSettingsTable();
    await createRefillTable();
    await createAdminTable();
    await createServiceTable();
    await createDesignStylesTable();
    await createOrdersTable();
    await createCurrenciesTable();

    console.log("Tables created successfully.");
    process.exit(0);
  } catch (err: any) {
    console.error("Failed to create tables:", err?.message || err);
    process.exit(1);
  }
})();
