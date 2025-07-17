
// simple in-memory cache utility
// has the core cache operations any cache needs


// intiialize a Map object (collection of unique key-value pairs) to store cached items
const cache = new Map(); // this is the cache itself

// initialize object to track how cache is perfoming
// with some basic cache performance stats/metrics
const stats = {
  hits: 0, // counts successful cache hits (retrieval of a cached item)
  misses: 0, // counts when cache items were not found or expired
  sets: 0, // counts how many items were stored in the cache
  clears: 0 // counts how many items were removed from the cache
};


// get a value from the cache
const get = (key) => {
  // check if the key exists in our cache so try to retrieve the item from the cache using provided key param
  const item = cache.get(key);

  // if item doesn't exist, count it a miss/increment the counter for miss, and return null
  if (!item) {
    stats.misses++;
    return null;
  }

  // check if the item has expired
  if (item.expiry < Date.now()) {
    // if it has expired, delete it from cache and increment miss counter
    cache.delete(key);
    stats.misses++;
    return null;
  }

  // if item exists and is valid, count as a hit and return the value
  stats.hits++;
  return item.value;
};


// set function to store a value in the cache with an expiration time
// takes a key, value, and optional ttlSeconds (time to live in seconds) as parameters (ttl is 1 hour by default)
const set = (key, value, ttlSeconds = 3600) => {
  // calculate the expiration timestamp
  const expiry = Date.now() + (ttlSeconds * 1000);

  // store the value and expiration in the cache and increment the set counter
  cache.set(key, { value, expiry });
  stats.sets++;
};


// clear function to delete a specific key from the cache
const clear = (key) => {
// check if the key exists in the cache and delete it if it does
  const existed = cache.has(key);
  if (existed) {
    cache.delete(key);
    stats.clears++; // increment the clear counter
  }
  return existed; // return true if the key existed and was deleted, false otherwise
};


// function to clear all items from the cache
const clearAll = () => {
  // get the current # of items in the cache
  const size = cache.size;
  cache.clear();
  // add the # of items cleared to the clear counter
  stats.clears += size;
};


// get cache statistics and status
const getStats = () => {
    // returns a new stats object that includes all properties from the original stats object
  return {
    ...stats,
    size: cache.size,
    // convert the Map's keys into array so we can see whats currently been cached
    keys: Array.from(cache.keys())
  };
};

// export the cache functions
module.exports = {
  get,
  set,
  clear,
  clearAll,
  getStats
};
