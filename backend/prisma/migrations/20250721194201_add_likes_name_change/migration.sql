/*
  Warnings:

  - You are about to drop the `LikedCenter` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LikedCenter" DROP CONSTRAINT "LikedCenter_center_id_fkey";

-- DropForeignKey
ALTER TABLE "LikedCenter" DROP CONSTRAINT "LikedCenter_user_id_fkey";

-- DropTable
DROP TABLE "LikedCenter";

-- CreateTable
CREATE TABLE "Likes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "center_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Likes_user_id_center_id_key" ON "Likes"("user_id", "center_id");

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "CommunityCenter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
