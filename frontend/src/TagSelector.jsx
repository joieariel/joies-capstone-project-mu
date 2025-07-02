import React, { useState, useEffect } from "react";
import "./TagSelector.css";
import { tagAPI } from "./api";

// destructuring props to make it easier to use with default values
const TagSelector = ({ selectedTags = [], onTagsChange, maxTags = 5 }) => {
  // state for available tags from the api
  const [availableTags, setAvailableTags] = useState([]);
  // state for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch available tags when component mounts
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const tags = await tagAPI.getAllTags();
        setAvailableTags(tags);
      } catch (err) {
        console.error("Error fetching tags:", err);
        setError("Failed to load tags. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  // handle tag selection/deselection
  const handleTagClick = (tagId) => {
    let newSelectedTags;

    if (selectedTags.includes(tagId)) {
      // tag is already selected, remove it
      newSelectedTags = selectedTags.filter(id => id !== tagId);
    } else {
      // tag is not selected, add it if under max limit
      if (selectedTags.length >= maxTags) {
        return; // don't add if at max limit
      }
      // spread operator to add new tag to existing array
      newSelectedTags = [...selectedTags, tagId];
    }

    // call parent component's callback with new selection
    onTagsChange(newSelectedTags);
  };

  // helper to check if a tag is selected
  const isTagSelected = (tagId) => {
    return selectedTags.includes(tagId);
  };

  // helper to check if we can select more tags
  const canSelectMore = selectedTags.length < maxTags;

  // early return pattern for loading state - shows loading message while API call is in progress
  // this prevents the main component from rendering until data is ready
  if (isLoading) {
    return (
      <div className="tag-selector">
        <div className="tag-selector-label">Tags (optional)</div>
        <div className="tag-loading">Loading tags...</div>
      </div>
    );
  }

  // early return pattern for error state - shows error message if API call failed
  // this prevents the main component from rendering and shows user-friendly error
  if (error) {
    return (
      <div className="tag-selector">
        <div className="tag-selector-label">Tags (optional)</div>
        <div className="tag-error">{error}</div>
      </div>
    );
  }

  // main component render
  return (
    <div className="tag-selector">
      {/* component title with dynamic max tags display */}
      <div className="tag-selector-label">
        Tags (optional) - Select up to {maxTags}
      </div>

      {/* info section - shows selection status and warnings */}
      <div className="tag-selector-info">
        {/*only show count if user has selected tags */}
        {selectedTags.length > 0 && (
          <div className="selected-count">
            {selectedTags.length} of {maxTags} tags selected
          </div>
        )}
        {/* only show warning when max limit reached */}
        {selectedTags.length >= maxTags && (
          <div className="max-reached">
            Maximum tags reached. Deselect a tag to choose a different one.
          </div>
        )}
      </div>

      {/* displays all available tags  */}
      <div className="tags-container">
        {/* map through each tag object and create a button for each one */}
        {availableTags.map((tag) => {
          // calculate button states for this specific tag
          const isSelected = isTagSelected(tag.id);
          const isDisabled = !isSelected && !canSelectMore;

          return (
            <button
              key={tag.id}
              type="button"
              className={`tag-chip ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
              onClick={() => handleTagClick(tag.id)}
              disabled={isDisabled}
              // dynamic tooltip text that explains what will happen when clicked
              title={isDisabled ? `Maximum ${maxTags} tags allowed` : `Click to ${isSelected ? 'deselect' : 'select'} ${tag.name}`}
            >
              {/* display the tag name from the database */}
              {tag.name}
            </button>
          );
        })}
      </div>

      {/* fallback message if no tags are available from the api */}
      {availableTags.length === 0 && (
        <div className="no-tags">No tags available</div>
      )}
    </div>
  );
};

export default TagSelector;
