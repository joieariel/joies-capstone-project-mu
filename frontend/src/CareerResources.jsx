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
              Digital equity in career development means ensuring everyone has equal access to the
              digital tools, resources, and skills needed to thrive in today's increasingly digital job market.
              As careers become more technology-dependent, those without digital literacy or access
              to digital resources risk being left behind in the modern workforce.
            </p>
            <p>
              These carefully curated resources aim to bridge the digital career divide by providing free or low-cost
              digital career development materials, online job search tools, and guidance for building essential
              digital skills that employers now demand. Whether you're creating your first digital resume,
              preparing for virtual interviews, or seeking to enhance your digital professional presence,
              these resources can help you access quality career support regardless of your current digital literacy
              level, socioeconomic background, or geographic location.
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

      {/* section1  */}
      <div className="resources-section">
        <h2 className="section-title">Section 1</h2>
        <div className="resource-cards">
          {/* Using ResourceCard component for section 1 */}
          <ResourceCard
            title="Resume Building"
            description="Resources for creating effective digitial resumes will be displayed here."
          />
          <ResourceCard
            title="Job Search Platforms"
            description="Information about job search websites will be displayed here."
          />
          <ResourceCard
            title="Interview Preparation"
            description="Resources for preparing for virtual interviews will be displayed here."
          />
        </div>
      </div>

      {/* section 2 */}
      <div className="resources-section">
        <h2 className="section-title">Section 2</h2>
        <div className="resource-cards">
          {/* now using ResourceCard component for section 2 */}
          <ResourceCard
            title="Career Advancement"
            description="Resources for advancing your career to the next level will be displayed here."
          />
          <ResourceCard
            title="Networking Opportunities"
            description="Information about professional networking events and platforms will be displayed here."
          />
          <ResourceCard
            title="Skill Development"
            description="Resources for developing new skills relevant to your career path will be displayed here."
          />
        </div>
      </div>

      {/* section 3 */}
      <div className="resources-section">
        <h2 className="section-title">Section 3</h2>
        <div className="resource-cards">
          {/* now using ResourceCard component for section 3 */}
          <ResourceCard
            title="Leadership Development"
            description="Resources for developing leadership skills will be displayed here."
          />
          <ResourceCard
            title="Placeholder"
            description="Information about coaching and mentorship will be displayed here."
          />
          <ResourceCard
            title="Another Placeholder"
            description="Resources for will be displayed here."
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
          />
          <ResourceCard
            title="Digital Safety"
            description="Information about protecting your digital identity and maintaining cybersecurity in professional settings."
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

export default CareerResources;
