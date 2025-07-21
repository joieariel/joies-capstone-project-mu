-- CreateTable
CREATE TABLE "LikedCenter" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "center_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LikedCenter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LikedCenter_user_id_center_id_key" ON "LikedCenter"("user_id", "center_id");

-- AddForeignKey
ALTER TABLE "LikedCenter" ADD CONSTRAINT "LikedCenter_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikedCenter" ADD CONSTRAINT "LikedCenter_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "CommunityCenter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
