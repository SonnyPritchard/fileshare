const http = require("http");

const port = Number(process.env.API_PORT) || 4000;

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method === "GET" && req.url === "/control-plane/metadata") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        teamId: "team_demo",
        deviceId: "device_demo",
        peers: [{ deviceId: "device_peer_1", label: "Alice's laptop" }],
        services: [{ id: "svc_1", deviceId: "device_peer_1", label: "Files" }],
        transport: { provider: "tailscale" }
      })
    );
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(port, () => {
  console.log(`API listening on :${port}`);
});
