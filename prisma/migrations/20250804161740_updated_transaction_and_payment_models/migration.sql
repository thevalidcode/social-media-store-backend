/*
  Warnings:

  - Added the required column `charged_amount` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."transactions" ADD COLUMN     "charged_amount" DECIMAL(65,30) NOT NULL;
