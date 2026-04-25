/*
  Warnings:

  - A unique constraint covering the columns `[payment_uid]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentPurpose" AS ENUM ('WALLET_TOPUP', 'ORDER');

-- AlterEnum
ALTER TYPE "PaymentGatewayPlatform" ADD VALUE 'CREDIT';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "payment_uid" TEXT;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "purpose" "PaymentPurpose" NOT NULL DEFAULT 'WALLET_TOPUP';

-- CreateIndex
CREATE UNIQUE INDEX "orders_payment_uid_key" ON "orders"("payment_uid");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_uid_fkey" FOREIGN KEY ("payment_uid") REFERENCES "payments"("uid") ON DELETE SET NULL ON UPDATE CASCADE;
