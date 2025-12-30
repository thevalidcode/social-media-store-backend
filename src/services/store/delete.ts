import "dotenv/config";
import { prisma } from "../../config/db.config";
import { DeleteStoreParams } from "../../schemas/internal.schema";
import { assertValidDomain } from "../../utils/domain.guard";
import { exec } from "child_process";
import { StoreError } from "../../errors/store.error";
import { env } from "../../config/env.config";

export function runStoreDeleteCLI(domain: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cmd = `validpanel-cli stores:delete ${domain} social-media-store`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return reject(new StoreError("CLI_ERROR", stderr || error.message));
      }
      resolve();
    });
  });
}

export async function DeleteStore(params: DeleteStoreParams) {
  const { uid: storeDomain } = params;

  try {
    // Step 0: Validate domain rules
    if (!storeDomain.startsWith("localhost")) assertValidDomain(storeDomain);

    const existingStore = await prisma.store.findFirst({
      where: { uid: storeDomain },
    });

    if (!existingStore) {
      throw new StoreError(
        "STORE_NOT_FOUND",
        "A store with the given domain wasn't found"
      );
    }

    if (!storeDomain.startsWith("localhost") && env.NODE_ENV === "production")
      await runStoreDeleteCLI(storeDomain);

    await prisma.store.delete({ where: { uid: storeDomain } });

    return;
  } catch (err: any) {
    if (err instanceof StoreError) throw err;
    throw new StoreError("DB_ERROR", err.message || "Database error");
  }
}
