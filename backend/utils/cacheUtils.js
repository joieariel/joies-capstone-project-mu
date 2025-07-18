const { defaultCache } = require("./simpleCache");

// clears all cache entries related to a specific community center
const clearCenterCache = (centerId) => {
  // get all cache keys
  const stats = defaultCache.getStats();
  const keys = stats.keys;

  // find and clear all recommendation cache entries for this center
  keys.forEach((key) => {
    if (key.startsWith(`recommendations_${centerId}_`)) {
      defaultCache.clear(key);
    }
  });
};

module.exports = {
  clearCenterCache,
};
