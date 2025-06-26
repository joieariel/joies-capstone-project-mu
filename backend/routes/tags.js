const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();

// (GET) fetch all tags associate with a specific community center
router.get("/", async (req, res) => {
  const tags = await prisma.tag.findMany();
  res.json(tags);
});

// (POST) create a new tag for a specific community center
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    const newTag = await prisma.tag.create({
      data: {
        name,
      },
    });

    res.status(201).json(newTag);
  } catch (error) {
    res.status(500).json({ error: "Failed to create tag" });
  }
});

module.exports = router;
