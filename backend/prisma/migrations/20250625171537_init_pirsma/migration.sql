-- CreateTable
CREATE TABLE "_ReviewTagToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ReviewTagToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ReviewTagToTag_B_index" ON "_ReviewTagToTag"("B");

-- AddForeignKey
ALTER TABLE "_ReviewTagToTag" ADD CONSTRAINT "_ReviewTagToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "ReviewTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReviewTagToTag" ADD CONSTRAINT "_ReviewTagToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
