/*
  Warnings:

  - You are about to drop the column `payment_method` on the `transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."transactions" DROP COLUMN "payment_method",
ADD COLUMN     "payment_gateway" "public"."Platform" NOT NULL DEFAULT 'manual';
