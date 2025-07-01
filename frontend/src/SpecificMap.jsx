import React from "react";
import { useNavigate } from "react-router-dom";
import "./SpecificMap.css";

const SpecificMap = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/community-centers");
  };

  return (
    <div className="map-container">
      <div className="back-container">
        <button className="back-button" onClick={handleBackClick}>
          Back to Community Centers
        </button>
      </div>
      <div className="map-content">
        <h1 className="map-title">Specific Map</h1>
        <p className="map-description">
          This is a placeholder for the map. Center on map from API will be displayed here!
        </p>
      </div>
    </div>
  );
};

export default SpecificMap;
