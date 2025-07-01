import React from "react";
import { useNavigate } from "react-router-dom";
import "./MapView.css";

const MapView = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/community-centers");
  };

  return (
    <div className="mapview-container">
      <div className="back-container">
        <button className="back-button" onClick={handleBackClick}>Back</button>
      </div>
      <div className="mapview-content">
        <h1 className="mapview-title">Map View</h1>
        <p className="mapview-description">
          This is a placeholder for the map view. Map from API will be displayed here!
        </p>
      </div>
    </div>
  );
};

export default MapView;
