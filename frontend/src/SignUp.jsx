import React, { useState } from "react";
import { supabase } from "./supabaseClient"; //import supabase client
import "./SignUp.css";

const SignUp = () => {
  // create state to store all form input vlues
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  //create state to track if currently loading (prevent double clicks)
  const [loading, setLoading] = useState(false);

  // state to store error messageas
  const [error, setError] = useState("");

  // state to store success message
  const [success, setSuccess] = useState("");

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

  // function that runs when user hits create account
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent from trad refresh

    // clear prev error and success messages
    setError("");
    setSuccess("");

    // show loading state
    setLoading(true);

    // validating if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return; // exit function early
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      // call supabase to create new user acc
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      });

      if (error) {
        setError(error.message); // if error show error message
      } else {
        setSuccess(
          "Account created successfully!"
        );

        // clear form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      // always runs whether error or success
      setLoading(false); // stop loading state
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
