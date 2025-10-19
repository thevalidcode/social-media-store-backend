/*
  Warnings:

  - Added the required column `excerpt` to the `blogs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "excerpt" TEXT NOT NULL;
