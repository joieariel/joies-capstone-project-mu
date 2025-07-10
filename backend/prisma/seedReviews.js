const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Starting to seed users and reviews...");

  // First, delete all existing reviews and related data
  console.log("Deleting all existing review data...");

  // Delete in the correct order to respect foreign key constraints
  console.log("Deleting review tags...");
  await prisma.reviewTag.deleteMany({});

  console.log("Deleting review images...");
  await prisma.reviewImage.deleteMany({});

  console.log("Deleting reviews...");
  await prisma.review.deleteMany({});

  console.log("Deleting center tags...");
  await prisma.centerTag.deleteMany({});

  console.log("All existing review data deleted successfully!");

  // create test users with different profiles
  const users = [
    {
      supabase_user_id: "test-user-1",
      first_name: "Alex",
      last_name: "Johnson",
      username: "alexj",
      email: "alex@example.com",
      status: "active",
      birthdate: new Date("1990-01-15"),
      zip_code: "94102",
      city: "San Francisco",
      state: "CA"
    },
    {
      supabase_user_id: "test-user-2",
      first_name: "Taylor",
      last_name: "Smith",
      username: "taylors",
      email: "taylor@example.com",
      status: "active",
      birthdate: new Date("1985-05-22"),
      zip_code: "94110",
      city: "San Francisco",
      state: "CA"
    },
    {
      supabase_user_id: "test-user-3",
      first_name: "Jordan",
      last_name: "Lee",
      username: "jordanl",
      email: "jordan@example.com",
      status: "active",
      birthdate: new Date("1992-11-08"),
      zip_code: "94704",
      city: "Berkeley",
      state: "CA"
    },
    {
      supabase_user_id: "test-user-4",
      first_name: "Morgan",
      last_name: "Chen",
      username: "morganc",
      email: "morgan@example.com",
      status: "active",
      birthdate: new Date("1988-03-30"),
      zip_code: "94301",
      city: "Palo Alto",
      state: "CA"
    },
    {
      supabase_user_id: "test-user-5",
      first_name: "Casey",
      last_name: "Williams",
      username: "caseyw",
      email: "casey@example.com",
      status: "active",
      birthdate: new Date("1995-07-12"),
      zip_code: "95110",
      city: "San Jose",
      state: "CA"
    }
  ];

  // create users using upsert to avoid duplicates
  const createdUsers = [];
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData
    });
    createdUsers.push(user);
    console.log(`Created/updated user: ${user.first_name} ${user.last_name}`);
  }

  // helper function to create a date in the past
  const daysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  };

  // create reviews with varied ratings, dates, and distributions
  const reviewsData = [
    // Downtown Digital Hub (center id 1) - many recent, high ratings, plus some older ones
    // This center should rank high in "recommended" due to high ratings, many reviews, and recency
    { userId: 1, centerId: 1, rating: 5, comment: "Excellent facilities! The 24/7 access is perfect for my schedule.", created_at: daysAgo(2) },
    { userId: 2, centerId: 1, rating: 5, comment: "Love this place! Fast internet and great atmosphere.", created_at: daysAgo(5) },
    { userId: 3, centerId: 1, rating: 4, comment: "Very good resources and helpful staff.", created_at: daysAgo(10) },
    { userId: 4, centerId: 1, rating: 5, comment: "The best community center I've used. Clean and well-maintained.", created_at: daysAgo(15) },
    { userId: 5, centerId: 1, rating: 4, comment: "Great place to work remotely. Quiet and comfortable.", created_at: daysAgo(20) },
    { userId: 1, centerId: 1, rating: 5, comment: "I come here almost daily. Can't recommend enough!", created_at: daysAgo(30) },
    { userId: 2, centerId: 1, rating: 5, comment: "Perfect for late night work sessions.", created_at: daysAgo(45) },
    { userId: 3, centerId: 1, rating: 4, comment: "Reliable internet and good workspace options.", created_at: daysAgo(60) },
    // Adding older reviews (>90 days) to test recency scoring
    { userId: 4, centerId: 1, rating: 5, comment: "Been using this center for months now. Still great!", created_at: daysAgo(120) },
    { userId: 5, centerId: 1, rating: 4, comment: "Consistent quality service over the past year.", created_at: daysAgo(180) },
    { userId: 1, centerId: 1, rating: 5, comment: "My go-to place for almost a year now.", created_at: daysAgo(330) },

    // Eastside Learning Center (center id 2) - few reviews, mixed ratings, older
    // This center should rank lower due to fewer reviews, mixed ratings, and older dates
    { userId: 4, centerId: 2, rating: 3, comment: "Decent facilities but limited hours.", created_at: daysAgo(70) },
    { userId: 5, centerId: 2, rating: 2, comment: "Computers are outdated and slow.", created_at: daysAgo(85) },
    { userId: 1, centerId: 2, rating: 4, comment: "Staff is helpful but resources are limited.", created_at: daysAgo(100) },
    // Adding more older reviews
    { userId: 2, centerId: 2, rating: 3, comment: "Not much has changed in the past 6 months.", created_at: daysAgo(150) },
    { userId: 3, centerId: 2, rating: 2, comment: "They really need to update their equipment.", created_at: daysAgo(210) },
    { userId: 4, centerId: 2, rating: 3, comment: "Been using this center for almost a year. It's okay.", created_at: daysAgo(350) },

    // Westside Tech Commons (center id 3) - moderate number of reviews, good ratings, mix of dates
    // This center should rank in the middle for "recommended"
    { userId: 2, centerId: 3, rating: 4, comment: "Great tech resources and workshops.", created_at: daysAgo(7) },
    { userId: 3, centerId: 3, rating: 5, comment: "Amazing 3D printing workshop! Learned so much.", created_at: daysAgo(25) },
    { userId: 4, centerId: 3, rating: 4, comment: "Good coding classes and helpful mentors.", created_at: daysAgo(40) },
    { userId: 5, centerId: 3, rating: 3, comment: "Decent space but can get crowded during peak hours.", created_at: daysAgo(55) },
    { userId: 1, centerId: 3, rating: 4, comment: "The extended hours are very convenient.", created_at: daysAgo(75) },
    // Adding older reviews
    { userId: 2, centerId: 3, rating: 4, comment: "Their workshops have been consistently good all year.", created_at: daysAgo(110) },
    { userId: 3, centerId: 3, rating: 5, comment: "The 3D printing facilities are still the best in the area.", created_at: daysAgo(200) },
    { userId: 4, centerId: 3, rating: 3, comment: "Quality has been consistent over the past year.", created_at: daysAgo(300) },

    // Northside Community Hub (center id 4) - few but recent and high ratings, plus some older ones
    // This center should test how recency affects ranking
    { userId: 2, centerId: 4, rating: 5, comment: "Just discovered this place and it's fantastic!", created_at: daysAgo(1) },
    { userId: 3, centerId: 4, rating: 5, comment: "Great community events and resources.", created_at: daysAgo(3) },
    { userId: 4, centerId: 4, rating: 4, comment: "Nice space with friendly staff.", created_at: daysAgo(8) },
    // Adding older reviews
    { userId: 5, centerId: 4, rating: 4, comment: "I've been coming here occasionally throughout the year.", created_at: daysAgo(130) },
    { userId: 1, centerId: 4, rating: 3, comment: "It was better when I first started coming here 8 months ago.", created_at: daysAgo(240) },
    { userId: 2, centerId: 4, rating: 4, comment: "Been using this center for about a year now.", created_at: daysAgo(365) },

    // Southside Innovation Lab (center id 5) - mixed ratings, some recent, some old
    // This center should test how mixed ratings and dates affect ranking
    { userId: 5, centerId: 5, rating: 2, comment: "Limited resources and often too busy.", created_at: daysAgo(5) },
    { userId: 1, centerId: 5, rating: 5, comment: "Great entrepreneurship programs!", created_at: daysAgo(15) },
    { userId: 2, centerId: 5, rating: 3, comment: "Decent mentoring but inconsistent availability.", created_at: daysAgo(35) },
    { userId: 3, centerId: 5, rating: 4, comment: "Good business workshops and networking events.", created_at: daysAgo(65) },
    { userId: 4, centerId: 5, rating: 1, comment: "Equipment is often broken or unavailable.", created_at: daysAgo(95) },
    // Adding older reviews
    { userId: 5, centerId: 5, rating: 3, comment: "Quality has been up and down over the past 6 months.", created_at: daysAgo(160) },
    { userId: 1, centerId: 5, rating: 4, comment: "Their programs have improved since I started coming here last year.", created_at: daysAgo(270) },
    { userId: 2, centerId: 5, rating: 2, comment: "Been using this center for over a year. Still hit or miss.", created_at: daysAgo(380) }
  ];

  // Get the IDs of our test users to target only test data
  const testUserIds = createdUsers.map(user => user.id);
  console.log(`Test user IDs: ${testUserIds.join(', ')}`);

  // Find reviews created by our test users
  const testReviews = await prisma.review.findMany({
    where: {
      user_id: {
        in: testUserIds
      }
    },
    select: {
      id: true
    }
  });
  const testReviewIds = testReviews.map(review => review.id);
  console.log(`Found ${testReviewIds.length} existing test reviews`);

  // Delete review images associated with test reviews
  console.log("Deleting review images for test reviews...");
  await prisma.reviewImage.deleteMany({
    where: {
      review_id: {
        in: testReviewIds
      }
    }
  });

  // Delete review tags associated with test reviews
  console.log("Deleting review tags for test reviews...");
  await prisma.reviewTag.deleteMany({
    where: {
      review_id: {
        in: testReviewIds
      }
    }
  });

  // Delete only the reviews created by test users
  console.log("Deleting test reviews...");
  await prisma.review.deleteMany({
    where: {
      user_id: {
        in: testUserIds
      }
    }
  });
  console.log("Deleted test reviews only");

  // Create tags first to ensure they exist
  const tagNames = [
    "Family Friendly", "Fast WiFi", "Open Late", "Early Hours", "Near Transportation",
    "24/7", "Quiet", "Safe", "Clean", " Wheelchair Accessible", "Printer Access",
    "Open Weekends", "Busy", "Free-WiFi", "Good Wifi Speed", "Spacious",
    "Free Food", "Free Coffee", "Pets Welcome"
  ];

  // Create all tags
  for (const tagName of tagNames) {
    try {
      await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName }
      });
      console.log(`Created/updated tag: ${tagName}`);
    } catch (error) {
      console.error(`Error creating tag "${tagName}":`, error);
    }
  }

  // Create the reviews and store them in an array
  const createdReviews = [];
  for (const reviewData of reviewsData) {
    const review = await prisma.review.create({
      data: {
        rating: reviewData.rating,
        comment: reviewData.comment,
        created_at: reviewData.created_at,
        user: {
          connect: { id: reviewData.userId }
        },
        community_center: {
          connect: { id: reviewData.centerId }
        }
      }
    });
    createdReviews.push(review);
    console.log(`Created review for center ${reviewData.centerId} with rating ${reviewData.rating}`);
  }

  // Define tag assignments based on center IDs and review indices
  const tagAssignments = [
    // Downtown Digital Hub (center id 1) tags
    { centerIndex: 1, reviewIndices: [0, 1, 2, 3], tags: ["Fast WiFi", "Clean", "24/7", "Free-WiFi", "Good Wifi Speed"] },

    // Eastside Learning Center (center id 2) tags
    { centerIndex: 2, reviewIndices: [0, 1, 2], tags: ["Wheelchair Accessible", "Early Hours", "Near Transportation"] },

    // Westside Tech Commons (center id 3) tags
    { centerIndex: 3, reviewIndices: [0, 1, 2], tags: ["Printer Access", "Open Late", "Open Weekends", "Free Coffee"] },

    // Northside Community Hub (center id 4) tags
    { centerIndex: 4, reviewIndices: [0, 1], tags: ["Family Friendly", "Safe", "Pets Welcome", "Free Food"] },

    // Southside Innovation Lab (center id 5) tags
    { centerIndex: 5, reviewIndices: [0, 1, 2], tags: ["Busy", "Spacious", "Quiet", "Near Transportation"] }
  ];

  // Group reviews by center ID for easier assignment
  const reviewsByCenterId = {};
  createdReviews.forEach(review => {
    if (!reviewsByCenterId[review.center_id]) {
      reviewsByCenterId[review.center_id] = [];
    }
    reviewsByCenterId[review.center_id].push(review);
  });

  // Add tags to reviews
  for (const assignment of tagAssignments) {
    const centerReviews = reviewsByCenterId[assignment.centerIndex] || [];

    for (const tagName of assignment.tags) {
      try {
        // Find the tag by name
        const tag = await prisma.tag.findUnique({
          where: { name: tagName }
        });

        if (tag) {
          // Add this tag to the center itself (CenterTag)
          try {
            await prisma.centerTag.upsert({
              where: {
                center_id_tag_id: {
                  center_id: assignment.centerIndex,
                  tag_id: tag.id
                }
              },
              update: {},
              create: {
                center_id: assignment.centerIndex,
                tag_id: tag.id
              }
            });
            console.log(`Added tag "${tagName}" to center ${assignment.centerIndex}`);
          } catch (error) {
            console.error(`Error adding tag "${tagName}" to center ${assignment.centerIndex}:`, error);
          }

          // Add this tag to selected reviews for this center
          for (const reviewIndex of assignment.reviewIndices) {
            if (centerReviews[reviewIndex]) {
              try {
                await prisma.reviewTag.create({
                  data: {
                    review: {
                      connect: { id: centerReviews[reviewIndex].id }
                    },
                    tag: {
                      connect: { id: tag.id }
                    }
                  }
                });
                console.log(`Added tag "${tagName}" to review ${centerReviews[reviewIndex].id}`);
              } catch (error) {
                if (error.code === 'P2002') {
                  console.log(`Tag "${tagName}" already exists for review ${centerReviews[reviewIndex].id}`);
                } else {
                  console.error(`Error adding tag "${tagName}" to review ${centerReviews[reviewIndex].id}:`, error);
                }
              }
            }
          }
        } else {
          console.log(`Tag "${tagName}" not found`);
        }
      } catch (error) {
        console.error(`Error processing tag "${tagName}":`, error);
      }
    }
  }

  console.log("Seeding users and reviews completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding reviews:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// to run this script, use the following command:
// node backend/prisma/seedReviews.js
