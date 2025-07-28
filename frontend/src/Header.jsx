import React from "react";
import { useNavigate } from "react-router-dom"; // use ReactRouter to nicely navigate between pages
import { useAuth } from "./AuthContext";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, signOut, user } = useAuth(); // added user to  access user data and get the user's first name

  // define the functions that will be called when the buttons are clicked
  const handleLoginClick = () => {
    // use the navigate function to navigate to the login page and change url to /login
    navigate("/login");
  };

  const handleSignUpClick = () => {
    navigate("/signup");
  };
  // to get back to the home page
  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate("/homepage");
    } else {
      navigate("/");
    }
  };

  const handleLogoutClick = async () => {
    await signOut();
    navigate("/");
  };
  // programmatically navigate to the specified route page
  const handleHomeClick = () => {
    navigate("/dashboard");
  };

  const handleCommunityCentersClick = () => {
    navigate("/community-centers");
  };

  const handleResourcesClick = () => {
    navigate("/resources");
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
                  <a
                    href="#home" // tells browers to scroll
                    onClick={(e) => {
                      e.preventDefault(); // prevents the default behavior of the link (scrolling)
                      handleHomeClick(); // and this does the react router navigation
                    }}
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="#community-centers"
                    onClick={(e) => {
                      e.preventDefault();
                      handleCommunityCentersClick();
                    }}
                  >
                    Community Centers
                  </a>
                </li>
                <li>
                  <a
                    href="#resources"
                    onClick={(e) => {
                      e.preventDefault();
                      handleResourcesClick();
                    }}
                  >
                    Resources
                  </a>
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
