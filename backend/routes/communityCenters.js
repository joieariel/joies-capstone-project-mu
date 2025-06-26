const express = require("express"); //import express
const { PrismaClient } = require("@prisma/client"); // require prisma client
const router = express.Router(); // import express router
const prisma = new PrismaClient(); // create new prisma client

// (GET) get all community centers from database
router.get("/", async (req, res) => {
  const communityCenters = await prisma.CommunityCenter.findMany();
  console.log(communityCenters);
  res.json(communityCenters);
});

// (GET) get a specific community center from db
router.get("/:communityCenterId", async (req, res) => {
  const communityCenterId = parseInt(req.params.boardId);
  const communityCenters = await prisma.CommunityCenter.findUnique({
    where: { id: parseInt(communityCenterId) },
  });
  console.log(communityCenters);
  res.json(communityCenters);
});

// (GET) fetch all community centers (filter by zipcode)
//  to search by zipcode /communityCenters?zip_code=30281
router.get("/", async (req, res) => {
    try {
        // extract zipcode from query params
        const { zip_code } = req.query;
        // if zip_code exists filter, if not don't filter
        const filter = zip_code ? { zip_code: { equals: zip_code } } : {};

        const communityCenters = await prisma.communityCenter.findMany({
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
    const communityCenterId = parseInt(req.params.communityCenterId);
    const communityCenters = await prisma.communityCenter.findUnique({
      where: { id: parseInt(communityCenterId) },
    });
    console.log(communityCenters);
    res.json(communityCenters);
  });



module.exports = router;
