// script to clear the recommendation cache
const simpleCache = require("../utils/simpleCache");

// clear all items from the cache
simpleCache.clearAll();

console.log("Cache cleared successfully!");
console.log("Current cache stats:", simpleCache.getStats());
