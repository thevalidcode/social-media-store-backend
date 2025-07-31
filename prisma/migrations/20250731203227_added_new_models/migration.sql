-- AlterTable
ALTER TABLE "public"."store_counters" ADD COLUMN     "refill_order_counter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "transaction_counter" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."referral_orders" (
    "id" SERIAL NOT NULL,
    "store_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "ref_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "store_id" INTEGER NOT NULL,

    CONSTRAINT "referral_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transactions" (
    "id" SERIAL NOT NULL,
    "store_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "payment_method" TEXT NOT NULL,
    "user_uid" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "referral_orders_uid_key" ON "public"."referral_orders"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "referral_orders_ref_id_key" ON "public"."referral_orders"("ref_id");

-- CreateIndex
CREATE UNIQUE INDEX "referral_orders_store_id_store_scoped_id_key" ON "public"."referral_orders"("store_id", "store_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_uid_key" ON "public"."transactions"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_store_id_store_scoped_id_key" ON "public"."transactions"("store_id", "store_scoped_id");

-- AddForeignKey
ALTER TABLE "public"."referral_orders" ADD CONSTRAINT "referral_orders_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;
