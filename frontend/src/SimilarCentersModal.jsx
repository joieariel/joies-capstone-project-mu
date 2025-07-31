import { useState, useEffect } from "react";
import { communityAPI } from "./api"; // to access recommendation api endpoint
import "./SimilarCentersModal.css";
import CenterCard from "./CenterCard";
import LoadingSpinner from "./LoadingSpinner";

// component to display similar community centers accepts:
//  takes in id of center to find similar centers of, isOpen bool to control modal visbility, onClose to close modal
const SimilarCentersModal = ({ centerId, isOpen, onClose }) => {
  // state to store similar centers
  const [similarCenters, setSimilarCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // use useEffect to fetch similar centers when the modal opens
  useEffect(() => {
    const fetchSimilarCenters = async () => {
      if (!isOpen || !centerId) return; // early return if modal is not open or no center id provided

      try {
        setLoading(true);
        // call the api to get similar centers - using 6 for a 3x2 grid (more even layout)
        const data = await communityAPI.getRecommendationsForCenter(
          centerId,
          6 // limit to 6 similar centers (2 rows of 3)
        );

        // add artificial delay to see the loading spinner (500ms)
        await new Promise((resolve) => setTimeout(resolve, 500));

        setSimilarCenters(data); // update state with similar centers
      } catch (err) {
        console.error("Error fetching similar centers:", err);
        setError("Failed to load similar centers");
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarCenters();
  }, [isOpen, centerId]); // only fetch similar centers when the modal opens or centerid changes

  // if the modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Similar Community Centers</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          {loading ? (
            <LoadingSpinner size="medium" text="Loading similar centers..." />
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : similarCenters.length === 0 ? (
            <p>No similar centers found.</p>
          ) : (
            <div className="similar-centers-grid">
              {similarCenters.map((center) => (
                <CenterCard
                  key={center.id}
                  center={center}
                  showSimilarButton={false}
                  onModalClose={onClose}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimilarCentersModal;
