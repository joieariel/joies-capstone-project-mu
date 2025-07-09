const express = require("express"); //import express
const { PrismaClient } = require("@prisma/client"); // require prisma client
const router = express.Router(); // import express router
const prisma = new PrismaClient(); // create new prisma client

// helper functions  for advanced search functionality (distance, operating hours checks, rating)
// maybe add to utils.js file later

// coordinate class to encapsulate latitude and longitude
class Coordinate {
  constructor(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }
}
// TODO: change to user distance matrix api instead of calculating distance manually!!

// calculate the distance using the Haversine formula to calculate miles between two lat/long points
const calculateDistance = (coord1, coord2) => {
  const earthRadius = 3959; // earth's radious in miles
  const latDiff = ((coord2.latitude - coord1.latitude) * Math.PI) / 180; // difference in latitude
  const lonDiff = ((coord2.longitude - coord1.longitude) * Math.PI) / 180; // difference in longitude
  // convert lat values to radians for calculations
  const lat1Rad = (coord1.latitude * Math.PI) / 180;
  const lat2Rad = (coord2.latitude * Math.PI) / 180;
  // note: a chord is a line segement that connects 2 points on a sphere (earth)
  // - half-chord is half the length or chord
  // calculate the squared half-chord length (haversin) between the 2 poitns (done to simplify the calculations and make more efficient)
  const sqHalfChord =
    Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
    Math.sin(lonDiff / 2) *
      Math.sin(lonDiff / 2) *
      Math.cos(lat1Rad) *
      Math.cos(lat2Rad);

  // calculate angular distance (arcsin) between the 2 points
  const angDis =
    2 * Math.atan2(Math.sqrt(sqHalfChord), Math.sqrt(1 - sqHalfChord));
  // calculate linear dis between the 2 points using earth's radius var and angular distance var
  const distance = earthRadius * angDis;

  // return calculate distance in miles
  return distance;
};

// fucntion to check if a center is currently open based on current day/time vs center hours
// now supports timezone-aware calculations
const isOpenNow = (centerHours, centerTimezone) => {
  // get current time in the center's timezone
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: centerTimezone
  }).toLowerCase();
  const currentTime = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    timeZone: centerTimezone
  });

  const todayHours = centerHours.find(h => h.day.toLowerCase() === currentDay);
  if (!todayHours || todayHours.is_closed) return false;

  return currentTime >= todayHours.open_time && currentTime <= todayHours.close_time;
};

// enhanced function to get detailed center status including hours until closing
// now supports timezone-aware calculations
const getCenterStatus = (centerHours, centerTimezone) => {
  // get current time in the center's timezone
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: centerTimezone
  }).toLowerCase();
  const currentTime = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    timeZone: centerTimezone
  });

  const todayHours = centerHours.find(h => h.day.toLowerCase() === currentDay);

  // if closed today or no hours found
  if (!todayHours || todayHours.is_closed) {
    return {
      isOpen: false,
      hoursUntilClose: null,
      minutesUntilClose: null,
      closingTime: null,
      status: 'closed',
      message: 'Closed today'
    };
  }
  // check if center is currently open
  const isCurrentlyOpen = currentTime >= todayHours.open_time && currentTime <= todayHours.close_time;

  // if currently closed
  if (!isCurrentlyOpen) {
    return {
      isOpen: false,
      hoursUntilClose: null,
      minutesUntilClose: null,
      closingTime: todayHours.close_time,
      status: 'closed',
      message: `Closed • Opens at ${todayHours.open_time}` // show when it opens
    };
  }

  // calculate time until closing
  const [currentHour, currentMinute] = currentTime.split(':').map(Number);
  const [closeHour, closeMinute] = todayHours.close_time.split(':').map(Number);

  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const closeTotalMinutes = closeHour * 60 + closeMinute;
  const minutesUntilClose = closeTotalMinutes - currentTotalMinutes;
  const hoursUntilClose = minutesUntilClose / 60;

  // determine status based on time remaining
  let status = 'open';
  let message = `Open • Closes at ${todayHours.close_time}`;

  if (minutesUntilClose <= 30) {
    status = 'closing_very_soon';
    message = `Closing in ${minutesUntilClose} minutes`;
  } else if (minutesUntilClose <= 60) {
    status = 'closing_soon';
    message = `Closing soon • Closes at ${todayHours.close_time}`;
  } else if (hoursUntilClose < 2) {
    status = 'closing_later';
    message = `Open • Closes in ${Math.floor(hoursUntilClose)} hour${Math.floor(hoursUntilClose) !== 1 ? 's' : ''}`;
  }

  // return status object
  return {
    isOpen: true,
    hoursUntilClose: parseFloat(hoursUntilClose.toFixed(2)),
    minutesUntilClose: minutesUntilClose,
    closingTime: todayHours.close_time,
    status: status,
    message: message
  };
};


// (GET) fetch all community centers with advanced search filters
// TODO: update this route to handle new query parameters from frontend Search component
// new params: distance[], hours[], rating[], userLat, userLng (in addition to existing zip_code)
// will need to include related data (hours, reviews) in prisma query for filtering
router.get("/", async (req, res) => {
  try {
    // TODO: extract all new query params here (distance, hours, rating, userLat, userLng)
    // destructure them from req.query along with existing zip_code
    const { zip_code, distance, hours, rating, userLat, userLng } = req.query;

    // TODO: update this filter logic to handle zip_code as before
    // but also prepare for additional filtering steps below
    const filter = zip_code ? { zip_code: { equals: zip_code } } : {};

    // TODO: update this prisma query to include related data needed for filtering
    // add include: { hours: true, reviews: { select: { rating: true, created_at: true } } }
    // this will give you access to center hours and review data for advanced filtering
    const communityCenters = await prisma.CommunityCenter.findMany({
      where: filter,
    });

    // TODO: add filtering logic here after fetching from database
    // 1. start with let filteredCenters = communityCenters;
    // 2. apply distance filtering if distance filters and user location provided
    //    Example: const userCoord = new Coordinate(parseFloat(userLat), parseFloat(userLng));
    //    filteredCenters = filteredCenters.filter(center => {
    //      const centerCoord = new Coordinate(center.latitude, center.longitude);
    //      const distance = calculateDistance(userCoord, centerCoord);
    //      return distance <= maxDistance;
    //    });
    // 3. apply hours filtering if hours filters provided
    // 4. apply rating filtering if rating filters provided
    // 5. map results to add calculated fields (avgRating, reviewCount, distance)

    res.json(communityCenters);
  } catch (error) {
    console.error("Error fetching community centers:", error);
    res.status(500).json({ error: "Failed to fetch community centers" });
  }
});

// (GET) fetch a single community center by id
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
