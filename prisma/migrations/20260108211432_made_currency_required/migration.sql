/*
  Warnings:

  - Made the column `currency` on table `providers` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "providers" ALTER COLUMN "currency" SET NOT NULL;
