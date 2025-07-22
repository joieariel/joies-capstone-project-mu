-- CreateTable
CREATE TABLE "Dislikes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "center_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dislikes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dislikes_user_id_center_id_key" ON "Dislikes"("user_id", "center_id");

-- AddForeignKey
ALTER TABLE "Dislikes" ADD CONSTRAINT "Dislikes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dislikes" ADD CONSTRAINT "Dislikes_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "CommunityCenter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
