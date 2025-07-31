import { createContext, useState, useContext } from "react";

// create a context to store and retrieve scroll positions
const ScrollPositionContext = createContext();

export const ScrollPositionProvider = ({ children }) => {
  // state to store scroll positions for different pages
  const [scrollPositions, setScrollPositions] = useState({
    communityCenters: 0,
  });

  // save a scroll position for a specific page
  const saveScrollPosition = (page, position) => {
    // update the state
    setScrollPositions((prev) => ({
      ...prev,
      // update the scroll position for the specified page
      [page]: position,
    }));
  };

  // function to get a saved scroll position for a specific page
  const getScrollPosition = (page) => {
    return scrollPositions[page] || 0;
  };

  return (
    // provide the context with the state and functions
    <ScrollPositionContext.Provider
      value={{ saveScrollPosition, getScrollPosition }}
    >
      {children}
    </ScrollPositionContext.Provider>
  );
};

// custom hook to use the scroll position context functions from any component
export const useScrollPosition = () => {
  const context = useContext(ScrollPositionContext);
  if (!context) {
    throw new Error(
      "useScrollPosition must be used within a ScrollPositionProvider"
    );
  }
  return context;
};
