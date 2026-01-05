/*
  Warnings:

  - A unique constraint covering the columns `[store_id]` on the table `admins_emails` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "admins_emails_store_id_key" ON "admins_emails"("store_id");
