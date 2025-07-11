import { useState, useEffect } from 'react';
import { getUserLocation, communityAPI } from '../api';

/**
 * custom hook for managing user location data
 *
 * hook handles the process of getting the user's current location
 * and provides loading states and error handling.
 *
 * @returns {Object} An object containing:
 *   - data: user's location object (lat, lng) or null if unavail
 *   - isLoading: boolean indicating if location is currently being fetched
 *   - error: string containing error message if location fetch failed
 */
export const useGetUserLocation = () => {
  // state to store the user's location coordinates
  const [userLocation, setUserLocation] = useState(null);

  // state to track loading status during location fetch
  const [locationLoading, setLocationLoading] = useState(false);

  // state to store any error messages from location fetch attempts
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    // async function to fetch user's current location only attempts to get location if we don't already have it
    const getLocation = async () => {
      // only fetch location if we don't already have it
      if (!userLocation) {
        setLocationLoading(true);
        setLocationError("");

        try {
          // call the getUserLocation api function
          const location = await getUserLocation();
          setUserLocation(location);
          console.log("User location obtained:", location);
        } catch (err) {
          console.error("Error getting user location:", err);
          // set user-friendly error message
          setLocationError(err.message || "Failed to get your location");
        } finally {
          setLocationLoading(false);
        }
      }
    };

    getLocation();
  }, [userLocation]); // re-run effect if userLocation changes

  // return object following the data/isLoading/error pattern
  return {
    data: userLocation,
    isLoading: locationLoading,
    error: locationError
  };
};

/**
 * custom hook for fetching community centers with filters
 *
 *  hook handles the process of fetching filtered community centers based on search criteria like distance, hours, rating, and tags.
 *  provides loading states and error handling.
 *
 * @param {Object} filters - the filter object containing distance, hours, rating, and tags arrays
 * @param {Object|null} userLocation - the user's location object (lat, lng) for distance filtering
 * @returns {Object} an object containing:
 *   - data: array of filtered community centers or null if not loaded
 *   - isLoading
 *   - error
 */
export const useGetCentersWithFilter = (filters, userLocation = null) => {
  // state to store the filtered community centers data
  const [data, setData] = useState(null);

  // state to track loading status during data fetch
  const [isLoading, setIsLoading] = useState(false);

  //state to store any error messages from fetch attempts
  const [error, setError] = useState("");

  useEffect(() => {
    /**
     * async function to fetch filtered community centers runs when filters or userLocation change
     */
    const fetchFilteredCenters = async () => {
      // check if we have any active filters
      const hasActiveFilters = filters && Object.values(filters).some(
        (filterArray) => Array.isArray(filterArray) && filterArray.length > 0
      );

      // tf no filters are active, don't fetch (let component handle showing all centers)
      if (!hasActiveFilters) {
        setData(null);
        setError("");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        // call the api function with filters and user location
        const results = await communityAPI.getCentersWithFilters(filters, userLocation);
        setData(results);
        console.log(`Filtered search completed: ${results.length} results found`);
      } catch (err) {
        console.error("Error fetching filtered community centers:", err);
        setError(err.message || "Failed to fetch filtered community centers");
        setData(null); // clear data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredCenters();
  }, [filters, userLocation]); // re-run effect when filters or userLocation change

  return {
    data,
    isLoading,
    error
  };
};
