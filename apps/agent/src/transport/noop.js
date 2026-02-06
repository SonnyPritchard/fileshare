function createAdapter() {
  return {
    name: "noop",
    async init() {
      // No-op transport for local dev.
    },
    async connect() {
      return { sessionId: "local" };
    },
    async shutdown() {
      // No-op cleanup.
    }
  };
}

module.exports = { createAdapter };
