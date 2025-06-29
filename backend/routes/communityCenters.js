const express = require("express"); //import express
const { PrismaClient } = require("@prisma/client"); // require prisma client
const router = express.Router(); // import express router
const prisma = new PrismaClient(); // create new prisma client

// (GET) fetch all community centers (or filter by zipcode)
//  to search by zipcode /communityCenters?zip_code=30281
router.get("/", async (req, res) => {
  try {
      // extract zipcode from query params
      const { zip_code } = req.query;
      // if zip_code exists filter, if not don't filter
      const filter = zip_code ? { zip_code: { equals: zip_code } } : {};

      const communityCenters = await prisma.CommunityCenter.findMany({
          where: filter
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



module.exports = router;
