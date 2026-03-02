/*
  Warnings:

  - You are about to drop the column `expires_at` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `planId` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `started_at` on the `stores` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "stores" DROP COLUMN "expires_at",
DROP COLUMN "planId",
DROP COLUMN "started_at";
