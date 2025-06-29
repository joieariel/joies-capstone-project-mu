import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { userAPI } from "./api"; // to make calls to backend
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  // state to store user data fetched from prisma db
  const [userData, setUserData] = useState(null);

  //state for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // statesfor edit mode

  // state to track if user is in edit mode currently
  const [isEditing, setIsEditing] = useState(false);
  // state to store form data while user is editing (hold temp values until user clicks save or cancel)
  const [editFormData, setEditFormData] = useState({});

  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // call new api function to get user data from prisma db using supabase id
        const data = await userAPI.getCurrentUser();
        setUserData(data); //store fetched data in state so it can be displayed
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    // onlu fetch is authenticated user exists
    if (user) {
      fetchUserData();
    }
  }, [user]); // rerun the effect whenevr the user object changes

  // function to handle starting edit mode
  const handleEditClick = () => {
    setIsEditing(true); // switch to edit mode
    setUpdateError(""); // clear prev error messages

    // pre-populate edit form with current user data
    setEditFormData({
      first_name: userData.first_name,
      last_name: userData.last_name,
      username: userData.username,
      email: userData.email,
      status: userData.status,
      birthdate: userData.birthdate.split('T')[0], // format date for input field
      city: userData.city,
      state: userData.state,
      zip_code: userData.zip_code,
    });
  };

  // function to handle canceling edit mode
  const handleCancelEdit = () => {
    setIsEditing(false); // exit edir mode
    setEditFormData({}); // clear form data
    setUpdateError("");
  };

  // function to handle form input changes (runs when user types in any form field)
  const handleInputChange = (e) => {
    const { name, value } = e.target; // get field name and new value

    // update only the field that changed keep other fields the same with spread operator
    setEditFormData({
      ...editFormData,
      [name]: value, //update the field that changed
    });
  };

  // function to handle saving updated user data
  const handleSaveEdit = async (e) => {
    e.preventDefault(); // prevents page refresh
    setUpdateError("");

    // basic validation to make sure all fields are filled in
    if (!editFormData.first_name || !editFormData.last_name || !editFormData.username ||
        !editFormData.email || !editFormData.status || !editFormData.birthdate ||
        !editFormData.city || !editFormData.state || !editFormData.zip_code) {
      setUpdateError("Please fill in all fields");
      return;
    }

    try {
      setUpdateLoading(true);
      // call API to update user data in prisma db
      const updatedUser = await userAPI.updateUser(userData.id, editFormData);

      // update local state with new data from db
      setUserData(updatedUser);
      setIsEditing(false);
      setEditFormData({});
    } catch (err) {
      console.error('Error updating user data:', err);
      setUpdateError(err.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  // loading message for user experience
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }
// if api call fails
  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1 className="dashboard-welcome">
          {/* changed from user?.user_metadataa?.first_name (supabase data) to using prisma db data, kept ? for optional chaining for error prevention */}
          Welcome, {userData?.first_name || "User"}!
        </h1>
        <p className="dashboard-subtitle">
          Your WiFind dashboard is ready for you to explore.
        </p>

        <div className="user-profile-section">
          <div className="profile-header">
            <h2>Your Profile Information</h2>
            {/* only show edit button when not in edit mode */}
            {!isEditing && (
              <button onClick={handleEditClick} className="edit-button">
                ✏️ Edit
              </button>
            )}
          </div>
            {/* show error message if profile update failed */}
          {updateError && <div className="error-message">{updateError}</div>}
            {/* show profile info when not editing and data exists */}
          {userData && !isEditing && (
            <div className="profile-details">
              <p><strong>Full Name:</strong> {userData.first_name} {userData.last_name}</p>
              <p><strong>Username:</strong> {userData.username}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Status:</strong> {userData.status}</p>
              <p><strong>Date of Birth:</strong> {new Date(userData.birthdate).toLocaleDateString()}</p>
              <p><strong>City:</strong> {userData.city}</p>
              <p><strong>State:</strong> {userData.state}</p>
              <p><strong>Zip Code:</strong> {userData.zip_code}</p>
              <p><strong>Member Since:</strong> {new Date(userData.created_at).toLocaleDateString()}</p>
            </div>
          )}
            {/* show edit form when in edit mode */}
          {isEditing && (
            <form onSubmit={handleSaveEdit} className="edit-form">
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name" // name attribute is used to identify the field in the form data
                  value={editFormData.first_name} // controlled input
                  onChange={handleInputChange} // updates state when user types in input
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={editFormData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={editFormData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            {/* status field uses dropdown */}
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={editFormData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select your status</option>
                  <option value="Job Seeker">Job Seeker</option>
                  <option value="Student">Student</option>
                  <option value="Community Supporter">Community Supporter</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="birthdate">Date of Birth</label>
                <input
                  type="date"
                  id="birthdate"
                  name="birthdate"
                  value={editFormData.birthdate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={editFormData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={editFormData.state}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="zip_code">Zip Code</label>
                <input
                  type="text"
                  id="zip_code"
                  name="zip_code"
                  value={editFormData.zip_code}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-buttons">
                <button
                  type="submit"
                  className="save-button"
                  disabled={updateLoading}
                >
                  {updateLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="cancel-button"
                  disabled={updateLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
