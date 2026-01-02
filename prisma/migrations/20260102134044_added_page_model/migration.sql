-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('services', 'orders', 'order', 'terms_of_service', 'privacy_policy');

-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('active', 'inactive');

-- AlterTable
ALTER TABLE "store_counters" ADD COLUMN     "page_counter" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "pages" (
    "id" SERIAL NOT NULL,
    "store_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "page_type" "PageType" NOT NULL,
    "status" "PageStatus" NOT NULL DEFAULT 'active',
    "store_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pages_uid_key" ON "pages"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "pages_store_id_store_scoped_id_key" ON "pages"("store_id", "store_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "pages_store_id_page_type_key" ON "pages"("store_id", "page_type");

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;
