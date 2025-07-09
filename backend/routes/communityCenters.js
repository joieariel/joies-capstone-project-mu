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
// get distances from Google Distance Matrix API
const getDistancesFromGoogle = async (userCoord, centerCoords) => {
  try {
    const response = await googleMapsClient.distancematrix({
      params: {
        origins: [`${userCoord.latitude},${userCoord.longitude}`],
        destinations: centerCoords.map(coord => `${coord.latitude},${coord.longitude}`),
        units: 'imperial', // for miles
        key: process.env.GOOGLE_MAPS_API_KEY,
      }
    });

    return response.data.rows[0].elements.map(element => ({
      distance: element.status === 'OK' ? parseFloat(element.distance.text.replace(' mi', '')) : null,
      duration: element.status === 'OK' ? element.duration.text : null
    }));
  } catch (error) {
    console.error('Google Distance Matrix API error:', error);
    return null;
  }
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


/*
router.get("/", async (req, res) => {
  try {

    const { zip_code, distance, hours, rating, userLat, userLng } = req.query;


    const filter = zip_code ? { zip_code: { equals: zip_code } } : {};


      where: filter,
    });

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
*/
module.exports = router;
