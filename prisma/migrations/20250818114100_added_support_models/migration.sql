-- CreateEnum
CREATE TYPE "public"."TicketStatus" AS ENUM ('open', 'pending', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "public"."TicketPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "public"."MessageSenderType" AS ENUM ('user', 'admin');

-- CreateTable
CREATE TABLE "public"."support_tickets" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,
    "user_uid" INTEGER NOT NULL,
    "store_scoped_id" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "public"."TicketStatus" NOT NULL DEFAULT 'open',
    "priority" "public"."TicketPriority" NOT NULL DEFAULT 'medium',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ticket_messages" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "ticket_uid" TEXT NOT NULL,
    "sender_uid" INTEGER NOT NULL,
    "sender_type" "public"."MessageSenderType" NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_uid_key" ON "public"."support_tickets"("uid");

-- CreateIndex
CREATE INDEX "support_tickets_store_id_idx" ON "public"."support_tickets"("store_id");

-- CreateIndex
CREATE INDEX "support_tickets_user_uid_idx" ON "public"."support_tickets"("user_uid");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_store_id_store_scoped_id_key" ON "public"."support_tickets"("store_id", "store_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_messages_uid_key" ON "public"."ticket_messages"("uid");

-- CreateIndex
CREATE INDEX "ticket_messages_ticket_uid_idx" ON "public"."ticket_messages"("ticket_uid");

-- CreateIndex
CREATE INDEX "ticket_messages_sender_uid_idx" ON "public"."ticket_messages"("sender_uid");

-- AddForeignKey
ALTER TABLE "public"."support_tickets" ADD CONSTRAINT "support_tickets_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_uid_fkey" FOREIGN KEY ("ticket_uid") REFERENCES "public"."support_tickets"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
