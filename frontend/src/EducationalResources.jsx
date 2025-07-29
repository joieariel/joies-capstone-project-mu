import { useState } from "react";
import "./EducationalResources.css";

const EducationalResources = () => {
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleCard = (cardId) => {
    if (expandedCard === cardId) {
      setExpandedCard(null);
    } else {
      setExpandedCard(cardId);
    }
  };
  return (
    <div className="educational-resources-container">
      <h1 className="educational-resources-title">Educational Resources</h1>

      {/* k-12 section */}
      <div className="resources-section">
        <h2 className="section-title">K-12 Resources</h2>
        <div className="resource-cards">
          {/* placeholder cards for K-12 resources */}
          <div
            className={`resource-card clickable ${
              expandedCard === "sat-act" ? "expanded" : ""
            }`}
            onClick={() => toggleCard("sat-act")}
          >
            <div className="card-header">
              <h3>SAT/ACT Preparation</h3>
              <span className="click-indicator">
                {expandedCard === "sat-act" ? "▼" : "▶"}
              </span>
            </div>
            <p>
              Resources for standardized test preparation to help students
              achieve their best scores.
            </p>
            <div className="click-note">
              Click to {expandedCard === "sat-act" ? "collapse" : "expand"}
            </div>
            {expandedCard === "sat-act" && (
              <div className="expanded-content">
                <hr />
                <h4>Free Practice Tests</h4>
                <ul>
                  <li>
                    <a
                      href="https://satsuite.collegeboard.org/practice"
                      className="resource-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      College Board Official SAT Practice
                    </a>
                  </li>
                  <li>
                    <a href="#" className="resource-link">
                      ACT Academy Free Test Prep
                    </a>
                  </li>
                  <li>
                    <a href="#" className="resource-link">
                      Khan Academy SAT Partnership
                    </a>
                  </li>
                </ul>

                <h4>Study Materials</h4>
                <ul>
                  <li>
                    <a href="#" className="resource-link">
                      Princeton Review Prep Books
                    </a>
                  </li>
                  <li>
                    <a href="#" className="resource-link">
                      Barron's Test Prep Guides
                    </a>
                  </li>
                  <li>
                    <a href="#" className="resource-link">
                      Kaplan Online Courses
                    </a>
                  </li>
                </ul>

                <h4>Tutoring Services</h4>
                <ul>
                  <li>
                    <a href="#" className="resource-link">
                      Local Community Center Test Prep Programs
                    </a>
                  </li>
                  <li>
                    <a href="#" className="resource-link">
                      Online Tutoring Platforms
                    </a>
                  </li>
                  <li>
                    <a href="#" className="resource-link">
                      School-Based Preparation Workshops
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
          <div className="resource-card">
            <h3>Digital Literacy</h3>
            <p>
              Resources for digital literacy and responsible technology use will
              be displayed here.
            </p>
          </div>
          <div className="resource-card">
            <h3>K-12 Learning Tools</h3>
            <p>
              Educational tools and resources for K-12 students will be
              displayed here.
            </p>
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
            <p>
              Information about scholarships and financial aid will be displayed
              here.
            </p>
          </div>
          <div className="resource-card">
            <h3>College Study Resources</h3>
            <p>
              Study tools and academic resources for college students will be
              displayed here.
            </p>
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
            <p>
              Resources for professional development and career advancement will
              be displayed here.
            </p>
          </div>
          <div className="resource-card">
            <h3>Online Learning Platforms</h3>
            <p>
              Information about online courses and learning platforms will be
              displayed here.
            </p>
          </div>
          <div className="resource-card">
            <h3>Certification Programs</h3>
            <p>
              Resources for professional certifications and specialized training
              will be displayed here.
            </p>
          </div>
        </div>
      </div>

      {/* digital literacy section */}
      <div className="resources-section">
        <h2 className="section-title">Digital Literacy</h2>
        <div className="resource-cards">
          <div className="resource-card">
            <h3>Responsible Use of AI</h3>
            <p>
              Resources for understanding and ethically using AI tools in
              educational settings.
            </p>
          </div>
          <div className="resource-card">
            <h3>Digital Safety</h3>
            <p>
              Information about online safety, privacy protection, and
              recognizing digital threats.
            </p>
          </div>
          <div className="resource-card">
            <h3>Information Literacy</h3>
            <p>
              The ability to critically evaluate online content for accuracy,
              bias, and credibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationalResources;
