// import the center similarity function
const { calculateCenterSimliarity } = require("./recommendationEngine");

// calculate the similarity between a candidate center and a user's liked/disliked centers
// takes in the candidate center and an array of liked/disliked centers
const calculateLikedSimilarity = (
  candidateCenter,
  likedCenters,
  dislikedCenters
) => {
  // handle edge case - if user has no liked centers, return neutral score (possibly a new user)
  if (!likedCenters || likedCenters.length === 0) {
    return 0.5; // return a neutral score
  }
  // calculate similarity to liked centers using average instead of max since avg is less sensitive to outliers and better reflects overall preferences
  let totalLikeSimilarity = 0;
  // loop through liked centers and calculate similarity to candidate center
  for (const likedCenter of likedCenters) {
    const similarity = calculateCenterSimliarity(candidateCenter, likedCenter);
    totalLikeSimilarity += similarity;
  }
  const avgLikeSimilarity = totalLikeSimilarity / likedCenters.length;

  // handle edge case - if user has no disliked centers
  if (!dislikedCenters || dislikedCenters.length === 0) {
    return avgLikeSimilarity; // return avg similarity to liked centers only
  }

  // calculate similarity to disliked centers using average
  let totalDislikeSimilarity = 0;
  for (const dislikedCenter of dislikedCenters) {
    const similarity = calculateCenterSimliarity(candidateCenter, dislikedCenter);

    // handle edge case - if center is too similar (over 80%) to a disliked center, exclude it
    if (similarity > 0.8) {
      return 0; // exclude centers very similar to disliked ones
    }

    totalDislikeSimilarity += similarity;
  }
  const avgDislikeSimilarity = totalDislikeSimilarity / dislikedCenters.length;

  // reduce score based on similarity to disliked centers
  // edge case - ensure final score is within valid range [0, 1]
  const finalScore = avgLikeSimilarity * (1 - avgDislikeSimilarity);
  return Math.max(0, Math.min(1, finalScore));
};

// 2. function to track which filters the user clicks most often while browsing
// purpose identify most relevant filters to the user and recommend centers with those
// takes in the userid and an optional limit (optional) to return only the top # most clicked filters
const findMostClickedFilters = async (userId, prisma, limit = 5) => {
  try {
    // handle edge case - if no userId or invalid ID provided
    if (!userId) {
      return [];
    }

    // query the filter interaction table from db for the user's filter interactions
    // ordered by filter_count (most clicked first) and then by last_used (most recent first)
    const filterInteractions = await prisma.filterInteraction.findMany({
      where: {
        user_id: userId,
      },
      orderBy: [
        { filter_count: "desc" }, // prioritize most frequently used filters
        { last_used: "desc" }, // for equal counts, prioritize recently used filters
      ],
      include: {
        tag: true, // include the associated tag data
      },
      take: limit, // limit the number of results returned
    });

    // handle edge case - if user has no filter interactions
    if (!filterInteractions || filterInteractions.length === 0) {
      return [];
    }

    // extract and return the tag data with interaction counts
    return filterInteractions.map((interaction) => ({
      tagId: interaction.tag_id,
      tagName: interaction.tag.name,
      count: interaction.filter_count,
      lastUsed: interaction.last_used,
    }));
    // error handling
  } catch (error) {
    console.error("Error finding most clicked filters:", error);
    return []; // return empty array on error
  }
};

// 2a. function to calculate filter alignment score between user preferences and a center
// takes in the user's preferred filters and the candidate center's tags
const calculateFilterAlignmentScore = (userPreferredFilters, centerTags) => {
  // handle edge cases - if no user filters or center has no tags
  if (
    !userPreferredFilters ||
    userPreferredFilters.length === 0 ||
    !centerTags ||
    centerTags.length === 0
  ) {
    return 0; // no alignment possible
  }

  // extract tag IDs from center tags - handle different possible formats of tag objects
  const centerTagIds = centerTags.map((ct) =>
    typeof ct === "object" && ct.tag_id // handle case where tag object has tag_id property
      ? ct.tag_id
      : typeof ct === "object" && ct.id // handle case where tag object has id property
      ? ct.id
      : ct // handle case where tag is just a string id
  );

  // keep track of how many of the user's preferred filters match the center's tags
  let matchCount = 0;
  let weightedScore = 0;

  // calculate a weighted score based on filter usage frequency
  // filters used more frequently contribute more to the score
  userPreferredFilters.forEach((filter, index) => {
    const tagId = filter.tagId; // extract tag ID from filter object
    if (centerTagIds.includes(tagId)) { // check if tag ID matches any of the center's tags
      matchCount++; // increment match count

      // apply a weight based on filter position (most clicked = highest weight) and normalize the weight to 0-1
      const positionWeight = 1 - index / userPreferredFilters.length;

      // use the filter count as a multiplier for the weight
      weightedScore += positionWeight * (filter.count / 10); // normalize count impact
    }
  });


  // normalize the final score to be between 0 and 1
  // higher scores indicate better alignment with the user's filter preferences
  return Math.min(1, weightedScore);
};

// 2b. function to record filter interactions when a user clicks on a filter
// this functoin updates the filter_count and last_used timestamp in db
const recordFilterInteraction = async (userId, tagId, prisma) => {
  try {
    // handle edge cases - if no userId or tagId provided
    if (!userId || !tagId) {
      console.error(
        "Missing required parameters for recording filter interaction"
      );
      return null;
    }

    // use upsert to either update an existing record or create a new one
    const result = await prisma.filterInteraction.upsert({
      where: {
        // use the unique constraint on user_id and tag_id to find an existing record for this specific user-tag combo
        user_id_tag_id: {
          user_id: userId,
          tag_id: tagId,
        },
      },
      // if the record exists, update the count and timestamp
      update: {
        filter_count: { increment: 1 }, // increment the existing count
        last_used: new Date(), // update the timestamp to now
      },
      // if record doesn't exist, create a new one
      create: {
        user_id: userId,
        tag_id: tagId,
        filter_count: 1, // start with count of 1
        last_used: new Date(), // set initial timestamp
      },
    });

    return result; // return the updated or created record

    // error handling
  } catch (error) {
    console.error("Error recording filter interaction:", error);
    return null;
  }
};

// 3. function to track on-page interaction behavior (clicks, scrolls, etc.)

module.exports = {
  calculateLikedSimilarity,
  findMostClickedFilters,
  calculateFilterAlignmentScore,
  recordFilterInteraction,
};
