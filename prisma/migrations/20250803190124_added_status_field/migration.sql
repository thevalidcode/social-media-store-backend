-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('active', 'disabled');

-- AlterTable
ALTER TABLE "public"."payment_gateways" ADD COLUMN     "status" "public"."Status" NOT NULL DEFAULT 'active',
ALTER COLUMN "secret_key" DROP NOT NULL;
