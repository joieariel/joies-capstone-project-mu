
// simple in-memory cache utility
// has the core cache operations any cache needs

// maximum number of items the cache can hold (for now )
// if the cache reaches this limit, the oldest item will be evicted
const MAX_CACHE_SIZE = 1000;

// default value for the auto cleanup
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes (in milliseconds) is how often to run auto clean up
// whether auto cleanup of expired items is enabled or not
const AUTO_CLEANUP_ENABLED = true;

// intiialize a Map object (collection of unique key-value pairs) to store cached items
const cache = new Map(); // this is the cache itself

// initialize object to track how cache is perfoming
// with some basic cache performance stats/metrics
const stats = {
  hits: 0, // counts successful cache hits (retrieval of a cached item)
  misses: 0, // counts when cache items were not found or expired
  sets: 0, // counts how many items were stored in the cache
  clears: 0, // counts how many items were removed from the cache
  evictions: 0, // counts items removed due to max size limits
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
  const expiry = Date.now() + ttlSeconds * 1000;


// eviction policy: if the cache is full, evict the oldest item w/ earliest expiry - LRU policy (Least Recently Used)

  // check if we need to evict an item before adding a new one
  if (!cache.has(key) && cache.size >= MAX_CACHE_SIZE) {
    // using the LRU (least recently used) eviction policy
    // find the oldest item (with earliest expiry) to evict
    let oldestKey = null;
    let oldestExpiry = Infinity;

    for (const [itemKey, itemValue] of cache.entries()) {
      if (itemValue.expiry < oldestExpiry) {
        oldestExpiry = itemValue.expiry;
        oldestKey = itemKey;
      }
    }

    // evict the oldest item
    if (oldestKey) {
      cache.delete(oldestKey);
      stats.evictions++;
    }
  }

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
    maxSize: MAX_CACHE_SIZE, // add the max size to the stats object
    // convert the Map's keys into array so we can see whats currently been cached
    keys: Array.from(cache.keys()),
    autoCleanupEnabled: AUTO_CLEANUP_ENABLED, // new stats property for reporting the auto cleanup status (enabled/disabled)
    cleanupIntervalMs: CLEANUP_INTERVAL_MS, // new stats property for reporting the auto cleanup interval (in milliseconds)
  };
};


// cleanup function to remove all expired items from the cache
// this can be called manually or will run automatically on the configured interval
const cleanup = () => {
  const now = Date.now();
  let removedCount = 0;

  // iterate through all cache entries and remove expired ones
  for (const [key, item] of cache.entries()) {
    if (item.expiry < now) {
      cache.delete(key);
      removedCount++;
    }
  }
   // update the evictions counter
  if (removedCount > 0) {
    stats.clears += removedCount;
  }

  return removedCount; // return the number of expired items removed
};

// set up automatic cleanup if enabled (true by default)
let cleanupInterval = null;
if (AUTO_CLEANUP_ENABLED) {
  cleanupInterval = setInterval(cleanup, CLEANUP_INTERVAL_MS);

  // prevent the interval from keeping the Node.js process running if nothing is happeningg
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }
}

// function that allows changing the auto cleanup settings (enabled/disabled and intervals)
const configureAutoCleanup = (options = {}) => {
  // update enabled setting if provided
  if (
    typeof options.enabled === "boolean" &&
    options.enabled !== AUTO_CLEANUP_ENABLED
  ) {
    if (options.enabled) {
      // enable auto cleanup
      if (!cleanupInterval) {
        cleanupInterval = setInterval(cleanup, CLEANUP_INTERVAL_MS);
        if (cleanupInterval.unref) {
          cleanupInterval.unref();
        }
      }
    } else {
      // disable auto cleanup
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
      }
    }
  }

  // update interval if provided
  if (
    typeof options.intervalMs === "number" &&
    options.intervalMs > 0 &&
    options.intervalMs !== CLEANUP_INTERVAL_MS &&
    cleanupInterval
  ) {
    // reset interval with new timing
    clearInterval(cleanupInterval);
    cleanupInterval = setInterval(cleanup, options.intervalMs);
    if (cleanupInterval.unref) {
      cleanupInterval.unref();
    }
  }
};

// export the cache functions
module.exports = {
  get,
  set,
  clear,
  clearAll,
  getStats,
  cleanup,
  configureAutoCleanup,
};
