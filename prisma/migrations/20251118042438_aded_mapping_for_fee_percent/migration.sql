/*
  Warnings:

  - You are about to drop the column `feePercent` on the `payment_gateways` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payment_gateways" DROP COLUMN "feePercent",
ADD COLUMN     "fee_percent" INTEGER DEFAULT 0;
