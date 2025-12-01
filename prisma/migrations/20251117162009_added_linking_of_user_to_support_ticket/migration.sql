-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
