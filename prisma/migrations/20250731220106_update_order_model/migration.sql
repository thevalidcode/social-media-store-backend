/*
  Warnings:

  - You are about to drop the column `service_id` on the `orders` table. All the data in the column will be lost.
  - Added the required column `service_uid` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."orders" DROP COLUMN "service_id",
ADD COLUMN     "service_uid" TEXT NOT NULL;
