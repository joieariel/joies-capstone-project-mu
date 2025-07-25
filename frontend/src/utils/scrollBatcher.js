// utility for batching scroll depth interactions before sending to server
// this reduces API calls by collecting scroll events and sending them periodically

class ScrollBatcher {
  constructor(flushInterval = 30000) { // default flush every 30 seconds
    this.scrollDepths = {}; // map of centerId -> max scroll depth
    this.flushInterval = flushInterval;
    this.timerId = null;
  }

  // start the periodic flushing timer
  start() {
    if (!this.timerId) {
      this.timerId = setInterval(() => this.flush(), this.flushInterval);

      // also flush when user leaves the page
      window.addEventListener('beforeunload', () => this.flush());
    }
    return this;
  }

  // record a scroll depth for a specific center
  // only stores the maximum depth reached for each center
  recordScrollDepth(centerId, depth) {
    // ensure centerId is a number
    const id = parseInt(centerId, 10);

    // validate that id is a valid number
    if (isNaN(id)) {
      console.error("Invalid centerId provided to scrollBatcher:", centerId);
      return;
    }

    // initialize if this is first scroll for this center
    if (!this.scrollDepths[id]) {
      this.scrollDepths[id] = 0;
    }

    // only update if new depth is greater than previously recorded
    this.scrollDepths[id] = Math.max(this.scrollDepths[id], depth);
  }

  // send all batched scroll depths to the server and reset
  async flush() {
    try {
      // only proceed if there is data to send
      if (Object.keys(this.scrollDepths).length === 0) {
        return;
      }

      const { pageInteractionsAPI } = await import("../api");

      // process each center's scroll depth
      for (const [centerId, depth] of Object.entries(this.scrollDepths)) {
        if (depth > 0) {
          // ensure centerId is a number
          const id = parseInt(centerId, 10);
          if (!isNaN(id)) {
            await pageInteractionsAPI.recordPageInteraction(id, {
              scroll_depth: depth,
            });
          }
        }
      }

      // reset after successful flush
      this.scrollDepths = {};
    } catch (err) {
      console.error("Error flushing scroll depths:", err);
    }
  }

  // clean up resources when component unmounts
  cleanup() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
      window.removeEventListener('beforeunload', () => this.flush());

      // final flush before cleanup
      this.flush();
    }
  }
}

// create and export a singleton instance because we only need one instance
export const scrollBatcher = new ScrollBatcher().start();
