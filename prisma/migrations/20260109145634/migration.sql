/*
  Warnings:

  - The values [super,basic,manager,support_staff,finance_officer,service_operator] on the enum `AdminRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,inactive,banned] on the enum `AdminStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,disabled] on the enum `BlogStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [Pending,Canceled,Rejected,Completed,In progress,Error] on the enum `CancelStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,disabled] on the enum `CategoryStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [success,error] on the enum `EmailStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,disabled] on the enum `FaqStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [user,admin] on the enum `MessageSenderType` will be removed. If these variants are still used in the database, this will fail.
  - The values [Pending,Canceled,Partial,Completed,In progress,Processing,Failed] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,inactive] on the enum `PageStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [services,orders,order,terms_of_service,privacy_policy] on the enum `PageType` will be removed. If these variants are still used in the database, this will fail.
  - The values [manual,flutterwave,paystack,referral] on the enum `PaymentGatewayPlatform` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,disabled] on the enum `PaymentGatewayStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [pending,success,failed] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [Pending,Canceled,Rejected,Completed,In progress,Error] on the enum `RefillStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,disabled] on the enum `ServiceStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [manual,default,package,seo,custom_comments,mentions,mentions_with_hashtags,mentions_custom_list,mentions_hashtag,mentions_user_followers,mentions_media_likers,custom_comments_package,comment_likes,poll,comment_replies,subscriptions,invites_from_groups] on the enum `ServiceType` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,canceled,disabled,expired] on the enum `StoreStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [low,medium,high,urgent] on the enum `TicketPriority` will be removed. If these variants are still used in the database, this will fail.
  - The values [open,pending,resolved,closed] on the enum `TicketStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [wallet_credit,wallet_debit,referral_credit] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.
  - The values [basic,vip,reseller,partner] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,inactive,banned] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AdminRole_new" AS ENUM ('SUPER', 'BASIC', 'MANAGER', 'SUPPORT_STAFF', 'FINANCE_OFFICER', 'SERVICE_OPERATOR');
ALTER TABLE "public"."admins" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "admins" ALTER COLUMN "role" TYPE "AdminRole_new" USING ("role"::text::"AdminRole_new");
ALTER TYPE "AdminRole" RENAME TO "AdminRole_old";
ALTER TYPE "AdminRole_new" RENAME TO "AdminRole";
DROP TYPE "public"."AdminRole_old";
ALTER TABLE "admins" ALTER COLUMN "role" SET DEFAULT 'BASIC';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "AdminStatus_new" AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED');
ALTER TABLE "public"."admins" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "admins" ALTER COLUMN "status" TYPE "AdminStatus_new" USING ("status"::text::"AdminStatus_new");
ALTER TYPE "AdminStatus" RENAME TO "AdminStatus_old";
ALTER TYPE "AdminStatus_new" RENAME TO "AdminStatus";
DROP TYPE "public"."AdminStatus_old";
ALTER TABLE "admins" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "BlogStatus_new" AS ENUM ('ACTIVE', 'DISABLED');
ALTER TABLE "public"."blogs" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "blogs" ALTER COLUMN "status" TYPE "BlogStatus_new" USING ("status"::text::"BlogStatus_new");
ALTER TYPE "BlogStatus" RENAME TO "BlogStatus_old";
ALTER TYPE "BlogStatus_new" RENAME TO "BlogStatus";
DROP TYPE "public"."BlogStatus_old";
ALTER TABLE "blogs" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "CancelStatus_new" AS ENUM ('PENDING', 'CANCELED', 'REJECTED', 'COMPLETED', 'ACTIVE', 'ERROR');
ALTER TABLE "public"."cancels" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "cancels" ALTER COLUMN "status" TYPE "CancelStatus_new" USING ("status"::text::"CancelStatus_new");
ALTER TYPE "CancelStatus" RENAME TO "CancelStatus_old";
ALTER TYPE "CancelStatus_new" RENAME TO "CancelStatus";
DROP TYPE "public"."CancelStatus_old";
ALTER TABLE "cancels" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "CategoryStatus_new" AS ENUM ('ACTIVE', 'DISABLED');
ALTER TABLE "public"."categories" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "categories" ALTER COLUMN "status" TYPE "CategoryStatus_new" USING ("status"::text::"CategoryStatus_new");
ALTER TYPE "CategoryStatus" RENAME TO "CategoryStatus_old";
ALTER TYPE "CategoryStatus_new" RENAME TO "CategoryStatus";
DROP TYPE "public"."CategoryStatus_old";
ALTER TABLE "categories" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "EmailStatus_new" AS ENUM ('SUCCESS', 'ERROR');
ALTER TABLE "email_logs" ALTER COLUMN "status" TYPE "EmailStatus_new" USING ("status"::text::"EmailStatus_new");
ALTER TYPE "EmailStatus" RENAME TO "EmailStatus_old";
ALTER TYPE "EmailStatus_new" RENAME TO "EmailStatus";
DROP TYPE "public"."EmailStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "FaqStatus_new" AS ENUM ('ACTIVE', 'DISABLED');
ALTER TABLE "public"."faqs" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "faqs" ALTER COLUMN "status" TYPE "FaqStatus_new" USING ("status"::text::"FaqStatus_new");
ALTER TYPE "FaqStatus" RENAME TO "FaqStatus_old";
ALTER TYPE "FaqStatus_new" RENAME TO "FaqStatus";
DROP TYPE "public"."FaqStatus_old";
ALTER TABLE "faqs" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "MessageSenderType_new" AS ENUM ('USER', 'ADMIN');
ALTER TABLE "ticket_messages" ALTER COLUMN "sender_type" TYPE "MessageSenderType_new" USING ("sender_type"::text::"MessageSenderType_new");
ALTER TYPE "MessageSenderType" RENAME TO "MessageSenderType_old";
ALTER TYPE "MessageSenderType_new" RENAME TO "MessageSenderType";
DROP TYPE "public"."MessageSenderType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'CANCELED', 'PARTIAL', 'COMPLETED', 'ACTIVE', 'PROCESSING', 'FAILED');
ALTER TABLE "public"."orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PageStatus_new" AS ENUM ('ACTIVE', 'INACTIVE');
ALTER TABLE "public"."pages" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "pages" ALTER COLUMN "status" TYPE "PageStatus_new" USING ("status"::text::"PageStatus_new");
ALTER TYPE "PageStatus" RENAME TO "PageStatus_old";
ALTER TYPE "PageStatus_new" RENAME TO "PageStatus";
DROP TYPE "public"."PageStatus_old";
ALTER TABLE "pages" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PageType_new" AS ENUM ('SERVICES', 'ORDERS', 'ORDER', 'TERMS_OF_SERVICE', 'PRIVACY_POLICY');
ALTER TABLE "pages" ALTER COLUMN "page_type" TYPE "PageType_new" USING ("page_type"::text::"PageType_new");
ALTER TYPE "PageType" RENAME TO "PageType_old";
ALTER TYPE "PageType_new" RENAME TO "PageType";
DROP TYPE "public"."PageType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentGatewayPlatform_new" AS ENUM ('MANUAL', 'FLUTTERWAVE', 'PAYSTACK', 'REFERRAL');
ALTER TABLE "public"."payment_gateways" ALTER COLUMN "platform" DROP DEFAULT;
ALTER TABLE "payment_gateways" ALTER COLUMN "platform" TYPE "PaymentGatewayPlatform_new" USING ("platform"::text::"PaymentGatewayPlatform_new");
ALTER TABLE "payments" ALTER COLUMN "method" TYPE "PaymentGatewayPlatform_new" USING ("method"::text::"PaymentGatewayPlatform_new");
ALTER TYPE "PaymentGatewayPlatform" RENAME TO "PaymentGatewayPlatform_old";
ALTER TYPE "PaymentGatewayPlatform_new" RENAME TO "PaymentGatewayPlatform";
DROP TYPE "public"."PaymentGatewayPlatform_old";
ALTER TABLE "payment_gateways" ALTER COLUMN "platform" SET DEFAULT 'MANUAL';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentGatewayStatus_new" AS ENUM ('ACTIVE', 'DISABLED');
ALTER TABLE "public"."payment_gateways" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "payment_gateways" ALTER COLUMN "status" TYPE "PaymentGatewayStatus_new" USING ("status"::text::"PaymentGatewayStatus_new");
ALTER TYPE "PaymentGatewayStatus" RENAME TO "PaymentGatewayStatus_old";
ALTER TYPE "PaymentGatewayStatus_new" RENAME TO "PaymentGatewayStatus";
DROP TYPE "public"."PaymentGatewayStatus_old";
ALTER TABLE "payment_gateways" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
ALTER TABLE "payments" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "public"."PaymentStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RefillStatus_new" AS ENUM ('PENDING', 'CANCELED', 'REJECTED', 'COMPLETED', 'ACTIVE', 'ERROR');
ALTER TABLE "public"."refills" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "refills" ALTER COLUMN "status" TYPE "RefillStatus_new" USING ("status"::text::"RefillStatus_new");
ALTER TYPE "RefillStatus" RENAME TO "RefillStatus_old";
ALTER TYPE "RefillStatus_new" RENAME TO "RefillStatus";
DROP TYPE "public"."RefillStatus_old";
ALTER TABLE "refills" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ServiceStatus_new" AS ENUM ('ACTIVE', 'DISABLED');
ALTER TABLE "public"."services" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "services" ALTER COLUMN "status" TYPE "ServiceStatus_new" USING ("status"::text::"ServiceStatus_new");
ALTER TYPE "ServiceStatus" RENAME TO "ServiceStatus_old";
ALTER TYPE "ServiceStatus_new" RENAME TO "ServiceStatus";
DROP TYPE "public"."ServiceStatus_old";
ALTER TABLE "services" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ServiceType_new" AS ENUM ('MANUAL', 'DEFAULT', 'PACKAGE', 'SEO', 'CUSTOM_COMMENTS', 'MENTIONS', 'MENTIONS_WITH_HASHTAGS', 'MENTIONS_CUSTOM_LIST', 'MENTIONS_HASHTAG', 'MENTIONS_USER_FOLLOWERS', 'MENTIONS_MEDIA_LIKERS', 'CUSTOM_COMMENTS_PACKAGE', 'COMMENT_LIKES', 'POLL', 'COMMENT_REPLIES', 'SUBSCRIPTIONS', 'INVITES_FROM_GROUPS');
ALTER TABLE "public"."services" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "services" ALTER COLUMN "type" TYPE "ServiceType_new" USING ("type"::text::"ServiceType_new");
ALTER TYPE "ServiceType" RENAME TO "ServiceType_old";
ALTER TYPE "ServiceType_new" RENAME TO "ServiceType";
DROP TYPE "public"."ServiceType_old";
ALTER TABLE "services" ALTER COLUMN "type" SET DEFAULT 'DEFAULT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "StoreStatus_new" AS ENUM ('ACTIVE', 'CANCELED', 'DISABLED', 'EXPIRED');
ALTER TABLE "stores" ALTER COLUMN "status" TYPE "StoreStatus_new" USING ("status"::text::"StoreStatus_new");
ALTER TYPE "StoreStatus" RENAME TO "StoreStatus_old";
ALTER TYPE "StoreStatus_new" RENAME TO "StoreStatus";
DROP TYPE "public"."StoreStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TicketPriority_new" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
ALTER TABLE "public"."support_tickets" ALTER COLUMN "priority" DROP DEFAULT;
ALTER TABLE "support_tickets" ALTER COLUMN "priority" TYPE "TicketPriority_new" USING ("priority"::text::"TicketPriority_new");
ALTER TYPE "TicketPriority" RENAME TO "TicketPriority_old";
ALTER TYPE "TicketPriority_new" RENAME TO "TicketPriority";
DROP TYPE "public"."TicketPriority_old";
ALTER TABLE "support_tickets" ALTER COLUMN "priority" SET DEFAULT 'MEDIUM';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TicketStatus_new" AS ENUM ('OPEN', 'PENDING', 'RESOLVED', 'CLOSED');
ALTER TABLE "public"."support_tickets" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "support_tickets" ALTER COLUMN "status" TYPE "TicketStatus_new" USING ("status"::text::"TicketStatus_new");
ALTER TYPE "TicketStatus" RENAME TO "TicketStatus_old";
ALTER TYPE "TicketStatus_new" RENAME TO "TicketStatus";
DROP TYPE "public"."TicketStatus_old";
ALTER TABLE "support_tickets" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('WALLET_CREDIT', 'WALLET_DEBIT', 'REFERRAL_CREDIT');
ALTER TABLE "transactions" ALTER COLUMN "type" TYPE "TransactionType_new" USING ("type"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "public"."TransactionType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('BASIC', 'VIP', 'RESELLER', 'PARTNER');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'BASIC';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED');
ALTER TABLE "public"."users" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "status" TYPE "UserStatus_new" USING ("status"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "admins" ALTER COLUMN "role" SET DEFAULT 'BASIC',
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "blogs" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "cancels" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "faqs" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "pages" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "payment_gateways" ALTER COLUMN "status" SET DEFAULT 'ACTIVE',
ALTER COLUMN "platform" SET DEFAULT 'MANUAL';

-- AlterTable
ALTER TABLE "refills" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "services" ALTER COLUMN "status" SET DEFAULT 'ACTIVE',
ALTER COLUMN "type" SET DEFAULT 'DEFAULT';

-- AlterTable
ALTER TABLE "support_tickets" ALTER COLUMN "status" SET DEFAULT 'OPEN',
ALTER COLUMN "priority" SET DEFAULT 'MEDIUM';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'BASIC',
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
