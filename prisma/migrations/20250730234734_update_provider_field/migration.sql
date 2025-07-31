/*
  Warnings:

  - Changed the type of `api_key` on the `providers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "providers" DROP COLUMN "api_key",
ADD COLUMN     "api_key" JSONB NOT NULL;
