-- AlterTable
ALTER TABLE "store_counters" ADD COLUMN     "provider_counter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "refill_counter" INTEGER NOT NULL DEFAULT 0;
