const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticateUser } = require("../middleware/auth");
const router = express.Router();
const prisma = new PrismaClient();

// (GET) fetch a single user's info - protected: users can only view their own profile
router.get("/:userId", authenticateUser, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    // find the user record
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // authorization check user can only view their own profile
    if (user.supabase_user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only view your own profile' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// (POST) create a new user - now includes supabase user id
router.post("/", async (req, res) => {
  const { supabase_user_id, first_name, last_name, username, email, status, birthdate, zip_code, city, state} = req.body;

  try {
    const newUser = await prisma.user.create({
      data: {
        supabase_user_id, // link to supabase auth user
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
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// (PUT) update a user's info - protected: users can only update their own profile
router.put("/:userId", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const { first_name, last_name, username, email, status, birthdate, zip_code, city, state} = req.body;

    // find the user record first
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // authorization check: user can only update their own profile
    if (user.supabase_user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

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
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// (DELETE) delete a user - protected: users can only delete their own profile
router.delete("/:userId", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.supabase_user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own profile' });
    }

    const deletedUser = await prisma.user.delete({
      where: { id: parseInt(userId) },
    });
    res.json(deletedUser);
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});



module.exports = router;
