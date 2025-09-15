/*
  Warnings:

  - You are about to drop the `general` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."general" DROP CONSTRAINT "general_store_id_fkey";

-- DropTable
DROP TABLE "public"."general";

-- CreateTable
CREATE TABLE "public"."settings" (
    "id" SERIAL NOT NULL,
    "store_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,
    "store_name" TEXT NOT NULL DEFAULT 'My Store',
    "store_description" TEXT NOT NULL,
    "logo_url" TEXT,
    "favicon_url" TEXT,
    "default_client_currency" TEXT,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_uid_key" ON "public"."settings"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "settings_store_id_store_scoped_id_key" ON "public"."settings"("store_id", "store_scoped_id");

-- AddForeignKey
ALTER TABLE "public"."settings" ADD CONSTRAINT "settings_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;
