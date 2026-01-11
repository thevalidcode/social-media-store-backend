/*
  Warnings:

  - You are about to drop the column `provider` on the `cancels` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cancels" DROP COLUMN "provider",
ALTER COLUMN "provider_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "cancels" ADD CONSTRAINT "cancels_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
