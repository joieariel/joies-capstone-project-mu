const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();

// (GET) fetch all users
router.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// (GET) fetch a single user's info
router.get("/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const users = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
  });
  console.log(users);
  res.json(users);
});

// (POST) create a new user
router.post("/", async (req, res) => {
  const { first_name, last_name, username, email, status, birthdate, zip_code, city, state} = req.body;
  const newUser = await prisma.user.create({
    data: {
      first_name,
      last_name,
      username,
      email,
      status,
      birthdate: new Date(birthdate), // ensure birthdate is a Date object
      zip_code,
      city,
      state,
    },
  });
  res.json(newUser);
});

// (PUT) update a user's info
router.put("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { first_name, last_name, username, email, status, birthdate, zip_code, city, state} = req.body;
  const updatedUser = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: {
      first_name,
      last_name,
      username,
      email,
      status,
      birthdate: new Date(birthdate),
      zip_code,
      city,
      state,
    },
  });
  res.json(updatedUser);
});

// (DELETE) delete a user
router.delete("/:userId", async (req, res) => {
  const { userId } = req.params;
  const deletedUser = await prisma.user.delete({
    where: { id: parseInt(userId) },
  });
  res.json(deletedUser);
});













module.exports = router;
