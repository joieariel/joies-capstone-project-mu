import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { likesAPI } from "./api";
import { useAuth } from "./AuthContext";

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
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // check if the center is liked when component mounts
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await likesAPI.checkLikeStatus(center.id);
        setIsLiked(response.liked);
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };

    checkLikeStatus();
  }, [center.id, isAuthenticated]);

  // handle like/unlike with api connection
  const handleLikeClick = async (e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      // redirect to login if not authenticated
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    try {
      setIsLoading(true);

      if (isLiked) {
        await likesAPI.removeLike(center.id);
      } else {
        await likesAPI.addLike(center.id);
      }

      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // when user clicks reviews button, show the reviews for that specific center
  const handleReviewsClick = (centerId) => {
    // if we're in a modal, close it first
    if (onModalClose) {
      onModalClose();
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
          <span
          // like button
            className={`heart-icon ${isLiked ? 'liked' : ''} ${isLoading ? 'loading' : ''}`}
            onClick={handleLikeClick}
            title={isAuthenticated ? (isLiked ? "Unlike" : "Like") : "Login to like"}
          >
            {isLoading ? "..." : "❤︎"}
          </span>
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
