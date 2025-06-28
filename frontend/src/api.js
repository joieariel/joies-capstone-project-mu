// this file is the bridge between react frontend and express backend
import { supabase } from './supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//  function to get the current user's session token
const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

//  function to make authenticated api requests
const apiRequest = async (endpoint, options = {}) => {
  try {
    // get the authentication token
    const token = await getAuthToken();

    // set up headers
    const headers = {
      'Content-Type': 'application/json',
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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// api functions for user operations
export const userAPI = {
  // get a single user (protected)
  getUser: (userId) => apiRequest(`/users/${userId}`),

  // create new user (public - used during signup)
  createUser: (userData) => apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  // update user (protected)
  updateUser: (userId, userData) => apiRequest(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),

  // delete user (protected)
  deleteUser: (userId) => apiRequest(`/users/${userId}`, {
    method: 'DELETE',
  }),
};

// api functions for other resources
export const communityAPI = {
  getAllCenters: () => apiRequest('/communityCenters'),

  // Add more community center endpoints later
};

export const reviewAPI = {
  getAllReviews: () => apiRequest('/reviews'),

  // add more review endpoints later
};

// export the base apiRequest function for custom requests
export { apiRequest };
