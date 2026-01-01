/*
  Warnings:

  - You are about to drop the column `timestamp` on the `email_templates` table. All the data in the column will be lost.
  - Changed the type of `status` on the `email_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `subject` to the `email_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `email_templates` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `email_templates` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('success', 'error');

-- AlterTable
ALTER TABLE "email_logs" DROP COLUMN "status",
ADD COLUMN     "status" "EmailStatus" NOT NULL;

-- AlterTable
ALTER TABLE "email_templates" DROP COLUMN "timestamp",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "subject" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "store_counters" ADD COLUMN     "email_template_counter" INTEGER NOT NULL DEFAULT 0;

-- DropEnum
DROP TYPE "public"."EmailTemplateType";
