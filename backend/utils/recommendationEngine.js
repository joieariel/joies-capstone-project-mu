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

  // return the jaccard similarity score
  return overlap.size / uniqueTags.size;
};

// 2.  location/distance similarity score (normalized distance between two locations)
// converts raw distance in miles to a normalized 0-1 score
const calculateDistanceSimilarity = () => {};

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
const calculateReviewSimilarity = () => {};

// 5. description similarity score (jaccard similarity between descriptions)
const calculateDescriptionSimilarity = (desc1, desc2) => {
  // define common english stop words
  const stopWords = new Set([
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "is",
    "are",
    "was",
    "were",
    "in",
    "on",
    "at",
    "to",
    "for",
    "with",
    "by",
    "about",
    "of",
    "from",
    "as",
    "this",
    "that",
    "these",
    "those",
    "it",
    "its",
    "they",
    "them",
    "their",
    "we",
    "our",
    "you",
    "your",
    "he",
    "she",
    "his",
    "her",
  ]);

  // helper to normalize text - convert to lowercase and remove punctuation
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, "") // remove punctuation
      .replace(/\s+/g, " ") // replace multiple spaces with a single space
      .trim();
  };

  // helper to process descriptions: normalize, remove stop words, and create word sets
  const processDescription = (description) => {
    const normalized = normalizeText(description);
    const words = normalized.split(" ");
    // filter out the stop words and empty strings
    return new Set(words.filter((word) => word && !stopWords.has(word)));
  };

  // create word sets for each description
  const wordSet1 = processDescription(desc1);
  const wordSet2 = processDescription(desc2);

  // calculate the overlap/intersection (shared words in both sets)
  const overlap = new Set([...wordSet1].filter((word) => wordSet2.has(word)));

  // calculate the union (all unique words in both sets)
  const uniqueWords = new Set([...wordSet1, ...wordSet2]);

  // return the jaccard similarity score
  return overlap.size / uniqueWords.size;
};

// 6. operating hours similarity score
const calculateHoursSimilarity = () => {};

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

  // 2. call the distance similarity function
  calculateDistanceSimilarity(center1, center2);


  // 3. call the rating similarity function
  calculateRatingSimilarity(rating1, rating2);



  // return weighted similarity score based on all factors
};

module.exports = {
  calculateTagSimilarity,
  calculateRatingSimilarity,
  calculateDescriptionSimilarity,
  calculateCenterSimliarity,
};
