/*
  Warnings:

  - You are about to drop the `ReviewTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ReviewTag";

-- CreateTable
CREATE TABLE "CenterTag" (
    "id" SERIAL NOT NULL,
    "center_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "CenterTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CenterTag_center_id_tag_id_key" ON "CenterTag"("center_id", "tag_id");

-- AddForeignKey
ALTER TABLE "CenterTag" ADD CONSTRAINT "CenterTag_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "CommunityCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CenterTag" ADD CONSTRAINT "CenterTag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
