import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { userAPI } from "./api";
import EducationalResources from "./EducationalResources";
import CareerResources from "./CareerResources";
import "./Resources.css";
import LoadingSpinner from "./LoadingSpinner";

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
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="resources-container">
        <div className="resources-content">
          <LoadingSpinner size="large" text="Loading resources..." />
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
    <div className="resources-container" style={{ backgroundColor: "#f8f9fa", minHeight: "calc(100vh - 80px)" }}>
      {userData?.status === "Student" ? <EducationalResources /> : <CareerResources />}
    </div>
  );
};

export default Resources;
