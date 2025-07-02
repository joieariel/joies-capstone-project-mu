import React, { useState, useEffect } from "react";
// Import useParams hook to read URL parameters so we can extract centerId from url path
import { useParams, useNavigate } from "react-router-dom";
// import api functions to fetch reviews and community center info from backend
import { reviewAPI, communityAPI, userAPI, tagAPI } from "./api"; // added import userAPI to fetch current user data from db
// added tagAPI to fetch popular tags
import {
  renderStars,
  formatDate,
  calculateAverageRating,
} from "./utils/util.jsx";
import { useAuth } from "./AuthContext"; //. get auth state and current user
import WriteReview from "./WriteReview";
import EditReviewForm from "./EditReviewForm"; // for inline editing of reviews
import "./Reviews.css";

const Reviews = () => {
  // Extract centerId from URL parameters using useParams hook
  // When URL is /reviews/5, this will give us { centerId: "5" }
  // Note: URL params are always strings, so we'll need to convert to number when making API calls
  const { centerId } = useParams();
  const navigate = useNavigate();

  // get current user from auth context
  const { isAuthenticated } = useAuth();

  // state to store the reviews fetched from the backend
  const [reviews, setReviews] = useState([]);
  // state to store the community center information
  const [center, setCenter] = useState(null);
  // state to store current user's database record (will need to compare with review authors)
  const [currentUser, setCurrentUser] = useState(null);
  // state to store popular tags for this center
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // state to control showing/hiding the write review form
  const [showWriteReviewForm, setShowWriteReviewForm] = useState(false);
  // state to track which review is being edited
  const [editingReview, setEditingReview] = useState(null);

  // useEffect to fetch current user's data in db when they log in
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (isAuthenticated) {
        try {
          // call backend api to fetch current user's data using their jwt token
          const userData = await userAPI.getCurrentUser();
          setCurrentUser(userData);
        } catch (err) {
          console.error("Error fetching current user:", err);
        }
      }
    };

    fetchCurrentUser();
  }, [isAuthenticated]); // rerun when auth state changes

  // useEffect to fetch both center info and reviews when component mounts or centerId changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch center information, reviews, and popular tags in parallel for better performance
        const [centerData, reviewsData, popularTagsData] = await Promise.all([
          communityAPI.getCenterById(centerId),
          reviewAPI.getReviewsByCenter(centerId),
          tagAPI.getPopularCenterTags(centerId, 5), // get top 5 popular tags
        ]);

        // store the fetched data in state, will trigger a re-render
        setCenter(centerData);
        setReviews(reviewsData);
        setPopularTags(popularTagsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          "Failed to load center information and reviews. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    // only fetch data if we have a centerId from the URL
    if (centerId) {
      fetchData();
    }
  }, [centerId]); // re-run effect if centerId changes (user navigates to different center)

  // helper function to check if current user owns the review
  const isReviewOwner = (review) => {
    return currentUser && review.user.id === currentUser.id;
  };

  // function to handle review deletion
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await reviewAPI.deleteReview(reviewId);
        // refresh both reviews list and popular tags after deletion
        const [reviewsData, popularTagsData] = await Promise.all([
          reviewAPI.getReviewsByCenter(centerId),
          tagAPI.getPopularCenterTags(centerId, 5),
        ]);
        setReviews(reviewsData);
        setPopularTags(popularTagsData);
      } catch (err) {
        console.error("Error deleting review:", err);
        alert("Failed to delete review. Please try again.");
      }
    }
  };

  // function to handle review editing
  const handleEditReview = (review) => {
    setEditingReview(review);
  };

  //  handle review update
  const handleUpdateReview = async (reviewId, updatedData) => {
    try {
      await reviewAPI.updateReview(reviewId, updatedData);
      setEditingReview(null);
      // refresh both reviews list and popular tags after update
      const [reviewsData, popularTagsData] = await Promise.all([
        reviewAPI.getReviewsByCenter(centerId),
        tagAPI.getPopularCenterTags(centerId, 5),
      ]);
      setReviews(reviewsData);
      setPopularTags(popularTagsData);
    } catch (err) {
      console.error("Error updating review:", err);
      alert("Failed to update review. Please try again.");
    }
  };

  //fucntion to handle if user wants to cancel editing without saving changes
  const handleCancelEdit = () => {
    setEditingReview(null);
  };

  // function to handle back button click
  const handleBackClick = () => {
    navigate("/community-centers");
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
        {/* back button */}
        <div className="back-container">
          <button className="back-button" onClick={handleBackClick}>
            Back to Community Centers
          </button>
        </div>

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
                      {renderStars(
                        Math.round(parseFloat(calculateAverageRating(reviews)))
                      )}
                      <span className="average-rating-number">
                        {calculateAverageRating(reviews)} out of 5
                      </span>
                    </div>
                    <div className="total-reviews">
                      Based on {reviews.length}{" "}
                      {reviews.length === 1 ? "review" : "reviews"}
                    </div>
                  </>
                ) : (
                  <div className="no-rating">
                    <span className="no-rating-text">No ratings yet</span>
                  </div>
                )}
              </div>

              {/* popular tags section - only show if tags exist*/}
              {popularTags.length > 0 && (
                <div className="center-popular-tags">
                  <div className="popular-tags-title">Associated Tags:</div>
                  <div className="popular-tags-list">
                    {popularTags.map((tag) => (
                      <span key={tag.id} className="popular-tag">
                        {tag.name}
                        <span className="tag-count">({tag.usage_count})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="reviews-section-header">
          <h2 className="reviews-section-title">Reviews</h2>
          <button
            className="write-review-button"
            onClick={() => setShowWriteReviewForm(!showWriteReviewForm)}
          >
            + Write a Review
          </button>
        </div>

        {/* write review form */}
        {showWriteReviewForm && (
          <div className="write-review-form-container">
            <WriteReview
              centerId={centerId}
              // on cancel or success, hide the form
              onCancel={() => setShowWriteReviewForm(false)}
              onSuccess={async () => {
                setShowWriteReviewForm(false);
                // refresh both reviews list and popular tags after successful submission
                try {
                  const [reviewsData, popularTagsData] = await Promise.all([
                    reviewAPI.getReviewsByCenter(centerId),
                    tagAPI.getPopularCenterTags(centerId, 5),
                  ]);
                  setReviews(reviewsData);
                  setPopularTags(popularTagsData);
                } catch (err) {
                  console.error("Error refreshing data:", err);
                }
              }}
            />
          </div>
        )}

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

                {/* show edit form or show review content */}
                {editingReview && editingReview.id === review.id ? (
                  // add show edit form, when editingReview is true (review is being edited)
                  <EditReviewForm
                    review={review}
                    onSave={handleUpdateReview}
                    onCancel={handleCancelEdit}
                  />
                ) : (
                  <>
                    {/* review comment text */}
                    <div className="review-comment">
                      <p>{review.comment}</p>
                    </div>

                    {/* display review tags if they exist */}
                    {review.reviewTags && review.reviewTags.length > 0 && (
                      <div className="review-tags">
                        {/* render each tag */}
                        {review.reviewTags.map((reviewTag) => (
                          <span key={reviewTag.id} className="review-tag">
                            {reviewTag.tag.name}
                          </span>
                        ))}
                      </div>
                    )}

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

                    {/* edit/delete buttons for review owner only */}
                    {isReviewOwner(review) && (
                      <div className="review-actions">
                        <button
                          className="edit-review-button"
                          onClick={() => handleEditReview(review)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-review-button"
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
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
