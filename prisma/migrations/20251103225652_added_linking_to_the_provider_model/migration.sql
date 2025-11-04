/*
  Warnings:

  - You are about to drop the column `provider` on the `services` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "services" DROP COLUMN "provider",
ADD COLUMN     "provider_uid" TEXT;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_provider_uid_fkey" FOREIGN KEY ("provider_uid") REFERENCES "providers"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
