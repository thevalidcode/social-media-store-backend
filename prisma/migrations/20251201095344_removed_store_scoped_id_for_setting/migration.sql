/*
  Warnings:

  - You are about to drop the column `store_scoped_id` on the `settings` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."settings_store_id_store_scoped_id_key";

-- AlterTable
ALTER TABLE "settings" DROP COLUMN "store_scoped_id";
