// this file is the bridge between react frontend and express backend
import { supabase } from "./supabaseClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//  function to get the current user's session token
const getAuthToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
};

//  function to make authenticated api requests
const apiRequest = async (endpoint, options = {}) => {
  try {
    // get the authentication token
    const token = await getAuthToken();

    // set up headers
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // ad authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    //  empty responses (like 204 No Content)
    // only attempt to parse the response if it's not empty
    let data = null;
    const contentType = response.headers.get("content-type");

    if (
      response.status !== 204 &&
      contentType &&
      contentType.includes("application/json")
    ) {
      const text = await response.text();
      if (text) {
        data = JSON.parse(text);
      }
    }

    if (!response.ok) {
      throw new Error(data?.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// api functions for user operations
export const userAPI = {
  // get current user's data using their supabase ID (protected)
  getCurrentUser: () => apiRequest("/users/me"), // calls new endpoint
  // no params, since backend gets user if from jwt token

  // get a single user (protected)
  getUser: (userId) => apiRequest(`/users/${userId}`),

  // create new user (public - used during signup)
  createUser: (userData) =>
    apiRequest("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  // update user (protected)
  updateUser: (userId, userData) =>
    apiRequest(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    }),

  // delete user (protected)
  deleteUser: (userId) =>
    apiRequest(`/users/${userId}`, {
      method: "DELETE",
    }),
};

// api functions for other resources
export const communityAPI = {
  getAllCenters: () => apiRequest("/communityCenters"),
  getCenterById: (centerId) => apiRequest(`/communityCenters/${centerId}`),
  getCentersByZipCode: (zipCode) =>
    apiRequest(`/communityCenters?zip_code=${zipCode}`),

  // get recommendations for a specific community center
  getRecommendationsForCenter: (centerId, limit = 5) =>
    apiRequest(`/communityCenters/${parseInt(centerId)}/recommendations?limit=${limit}`),

  // function for advanced search filtering to connect frontend to backend api
  // takes in a filters object with distance, hours, rating, and tags properties and coords of user
  // returns a promise that resolves with the filtered community centers
  getCentersWithFilters: async (filters, userLocation = null) => {
    try {
      // start building/encoding the query string using URLSearchParams api
      const queryParams = new URLSearchParams();

      // process distance filters if they exist and are not empty
      if (filters.distance && filters.distance.length > 0) {
        // add each distance filter as a separate query parameter
        filters.distance.forEach((distance) => {
          queryParams.append("distance", distance);
        });

        // if we have distance filters and user location, add coordinates
        if (userLocation) {
          queryParams.append("userLat", userLocation.latitude);
          queryParams.append("userLng", userLocation.longitude);
        }
      }

      // process hours filters
      if (filters.hours && filters.hours.length > 0) {
        // add each hour filter as a separate query parameter
        filters.hours.forEach((hour) => {
          queryParams.append("hours", hour);
        });
      }

      // process rating filters
      if (filters.rating && filters.rating.length > 0) {
        filters.rating.forEach((rating) => {
          queryParams.append("rating", rating);
        });
      }

      // process tag filters
      if (filters.tags && filters.tags.length > 0) {
        // add each tag filter as a separate query parameter
        filters.tags.forEach((tag) => {
          queryParams.append("tags", tag);
        });
      }

      // make the api request with the constructed query string
      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/communityCenters?${queryString}`
        : "/communityCenters";

      return await apiRequest(endpoint);
    } catch (error) {
      console.error("Error fetching filtered community centers:", error);
      throw error;
    }
  },
};

// helper function to get the user's current location using browser geolocation API
// returns a promise that resolves with users coordinates or rejects with an error
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    // first check if geolocation is supported by the browser
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    // options for getCurrentPosition
    const options = {
      enableHighAccuracy: true, // use GPS if available
      timeout: 10000, // time to wait for a position (10 seconds)
      maximumAge: 60000, // accept a cached position if it's not older than 1 minute
    };

    // success callback
    const success = (position) => {
      resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    };

    // error callback
    const error = (err) => {
      switch (err.code) {
        // user denied permission
        case err.PERMISSION_DENIED:
          reject(
            new Error(
              "Location access was denied. Please enable location services to use distance-based filtering."
            )
          );
          break;
        // location information cannot be  retrieved
        case err.POSITION_UNAVAILABLE:
          reject(
            new Error(
              "Location information is unavailable. Please try again later."
            )
          );
          break;
        case err.TIMEOUT:
          reject(
            // location information cannot be retrieved due to timeout
            new Error(
              "The request to get your location timed out. Please try again."
            )
          );
          break;
        default:
          // unknown error
          reject(
            new Error(
              "An unknown error occurred while trying to get your location."
            )
          );
      }
    };

    // get the current position
    navigator.geolocation.getCurrentPosition(success, error, options);
  });
};

export const reviewAPI = {
  // get all reviews (for testing purposes)
  getAllReviews: () => apiRequest("/reviews"),

  // get reviews for a specific community center
  // returns: array of review objects with user info and images
  getReviewsByCenter: (centerId) => {
    // convert centerId to number to ensure correct data type since backend expects integer
    return apiRequest(`/reviews/center/${parseInt(centerId)}`);
  },

  // create a new review for a community center
  // returns: newly created review object with user info and images
  createReview: (reviewData) => {
    return apiRequest("/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  },

  // update an existing review
  // returns: updated review object with user info and images
  updateReview: (reviewId, reviewData) => {
    return apiRequest(`/reviews/${parseInt(reviewId)}`, {
      method: "PUT",
      body: JSON.stringify(reviewData),
    });
  },

  // delete a review (alos deletes all associated images)
  deleteReview: (reviewId) => {
    return apiRequest(`/reviews/${parseInt(reviewId)}`, {
      method: "DELETE",
    });
  },

  // add new images to an existing review
  // returns: updated review object with all images
  addImagesToReview: (reviewId, imageUrls) => {
    return apiRequest(`/reviews/${parseInt(reviewId)}/images`, {
      method: "POST",
      body: JSON.stringify({ image_urls: imageUrls }),
    });
  },

  // delete a specific image from a review
  // returns: empty response (204 status)
  deleteImageFromReview: (reviewId, imageId) => {
    return apiRequest(
      `/reviews/${parseInt(reviewId)}/images/${parseInt(imageId)}`,
      {
        method: "DELETE",
      }
    );
  },
};

// api functions for tag operations
export const tagAPI = {
  // get all available tags
  getAllTags: () => apiRequest("/tags"),

  // get tags for a specific community center
  getCenterTags: (centerId) => apiRequest(`/tags/center/${parseInt(centerId)}`),

  // get most popular tags for a specific community center based on reviews
  getPopularCenterTags: (centerId, limit = 5) =>
    apiRequest(`/tags/center/${parseInt(centerId)}/popular?limit=${limit}`),

  // add a tag to a community center
  addTagToCenter: (centerId, tagId) =>
    apiRequest(`/tags/center/${parseInt(centerId)}`, {
      method: "POST",
      body: JSON.stringify({ tag_id: tagId }),
    }),

  // remove a tag from a community center
  removeTagFromCenter: (centerId, tagId) =>
    apiRequest(`/tags/center/${parseInt(centerId)}/tag/${parseInt(tagId)}`, {
      method: "DELETE",
    }),
};

// export the base apiRequest function for custom requests
export { apiRequest };
