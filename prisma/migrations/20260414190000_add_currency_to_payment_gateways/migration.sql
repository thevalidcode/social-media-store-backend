-- AlterTable
ALTER TABLE "payment_gateways"
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';
