type DevicePairStartResponse = {
  pairingCode: string;
};

type DevicePairCompleteResponse = {
  success: true;
};

export async function startDevicePairing(deviceName: string): Promise<DevicePairStartResponse> {
  // TODO: Add auth headers once control-plane auth moves to tokens.
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/devices/pair/start`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ deviceName }),
    }
  );

  if (!response.ok) {
    throw new Error("Unable to start pairing");
  }

  return response.json();
}

export async function completeDevicePairing(code: string): Promise<DevicePairCompleteResponse> {
  // TODO: Add agent enrollment handshake once available.
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/devices/pair/complete`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ pairingCode: code }),
    }
  );

  if (!response.ok) {
    throw new Error("Unable to complete pairing");
  }

  return response.json();
}
