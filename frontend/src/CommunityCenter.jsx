import React, { useState, useEffect, useCallback } from "react"; // useCallback
import { useNavigate } from "react-router-dom";
import { communityAPI } from "./api"; // import communityAPI
import { useGetUserLocation, useGetCentersWithFilter } from "./utils/hooks"; // import custom hooks
import "./CommunityCenter.css";
import Search from "./Search";

const CommunityCenter = () => {
  // state to store list of centers from db, initialized as empty
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // state to track current search filters
  const [currentFilters, setCurrentFilters] = useState(null);

  // track if a search has been performed
  const [hasSearched, setHasSearched] = useState(false);

  // use custom hook for user location functionality
  const {
    data: userLocation,
    isLoading: locationLoading,
    error: locationError,
  } = useGetUserLocation();

  // use custom hook for filtered search functionality
  const {
    data: filteredCenters,
    isLoading: searchLoading,
    error: searchError,
  } = useGetCentersWithFilter(currentFilters, userLocation);

  const navigate = useNavigate();

  // when user clicks map view button at top of page, show the map view ( navigate to map page and show all community centers on map)
  const handleMapViewClick = () => {
    navigate("/mapview"); // navigate to /map which will show all community centers on map
  };

  // when user clicks reviews button, show the reviews for that specific center
  // modified to accept centerId paramer so that centers reviews are displayed
  const handleReviewsClick = (centerId) => {
    // navigate to /reviews/[centerId] which creates a url like /reviews/5 for center ID 5
    // centerId becomes a url param that the Reviews component can read
    navigate(`/reviews/${centerId}`);
  };

  // when user clicks map button, show the map view for that specific center
  const handleMapClick = (centerId) => {
    // navigate to /map/[centerId] which creates a url like /map/5 for center ID 5
    // centerId becomes a url param that the Map component can read
    navigate(`/map/${centerId}`);
  };

  // function to handle search filters change
  const handleSearch = useCallback((filters) => {
    // check if any filters are selected
    const hasActiveFilters = Object.values(filters).some(
      (filterArray) => filterArray.length > 0
    );

    if (!hasActiveFilters) {
      // no filters selected, show all centers
      setCurrentFilters(null);
      setHasSearched(false);
    } else {
      // filters selected, trigger search
      setCurrentFilters(filters);
      setHasSearched(true);
    }
  }, []);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setLoading(true);
        // call the api to get all centers from prisma db
        const data = await communityAPI.getAllCenters();
        setCenters(data); // store fetched data in centers state triggers rerender and displays centers
      } catch (err) {
        console.error("Error fetching community centers:", err);
        setError("Failed to load community centers");
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, []); // only runs once when component mounts

  // update centers when filtered results are available
  useEffect(() => {
    if (hasSearched && filteredCenters) {
      setCenters(filteredCenters);
    } else if (!hasSearched && !currentFilters) {
      // if no search is active, fetch all centers
      const fetchAllCenters = async () => {
        try {
          const data = await communityAPI.getAllCenters();
          setCenters(data);
        } catch (err) {
          console.error("Error fetching all community centers:", err);
        }
      };
      fetchAllCenters();
    }
  }, [hasSearched, filteredCenters, currentFilters]);

  if (loading) {
    return (
      <div className="community-center-container">
        <div className="community-center-content">
          <h1 className="community-center-title">
            Find community centers near you
          </h1>
          <p>Loading community centers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="community-center-container">
        <div className="community-center-content">
          <h1 className="community-center-title">
            Find community centers near you
          </h1>
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="community-center-container">
      <div className="community-center-content">
        <h1 className="community-center-title">
          Find community centers near you
        </h1>
        <div className="community-center-search">
          <Search onSearch={handleSearch} />
        </div>
        <div className="community-center-nav">
          {/* add a nav within the communnity center page to switch from list view to map view */}
          <button
            className="mapview-button"
            onClick={() => handleMapViewClick()}
          >
            Map View
          </button>
        </div>
        {/* display location status to the user */}
        {locationLoading && (
          <div className="location-status">
            <p>Getting your location for distance-based filtering...</p>
          </div>
        )}

        {locationError && (
          <div className="location-error">
            <p>
              <strong>Location access issue:</strong> {locationError}
            </p>
            <p>Distance-based filtering will not be available.</p>
          </div>
        )}

        {userLocation &&
          currentFilters &&
          currentFilters.distance.length > 0 && ( // added search filter check
            <div className="location-success">
              <p>
                Location access granted. Distance-based filtering is available.
              </p>
            </div>
          )}

        {/* search results summary */}
        {hasSearched && (
          <div className="search-results-summary">
            <p>
              {centers.length === 0
                ? "No community centers match your search criteria."
                : `Found ${centers.length} community center${
                    centers.length !== 1 ? "s" : ""
                  } matching your search criteria.`}
            </p>
          </div>
        )}

        {/* search error message */}
        {searchError && (
          <div className="search-error">
            <p>{searchError}</p>
          </div>
        )}

        {/* search loading indicator */}
        {searchLoading && (
          <div className="search-loading">
            <p>Searching for community centers...</p>
          </div>
        )}

        {/* loop through each communiy center in array and create one card for each center returned from db*/}
        <div className="centers-grid">
          {centers.map((center) => (
            // each card needs a unique key, center id
            <div key={center.id} className="center-card">
              <img
                src={center.image_url}
                alt={center.name}
                className="center-image"
              />
              <div className="center-info">
                <h3 className="center-name">{center.name}</h3>
                <p className="center-address">{center.address}</p>
                <p className="center-phone">{center.phone_number}</p>
                <p className="center-description">{center.description}</p>
                <p className="center-email">
                  <strong>Email:</strong> {center.email}
                </p>
                <p className="center-zip">
                  <strong>Zip Code:</strong> {center.zip_code}
                </p>

                {/* enhanced information display */}
                <div className="center-enhanced-info">
                  {/* distance (if available) */}
                  {center.distance !== null && (
                    <p className="center-distance">
                      <span className="info-label">Distance:</span>{" "}
                      {center.distance} miles
                    </p>
                  )}

                  {/* rating and review count */}
                  <div className="center-rating-container">
                    {center.avgRating !== null ? (
                      <>
                        <div className="center-rating">
                          <span className="info-label">Rating:</span>{" "}
                          {center.avgRating.toFixed(1)}
                          <span className="rating-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`star ${
                                  star <= Math.round(center.avgRating)
                                    ? "filled"
                                    : "empty"
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </span>
                        </div>
                        <span className="review-count">
                          ({center.reviewCount}{" "}
                          {center.reviewCount === 1 ? "review" : "reviews"})
                        </span>
                      </>
                    ) : (
                      <span className="no-ratings">No ratings yet</span>
                    )}
                  </div>

                  {/* hours (open/closed status) */}
                  <p
                    className={`center-hours ${
                      center.isOpen ? "open" : "closed"
                    }`}
                  >
                    <span className="status-indicator"></span>
                    {center.hoursMessage}
                  </p>

                  {/* Tags */}
                  {center.tags && center.tags.length > 0 && (
                    <div className="center-tags">
                      <span className="info-label">Tags:</span>
                      <div className="tags-container">
                        {center.tags.map((tag) => (
                          <span key={tag.id} className="center-tag">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="center-buttons">
                  <button
                    className="reviews-button"
                    // Pass the center.id to the click handler - this is crucial because each card
                    // represents a different community center, and we need to know which one's reviews to show
                    // We use an arrow function to pass the center.id as an argument
                    onClick={() => handleReviewsClick(center.id)}
                  >
                    Reviews
                  </button>
                  <button
                    className="map-button"
                    onClick={() => handleMapClick(center.id)}
                  >
                    Map
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityCenter;
