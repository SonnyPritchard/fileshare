function createAdapter() {
  return {
    name: "tailscale",
    async init() {
      // TODO: bootstrap tailscale client and authenticate device.
    },
    async connect(peerId, metadata) {
      // TODO: establish a session to the peer using metadata provided by control plane.
      return { sessionId: `ts-${peerId}` };
    },
    async shutdown() {
      // TODO: cleanly stop tailscale client.
    }
  };
}

module.exports = { createAdapter };
