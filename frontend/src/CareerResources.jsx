import "./CareerResources.css";
import ResourceCard from "./components/ResourceCard";

const CareerResources = () => {
  return (
    <div className="career-resources-container">
      <h1 className="career-resources-title">Career Resources</h1>

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
