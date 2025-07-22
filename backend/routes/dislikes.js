const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticateUser } = require("../middleware/auth");
const { clearCenterCache } = require("../utils/cacheUtils");
const { getUserIdFromSupabase } = require("../utils/userUtils");
const { enrichCentersWithData } = require("../utils/centerFilters");
const router = express.Router();
const prisma = new PrismaClient();

// (POST) add a dislike
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

    // create the dislike
    const dislike = await prisma.dislikes.create({
      data: {
        user_id: userId,
        center_id: parseInt(center_id),
      },
    });

    // clear cache for this community center
    clearCenterCache(parseInt(center_id));

    res.status(201).json(dislike);
  } catch (error) {
    // handle unique constraint violation (user already disliked this center)
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "You have already disliked this community center",
      });
    }

    console.error("Error adding dislike:", error);
    res.status(500).json({
      error: "Failed to add dislike",
      details: error.message,
    });
  }
});

// (DELETE) remove a dislike
router.delete("/:center_id", authenticateUser, async (req, res) => {
  try {
    // get user id from authenticated user
    const userId = await getUserIdFromSupabase(req.user.id);
    if (!userId) {
      return res.status(400).json({ error: "User not found in database" });
    }

    const { center_id } = req.params;

    // check if the dislike exists
    const existingDislike = await prisma.dislikes.findFirst({
      where: {
        user_id: userId,
        center_id: parseInt(center_id),
      },
    });

    if (!existingDislike) {
      return res.status(404).json({ error: "Dislike not found" });
    }

    // remove/delete the dislike
    await prisma.dislikes.delete({
      where: {
        id: existingDislike.id,
      },
    });

    // clear cache for this community center
    clearCenterCache(parseInt(center_id));

    res.status(204).send();
  } catch (error) {
    console.error("Error removing dislike:", error);
    res.status(500).json({
      error: "Failed to remove dislike",
      details: error.message,
    });
  }
});

// (GET) endpoint to retrieve a user's dislikes
router.get("/user", authenticateUser, async (req, res) => {
  try {
    // get user id from authenticated user
    const userId = await getUserIdFromSupabase(req.user.id);
    if (!userId) {
      return res.status(400).json({ error: "User not found in database" });
    }

    // get all dislikes for the user with community center details
    const dislikes = await prisma.dislikes.findMany({
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
          },
        },
      },
      orderBy: {
        created_at: "desc", // most recent dislikes first
      },
    });

    // extract centers from dislikes and enrich them with calculated fields
    const centers = dislikes.map((dislike) => dislike.center);
    const enrichedCenters = enrichCentersWithData(centers);

    // reconstruct the dislikes with enriched centers
    const enrichedDislikes = dislikes.map((dislike, index) => ({
      ...dislike,
      center: enrichedCenters[index],
    }));

    res.json(enrichedDislikes);
  } catch (error) {
    console.error("Error fetching user dislikes:", error);
    res.status(500).json({
      error: "Failed to fetch dislikes",
      details: error.message,
    });
  }
});

// (GET) check if a user has disliked a specific center
router.get("/check/:center_id", authenticateUser, async (req, res) => {
  try {
    const userId = await getUserIdFromSupabase(req.user.id);
    if (!userId) {
      return res.status(400).json({ error: "User not found in database" });
    }

    const { center_id } = req.params;

    // check if the dislike exists
    const dislike = await prisma.dislikes.findFirst({
      where: {
        user_id: userId,
        center_id: parseInt(center_id),
      },
    });

    // return true if the dislike exists, false otherwise
    res.json({ disliked: !!dislike });
  } catch (error) {
    console.error("Error checking dislike status:", error);
    res.status(500).json({
      error: "Failed to check dislike status",
      details: error.message,
    });
  }
});

module.exports = router;
