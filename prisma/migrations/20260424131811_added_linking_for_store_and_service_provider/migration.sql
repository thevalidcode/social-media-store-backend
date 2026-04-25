-- AlterTable
ALTER TABLE "service_provders" ADD COLUMN     "store_id" INTEGER;

-- AddForeignKey
ALTER TABLE "service_provders" ADD CONSTRAINT "service_provders_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;
