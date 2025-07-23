import { useState, useEffect } from "react";
import { likesAPI } from "./api"; // import API functions for likes
import CenterCard from "./CenterCard"; // reuse the CenterCard component
import "./LikedCenters.css";

// component to display the user's liked community centers in the dashboard
const LikedCenters = () => {
  // state to store liked centers data
  const [likedCenters, setLikedCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // fetch liked centers when component mounts
  useEffect(() => {
    const fetchLikedCenters = async () => {
      try {
        setLoading(true);
        // call api to get user's liked centers
        const data = await likesAPI.getUserLikes();
        // extract center data from the api response

        // backend returns enriched center data with all required properties (ratings, hours, tags)
        const centers = data.map((like) => like.center);
        setLikedCenters(centers); // store fetched data in state
      } catch (err) {
        console.error("Error fetching liked centers:", err);
        setError("Failed to load your liked centers");
      } finally {
        setLoading(false);
      }
    };

    fetchLikedCenters();
  }, []); // runs once when component mounts

  return (
    <div className="liked-centers-container">
      {/* section title */}
      <h2 className="liked-centers-title">Your Liked Centers</h2>

      {/* show loading message while fetching data */}
      {loading && (
        <div className="liked-centers-loading">
          <p>Loading your liked centers...</p>
        </div>
      )}

      {/* show error message if an error occurs */}
      {error && (
        <div className="liked-centers-error">
          <p>Error: {error}</p>
        </div>
      )}

      {/* show message when user hasn't liked any centers */}
      {!loading && !error && likedCenters.length === 0 && (
        <div className="liked-centers-empty">
          <p>You haven't liked any community centers yet.</p>
        </div>
      )}

      {/* display horizontally scrollable list of liked centers when available */}
      {!loading && !error && likedCenters.length > 0 && (
        <div className="liked-centers-scroll">
          {/* map through each center and render a CenterCard component */}
          {likedCenters.map((center) => (
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

export default LikedCenters;
