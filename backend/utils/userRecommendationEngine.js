// import the center similarity function
const { calculateCenterSimliarity } = require("./recommendationEngine");

// calculate the similarity between a candidate center and a user's liked/disliked centers
// takes in the candidate center and an array of liked/disliked centers
const calculateLikedSimilarity = (candidateCenter, likedCenters, dislikedCenters) => {

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

// 3. function to track on-page interaction behavior (clicks, scrolls, etc.)

module.exports = {
  calculateLikedSimilarity
};
