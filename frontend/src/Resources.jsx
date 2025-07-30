import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { userAPI } from "./api";
import "./Resources.css";

const Resources = () => {
  const { user } = useAuth();
  // state for user data
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // fetch user data
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await userAPI.getCurrentUser();
        setUserData(data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };
    // fetch user data if user is logged in
    if (user) {
      fetchUserData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="resources-container">
        <div className="resources-content">
          <p>Loading resources...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resources-container">
        <div className="resources-content">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resources-container">
      <div className="resources-content">
        <h1 className="resources-title">Resources</h1>
        {/* if the user is a student, display educational resources */}
        {userData?.status === "Student" ? (
          <div className="resources-section">
            <h2>Educational Resources</h2>
            <div className="resource-cards">
              {/* placeholder for educational resources */}
              <div className="resource-card">
                <h3>Educational Resources</h3>
                <p>Resources for students will be displayed here.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="resources-section">
            <h2>Career Resources</h2>
            <div className="resource-cards">
              {/* placeholder for career resources */}
              <div className="resource-card">
                <h3>Career Resources</h3>
                <p>Resources for job seekers will be displayed here.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
