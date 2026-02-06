type DevicePairStartResponse = {
  pairingCode: string;
};

type DevicePairCompleteResponse = {
  success: true;
};

export async function startDevicePairing(deviceName: string): Promise<DevicePairStartResponse> {
  // TODO: Replace with real control-plane API call.
  if (!deviceName) {
    return { pairingCode: "000000" };
  }
  return { pairingCode: "123456" };
}

export async function completeDevicePairing(code: string): Promise<DevicePairCompleteResponse> {
  // TODO: Replace with real control-plane API call.
  if (!code) {
    return { success: true };
  }
  return { success: true };
}
