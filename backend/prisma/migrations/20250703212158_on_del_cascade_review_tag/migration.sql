-- DropForeignKey
ALTER TABLE "ReviewTag" DROP CONSTRAINT "ReviewTag_review_id_fkey";

-- AddForeignKey
ALTER TABLE "ReviewTag" ADD CONSTRAINT "ReviewTag_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
