-- AlterTable
ALTER TABLE "public"."store_counters" ADD COLUMN     "support_ticket_counter" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."support_tickets" ADD COLUMN     "description" TEXT;
