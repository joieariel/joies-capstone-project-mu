import React from "react";
import { useAuth } from "./AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1 className="dashboard-welcome">
          Welcome, {user?.user_metadata?.first_name || "User"}!
        </h1>
        <p className="dashboard-subtitle">
          Your WiFind dashboard is ready for you to explore.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
