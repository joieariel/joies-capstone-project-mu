const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * This script clears all centerTags from the database.
 * This is useful when you want to reset all center tags and only have tags
 * that come from reviews.
 *
 * Run this script with: node backend/prisma/clearCenterTags.js
 */

async function main() {
  try {
    // Delete all existing centerTags
    await prisma.centerTag.deleteMany({});
  } catch (error) {
    console.error("Error clearing centerTags:", error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("Error during script execution:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
