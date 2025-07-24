const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// how to run this script: node backend/prisma/clear-interactions.js

/**
 * This script clears all interaction data from the database:
 * - Page interactions
 * - Filter interactions
 * - Likes
 * - Dislikes
 *
 * Run this script before running seed-interactions.js to avoid unique constraint errors.
 */

async function main() {
  try {
    // Clear all interaction data
    await prisma.pageInteraction.deleteMany({});
    await prisma.filterInteraction.deleteMany({});
    await prisma.likes.deleteMany({});
    await prisma.dislikes.deleteMany({});
  } catch (error) {
    console.error("Error clearing interaction data:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
