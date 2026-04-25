import { CreateStore } from "../services/store";

if (require.main === module) {
  (async () => {
    const result = await CreateStore({
      name: "Valid Test Store",
      storeDomain: "localhost:3000",
      adminUid: "kfnrhbfr-frf-rfmrk-bfjbv8-y4b474b98-4m4ibd",
      storeId: 1,
      adminId: 1,
      description: "A new production store",
      adminEmail: "admin@validpanel.com",
      adminUsername: "validadmin",
      fullName: "Valid Admin",
    });

    console.log("Store created successfully:");
    console.log(result);

    process.exit(0);
  })().catch((err) => {
    console.error("Error creating store:", err);
    process.exit(1);
  });
}
