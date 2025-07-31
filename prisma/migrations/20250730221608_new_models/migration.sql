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
    "id" SERIAL NOT NULL,
    "store_scoped_id" INTEGER NOT NULL,
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

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "services" (
    "id" SERIAL NOT NULL,
    "store_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Default',
    "min" INTEGER NOT NULL DEFAULT 1,
    "max" INTEGER NOT NULL DEFAULT 1,
    "position" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'active',
    "provider_id" INTEGER,
    "provider_price" DECIMAL(65,30),
    "store_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sync_quantity" BOOLEAN DEFAULT true,
    "sync_cat_and_name" BOOLEAN DEFAULT true,
    "cancel" BOOLEAN,
    "network" TEXT,
    "refill" BOOLEAN,
    "percentage" DOUBLE PRECISION,
    "drip_feed" BOOLEAN DEFAULT false,
    "provider" TEXT,
    "provider_currency" TEXT,
    "refill_days" INTEGER,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0.00,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "store_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_uid" TEXT NOT NULL,
    "service_id" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "sync_order" BOOLEAN NOT NULL DEFAULT true,
    "synced" BOOLEAN NOT NULL DEFAULT false,
    "provider_currency" TEXT,
    "provider_price" DECIMAL(65,30),
    "provider_order_id" INTEGER,
    "provider" TEXT,
    "provider_error" TEXT,
    "quantity" INTEGER NOT NULL,
    "retry_count" INTEGER,
    "url" TEXT NOT NULL,
    "last_run_time" TIMESTAMP(3),
    "comments" TEXT NOT NULL DEFAULT '',
    "drip_feed" BOOLEAN NOT NULL DEFAULT false,
    "interval" INTEGER DEFAULT 0,
    "runs" INTEGER DEFAULT 0,
    "processed_runs" INTEGER DEFAULT 0,
    "start" INTEGER NOT NULL DEFAULT 0,
    "user_initial_balance" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "user_final_balance" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "remains" INTEGER NOT NULL DEFAULT 0,
    "store_id" INTEGER NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
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
    "id" SERIAL NOT NULL,
    "store_scoped_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'active',
    "position" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "store_scoped_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "description" TEXT NOT NULL DEFAULT '',
    "position" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
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
    "id" SERIAL NOT NULL,
    "store_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "hex" TEXT NOT NULL,
    "schema" JSONB NOT NULL,

    CONSTRAINT "design_styles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" SERIAL NOT NULL,
    "store_scoped_id" INTEGER NOT NULL,
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

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" SERIAL NOT NULL,
    "store_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" SERIAL NOT NULL,
    "store_scoped_id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "position" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "general" (
    "id" SERIAL NOT NULL,
    "store_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Store',
    "logo_url" TEXT,
    "favicon_url" TEXT,
    "default_client_currency" TEXT,

    CONSTRAINT "general_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "providers" (
    "id" SERIAL NOT NULL,
    "store_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sync" BOOLEAN NOT NULL DEFAULT false,
    "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "store_id" INTEGER NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refills" (
    "id" SERIAL NOT NULL,
    "store_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_uid" TEXT NOT NULL,
    "provider_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "provider_order_id" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_error" TEXT,
    "store_id" INTEGER NOT NULL,

    CONSTRAINT "refills_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "store_counters" (
    "store_id" INTEGER NOT NULL,
    "service_counter" INTEGER NOT NULL DEFAULT 0,
    "order_counter" INTEGER NOT NULL DEFAULT 0,
    "blog_counter" INTEGER NOT NULL DEFAULT 0,
    "faq_counter" INTEGER NOT NULL DEFAULT 0,
    "category_counter" INTEGER NOT NULL DEFAULT 0,
    "user_counter" INTEGER NOT NULL DEFAULT 0,
    "email_log_counter" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "store_counters_pkey" PRIMARY KEY ("store_id")
);

-- CreateTable
CREATE TABLE "upload_logs" (
    "id" SERIAL NOT NULL,
    "store_scoped_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "upload_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stores_uid_key" ON "stores"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "users_ref_code_key" ON "users"("ref_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_uid_key" ON "users"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "users_api_key_key" ON "users"("api_key");

-- CreateIndex
CREATE UNIQUE INDEX "users_store_id_store_scoped_id_key" ON "users"("store_id", "store_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "admins_uid_key" ON "admins"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "admins_api_key_key" ON "admins"("api_key");

-- CreateIndex
CREATE UNIQUE INDEX "services_uid_key" ON "services"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "services_store_id_store_scoped_id_key" ON "services"("store_id", "store_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_uid_key" ON "orders"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "orders_store_id_store_scoped_id_key" ON "orders"("store_id", "store_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "admins_emails_uid_key" ON "admins_emails"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_uid_key" ON "blogs"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_store_id_store_scoped_id_key" ON "blogs"("store_id", "store_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_uid_key" ON "categories"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "categories_store_id_store_scoped_id_key" ON "categories"("store_id", "store_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_uid_key" ON "currencies"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "design_styles_uid_key" ON "design_styles"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "design_styles_store_id_store_scoped_id_key" ON "design_styles"("store_id", "store_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_logs_uid_key" ON "email_logs"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "email_logs_store_id_store_scoped_id_key" ON "email_logs"("store_id", "store_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_uid_key" ON "email_templates"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_store_id_store_scoped_id_key" ON "email_templates"("store_id", "store_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "faqs_uid_key" ON "faqs"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "faqs_store_id_store_scoped_id_key" ON "faqs"("store_id", "store_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "general_uid_key" ON "general"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "general_store_id_store_scoped_id_key" ON "general"("store_id", "store_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "providers_uid_key" ON "providers"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "providers_store_id_store_scoped_id_key" ON "providers"("store_id", "store_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "refills_uid_key" ON "refills"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "refills_store_id_store_scoped_id_key" ON "refills"("store_id", "store_scoped_id");

-- CreateIndex
CREATE UNIQUE INDEX "upload_logs_uid_key" ON "upload_logs"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "upload_logs_store_id_store_scoped_id_key" ON "upload_logs"("store_id", "store_scoped_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_ref_fkey" FOREIGN KEY ("ref") REFERENCES "users"("ref_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "providers" ADD CONSTRAINT "providers_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refills" ADD CONSTRAINT "refills_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_codes" ADD CONSTRAINT "session_codes_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_counters" ADD CONSTRAINT "store_counters_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_logs" ADD CONSTRAINT "upload_logs_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;
