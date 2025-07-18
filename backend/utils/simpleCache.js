// simple in-memory cache utility
// has the core cache operations any cache needs

class SimpleCache {
  constructor(options = {}) {
    // maximum number of items the cache can hold (for now )
    // if the cache reaches this limit, the oldest item will be evicted
    this.MAX_CACHE_SIZE = options.maxCacheSize || 1000;

    // default value for the auto cleanup
    this.CLEANUP_INTERVAL_MS = options.cleanupIntervalMs || 5 * 60 * 1000; // 5 minutes (in milliseconds) is how often to run auto clean up
    // whether auto cleanup of expired items is enabled or not
    this.AUTO_CLEANUP_ENABLED =
      options.autoCleanupEnabled !== undefined
        ? options.autoCleanupEnabled
        : true;

    // intiialize a Map object (collection of unique key-value pairs) to store cached items
    this.cache = new Map(); // this is the cache itself

    // initialize object to track how cache is perfoming
    // with some basic cache performance stats/metrics
    this.stats = {
      hits: 0, // counts successful cache hits (retrieval of a cached item)
      misses: 0, // counts when cache items were not found or expired
      sets: 0, // counts how many items were stored in the cache
      clears: 0, // counts how many items were removed from the cache
      evictions: 0, // counts items removed due to max size limits
    };

    // set up automatic cleanup if enabled (true by default)
    this.cleanupInterval = null;
    if (this.AUTO_CLEANUP_ENABLED) {
      this.cleanupInterval = setInterval(
        () => this.cleanup(),
        this.CLEANUP_INTERVAL_MS
      );

      // prevent the interval from keeping the Node.js process running if nothing is happeningg
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  // get a value from the cache
  get(key) {
    // check if the key exists in our cache so try to retrieve the item from the cache using provided key param
    const item = this.cache.get(key);

    // if item doesn't exist, count it a miss/increment the counter for miss, and return null
    if (!item) {
      this.stats.misses++;
      return null;
    }

    // check if the item has expired
    if (item.expiry < Date.now()) {
      // if it has expired, delete it from cache and increment miss counter
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // if item exists and is valid, count as a hit and return the value
    this.stats.hits++;
    return item.value;
  }

  // set function to store a value in the cache with an expiration time
  // takes a key, value, and optional ttlSeconds (time to live in seconds) as parameters (ttl is 1 hour by default)
  set(key, value, ttlSeconds = 3600) {
    // calculate the expiration timestamp
    const expiry = Date.now() + ttlSeconds * 1000;

    // eviction policy: if the cache is full, evict the oldest item w/ earliest expiry - LRU policy (Least Recently Used)

    // check if we need to evict an item before adding a new one
    if (!this.cache.has(key) && this.cache.size >= this.MAX_CACHE_SIZE) {
      // using the LRU (least recently used) eviction policy
      // find the oldest item (with earliest expiry) to evict
      let oldestKey = null;
      let oldestExpiry = Infinity;

      for (const [itemKey, itemValue] of this.cache.entries()) {
        if (itemValue.expiry < oldestExpiry) {
          oldestExpiry = itemValue.expiry;
          oldestKey = itemKey;
        }
      }

      // evict the oldest item
      if (oldestKey) {
        this.cache.delete(oldestKey);
        this.stats.evictions++;
      }
    }

    // store the value and expiration in the cache and increment the set counter
    this.cache.set(key, { value, expiry });
    this.stats.sets++;
  }

  // clear function to delete a specific key from the cache
  clear(key) {
    // check if the key exists in the cache and delete it if it does
    const existed = this.cache.has(key);
    if (existed) {
      this.cache.delete(key);
      this.stats.clears++; // increment the clear counter
    }
    return existed; // return true if the key existed and was deleted, false otherwise
  }

  // function to clear all items from the cache
  clearAll() {
    // get the current # of items in the cache
    const size = this.cache.size;
    this.cache.clear();
    // add the # of items cleared to the clear counter
    this.stats.clears += size;
  }

  // get cache statistics and status
  getStats() {
    // returns a new stats object that includes all properties from the original stats object
    return {
      ...this.stats,
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE, // add the max size to the stats object
      // convert the Map's keys into array so we can see whats currently been cached
      keys: Array.from(this.cache.keys()),
      autoCleanupEnabled: this.AUTO_CLEANUP_ENABLED, // new stats property for reporting the auto cleanup status (enabled/disabled)
      cleanupIntervalMs: this.CLEANUP_INTERVAL_MS, // new stats property for reporting the auto cleanup interval (in milliseconds)
    };
  }

  // cleanup function to remove all expired items from the cache
  // this can be called manually or will run automatically on the configured interval
  cleanup() {
    const now = Date.now();
    let removedCount = 0;

    // iterate through all cache entries and remove expired ones
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry < now) {
        this.cache.delete(key);
        removedCount++;
      }
    }
    // update the evictions counter
    if (removedCount > 0) {
      this.stats.clears += removedCount;
    }

    return removedCount; // return the number of expired items removed
  }

  // function that allows changing the auto cleanup settings (enabled/disabled and intervals)
  configureAutoCleanup(options = {}) {
    // update enabled setting if provided
    if (
      typeof options.enabled === "boolean" &&
      options.enabled !== this.AUTO_CLEANUP_ENABLED
    ) {
      if (options.enabled) {
        // enable auto cleanup
        if (!this.cleanupInterval) {
          this.cleanupInterval = setInterval(
            () => this.cleanup(),
            this.CLEANUP_INTERVAL_MS
          );
          if (this.cleanupInterval.unref) {
            this.cleanupInterval.unref();
          }
        }
      } else {
        // disable auto cleanup
        if (this.cleanupInterval) {
          clearInterval(this.cleanupInterval);
          this.cleanupInterval = null;
        }
      }
    }

    // update interval if provided
    if (
      typeof options.intervalMs === "number" &&
      options.intervalMs > 0 &&
      options.intervalMs !== this.CLEANUP_INTERVAL_MS &&
      this.cleanupInterval
    ) {
      // reset interval with new timing
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = setInterval(
        () => this.cleanup(),
        options.intervalMs
      );
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }
}

// create a default instance for backward compatibility
const defaultCache = new SimpleCache();

// export both the class and a default instance for backward compatibility
module.exports = {
  // default instance methods for backward compatibility
  get: (key) => defaultCache.get(key),
  set: (key, value, ttlSeconds) => defaultCache.set(key, value, ttlSeconds),
  clear: (key) => defaultCache.clear(key),
  clearAll: () => defaultCache.clearAll(),
  getStats: () => defaultCache.getStats(),
  cleanup: () => defaultCache.cleanup(),
  configureAutoCleanup: (options) => defaultCache.configureAutoCleanup(options),

  // export the class for creating new instances
  SimpleCache,

  // export the default instance itself
  defaultCache,
};
