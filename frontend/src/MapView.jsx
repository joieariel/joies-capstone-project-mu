import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLoadScript, GoogleMap, MarkerF } from "@react-google-maps/api";
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
  // state to store user's current location
  const [userLocation, setUserLocation] = useState(null);
  //loading and error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // state to track geolocation permission status
  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState(false);

  // load google maps api
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // function to handle when back to community centers button is clicked
  const handleBackClick = () => {
    navigate("/community-centers");
  };

  // useeffect to get user's current location
  // using built in navigator.geolocation API
  useEffect(() => {
    const getCurrentLocation = () => {
      // if the browser supports geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            // differentiate between permission denied and other errors
            if (error.code === error.PERMISSION_DENIED) {
              setLocationPermissionDenied(true);
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              console.error("Location information unavailable");
            } else if (error.code === error.TIMEOUT) {
              console.error("Location request timed out");
            } else {
              console.error("Unknown geolocation error:", error);
            }
            // fallback will be handled in mapCenter calculation
            setUserLocation(null);
          }
        );
      } else {
        // browser doesn't support geolocation
        setLocationPermissionDenied(true);
        // fallback will be handled in mapCenter calculation
        setUserLocation(null);
      }
    };

    getCurrentLocation();
  }, []);

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

  // use user's current location as map center, fallback to average of all community centers if no user location
  const mapCenter =
    userLocation ||
    (centers.length > 0
      ? {
          lat:
            centers.reduce((sum, center) => sum + center.latitude, 0) /
            centers.length,
          lng:
            centers.reduce((sum, center) => sum + center.longitude, 0) /
            centers.length,
        }
      : null); // if no centers, fallback to null

  return (
    <div className="mapview-container">
      <div className="back-container">
        <button className="back-button" onClick={handleBackClick}>
          Back to List View
        </button>
      </div>
      <div className="mapview-content">
        <h1 className="mapview-title">All Community Centers</h1>

        {/* show location permission message if permission was denied */}
        {locationPermissionDenied && (
          <div className="permission-notice">
            <strong>Location Access Unavailable:</strong> Unable to show your
            current location on the map as location permission was not granted.
            You can still view all community center locations below.
          </div>
        )}

        <p className="mapview-description">
          Showing {centers.length} community centers on the map
          <br />
          Scroll and zoom out to view all markers
          <br />
          Click on a marker to view the details of that community center
        </p>

        {centers.length > 0 ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={12}
            center={mapCenter}
          >
            {/* User location marker */}
            {userLocation && (
              <MarkerF
                position={userLocation}
                title="Your Location"
                icon={{
                  url: "data:image/svg+xml;charset=UTF-8,%3csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='10' cy='10' r='8' fill='%234285f4' stroke='white' stroke-width='2'/%3e%3c/svg%3e",
                  scaledSize: { width: 20, height: 20 },
                }}
              />
            )}

            {/* Community center markers */}
            {centers.map((center) => (
              <MarkerF
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
