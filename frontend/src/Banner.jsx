import React from "react";
import { useNavigate } from "react-router-dom";
import "./Banner.css";

const Banner = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleSignUpClick = () => {
    navigate("/signup");
  };

  return (
    <section className="banner">
      <div className="banner-container">
        {/* left side of the banner */}
        <div className="banner-content">
          <p className="banner-intro-text">
            A short introduction to digital equity and why it is important.
          </p>

          <h1 className="banner-title">WHAT IS DIGITAL EQUITY?</h1>

          <p className="banner-description">
            Digital equity means ensuring fair access to technology, the
            internet, and digital skills for everyone. It is important because
            it bridges gaps in education, job opportunities, healthcare, and
            social participation, enabling all individuals to thrive in a
            connected world.

            <br />
            Whether you're looking to get connected, grow your skills, or give
            back — WiFind helps you bridge the digital gap. Discover local
            resources, explore opportunities, and join a community working
            toward digital equity.
          </p>

          <div className="banner-btns">
            <button className="banner-login-btn" onClick={handleLoginClick}>
              Log In
            </button>
            <button className="banner-signup-btn" onClick={handleSignUpClick}>
              Sign Up
            </button>
          </div>
        </div>

        {/* right side of the banner - img */}
        <div className="banner-img">
          <img
            src="./src/assets/img/digiequity.jpeg"
            alt="digital equity image"
            className="banner-img"
          />
        </div>
      </div>
    </section>
  );
};

export default Banner;
