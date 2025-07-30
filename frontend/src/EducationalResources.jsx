import "./EducationalResources.css";

const EducationalResources = () => {
    return (
        <div className="educational-resources-container">
            <h1 className="educational-resources-title">Educational Resources</h1>

            {/* k-12 section */}
            <div className="resources-section">
                <h2 className="section-title">K-12 Resources</h2>
                <div className="resource-cards">
                    {/* placeholder cards for K-12 resources */}
                    <div className="resource-card">
                        <h3>SAT/ACT Preparation</h3>
                        <p>Resources for standardized test preparation will be displayed here.</p>
                    </div>
                    <div className="resource-card">
                        <h3>Digital Literacy</h3>
                        <p>Resources for digital literacy and responsible technology use will be displayed here.</p>
                    </div>
                    <div className="resource-card">
                        <h3>K-12 Learning Tools</h3>
                        <p>Educational tools and resources for K-12 students will be displayed here.</p>
                    </div>
                </div>
            </div>

            {/* college section */}
            <div className="resources-section">
                <h2 className="section-title">College Resources</h2>
                <div className="resource-cards">
                    {/* placeholder cards for college resources */}
                    <div className="resource-card">
                        <h3>Internship Hub</h3>
                        <p>Resources for finding internships will be displayed here.</p>
                    </div>
                    <div className="resource-card">
                        <h3>Scholarship Resources</h3>
                        <p>Information about scholarships and financial aid will be displayed here.</p>
                    </div>
                    <div className="resource-card">
                        <h3>College Study Resources</h3>
                        <p>Study tools and academic resources for college students will be displayed here.</p>
                    </div>
                </div>
            </div>

            {/* continuing education section */}
            <div className="resources-section">
                <h2 className="section-title">Continuing Education Resources</h2>
                <div className="resource-cards">
                    {/* placeholder cards for continuing education resources */}
                    <div className="resource-card">
                        <h3>Professional Development</h3>
                        <p>Resources for professional development and career advancement will be displayed here.</p>
                    </div>
                    <div className="resource-card">
                        <h3>Online Learning Platforms</h3>
                        <p>Information about online courses and learning platforms will be displayed here.</p>
                    </div>
                    <div className="resource-card">
                        <h3>Certification Programs</h3>
                        <p>Resources for professional certifications and specialized training will be displayed here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EducationalResources;
