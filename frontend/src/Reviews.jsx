import React from "react";
// import useParams hook to read URL parameters so we can extract centerId from url path
import { useParams } from "react-router-dom";
import "./Reviews.css";

const Reviews = () => {
  // Extract centerId from URL parameters using useParams hook
  // When URL is /reviews/5, this will give us { centerId: "5" }
  // Note: URL params are always strings, so we'll need to convert to number when making API calls
  const { centerId } = useParams();

  return (
    <div className="reviews-container">
      <div className="reviews-content">
        {/* Display which center's reviews we're showing - helpful for debugging and user clarity */}
        <h1 className="reviews-title">Reviews for Center {centerId}</h1>
        {/* TODO: This is temporary - we'll replace this with actual review fetching and display */}
        <p>Showing reviews for community center ID: {centerId}</p>
      </div>
    </div>
  );
};

export default Reviews;
