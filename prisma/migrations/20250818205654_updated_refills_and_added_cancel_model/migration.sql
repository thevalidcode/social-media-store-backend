/*
  Warnings:

  - You are about to drop the column `order_id` on the `refills` table. All the data in the column will be lost.
  - Added the required column `order_uid` to the `refills` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."CancelStatus" AS ENUM ('Pending', 'Canceled', 'Rejected', 'Completed', 'In progress', 'Error');

-- AlterTable
ALTER TABLE "public"."refills" DROP COLUMN "order_id",
ADD COLUMN     "order_uid" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."cancels" (
    "id" SERIAL NOT NULL,
    "store_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_uid" TEXT NOT NULL,
    "provider_id" INTEGER NOT NULL,
    "status" "public"."CancelStatus" NOT NULL DEFAULT 'Pending',
    "provider_order_id" INTEGER NOT NULL,
    "order_uid" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_error" TEXT,
    "store_id" INTEGER NOT NULL,

    CONSTRAINT "cancels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cancels_uid_key" ON "public"."cancels"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "cancels_store_id_store_scoped_id_key" ON "public"."cancels"("store_id", "store_scoped_id");

-- AddForeignKey
ALTER TABLE "public"."cancels" ADD CONSTRAINT "cancels_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;
