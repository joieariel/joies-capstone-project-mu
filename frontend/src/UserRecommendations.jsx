import { useState, useEffect } from "react";
import { recommendationsAPI } from "./api"; // import api functions for recommendations
import CenterCard from "./CenterCard"; // reuse the CenterCard component
import "./UserRecommendations.css";

// component to display personalized recommendations for the user in the dashboard
const UserRecommendations = () => {
  // state to store recommended centers data
  const [recommendedCenters, setRecommendedCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fftch recommended centers when component mounts
  useEffect(() => {
    const fetchRecommendedCenters = async () => {
      try {
        setLoading(true);
        //call api to get user's personalized recommendations w/ a limit of 5
        const data = await recommendationsAPI.getUserRecommendations(5);
        setRecommendedCenters(data); // store fetched data in state

        // error handling
      } catch (err) {
        console.error("Error fetching recommended centers:", err);
        setError("Failed to load your personalized recommendations");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedCenters();
  }, []); // runs once when component mounts

  return (
    <div className="recommended-centers-container">
      {/* title of the recommendations sectoin */}
      <h2 className="recommended-centers-title">Recommended For You</h2>
      <p className="recommended-centers-subtitle">
        Based on your preferences and activity
      </p>

      {/* show loading message while fetching data */}
      {loading && (
        <div className="recommended-centers-loading">
          <p>Loading your recommendations...</p>
        </div>
      )}

      {/* show error message if an error occurs */}
      {error && (
        <div className="recommended-centers-error">
          <p>Error: {error}</p>
        </div>
      )}

      {/* show message when no recommendations are available */}
      {!loading && !error && recommendedCenters.length === 0 && (
        <div className="recommended-centers-empty">
          <p>
            We don't have enough data to make personalized recommendations yet.
            Try interacting with more community centers!
          </p>
        </div>
      )}

      {/* display horizontally scrollable list of recommended centers when available */}
      {!loading && !error && recommendedCenters.length > 0 && (
        <div className="recommended-centers-scroll">
          {/* loop through each center and render a CenterCard component */}
          {recommendedCenters.map((center) => (
            <div key={center.id} className="recommended-center-item">
              <CenterCard
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

export default UserRecommendations;
