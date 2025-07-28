-- CreateTable
CREATE TABLE "stores" (
    "store_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "ssl" BOOLEAN NOT NULL DEFAULT false,
    "plan" TEXT NOT NULL DEFAULT 'starter',
    "status" TEXT NOT NULL DEFAULT 'active',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("store_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL,
    "ref_code" SERIAL,
    "uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "image" TEXT,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "status" TEXT NOT NULL DEFAULT 'active',
    "store_id" INTEGER NOT NULL,
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "spent" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "ref" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "image" TEXT,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "status" TEXT NOT NULL DEFAULT 'active',
    "store_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "min" INTEGER NOT NULL DEFAULT 1,
    "max" INTEGER NOT NULL DEFAULT 1,
    "position" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'active',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "sku" TEXT,
    "image_url" TEXT,
    "gallery_urls" TEXT[],
    "tags" TEXT[],
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "brand" TEXT,
    "weight" DECIMAL(65,30),
    "dimensions" TEXT,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "compare_price" DECIMAL(65,30),
    "discount_type" TEXT,
    "discount_value" DECIMAL(65,30),
    "slug" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "user_uid" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "shipping_address" TEXT NOT NULL,
    "billing_address" TEXT NOT NULL,
    "payment_method" TEXT NOT NULL,
    "tracking_number" TEXT,
    "estimated_delivery" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "store_id" INTEGER NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "admins_emails" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "emails" TEXT[],
    "store_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_settings" (
    "id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "percent" INTEGER NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'percentage',
    "store_id" INTEGER NOT NULL,

    CONSTRAINT "affiliate_settings_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "blogs" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'active',
    "position" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "image_url" TEXT,
    "banner_url" TEXT,
    "icon_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "position" INTEGER NOT NULL DEFAULT 1,
    "parent_uid" TEXT,
    "store_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "currencies" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quotes" JSONB NOT NULL,

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "design_styles" (
    "id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "hex" TEXT NOT NULL,
    "schema" JSONB NOT NULL,

    CONSTRAINT "design_styles_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "receiver" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message_id" TEXT,
    "response" TEXT,
    "store_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "position" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "general" (
    "id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Store',
    "logo_url" TEXT,
    "favicon_url" TEXT,
    "default_client_currency" TEXT,

    CONSTRAINT "general_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "session_codes" (
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "session_codes_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE UNIQUE INDEX "stores_uid_key" ON "stores"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "users_ref_code_key" ON "users"("ref_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_api_key_key" ON "users"("api_key");

-- CreateIndex
CREATE UNIQUE INDEX "admins_uid_key" ON "admins"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "admins_api_key_key" ON "admins"("api_key");

-- CreateIndex
CREATE UNIQUE INDEX "admins_emails_uid_key" ON "admins_emails"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_uid_key" ON "currencies"("uid");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_ref_fkey" FOREIGN KEY ("ref") REFERENCES "users"("ref_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins_emails" ADD CONSTRAINT "admins_emails_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_settings" ADD CONSTRAINT "affiliate_settings_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_styles" ADD CONSTRAINT "design_styles_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "general" ADD CONSTRAINT "general_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_codes" ADD CONSTRAINT "session_codes_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

