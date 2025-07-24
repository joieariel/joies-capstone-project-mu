// advanced search filter interaction endpoints
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();
const { authenticateUser } = require("../middleware/auth");
const {
  recordFilterInteraction,
} = require("../utils/userRecommendationEngine");

// (POST) record a filter interaction when a user clicks on a tag filter
// requires authentication to identify the user
router.post("/", authenticateUser, async (req, res) => {
  try {
    // get supabase user id from auth middleware
    const supabaseUserId = req.user.id;

    // get the tag id from the request body
    const { tag_id } = req.body;

    if (!tag_id) {
      return res.status(400).json({ error: "Tag ID is required" });
    }

    // first, get the prisma user id that corresponds to the supabase user id
    const user = await prisma.user.findUnique({
      where: { supabase_user_id: supabaseUserId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    // now we have the numeric user id from db
    const userId = user.id;

    // record the filter interaction
    const result = await recordFilterInteraction(userId, tag_id, prisma);

    // error handling

    if (!result) {
      return res
        .status(500)
        .json({ error: "Failed to record filter interaction" });
    }

    res.status(200).json({ success: true, interaction: result });
  } catch (error) {
    console.error("Error recording filter interaction:", error);
    res.status(500).json({ error: "Failed to record filter interaction" });
  }
});

module.exports = router;
