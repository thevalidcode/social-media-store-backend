import createStoresTable from "./stores";
import createProvidersTable from "./providers";
import createCategoriesTable from "./categories";
import createUserTable from "./user";
import createServiceTable from "./service";
import createDesignStylesTable from "./design_styles";
import createCurrenciesTable from "./currencies";
import createEmailTemplatesTable from "./email_templates";
import createOrdersTable from "./orders";
import createAdminTable from "./admin";
import createRefillTable from "./refill";
import createAdminEmailsTable from "./admins_emails";
import createEmailLogsTable from "./email_logs";
import createGeneralTable from "./general";
import createBlogsTable from "./blogs";
import createUploadLogsTable from "./upload_logs";
import createFAQsTable from "./faqs";
import createAffiliateSettingsTable from "./affiliate_settings";

(async (): Promise<void> => {
  try {
    await createStoresTable();
    await createProvidersTable();
    await createCategoriesTable();
    await createUserTable();
    await createAffiliateSettingsTable();
    await createGeneralTable();
    await createEmailLogsTable();
    await createAdminEmailsTable();
    await createRefillTable();
    await createAdminTable();
    await createServiceTable();
    await createDesignStylesTable();
    await createOrdersTable();
    await createEmailTemplatesTable();
    await createCurrenciesTable();
    await createFAQsTable();
    await createBlogsTable();
    await createUploadLogsTable();

    console.log("Tables created successfully.");
    process.exit(0);
  } catch (err: any) {
    console.error("Failed to create tables:", err?.message || err);
    process.exit(1);
  }
})();
