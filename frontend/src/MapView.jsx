import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import "./MapView.css";

// define map container style
const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const MapView = () => {
  const navigate = useNavigate();
  // state to store all cc data
  const [centers, setCenters] = useState([]);
  //loading and error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // load google maps api
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // function to handle when back to community centers button is clicked
  const handleBackClick = () => {
    navigate("/community-centers");
  };

  // useeffect to fetch all cc data from api
  useEffect(() => {
    const fetchCenter = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/communityCenters`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch community center");
        }
        const data = await response.json();
        // store fetched data in state
        setCenters(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCenter();
  }, []);

  // loading state
  if (!isLoaded || loading) {
    return (
      <div className="mapview-container">
        <div className="back-container">
          <button className="back-button" onClick={handleBackClick}>
            Back to Community Centers
          </button>
        </div>
        <div className="mapview-content">
          <h1 className="mapview-title">Loading...</h1>
          <p>Loading community centers..</p>
        </div>
      </div>
    );
  }

  // error state (if) then return error jsx keep back logic and then give error message
  if (loadError || error) {
    return (
      <div className="mapview-container">
        <div className="back-container">
          <button className="back-button" onClick={handleBackClick}>
            Back to Community Centers
          </button>
        </div>
        <div className="mapview-content">
          <h1 className="mapview-title">Error</h1>
          <p className="error-message">
            {loadError ? "Error loading Google Maps" : `Error: ${error}`}
          </p>
        </div>
      </div>
    );
  }

  // calculate center point for map (avg of all locations)
  const mapCenter =
    centers.length > 0
      ? {
          lat:
            centers.reduce((sum, center) => sum + center.latitude, 0) /
            centers.length,
          lng:
            centers.reduce((sum, center) => sum + center.longitude, 0) /
            centers.length,
        }
      : { lat: 40.7128, lng: -74.006 }; // default to NYC if no centers

  return (
    <div className="mapview-container">
      <div className="back-container">
        <button className="back-button" onClick={handleBackClick}>
          Back to List View
        </button>
      </div>
      <div className="mapview-content">
        <h1 className="mapview-title">All Community Centers</h1>
        <p className="mapview-description">
          Showing {centers.length} community centers on the map
        </p>

        {centers.length > 0 ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={10}
            center={mapCenter}
          >
            {centers.map((center) => (
              <Marker
                key={center.id}
                position={{
                  lat: center.latitude,
                  lng: center.longitude,
                }}
                title={center.name}
                onClick={() => {
                  // navigate to that specific center when marker is clicked
                  navigate(`/map/${center.id}`);
                }}
              />
            ))}
          </GoogleMap>
        ) : (
          <p>No community centers found.</p>
        )}
      </div>
    </div>
  );
};

export default MapView;
