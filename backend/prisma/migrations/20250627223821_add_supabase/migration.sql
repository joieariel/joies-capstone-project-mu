/*
  Warnings:

  - A unique constraint covering the columns `[supabase_user_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "supabase_user_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_supabase_user_id_key" ON "User"("supabase_user_id");
