-- AlterTable
ALTER TABLE "public"."support_tickets" ALTER COLUMN "user_uid" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."ticket_messages" ALTER COLUMN "sender_uid" SET DATA TYPE TEXT;
