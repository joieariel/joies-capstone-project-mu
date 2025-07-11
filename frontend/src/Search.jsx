import React, { useState, useEffect } from "react";
import { tagAPI } from "./api"; // import the tagAPI function from the api.js file
import "./Search.css";

const Search = ({ onSearch }) => {
  // state to track all selected filters
  const [selectedFilters, setSelectedFilters] = useState({
    distance: [],
    hours: [],
    rating: [],
    tags: [],
  });

  // state for custom distance input
  const [customDistance, setCustomDistance] = useState("");
  const [showCustomDistance, setShowCustomDistance] = useState(false);
  const [customDistanceSubmitted, setCustomDistanceSubmitted] = useState(false);

  // state for tags
  const [tagOptions, setTagOptions] = useState([]);

  // predefined filter options
  const distanceOptions = [
    { id: "5miles", label: "Within 0-5 miles" },
    { id: "10miles", label: "Within 6-10 miles" },
    { id: "25miles", label: "Within 11-25 miles" },
    { id: "25+miles", label: "Over 25+ miles" },
    { id: "custom", label: "Custom Distance" },
  ];

  const hoursOptions = [
    { id: "openNow", label: "Open Now" },
    { id: "openLate", label: "Open Late (until 9pm+)" },
    { id: "openWeekends", label: "Open Weekends" },
  ];

  const ratingOptions = [
    { id: "highestRated", label: "Highest Rated" },
    { id: "mostReviewed", label: "Most Reviewed" },
    { id: "mostRecentlyReviewed", label: "Most Recently Reviewed" },
    { id: "recommended", label: "Recommended" }, // will combine the highest rated and most reviewed to recommend the best centers

  // fetch tags from the api when component mounts instead of hard coding them
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await tagAPI.getAllTags();
        setTagOptions(tags.map((tag) => ({ id: tag.id, label: tag.name })));
      } catch (err) {
        console.error("Error fetching tags:", err);
      }
    };

    fetchTags();
  }, []);


  // handle filter selection/deselection
  const handleFilterClick = (filterType, filterId) => {
    // handle custom distance selection
    if (filterId === "custom") {
      setShowCustomDistance(!showCustomDistance);
      if (showCustomDistance) {
        // if hiding custom distance, clear it from filters
        setSelectedFilters((prevFilters) => {
          const updatedFilters = {
            ...prevFilters,
            distance: prevFilters.distance.filter((id) => id !== "custom"),
          };
          onSearch(updatedFilters);
          return updatedFilters;
        });
        setCustomDistance("");
      }
      return;
    }

    setSelectedFilters((prevFilters) => {
      const currentFilters = prevFilters[filterType];
      let newFilters;

      if (filterType === "distance" || filterType === "rating") {
        // for distance and rating: single selection only
        if (currentFilters.includes(filterId)) {
          //if clicking the same filter, deselect it
          newFilters = [];
        } else {
          // select only this filter
          newFilters = [filterId];
          // hide custom distance if selecting predefined option (only for distance)
          if (filterType === "distance") {
            setShowCustomDistance(false);
            setCustomDistance("");
          }
        }
      } else {
        // For other filters: multiple selection allowed
        if (currentFilters.includes(filterId)) {
          // filter is already selected, remove it
          newFilters = currentFilters.filter((id) => id !== filterId);
        } else {
          // filter is not selected, add it
          newFilters = [...currentFilters, filterId];
        }
      }

      const updatedFilters = {
        ...prevFilters, // keep other filter types as is
        [filterType]: newFilters, // update the specific filter type
      };

      // call parent component's callback with new filters (pass in filter object)
      onSearch(updatedFilters);
      return updatedFilters;
    });
  };

  // handle custom distance input change
  const handleCustomDistanceChange = (e) => {
    const value = e.target.value;
    setCustomDistance(value);
    // reset the submitted state when the user changes the input
    setCustomDistanceSubmitted(false);
  };

  // handle custom distance submission
  const handleCustomDistanceSubmit = () => {
    if (customDistance.trim() !== "" && !isNaN(customDistance)) {
      // format the custom distance as "Xmiles" for the backend
      const formattedDistance = `${customDistance}miles`;

      setSelectedFilters((prevFilters) => {
        const updatedFilters = {
          ...prevFilters,
          distance: [formattedDistance], // send the formatted distance value
        };
        onSearch(updatedFilters);
        return updatedFilters;
      });

      setCustomDistanceSubmitted(true);
    } else {
      // handle invalid input
      alert("Please enter a valid number for distance");
    }
  };

  // handle pressing Enter in the custom distance input
  const handleCustomDistanceKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCustomDistanceSubmit();
    }
  };

  // clear custom distance
  const clearCustomDistance = () => {
    setCustomDistance("");
    setCustomDistanceSubmitted(false);

    setSelectedFilters((prevFilters) => {
      const updatedFilters = {
        ...prevFilters,
        distance: [],
      };
      onSearch(updatedFilters);
      return updatedFilters;
    });
  };

  // helper to check if a filter is selected used to style the filter if its toggled or not
  const isFilterSelected = (filterType, filterId) => {
    return selectedFilters[filterType].includes(filterId);
  };

  // clear all selected filters by resetting them all to empty arrays
  const handleClearAll = () => {
    const clearedFilters = {
      distance: [],
      hours: [],
      rating: [],
      tags: [],
    };
    setSelectedFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  // helper to check if any filters are selected
  const hasActiveFilters = () => {
    return Object.values(selectedFilters).some((filters) => filters.length > 0);
  };

  // render filter section with chips
  // takes in title, options, and filter type for the filter chip sections so its consistent
  const renderFilterSection = (title, options, filterType) => {
    return (
      <div className="filter-section">
        <div className="filter-section-label">{title}</div>
        <div className="filter-chips-container">
          {/* loop thru each option in array to make it a button (chip) */}
          {options.map((option) => {
            const isSelected = isFilterSelected(filterType, option.id);
            return (
              <button
                key={option.id}
                type="button"
                className={`filter-chip ${isSelected ? "selected" : ""}`}
                onClick={() => handleFilterClick(filterType, option.id)}
                title={`Click to ${isSelected ? "deselect" : "select"} ${
                  option.label
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <h3 className="search-title">Search for Community Centers</h3>
        {hasActiveFilters() && (
          <button onClick={handleClearAll} className="clear-all-button">
            Clear All Filters
          </button>
        )}
      </div>
      {/* container for all filter sections */}
      <div className="advanced-search-container">
        {/* the 3 filter sections using reusable render function */}
        {renderFilterSection("Distance", distanceOptions, "distance")}

        {/* Custom distance input */}
        {showCustomDistance && (
          <div className="custom-distance-container">
            <div className="custom-distance-input-group">
              <label htmlFor="customDistance" className="custom-distance-label">
                Enter distance in miles:
              </label>
              <div className="custom-distance-controls">
                <input
                  id="customDistance"
                  type="number"
                  min="1"
                  max="100"
                  value={customDistance}
                  onChange={handleCustomDistanceChange}
                  onKeyDown={handleCustomDistanceKeyDown}
                  placeholder="e.g., 15"
                  className="custom-distance-input"
                  disabled={customDistanceSubmitted}
                />
                {!customDistanceSubmitted ? (
                  <button
                    onClick={handleCustomDistanceSubmit}
                    className="custom-distance-button"
                    title="Apply this distance filter"
                  >
                    Apply
                  </button>
                ) : (
                  <button
                    onClick={clearCustomDistance}
                    className="custom-distance-button clear"
                    title="Clear this distance filter"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            {customDistanceSubmitted && (
              <div className="custom-distance-status">
                <span>✓ Filtering centers within {customDistance} miles</span>
              </div>
            )}
          </div>
        )}

        {renderFilterSection("Operating Hours", hoursOptions, "hours")}
        {renderFilterSection("Rating & Reviews", ratingOptions, "rating")}
        {renderFilterSection("Tags", tagOptions, "tags")}
      </div>
      {/* summary section to show the number of active filters */}
      {hasActiveFilters() && (
        <div className="active-filters-summary">
          <div className="summary-label">Active Filters:</div>
          <div className="summary-count">
            {Object.values(selectedFilters).reduce(
              (total, filters) => total + filters.length,
              0
            )}{" "}
            filters selected
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
