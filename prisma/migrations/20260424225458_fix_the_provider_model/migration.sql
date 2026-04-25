/*
  Warnings:

  - Made the column `store_id` on table `providers` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "providers" ALTER COLUMN "store_id" SET NOT NULL;
