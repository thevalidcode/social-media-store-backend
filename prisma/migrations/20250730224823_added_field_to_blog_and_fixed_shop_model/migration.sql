-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "cover_image" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "ref_code" DROP NOT NULL;
