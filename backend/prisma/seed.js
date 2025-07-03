const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // create predefined tags that users can choose from when writing reviews
  const tags = [
    { name: "Family Friendly" },
    { name: "Fast WiFi" },
    { name: "Open Late" },
    { name: "Early Hours" },
    { name: "Near Transportation" },
    { name: "24/7" },
    { name: "Quiet" },
    { name: "Safe" },
    { name: "Clean" },
    { name: " Wheelchair Accessible" },
    { name: "Printer Access" },
    { name: "Open Weekends" },
    { name: "Busy" }
  ];

  // create each tag using upsert to avoid duplicates
  for (const tagData of tags) {
    await prisma.tag.upsert({
      where: { name: tagData.name },
      update: {}, // don't update anything if it exists
      create: tagData, // create if it doesn't exist
    });
  }

  // Create 5 Community Centers with simple data
  const centers = [
    {
      name: "Downtown Digital Hub",
      address: "123 Main Street, San Francisco, CA 94102",
      email: "info@downtowndigitalhub.org",
      zip_code: "94102",
      phone_number: "(415) 555-0123",
      image_url:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500",
      description:
        "A modern community center offering free internet access, computer training, and digital literacy programs.",
      latitude: 37.7749,
      longitude: -122.4194,
    },
    {
      name: "Eastside Learning Center",
      address: "456 Oak Avenue, Oakland, CA 94601",
      email: "contact@eastsidelearning.org",
      zip_code: "94601",
      phone_number: "(510) 555-0456",
      image_url:
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=500",
      description:
        "Community-focused center providing job training, computer classes, and study spaces.",
      latitude: 37.8044,
      longitude: -122.2712,
    },
    {
      name: "Westside Tech Commons",
      address: "789 Pine Street, San Jose, CA 95110",
      email: "hello@westsidetech.org",
      zip_code: "95110",
      phone_number: "(408) 555-0789",
      image_url:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500",
      description:
        "Tech-focused community space with high-speed internet, 3D printing, and coding workshops.",
      latitude: 37.3382,
      longitude: -121.8863,
    },
    {
      name: "Northside Community Hub",
      address: "321 Elm Drive, Berkeley, CA 94704",
      email: "info@northsidehub.org",
      zip_code: "94704",
      phone_number: "(510) 555-0321",
      image_url:
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=500",
      description:
        "Friendly neighborhood center offering free WiFi, printing services, and community events.",
      latitude: 37.8715,
      longitude: -122.273,
    },
    {
      name: "Southside Innovation Lab",
      address: "654 Cedar Boulevard, Palo Alto, CA 94301",
      email: "contact@southsidelab.org",
      zip_code: "94301",
      phone_number: "(650) 555-0654",
      image_url:
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=500",
      description:
        "Innovation-focused space with maker tools, business mentoring, and entrepreneurship programs.",
      latitude: 37.4419,
      longitude: -122.143,
    },
  ];

  // Create each community center
  for (const centerData of centers) {
    const center = await prisma.communityCenter.create({
      data: centerData,
    });
  }
}

main()
  .catch((e) => {
    console.error(" Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
