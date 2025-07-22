const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticateUser } = require("../middleware/auth");
const { clearCenterCache } = require("../utils/cacheUtils");
const { getUserIdFromSupabase } = require("../utils/userUtils");
const { enrichCentersWithData } = require("../utils/centerFilters");
const router = express.Router();
const prisma = new PrismaClient();

// (POST) add a like
router.post("/", authenticateUser, async (req, res) => {
  try {
    // get user ID from authenticated user
    const userId = await getUserIdFromSupabase(req.user.id);
    if (!userId) {
      return res.status(400).json({ error: "User not found in database" });
    }

    const { center_id } = req.body;
    if (!center_id) {
      return res.status(400).json({ error: "center_id is required" });
    }

    // check if the community center exists
    const centerExists = await prisma.communityCenter.findUnique({
      where: { id: parseInt(center_id) },
    });

    if (!centerExists) {
      return res.status(404).json({ error: "Community center not found" });
    }

    // create the like
    const like = await prisma.likes.create({
      data: {
        user_id: userId,
        center_id: parseInt(center_id),
      },
    });

    // clear cache for this community center
    clearCenterCache(parseInt(center_id));

    res.status(201).json(like);
  } catch (error) {
    // handle unique constraint violation (user already liked this center)
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "You have already liked this community center",
      });
    }

    console.error("Error adding like:", error);
    res.status(500).json({
      error: "Failed to add like",
      details: error.message,
    });
  }
});

// (DELETE) remove a like (unlike)
router.delete("/:center_id", authenticateUser, async (req, res) => {
  try {
    // get user if from authenticated user
    const userId = await getUserIdFromSupabase(req.user.id);
    if (!userId) {
      return res.status(400).json({ error: "User not found in database" });
    }

    const { center_id } = req.params;

    // check if the like exists
    const existingLike = await prisma.likes.findFirst({
      where: {
        user_id: userId,
        center_id: parseInt(center_id),
      },
    });

    if (!existingLike) {
      return res.status(404).json({ error: "Like not found" });
    }

    // remove/delte the like
    await prisma.likes.delete({
      where: {
        id: existingLike.id,
      },
    });

    // clear cache for this community center
    clearCenterCache(parseInt(center_id));

    res.status(204).send();
  } catch (error) {
    console.error("Error removing like:", error);
    res.status(500).json({
      error: "Failed to remove like",
      details: error.message,
    });
  }
});

// (GET) endpoint to retrieve a user's likes
router.get("/user", authenticateUser, async (req, res) => {
  try {
    // get user id from authenticated user
    const userId = await getUserIdFromSupabase(req.user.id);
    if (!userId) {
      return res.status(400).json({ error: "User not found in database" });
    }

    // get all likes for the user with community center details
    const likes = await prisma.likes.findMany({
      where: {
        user_id: userId,
      },
      include: {
        center: {
          include: {
            hours: true,
            reviews: {
              select: {
                rating: true,
                created_at: true,
              },
            },
            centerTags: {
              include: {
                tag: true,
              },
            },
          }
        },
      },
      orderBy: {
        created_at: "desc", // most recent likes first
      },
    });

    // extract centers from likes and enrich them with calculated fields
    const centers = likes.map(like => like.center);
    const enrichedCenters = enrichCentersWithData(centers);

    // reconstruct the likes with enriched centers
    const enrichedLikes = likes.map((like, index) => ({
      ...like,
      center: enrichedCenters[index]
    }));

    res.json(enrichedLikes);
  } catch (error) {
    console.error("Error fetching user likes:", error);
    res.status(500).json({
      error: "Failed to fetch likes",
      details: error.message,
    });
  }
});

// (GET) check if a user has liked a specific center
router.get("/check/:center_id", authenticateUser, async (req, res) => {
  try {
    const userId = await getUserIdFromSupabase(req.user.id);
    if (!userId) {
      return res.status(400).json({ error: "User not found in database" });
    }

    const { center_id } = req.params;

    // check if the like exists
    const like = await prisma.likes.findFirst({
      where: {
        user_id: userId,
        center_id: parseInt(center_id),
      },
    });

    //  true if the like exists, false otherwise
    res.json({ liked: !!like });
  } catch (error) {
    console.error("Error checking like status:", error);
    res.status(500).json({
      error: "Failed to check like status",
      details: error.message,
    });
  }
});

module.exports = router;
