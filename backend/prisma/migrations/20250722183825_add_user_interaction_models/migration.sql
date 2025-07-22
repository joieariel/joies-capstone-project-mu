-- CreateTable
CREATE TABLE "FilterInteraction" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "filter_count" INTEGER NOT NULL DEFAULT 1,
    "last_used" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FilterInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageInteraction" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "center_id" INTEGER NOT NULL,
    "scroll_depth" INTEGER NOT NULL DEFAULT 0,
    "map_clicks" INTEGER NOT NULL DEFAULT 0,
    "review_clicks" INTEGER NOT NULL DEFAULT 0,
    "similar_clicks" INTEGER NOT NULL DEFAULT 0,
    "visit_count" INTEGER NOT NULL DEFAULT 1,
    "last_visited" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FilterInteraction_user_id_tag_id_key" ON "FilterInteraction"("user_id", "tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "PageInteraction_user_id_center_id_key" ON "PageInteraction"("user_id", "center_id");

-- AddForeignKey
ALTER TABLE "FilterInteraction" ADD CONSTRAINT "FilterInteraction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilterInteraction" ADD CONSTRAINT "FilterInteraction_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageInteraction" ADD CONSTRAINT "PageInteraction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageInteraction" ADD CONSTRAINT "PageInteraction_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "CommunityCenter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
