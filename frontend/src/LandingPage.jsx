import React from "react";
import Banner from "./Banner";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Banner />

      {/* app features section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="features-title">🌟 App Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📶</div>
              <h3 className="feature-title">WiFi Finder</h3>
              <p className="feature-description">
                Discover free/low-cost WiFi locations near you
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👨‍🎓</div>
              <h3 className="feature-title">Students</h3>
              <p className="feature-description">Find educational tools</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3 className="feature-title">Job Seekers</h3>
              <p className="feature-description">Prep for your future</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">❤️</div>
              <h3 className="feature-title">Community Members</h3>
              <p className="feature-description">Give or volunteer</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3 className="feature-title">Reviews & Ratings</h3>
              <p className="feature-description">
                Read and share honest reviews of WiFi locations
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3 className="feature-title">Interactive Map</h3>
              <p className="feature-description">
                View WiFi centers on an interactive map with real-time
                availability
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* testimonials */}
      <section className="testimonials-section">
        <div className="testimonials-container">
          <h2 className="testimonials-title">💬 What People Are Saying</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p className="testimonial-text">
                "WiFind helped me easily discover free and safe WiFi centers in
                my area!"
              </p>
              <div className="testimonial-author">
                <strong>- Sarah M., Student</strong>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">
                "I found donation opportunities that let me give away old
                devices to those who need it! It feels good to give back!"
              </p>
              <div className="testimonial-author">
                <strong>- Marcus T., Community Volunteer</strong>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">
                "The job prep resources and free Wi-Fi locations made my job
                search so much easier."
              </p>
              <div className="testimonial-author">
                <strong>- Jennifer L., Job Seeker</strong>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">
                "WiFind lets me read and leave real, honest reviews. Other sites
                are full of fake ratings — now I'll never get stuck at a center
                with 'great Wi-Fi' that barely works!"
              </p>
              <div className="testimonial-author">
                <strong>- Lily Williams, Job Seeker</strong>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">
                "The interactive map feature is amazing! I can see which WiFi
                centers are busy before I even leave home."
              </p>
              <div className="testimonial-author">
                <strong>- David Chen, Remote Worker</strong>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">
                "As a parent, I love that I can find safe, family-friendly WiFi
                spots where my kids can do homework while I work nearby."
              </p>
              <div className="testimonial-author">
                <strong>- Maria Rodriguez, Parent & Freelancer</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
