const express = require("express");
const { PrismaClient } = require("@prisma/client");
const {
  applyTagFilters,
  applyDistanceFilters,
  applyHoursFilters,
  applyRatingFilters,
  enrichCentersWithData,
} = require("../utils/centerFilters");
const { calculateCenterSimliarity } = require("../utils/recommendationEngine");
const simpleCache = require("../utils/simpleCache"); // import cache file so we can use cache functions

const router = express.Router();
const prisma = new PrismaClient();

// (GET) fetch all community centers
router.get("/", async (req, res) => {
  try {
    // extract all query parameters including new advanced search params
    const { zip_code, distance, hours, rating, userLat, userLng, tags } =
      req.query;

    // parse arrays from query parameters using repeated query params instead of commas like og (e.g., ?tags=1&tags=2&tags=3)

    // handle array parameters (when using ?param=value1&param=value2 format)
    // if only one value is provided, it will be a string, so convert it to an array
    const distanceFilters = Array.isArray(distance)
      ? distance
      : distance
      ? [distance]
      : [];
    const hoursFilters = Array.isArray(hours) ? hours : hours ? [hours] : [];
    const ratingFilters = Array.isArray(rating)
      ? rating
      : rating
      ? [rating]
      : [];

    // for convert values to numbers
    const tagFilters = Array.isArray(tags)
      ? tags.map(Number)
      : tags
      ? [Number(tags)]
      : [];

    // parse user location coordinates
    const userLatitude = userLat ? parseFloat(userLat) : null;
    const userLongitude = userLng ? parseFloat(userLng) : null;

    // basic filter for zip code ( existing functionality)
    const filter = zip_code ? { zip_code: { equals: zip_code } } : {};

    // fetch community centers with related data needed for filtering
    const communityCenters = await prisma.CommunityCenter.findMany({
      where: filter,
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

    // initialize filtered centers with all fetched centers
    let filteredCenters = communityCenters;

    // apply tag filtering if tag filters are provided
    filteredCenters = applyTagFilters(filteredCenters, tagFilters);

    // apply distance filtering
    filteredCenters = await applyDistanceFilters(
      filteredCenters,
      distanceFilters,
      userLatitude,
      userLongitude
    );

    // apply hours filtering
    filteredCenters = applyHoursFilters(filteredCenters, hoursFilters);

    // apply rating filters and sorting
    const sortedCenters = applyRatingFilters(filteredCenters, ratingFilters);
    // enrich centers with calculated fields
    const enrichedCenters = enrichCentersWithData(sortedCenters);

    res.json(enrichedCenters);
  } catch (error) {
    console.error("Error fetching community centers:", error);
    res.status(500).json({ error: "Failed to fetch community centers" });
  }
});

// (get) fetch a single community center by id
router.get("/:communityCenterId", async (req, res) => {
  try {
    const communityCenterId = parseInt(req.params.communityCenterId);
    // check if community center id is a number using isNaN
    if (isNaN(communityCenterId)) {
      return res.status(400).json({ error: "Invalid community center ID" });
    }

    const communityCenter = await prisma.CommunityCenter.findUnique({
      where: { id: communityCenterId },
    });

    if (!communityCenter) {
      return res.status(404).json({ error: "Community center not found" });
    }

    res.json(communityCenter);
  } catch (error) {
    console.error("Error fetching community center:", error);
    res.status(500).json({ error: "Failed to fetch community center" });
  }
});

// (GET) fetch recommendations for a specific community center
router.get("/:communityCenterId/recommendations", async (req, res) => {
  try {
    // extract community center id from url params convert to int
    const communityCenterId = parseInt(req.params.communityCenterId);

    // get the limit of recommendations from query params, default to 5 if not provided
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;

    // check if community center id is a number using isNaN
    if (isNaN(communityCenterId)) {
      return res.status(400).json({ error: "Invalid community center ID" });
    }

    // create a cache key based on the community center ID and limit
    const cacheKey = `recommendations_${communityCenterId}_${limit}`;
    // this ensures diff recommendation requests get their own cache entries

    // check if we have cached recommendations
    const cachedRecommendations = simpleCache.get(cacheKey);
    if (cachedRecommendations) {
      return res.json(cachedRecommendations);
    }


    // fetch the target community center with all necessary related data for similarity calculations
    const targetCenter = await prisma.CommunityCenter.findUnique({
      where: { id: communityCenterId },
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

    // check if the target center exists
    if (!targetCenter) {
      return res.status(404).json({ error: "Community center not found" });
    }

    // fetch all other community centers with the same related data to create comparison pool
    const allOtherCenters = await prisma.CommunityCenter.findMany({
      where: {
        id: { not: communityCenterId }, // exclude the target center
      },
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

    // calculate similarity scores between the target center and all other centers
    // use the original centers for similarity calculation to ensure all properties are available
    const centersWithSimilarityScores = allOtherCenters.map(center => {
      try {
        const similarityScore = calculateCenterSimliarity(targetCenter, center);
        return {
          ...center,
          similarityScore
        };
      } catch (error) {
        console.error(`Error calculating similarity for center ${center.id}:`, error);
        return {
          ...center,
          similarityScore: 0 // default to 0 similarity if calculation fails
        };
      }
    });

    // sort centers by similarity score (highest first - descending order)
    const sortedCenters = centersWithSimilarityScores
      .sort((a, b) => b.similarityScore - a.similarityScore)
      // take only the top N (limit) recommendations
      .slice(0, limit);

    // now enrich the centers with calculated fields for the response
    const enrichedRecommendations = enrichCentersWithData(sortedCenters);

    // store the results in cache w a TTL of  1 hour
    simpleCache.set(cacheKey, enrichedRecommendations, 3600);

    res.json(enrichedRecommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

module.exports = router;
