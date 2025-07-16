const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * This script clears all reviews and related data from the database.
 * It deletes ReviewImages, ReviewTags, and Reviews in the correct order
 * to respect foreign key constraints.
 *
 * Run this script with: node backend/prisma/clearReviews.js
 */

async function main() {
  try {
    // Step 1: Delete ReviewImages (depends on Review)
    await prisma.reviewImage.deleteMany({});

    // Step 2: Delete ReviewTags (depends on Review)
    await prisma.reviewTag.deleteMany({});

    // Step 3: Delete Reviews
    await prisma.review.deleteMany({});

    // Step 4: Also delete CenterTags since they should be derived from reviews
    await prisma.centerTag.deleteMany({});
  } catch (error) {
    console.error("Error clearing reviews:", error);
    console.error(error.stack);
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

// to run it
// node backend/prisma/clearReviews.js
