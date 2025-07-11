const { Client } = require("@googlemaps/google-maps-services-js");
const googleMapsClient = new Client({});

// helper function to convert 12-hour time format to minutes since midnight
const convertTimeToMinutes = (timeString) => {
  const [timeStr, period] = timeString.split(" ");
  const [hourStr, minuteStr] = timeStr.split(":");
  let hour = parseInt(hourStr);
  const minute = parseInt(minuteStr);

  if (period === "PM" && hour < 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return hour * 60 + minute;
};

// coordinate class to encapsulate latitude and longitude
class Coordinate {
  constructor(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }
}

// get distances from google distance matrix api
// this function now expects only valid coordinates since filtering happens in applyDistanceFilters
const getDistancesFromGoogle = async (userCoord, centerCoords) => {
  try {
    // if no coordinates provided, return null
    if (centerCoords.length === 0) {
      console.error("No center coordinates provided");
      return null;
    }

    const response = await googleMapsClient.distancematrix({
      params: {
        origins: [`${userCoord.latitude},${userCoord.longitude}`],
        destinations: centerCoords.map(
          (coord) => `${coord.latitude},${coord.longitude}`
        ),
        units: "imperial", // for miles
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    // create results array from API response
    const results = response.data.rows[0].elements.map((element) => ({
      distance:
        element.status === "OK"
          ? parseFloat(element.distance.text.replace(" mi", ""))
          : null,
      duration: element.status === "OK" ? element.duration.text : null,
    }));

    return results;
  } catch (error) {
    console.error("Google Distance Matrix API error:", error);
    return null;
  }
};

// helper function to find the next opening day and time
const findNextOpeningTime = (centerHours, centerTimezone) => {
  const now = new Date();
  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  // get current day index in the center's timezone (0 = Sunday, 1 = Monday, etc.)
  const currentDayName = now
    .toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: centerTimezone,
    })
    .toLowerCase();
  const currentDayIndex = daysOfWeek.indexOf(currentDayName);

  // check the next 7 days to find when the center opens next
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (currentDayIndex + i) % 7;
    const nextDayName = daysOfWeek[nextDayIndex];

    const nextDayHours = centerHours.find(
      (h) => h.day.toLowerCase() === nextDayName
    );

    // if we find a day that's open and has hours
    if (nextDayHours && !nextDayHours.is_closed && nextDayHours.open_time) {
      // determine the day description
      let dayDescription;
      if (i === 1) {
        dayDescription = "tomorrow";
      } else if (i <= 6) {
        // capitalize first letter of day name
        dayDescription =
          nextDayName.charAt(0).toUpperCase() + nextDayName.slice(1);
      } else {
        dayDescription = "next week";
      }

      return {
        day: dayDescription,
        time: nextDayHours.open_time,
      };
    }
  }

  // if no opening time found in the next 7 days
  return null;
};

// enhanced function to get detailed center status including hours until closing
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
  const currentHour = parseInt(
    now.toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: centerTimezone,
    })
  );

  const currentMinute = parseInt(
    now.toLocaleTimeString("en-US", {
      minute: "numeric",
      timeZone: centerTimezone,
    })
  );

  // current time in minutes since midnight
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  const todayHours = centerHours.find(
    (h) => h.day.toLowerCase() === currentDay
  );

  // if closed today or no hours found
  if (
    !todayHours ||
    todayHours.is_closed ||
    !todayHours.open_time ||
    !todayHours.close_time
  ) {
    // find when the center opens next
    const nextOpening = findNextOpeningTime(centerHours, centerTimezone);
    const message = nextOpening
      ? `Closed • Opens ${nextOpening.day} at ${nextOpening.time}`
      : "Closed";

    return {
      isOpen: false,
      hoursUntilClose: null,
      minutesUntilClose: null,
      closingTime: null,
      status: "closed",
      message: message,
    };
  }

  // convert times to minutes since midnight for easier comparison
  const openTotalMinutes = convertTimeToMinutes(todayHours.open_time);
  const closeTotalMinutes = convertTimeToMinutes(todayHours.close_time);

  // check if center is currently open
  const isCurrentlyOpen =
    currentTotalMinutes >= openTotalMinutes &&
    currentTotalMinutes <= closeTotalMinutes;

  // if currently closed but will open later today
  if (!isCurrentlyOpen) {
    // if it's before opening time today, show today's opening time
    if (currentTotalMinutes < openTotalMinutes) {
      return {
        isOpen: false,
        hoursUntilClose: null,
        minutesUntilClose: null,
        closingTime: todayHours.close_time,
        status: "closed",
        message: `Closed • Opens at ${todayHours.open_time}`,
      };
    } else {
      // if it's after closing time today, find next opening
      const nextOpening = findNextOpeningTime(centerHours, centerTimezone);
      const message = nextOpening
        ? `Closed • Opens ${nextOpening.day} at ${nextOpening.time}`
        : "Closed";

      return {
        isOpen: false,
        hoursUntilClose: null,
        minutesUntilClose: null,
        closingTime: todayHours.close_time,
        status: "closed",
        message: message,
      };
    }
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

  return {
    isOpen: true,
    hoursUntilClose: parseFloat(hoursUntilClose.toFixed(2)),
    minutesUntilClose: minutesUntilClose,
    closingTime: todayHours.close_time,
    status: status,
    message: message,
  };
};

// filter centers by tags
const applyTagFilters = (centers, tagFilters) => {
  if (tagFilters.length === 0) return centers;

  return centers.filter((center) => {
    // get all tag ids associated with this center
    const centerTagIds = center.centerTags.map((ct) => ct.tag_id);
    // check if the center has ALL of the selected tags (AND logic)
    return tagFilters.every((tagId) => centerTagIds.includes(tagId));
  });
};

// filter centers by distance
const applyDistanceFilters = async (
  centers,
  distanceFilters,
  userLatitude,
  userLongitude
) => {
  if (
    (!distanceFilters.length && !userLatitude && !userLongitude) ||
    !userLatitude ||
    !userLongitude
  ) {
    return centers;
  }

  try {
    // first filter out centers with invalid coordinates
    const centersWithValidCoords = centers.filter((center) => {
      return (
        center.latitude !== 0 &&
        center.longitude !== 0 &&
        Math.abs(center.latitude) <= 90 &&
        Math.abs(center.longitude) <= 180
      );
    });

    // if no centers have valid coordinates, return empty array
    if (centersWithValidCoords.length === 0) {
      console.warn("No centers with valid coordinates found");
      return [];
    }

    // create user coordinate object
    const userCoord = new Coordinate(userLatitude, userLongitude);

    // create array of center coordinates (all valid now)
    const centerCoords = centersWithValidCoords.map(
      (center) => new Coordinate(center.latitude, center.longitude)
    );

    // get distances from google api
    const distances = await getDistancesFromGoogle(userCoord, centerCoords);

    // if valid distance data, apply it to centers
    if (distances) {
      // add distance information to each center
      let centersWithDistance = centersWithValidCoords.map((center, index) => ({
        ...center,
        calculatedDistance: distances[index]?.distance || null,
      }));

      // apply distance filters if any are selected
      if (distanceFilters.length > 0) {
        centersWithDistance = centersWithDistance.filter((center) => {
          // skip centers with null distance (api failure)
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
                return center.calculatedDistance <= 5; // fallback to 5miles
            }
          });
        });
      }

      return centersWithDistance;
    } else {
      console.error("Failed to get distances from Google API");
      return centersWithValidCoords; // return centers without distance info if API fails
    }
  } catch (error) {
    console.error("Error calculating distances:", error);
    return centers;
  }
};

// filter centers by hours
const applyHoursFilters = (centers, hoursFilters) => {
  if (hoursFilters.length === 0) return centers;

  return centers.filter((center) => {
    return hoursFilters.some((hoursFilter) => {
      switch (hoursFilter) {
        case "openNow":
          // use getCenterStatus to check if open
          const centerStatus = getCenterStatus(center.hours, center.timezone);
          return centerStatus.isOpen;

        case "openLate":
          // check if center is open until 9pm or later TODAY only
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
          if (!todayHours || todayHours.is_closed || !todayHours.close_time)
            return false;

          // convert 12-hour format to 24-hour format for comparison
          const closeTime = todayHours.close_time;
          const [time, period] = closeTime.split(" ");
          const [hours] = time.split(":");

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
            return (day === "saturday" || day === "sunday") && !hour.is_closed;
          });

        default:
          return false; // fallback case for invalid hours filter
      }
    });
  });
};

// helper functions for calculating scores
const calculateRatingScore = (center) => {
  // check if center has any reviews
  if (center.reviews.length === 0) return 0;
  // calculate average rating
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
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  const ageMs = now - mostRecentDate;

  // newer reviews get higher scores (1.0 for now, decreasing as they age)
  return Math.max(0, 1 - ageMs / ninetyDaysMs);
};

// apply rating filters and sorting
const applyRatingFilters = (centers, ratingFilters) => {
  if (ratingFilters.length === 0) return centers;

  // get the first rating filter (since user can only select one at a time)
  const ratingFilter = ratingFilters[0];

  switch (ratingFilter) {
    case "recommended":
      // calculate a composite score for each center
      const now = Date.now();

      // add scores to each center
      const centersWithScores = centers.map((center) => {
        const ratingScore = calculateRatingScore(center);
        const reviewCountScore = calculateReviewCountScore(center, centers);
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
      return centersWithScores.sort(
        (a, b) => b.compositeScore - a.compositeScore
      );

    case "highestRated":
      // sort by average rating
      return centers.sort((a, b) => {
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

    case "mostReviewed":
      // sort by review count
      return centers.sort((a, b) => b.reviews.length - a.reviews.length);

    case "mostRecentlyReviewed":
      // sort by most recent review date
      return centers.sort((a, b) => {
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
        if (aRecentDate === null) return 1;
        if (bRecentDate === null) return -1;

        return bRecentDate - aRecentDate;
      });

    default:
      return centers;
  }
};

// enrich centers with calculated fields
const enrichCentersWithData = (centers) => {
  return centers.map((center) => {
    // calculate average rating
    const ratings = center.reviews.map((review) => review.rating);
    const avgRating =
      ratings.length > 0
        ? (
            ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          ).toFixed(1)
        : null;

    // count total reviews
    const reviewCount = center.reviews.length;

    // use stored calculated distance if available
    const distance = center.calculatedDistance
      ? center.calculatedDistance.toFixed(1)
      : null;

    // get detailed center status information
    const centerStatus = getCenterStatus(center.hours, center.timezone);

    // extract tags for the center
    const tags = center.centerTags.map((ct) => ct.tag);

    // return center with calculated fields (exclude reviews array to reduce response size)
    const { reviews, calculatedDistance, centerTags, ...centerWithoutReviews } =
      center;

    return {
      ...centerWithoutReviews,
      avgRating: avgRating ? parseFloat(avgRating) : null,
      reviewCount,
      distance: distance ? parseFloat(distance) : null,
      status: centerStatus.status,
      isOpen: centerStatus.isOpen,
      hoursMessage: centerStatus.message,
      tags: tags,
    };
  });
};

module.exports = {
  convertTimeToMinutes,
  Coordinate,
  getDistancesFromGoogle,
  getCenterStatus,
  applyTagFilters,
  applyDistanceFilters,
  applyHoursFilters,
  applyRatingFilters,
  enrichCentersWithData,
};
