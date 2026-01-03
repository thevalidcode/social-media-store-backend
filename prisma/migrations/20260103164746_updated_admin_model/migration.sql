/*
  Warnings:

  - The primary key for the `admins` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[store_id]` on the table `admins` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."admins_api_key_key";

-- DropIndex
DROP INDEX "public"."admins_uid_key";

-- AlterTable
ALTER TABLE "admins" DROP CONSTRAINT "admins_pkey",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "admins_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "admins_store_id_key" ON "admins"("store_id");
