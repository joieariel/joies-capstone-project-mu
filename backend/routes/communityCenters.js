const express = require("express"); //import express
const { PrismaClient } = require("@prisma/client"); // require prisma client
const { Client } = require("@googlemaps/google-maps-services-js"); // import Google Maps client
const router = express.Router(); // import express router
const prisma = new PrismaClient(); // create new prisma client
const googleMapsClient = new Client({}); // create Google Maps client

// helper functions  for advanced search functionality (distance, operating hours checks, rating)
// maybe add to utils.js file later

// coordinate class to encapsulate latitude and longitude
class Coordinate {
  constructor(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }
}
// get distances from google distance matrix api
// takes in user coordinates and array of center coordinates (one to many)
const getDistancesFromGoogle = async (userCoord, centerCoords) => {
  try {
    // firs validate coordinates to avoid invalid api calls
    const validCenterCoords = centerCoords.filter(coord => {
      // check if coordinates are valid (not 0,0 and within reasonable bounds)
      return (
        coord.latitude !== 0 &&
        coord.longitude !== 0 &&
        Math.abs(coord.latitude) <= 90 &&
        Math.abs(coord.longitude) <= 180
      );
    });

    // if no valid coordinates, return null
    if (validCenterCoords.length === 0) {
      console.error("No valid center coordinates provided");
      return null;
    }

    const response = await googleMapsClient.distancematrix({
      params: {
        origins: [`${userCoord.latitude},${userCoord.longitude}`],
        destinations: validCenterCoords.map(
          (coord) => `${coord.latitude},${coord.longitude}`
        ),
        units: "imperial", // for miles
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    // create a result array with the same length as the original centerCoords
    const results = [];
    let validIndex = 0;

    // map each center to its distance result
    for (let i = 0; i < centerCoords.length; i++) {
      const coord = centerCoords[i];

      // if this coordinate was invalid (0,0 or out of bounds), add null
      if (
        coord.latitude === 0 ||
        coord.longitude === 0 ||
        Math.abs(coord.latitude) > 90 ||
        Math.abs(coord.longitude) > 180
      ) {
        results.push({
          distance: null,
          duration: null
        });
      } else {
        // otherwise, get the result from the API response
        const element = response.data.rows[0].elements[validIndex++];
        results.push({
          distance:
            element.status === "OK"
              ? parseFloat(element.distance.text.replace(" mi", ""))
              : null,
          duration: element.status === "OK" ? element.duration.text : null,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Google Distance Matrix API error:", error);
    return null;
  }
};

// function to check if a center is currently open based on current day/time vs center hours
// now supports timezone-aware calculations and handles 12-hour time format
const isOpenNow = (centerHours, centerTimezone) => {
  // get current time in the center's timezone
  const now = new Date();
  const currentDay = now
    .toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: centerTimezone,
    })
    .toLowerCase();

  // get current hour and minute in 24-hour format
  const currentHour = parseInt(now.toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: centerTimezone,
  }));

  const currentMinute = parseInt(now.toLocaleTimeString("en-US", {
    minute: "numeric",
    timeZone: centerTimezone,
  }));

  // find today's hours
  const todayHours = centerHours.find(
    (h) => h.day.toLowerCase() === currentDay
  );

  // if closed today or no hours data
  if (!todayHours || todayHours.is_closed || !todayHours.open_time || !todayHours.close_time) return false;

  // convert open time from 12-hour format to 24-hour
  const openTime = todayHours.open_time;
  const [openTimeStr, openPeriod] = openTime.split(" ");
  const [openHourStr, openMinuteStr] = openTimeStr.split(":");
  let openHour = parseInt(openHourStr);
  const openMinute = parseInt(openMinuteStr);

  if (openPeriod === "PM" && openHour < 12) openHour += 12;
  if (openPeriod === "AM" && openHour === 12) openHour = 0;

  // convert close time from 12-hour format to 24-hour
  const closeTime = todayHours.close_time;
  const [closeTimeStr, closePeriod] = closeTime.split(" ");
  const [closeHourStr, closeMinuteStr] = closeTimeStr.split(":");
  let closeHour = parseInt(closeHourStr);
  const closeMinute = parseInt(closeMinuteStr);

  if (closePeriod === "PM" && closeHour < 12) closeHour += 12;
  if (closePeriod === "AM" && closeHour === 12) closeHour = 0;

  // convert all to minutes for easier comparison
  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const openTotalMinutes = openHour * 60 + openMinute;
  const closeTotalMinutes = closeHour * 60 + closeMinute;

  // check if current time is between open and close times
  return currentTotalMinutes >= openTotalMinutes && currentTotalMinutes <= closeTotalMinutes;
};

// enhanced function to get detailed center status including hours until closing
// now supports timezone-aware calculations and handles 12-hour time format
const getCenterStatus = (centerHours, centerTimezone) => {
  // get current time in the center's timezone
  const now = new Date();
  const currentDay = now
    .toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: centerTimezone,
    })
    .toLowerCase();

  // get current hour and minute in 24-hour format
  const currentHour = parseInt(now.toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: centerTimezone,
  }));

  const currentMinute = parseInt(now.toLocaleTimeString("en-US", {
    minute: "numeric",
    timeZone: centerTimezone,
  }));

  // current time in minutes since midnight
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  const todayHours = centerHours.find(
    (h) => h.day.toLowerCase() === currentDay
  );

  // if closed today or no hours found
  if (!todayHours || todayHours.is_closed || !todayHours.open_time || !todayHours.close_time) {
    return {
      isOpen: false,
      hoursUntilClose: null,
      minutesUntilClose: null,
      closingTime: null,
      status: "closed",
      message: "Closed today",
    };
  }

  // convert open time from 12-hour format to minutes since midnight
  const openTime = todayHours.open_time;
  const [openTimeStr, openPeriod] = openTime.split(" ");
  const [openHourStr, openMinuteStr] = openTimeStr.split(":");
  let openHour = parseInt(openHourStr);
  const openMinute = parseInt(openMinuteStr);

  if (openPeriod === "PM" && openHour < 12) openHour += 12;
  if (openPeriod === "AM" && openHour === 12) openHour = 0;

  const openTotalMinutes = openHour * 60 + openMinute;

  // convert close time from 12-hour format to minutes since midnight
  const closeTime = todayHours.close_time;
  const [closeTimeStr, closePeriod] = closeTime.split(" ");
  const [closeHourStr, closeMinuteStr] = closeTimeStr.split(":");
  let closeHour = parseInt(closeHourStr);
  const closeMinute = parseInt(closeMinuteStr);

  if (closePeriod === "PM" && closeHour < 12) closeHour += 12;
  if (closePeriod === "AM" && closeHour === 12) closeHour = 0;

  const closeTotalMinutes = closeHour * 60 + closeMinute;

  // check if center is currently open
  const isCurrentlyOpen =
    currentTotalMinutes >= openTotalMinutes && currentTotalMinutes <= closeTotalMinutes;

  // if currently closed
  if (!isCurrentlyOpen) {
    return {
      isOpen: false,
      hoursUntilClose: null,
      minutesUntilClose: null,
      closingTime: todayHours.close_time,
      status: "closed",
      message: `Closed • Opens at ${todayHours.open_time}`, // show when it opens
    };
  }

  // calculate time until closing
  const minutesUntilClose = closeTotalMinutes - currentTotalMinutes;
  const hoursUntilClose = minutesUntilClose / 60;

  // determine status based on time remaining
  let status = "open";
  let message = `Open • Closes at ${todayHours.close_time}`;

  if (minutesUntilClose <= 30) {
    status = "closing_very_soon";
    message = `Closing in ${minutesUntilClose} minutes`;
  } else if (minutesUntilClose <= 60) {
    status = "closing_soon";
    message = `Closing soon • Closes at ${todayHours.close_time}`;
  } else if (hoursUntilClose < 2) {
    status = "closing_later";
    message = `Open • Closes in ${Math.floor(hoursUntilClose)} hour${
      Math.floor(hoursUntilClose) !== 1 ? "s" : ""
    }`;
  }

  // return status object
  return {
    isOpen: true,
    hoursUntilClose: parseFloat(hoursUntilClose.toFixed(2)),
    minutesUntilClose: minutesUntilClose,
    closingTime: todayHours.close_time,
    status: status,
    message: message,
  };
};

// (GET) fetch all community centers
router.get("/", async (req, res) => {
  try {
    // extract all query parameters including new advanced search params
    const { zip_code, distance, hours, rating, userLat, userLng, tags } =
      req.query;

    // parse arrays from query strings (frontend sends arrays as comma-separated strings)
    const distanceFilters = distance ? distance.split(",") : [];
    const hoursFilters = hours ? hours.split(",") : [];
    const ratingFilters = rating ? rating.split(",") : [];
    const tagFilters = tags ? tags.split(",").map(Number) : []; // convert tag ids to numbers

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
    if (tagFilters.length > 0) {
      filteredCenters = filteredCenters.filter((center) => {
        // get all tag ids associated with this center
        const centerTagIds = center.centerTags.map((ct) => ct.tag_id);

        // check if the center has ALL of the selected tags (AND logic)
        return tagFilters.every((tagId) => centerTagIds.includes(tagId));
      });
    }

    // apply distance filtering only if distance filters (user selected at least one distance filter) and user location is provided
    if (
      (distanceFilters.length > 0 || (userLatitude && userLongitude)) &&
      userLatitude &&
      userLongitude
    ) {
      try {
        // create user coordinate object
        const userCoord = new Coordinate(userLatitude, userLongitude);

        // create array of center coordinates
        const centerCoords = filteredCenters.map(
          (center) => new Coordinate(center.latitude, center.longitude)
        );

        // get distances from google api
        const distances = await getDistancesFromGoogle(userCoord, centerCoords);

        // if valid distance data, apply it to centers
        if (distances) {
          // add distance information to each center
          filteredCenters = filteredCenters.map((center, index) => ({
            ...center,
            calculatedDistance: distances[index]?.distance || null,
          }));

          // apply distance filters if any are selected
          if (distanceFilters.length > 0) {
            filteredCenters = filteredCenters.filter((center) => {
              // akip centers with null distance (api failure)
              if (center.calculatedDistance === null) return false;

              // check if center matches any of the selected distance filters
              return distanceFilters.some((distanceFilter) => {
                // check for custom distance format (e.g., "15miles")
                const customDistanceMatch = distanceFilter.match(/^(\d+)miles$/);

                if (customDistanceMatch) {
                  // extract the numeric value from the custom distance
                  const customDistance = parseInt(customDistanceMatch[1]);
                  // return centers within the exact custom distance
                  return center.calculatedDistance <= customDistance;
                }

                // handle predefined distance ranges
                switch (distanceFilter) {
                  case "5miles":
                    return center.calculatedDistance <= 5; // 0-5 miles
                  case "10miles":
                    return (
                      center.calculatedDistance > 5 &&
                      center.calculatedDistance <= 10
                    ); // 6-10 miles
                  case "25miles":
                    return (
                      center.calculatedDistance > 10 &&
                      center.calculatedDistance <= 25
                    ); // 11-25 miles
                  case "25+miles":
                    return center.calculatedDistance > 25; // 25+ miles
                  default:
                    return false; // fallback case for invalid/unexpected distance filter
                }
              });
            });
          }
        } else {
          console.error("Failed to get distances from Google API");
        }
      } catch (error) {
        console.error("Error calculating distances:", error);
      }
    }

    // apply hours filtering only if hours filters (user selected at least one hours filter)
    // check if hours filter array has any elements
    if (hoursFilters.length > 0) {
      filteredCenters = filteredCenters.filter((center) => {
        return hoursFilters.some((hoursFilter) => {
          switch (hoursFilter) {
            case "openNow":
              // use getCenterStatus instead of isOpenNow
              const centerStatus = getCenterStatus(
                center.hours,
                center.timezone
              );
              return centerStatus.isOpen;

            case "openLate":
              // check if center is open until 9pm or later TODAY only
              // get current day of the week
              const now = new Date();
              const currentDay = now
                .toLocaleDateString("en-US", {
                  weekday: "long",
                  timeZone: center.timezone,
                })
                .toLowerCase();

              // find hours for the current day
              const todayHours = center.hours.find(
                (h) => h.day.toLowerCase() === currentDay
              );

              // if closed today or no hours data, return false
              if (!todayHours || todayHours.is_closed || !todayHours.close_time) return false;

              // convert 12-hour format (e.g., "9:00 PM") to 24-hour format for comparison
              const closeTime = todayHours.close_time;
              const [time, period] = closeTime.split(" ");
              const [hours, minutes] = time.split(":");

              // convert hours to 24-hour format
              let hour24 = parseInt(hours);
              if (period === "PM" && hour24 < 12) hour24 += 12;
              if (period === "AM" && hour24 === 12) hour24 = 0;

              // check if closing time is 9 PM (21:00) or later
              return hour24 >= 21;

            case "openWeekends":
              // check if center is open on Saturday or Sunday
              return center.hours.some((hour) => {
                const day = hour.day.toLowerCase();
                return (
                  (day === "saturday" || day === "sunday") && !hour.is_closed
                );
              });

            default:
              return false; // fallback case for invalid/unexpected hours filter
          }
        });
      });
    }

    // helper functions for calculating scores
    const calculateRatingScore = (center) => {
      // check if center has any reviews
      if (center.reviews.length === 0) return 0;
      // calculate average rating sum all and divide by length
      const avgRating =
        center.reviews.reduce((sum, review) => sum + review.rating, 0) /
        center.reviews.length;
      // normalize to 0-1 scale
      return avgRating / 5;
    };

    const calculateReviewCountScore = (center, allCenters) => {
      if (center.reviews.length === 0) return 0;
      // find max review count for normalization
      const maxReviews = Math.max(...allCenters.map((c) => c.reviews.length));
      if (maxReviews === 0) return 0;
      // normalize to 0-1 scale
      return center.reviews.length / maxReviews;
    };

    const calculateRecencyScore = (center, now) => {
      if (center.reviews.length === 0) return 0;

      // get the most recent review date
      const dates = center.reviews.map((review) =>
        new Date(review.created_at).getTime()
      );
      const mostRecentDate = Math.max(...dates);

      // calculate recency score (more recent = higher score)
      // use a 90-day (3 month) window for full recency
      // convert days to milliseconds
      const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
      const ageMs = now - mostRecentDate;

      // newer reviews get higher scores (1.0 for now, decreasing as they age)
      // reviews older than 90 days get progressively lower scores
      return Math.max(0, 1 - ageMs / ninetyDaysMs);
    };

    // sort centers based on rating filters before enrichment
    let sortedCenters = filteredCenters;

    // check if user selected at least one rating filter
    if (ratingFilters.length > 0) {
      // get the first rating filter (since user can only select one at a time)
      const ratingFilter = ratingFilters[0];

      switch (ratingFilter) {
        case "recommended":
          // calculate a composite score for each center
          const now = Date.now();

          // first, add scores to each center
          const centersWithScores = sortedCenters.map((center) => {
            const ratingScore = calculateRatingScore(center);
            const reviewCountScore = calculateReviewCountScore(
              center,
              filteredCenters
            );
            const recencyScore = calculateRecencyScore(center, now);

            // calculate composite score with weights
            // 50% rating, 30% review count, 20% recency
            const compositeScore =
              ratingScore * 0.5 + reviewCountScore * 0.3 + recencyScore * 0.2;

            return {
              ...center,
              compositeScore,
            };
          });

          // sort by composite score (highest first)
          sortedCenters = centersWithScores.sort(
            (a, b) => b.compositeScore - a.compositeScore
          );
          break;

        case "highestRated":
          // calculate avgRating for sorting
          sortedCenters = sortedCenters.sort((a, b) => {
            const aAvgRating =
              a.reviews.length > 0
                ? a.reviews.reduce((sum, review) => sum + review.rating, 0) /
                  a.reviews.length
                : 0;
            const bAvgRating =
              b.reviews.length > 0
                ? b.reviews.reduce((sum, review) => sum + review.rating, 0) /
                  b.reviews.length
                : 0;
            // descending order, higher rating first
            return bAvgRating - aAvgRating;
          });
          break;

        case "mostReviewed":
          // sort by review count puts highest reviewed first
          sortedCenters = sortedCenters.sort(
            (a, b) => b.reviews.length - a.reviews.length
          );
          break;

        case "recentlyReviewed":
          // sort by most recent review date (most recent first)
          sortedCenters = sortedCenters.sort((a, b) => {
            // get most recent review date for each center
            const getMostRecentDate = (center) => {
              if (center.reviews.length === 0) return null;
              const dates = center.reviews.map((review) =>
                new Date(review.created_at).getTime()
              );
              return dates.length > 0 ? Math.max(...dates) : null;
            };

            const aRecentDate = getMostRecentDate(a);
            const bRecentDate = getMostRecentDate(b);

            // handle centers with no reviews (put them at the end)
            if (aRecentDate === null && bRecentDate === null) return 0;
            if (aRecentDate === null) return 1; // a is null and goes after b which has reviews
            if (bRecentDate === null) return -1;

            return bRecentDate - aRecentDate;
          });
          break;
      }
    }
    // data enrichment after sorting since reviews are needed for rating and review count

    // map results to add calculated fields (avgRating, reviewCount, distance, status) AFTER sorting
    const enrichedCenters = sortedCenters.map((center) => {
      // calculate average rating
      // extract just the rating numbers from the reviews array and create new array from those number
      const ratings = center.reviews.map((review) => review.rating);
      // if there are ratings calculate average by adding all tg and dividing by length and round to 1 decimal place
      const avgRating =
        ratings.length > 0
          ? (
              ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
            ).toFixed(1)
          : null;

      // count total reviews
      const reviewCount = center.reviews.length;

      // use stored calculated distance if available, otherwise null
      const distance = center.calculatedDistance
        ? center.calculatedDistance.toFixed(1)
        : null;

      // get detailed center status information
      const centerStatus = getCenterStatus(center.hours, center.timezone);

      // extract tags for the center
      const tags = center.centerTags.map((ct) => ct.tag);

      // return center with calculated fields (exclude reviews array to reduce response size)
      const {
        reviews,
        calculatedDistance,
        centerTags,
        ...centerWithoutReviews
      } = center;
      return {
        ...centerWithoutReviews,
        avgRating: avgRating ? parseFloat(avgRating) : null,
        reviewCount,
        distance: distance ? parseFloat(distance) : null,
        status: centerStatus.status,
        isOpen: centerStatus.isOpen,
        hoursMessage: centerStatus.message,
        tags: tags, // include tags in the response
      };
    });

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
module.exports = router;
