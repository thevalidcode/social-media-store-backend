-- CreateTable
CREATE TABLE "public"."internal_api_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "data" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "internal_api_sessions_pkey" PRIMARY KEY ("id")
);
