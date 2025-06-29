import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { communityAPI } from "./api"; // to get acces to communtiy center functions
import "./CommunityCenter.css";

const CommunityCenter = () => {
  // state to store list of centes from db, initialized as empty
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // when user clicks reviews button, show the reviews for that specific center
  // modified to accept centerId paramer so that centers reviews are displayed
  const handleReviewsClick = (centerId) => {
    // navigate to /reviews/[centerId] which creates a url like /reviews/5 for center ID 5
    // centerId becomes a url param that the Reviews component can read
    navigate(`/reviews/${centerId}`);
  };

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setLoading(true);
        // call the api to get all centers from prisma db
        const data = await communityAPI.getAllCenters();
        setCenters(data); // store fetched data in centers state triggers rerender and displays centers
      } catch (err) {
        console.error('Error fetching community centers:', err);
        setError('Failed to load community centers');
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, []); // only runs once when component mounts

  if (loading) {
    return (
      <div className="community-center-container">
        <div className="community-center-content">
          <h1 className="community-center-title">Find community centers near you</h1>
          <p>Loading community centers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="community-center-container">
        <div className="community-center-content">
          <h1 className="community-center-title">Find community centers near you</h1>
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="community-center-container">
      <div className="community-center-content">
        <h1 className="community-center-title">
          Find community centers near you
        </h1>
{/* loop through each communiy center in array and create one card for each center returned from db*/}
        <div className="centers-grid">
          {centers.map((center) => (
            // each card needs a unique key, center id
            <div key={center.id} className="center-card">
              <img
                src={center.image_url}
                alt={center.name}
                className="center-image"
              />
              <div className="center-info">
                <h3 className="center-name">{center.name}</h3>
                <p className="center-address">{center.address}</p>
                <p className="center-phone">{center.phone_number}</p>
                <p className="center-description">{center.description}</p>
                <p className="center-email">
                  <strong>Email:</strong> {center.email}
                </p>
                <p className="center-zip">
                  <strong>Zip Code:</strong> {center.zip_code}
                </p>
                <div className="center-buttons">
                  <button
                    className="reviews-button"
                    // Pass the center.id to the click handler - this is crucial because each card
                    // represents a different community center, and we need to know which one's reviews to show
                    // We use an arrow function to pass the center.id as an argument
                    onClick={() => handleReviewsClick(center.id)}
                  >
                    Reviews
                  </button>
                  <button className="map-button">
                    Map
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityCenter;
