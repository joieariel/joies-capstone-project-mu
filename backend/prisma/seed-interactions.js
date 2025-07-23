const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// how to run this script: node backend/prisma/seed-interactions.js

/**
 * This seed file creates user interactions data for testing the recommendation engine:
 * 1. Page interactions (visits, clicks, scroll depth)
 * 2. Filter interactions (which filters users click on)
 * 3. Likes and dislikes
 *
 * The data is designed to test different recommendation scenarios:
 * - User 1: Tech enthusiast (likes tech-focused centers, uses tech-related filters)
 *   Expected outcome: Should receive recommendations for centers with fast Wi-Fi, printer access, and digital resources
 *
 * - User 2: Student (likes education centers, interacts with education resources)
 *   Expected outcome: Should receive recommendations for centers with educational resources and SAT/ACT prep
 *
 * - User 3: Job-seeker (likes career centers, uses career-related filters)
 *   Expected outcome: Should receive recommendations for centers with career resources, interview prep, and resume help
 *
 * - User 4: Mixed interests (varied likes, interactions across different types)
 *   Expected outcome: Should receive a diverse set of recommendations based on their mixed preferences
 *
 * - User 5: New user (minimal interactions, testing cold start problem)
 *   Expected outcome: Should receive more generic recommendations with slight influence from their minimal interactions
 *
 * This seed file uses actual tag IDs:
 * - Tech tags: 3 (good Wi-Fi), 10 (fast Wi-Fi), 17 (printer access), 20 (free Wi-Fi)
 * - Education tags: 21 (educational resources), 25 (SAT/ACT prep), 18 (internship opportunities)
 * - Career tags: 22 (career resources), 7 (virtual interview prep), 8 (digital resume help)
 */

async function main() {
  try {
    console.log("Starting to seed interaction data...");

    // Define specific users to use for seeding with their assigned roles
    const specificUsers = [
      { id: 18, description: "Tech Enthusiast" },     // User 18: Tech Enthusiast
      { id: 11, description: "Education Seeker" },    // User 11: Student/Education Seeker
      { id: 6, description: "Career-Focused" },       // User 6: Job Seeker
      { id: 19, description: "Mixed Interests" },     // User 19: Mixed Interests
      { id: 10, description: "New User" }             // User 10: New User (minimal interactions)
    ];

    // Get users either by specific usernames/IDs or get the first few from the database
    let users = [];

    if (specificUsers.length > 0) {
      // If specific users are provided, fetch those users
      for (const userInfo of specificUsers) {
        let user;

        if (userInfo.username) {
          // Find by username
          user = await prisma.user.findFirst({
            where: { username: userInfo.username },
            select: { id: true, username: true },
          });

          if (user) {
            console.log(`Found user with username ${userInfo.username} (ID: ${user.id}, Role: ${userInfo.description})`);
          } else {
            console.warn(`Warning: User with username ${userInfo.username} not found`);
          }
        } else if (userInfo.id) {
          // Find by ID
          user = await prisma.user.findUnique({
            where: { id: userInfo.id },
            select: { id: true, username: true },
          });

          if (user) {
            console.log(`Found user with ID ${user.id} (Role: ${userInfo.description})`);
          } else {
            console.warn(`Warning: User with ID ${userInfo.id} not found`);
          }
        }

        if (user) {
          users.push({ ...user, description: userInfo.description });
        }
      }
    }

    // If no specific users were found, get the first 5 users
    if (users.length === 0) {
      console.log("No specific users found or specified, using the first 5 users from the database");
      users = await prisma.user.findMany({
        select: { id: true, username: true },
        take: 5,
      });

      // Add descriptions for logging purposes
      users = users.map((user, index) => {
        const descriptions = [
          "Tech Enthusiast",
          "Education Seeker",
          "Career-Focused",
          "Mixed Interests",
          "New User"
        ];
        return { ...user, description: descriptions[index] || "Additional User" };
      });
    }

    if (users.length === 0) {
      console.error(
        "No users found in the database. Please create users first."
      );
      return;
    }

    console.log(`Found ${users.length} users to work with.`);

    // Get all community centers
    const centers = await prisma.communityCenter.findMany({
      include: {
        centerTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (centers.length === 0) {
      console.error(
        "No community centers found in the database. Please create centers first."
      );
      return;
    }

    console.log(`Found ${centers.length} community centers to work with.`);

    // Get all tags
    const tags = await prisma.tag.findMany();
    console.log(`Found ${tags.length} tags to work with.`);

    // Helper function to find centers with specific tag IDs
    const findCentersWithTagIds = (tagIds) => {
      return centers.filter((center) => {
        const centerTagIds = center.centerTags.map((ct) => ct.tag_id);
        return tagIds.some((tagId) => centerTagIds.includes(tagId));
      });
    };

    // Helper function to get tag IDs by their actual IDs
    const getTagIdsByIds = (tagIds) => {
      return tagIds.filter(id => {
        const tagExists = tags.some(tag => tag.id === id);
        if (!tagExists) {
          console.warn(`Warning: Tag ID ${id} not found in database`);
        }
        return tagExists;
      });
    };

    // Clear existing interaction data
    console.log("Clearing existing interaction data...");
    await prisma.pageInteraction.deleteMany({});
    await prisma.filterInteraction.deleteMany({});
    await prisma.likes.deleteMany({});
    await prisma.dislikes.deleteMany({});
    console.log("Existing interaction data cleared.");

    // =============================================
    // USER 1: TECH ENTHUSIAST
    // =============================================
    const user1 = users[0];
    console.log(`Setting up User 1 (ID: ${user1.id}) as a Tech Enthusiast...`);

    // Find tech-related centers using tag IDs
    const techCenters = findCentersWithTagIds([3, 10, 17, 20]); // good Wi-Fi speed, fast Wi-Fi, printer access, free Wi-Fi
    console.log(`Found ${techCenters.length} tech-related centers.`);

    // Tech-related tag IDs
    const techTagIds = getTagIdsByIds([3, 10, 17, 20]); // good Wi-Fi speed, fast Wi-Fi, printer access, free Wi-Fi
    console.log(`Using ${techTagIds.length} tech-related tags.`);

    // 1. Create likes for tech centers
    for (let i = 0; i < Math.min(3, techCenters.length); i++) {
      await prisma.likes.create({
        data: {
          user_id: user1.id,
          center_id: techCenters[i].id,
        },
      });
      console.log(`User 1 liked tech center: ${techCenters[i].name}`);
    }

    // 2. Create dislikes for non-tech centers (e.g., senior-focused)
    // Using centers with senior benefits tag (ID 24)
    const seniorCenters = centers.filter(center =>
      center.centerTags.some(ct => ct.tag_id === 24)
    );
    for (let i = 0; i < Math.min(2, seniorCenters.length); i++) {
      await prisma.dislikes.create({
        data: {
          user_id: user1.id,
          center_id: seniorCenters[i].id,
        },
      });
      console.log(`User 1 disliked senior center: ${seniorCenters[i].name}`);
    }

    // 3. Create page interactions (high engagement with tech centers)
    for (let i = 0; i < techCenters.length; i++) {
      const visitCount = Math.floor(Math.random() * 5) + 1; // 1-5 visits
      await prisma.pageInteraction.create({
        data: {
          user_id: user1.id,
          center_id: techCenters[i].id,
          scroll_depth: Math.floor(Math.random() * 40) + 60, // 60-100% scroll depth
          map_clicks: Math.floor(Math.random() * 3), // 0-2 map clicks
          review_clicks: Math.floor(Math.random() * 3), // 0-2 review clicks
          similar_clicks: Math.floor(Math.random() * 2), // 0-1 similar clicks
          visit_count: visitCount,
          last_visited: new Date(
            Date.now() - Math.floor(Math.random() * 7) * 86400000
          ), // 0-7 days ago
        },
      });
      console.log(
        `Created page interaction for User 1 with center: ${techCenters[i].name}`
      );
    }

    // 4. Create filter interactions (tech-focused filters)
    for (const tagId of techTagIds) {
      await prisma.filterInteraction.create({
        data: {
          user_id: user1.id,
          tag_id: tagId,
          filter_count: Math.floor(Math.random() * 5) + 3, // 3-7 clicks
          last_used: new Date(
            Date.now() - Math.floor(Math.random() * 7) * 86400000
          ), // 0-7 days ago
        },
      });
      console.log(
        `Created filter interaction for User 1 with tag ID: ${tagId}`
      );
    }

    // =============================================
    // USER 2: STUDENT
    // =============================================
    const user2 = users[1];
    console.log(
      `Setting up User 2 (ID: ${user2.id}) as an Education Seeker...`
    );

    // Find education-related centers using tag IDs
    const educationCenters = findCentersWithTagIds([21, 25, 18]); // educational resources, SAT/ACT prep, internship opportunities
    console.log(`Found ${educationCenters.length} education-related centers.`);

    // Education-related tag IDs
    const educationTagIds = getTagIdsByIds([21, 25, 18]); // educational resources, SAT/ACT prep, internship opportunities
    console.log(`Using ${educationTagIds.length} education-related tags.`);

    // 1. Create likes for education centers
    for (let i = 0; i < Math.min(3, educationCenters.length); i++) {
      await prisma.likes.create({
        data: {
          user_id: user2.id,
          center_id: educationCenters[i].id,
        },
      });
      console.log(`User 2 liked education center: ${educationCenters[i].name}`);
    }

    // 2. Create dislikes for non-education centers (e.g., career-focused)
    const careerCenters = findCentersWithTagIds([22]); // career resources
    for (let i = 0; i < Math.min(1, careerCenters.length); i++) {
      await prisma.dislikes.create({
        data: {
          user_id: user2.id,
          center_id: careerCenters[i].id,
        },
      });
      console.log(`User 2 disliked career center: ${careerCenters[i].name}`);
    }

    // 3. Create page interactions (high engagement with education centers)
    for (let i = 0; i < educationCenters.length; i++) {
      const visitCount = Math.floor(Math.random() * 4) + 2; // 2-5 visits
      await prisma.pageInteraction.create({
        data: {
          user_id: user2.id,
          center_id: educationCenters[i].id,
          scroll_depth: Math.floor(Math.random() * 30) + 70, // 70-100% scroll depth
          map_clicks: Math.floor(Math.random() * 2), // 0-1 map clicks
          review_clicks: Math.floor(Math.random() * 4), // 0-3 review clicks
          similar_clicks: Math.floor(Math.random() * 3), // 0-2 similar clicks
          visit_count: visitCount,
          last_visited: new Date(
            Date.now() - Math.floor(Math.random() * 10) * 86400000
          ), // 0-10 days ago
        },
      });
      console.log(
        `Created page interaction for User 2 with center: ${educationCenters[i].name}`
      );
    }

    // 4. Create filter interactions (education-focused filters)
    for (const tagId of educationTagIds) {
      await prisma.filterInteraction.create({
        data: {
          user_id: user2.id,
          tag_id: tagId,
          filter_count: Math.floor(Math.random() * 6) + 2, // 2-7 clicks
          last_used: new Date(
            Date.now() - Math.floor(Math.random() * 10) * 86400000
          ), // 0-10 days ago
        },
      });
      console.log(
        `Created filter interaction for User 2 with tag ID: ${tagId}`
      );
    }

    // =============================================
    // USER 3: JOB-SEEKER
    // =============================================
    const user3 = users[2];
    console.log(`Setting up User 3 (ID: ${user3.id}) as Career-Focused...`);

    // Find career-related centers using tag IDs
    const careerCentersForUser3 = findCentersWithTagIds([22, 7, 8]); // career resources, virtual interview prep, digital resume help
    console.log(
      `Found ${careerCentersForUser3.length} career-related centers.`
    );

    // Career-related tag IDs
    const careerTagIds = getTagIdsByIds([22, 7, 8]); // career resources, virtual interview prep, digital resume help
    console.log(`Using ${careerTagIds.length} career-related tags.`);

    // 1. Create likes for career centers
    for (let i = 0; i < Math.min(4, careerCentersForUser3.length); i++) {
      await prisma.likes.create({
        data: {
          user_id: user3.id,
          center_id: careerCentersForUser3[i].id,
        },
      });
      console.log(
        `User 3 liked career center: ${careerCentersForUser3[i].name}`
      );
    }

    // 2. Create dislikes for non-career centers
    const nonCareerCenters = centers.filter(
      (center) => !careerCentersForUser3.some((cc) => cc.id === center.id)
    );

    for (let i = 0; i < Math.min(2, nonCareerCenters.length); i++) {
      await prisma.dislikes.create({
        data: {
          user_id: user3.id,
          center_id: nonCareerCenters[i].id,
        },
      });
      console.log(
        `User 3 disliked non-career center: ${nonCareerCenters[i].name}`
      );
    }

    // 3. Create page interactions (very high engagement with career centers)
    for (let i = 0; i < careerCentersForUser3.length; i++) {
      const visitCount = Math.floor(Math.random() * 5) + 3; // 3-7 visits
      await prisma.pageInteraction.create({
        data: {
          user_id: user3.id,
          center_id: careerCentersForUser3[i].id,
          scroll_depth: Math.floor(Math.random() * 20) + 80, // 80-100% scroll depth
          map_clicks: Math.floor(Math.random() * 4), // 0-3 map clicks
          review_clicks: Math.floor(Math.random() * 5), // 0-4 review clicks
          similar_clicks: Math.floor(Math.random() * 3), // 0-2 similar clicks
          visit_count: visitCount,
          last_visited: new Date(
            Date.now() - Math.floor(Math.random() * 5) * 86400000
          ), // 0-5 days ago
        },
      });
      console.log(
        `Created page interaction for User 3 with center: ${careerCentersForUser3[i].name}`
      );
    }

    // 4. Create filter interactions (career-focused filters)
    for (const tagId of careerTagIds) {
      await prisma.filterInteraction.create({
        data: {
          user_id: user3.id,
          tag_id: tagId,
          filter_count: Math.floor(Math.random() * 7) + 4, // 4-10 clicks
          last_used: new Date(
            Date.now() - Math.floor(Math.random() * 5) * 86400000
          ), // 0-5 days ago
        },
      });
      console.log(
        `Created filter interaction for User 3 with tag ID: ${tagId}`
      );
    }

    // =============================================
    // USER 4: MIXED INTERESTS
    // =============================================
    const user4 = users[3];
    console.log(`Setting up User 4 (ID: ${user4.id}) with Mixed Interests...`);

    // 1. Create likes for various centers
    const mixedLikeCenters = [
      techCenters[0],
      educationCenters[0],
      careerCentersForUser3[0],
    ].filter(Boolean);

    for (const center of mixedLikeCenters) {
      await prisma.likes.create({
        data: {
          user_id: user4.id,
          center_id: center.id,
        },
      });
      console.log(`User 4 liked mixed center: ${center.name}`);
    }

    // 2. Create dislikes for random centers
    const randomCenters = centers
      .filter((center) => !mixedLikeCenters.some((c) => c.id === center.id))
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);

    for (const center of randomCenters) {
      await prisma.dislikes.create({
        data: {
          user_id: user4.id,
          center_id: center.id,
        },
      });
      console.log(`User 4 disliked random center: ${center.name}`);
    }

    // 3. Create page interactions (moderate engagement with various centers)
    const mixedInteractionCenters = [
      ...mixedLikeCenters,
      ...centers
        .filter(
          (center) =>
            !mixedLikeCenters.some((c) => c.id === center.id) &&
            !randomCenters.some((c) => c.id === center.id)
        )
        .slice(0, 5),
    ];

    for (const center of mixedInteractionCenters) {
      const visitCount = Math.floor(Math.random() * 3) + 1; // 1-3 visits
      await prisma.pageInteraction.create({
        data: {
          user_id: user4.id,
          center_id: center.id,
          scroll_depth: Math.floor(Math.random() * 60) + 40, // 40-100% scroll depth
          map_clicks: Math.floor(Math.random() * 2), // 0-1 map clicks
          review_clicks: Math.floor(Math.random() * 2), // 0-1 review clicks
          similar_clicks: Math.floor(Math.random() * 2), // 0-1 similar clicks
          visit_count: visitCount,
          last_visited: new Date(
            Date.now() - Math.floor(Math.random() * 14) * 86400000
          ), // 0-14 days ago
        },
      });
      console.log(
        `Created page interaction for User 4 with center: ${center.name}`
      );
    }

    // 4. Create filter interactions (mixed filters)
    const mixedTagIds = [
      ...techTagIds.slice(0, 2),
      ...educationTagIds.slice(0, 2),
      ...careerTagIds.slice(0, 2),
    ];

    for (const tagId of mixedTagIds) {
      await prisma.filterInteraction.create({
        data: {
          user_id: user4.id,
          tag_id: tagId,
          filter_count: Math.floor(Math.random() * 3) + 1, // 1-3 clicks
          last_used: new Date(
            Date.now() - Math.floor(Math.random() * 14) * 86400000
          ), // 0-14 days ago
        },
      });
      console.log(
        `Created filter interaction for User 4 with tag ID: ${tagId}`
      );
    }

    // =============================================
    // USER 5: NEW USER (MINIMAL INTERACTIONS)
    // =============================================
    const user5 = users[4];
    console.log(`Setting up User 5 (ID: ${user5.id}) as a New User...`);

    // 1. Create just one like
    const randomCenter = centers[Math.floor(Math.random() * centers.length)];
    await prisma.likes.create({
      data: {
        user_id: user5.id,
        center_id: randomCenter.id,
      },
    });
    console.log(`User 5 liked random center: ${randomCenter.name}`);

    // 2. Create minimal page interactions
    await prisma.pageInteraction.create({
      data: {
        user_id: user5.id,
        center_id: randomCenter.id,
        scroll_depth: 30, // minimal scroll
        map_clicks: 0,
        review_clicks: 1,
        similar_clicks: 0,
        visit_count: 1,
        last_visited: new Date(),
      },
    });
    console.log(
      `Created minimal page interaction for User 5 with center: ${randomCenter.name}`
    );

    // 3. Create one filter interaction
    const randomTag = tags[Math.floor(Math.random() * tags.length)];
    await prisma.filterInteraction.create({
      data: {
        user_id: user5.id,
        tag_id: randomTag.id,
        filter_count: 1,
        last_used: new Date(),
      },
    });
    console.log(
      `Created minimal filter interaction for User 5 with tag ID: ${randomTag.id}`
    );

    console.log("Interaction data seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding interaction data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
