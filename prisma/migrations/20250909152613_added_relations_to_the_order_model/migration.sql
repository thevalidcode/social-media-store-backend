-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_service_uid_fkey" FOREIGN KEY ("service_uid") REFERENCES "public"."services"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
