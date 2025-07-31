/*
  Warnings:

  - Added the required column `order_id` to the `refills` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "refills" ADD COLUMN     "order_id" INTEGER NOT NULL;
