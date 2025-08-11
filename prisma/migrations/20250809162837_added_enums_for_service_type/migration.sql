/*
  Warnings:

  - The `type` column on the `services` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."ServiceType" AS ENUM ('Default', 'Package', 'Subscription', 'Custom Comments');

-- AlterTable
ALTER TABLE "public"."services" DROP COLUMN "type",
ADD COLUMN     "type" "public"."ServiceType" NOT NULL DEFAULT 'Default';
