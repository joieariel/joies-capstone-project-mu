import { useState, useEffect, useCallback } from "react"; // useCallback
import { useNavigate } from "react-router-dom";
import { communityAPI } from "./api"; // import communityAPI
import { useGetUserLocation, useGetCentersWithFilter } from "./utils/hooks"; // import custom hooks
import "./CommunityCenter.css";
import Search from "./Search";
import SimilarCentersModal from "./SimilarCentersModal";
import CenterCard from "./CenterCard";
import LoadingSpinner from "./LoadingSpinner";

const CommunityCenter = () => {
  // state to store list of centers from db, initialized as empty
  const [centers, setCenters] = useState([]);
  // Add artificial delay for loading state to see spinner
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // state to track current search filters
  const [currentFilters, setCurrentFilters] = useState(null);

  // track if a search has been performed
  const [hasSearched, setHasSearched] = useState(false);

  // state to track which center's similar centers modal is open (if any)
  const [modalCenterId, setModalCenterId] = useState(null);

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

  // Note: handleReviewsClick and handleMapClick functions have been moved to CenterCard component

  // when user clicks similar centers button, open the modal for that center
  const handleSimilarCentersClick = (centerId) => {
    setModalCenterId(centerId);
  };

  // close the similar centers modal
  const handleCloseModal = () => {
    setModalCenterId(null);
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

        // Remove artificial delay - this was causing double loading effect

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
          <LoadingSpinner size="large" text="Loading community centers..." />
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

        {/* loop through each community center in array and use the CenterCard component */}
        <div className="centers-grid">
          {centers.map((center) => (
            <CenterCard
              key={center.id}
              center={center}
              onSimilarCentersClick={handleSimilarCentersClick}
            />
          ))}
        </div>
      </div>

      {/* similar centers modal */}
      <SimilarCentersModal
        centerId={modalCenterId}
        isOpen={modalCenterId !== null}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default CommunityCenter;
