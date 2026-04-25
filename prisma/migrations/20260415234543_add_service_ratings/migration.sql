-- CreateEnum
CREATE TYPE "RatingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "providers" ALTER COLUMN "image" SET DEFAULT 'https://cdn-icons-png.flaticon.com/512/1/1.png';

-- CreateTable
CREATE TABLE "service_ratings" (
    "id" SERIAL NOT NULL,
    "store_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "service_uid" TEXT NOT NULL,
    "user_uid" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "status" "RatingStatus" NOT NULL DEFAULT 'PENDING',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "store_id" INTEGER NOT NULL,

    CONSTRAINT "service_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_ratings_uid_key" ON "service_ratings"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "service_ratings_store_id_store_scoped_id_key" ON "service_ratings"("store_id", "store_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_ratings_service_uid_user_uid_store_id_key" ON "service_ratings"("service_uid", "user_uid", "store_id");

-- AddForeignKey
ALTER TABLE "service_ratings" ADD CONSTRAINT "service_ratings_service_uid_fkey" FOREIGN KEY ("service_uid") REFERENCES "services"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_ratings" ADD CONSTRAINT "service_ratings_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;
