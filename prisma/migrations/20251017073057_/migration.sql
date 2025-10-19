/*
  Warnings:

  - You are about to drop the column `charged_amount` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `payment_gateway` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `transactions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email,store_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username,store_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('wallet_credit', 'wallet_debit');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'success', 'failed');

-- AlterTable
ALTER TABLE "store_counters" ADD COLUMN     "payment_counter" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "charged_amount",
DROP COLUMN "payment_gateway",
DROP COLUMN "status",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "type" "TransactionType" NOT NULL;

-- DropEnum
DROP TYPE "public"."TransactionStatus";

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "charged_amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "method" "PaymentGatewayPlatform" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "store_id" INTEGER NOT NULL,
    "storeScopedId" INTEGER NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_uid_key" ON "payments"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "payments_store_id_storeScopedId_key" ON "payments"("store_id", "storeScopedId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_store_id_key" ON "users"("email", "store_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_store_id_key" ON "users"("username", "store_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;
