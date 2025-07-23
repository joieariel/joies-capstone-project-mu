// user personalized recommendation endpoints
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();
const { enrichCentersWithData } = require("../utils/centerFilters");
const {
  calculatePersonalizedScore,
  findMostClickedFilters,
} = require("../utils/userRecommendationEngine");
const { authenticateUser } = require("../middleware/auth");
const simpleCache = require("../utils/simpleCache");

// (GET) fetch personalized recommendations for the current user based on their preferences and behavior
// requires authentication to identify the user
router.get("/personalized-recommendations", authenticateUser, async (req, res) => {
  try {
    // get user id from auth middleware
    const userId = req.user.id;

    // get limit parameter from query (default to 5)
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;

    // create a cache key based on the user id and limit
    const cacheKey = `user_recommendations_${userId}_${limit}`;

    // check if we have cached recommendations for this user
    const cachedRecommendations = simpleCache.get(cacheKey);
    if (cachedRecommendations) {
      return res.json(cachedRecommendations);
    }

    // 1. get user's liked centers
    const likedCenters = await prisma.likes.findMany({
      where: { user_id: userId },
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
    });

    // 2. get user's disliked centers
    const dislikedCenters = await prisma.dislikes.findMany({
      where: { user_id: userId },
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
    });

    // 3. get user's filter preferences
    const filterPreferences = await findMostClickedFilters(userId, prisma);

    // 4. get all centers to rank
    const allCenters = await prisma.communityCenter.findMany({
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
    });

    // 5. score each center based on multiple factors
    const scoredCenters = await Promise.all(
      allCenters.map(async (center) => {
        // skip centers the user has already liked or disliked
        if (
          likedCenters.some((lc) => lc.center_id === center.id) ||
          dislikedCenters.some((dc) => dc.center_id === center.id)
        ) {
          return null;
        }

        // calculate personalized score for this center
        const recommendationScore = await calculatePersonalizedScore(
          userId,
          center,
          likedCenters.map((lc) => lc.center),
          dislikedCenters.map((dc) => dc.center),
          filterPreferences,
          prisma
        );

        return {
          ...center,
          recommendationScore,
        };
      })
    );

    // 6. filter out nulls and sort by score
    const recommendations = scoredCenters
      .filter((center) => center !== null)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);

    // 7. enrich centers with calculated fields
    const enrichedRecommendations = enrichCentersWithData(recommendations);

    // store the results in cache with a TTL of 30 minutes
    simpleCache.set(cacheKey, enrichedRecommendations, 1800);

    res.json(enrichedRecommendations);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});


module.exports = router;
