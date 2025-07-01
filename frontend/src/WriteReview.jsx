import React, { useState } from "react";
import "./WriteReview.css";
import { reviewAPI } from "./api";

const WriteReview = ({ centerId, onCancel, onSuccess }) => {
  // state for star rating intial calue 0
  const [rating, setRating] = useState(0);
  // state for hover tracking (0 means no hover)
  const [hoverRating, setHoverRating] = useState(0);
  // state for loading and error handling
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  // state for input text for review (initalized as empty string)
  const [reviewText, setReviewText] = useState("");

  // handle star click
  const handleStarClick = (starValue) => {
    setRating(starValue);
  };

  // handle star hover
  const handleStarHover = (starValue) => {
    setHoverRating(starValue);
  };

  // handle mouse leave from stars
  const handleStarLeave = () => {
    setHoverRating(0);
  };

  // handle comment text change when user types in textarea
  const handleCommentChange = (e) => {
    setReviewText(e.target.value);
  };

  // handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // validate rating is selected
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    // validate review text is not empty and has minimum length
    // trim() removes leading and trailing whitespace
    if (!reviewText.trim()) {
      // if review text is empty, show error message
      setError("Please write a review comment");
      return;
    }
    // make sure review text is at least 10 characters long to prevent bad/unhelpful reviews
    if (reviewText.trim().length < 10) {
      setError("Review comment must be at least 10 characters long");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await reviewAPI.createReview({
        rating,
        center_id: centerId,
        comment: reviewText.trim() // send the actual review text instead of empty string
      });

      // call success callback to close and refresh reviews
      onSuccess();
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // render individual star
  const renderStar = (starNumber) => {
    const isFilled = starNumber <= (hoverRating || rating);

    return (
      <span
        key={starNumber}
        className={`star ${isFilled ? 'filled' : 'empty'}`}
        onClick={() => handleStarClick(starNumber)}
        onMouseEnter={() => handleStarHover(starNumber)}
        onMouseLeave={handleStarLeave}
      >
        ★
      </span>
    );
  };

  return (
    <div className="write-review-content">
      <h3 className="write-review-title">Write Your Review</h3>

      <form className="review-form" onSubmit={handleSubmit}>
        {/* star rating section */}
        <div className="rating-section">
          <label className="rating-label">Rating *</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map(renderStar)}
          </div>
          {rating > 0 && (
            <div className="rating-text">
              You rated: {rating} out of 5 stars
            </div>
          )}
        </div>

        {/* comment section - textbox for user to write their review */}
        <div className="comment-section">
          <label className="comment-label">Your Review *</label>
          <textarea
            className="comment-textbox"
            placeholder="Share your experience at this community center..."
            rows={4}
            value={reviewText}
            onChange={handleCommentChange}
          />
        </div>

        {/* error message */}
        {error && (
          <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* form buttons */}
        <div className="form-buttons">
          <button type="button" className="cancel-button" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
          {/*  button is disabled if user hasnt rated, review textbox is empty, form is being submitted to the server  */}
          <button type="submit" className="submit-button" disabled={rating === 0 || !reviewText.trim() || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WriteReview;
