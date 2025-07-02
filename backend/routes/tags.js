const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();

// (GET) fetch all available tags (for selection purposes)
router.get("/", async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" }, // sort alphabetically
    });
    res.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch tags", details: error.message });
  }
});

// (POST) create a new tag
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    //validate that name exists and isn't white empty space
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Tag name is required" });
    }

    const newTag = await prisma.tag.create({
      data: {
        name: name.trim(),
      },
    });

    res.status(201).json(newTag);
  } catch (error) {
    console.error("Error creating tag:", error);
    res
      .status(500)
      .json({ error: "Failed to create tag", details: error.message });
  }
});

// (GET) fetch all tags for a specific community center
router.get("/center/:center_id", async (req, res) => {
  try {
    const { center_id } = req.params;

    // query the junction table to find all tag relationships for this center
    const centerTags = await prisma.centerTag.findMany({
      where: { center_id: parseInt(center_id) },
      include: {
        tag: true,
      },
    });
    // extract j the tag objects from relationship data creating an array of tags
    const tags = centerTags.map((ct) => ct.tag);
    res.json(tags);
  } catch (error) {
    console.error("Error fetching center tags:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch center tags", details: error.message });
  }
});

// (GET) fetch most used tags for a specific community center based on reviews
router.get("/center/:center_id/popular", async (req, res) => {
  try {
    const { center_id } = req.params;
    const limit = parseInt(req.query.limit) || 5; // default to top 5 tags

    // get all reviews for this center
    const reviews = await prisma.review.findMany({
      where: { center_id: parseInt(center_id) },
      select: { id: true },
    });

    // if there are no reviews for this center, return empty array
    if (reviews.length === 0) {
      return res.json([]);
    }

    // extract review ids into an array for use in nextquery
    const reviewIds = reviews.map((review) => review.id);

    // get tag usage count from ReviewTag table for this center's reviews
    const tagUsage = await prisma.reviewTag.groupBy({
      by: ["tag_id"], // group by tag_id column to count occurrences of each tag
      where: {
        review_id: { in: reviewIds }, // filter revieTag records to only those for this center's reviews
      },
      _count: {
        tag_id: true, // count occurrences of each tag
      },
      orderBy: {
        _count: {
          tag_id: "desc", // order by descending count of tag occurrences
        },
      },
      take: limit, // limit to top 5 tags
    });

    // get the actual tag details for the most used tags
    const tagIds = tagUsage.map((usage) => usage.tag_id); // extract tag ids from usage data for next query need the data (name)
    const tags = await prisma.tag.findMany({
      where: { id: { in: tagIds } },
    });

    // combine tag details with usage count and maintain order
    const popularTags = tagUsage.map((usage) => {
      // find the matching tag in the tags array to match usage data to tag details
      const tag = tags.find((t) => t.id === usage.tag_id);
      return {
        //combine all tag properties with usage count
        ...tag,
        usage_count: usage._count.tag_id,
      };
    });

    res.json(popularTags);
  } catch (error) {
    console.error("Error fetching popular center tags:", error);
    res.status(500).json({
      error: "Failed to fetch popular center tags",
      details: error.message,
    });
  }
});

// (POST) add a tag to a community center
router.post("/center/:center_id", async (req, res) => {
  try {
    const { center_id } = req.params;
    const { tag_id } = req.body;

    if (!tag_id) {
      return res.status(400).json({ error: "tag_id is required" });
    }

    // check if center exists
    const center = await prisma.communityCenter.findUnique({
      where: { id: parseInt(center_id) },
    });

    if (!center) {
      return res.status(404).json({ error: "Community center not found" });
    }

    // check if tag exists
    const tag = await prisma.tag.findUnique({
      where: { id: parseInt(tag_id) },
    });

    if (!tag) {
      return res.status(404).json({ error: "Tag not found" });
    }

    // create the many to many relationship in junction table (will fail if already exists due to unique constraint)
    const centerTag = await prisma.centerTag.create({
      data: {
        center_id: parseInt(center_id),
        tag_id: parseInt(tag_id),
      },
      include: {
        tag: true,
      },
    });

    res.status(201).json(centerTag);
  } catch (error) {
    console.error("Error adding tag to center:", error);
    // if the error is a P2002 (unique constraint violation), return a 409 (conflict)
    if (error.code === "P2002") {
      res.status(409).json({ error: "Tag already assigned to this center" });
    } else {
      res
        .status(500)
        .json({ error: "Failed to add tag to center", details: error.message });
    }
  }
});

// (DELETE) remove a tag from a community center
router.delete("/center/:center_id/tag/:tag_id", async (req, res) => {
  try {
    const { center_id, tag_id } = req.params;

    // find specific relationship between center and tag
    const centerTag = await prisma.centerTag.findFirst({
      where: {
        center_id: parseInt(center_id),
        tag_id: parseInt(tag_id),
      },
    });

    if (!centerTag) {
      return res.status(404).json({ error: "Tag assignment not found" });
    }
    // delete the relationship from junction table
    await prisma.centerTag.delete({
      where: { id: centerTag.id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error removing tag from center:", error);
    res.status(500).json({
      error: "Failed to remove tag from center",
      details: error.message,
    });
  }
});

module.exports = router;
