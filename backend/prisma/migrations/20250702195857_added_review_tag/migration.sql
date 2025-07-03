-- CreateTable
CREATE TABLE "ReviewTag" (
    "id" SERIAL NOT NULL,
    "review_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "ReviewTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReviewTag_review_id_tag_id_key" ON "ReviewTag"("review_id", "tag_id");

-- AddForeignKey
ALTER TABLE "ReviewTag" ADD CONSTRAINT "ReviewTag_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewTag" ADD CONSTRAINT "ReviewTag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
