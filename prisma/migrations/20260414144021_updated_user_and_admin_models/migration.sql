/*
  Warnings:

  - You are about to drop the column `api_key` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `api_key` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[api_key_hash]` on the table `admins` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[api_key_hash]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "users_api_key_key";

-- AlterTable
ALTER TABLE "admins" DROP COLUMN "api_key",
ADD COLUMN     "api_key_hash" TEXT,
ADD COLUMN     "api_key_iv" TEXT,
ADD COLUMN     "encrypted_api_key" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "api_key",
ADD COLUMN     "api_key_hash" TEXT,
ADD COLUMN     "api_key_iv" TEXT,
ADD COLUMN     "encrypted_api_key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "admins_api_key_hash_key" ON "admins"("api_key_hash");

-- CreateIndex
CREATE UNIQUE INDEX "users_api_key_hash_key" ON "users"("api_key_hash");
