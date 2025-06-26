const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();

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
