/*
  Warnings:

  - You are about to drop the `service_provders` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "service_provders" DROP CONSTRAINT "service_provders_store_id_fkey";

-- DropTable
DROP TABLE "service_provders";
