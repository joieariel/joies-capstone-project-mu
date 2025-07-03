import React, { useState } from "react";
import "./EditReviewForm.css";
import TagSelector from "./TagSelector";

// this component receives a review object as a prop and allows the user to edit its rating, comment, and images
const EditReviewForm = ({ review, onSave, onCancel }) => {
  // state for star rating, but initialize rating state with current review's rating (prepopuulate the star rating)
  const [rating, setRating] = useState(review.rating);
  // state for comment, but initialize comment state with current review's comment
  const [comment, setComment] = useState(review.comment);
  //extract image urls from img array, if no images initialize to empty array (allow editing of exisiting images)
  const [imageUrls, setImageUrls] = useState(
    review.images ? review.images.map((img) => img.image_url) : []
  );
  // temp state for adding new imgs, stores url being type before its added to array
  const [newImageUrl, setNewImageUrl] = useState("");
  // loading state for submit button
  const [isSubmitting, setIsSubmitting] = useState(false);

  // state to manage which tags are selected
  // initialize with existing tags from reviewTags relationship
  const [selectedTags, setSelectedTags] = useState(
    review.reviewTags ? review.reviewTags.map((reviewTag) => reviewTag.tag.id) : []
  )

  const handleSubmit = async (e) => {
    e.preventDefault();
    // validate rating is wihin valid range
    if (rating < 1 || rating > 5) {
      alert("Please select a rating between 1 and 5 stars.");
      return;
    }

    // validate comment is not empty
    if (!comment.trim()) {
      alert("Please enter a comment for your review.");
      return;
    }

    setIsSubmitting(true); // show loading state disable form

    try {
      // call parent component's onSave function with the updated review data
      await onSave(review.id, {
        rating: parseInt(rating),
        comment: comment.trim(),
        image_urls: imageUrls.filter((url) => url.trim() !== ""), // remove empty urls
        selected_tags: selectedTags, // pass selected tags to parent component
      });
      // if successful, parent will handle closing the form and refreshing the data
    } catch (error) {
      console.error("Error updating review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddImage = () => {
    // if url is not empty and not alr in list (prevent dups) add new url to array using spread ...
    if (newImageUrl.trim() && !imageUrls.includes(newImageUrl.trim())) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl(""); // clear input field after adding
    }
  };
  // removes image from array at given index
  const handleRemoveImage = (indexToRemove) => {
    // _ ignores the url value, only care about the index
    setImageUrls(imageUrls.filter((_, index) => index !== indexToRemove));
  };

  // update star rating when user clicks on a star
  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  return (
    <div className="edit-review-form">
      <h3>Edit Your Review</h3>
      <form onSubmit={handleSubmit}>
        {/* rating section */}
        <div className="form-group">
          <label>Rating:</label>
          <div className="star-rating-input">
            {/* create array of numbers 1-5 and map to star buttons */}
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                // add filled class to button if star is less than or equal to rating
                className={`star-button ${star <= rating ? "filled" : ""}`}
                onClick={() => handleStarClick(star)} // set rating to this stars num when clicked
              >
                ★
              </button>
            ))}
            {/* show current rating num */}
            <span className="rating-text">({rating}/5)</span>
          </div>
        </div>

        {/* comment textbox section */}
        <div className="form-group">
          <label htmlFor="comment">Comment:</label>
          <textarea
            id="comment"
            value={comment} // set value to current comment state
            onChange={(e) => setComment(e.target.value)} // update comment state when user types
            placeholder="Share your experience..."
            rows="4" // text area is 4 rows tall
            required
          />
        </div>
        {/* tag selection section - added so users can edit tags when editing review */}
        <TagSelector
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          maxTags={3}
          />

        {/* images section */}
        <div className="form-group">
          <label>Images (optional):</label>

          {/* display current images */}
          {imageUrls.length > 0 && (
            <div className="current-images">
              {imageUrls.map((url, index) => (
                <div key={index} className="image-preview">
                  <img src={url} alt={`Review image ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-image-button"
                    onClick={() => handleRemoveImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* add a new image */}
          <div className="add-image-section">
            <input
              type="url" // html5 url input type for basic validation
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Enter image URL"
            />
            <button
              type="button"
              onClick={handleAddImage}
              disabled={!newImageUrl.trim()} // disable button if url is empty
            >
              Add Image
            </button>
          </div>
        </div>

        {/* for actions/buttons */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={onCancel} // call parents cancel function
            disabled={isSubmitting} // disable button if submitting
          >
            Cancel
          </button>
          <button type="submit" className="save-button" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
            {/* show diff text based on submission state */}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditReviewForm;
