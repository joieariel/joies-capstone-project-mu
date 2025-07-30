import "./EducationalResources.css";
import ResourceCard from "./components/ResourceCard";

const EducationalResources = () => {
  // SAT/ACT prep card data
  const satActData = {
    title: "SAT/ACT Preparation",
    description:
      "Resources for standardized test preparation to help students achieve their best scores.",
    cardId: "sat-act",
    expandedSections: [
      {
        title: "Free Practice Tests",
        links: [
          {
            text: "College Board Official SAT Practice",
            url: "https://satsuite.collegeboard.org/practice",
          },
          {
            text: "ACT Academy Free Test Prep",
            url: "#",
          },
          {
            text: "Khan Academy SAT Partnership",
            url: "#",
          },
        ],
      },
      {
        title: "Study Materials",
        links: [
          {
            text: "Princeton Review Prep Books",
            url: "#",
          },
          {
            text: "Barron's Test Prep Guides",
            url: "#",
          },
          {
            text: "Kaplan Online Courses",
            url: "#",
          },
        ],
      },
      {
        title: "Tutoring Services",
        links: [
          {
            text: "Local Community Center Test Prep Programs",
            url: "#",
          },
          {
            text: "Online Tutoring Platforms",
            url: "#",
          },
          {
            text: "School-Based Preparation Workshops",
            url: "#",
          },
        ],
      },
    ],
  };
  return (
    <div className="educational-resources-container">
      <h1 className="educational-resources-title">Educational Resources</h1>

      {/* k-12 section */}
      <div className="resources-section">
        <h2 className="section-title">K-12 Resources</h2>
        <div className="resource-cards">
          {/* now using the new ResourceCard component for SAT/ACT prep */}
          <ResourceCard {...satActData} />

          {/* regular cards using ResourceCard component */}
          <ResourceCard
            title="Digital Literacy"
            description="Resources for digital literacy and responsible technology use will be displayed here."
          />
          <ResourceCard
            title="K-12 Learning Tools"
            description="Educational tools and resources for K-12 students will be displayed here."
          />
        </div>
      </div>

      {/* college section */}
      <div className="resources-section">
        <h2 className="section-title">College Resources</h2>
        <div className="resource-cards">
          {/* now using ResourceCard component for college resources */}
          <ResourceCard
            title="Internship Hub"
            description="Resources for finding internships will be displayed here."
          />
          <ResourceCard
            title="Scholarship Resources"
            description="Information about scholarships and financial aid will be displayed here."
          />
          <ResourceCard
            title="College Study Resources"
            description="Study tools and academic resources for college students will be displayed here."
          />
        </div>
      </div>

      {/* continuing education section */}
      <div className="resources-section">
        <h2 className="section-title">Continuing Education Resources</h2>
        <div className="resource-cards">
          {/* now using ResourceCard component for continuing education resources */}
          <ResourceCard
            title="Professional Development"
            description="Resources for professional development and career advancement will be displayed here."
          />
          <ResourceCard
            title="Online Learning Platforms"
            description="Information about online courses and learning platforms will be displayed here."
          />
          <ResourceCard
            title="Certification Programs"
            description="Resources for professional certifications and specialized training will be displayed here."
          />
        </div>
      </div>

      {/* digital literacy section */}
      <div className="resources-section">
        <h2 className="section-title">Digital Literacy</h2>
        <div className="resource-cards">
          <ResourceCard
            title="Responsible Use of AI"
            description="Resources for understanding and ethically using AI tools in educational settings."
          />
          <ResourceCard
            title="Digital Safety"
            description="Information about online safety, privacy protection, and recognizing digital threats."
          />
          <ResourceCard
            title="Information Literacy"
            description="The ability to critically evaluate online content for accuracy, bias, and credibility."
          />
        </div>
      </div>
    </div>
  );
};

export default EducationalResources;
