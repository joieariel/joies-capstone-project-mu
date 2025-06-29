import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { userAPI } from "./api"; // to make calls to backend
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  // state to store user data fetched from prisma db
  const [userData, setUserData] = useState(null);

  //state for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // call new api function to get user data from prisma db using supabase id
        const data = await userAPI.getCurrentUser();
        setUserData(data); //store fetched data in state so it can be displayed
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    // onlu fetch is authenticated user exists
    if (user) {
      fetchUserData();
    }
  }, [user]); // rerun the effect whenevr the user object changes

  // loading message for user experience
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }
// if api call fails
  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1 className="dashboard-welcome">
          {/* changed from user?.user_metadataa?.first_name (supabase data) to using prisma db data, kept ? for optional chaining for error prevention */}
          Welcome, {userData?.first_name || "User"}!
        </h1>
        <p className="dashboard-subtitle">
          Your WiFind dashboard is ready for you to explore.
        </p>

        <div className="user-profile-section">
          <h2>Your Profile Information</h2>
          {userData && (
            <div className="profile-details">
              <p><strong>Full Name:</strong> {userData.first_name} {userData.last_name}</p>
              <p><strong>Username:</strong> {userData.username}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Status:</strong> {userData.status}</p>
              <p><strong>Date of Birth:</strong> {new Date(userData.birthdate).toLocaleDateString()}</p>
              <p><strong>City:</strong> {userData.city}</p>
              <p><strong>State:</strong> {userData.state}</p>
              <p><strong>Zip Code:</strong> {userData.zip_code}</p>
              <p><strong>Member Since:</strong> {new Date(userData.created_at).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
