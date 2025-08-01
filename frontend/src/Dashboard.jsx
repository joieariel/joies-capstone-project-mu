import React, { useState, useEffect, useRef } from "react"; // added useRef to create a reference to the file input
import { useAuth } from "./AuthContext";
import { userAPI } from "./api"; // to make calls to backend
import { validateEditForm } from "./utils/validation"; // import new validate function from utils
import { validateImageFile, resizeImage, fileToBase64, DEFAULT_PROFILE_PIC } from "./utils/imageUtils"; // import image utilities
import LikedCenters from "./LikedCenters";
import UserRecommendations from "./UserRecommendations";
import { US_STATES } from "./constants"; // to use us states array in edit mode
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
        console.error("Error fetching user data:", err);
        setError("Failed to load user data");
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
      profile_pic: userData.profile_pic, // keep profile pic the same
      first_name: userData.first_name,
      last_name: userData.last_name,
      username: userData.username,
      email: userData.email,
      status: userData.status,
      birthdate: userData.birthdate.split("T")[0], // format date for input field
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

  // create a ref object with an value of null to store the file input element
  const fileInputRef = useRef(null);

  // function to handle form input changes (runs when user types in any form field)
  const handleInputChange = (e) => {
    const { name, value } = e.target; // get field name and new value

    // update only the field that changed keep other fields the same with spread operator
    setEditFormData({
      ...editFormData,
      [name]: value, //update the field that changed
    });
  };

  // function to handle profile picture file selection
  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // validate the image file
    const errorMessage = validateImageFile(file);
    if (errorMessage) {
      setUpdateError(errorMessage);
      return;
    }

    try {
      // resize the image to optimize file size
      const resizedFile = await resizeImage(file);

      // convert the resized image to base64 for storage
      const base64Image = await fileToBase64(resizedFile);

      // update the form data with the new image
      setEditFormData({
        ...editFormData,
        profile_pic: base64Image,
      });
    } catch (err) {
      console.error("Error processing image:", err);
      setUpdateError("Failed to process the image. Please try again.");
    }
  };

  // function to trigger the hidden file input
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // function to remove profile picture and use default
  const handleRemoveProfilePicture = () => {
    setEditFormData({
      ...editFormData,
      profile_pic: DEFAULT_PROFILE_PIC,
    });
  };

  // function to handle saving updated user data
  const handleSaveEdit = async (e) => {
    e.preventDefault(); // prevents page refresh
    setUpdateError("");

    // basic validation to make sure all fields are filled in
    // now call new validation function from utils
    const validationError = validateEditForm(editFormData);
    // check if validation function returned an error message
    if (validationError) {
      // set the error message in state
      setUpdateError(validationError);
      return; // stop form submission if theres's an error
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
      console.error("Error updating user data:", err);
      setUpdateError(err.message || "Failed to update profile");
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
          </div>
          {/* show error message if profile update failed */}
          {updateError && <div className="error-message">{updateError}</div>}
          {/* show profile info when not editing and data exists */}
          {userData && !isEditing && (
            <div className="profile-details">
              <p>
                <strong>Profile Picture:</strong> <br />
                <img className="profile-pic" src={userData.profile_pic} alt="profile picture" />
              </p>
              <p>
                <strong>Full Name:</strong> {userData.first_name}{" "}
                {userData.last_name}
              </p>
              <p>
                <strong>Username:</strong> {userData.username}
              </p>
              <p>
                <strong>Email:</strong> {userData.email}
              </p>
              <p>
                <strong>Status:</strong> {userData.status}
              </p>
              <p>
                <strong>Date of Birth:</strong>{" "}
                {/* display the date in UTC timezone to prevent any local timezone conversion */}
                {new Date(userData.birthdate).toLocaleDateString("en-US", {
                  timeZone: "UTC",
                })}
              </p>
              <p>
                <strong>City:</strong> {userData.city}
              </p>
              <p>
                <strong>State:</strong> {userData.state}
              </p>
              <p>
                <strong>Zip Code:</strong> {userData.zip_code}
              </p>
              <p>
                <strong>Member Since:</strong>{" "}
                {new Date(userData.created_at).toLocaleDateString()}
              </p>
              {/* only show edit button when not in edit mode */}
              {!isEditing && (
                <button onClick={handleEditClick} className="edit-button">
                  ✏️ Edit Your Information
                </button>
              )}
            </div>
          )}
          {/* show edit form when in edit mode */}
          {isEditing && (
            <form onSubmit={handleSaveEdit} className="edit-form">
              <div className="form-group profile-pic-container">
                <label htmlFor="profile_pic">Profile Picture</label>
                <img id="profile-picture" src={editFormData.profile_pic} alt="profile picture" />

                {/* hidden file input */}
                <input
                  type="file"
                  id="profile_pic_input"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleProfilePictureChange}
                  style={{ display: 'none' }} // makes the input invisible
                />

                {/* profile picture action buttons */}
                <div className="profile-pic-actions">
                  <button
                    type="button"
                    className="change-pic-button"
                    onClick={triggerFileInput}
                  >
                    Change Profile Picture
                  </button>

                  {/* only show remove button if not using default picture */}
                  {editFormData.profile_pic !== DEFAULT_PROFILE_PIC && (
                    <button
                      type="button"
                      className="remove-pic-button"
                      onClick={handleRemoveProfilePicture}
                    >
                      Remove Picture
                    </button>
                  )}
                </div>
              </div>
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
                <select
                  id="state"
                  name="state"
                  value={editFormData.state}
                  onChange={handleInputChange}
                  required
                  >
                  <option value="">Select your state</option>
                  {US_STATES.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
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

        {/* Add the UserRecommendations component at the top */}
        <UserRecommendations />

        {/* add the LikedCenters component */}
        <LikedCenters />

      </div>
    </div>
  );
};

export default Dashboard;
