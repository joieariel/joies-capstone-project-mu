const simpleCache = require("./simpleCache");


 // slears all cache entries related to a specific community center
const clearCenterCache = (centerId) => {
  // get all cache keys
  const stats = simpleCache.getStats();
  const keys = stats.keys;

  // find and clear all recommendation cache entries for this center
  keys.forEach(key => {
    if (key.startsWith(`recommendations_${centerId}_`)) {
      simpleCache.clear(key);
    }
  });
};

module.exports = {
  clearCenterCache
};
