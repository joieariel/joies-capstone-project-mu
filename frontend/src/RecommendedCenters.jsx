import { useState, useEffect } from "react";
import { communityAPI } from "./api";
import CenterCard from "./CenterCard";
import LoadingSpinner from "./LoadingSpinner";
import "./RecommendedCenters.css";

const RecommendedCenters = ({ centerId }) => {
  // state to store the list of recommended centers
  const [recommendedCenters, setRecommendedCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // useffect to fetch recommended centers when the component mounts or centerId changes
  useEffect(() => {
    // fetche recommended centers from the api
    const fetchRecommendedCenters = async () => {
      try {
        setLoading(true);
        setError("");

        // call api to get recommended centers based on the current center ID and it will return a list of centers descending order of similarity
        const data = await communityAPI.getRecommendationsForCenter(centerId);

        // add artificial delay to see the loading spinner (500ms)
        await new Promise((resolve) => setTimeout(resolve, 500));

        // update the state with the fetched recommendations
        setRecommendedCenters(data);
      } catch (err) {
        console.error("Error fetching recommended centers:", err);
        setError("Failed to load recommended centers");
      } finally {
        setLoading(false);
      }
    };

    // only fetch data if we have a valid centerId
    if (centerId) {
      fetchRecommendedCenters();
    }
  }, [centerId]); // re-run  effect if centerId changes

  // show loading state while fetching recommendations
  if (loading) {
    return (
      <div className="recommended-centers-container">
        <h2 className="recommended-centers-title">Recommended Centers</h2>
        <LoadingSpinner size="medium" text="Loading recommended centers..." />
      </div>
    );
  }

  // show error state if the fetch failed
  if (error) {
    return (
      <div className="recommended-centers-container">
        <h2 className="recommended-centers-title">Recommended Centers</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  // don't render anything if there are no recommendations to rpevent empty container
  if (recommendedCenters.length === 0) {
    return null;
  }

  // render the recommended centers in a horizontal scrollable container
  return (
    <div className="recommended-centers-container">
      <h2 className="recommended-centers-title">
        {" "}
        Similar Recommended Centers
      </h2>
      {/* horizontal scrollable container for center cards */}
      <div className="recommended-centers-scroll">
        {/* M,p through each recommended center and render a CenterCard */}
        {recommendedCenters.map((center) => (
          <div key={center.id} className="recommended-center-item">
            {/* use existing CenterCard component but hide the similar centers button*/}
            <CenterCard center={center} showSimilarButton={false} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedCenters;
