const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
// seed file for the remaining community centers that need hours
async function main() {
  // Center IDs that need hours
  const centerIds = [1, 2, 3, 4, 5, 6, 7, 8, 19];

  // Days of the week
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Define different hour patterns
  const hourPatterns = {
    // standard business hours
    standard: {
      weekday: { open_time: '9:00 AM', close_time: '5:00 PM', is_closed: false },
      saturday: { open_time: '10:00 AM', close_time: '4:00 PM', is_closed: false },
      sunday: { open_time: null, close_time: null, is_closed: true }
    },
    // extended hours
    extended: {
      weekday: { open_time: '8:00 AM', close_time: '9:00 PM', is_closed: false },
      saturday: { open_time: '9:00 AM', close_time: '8:00 PM', is_closed: false },
      sunday: { open_time: '10:00 AM', close_time: '6:00 PM', is_closed: false }
    },
    // 24/7 operation
    twentyFourSeven: {
      weekday: { open_time: '12:00 AM', close_time: '11:59 PM', is_closed: false },
      saturday: { open_time: '12:00 AM', close_time: '11:59 PM', is_closed: false },
      sunday: { open_time: '12:00 AM', close_time: '11:59 PM', is_closed: false }
    },
    // limited weekend hours
    limitedWeekend: {
      weekday: { open_time: '7:00 AM', close_time: '8:00 PM', is_closed: false },
      saturday: { open_time: '9:00 AM', close_time: '5:00 PM', is_closed: false },
      sunday: { open_time: null, close_time: null, is_closed: true }
    },
    // Late night hours
    lateNight: {
      weekday: { open_time: '10:00 AM', close_time: '11:00 PM', is_closed: false },
      saturday: { open_time: '10:00 AM', close_time: '12:00 AM', is_closed: false },
      sunday: { open_time: '12:00 PM', close_time: '10:00 PM', is_closed: false }
    }
  };

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
      where: { id: centerId }
    });

    if (!centerExists) {
      continue;
    }

    // Check if hours already exist for this center
    const existingHours = await prisma.centerHours.findFirst({
      where: { center_id: centerId }
    });

    if (existingHours) {
      continue;
    }

    // Create hours for each day of the week
    for (const day of daysOfWeek) {
      let dayPattern;

      // Determine which pattern to use based on day
      if (day === 'Saturday') {
        dayPattern = hourPattern.saturday;
      } else if (day === 'Sunday') {
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
            connect: { id: centerId }
          }
        }
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
