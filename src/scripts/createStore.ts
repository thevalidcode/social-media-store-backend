import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../config/db.config";
import { v4 as uuid } from "uuid";

interface CreateStoreParams {
  storeId: number;
  name: string;
  storeDomain: string;
  description?: string;
  plan: string;
  features?: JSON;
  adminEmail: string;
  adminPassword: string;
  adminUsername: string;
  fullName?: string;
  ssl?: boolean;
}

export async function createStore(params: CreateStoreParams) {
  const {
    storeId,
    storeDomain,
    name,
    description,
    plan,
    features = {},
    adminEmail,
    adminPassword,
    adminUsername,
    fullName,
    ssl = true,
  } = params;

  return await prisma.$transaction(async (tx) => {
    // Step 1: Create store
    const store = await tx.store.create({
      data: {
        uid: storeDomain,
        status: "ACTIVE",
        storeId,
        description: description || null,
        features,
        name,
        plan,
        ssl,
      },
    });

    // Step 2: Initialize counters
    const counter = await tx.storeCounter.create({
      data: {
        storeId: store.storeId,
      },
    });

    // Step 3: Generate next storeScopedId for Setting
    const nextSettingId = counter.storeId ? 1 : counter.storeId + 1;

    // Step 4: Create default settings
    const setting = await tx.setting.create({
      data: {
        storeId: store.storeId,
        uid: uuid(),
        storeName: name,
        storeDescription: description || null,
        faviconUrl: null,
        logoUrl: null,
        defaultClientCurrency: "USD",
        showBanner: true,
      },
    });

    // Step 5: Hash admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Step 6: Create admin account
    const admin = await tx.admin.create({
      data: {
        uid: uuid(),
        email: adminEmail,
        username: adminUsername,
        password: hashedPassword,
        fullName: fullName || null,
        apiKey: uuid(),
        storeId: store.storeId,
      },
    });

    return {
      store,
      setting,
      admin,
    };
  });
}

// ====== RUN IF CALLED DIRECTLY ======

if (require.main === module) {
  (async () => {
    const result = await createStore({
      name: "Valid Test Store",
      storeDomain: "localhost:3000",
      storeId: 1,
      description: "A new production store",
      plan: "PRO",
      adminEmail: "admin@validpanel.com",
      adminPassword: "Djvalid49.com",
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
