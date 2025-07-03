import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLoadScript, GoogleMap, Marker } from "@react-google-maps/api"; // import the necessary components from @react-google-maps/api
import "./SpecificMap.css";

// define map container style
const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const SpecificMap = () => {
  const navigate = useNavigate();
  const { centerId } = useParams(); // get the center id from the URL
  // state to store center data once we fetch it from api
  const [center, setCenter] = useState(null);
  // state to track loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2) load google maps javascript api
    // returns isLoaded (true when maps is ready) and loadError (if loading failed)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const handleBackClick = () => {
    navigate("/community-centers");
  };

  // fetch the specific community center data from api
  useEffect(() => {
    const fetchCenter = async () => {
      try {
        // make http request to backend api endpoint, uses centerid from url to get specific center
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/communityCenters/${centerId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch community center');
        }
        const data = await response.json();
        // store fetched data in state
        setCenter(data);
        console.log('Fetched center data:', data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching center:', err);
      } finally {
        setLoading(false);
      }
    };

    // only fetch if centerId is provided
    if (centerId) {
      fetchCenter();
    } else {
      setError("No center ID provided");
      setLoading(false);
    }
  }, [centerId]); // rerun effect if centerId changes

  // loading state
  if (!isLoaded || loading) {
    return (
      <div className="map-container">
        <div className="back-container">
          <button className="back-button" onClick={handleBackClick}>
            Back to Community Centers
          </button>
        </div>
        <div className="map-content">
          <h1 className="map-title">Loading...</h1>
          <p>Loading community center location...</p>
        </div>
      </div>
    );
  }

  //  error state
  if (loadError || error) {
    return (
      <div className="map-container">
        <div className="back-container">
          <button className="back-button" onClick={handleBackClick}>
            Back to Community Centers
          </button>
        </div>
        <div className="map-content">
          <h1 className="map-title">Error</h1>
          <p className="error-message">
            {loadError ? "Error loading Google Maps" : `Error: ${error}`}
          </p>
        </div>
      </div>
    );
  }

  // display the actual map with center location
  return (
    <div className="map-container">
      <div className="back-container">
        <button className="back-button" onClick={handleBackClick}>
          Back to Community Centers
        </button>
      </div>
      <div className="map-content">
        <h1 className="map-title">
          {center ? `${center.name} - Location` : "Community Center"}
        </h1>
        {/* only show content if loading center data was a success */}
        {center ? (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <p><strong>Address:</strong> {center.address}</p>
              <p><strong>Phone:</strong> {center.phone_number}</p>
            </div>

            {/* add the google map component */}
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={15}
              center={{  // center the map on the community center location
                lat: center.latitude, // latitude from db
                lng: center.longitude // longitude from db
              }}
            >
              {/* add a marker for the center */}
              <Marker
                position={{ // position the marker on the community center location (same coordinates)
                  lat: center.latitude, // same latitude as center from db
                  lng: center.longitude // same longitude as center
                }}
              />
            </GoogleMap>
          </div>
        ) : (
          // fallback content if center data is not available (null/undefined)
          <p>Community center not found.</p>
        )}
      </div>
    </div>
  );
};

export default SpecificMap;
