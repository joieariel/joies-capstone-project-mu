// page interaction endpoints
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();
const { authenticateUser } = require("../middleware/auth");
const { recordPageInteraction } = require("../utils/userRecommendationEngine");

// (POST) record a page interaction when a user interacts with a community center page (authenticated)
router.post("/", authenticateUser, async (req, res) => {
  try {
    // get supabase user id from auth middleware
    const supabaseUserId = req.user.id;

    // get the center id and interaction data from the request body
    const { center_id, interaction_data } = req.body;

    if (!center_id || !interaction_data) {
      return res.status(400).json({
        error: "Center ID and interaction data are required",
      });
    }

    // get the prisma user id that corresponds to the supabase user id
    const user = await prisma.user.findUnique({
      where: { supabase_user_id: supabaseUserId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    // now we have the numeric user id from db
    const userId = user.id;

    // record the page interaction - convert center_id to integer
    const result = await recordPageInteraction(
      userId,
      parseInt(center_id, 10), // convert string to integer
      interaction_data,
      prisma
    );

    if (!result) {
      return res
        .status(500)
        .json({ error: "Failed to record page interaction" });
    }

    res.status(200).json({ success: true, interaction: result });
  } catch (error) {
    console.error("Error recording page interaction:", error);
    res.status(500).json({ error: "Failed to record page interaction" });
  }
});

module.exports = router;
