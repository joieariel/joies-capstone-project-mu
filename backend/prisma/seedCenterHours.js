const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { daysOfWeek, hourPatterns } = require("../utils/constants");
// seed file for the remaining community centers that need hours
async function main() {
  // Center IDs that need hours
  const centerIds = [1, 2, 3, 4, 5, 6, 7, 8, 19];

  // Assign patterns to centers - distribute patterns among the centers
  const patternNames = Object.keys(hourPatterns);

  // For each center ID, assign a pattern and create hours
  for (let i = 0; i < centerIds.length; i++) {
    const centerId = centerIds[i];
    // Cycle through patterns
    const patternName = patternNames[i % patternNames.length];
    const hourPattern = hourPatterns[patternName];

    // Check if center exists
    const centerExists = await prisma.communityCenter.findUnique({
      where: { id: centerId },
    });

    if (!centerExists) {
      continue;
    }

    // Check if hours already exist for this center
    const existingHours = await prisma.centerHours.findFirst({
      where: { center_id: centerId },
    });

    if (existingHours) {
      continue;
    }

    // Create hours for each day of the week
    for (const day of daysOfWeek) {
      let dayPattern;

      // Determine which pattern to use based on day
      if (day === "Saturday") {
        dayPattern = hourPattern.saturday;
      } else if (day === "Sunday") {
        dayPattern = hourPattern.sunday;
      } else {
        dayPattern = hourPattern.weekday;
      }

      // Create one centerHours record for each center and day combo
      await prisma.centerHours.create({
        data: {
          day: day,
          open_time: dayPattern.open_time,
          close_time: dayPattern.close_time,
          is_closed: dayPattern.is_closed,
          center: {
            connect: { id: centerId },
          },
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
