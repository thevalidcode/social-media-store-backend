/*
  Warnings:

  - You are about to drop the column `refill_order_counter` on the `store_counters` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."store_counters" DROP COLUMN "refill_order_counter",
ADD COLUMN     "referral_order_counter" INTEGER NOT NULL DEFAULT 0;
