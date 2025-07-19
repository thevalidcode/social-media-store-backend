import createStoresTable from "./stores.migrations";
import createProvidersTable from "./providers.migrations";
import createCategoriesTable from "./categories.migrations";
import createUserTable from "./user.migrations";
import createServiceTable from "./service.migrations";
import createDesignStylesTable from "./design_styles.migrations";
import createCurrenciesTable from "./currencies.migrations";
import createEmailTemplatesTable from "./email_templates.migrations";
import createOrdersTable from "./orders.migrations";
import createAdminTable from "./admin.migrations";
import createRefillTable from "./refill.migrations";
import createAdminEmailsTable from "./admins_emails.migrations";
import createEmailLogsTable from "./email_logs.migrations";
import createGeneralTable from "./general.migrations";
import createBlogsTable from "./blogs.migrations";
import createUploadLogsTable from "./upload_logs.migrations";
import createFAQsTable from "./faqs.migrations";
import createAffiliateSettingsTable from "./affiliate_settings.migrations";

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
