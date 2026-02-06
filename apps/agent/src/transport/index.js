function createAdapter(provider) {
  switch (provider) {
    case "tailscale":
      return require("./tailscale").createAdapter();
    default:
      return require("./noop").createAdapter();
  }
}

module.exports = { createAdapter };
