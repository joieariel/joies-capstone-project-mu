import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./Footer.css";

const Footer = () => {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>WiFindᯤ</h3>
          <p>Connecting you to free WiFi resources in your community.</p>
        </div>

        <div className="footer-section">
          <h3>Navigation</h3>
          <ul>
            {isAuthenticated ? (
              <>
                <li>
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link to="/community-centers">Community Centers</Link>
                </li>
                <li>
                  <Link to="/resources">Resources</Link>
                </li>
                <li>
                  <Link to="/mapview">Map View</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/signup">Sign Up</Link>
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <a href="#">About Us</a>
            </li>
            <li>
              <a href="#">FAQ</a>
            </li>
            <li>
              <a href="#">Support</a>
            </li>
            <li>
              <a href="#">Donate</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Legal</h3>
          <ul>
            <li>
              <a href="#">Privacy Policy</a>
            </li>
            <li>
              <a href="#">Terms of Service</a>
            </li>
            <li>
              <a href="#">Cookie Policy</a>
            </li>
            <li>
              <a href="#">Accessibility</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>Email: info@wifind.org</p>
          <p>Phone: (555) 123-4567</p>
          <div className="social-icons">
            <a href="#" aria-label="Facebook">
              <i className="fa-brands fa-facebook"></i>
            </a>
            <a href="#" aria-label="Twitter">
              <i className="fa-brands fa-twitter"></i>
            </a>
            <a href="#" aria-label="Instagram">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="#" aria-label="LinkedIn">
              <i className="fa-brands fa-linkedin"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 WiFindᯤ by Joie Whitmon. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
