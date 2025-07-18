const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * This script clears all community center related data from the database.
 * It deletes data in the correct order to respect foreign key constraints:
 * 1. ReviewImages (depends on Reviews)
 * 2. ReviewTags (depends on Reviews)
 * 3. Reviews (depends on CommunityCenter)
 * 4. CenterTags (depends on CommunityCenter)
 * 5. CenterHours (depends on CommunityCenter)
 * 6. CommunityCenter
 *
 * Run this script with: node backend/prisma/clearAllCenterData.js
 */

async function main() {
  try {
    // Step 1: Delete ReviewImages (depends on Review)
    await prisma.reviewImage.deleteMany({});

    // Step 2: Delete ReviewTags (depends on Review)
    await prisma.reviewTag.deleteMany({});

    // Step 3: Delete Reviews (depends on CommunityCenter)
    await prisma.review.deleteMany({});

    // Step 4: Delete CenterTags (depends on CommunityCenter)
    await prisma.centerTag.deleteMany({});

    // Step 5: Delete CenterHours (depends on CommunityCenter)
    await prisma.centerHours.deleteMany({});

    // Step 6: Delete CommunityCenters
    await prisma.communityCenter.deleteMany({});
  } catch (error) {
    console.error("Error clearing data:", error);
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
