// import the convertTimeToMinutes function from centerFilters
const { convertTimeToMinutes } = require("./centerFilters");

// import days of the week from constants
const { daysOfWeek } = require("./constants");

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
const calculateDistanceSimilarity = (center1, center2) => {
  // handle edge cases - if either center is missing latitude or longitude
  if (
    !center1.latitude ||
    !center1.longitude ||
    !center2.latitude ||
    !center2.longitude
  ) {
    return 0;
  }

  // extract latitude and longitude values
  const lat1 = center1.latitude;
  const lon1 = center1.longitude;
  const lat2 = center2.latitude;
  const lon2 = center2.longitude;

  // calculate distance between centers using Haversine formula
  const earthRadius = 3959; // earth's radius in miles

  // calculate differences in latitude and longitude (in radians)
  const latDiff = ((lat2 - lat1) * Math.PI) / 180; // difference in latitude
  const lonDiff = ((lon2 - lon1) * Math.PI) / 180; // difference in longitude

  // convert lat values to radians for calculations
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;

  // note: a chord is a line segment that connects 2 points on a sphere (earth)
  // - half-chord is half the length of chord
  // calculate the squared half-chord length (haversin) between the 2 points
  const sqHalfChord =
    Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
    Math.sin(lonDiff / 2) *
      Math.sin(lonDiff / 2) *
      Math.cos(lat1Rad) *
      Math.cos(lat2Rad);

  // calculate angular distance (arcsin) between the 2 points
  const angDis =
    2 * Math.atan2(Math.sqrt(sqHalfChord), Math.sqrt(1 - sqHalfChord));

  // calculate linear distance between the 2 points using earth's radius and angular distance
  const distance = earthRadius * angDis;

  // define maximum distance threshold (centers beyond this are considered completely dissimilar)
  const MAX_DISTANCE = 25; // 25 miles threshold

  // normalize distance to a similarity score between 0-1
  // 1 = same location, 0 = MAX_DISTANCE or farther apart (dissimilar)
  const distSimilarity = Math.max(0, 1 - distance / MAX_DISTANCE);

  return distSimilarity;
};

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

// (5). description similarity score (jaccard similarity between descriptions)
// maybe implement later remove for now per PR comment

// 5. operating hours similarity score
const calculateHoursSimilarity = (hours1, hours2) => {
  // initialize variables to track total similarity across all days
  let totalSimilarity = 0;
  let daysCount = 0;

  // process each day of the week
  for (const day of daysOfWeek) {
    // find hours for this day for both centers
    const dayHours1 = hours1.find((h) => h.day === day);
    const dayHours2 = hours2.find((h) => h.day === day);

    // skip if hours data is missing for either center
    if (!dayHours1 || !dayHours2) continue;

    // if both centers are closed on this day, they have perfect similarity for the day
    if (dayHours1.is_closed && dayHours2.is_closed) {
      totalSimilarity += 1;
      daysCount++;
      continue;
    }

    // if one center is closed and the other is open, they have 0 similarity for the day
    if (dayHours1.is_closed || dayHours2.is_closed) {
      totalSimilarity += 0;
      daysCount++;
      continue;
    }

    // both centers are open, calculate overlap

    // check for null open/close times (should not happen if is_closed is false, but just in case)
    if (
      !dayHours1.open_time ||
      !dayHours1.close_time ||
      !dayHours2.open_time ||
      !dayHours2.close_time
    ) {
      continue;
    }

    // convert opening and closing times to minutes since midnight
    const open1 = convertTimeToMinutes(dayHours1.open_time);
    const close1 = convertTimeToMinutes(dayHours1.close_time);
    const open2 = convertTimeToMinutes(dayHours2.open_time);
    const close2 = convertTimeToMinutes(dayHours2.close_time);

    // calculate overlap start and end
    const overlapStart = Math.max(open1, open2);
    const overlapEnd = Math.min(close1, close2);

    // calculate overlap in minutes (if centers' hours don't overlap, this will be negative)
    const overlap = Math.max(0, overlapEnd - overlapStart);

    // calculate total coverage (from earliest open to latest close)
    const totalCoverage = Math.max(close1, close2) - Math.min(open1, open2);

    // calculate day similarity as overlap / total coverage
    const daySimilarity = overlap / totalCoverage;

    // add to total and increment days count
    totalSimilarity += daySimilarity;
    daysCount++;
  }

  // calculate average similarity across all days
  // if no valid days were processed, return 0
  return daysCount > 0 ? totalSimilarity / daysCount : 0;
};

// 6. calculate the final similarity score between two centers
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

  // 4. call the review similarity function

  // 5. call the hours similarity function
  calculateHoursSimilarity(center1.hours, center2.hours);

  // return weighted similarity score based on all factors
};

module.exports = {
  calculateTagSimilarity,
  calculateDistanceSimilarity,
  calculateRatingSimilarity,
  calculateHoursSimilarity,
  calculateCenterSimliarity,
};
