// file for all recommendation logic (similarity scores)
// 1 is perfect match, 0 is no match

// 1.  tags simliarity score (jaccard similarity) - calculate the similarity between two sets of tags
const calculateTagSimilarity = (tag1, tag2) => {
  // handle edge cases - if both tags are empty
  if (tag1.length === 0 && tag2.length === 0) {
    return 1; // because they are 100% similar
  }

  // edge case 2 - if one tag is empty
  if (tag1.length === 0 || tag2.length === 0) {
    return 0; // bc they are not similar if one is empty
  }

  // extract tag names from the tag objects
  const tagName1 = tag1.map((tag) => tag.name);
  const tagName2 = tag2.map((tag) => tag.name);

  // create sets of tag names to use jaccard similarity
  const set1 = new Set(tagName1);
  const set2 = new Set(tagName2);

  // calculate the overlap/intersection (shared tags in both sets)
  const overlap = new Set([...set1].filter((tag) => set2.has(tag)));

  // calculate the union (all unique tags in both sets)
  const uniqueTags = new Set([...set1, ...set2]);

  // return the jaccard similarity score (intersection size)
  return overlap.size / uniqueTags.size;
};

// 2.  location similarity score (normalized distance between two locations)

// 3.  rating similarity score (normalized absolute difference)
const calculateRatingSimilarity = (rating1, rating2) => {
  // handle edge cases - if either rating is null/undefined
  if (
    rating1 === null ||
    rating1 === undefined ||
    rating2 === null ||
    rating2 === undefined
  ) {
    return 0; // bc not similar if one rating is null/undefined and the other is not
  }

  // edge case 2 - if ratings are identical they are 1 (highest similarity)
  if (rating1 === rating2) {
    return 1;
  }

  // define max possible difference (1-5 scale)
  const MAX_DIFFERENCE = 4;

  // calculate the absolute difference
  const absDiff = Math.abs(rating1 - rating2);

  // return the normalized absolute difference
  return 1 - absDiff / MAX_DIFFERENCE;
};

// 4. review sentiment similarity score (average sentiment of both centers)

// 5. description similarity score (jaccard similarity between descriptions)

// 6. operating hours similarity score

// calculate the final similarity score between two centers
const calculateCenterSimliarity = (center1, center2) => {
  // extract tags from centers
  const tag1 = center1.centerTags.map((ct) => ct.tag);
  const tag2 = center2.centerTags.map((ct) => ct.tag);

  // extract ratings from reviews of a center
  const rating1 = center1.reviews.map((r) => r.rating);
  const rating2 = center2.reviews.map((r) => r.rating);

  // 1. call the tag similarity function
  calculateTagSimilarity(tag1, tag2);

  // 2. call the rating similarity function
  calculateRatingSimilarity(rating1, rating2);

  // return weighted similarity score based on all factors
};

module.exports = {
  calculateTagSimilarity,
  calculateRatingSimilarity,
  calculateCenterSimliarity,
};
