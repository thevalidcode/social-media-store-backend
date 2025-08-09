/*
  Warnings:

  - The `status` column on the `payment_gateways` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `platform` column on the `payment_gateways` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `payment_gateway` column on the `transactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentGatewayStatus" AS ENUM ('active', 'disabled');

-- CreateEnum
CREATE TYPE "public"."PaymentGatewayPlatform" AS ENUM ('manual', 'flutterwave', 'paystack', 'referral');

-- AlterTable
ALTER TABLE "public"."payment_gateways" DROP COLUMN "status",
ADD COLUMN     "status" "public"."PaymentGatewayStatus" NOT NULL DEFAULT 'active',
DROP COLUMN "platform",
ADD COLUMN     "platform" "public"."PaymentGatewayPlatform" NOT NULL DEFAULT 'manual';

-- AlterTable
ALTER TABLE "public"."transactions" DROP COLUMN "payment_gateway",
ADD COLUMN     "payment_gateway" "public"."PaymentGatewayPlatform" NOT NULL DEFAULT 'manual';

-- DropEnum
DROP TYPE "public"."Platform";

-- DropEnum
DROP TYPE "public"."Status";
