import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { likesAPI, dislikesAPI, pageInteractionsAPI } from "./api";

// reusable component for displaying a community center card
// accepts center data and optional props for customization
const CenterCard = ({
  center,
  onSimilarCentersClick,
  showSimilarButton = true,
  onModalClose = null,
}) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  // check if the center is liked/disliked when component mounts
  useEffect(() => {
    const checkInteractionStatus = async () => {
      try {
        // check like status
        const likeResponse = await likesAPI.checkLikeStatus(center.id);
        setIsLiked(likeResponse.liked);

        // check dislike status
        const dislikeResponse = await dislikesAPI.checkDislikeStatus(center.id);
        setIsDisliked(dislikeResponse.disliked);
      } catch (error) {
        console.error("Error checking interaction status:", error);
      }
    };

    checkInteractionStatus();
  }, [center.id]);

  // handle like/unlike with api connection
  const handleLikeClick = async (e) => {
    e.stopPropagation();

    setIsLiked(!isLiked);

    // if disliked and user clicks like, remove dislike
    if (isDisliked) {
      setIsDisliked(false);
      try {
        await dislikesAPI.removeDislike(center.id);
      } catch (error) {
        console.error("Error removing dislike:", error);
      }
    }

    try {
      // make api call in the background
      if (!isLiked) {
        await likesAPI.addLike(center.id);
      } else {
        await likesAPI.removeLike(center.id);
      }
    } catch (error) {
      // if API call fails, revert the UI change
      console.error("Error toggling like:", error);
      setIsLiked(!isLiked);
    }
  };

  // handle dislike with api connection
  const handleDislikeClick = async (e) => {
    e.stopPropagation();

    setIsDisliked(!isDisliked);

    // if liked and user clicks dislike, remove like
    if (isLiked) {
      setIsLiked(false);
      try {
        await likesAPI.removeLike(center.id);
      } catch (error) {
        console.error("Error removing like:", error);
      }
    }

    try {
      if (!isDisliked) {
        await dislikesAPI.addDislike(center.id);
      } else {
        await dislikesAPI.removeDislike(center.id);
      }
    } catch (error) {
      console.error("Error toggling dislike:", error);
      setIsDisliked(!isDisliked);
    }
  };

  // when user clicks reviews button, show the reviews for that specific center
  const handleReviewsClick = async (centerId) => {
    // if we're in a modal, close it first
    if (onModalClose) {
      onModalClose();
    }

    // track the review button click from the main community center page
    try {3
      // only track clicks from the main community center page
      //  can identify this by checking if showSimilarButton is true
      if (showSimilarButton === true) {
        await pageInteractionsAPI.recordPageInteraction(centerId, {
          review_clicks: 1,
        });
      }
    } catch (error) {
      // log error but don't block navigation
      console.error("Error tracking review click:", error);
    }

    // navigate to reviews page
    navigate(`/reviews/${centerId}`);
  };

  // when user clicks map button, show the map view for that specific center
  const handleMapClick = (centerId) => {
    // if we're in a modal, close it first
    if (onModalClose) {
      onModalClose();
    }
    // navigate to map page
    navigate(`/map/${centerId}`);
  };

  return (
    <div className="center-card">
      <img src={center.image_url} alt={center.name} className="center-image" />
      <div className="center-info">
        <div className="center-name-container">
          <h3 className="center-name">{center.name}</h3>
          <div className="reaction-buttons">
            <span
              // like button
              className={`heart-icon ${isLiked ? "liked" : ""}`}
              onClick={handleLikeClick}
              title={isLiked ? "Unlike" : "Like"}
            >
              ❤︎
            </span>
            <span
              // dislike button
              className={`thumbs-down-icon ${isDisliked ? "disliked" : ""}`}
              onClick={handleDislikeClick}
              title={isDisliked ? "Remove dislike" : "Dislike"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={isDisliked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 14V2M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
              </svg>
            </span>
          </div>
        </div>
        <p className="center-address">{center.address}</p>
        <p className="center-phone">{center.phone_number}</p>
        <p className="center-description">{center.description}</p>

        {/* only show email and zip in main view, not in modal */}
        {!onModalClose && (
          <>
            <p className="center-email">
              <strong>Email:</strong> {center.email}
            </p>
            <p className="center-zip">
              <strong>Zip Code:</strong> {center.zip_code}
            </p>
          </>
        )}

        {/* enhanced information display */}
        <div className="center-enhanced-info">
          {/* distance (if available) */}
          {center.distance !== null && (
            <p className="center-distance">
              <span className="info-label">Distance:</span> {center.distance}{" "}
              miles
            </p>
          )}

          {/* rating and review count */}
          <div className="center-rating-container">
            {center.avgRating !== null ? (
              <>
                <div className="center-rating">
                  <span className="info-label">Rating:</span>{" "}
                  {center.avgRating.toFixed(1)}
                  <span className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${
                          star <= Math.round(center.avgRating)
                            ? "filled"
                            : "empty"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </span>
                </div>
                <span className="review-count">
                  ({center.reviewCount}{" "}
                  {center.reviewCount === 1 ? "review" : "reviews"})
                </span>
              </>
            ) : (
              <span className="no-ratings">No ratings yet</span>
            )}
          </div>

          {/* hours (open/closed status) */}
          <p className={`center-hours ${center.isOpen ? "open" : "closed"}`}>
            <span className="status-indicator"></span>
            {center.hoursMessage}
          </p>

          {/* tags */}
          {center.tags && center.tags.length > 0 && (
            <div className="center-tags">
              <span className="info-label">Tags:</span>
              <div className="tags-container">
                {center.tags.map((tag) => (
                  <span key={tag.id} className="center-tag">
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="center-buttons">
          <button
            className="reviews-button"
            onClick={() => handleReviewsClick(center.id)}
          >
            Reviews
          </button>
          <button
            className="map-button"
            onClick={() => handleMapClick(center.id)}
          >
            Map
          </button>
          {showSimilarButton && (
            <button
              className="similar-centers-button"
              onClick={() => onSimilarCentersClick(center.id)}
            >
              Similar Centers
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CenterCard;
