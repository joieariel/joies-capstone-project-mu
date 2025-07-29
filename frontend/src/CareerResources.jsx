import "./CareerResources.css";

const CareerResources = () => {
    return (
        <div className="career-resources-container">
            <h1 className="career-resources-title">Career Resources</h1>

            {/* section1  */}
            <div className="resources-section">
                <h2 className="section-title">Section 1</h2>
                <div className="resource-cards">
                    {/* placeholder cards for section 1*/}
                    <div className="resource-card">
                        <h3>Resume Building</h3>
                        <p>Resources for creating effective digitial resumes will be displayed here.</p>
                    </div>
                    <div className="resource-card">
                        <h3>Job Search Platforms</h3>
                        <p>Information about job search websites will be displayed here.</p>
                    </div>
                    <div className="resource-card">
                        <h3>Interview Preparation</h3>
                        <p>Resources for preparing for virtual interviews will be displayed here.</p>
                    </div>
                </div>
            </div>

            {/* section 2 */}
            <div className="resources-section">
                <h2 className="section-title">Section 2</h2>
                <div className="resource-cards">
                    {/* placeholder cards for section 2*/}
                    <div className="resource-card">
                        <h3>Career Advancement</h3>
                        <p>Resources for advancing your career to the next level will be displayed here.</p>
                    </div>
                    <div className="resource-card">
                        <h3>Networking Opportunities</h3>
                        <p>Information about professional networking events and platforms will be displayed here.</p>
                    </div>
                    <div className="resource-card">
                        <h3>Skill Development</h3>
                        <p>Resources for developing new skills relevant to your career path will be displayed here.</p>
                    </div>
                </div>
            </div>

            {/* section 3 */}
            <div className="resources-section">
                <h2 className="section-title">Section 3</h2>
                <div className="resource-cards">
                    {/* Placeholder cards for Senior Level resources */}
                    <div className="resource-card">
                        <h3>Leadership Development</h3>
                        <p>Resources for developing leadership skills will be displayed here.</p>
                    </div>
                    <div className="resource-card">
                        <h3>Placeholder</h3>
                        <p>Information about coaching and mentorship will be displayed here.</p>
                    </div>
                    <div className="resource-card">
                        <h3>Another Placeholder</h3>
                        <p>Resources for will be displayed here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerResources;
