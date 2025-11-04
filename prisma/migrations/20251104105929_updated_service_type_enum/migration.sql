/*
  Warnings:

  - The values [Default,Package,Subscription,Custom Comments,Manual] on the enum `ServiceType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ServiceType_new" AS ENUM ('manual', 'default', 'package', 'seo', 'custom_comments', 'mentions', 'mentions_with_hashtags', 'mentions_custom_list', 'mentions_hashtag', 'mentions_user_followers', 'mentions_media_likers', 'custom_comments_package', 'comment_likes', 'poll', 'comment_replies', 'subscriptions');
ALTER TABLE "public"."services" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "services" ALTER COLUMN "type" TYPE "ServiceType_new" USING ("type"::text::"ServiceType_new");
ALTER TYPE "ServiceType" RENAME TO "ServiceType_old";
ALTER TYPE "ServiceType_new" RENAME TO "ServiceType";
DROP TYPE "public"."ServiceType_old";
ALTER TABLE "services" ALTER COLUMN "type" SET DEFAULT 'default';
COMMIT;

-- AlterTable
ALTER TABLE "services" ALTER COLUMN "type" SET DEFAULT 'default';
