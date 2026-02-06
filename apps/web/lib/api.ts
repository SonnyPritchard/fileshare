export type Device = {
  id: string;
  name: string;
  status: "Connected" | "Offline";
};

export async function getDevices(): Promise<Device[]> {
  // TODO: wire to API
  return [
    { id: "device-1", name: "Office MacBook", status: "Connected" },
    { id: "device-2", name: "Home PC", status: "Offline" },
    { id: "device-3", name: "Studio Mini", status: "Connected" }
  ];
}

export async function requestMagicLink(email: string): Promise<void> {
  // TODO: wire to API
  if (!email) {
    throw new Error("Email is required");
  }
}
