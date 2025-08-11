/*
  Warnings:

  - The `role` column on the `admins` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `admins` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `blogs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `categories` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `faqs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `refills` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `services` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `plan` column on the `stores` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `stores` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `type` on the `email_templates` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."StoreStatus" AS ENUM ('active', 'inactive', 'disabled');

-- CreateEnum
CREATE TYPE "public"."StorePlan" AS ENUM ('free', 'starter', 'essesentials', 'pro', 'business', 'empire');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('active', 'inactive', 'banned');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('basic', 'vip', 'reseller', 'partner');

-- CreateEnum
CREATE TYPE "public"."AdminStatus" AS ENUM ('active', 'inactive', 'banned');

-- CreateEnum
CREATE TYPE "public"."AdminRole" AS ENUM ('super', 'basic', 'manager', 'support_staff', 'finance_officer', 'service_operator');

-- CreateEnum
CREATE TYPE "public"."ServiceStatus" AS ENUM ('active', 'disabled');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('Pending', 'Canceled', 'Partial', 'Completed', 'In progress', 'Processing');

-- CreateEnum
CREATE TYPE "public"."BlogStatus" AS ENUM ('active', 'disabled');

-- CreateEnum
CREATE TYPE "public"."CategoryStatus" AS ENUM ('active', 'disabled');

-- CreateEnum
CREATE TYPE "public"."EmailTemplateType" AS ENUM ('new_order', 'new_payment', 'new_service', 'new_user', 'new_failed_order', 'new_support', 'new_message', 'verification_code', 'new_refill', 'new_failed_refill');

-- CreateEnum
CREATE TYPE "public"."FaqStatus" AS ENUM ('active', 'disabled');

-- CreateEnum
CREATE TYPE "public"."RefillStatus" AS ENUM ('Pending', 'Canceled', 'Rejected', 'Completed', 'In progress', 'Error');

-- AlterTable
ALTER TABLE "public"."admins" DROP COLUMN "role",
ADD COLUMN     "role" "public"."AdminRole" NOT NULL DEFAULT 'basic',
DROP COLUMN "status",
ADD COLUMN     "status" "public"."AdminStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "public"."blogs" DROP COLUMN "status",
ADD COLUMN     "status" "public"."BlogStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "public"."categories" DROP COLUMN "status",
ADD COLUMN     "status" "public"."CategoryStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "public"."email_templates" DROP COLUMN "type",
ADD COLUMN     "type" "public"."EmailTemplateType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."faqs" DROP COLUMN "status",
ADD COLUMN     "status" "public"."FaqStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "public"."orders" DROP COLUMN "status",
ADD COLUMN     "status" "public"."OrderStatus" NOT NULL DEFAULT 'Pending';

-- AlterTable
ALTER TABLE "public"."refills" DROP COLUMN "status",
ADD COLUMN     "status" "public"."RefillStatus" NOT NULL DEFAULT 'Pending';

-- AlterTable
ALTER TABLE "public"."services" DROP COLUMN "status",
ADD COLUMN     "status" "public"."ServiceStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "public"."stores" DROP COLUMN "plan",
ADD COLUMN     "plan" "public"."StorePlan" NOT NULL DEFAULT 'free',
DROP COLUMN "status",
ADD COLUMN     "status" "public"."StoreStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "role",
ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'basic',
DROP COLUMN "status",
ADD COLUMN     "status" "public"."UserStatus" NOT NULL DEFAULT 'active';
