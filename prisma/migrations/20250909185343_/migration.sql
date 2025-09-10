/*
  Warnings:

  - The values [inactive] on the enum `StoreStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `features` to the `stores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `stores` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `plan` on the `stores` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."StoreStatus_new" AS ENUM ('active', 'canceled', 'disabled', 'expired');
ALTER TABLE "public"."stores" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."stores" ALTER COLUMN "status" TYPE "public"."StoreStatus_new" USING ("status"::text::"public"."StoreStatus_new");
ALTER TYPE "public"."StoreStatus" RENAME TO "StoreStatus_old";
ALTER TYPE "public"."StoreStatus_new" RENAME TO "StoreStatus";
DROP TYPE "public"."StoreStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."stores" ADD COLUMN     "description" TEXT,
ADD COLUMN     "expires_at" TIMESTAMP(3),
ADD COLUMN     "features" JSONB NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
DROP COLUMN "plan",
ADD COLUMN     "plan" TEXT NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- DropEnum
DROP TYPE "public"."StorePlan";
