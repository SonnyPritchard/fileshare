/*
  Desktop Agent (placeholder)

  Responsibilities:
  - Enroll the device into a team space
  - Maintain a secure local presence and report status
  - Transfer files to and from other enrolled devices
  - Expose local apps via friendly URLs using the abstracted transport layer

  TODO: Implement lifecycle, auth handshake, and transfer orchestration.
*/

const { createAdapter } = require("./transport");

async function loadControlPlaneMetadata() {
  // TODO: fetch from control plane and persist locally.
  return {
    teamId: "team_demo",
    deviceId: "device_demo",
    peers: [{ deviceId: "device_peer_1", label: "Alice's laptop" }],
    services: [{ id: "svc_1", deviceId: "device_peer_1", label: "Files" }],
    transport: { provider: "tailscale" }
  };
}

async function main() {
  const envProvider = process.env.TRANSPORT_PROVIDER || "noop";
  const metadata = await loadControlPlaneMetadata();
  const provider = metadata.transport?.provider || envProvider;
  const adapter = createAdapter(provider);

  await adapter.init();
  const peer = metadata.peers[0];

  if (peer) {
    await adapter.connect(peer.deviceId, metadata);
  }

  console.log(`Agent placeholder running with transport: ${adapter.name}`);
}

main().catch((err) => {
  console.error("Agent failed to start", err);
  process.exit(1);
});
