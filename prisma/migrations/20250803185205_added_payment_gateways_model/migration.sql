-- CreateTable
CREATE TABLE "public"."payment_gateways" (
    "id" SERIAL NOT NULL,
    "store_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "secret_key" JSONB NOT NULL,
    "image" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "store_id" INTEGER NOT NULL,
    "min" DECIMAL(10,2) NOT NULL,
    "max" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "payment_gateways_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateways_uid_key" ON "public"."payment_gateways"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateways_store_id_store_scoped_id_key" ON "public"."payment_gateways"("store_id", "store_scoped_id");

-- AddForeignKey
ALTER TABLE "public"."payment_gateways" ADD CONSTRAINT "payment_gateways_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;
