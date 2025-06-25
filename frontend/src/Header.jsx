import React from "react";
import "./Header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        {/* left side (logo section) */}
        <div className="header-logo">
          <span className="logo-text">WiFindᯤ</span>
        </div>

        {/* nav (middle-right)*/}
        <nav className="header-nav">
          <ul className="nav-list">
            <li className="home-link">
              <a href="#home">Home</a>
            </li>
            <li>
              <a href="#community-centers">Community Centers</a>
            </li>
            <li>
              <a href="#detailed-view">Detailed View</a>
            </li>
            <li>
              <a href="#resources">Resources</a>
            </li>
            <li>
              <a href="#donation">Device Donation</a>
            </li>
          </ul>
        </nav>

        {/* right side login and sign up buttons */}
        <div className="header-auth">
          <button className="login-btn">Log In</button>
          <button className="signup-btn">Sign Up</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
