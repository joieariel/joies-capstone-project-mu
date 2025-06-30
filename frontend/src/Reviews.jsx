import React, { useState, useEffect } from "react";
// Import useParams hook to read URL parameters so we can extract centerId from url path
import { useParams } from "react-router-dom";
// import api functions to fetch reviews and community center info from backend
import { reviewAPI, communityAPI } from "./api";
import "./Reviews.css";

const Reviews = () => {
  // Extract centerId from URL parameters using useParams hook
  // When URL is /reviews/5, this will give us { centerId: "5" }
  // Note: URL params are always strings, so we'll need to convert to number when making API calls
  const { centerId } = useParams();

  // state to store the reviews fetched from the backend
  const [reviews, setReviews] = useState([]);
  // state to store the community center information
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // useEffect to fetch both center info and reviews when component mounts or centerId changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch both center information and reviews in parallel for better performance
        const [centerData, reviewsData] = await Promise.all([
          communityAPI.getCenterById(centerId),
          reviewAPI.getReviewsByCenter(centerId)
        ]);

        // store the fetched data in state, will trigger a re-render
        setCenter(centerData);
        setReviews(reviewsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load center information and reviews. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // only fetch data if we have a centerId from the URL
    if (centerId) {
      fetchData();
    }
  }, [centerId]); // re-run effect if centerId changes (user navigates to different center)

  // function to render star rating display
  const renderStars = (rating) => {
    // create array of 5 elements to represent 5 possible stars
    return Array.from({ length: 5 }, (_, index) => (
      // use unicode for star character and add filled class if index is less than rating
      <span
        key={index}
        className={`star ${index < rating ? "filled" : "empty"}`}
      >
        ★
      </span>
    ));
  };

  // function to format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // function to calculate average rating from reviews
  const calculateAverageRating = (reviewsArray) => {
    if (!reviewsArray || reviewsArray.length === 0) return 0;

    const totalRating = reviewsArray.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviewsArray.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="reviews-container">
        <div className="reviews-content">
          <h1 className="reviews-title">Reviews</h1>
          <div className="loading-message">Loading reviews...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reviews-container">
        <div className="reviews-content">
          <h1 className="reviews-title">Reviews</h1>
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-container">
      <div className="reviews-content">
        {/* community center header Section */}
        {center && (
          <div className="center-header">
            <div className="center-header-image">
              <img
                src={center.image_url}
                alt={center.name}
                className="center-image-large"
              />
            </div>
            <div className="center-header-info">
              <h1 className="center-name-large">{center.name}</h1>
              <div className="center-location">
                <p>{center.address}</p>
                <p>{center.phone_number}</p>
              </div>
              <div className="center-rating-summary">
                {reviews.length > 0 ? (
                  <>
                    <div className="average-rating">
                      {renderStars(Math.round(parseFloat(calculateAverageRating(reviews))))}
                      <span className="average-rating-number">
                        {calculateAverageRating(reviews)} out of 5
                      </span>
                    </div>
                    <div className="total-reviews">
                      Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                    </div>
                  </>
                ) : (
                  <div className="no-rating">
                    <span className="no-rating-text">No ratings yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <h2 className="reviews-section-title"> Reviews</h2>

        {/* display reviews or message if no reviews */}
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet for this community center.</p>
            <p>Be the first to leave a review!</p>
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                {/* review header with user info and date */}
                <div className="review-header">
                  <div className="reviewer-info">
                    <span className="reviewer-name">
                      {review.user.first_name} {review.user.last_name}
                    </span>
                    <span className="review-date">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  {/* star rating display */}
                  <div className="review-rating">
                    {renderStars(review.rating)}
                    <span className="rating-number">({review.rating}/5)</span>
                  </div>
                </div>

                {/* review comment text */}
                <div className="review-comment">
                  <p>{review.comment}</p>
                </div>

                {/* display review images if they exist */}
                {review.images && review.images.length > 0 && (
                  <div className="review-images">
                    {review.images.map((image) => (
                      <img
                        key={image.id}
                        src={image.image_url}
                        alt="Review"
                        className="review-image"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
