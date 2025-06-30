// utility functions for frontend may  be used in other components

// function to render star rating display
export const renderStars = (rating) => {
    // create array of 5 elements to represent 5 possible stars
    return Array.from({ length: 5 }, (_, index) => (
      // use unicode for star character and add filled class if index is less than rating
      <span
        key={index}
        className={`star ${index < rating ? "filled" : "empty"}`}
      >
        ★
      </span>
    ));
  };

  // function to format date for display
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // function to calculate average rating from reviews
export const calculateAverageRating = (reviewsArray) => {
    if (!reviewsArray || reviewsArray.length === 0) return 0;

    const totalRating = reviewsArray.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    return (totalRating / reviewsArray.length).toFixed(1);
  };
