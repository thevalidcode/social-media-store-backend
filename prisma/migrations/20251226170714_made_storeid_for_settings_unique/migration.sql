/*
  Warnings:

  - A unique constraint covering the columns `[store_id]` on the table `settings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "settings_store_id_key" ON "settings"("store_id");
