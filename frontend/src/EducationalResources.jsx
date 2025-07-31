import { useState, useEffect } from "react";
import "./EducationalResources.css";
import ResourceCard from "./components/ResourceCard";
import LoadingSpinner from "./LoadingSpinner";

const EducationalResources = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // set loading to false after resources are ready
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="educational-resources-container">
        <h1 className="educational-resources-title">Educational Resources</h1>
        <LoadingSpinner size="large" text="Loading educational resources..." />
      </div>
    );
  }
  // SAT/ACT prep card data
  const satActData = {
    title: "SAT/ACT Preparation",
    description:
      "Free and low-cost resources for standardized test preparation to help students achieve their best scores without breaking the bank.",
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

  // K-12 learning tools card data
  const tutoringData = {
    title: "K-12 Learning Tools",
    description:
      "Access quality educational support with these affordable and free online learning platforms and resources.",
    cardId: "k12-learning",
    expandedSections: [
      {
        title: "Free Learning Platforms",
        links: [
          {
            text: "Khan Academy",
            url: "https://www.khanacademy.org/",
          },
          {
            text: "YouTube EDU",
            url: "#",
          },
          {
            text: "CK-12 Foundation",
            url: "https://www.ck12.org/",
          },
        ],
      },
      {
        title: "Interactive Learning Tools",
        links: [
          {
            text: "IXL Learning",
            url: "https://www.ixl.com/",
          },
          {
            text: "Quizlet",
            url: "#",
          },
          {
            text: "Duolingo (Languages)",
            url: "#",
          },
        ],
      },
      {
        title: "Tutoring Services",
        links: [
          {
            text: "Learn To Be (Free Tutoring)",
            url: "https://www.learntobe.org/",
          },
          {
            text: "Schoolhouse.world",
            url: "#",
          },
          {
            text: "Public Library Online Tutoring Programs",
            url: "#",
          },
        ],
      },
    ],
  };

  return (
    <div className="educational-resources-container">
      <h1 className="educational-resources-title">Educational Resources</h1>
      {/* intro section */}
      <div className="resources-intro">
        <div className="intro-content">
          <div className="intro-text">
            <h3>Bridging the Digital Divide</h3>
            <p>
              Digital equity means ensuring everyone has equal access to the
              educational tools, information, and opportunities needed to thrive
              in today's digital world. These carefully curated resources aim to
              bridge the digital divide by providing free or low-cost
              educational materials, tools, and guidance for students of all
              ages.
            </p>
            <p>
              Whether you're looking for K-12 learning support, college
              preparation assistance, or ways to improve your digital literacy
              skills, these resources can help you access quality education
              regardless of your socioeconomic background or geographic
              location.
            </p>
          </div>
          <div className="intro-image">
            <img
              src="https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80"
              alt="Students using digital technology for education"
            />
          </div>
        </div>
      </div>

      {/* k-12 section */}
      <div className="resources-section">
        <h2 className="section-title">K-12 Resources</h2>
        <div className="resource-cards">
          {/* now using the new ResourceCard component for SAT/ACT prep */}
          <ResourceCard {...satActData} />

          {/* using the ResourceCard component for digital tutoring */}
          <ResourceCard {...tutoringData} />

          <ResourceCard
            title="Educational Games & Activities"
            description="Interactive games and activities designed to make learning fun and engaging for K-12 students."
            cardId="educational-games"
            expandedSections={[
              {
                title: "Math Games",
                links: [
                  {
                    text: "Prodigy Math Game",
                    url: "https://www.prodigygame.com/",
                  },
                  {
                    text: "Math Playground",
                    url: "#",
                  },
                  {
                    text: "Coolmath Games",
                    url: "#",
                  },
                ],
              },
              {
                title: "Science Activities",
                links: [
                  {
                    text: "NASA Kids' Club",
                    url: "https://www.nasa.gov/kidsclub/index.html",
                  },
                  {
                    text: "National Geographic Kids",
                    url: "#",
                  },
                  {
                    text: "Science Buddies",
                    url: "#",
                  },
                ],
              },
              {
                title: "Reading & Language Arts",
                links: [
                  {
                    text: "Storyline Online",
                    url: "#",
                  },
                  {
                    text: "ReadWorks",
                    url: "#",
                  },
                  {
                    text: "PBS Kids Reading Games",
                    url: "#",
                  },
                ],
              },
            ]}
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
            description="Resources for finding internships and gaining valuable work experience during college."
            cardId="internship-hub"
            expandedSections={[
              {
                title: "Internship Search Platforms",
                links: [
                  {
                    text: "Handshake",
                    url: "https://www.joinhandshake.com/",
                  },
                  {
                    text: "LinkedIn Internships",
                    url: "#",
                  },
                  {
                    text: "Indeed Internships",
                    url: "#",
                  },
                ],
              },
              {
                title: "Government & Non-Profit Opportunities",
                links: [
                  {
                    text: "USA Jobs - Students & Graduates",
                    url: "https://www.usajobs.gov/Help/working-in-government/unique-hiring-paths/students/",
                  },
                  {
                    text: "Idealist.org",
                    url: "#",
                  },
                  {
                    text: "AmeriCorps",
                    url: "#",
                  },
                ],
              },
              {
                title: "Internship Preparation",
                links: [
                  {
                    text: "Resume Templates",
                    url: "#",
                  },
                  {
                    text: "Interview Preparation",
                    url: "#",
                  },
                  {
                    text: "Networking Tips",
                    url: "#",
                  },
                ],
              },
            ]}
          />
          <ResourceCard
            title="Scholarship Resources"
            description="Find scholarships, grants, and financial aid opportunities to help fund your education."
            cardId="scholarship-resources"
            expandedSections={[
              {
                title: "Scholarship Search Engines",
                links: [
                  {
                    text: "FastWeb",
                    url: "https://www.fastweb.com/",
                  },
                  {
                    text: "Scholarships.com",
                    url: "#",
                  },
                  {
                    text: "College Board Scholarship Search",
                    url: "#",
                  },
                ],
              },
              {
                title: "Federal Financial Aid",
                links: [
                  {
                    text: "FAFSA (Free Application for Federal Student Aid)",
                    url: "https://studentaid.gov/h/apply-for-aid/fafsa",
                  },
                  {
                    text: "Federal Student Aid Information",
                    url: "#",
                  },
                  {
                    text: "Work-Study Programs",
                    url: "#",
                  },
                ],
              },
              {
                title: "Specialized Scholarships",
                links: [
                  {
                    text: "Minority Scholarships",
                    url: "#",
                  },
                  {
                    text: "First-Generation Student Resources",
                    url: "#",
                  },
                  {
                    text: "Merit-Based Scholarship Opportunities",
                    url: "#",
                  },
                ],
              },
            ]}
          />
          <ResourceCard
            title="College Study Resources"
            description="Study tools and academic resources to help college students succeed in their coursework."
            cardId="college-study"
            expandedSections={[
              {
                title: "Online Learning Platforms",
                links: [
                  {
                    text: "Coursera",
                    url: "https://www.coursera.org/",
                  },
                  {
                    text: "edX",
                    url: "#",
                  },
                  {
                    text: "MIT OpenCourseWare",
                    url: "#",
                  },
                ],
              },
              {
                title: "Research Tools",
                links: [
                  {
                    text: "Google Scholar",
                    url: "https://scholar.google.com/",
                  },
                  {
                    text: "JSTOR",
                    url: "#",
                  },
                  {
                    text: "Library of Congress Digital Collections",
                    url: "#",
                  },
                ],
              },
              {
                title: "Study Aids",
                links: [
                  {
                    text: "Anki (Flashcards)",
                    url: "#",
                  },
                  {
                    text: "Notion (Note-taking)",
                    url: "#",
                  },
                  {
                    text: "Zotero (Citation Management)",
                    url: "#",
                  },
                ],
              },
            ]}
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
            cardId="ai-ethics"
            expandedSections={[
              {
                title: "AI Ethics Guidelines",
                links: [
                  {
                    text: "UNESCO AI Ethics",
                    url: "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics",
                  },
                  {
                    text: "AI Ethics for Students",
                    url: "#",
                  },
                  {
                    text: "Responsible AI Principles",
                    url: "#",
                  },
                ],
              },
              {
                title: "Educational AI Tools",
                links: [
                  {
                    text: "AI Writing Assistants for Students",
                    url: "#",
                  },
                  {
                    text: "AI Research Tools",
                    url: "#",
                  },
                  {
                    text: "AI Learning Platforms",
                    url: "#",
                  },
                ],
              },
              {
                title: "AI Literacy Resources",
                links: [
                  {
                    text: "Understanding AI Basics",
                    url: "#",
                  },
                  {
                    text: "Spotting AI-Generated Content",
                    url: "#",
                  },
                  {
                    text: "AI in Education: Best Practices",
                    url: "#",
                  },
                ],
              },
            ]}
          />
          <ResourceCard
            title="Digital Safety"
            description="Information about online safety, privacy protection, and recognizing digital threats."
            cardId="digital-safety"
            expandedSections={[
              {
                title: "Online Privacy",
                links: [
                  {
                    text: "Electronic Frontier Foundation Privacy Resources",
                    url: "https://www.eff.org/issues/privacy",
                  },
                  {
                    text: "Privacy Tools Guide",
                    url: "#",
                  },
                  {
                    text: "Data Protection for Students",
                    url: "#",
                  },
                ],
              },
              {
                title: "Cybersecurity Basics",
                links: [
                  {
                    text: "CISA Cybersecurity Resources",
                    url: "https://www.cisa.gov/cybersecurity",
                  },
                  {
                    text: "Password Security Best Practices",
                    url: "#",
                  },
                  {
                    text: "Recognizing Phishing Attempts",
                    url: "#",
                  },
                ],
              },
              {
                title: "Digital Wellbeing",
                links: [
                  {
                    text: "Screen Time Management",
                    url: "#",
                  },
                  {
                    text: "Social Media Safety",
                    url: "#",
                  },
                  {
                    text: "Online Harassment Resources",
                    url: "#",
                  },
                ],
              },
            ]}
          />
          <ResourceCard
            title="Information Literacy"
            description="The ability to critically evaluate online content for accuracy, bias, and credibility."
            cardId="info-literacy"
            expandedSections={[
              {
                title: "Fact-Checking Resources",
                links: [
                  {
                    text: "Media Literacy Council",
                    url: "https://www.medialiteracycouncil.sg/",
                  },
                  {
                    text: "Snopes Fact-Checking",
                    url: "#",
                  },
                  {
                    text: "FactCheck.org",
                    url: "#",
                  },
                ],
              },
              {
                title: "Critical Thinking Skills",
                links: [
                  {
                    text: "Evaluating Online Sources",
                    url: "https://owl.purdue.edu/owl/research_and_citation/conducting_research/evaluating_sources_of_information/index.html",
                  },
                  {
                    text: "Identifying Bias in Media",
                    url: "#",
                  },
                  {
                    text: "Understanding Misinformation",
                    url: "#",
                  },
                ],
              },
              {
                title: "Research Guides",
                links: [
                  {
                    text: "Academic Research Methods",
                    url: "#",
                  },
                  {
                    text: "Citation Guides",
                    url: "#",
                  },
                  {
                    text: "Digital Research Tools",
                    url: "#",
                  },
                ],
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default EducationalResources;
