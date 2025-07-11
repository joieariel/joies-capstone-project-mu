import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { communityAPI, getUserLocation } from "./api"; // import getUserLocation and with communityAPI
import "./CommunityCenter.css";
import Search from "./Search";

const CommunityCenter = () => {
  // state to store list of centers from db, initialized as empty
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // state to track search filters for advanced search feature
  const [searchFilters, setSearchFilters] = useState({
    distance: [],
    hours: [],
    rating: [],
    tags: [],
  });

  //  state variables for search functionality
  const [searchLoading, setSearchLoading] = useState(false);
  // track search-specific errors
  const [searchError, setSearchError] = useState("");
  // track if a search has been performed
  const [hasSearched, setHasSearched] = useState(false);
  // track number of results
  const [searchResultCount, setSearchResultCount] = useState(0);

  // state variables for user location functionality
  // state to store user's location
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

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

  // function to handle search filters change and perform the search
  const handleSearch = async (filters) => {
    // update the filters state
    setSearchFilters(filters);

    // reset search error
    setSearchError("");

    // check if any filters are selected
    const hasActiveFilters = Object.values(filters).some(
      (filterArray) => filterArray.length > 0
    );

    // if no filters are selected show all centers
    if (!hasActiveFilters) {
      try {
        setSearchLoading(true);
        const data = await communityAPI.getAllCenters();
        setCenters(data);
        setSearchResultCount(data.length);
        setHasSearched(false); // reset search state since showing all centers
      } catch (err) {
        console.error("Error fetching all community centers:", err);
        setSearchError("Failed to reset search results");
      } finally {
        setSearchLoading(false);
      }
      return;
    }

    // ff filters are selected, perform the search
    try {
      setSearchLoading(true);

      // call the api with filters and user location
      const results = await communityAPI.getCentersWithFilters(
        filters,
        userLocation
      );

      // update centers with search results
      setCenters(results);
      setSearchResultCount(results.length);
      setHasSearched(true); // mark that a search has been performed with true

      console.log(`Search completed: ${results.length} results found`);
    } catch (err) {
      console.error("Error performing search:", err);
      setSearchError("Failed to perform search. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  // useEffect to get user location on component mount
  useEffect(() => {
    // function to get the user's location
    const getLocation = async () => {
      // only attempt to get location if we don't already have it
      if (!userLocation) {
        setLocationLoading(true);
        setLocationError("");

        try {
          // call the getUserLocation function from api.js
          const location = await getUserLocation();

          // ftore the location in state
          setUserLocation(location);
          console.log("User location obtained:", location);
        } catch (err) {
          // handle errors
          console.error("Error getting user location:", err);
          setLocationError(err.message || "Failed to get your location");

          // don't show alert for location errors instead display it in the ui
        } finally {
          setLocationLoading(false);
        }
      }
    };

    // call the function to get location
    getLocation();
  }, []); // this runs once on component mount

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

        {userLocation && (
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
              {searchResultCount === 0
                ? "No community centers match your search criteria."
                : `Found ${searchResultCount} community center${
                    searchResultCount !== 1 ? "s" : ""
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

                {/* TODO: add new fields from advanced search results like open/close time, ratings, tags, #of reviews etc.*/}

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
