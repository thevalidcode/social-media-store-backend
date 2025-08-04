/*
  Warnings:

  - Changed the type of `status` on the `transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."TransactionStatus" AS ENUM ('success', 'failed', 'completed', 'reversed', 'cancelled');

-- AlterTable
ALTER TABLE "public"."transactions" DROP COLUMN "status",
ADD COLUMN     "status" "public"."TransactionStatus" NOT NULL;
