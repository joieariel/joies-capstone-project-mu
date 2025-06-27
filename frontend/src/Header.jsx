import React from "react";
import { useNavigate } from "react-router-dom"; // use ReactRouter to nicely navigate between pages
import { useAuth } from "./AuthContext";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, signOut, user } = useAuth();

  // define the functions that will be called when the buttons are clicked
  const handleLoginClick = () => {
    // use the navigate function to navigate to the login page and change url to /login
    navigate("/login");
  };

  const handleSignUpClick = () => {
    navigate("/signup");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLogoutClick = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* left side (logo section) */}
        <div
          className="header-logo"
          onClick={handleLogoClick}
          style={{ cursor: "pointer" }}
        >
          <span className="logo-text">WiFindᯤ</span>
        </div>

        {/* conditional rendering based on authentication status */}
        {isAuthenticated ? (
          <>
            {/* nav (middle-right) - only show for logged in users */}
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

            {/* greeting and logout button for authenticated users */}
            <div className="header-auth">
              <span className="user-greeting">
                Hi, {user?.user_metadata?.first_name || "User"}!
              </span>
              <button className="logout-btn" onClick={handleLogoutClick}>
                Log Out
              </button>
            </div>
          </>
        ) : (
          /* login and sign up buttons for non-authenticated users */
          <div className="header-auth">
            <button className="login-btn" onClick={handleLoginClick}>
              Log In
            </button>
            <button className="signup-btn" onClick={handleSignUpClick}>
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
