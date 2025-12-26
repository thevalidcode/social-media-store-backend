/*
  Warnings:

  - You are about to drop the column `plan` on the `stores` table. All the data in the column will be lost.
  - Added the required column `planId` to the `stores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stores" DROP COLUMN "plan",
ADD COLUMN     "planId" INTEGER NOT NULL,
ADD COLUMN     "started_at" TIMESTAMP(3);
