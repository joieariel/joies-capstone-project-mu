import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useLoadScript,
  GoogleMap,
  MarkerF,
  PolylineF, // import polyline for drawing lines between points
} from "@react-google-maps/api"; // import the necessary components from @react-google-maps/api
import LoadingSpinner from "./LoadingSpinner";
import CenterCard from "./CenterCard";
import SimilarCentersModal from "./SimilarCentersModal";
import { useGetUserLocation } from "./utils/hooks";
import "./SpecificMap.css";

// define map container style
const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const SpecificMap = () => {
  const navigate = useNavigate();
  const { centerId } = useParams(); // get the center id from the URL
  // state to store center data once we fetch it from api
  const [center, setCenter] = useState(null);
  // state to track loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // state to track if similar centers modal is open
  const [modalOpen, setModalOpen] = useState(false);

  // use the custom hook to get the user's location
  const {
    data: userLocation,
    isLoading: locationLoading,
    error: locationError,
  } = useGetUserLocation();

  // 2) load google maps javascript api
  // returns isLoaded (true when maps is ready) and loadError (if loading failed)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const handleBackClick = () => {
    navigate("/community-centers");
  };

  // function to handle when similar centers is clicked
  const handleSimilarCentersClick = () => {
    setModalOpen(true);
  };

  // function to close similar centers modal
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // fetch the specific community center data from api
  useEffect(() => {
    const fetchCenter = async () => {
      try {
        // wait for user location to be available before fetching center data to ensure we have the user's location before calculating distance
        if (userLocation) {
          // include user location in the request to calculate distance
          const response = await fetch(
            `${
              import.meta.env.VITE_API_BASE_URL
            }/communityCenters/${centerId}?userLat=${
              userLocation.latitude
            }&userLng=${userLocation.longitude}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch community center");
          }

          const data = await response.json();

        // add artificial delay to see the loading spinner (500ms)
        await new Promise((resolve) => setTimeout(resolve, 500));

          // store fetched data in state
          setCenter(data);
          setLoading(false);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    // only fetch if centerId is provided
    if (centerId) {
      // if user location is still loading, keep  loading state true
      if (locationLoading) {
        setLoading(true);
      } else {
        fetchCenter();
      }
    } else {
      setError("No center ID provided");
      setLoading(false);
    }
  }, [centerId, userLocation, locationLoading]); // rerun effect if centerId or userLocation changes

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
          <h1 className="map-title">Map View</h1>
          <LoadingSpinner
            size="large"
            text="Loading community center location..."
          />
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
          {center ? `${center.name} - Details` : "Community Center"}
        </h1>
        {/* only show content if loading center data was a success */}
        {center ? (
          <div>
            {/* add the centercard component to display all center details */}
            <CenterCard
              center={{
                ...center,
                // process the data to match what CenterCard expects
                tags:
                  center.tags ||
                  (center.centerTags && Array.isArray(center.centerTags)
                    ? center.centerTags.map((ct) => ct.tag)
                    : []),
                avgRating:
                  center.avgRating !== undefined ? center.avgRating : null,
                reviewCount:
                  center.reviewCount !== undefined ? center.reviewCount : 0,
                distance:
                  center.distance !== undefined ? center.distance : null,
                isOpen: center.isOpen !== undefined ? center.isOpen : null,
                hoursMessage:
                  center.hoursMessage || "Hours information unavailable",
                // add a property to hide the map button
                hideMapButton: true,
              }}
              showSimilarButton={true} // show the similar centers button
              onSimilarCentersClick={handleSimilarCentersClick} // pass the handler for the similar centers button
            />

            <h2 className="map-section-title">Location</h2>

            {/* display location status message */}
            {locationLoading && (
              <div className="location-status">
                <p>Getting your location to show on the map...</p>
              </div>
            )}

            {locationError && (
              <div className="location-error">
                <p>
                  <strong>Location access issue:</strong> {locationError}
                </p>
                <p>Your location will not be shown on the map.</p>
              </div>
            )}

            {/* add the google map component */}
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={15}
              center={{
                // center the map on the community center location
                lat: center.latitude, // latitude from db
                lng: center.longitude, // longitude from db
              }}
            >
              {/* add a marker for the center */}
              <MarkerF
                position={{
                  // position the marker on the community center location (same coordinates)
                  lat: center.latitude, // same latitude as center from db
                  lng: center.longitude, // same longitude as center
                }}
                title={center.name}
              />

              {/* add user location marker if available */}
              {userLocation && (
                <>
                  <MarkerF
                    position={{
                      lat: userLocation.latitude,
                      lng: userLocation.longitude,
                    }}
                    title="Your Location"
                    icon={{
                      url: "data:image/svg+xml;charset=UTF-8,%3csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='10' cy='10' r='8' fill='%234285f4' stroke='white' stroke-width='2'/%3e%3c/svg%3e",
                      scaledSize: { width: 20, height: 20 },
                    }}
                  />

                  {/* add a line between user location and community center */}
                  <PolylineF
                    path={[
                      {
                        lat: userLocation.latitude,
                        lng: userLocation.longitude,
                      },
                      { lat: center.latitude, lng: center.longitude },
                    ]}
                    options={{
                      strokeColor: "#4285F4", // google blue color
                      strokeOpacity: 0.8,
                      strokeWeight: 3,
                      geodesic: true, // draw the shortest path on the Earth's surface
                    }}
                  />
                </>
              )}
            </GoogleMap>
          </div>
        ) : (
          // fallback content if center data is not available (null/undefined)
          <p>Community center not found.</p>
        )}
      </div>

      {/* add the SimilarCentersModal component */}
      {center && (
        <SimilarCentersModal
          centerId={center.id}
          isOpen={modalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default SpecificMap;
