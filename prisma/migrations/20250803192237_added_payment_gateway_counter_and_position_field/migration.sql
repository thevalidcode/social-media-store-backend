/*
  Warnings:

  - Added the required column `position` to the `payment_gateways` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."payment_gateways" ADD COLUMN     "position" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."store_counters" ADD COLUMN     "payment_gateway_counter" INTEGER NOT NULL DEFAULT 0;
