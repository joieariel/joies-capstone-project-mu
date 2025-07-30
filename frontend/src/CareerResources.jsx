import "./CareerResources.css";
import ResourceCard from "./components/ResourceCard";

const CareerResources = () => {
  return (
    <div className="career-resources-container">
      <h1 className="career-resources-title">Career Resources</h1>

      {/* intro section */}
      <div className="resources-intro">
        <div className="intro-content">
          <div className="intro-text">
            <h3>Bridging the Digital Career Divide</h3>
            <p>
              Digital equity in career development means ensuring everyone has
              equal access to the digital tools, resources, and skills needed to
              thrive in today's increasingly digital job market. As careers
              become more technology-dependent, those without digital literacy
              or access to digital resources risk being left behind in the
              modern workforce.
            </p>
            <p>
              These carefully curated resources aim to bridge the digital career
              divide by providing free or low-cost digital career development
              materials, online job search tools, and guidance for building
              essential digital skills that employers now demand. Whether you're
              creating your first digital resume, preparing for virtual
              interviews, or seeking to enhance your digital professional
              presence, these resources can help you access quality career
              support regardless of your current digital literacy level,
              socioeconomic background, or geographic location.
            </p>
          </div>
          <div className="intro-image">
            <img
              src="https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80"
              alt="Digital divide in career development showing technology access gap"
            />
          </div>
        </div>
      </div>

      {/* Applying to jobs online */}
      <div className="resources-section">
        <h2 className="section-title">Professional Development</h2>
        <div className="resource-cards">
          {/* Using ResourceCard component for section 1 */}
          <ResourceCard
            title="Resume Building"
            description="Resources for creating effective digital resumes that pass commonly-used Applicant Tracking System (ATS) scanners."
            cardId="resume-building"
            expandedSections={[
              {
                title: "Resume Building Tips",
                links: [
                  {
                    text: "Resume Genius",
                    url: "https://resumegenius.com/resume-tips",
                  },
                  {
                    text: "Indeed Resume Guide",
                    url: "https://www.indeed.com/career-advice/resumes-cover-letters",
                  },
                  {
                    text: "Resume Templates",
                    url: "#",
                  },
                ],
              },
              {
                title: "Application Tracking Systems",
                links: [
                  {
                    text: "Jobscan ATS Guide",
                    url: "https://www.jobscan.co/blog/ats-resume-test/",
                  },
                  {
                    text: "ATS Resume Checker",
                    url: "#",
                  },
                  {
                    text: "ATS Optimization Tips",
                    url: "#",
                  },
                ],
              },
              {
                title: "Curriculum Vitae (CV) Building",
                links: [
                  {
                    text: "CV Templates & Examples",
                    url: "https://www.cvmaker.com/",
                  },
                  {
                    text: "Academic CV Guide",
                    url: "#",
                  },
                  {
                    text: "International CV Formats",
                    url: "#",
                  },
                ],
              },
            ]}
          />
          <ResourceCard
            title="Online Networking"
            description="Information about job search websites and ways to network effectively using free online platforms."
            cardId="job-search-platforms"
            expandedSections={[
              {
                title: "Job Search Platforms",
                links: [
                  {
                    text: "LinkedIn Jobs",
                    url: "https://www.linkedin.com/jobs/",
                  },
                  {
                    text: "Indeed",
                    url: "https://www.indeed.com/",
                  },
                  {
                    text: "Glassdoor",
                    url: "#",
                  },
                ],
              },
              {
                title: "Networking Platforms",
                links: [
                  {
                    text: "LinkedIn Networking Guide",
                    url: "https://www.linkedin.com/help/linkedin/answer/a566166",
                  },
                  {
                    text: "Slack Communities",
                    url: "#",
                  },
                  {
                    text: "Professional Discord Servers",
                    url: "#",
                  },
                ],
              },
              {
                title: "Brand Building",
                links: [
                  {
                    text: "Personal Website Templates",
                    url: "https://www.wix.com/templates/cv-resume",
                  },
                  {
                    text: "Social Media Presence Guide",
                    url: "#",
                  },
                  {
                    text: "Portfolio Development",
                    url: "#",
                  },
                ],
              },
            ]}
          />
          <ResourceCard
            title="Interview Preparation"
            description="Resources for preparing for virtual interviews and online assessments."
            cardId="interview-preparation"
            expandedSections={[
              {
                title: "Behavioral Online Interviewing",
                links: [
                  {
                    text: "Big Interview Practice Tool",
                    url: "https://biginterview.com/",
                  },
                  {
                    text: "STAR Method Guide",
                    url: "https://www.themuse.com/advice/star-interview-method",
                  },
                  {
                    text: "Common Interview Questions",
                    url: "#",
                  },
                ],
              },
              {
                title: "Technical Online Interviewing",
                links: [
                  {
                    text: "LeetCode Interview Prep",
                    url: "https://leetcode.com/explore/interview/",
                  },
                  {
                    text: "HackerRank Interview Kit",
                    url: "#",
                  },
                  {
                    text: "System Design Resources",
                    url: "#",
                  },
                ],
              },
              {
                title: "Online Assessment (OA) Tips",
                links: [
                  {
                    text: "Pramp Mock Interviews",
                    url: "https://www.pramp.com/",
                  },
                  {
                    text: "Virtual Interview Setup Guide",
                    url: "#",
                  },
                  {
                    text: "Technical Assessment Strategies",
                    url: "#",
                  },
                ],
              },
            ]}
          />
        </div>
      </div>

      {/* skill development section */}
      <div className="resources-section">
        <h2 className="section-title">Skill Development</h2>
        <div className="resource-cards">
          {/* now using ResourceCard component for section 2 */}
          <ResourceCard
            title="Online Learning"
            description="Resources for advancing your career through free and low-cost online education."
            cardId="online-learning"
            expandedSections={[
              {
                title: "Online Training Courses",
                links: [
                  {
                    text: "Coursera Free Courses",
                    url: "https://www.coursera.org/courses?query=free",
                  },
                  {
                    text: "edX Free Courses",
                    url: "https://www.edx.org/search?q=free",
                  },
                  {
                    text: "Khan Academy",
                    url: "#",
                  },
                ],
              },
              {
                title: "Skill Development",
                links: [
                  {
                    text: "freeCodeCamp",
                    url: "https://www.freecodecamp.org/",
                  },
                  {
                    text: "Digital Skills Library",
                    url: "#",
                  },
                  {
                    text: "Professional Development Resources",
                    url: "#",
                  },
                ],
              },
              {
                title: "Learning Platforms",
                links: [
                  {
                    text: "MIT OpenCourseWare",
                    url: "https://ocw.mit.edu/",
                  },
                  {
                    text: "YouTube Learning Channels",
                    url: "#",
                  },
                  {
                    text: "Industry Webinars",
                    url: "#",
                  },
                ],
              },
            ]}
          />
          <ResourceCard
            title="Certifications"
            description="Information about free and affordable professional certifications to enhance your resume."
            cardId="certifications"
            expandedSections={[
              {
                title: "Free Certifications",
                links: [
                  {
                    text: "Google Digital Skills",
                    url: "https://learndigital.withgoogle.com/digitalgarage/courses",
                  },
                  {
                    text: "Microsoft Learn",
                    url: "https://learn.microsoft.com/en-us/training/",
                  },
                  {
                    text: "HubSpot Academy",
                    url: "#",
                  },
                ],
              },
              {
                title: "Industry Certifications",
                links: [
                  {
                    text: "CompTIA Certification Guide",
                    url: "https://www.comptia.org/certifications",
                  },
                  {
                    text: "Project Management Certifications",
                    url: "#",
                  },
                  {
                    text: "Healthcare Certifications",
                    url: "#",
                  },
                ],
              },
              {
                title: "Certification Preparation",
                links: [
                  {
                    text: "Free Practice Exams",
                    url: "https://www.examtopics.com/",
                  },
                  {
                    text: "Study Group Resources",
                    url: "#",
                  },
                  {
                    text: "Certification Vouchers",
                    url: "#",
                  },
                ],
              },
            ]}
          />
          <ResourceCard
            title="Bootcamps"
            description="Resources for finding affordable coding and career bootcamps with flexible payment options."
            cardId="bootcamps"
            expandedSections={[
              {
                title: "In-Person Bootcamps",
                links: [
                  {
                    text: "Bootcamp Finder",
                    url: "https://www.coursereport.com/",
                  },
                  {
                    text: "Income Share Agreement Programs",
                    url: "#",
                  },
                  {
                    text: "Scholarship Opportunities",
                    url: "#",
                  },
                ],
              },
              {
                title: "Online Bootcamps",
                links: [
                  {
                    text: "Free Code Camp",
                    url: "https://www.freecodecamp.org/",
                  },
                  {
                    text: "The Odin Project",
                    url: "https://www.theodinproject.com/",
                  },
                  {
                    text: "Self-Paced Learning Paths",
                    url: "#",
                  },
                ],
              },
              {
                title: "Hybrid Bootcamps",
                links: [
                  {
                    text: "Bootcamp Comparison Tool",
                    url: "https://www.switchup.org/",
                  },
                  {
                    text: "Part-Time Program Options",
                    url: "#",
                  },
                  {
                    text: "Evening & Weekend Courses",
                    url: "#",
                  },
                ],
              },
            ]}
          />
        </div>
      </div>

      {/* digital literacry section*/}
      <div className="resources-section">
        <h2 className="section-title">Digital Literacy</h2>
        <div className="resource-cards">
          <ResourceCard
            title="Responsible Use of AI"
            description="Resources for understanding and ethically using AI tools in the workplace."
            cardId="ai-ethics-career"
            expandedSections={[
              {
                title: "AI in the Workplace",
                links: [
                  {
                    text: "AI Ethics Guidelines",
                    url: "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics",
                  },
                  {
                    text: "AI Tools for Career Development",
                    url: "https://www.coursera.org/articles/ai-tools",
                  },
                  {
                    text: "Responsible AI Practices",
                    url: "#",
                  },
                ],
              },
              {
                title: "AI Skills Development",
                links: [
                  {
                    text: "Google AI Education",
                    url: "https://ai.google/education/",
                  },
                  {
                    text: "AI Prompt Engineering Guide",
                    url: "#",
                  },
                  {
                    text: "AI Tool Comparison",
                    url: "#",
                  },
                ],
              },
              {
                title: "AI Ethics Resources",
                links: [
                  {
                    text: "MIT AI Ethics Course",
                    url: "https://www.edx.org/learn/artificial-intelligence/massachusetts-institute-of-technology-artificial-intelligence-ethics",
                  },
                  {
                    text: "AI Bias Detection",
                    url: "#",
                  },
                  {
                    text: "AI Privacy Considerations",
                    url: "#",
                  },
                ],
              },
            ]}
          />
          <ResourceCard
            title="Digital Safety"
            description="Information about protecting your digital identity and maintaining cybersecurity in professional settings."
            cardId="digital-safety-career"
            expandedSections={[
              {
                title: "Online Privacy",
                links: [
                  {
                    text: "EFF Privacy Guide",
                    url: "https://ssd.eff.org/",
                  },
                  {
                    text: "Password Security Best Practices",
                    url: "https://www.nist.gov/blogs/cybersecurity-insights/back-basics-multi-factor-authentication",
                  },
                  {
                    text: "Data Protection Tips",
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
                    text: "Phishing Prevention Guide",
                    url: "#",
                  },
                  {
                    text: "Public WiFi Safety",
                    url: "#",
                  },
                ],
              },
              {
                title: "Digital Footprint Management",
                links: [
                  {
                    text: "Online Reputation Management",
                    url: "https://www.consumer.ftc.gov/articles/0033-online-reputation",
                  },
                  {
                    text: "Social Media Privacy Settings",
                    url: "#",
                  },
                  {
                    text: "Digital Identity Protection",
                    url: "#",
                  },
                ],
              },
            ]}
          />
          <ResourceCard
            title="Information Literacy"
            description="The ability to critically evaluate online content for accuracy, bias, and credibility."
            cardId="info-literacy-career"
            expandedSections={[
              {
                title: "Fact Checking Resources",
                links: [
                  {
                    text: "Media Literacy Council",
                    url: "https://www.medialiteracycouncil.sg/",
                  },
                  {
                    text: "Fact Check Tools",
                    url: "https://toolbox.google.com/factcheck/explorer",
                  },
                  {
                    text: "Source Evaluation Guide",
                    url: "#",
                  },
                ],
              },
              {
                title: "Research Skills",
                links: [
                  {
                    text: "Library of Congress Digital Literacy",
                    url: "https://www.loc.gov/programs/teachers/classroom-materials/",
                  },
                  {
                    text: "Academic Search Strategies",
                    url: "#",
                  },
                  {
                    text: "Information Verification Methods",
                    url: "#",
                  },
                ],
              },
              {
                title: "Digital Media Literacy",
                links: [
                  {
                    text: "Common Sense Media",
                    url: "https://www.commonsensemedia.org/",
                  },
                  {
                    text: "Misinformation Detection",
                    url: "#",
                  },
                  {
                    text: "Critical Thinking Framework",
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

export default CareerResources;
