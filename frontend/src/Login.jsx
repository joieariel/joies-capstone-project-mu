import React, { useState } from "react";
import { supabase } from "./supabaseClient"; //import supabase client
import "./Login.css";

const Login = () => {
  // create state to store all form input values
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  //create state to track if currently loading (prevent double clicks)
  const [loading, setLoading] = useState(false);

  // state to store error messages
  const [error, setError] = useState("");

  // state to store success message
  const [success, setSuccess] = useState("");

  // this function runs whenever the user types in the input fields
  const handleInputChange = (e) => {
    // get the name and current value from the input that changed
    const { name, value } = e.target;

    // update formData by keeping all existing values, but update the field that changed name
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // function that runs when user hits login
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent from trad refresh

    // clear prev error and success messages
    setError("");
    setSuccess("");

    // show loading state
    setLoading(true);

    // basic validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      // call supabase to sign in user
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setError(error.message); // if error show error message
      } else {
        setSuccess("Login successful! Welcome back!");

        // clear form
        setFormData({
          email: "",
          password: "",
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
    <div className="login-container">
      <div className="login-form-wrapper">
        <h2 className="login-title">Log In</h2>
        <p className="login-subtitle">Welcome back to WiFind</p>
        {/* show error and success messages only if there is an error or success */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="login-form">
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

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading} // disable the button when loading to prevent double clicks
          >
            {/* based on loading state, show different text */}
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{" "}
            <a href="/signup" className="signup-link">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
