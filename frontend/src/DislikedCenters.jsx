import { useState, useEffect } from "react";
import { dislikesAPI } from "./api"; // import API functions for dislikes
import CenterCard from "./CenterCard"; // reuse the CenterCard component
import "./LikedCenters.css"; // reuse the same CSS for now

// component to display the user's disliked community centers for testing purposes
const DislikedCenters = () => {
  // state to store disliked centers data
  const [dislikedCenters, setDislikedCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // fetch disliked centers when component mounts
  useEffect(() => {
    const fetchDislikedCenters = async () => {
      try {
        setLoading(true);
        // call api to get user's disliked centers
        const data = await dislikesAPI.getUserDislikes();
        // extract center data from the api response
        const centers = data.map((dislike) => dislike.center);
        setDislikedCenters(centers); // store fetched data in state
      } catch (err) {
        console.error("Error fetching disliked centers:", err);
        setError("Failed to load your disliked centers");
      } finally {
        setLoading(false);
      }
    };

    fetchDislikedCenters();
  }, []); // runs once when component mounts

  return (
    <div className="liked-centers-container">
      {/* section title */}
      <h2 className="liked-centers-title">Your Disliked Centers (Testing)</h2>

      {/* show loading message while fetching data */}
      {loading && (
        <div className="liked-centers-loading">
          <p>Loading your disliked centers...</p>
        </div>
      )}

      {/* show error message if an error occurs */}
      {error && (
        <div className="liked-centers-error">
          <p>Error: {error}</p>
        </div>
      )}

      {/* show message when user hasn't disliked any centers */}
      {!loading && !error && dislikedCenters.length === 0 && (
        <div className="liked-centers-empty">
          <p>You haven't disliked any community centers yet.</p>
        </div>
      )}

      {/* display horizontally scrollable list of disliked centers when available */}
      {!loading && !error && dislikedCenters.length > 0 && (
        <div className="liked-centers-scroll">
          {/* map through each center and render a CenterCard component */}
          {dislikedCenters.map((center) => (
            <div key={center.id} className="liked-center-item">
              <CenterCard
                key={center.id}
                center={center}
                showSimilarButton={false} // hide similar centers button in dashboard view
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DislikedCenters;
