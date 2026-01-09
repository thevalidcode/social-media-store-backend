/*
  Warnings:

  - Added the required column `category_uid` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "services" ADD COLUMN     "category_uid" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_category_uid_fkey" FOREIGN KEY ("category_uid") REFERENCES "categories"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
