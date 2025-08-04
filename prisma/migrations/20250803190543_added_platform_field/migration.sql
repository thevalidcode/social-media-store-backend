/*
  Warnings:

  - The `platform` column on the `payment_gateways` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."Platform" AS ENUM ('manual', 'flutterwave', 'paystack');

-- AlterTable
ALTER TABLE "public"."payment_gateways" DROP COLUMN "platform",
ADD COLUMN     "platform" "public"."Platform" NOT NULL DEFAULT 'manual';
