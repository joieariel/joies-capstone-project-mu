import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { userAPI } from "./api";
import { validateNewUser } from "./utils/validation"; // add new validation function from utils.js
import { US_STATES } from "./constants"; // add US states array from constants.js
import { fileToBase64, validateImageFile, DEFAULT_PROFILE_PIC, resizeImage } from "./utils/imageUtils"; // import image utils
import "./SignUp.css";

const SignUp = () => {
  // get auth functions and state from AuthContext instead of calling supabase directly
  const { signUp, loading } = useAuth();

  // hook to navigate to different routes after successful signup
  // will redirect user to login page after they create an account
  const navigate = useNavigate();

  // create state to store all form input vlues
  // added more values to the form to correspond to backend schema
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    status: "",
    birthdate: "",
    zipCode: "",
    city: "",
    state: "",
  });

  // state to store error messageas ( use this for auth errors from our context)
  const [error, setError] = useState("");

  // state to store success message
  const [success, setSuccess] = useState("");

  // states for profile picture
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [profilePicError, setProfilePicError] = useState("");

  // this function runs whenever the user types in the input fields
  const handleInputChange = (e) => {
    // get the name and current value from the input that changed
    const { name, value } = e.target;

    // update formData by keeping all exisiting values, but update the field that changed name
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // handle profile picture selection
  const handleProfilePicChange = async (e) => {
    // safety check - only proceed if a file was selected
    if (e.target.files && e.target.files[0]) {
      // get the selected file
      const file = e.target.files[0];

      // validate the image file with the helper function from imageUtils.js
      const validationError = validateImageFile(file);
      if (validationError) {
        setProfilePicError(validationError);
        return;
      }

      try {
        // first, resize the image to reduce its size to prevent issues with large images
        const resizedFile = await resizeImage(file, 300, 300, 0.7);

        // convert file to base64 string using the helper function from imageUtils.js
        const base64 = await fileToBase64(resizedFile);
        // set the profile pic
        setProfilePic(base64);
        // set the preview image
        setProfilePicPreview(base64);
        setProfilePicError(""); // clear error message
      } catch (error) {
        console.error("Error processing image:", error);
        setProfilePicError("Failed to process the image. Please try another one.");
      }
    }
  };

  // remove profile picture
  const handleRemoveProfilePic = () => {
    setProfilePic(null);
    setProfilePicPreview(null);
    setProfilePicError("");
  };

  // function that runs when user hits create account
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent from trad refresh

    // clear prev error and success messages
    setError("");
    setSuccess("");

    // basic validation - check if user filled in all required fields
    // now call validation function from utils.js
    const validationError = validateNewUser(formData);
    // check if there are errors
    if (validationError) {
      setError(validationError);
      return;
    }

    // password length validation
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    // validating if passwords match - do this before calling auth function
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return; // exit function early
    }

    try {
      // 1. create supabase auth user
      const { data: authData, error: authError } = await signUp(
        formData.email,
        formData.password,
        {
          // additional user data that gets stored in supabase user metadata
          first_name: formData.firstName,
          last_name: formData.lastName,
        }
      );

      // check if supabase signup was successful
      if (authError) {
        setError(authError);
        return;
      }

      // 2: create database user record with supabase user ID
      if (authData?.user) {
        const databaseUserData = {
          supabase_user_id: authData.user.id, // link to Supabase auth user
          profile_pic: profilePic || DEFAULT_PROFILE_PIC, // use the default img if none provided
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          email: formData.email,
          status: formData.status,
          birthdate: formData.birthdate,
          zip_code: formData.zipCode,
          city: formData.city,
          state: formData.state,
        };

        // Create user in database
        await userAPI.createUser(databaseUserData);
      }

      setSuccess(
        "Account created successfully! Please check your email to verify your account."
      );

      // clear the form fields after successful signup
      setFormData({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        status: "",
        birthdate: "",
        zipCode: "",
        city: "",
        state: "",
      });

      // redirect user to login page after successful signup
      setTimeout(() => {
        navigate("/login");
      }, 2000); // wait 2 seconds to show success message, then redirect
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message || "Failed to create account. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form-wrapper">
        <h2 className="signup-title">Sign Up</h2>
        <p className="signup-subtitle">Create your WiFind account</p>
        {/* show error and success messages only if there is an error or success */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="signup-form">
          {/* profile pic section (optional) */}
          <div className="form-group">
            <label htmlFor="profilePic" className="form-label">
              Profile Picture (Optional)
            </label>
            <div className="profile-pic-container">
              {profilePicPreview && (
                <div className="profile-pic-preview-container">
                  <img
                    src={profilePicPreview}
                    alt="Profile Preview"
                    className="profile-pic-preview"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveProfilePic}
                    className="remove-pic-button"
                  >
                    Remove
                  </button>
                </div>
              )}
              {!profilePicPreview && (
                <div className="file-input-container">
                  <label htmlFor="profilePic" className="custom-file-input">
                    Choose Profile Picture
                  </label>
                  <input
                    type="file"
                    id="profilePic"
                    name="profilePic"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    className="hidden-file-input"
                  />
                </div>
              )}
              {profilePicError && (
                <div className="profile-pic-error">{profilePicError}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="firstName" className="form-label">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName" className="form-label">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="status" className="form-label">
              Occupation Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">Select your status</option>
              <option value="Job Seeker">Job Seeker</option>
              <option value="Student">Student</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="birthdate" className="form-label">
              Date of Birth
            </label>
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="zipCode" className="form-label">
              Zip Code
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="city" className="form-label">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="state" className="form-label">
              State
            </label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className="form-input"
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

          <button
            type="submit"
            className="signup-submit-btn"
            disabled={loading} // disable the button when loading to prevent double clicks
          >
            {/* based on loading state, show different text */}
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="signup-footer">
          <p>
            Already have an account?{" "}
            <a href="/login" className="login-link">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
