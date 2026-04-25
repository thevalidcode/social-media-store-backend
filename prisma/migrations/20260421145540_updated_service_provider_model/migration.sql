/*
  Warnings:

  - A unique constraint covering the columns `[order_uid,status]` on the table `cancels` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "service_provders" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_internal" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "cancels_order_uid_status_key" ON "cancels"("order_uid", "status");

-- AddForeignKey
ALTER TABLE "cancels" ADD CONSTRAINT "cancels_order_uid_fkey" FOREIGN KEY ("order_uid") REFERENCES "orders"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
