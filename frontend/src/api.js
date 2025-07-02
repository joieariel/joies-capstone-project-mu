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
