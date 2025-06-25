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

// // (GET) get a specific community center from db
// router.get("/:communityCenterId", async (req, res) => {
//   const communityCenterId = parseInt(req.params.boardId);
//   const communityCenters = await prisma.CommunityCenter.findUnique({
//     where: { id: parseInt(communityCenterId) },
//   });
//   console.log(communityCenters);
//   res.json(communityCenters);
// });

module.exports = router;
