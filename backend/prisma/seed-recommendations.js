const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { hourPatterns } = require("../utils/constants");
// how to run this script: node backend/prisma/seed-recommendations.js

/**
 * Tag IDs and names for reference:
 * 1: slow Wi-Fi
 * 2: clean
 * 3: good Wi-Fi speed
 * 4: spacious
 * 5: family-friendly
 * 6: safe
 * 7: free food
 * 8: free coffee
 * 9: pets welcome
 * 10: fast Wi-Fi
 * 11: open late
 * 12: early hours
 * 13: near transportation
 * 14: 24/7
 * 15: quiet
 * 16: wheelchair accessible
 * 17: printer access
 * 18: open weekends
 * 19: busy
 * 20: free Wi-Fi
 * 21: educational resources
 * 22: career resources
 * 23: military discount
 * 24: senior benefits
 * 25: SAT/ACT prep
 */

/**
 * This seed file creates 6 community centers with intentional similarities and differences
 * to test the recommendation algorithm. The centers have varying degrees of similarity in:
 * - Tags (education resources, career resources, military discount, senior benefits, sat/act prep)
 * - Location (some close together, some far apart)
 * - Hours (some with similar hours, some with different hours)
 *
 * Unlike the previous version, this seed file:
 * 1. Creates reviews with tags first
 * 2. Lets the review creation process handle adding tags to centers
 * 3. Includes realistic reviews that correspond with the tags
 * 4. Adds Unsplash images to some reviews
 * 5. Does not delete any existing data
 */

async function main() {
  // Check if our test centers already exist and only create them if they don't
  const existingCenters = await prisma.communityCenter.findMany({
    where: {
      name: {
        in: [
          "Education Resource Center",
          "Academic Success Center",
          "Career Development Institute",
          "Workforce Training Center",
          "Senior Wellness Hub",
          "University Community College",
        ],
      },
    },
  });

  // Create a map of existing centers by name for quick lookup
  const existingCentersByName = {};
  existingCenters.forEach((center) => {
    existingCentersByName[center.name] = center;
  });

  // Create community centers
  const centers = [
    // Center 7: Stanford University - Palo Alto
    {
      name: "Stanford University Library",
      address: "450 Serra Mall, Stanford, CA",
      email: "library@stanford.edu",
      zip_code: "94305",
      phone_number: "(650) 723-2300",
      image_url: "https://images.unsplash.com/photo-1564981797816-1043664bf78d",
      description:
        "Stanford University Library offers extensive educational resources, study spaces, and research facilities for students and the public. Features high-speed internet and comprehensive academic resources.",
      latitude: 37.4275,
      longitude: -122.1697,
      timezone: "America/Los_Angeles",
      hourPattern: "extended",
      reviews: [
        {
          rating: 5,
          comment:
            "The educational resources here are unmatched! As a researcher, I appreciate the quiet environment and spacious study areas. The free Wi-Fi is extremely reliable.",
          images: [
            "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3",
          ],
          tags: [21, 15, 4, 20], // educational resources, quiet, spacious, free Wi-Fi
        },
        {
          rating: 5,
          comment:
            "Stanford's library is immaculately clean and the printer access has been a lifesaver for my research papers. The educational resources are comprehensive.",
          images: [],
          tags: [21, 2, 17], // educational resources, clean, printer access
        },
        {
          rating: 4,
          comment:
            "Great place to study with excellent educational resources. The SAT/ACT prep materials helped my daughter tremendously. It can get busy during finals week though.",
          images: [
            "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
          ],
          tags: [21, 25, 19], // educational resources, SAT/ACT prep, busy
        },
      ],
    },

    // Center 8: Sunnyvale Tech Library - Sunnyvale
    {
      name: "Sunnyvale Tech Library",
      address: "665 W Olive Ave, Sunnyvale, CA",
      email: "info@sunnyvaletech.org",
      zip_code: "94086",
      phone_number: "(408) 730-7300",
      image_url: "https://images.unsplash.com/photo-1568667256549-094345857637",
      description:
        "A modern tech-focused library and coworking space offering career resources, technical workshops, and collaborative spaces for Silicon Valley professionals and students.",
      latitude: 37.3688,
      longitude: -122.0363,
      timezone: "America/Los_Angeles",
      hourPattern: "lateNight",
      reviews: [
        {
          rating: 4,
          comment:
            "This tech library has excellent career resources and fast Wi-Fi. The late night hours are perfect for tech workers like me who code at odd hours.",
          images: [],
          tags: [22, 10, 11], // career resources, fast Wi-Fi, open late
        },
        {
          rating: 5,
          comment:
            "I love the printer access and spacious workstations. The career workshops they host have been instrumental in my job search in the tech industry.",
          images: [
            "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
          ],
          tags: [17, 4, 22], // printer access, spacious, career resources
        },
        {
          rating: 4,
          comment:
            "Great place to work remotely. Clean environment, fast Wi-Fi, and they're open late which is perfect for my schedule.",
          images: [],
          tags: [2, 10, 11], // clean, fast Wi-Fi, open late
        },
      ],
    },

    // Center 9: Meta Headquarters - Menlo Park
    {
      name: "Meta Community Space",
      address: "1 Hacker Way, Menlo Park, CA",
      email: "community@meta.com",
      zip_code: "94025",
      phone_number: "(650) 543-4800",
      image_url: "https://images.unsplash.com/photo-1633675254053-d96c7668c3b8",
      description:
        "Meta's community space offers cutting-edge technology resources, career development workshops, and collaborative environments for tech enthusiasts and professionals.",
      latitude: 37.4848,
      longitude: -122.1484,
      timezone: "America/Los_Angeles",
      hourPattern: "extended",
      reviews: [
        {
          rating: 5,
          comment:
            "The career resources at Meta's community space are incredible! The fast Wi-Fi and clean, spacious environment make it perfect for working on tech projects.",
          images: ["https://images.unsplash.com/photo-1542744173-8e7e53415bb0"],
          tags: [22, 10, 2, 4], // career resources, fast Wi-Fi, clean, spacious
        },
        {
          rating: 5,
          comment:
            "I love the printer access and educational resources available here. The extended hours accommodate my busy schedule perfectly.",
          images: [],
          tags: [17, 21, 11], // printer access, educational resources, open late
        },
        {
          rating: 4,
          comment:
            "Great career workshops and networking opportunities. The space is always clean and the Wi-Fi is lightning fast.",
          images: ["https://images.unsplash.com/photo-1556761175-5973dc0f32e7"],
          tags: [22, 2, 10], // career resources, clean, fast Wi-Fi
        },
        {
          rating: 5,
          comment:
            "The educational resources here have helped me transition into tech. Their career counseling services are top-notch.",
          images: [],
          tags: [21, 22], // educational resources, career resources
        },
      ],
    },

    // Center 10: Google Office - Mountain View
    {
      name: "Google Community Hub",
      address: "1600 Amphitheatre Parkway, Mountain View, CA",
      email: "community@google.com",
      zip_code: "94043",
      phone_number: "(650) 253-0000",
      image_url: "https://images.unsplash.com/photo-1529612700005-e35377bf1415",
      description:
        "Google's community hub provides access to technology resources, career development programs, and collaborative spaces for innovation and learning.",
      latitude: 37.422,
      longitude: -122.0841,
      timezone: "America/Los_Angeles",
      hourPattern: "extended",
      reviews: [
        {
          rating: 5,
          comment:
            "Google's community hub has the fastest Wi-Fi I've ever used! The career resources and clean, spacious environment make it my go-to workspace.",
          images: [],
          tags: [10, 22, 2, 4], // fast Wi-Fi, career resources, clean, spacious
        },
        {
          rating: 5,
          comment:
            "I love the educational workshops they offer. The printer access is convenient, and the extended hours fit perfectly with my schedule.",
          images: [
            "https://images.unsplash.com/photo-1568992687947-868a62a9f521",
          ],
          tags: [21, 17, 11], // educational resources, printer access, open late
        },
        {
          rating: 4,
          comment:
            "Great career development resources and networking events. The space is always clean and well-maintained.",
          images: [],
          tags: [22, 2], // career resources, clean
        },
        {
          rating: 5,
          comment:
            "The educational resources and fast Wi-Fi make this an ideal place to work and learn. Their tech workshops are excellent.",
          images: [
            "https://images.unsplash.com/photo-1515187029135-18ee286d815b",
          ],
          tags: [21, 10], // educational resources, fast Wi-Fi
        },
      ],
    },

    // Center 11: Mountain View Tech Hub
    {
      name: "Mountain View Tech Hub",
      address: "500 Castro Street, Mountain View, CA",
      email: "info@mvtechhub.org",
      zip_code: "94041",
      phone_number: "(650) 903-6300",
      image_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
      description:
        "A community-focused technology center offering coding classes, digital literacy programs, and workspace for Mountain View residents and professionals.",
      latitude: 37.3894,
      longitude: -122.0819,
      timezone: "America/Los_Angeles",
      hourPattern: "standard",
      reviews: [
        {
          rating: 4,
          comment:
            "This tech hub has good educational resources for beginners. The printer access is convenient, though they close earlier than I'd like.",
          images: [],
          tags: [21, 17], // educational resources, printer access
        },
        {
          rating: 3,
          comment:
            "Decent free Wi-Fi and clean environment, but limited hours on weekends. Good for basic tech needs.",
          images: [
            "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
          ],
          tags: [20, 2], // free Wi-Fi, clean
        },
        {
          rating: 5,
          comment:
            "Their educational programs for youth are excellent! My kids love the coding classes, and the space is always clean and welcoming.",
          images: [],
          tags: [21, 2, 5], // educational resources, clean, family-friendly
        },
      ],
    },
    // Center 1: Education Resource Center (similar to Center 2) - San Francisco
    {
      name: "Education Resource Center",
      address: "123 Learning Ave, San Francisco",
      email: "education@example.com",
      zip_code: "94110",
      phone_number: "(415) 555-1000",
      image_url: "https://images.unsplash.com/photo-1577985043696-8bd54d9f093f",
      description:
        "A comprehensive education center offering resources for students of all ages. Specializes in tutoring, test prep, and educational workshops.",
      latitude: 37.749,
      longitude: -122.418,
      timezone: "America/Los_Angeles",
      hourPattern: "extended",
      reviews: [
        {
          rating: 5,
          comment:
            "This center has been a lifesaver for my SAT prep! The education resources are top-notch and the tutors are extremely knowledgeable. I improved my score by 200 points!",
          images: [
            "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
            "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e",
          ],
          tags: [21, 25], // education resources, sat/act prep
        },
        {
          rating: 4,
          comment:
            "Great educational resources and study spaces. The SAT prep courses are excellent, though it can get crowded during peak hours.",
          images: [],
          tags: [21, 25], // education resources, sat/act prep
        },
        {
          rating: 5,
          comment:
            "I love the extended hours! As a night owl, I appreciate being able to study late. Their education resources are comprehensive and well-organized.",
          images: [
            "https://images.unsplash.com/photo-1571260899304-425eee4c7efc",
          ],
          tags: [21], // education resources
        },
        {
          rating: 5,
          comment:
            "The SAT prep program here is outstanding. My daughter's scores improved dramatically after just a few sessions.",
          images: [],
          tags: [25], // sat/act prep
        },
      ],
    },

    // Center 2: Academic Success Center (similar to Center 1) - San Francisco (close to Center 1)
    {
      name: "Academic Success Center",
      address: "456 Scholar St, San Francisco",
      email: "academic@example.com",
      zip_code: "94110",
      phone_number: "(415) 555-2000",
      image_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
      description:
        "Dedicated to helping students achieve academic excellence through personalized tutoring, study groups, and educational resources.",
      latitude: 37.752, // Very close to Center 1
      longitude: -122.422,
      timezone: "America/Los_Angeles",
      hourPattern: "extended", // Same hours as Center 1
      reviews: [
        {
          rating: 5,
          comment:
            "The youth programs here are fantastic! My kids love coming here for the educational resources and SAT prep. The staff is incredibly supportive.",
          images: [
            "https://images.unsplash.com/photo-1509062522246-3755977927d7",
          ],
          tags: [21, 25, 3], // education resources, sat/act prep, youth programs
        },
        {
          rating: 4,
          comment:
            "Great educational resources for students of all ages. The youth programs are well-structured and engaging. My teenager has been attending their SAT prep classes with good results.",
          images: [],
          tags: [21, 3, 25], // education resources, youth programs, sat/act prep
        },
        {
          rating: 5,
          comment:
            "This center has transformed my child's academic performance. The youth programs and educational resources are excellent.",
          images: [],
          tags: [21, 3], // education resources, youth programs
        },
        {
          rating: 4,
          comment:
            "The SAT prep courses are comprehensive and effective. My son's scores improved significantly after attending.",
          images: [
            "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
          ],
          tags: [25], // sat/act prep
        },
      ],
    },

    // Center 3: Career Development Institute (somewhat similar to Center 4) - Oakland
    {
      name: "Career Development Institute",
      address: "789 Professional Pkwy, Oakland",
      email: "careers@example.com",
      zip_code: "94612",
      phone_number: "(510) 555-3000",
      image_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
      description:
        "Helping individuals advance their careers through job training, resume workshops, and professional development courses.",
      latitude: 37.806, // Oakland (moderately far from Centers 1 and 2)
      longitude: -122.267,
      timezone: "America/Los_Angeles",
      hourPattern: "standard",
      reviews: [
        {
          rating: 5,
          comment:
            "The career resources here are exceptional! I attended their resume workshop and landed a job within two weeks. The adult education programs are practical and relevant.",
          images: ["https://images.unsplash.com/photo-1551836022-d5d88e9218df"],
          tags: [22, 4, 17], // career resources, spacious, printer access
        },
        {
          rating: 4,
          comment:
            "Great job placement services and career resources. The staff is knowledgeable and supportive. The printer access and spacious work areas helped me prepare job applications.",
          images: [],
          tags: [22, 17, 4], // career resources, printer access, spacious
        },
        {
          rating: 4,
          comment:
            "I've used their job placement services twice now and both times I found employment quickly. Their career counselors are excellent.",
          images: [],
          tags: [22, 8], // career resources, job placement
        },
      ],
    },

    // Center 4: Workforce Training Center (somewhat similar to Center 3) - Berkeley (close to Center 3)
    {
      name: "Workforce Training Center",
      address: "101 Employment Blvd, Berkeley",
      email: "workforce@example.com",
      zip_code: "94704",
      phone_number: "(510) 555-4000",
      image_url: "https://images.unsplash.com/photo-1552664730-d307ca884978",
      description:
        "Providing workforce development and vocational training to help community members gain valuable job skills and find employment.",
      latitude: 37.868, // Berkeley (close to Center 3)
      longitude: -122.258,
      timezone: "America/Los_Angeles",
      hourPattern: "limitedWeekend", // Different hours from Center 3
      reviews: [
        {
          rating: 4,
          comment:
            "As a veteran, I appreciate the military discount they offer. The career resources and job placement services have been invaluable in my transition to civilian work.",
          images: [],
          tags: [22, 8, 23], // career resources, job placement, military discount
        },
        {
          rating: 3,
          comment:
            "Decent job placement services, though the weekend hours are limited. They do offer a good military discount which is appreciated.",
          images: [],
          tags: [8, 23], // job placement, military discount
        },
        {
          rating: 5,
          comment:
            "The career resources here helped me completely transform my professional life. Their military discount program is generous and much appreciated.",
          images: [
            "https://images.unsplash.com/photo-1521791136064-7986c2920216",
          ],
          tags: [22, 23], // career resources, military discount
        },
      ],
    },

    // Center 5: Senior Wellness Hub (unique, not similar to others) - Sacramento (far from Bay Area)
    {
      name: "Senior Wellness Hub",
      address: "555 Elder Way, Sacramento",
      email: "seniors@example.com",
      zip_code: "95814",
      phone_number: "(916) 555-5000",
      image_url: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21",
      description:
        "A community center dedicated to the health, wellness, and social engagement of senior citizens. Offers various programs and services tailored to older adults.",
      latitude: 38.581, // Sacramento (far from other centers)
      longitude: -121.494,
      timezone: "America/Los_Angeles",
      hourPattern: "standard",
      reviews: [
        {
          rating: 5,
          comment:
            "The senior benefits information provided here is comprehensive and helpful. The health services are excellent, and I enjoy the quiet environment and recreational activities they organize.",
          images: ["https://images.unsplash.com/photo-1556911073-38141963c9e0"],
          tags: [24, 15, 16], // senior benefits, quiet, wheelchair accessible
        },
        {
          rating: 5,
          comment:
            "As a senior, I've found this center to be a wonderful resource. The wheelchair accessibility is excellent, and the staff is incredibly patient and kind.",
          images: [],
          tags: [24, 16], // senior benefits, wheelchair accessible
        },
      ],
    },

    // Center 6: University Community College (24/7 hours as requested) - San Jose
    {
      name: "University Community College",
      address: "200 Campus Drive, San Jose",
      email: "university@example.com",
      zip_code: "95112",
      phone_number: "(408) 555-6000",
      image_url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f",
      description:
        "A community college offering a wide range of academic programs, continuing education courses, and community resources. Open 24/7 for student access.",
      latitude: 37.335, // San Jose (different area of Bay Area)
      longitude: -121.893,
      timezone: "America/Los_Angeles",
      hourPattern: "twentyFourSeven", // 24/7 hours as requested
      reviews: [
        {
          rating: 5,
          comment:
            "I love that this college is open 24/7! The education resources are excellent, and the SAT/ACT prep courses helped me get into my dream university. The free Wi-Fi is fast and reliable.",
          images: [
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
          ],
          tags: [21, 25, 20], // education resources, sat/act prep, free Wi-Fi
        },
        {
          rating: 4,
          comment:
            "Great career resources and education programs. Being open 24/7 is a huge plus for working adults like me who need flexible study hours.",
          images: [],
          tags: [21, 22], // education resources, career resources
        },
        {
          rating: 5,
          comment:
            "The SAT prep program here is outstanding. I also appreciate the career counseling services they offer.",
          images: [],
          tags: [25, 22], // sat/act prep, career resources
        },
        {
          rating: 4,
          comment:
            "As an adult learner, I've found the education resources here to be excellent. The 24/7 access and free Wi-Fi are perfect for my schedule.",
          images: [
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
          ],
          tags: [21, 14, 20], // education resources, 24/7, free Wi-Fi
        },
        {
          rating: 5,
          comment:
            "The career development workshops have been instrumental in my job search. Their education resources are comprehensive and up-to-date.",
          images: [],
          tags: [22, 21], // career resources, education resources
        },
        {
          rating: 4,
          comment:
            "I've been taking classes here for a semester. The quality of instruction is excellent, and I appreciate the 24/7 access to study spaces.",
          images: [],
          tags: [14], // 24/7
        },
      ],
    },
  ];

  // Helper function to create a date in the past
  const daysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  };

  // User IDs to assign reviews to
  const userIds = [6, 2, 10, 17, 18, 19];

  // Verify these users exist
  const existingUsers = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      id: true,
    },
  });

  const existingUserIds = existingUsers.map((user) => user.id);
  console.log(
    `Found ${existingUserIds.length} of ${userIds.length} specified users`
  );

  if (existingUserIds.length === 0) {
    console.error(
      "None of the specified users exist in the database. Please create users first or modify the userIds array."
    );
    return;
  }

  // Create each center and its associated hours and reviews with tags
  for (const centerData of centers) {
    const {
      name,
      address,
      email,
      zip_code,
      phone_number,
      image_url,
      description,
      latitude,
      longitude,
      timezone,
      hourPattern,
      reviews,
    } = centerData;

    // Skip if this center already exists
    let center = existingCentersByName[name];
    if (center) {
      console.log(`Center already exists: ${name} - skipping creation`);
    } else {
      // Create the community center
      center = await prisma.communityCenter.create({
        data: {
          name,
          address,
          email,
          zip_code,
          phone_number,
          image_url,
          description,
          latitude,
          longitude,
          timezone,
        },
      });
      // Create hours for the center based on the specified pattern
      const pattern = hourPatterns[hourPattern];
      const daysOfWeek = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];

      for (const day of daysOfWeek) {
        let hourData;

        if (day === "Saturday") {
          hourData = pattern.saturday;
        } else if (day === "Sunday") {
          hourData = pattern.sunday;
        } else {
          hourData = pattern.weekday;
        }

        await prisma.centerHours.create({
          data: {
            center_id: center.id,
            day,
            open_time: hourData.open_time,
            close_time: hourData.close_time,
            is_closed: hourData.is_closed,
          },
        });
      }
    }

    // Create reviews with tags for this center
    if (reviews && reviews.length > 0) {
      for (let i = 0; i < reviews.length; i++) {
        const reviewData = reviews[i];

        // Assign review to one of the specified users (rotating through them)
        const userId =
          existingUserIds[Math.floor(Math.random() * existingUserIds.length)];

        // Create the review
        const review = await prisma.review.create({
          data: {
            rating: reviewData.rating,
            comment: reviewData.comment,
            created_at: daysAgo(Math.floor(Math.random() * 30) + 1), // Random date within the last month
            user_id: userId,
            center_id: center.id,
          },
        });

        // Add images to the review if any
        if (reviewData.images && reviewData.images.length > 0) {
          for (const imageUrl of reviewData.images) {
            await prisma.reviewImage.create({
              data: {
                image_url: imageUrl,
                review_id: review.id,
              },
            });
          }
        }

        // Add tags to the review
        // This will automatically add the tags to the center through the review routes
        if (reviewData.tags && reviewData.tags.length > 0) {
          for (const tagId of reviewData.tags) {
            // Create reviewTag
            await prisma.reviewTag.create({
              data: {
                review_id: review.id,
                tag_id: tagId,
              },
            });

            // Create centerTag (this is what would happen in the review routes)
            await prisma.centerTag.upsert({
              where: {
                center_id_tag_id: {
                  center_id: center.id,
                  tag_id: tagId,
                },
              },
              update: {}, // No updates needed if it exists
              create: {
                center_id: center.id,
                tag_id: tagId,
              },
            });
          }
        }
      }
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
