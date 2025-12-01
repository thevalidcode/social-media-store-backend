/*
  Warnings:

  - Added the required column `collection` to the `upload_logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "design_styles" ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "upload_logs" ADD COLUMN     "collection" TEXT NOT NULL;
