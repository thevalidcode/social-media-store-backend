import "dotenv/config";
import { prisma } from "../../config/db.config";
import { CreateStoreParams } from "../../schemas/internal.schema";
import { assertValidDomain } from "../../utils/domain.guard";
import { exec } from "child_process";
import { StoreError } from "../../errors/store.error";
import { env } from "../../config/env.config";

export function runStoreCreateCLI(domain: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cmd = `validpanel-cli stores:add ${domain} social-media-store`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return reject(
          new StoreError("CLI_ERROR", stderr || stdout || error.message)
        );
      }

      if (stderr) {
        return reject(new StoreError("CLI_STDERR", stderr));
      }

      resolve();
    });
  });
}

export async function CreateStore(params: CreateStoreParams) {
  const {
    storeId,
    storeDomain,
    name,
    description,
    planId,
    features = {},
    adminEmail,
    adminUsername,
    fullName,
    logoUrl,
    faviconUrl,
    adminImage,
    adminId,
    adminUid,
  } = params;

  try {
    // Step 0: Validate domain rules
    if (!storeDomain.startsWith("localhost")) assertValidDomain(storeDomain);

    const response = await prisma.$transaction(async (tx) => {
      // Step 1: Ensure store domain is unique
      const existingStore = await tx.store.findFirst({
        where: { uid: storeDomain },
        select: { storeId: true },
      });

      if (existingStore) {
        throw new StoreError(
          "DOMAIN_TAKEN",
          "Store domain has already been used"
        );
      }

      // Step 3: Create store
      const store = await tx.store.create({
        data: {
          uid: storeDomain,
          status: "DISABLED",
          storeId,
          description: description || null,
          features,
          name,
          planId,
          ssl: true,
        },
      });

      // Step 4: Initialize counters
      await tx.storeCounter.create({
        data: { storeId: store.storeId },
      });

      // Step 5: Create default settings
      const setting = await tx.setting.create({
        data: {
          storeId: store.storeId,
          storeName: name,
          storeDescription: description || null,
          faviconUrl: faviconUrl || null,
          logoUrl: logoUrl || null,
          defaultClientCurrency: "USD",
          showBanner: true,
        },
      });

      // Step 6: Create admin account
      const admin = await tx.admin.create({
        data: {
          uid: adminUid,
          apiKey: crypto.randomUUID(),
          id: adminId,
          email: adminEmail,
          image: adminImage || null,
          username: adminUsername || fullName,
          password: crypto.randomUUID(),
          fullName: fullName || null,
          storeId: store.storeId,
        },
      });

      return { store, setting, admin };
    });

    // Step 7: Run CLI to provision store
    if (!storeDomain.startsWith("localhost") && env.NODE_ENV === "production") {
      try {
        await runStoreCreateCLI(storeDomain);
      } catch (cliError) {
        // Rollback: Delete created records if CLI fails
        await prisma.$transaction(async (tx) => {
          await tx.admin.delete({ where: { storeId } });
          await tx.setting.delete({ where: { storeId } });
          await tx.storeCounter.delete({ where: { storeId } });
          await tx.store.delete({ where: { storeId } });
        });

        throw cliError;
      }
    }

    return response;
  } catch (err: any) {
    if (err instanceof StoreError) throw err;
    throw new StoreError("DB_ERROR", err.message || "Database error");
  }
}
