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
    console.log("Starting to clear all interaction data...");

    // Clear all interaction data
    console.log("Clearing page interactions...");
    const deletedPageInteractions = await prisma.pageInteraction.deleteMany({});
    console.log(`Deleted ${deletedPageInteractions.count} page interactions.`);

    console.log("Clearing filter interactions...");
    const deletedFilterInteractions = await prisma.filterInteraction.deleteMany({});
    console.log(`Deleted ${deletedFilterInteractions.count} filter interactions.`);

    console.log("Clearing likes...");
    const deletedLikes = await prisma.likes.deleteMany({});
    console.log(`Deleted ${deletedLikes.count} likes.`);

    console.log("Clearing dislikes...");
    const deletedDislikes = await prisma.dislikes.deleteMany({});
    console.log(`Deleted ${deletedDislikes.count} dislikes.`);

    console.log("All interaction data has been cleared successfully!");
  } catch (error) {
    console.error("Error clearing interaction data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
