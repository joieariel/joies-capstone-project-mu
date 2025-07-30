import { useState } from "react";
import "../EducationalResources.css";

const ResourceCard = ({
  title, // the title of the resource card
  description, // the description text for the card
  cardId, // unique identifier for the card
  expandedSections = [], // sections to show when expanded
}) => {
  // state to track if the card is expanded or collapsed
  const [isExpanded, setIsExpanded] = useState(false);

  // function to toggle the expand/collapse state of the card
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
    // apply the "clickable" and "expanded" classes to the card element based on the state
      className={`resource-card clickable ${isExpanded ? "expanded" : ""}`}
      onClick={toggleExpand}
    >
      <div className="card-header">
        <h3>{title}</h3>
        <span className="click-indicator">{isExpanded ? "▼" : "▶"}</span>
      </div>

      <p>{description}</p>

      <div className="click-note">
        Click to {isExpanded ? "collapse" : "expand"}
      </div>

      {isExpanded && (
        <div className="expanded-content">
          <hr />
          {expandedSections.map((section, index) => (
            <div key={`${cardId}-section-${index}`}>
              <h4>{section.title}</h4>
              <ul>
                {/* map over the links in the section and render them as list items */}
                {section.links.map((link, linkIndex) => (
                  <li key={`${cardId}-link-${linkIndex}`}>
                    <a
                      href={link.url}
                      className="resource-link"
                      target={link.url !== "#" ? "_blank" : undefined} // open in new tab if not a hash link
                      rel={link.url !== "#" ? "noopener noreferrer" : undefined} // prevent malicious sites from opening in new tab
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceCard;
