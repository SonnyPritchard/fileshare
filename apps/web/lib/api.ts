type Device = {
  id: string;
  name: string;
  teamId: string;
  status: "online" | "offline" | "unknown";
  lastSeenAt?: string;
};

type User = {
  id: string;
  email: string;
  createdAt: string;
};

type DevicePairStartRequest = {
  name?: string;
};

type DevicePairStartResponse = {
  code: string;
  expiresAt: string;
  pendingDevice: {
    id: string;
    name: string;
    teamId: string;
    status: "pending";
    expiresAt: string;
  };
};

type DevicePairCompleteRequest = {
  code: string;
};

type DevicePairCompleteResponse = {
  device: Device;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export async function getDevices(): Promise<Device[]> {
  // TODO: wire to API
  return [
    { id: "device-1", name: "Office MacBook", teamId: "team_demo", status: "online" },
    { id: "device-2", name: "Home PC", teamId: "team_demo", status: "offline" },
    { id: "device-3", name: "Studio Mini", teamId: "team_demo", status: "online" },
  ];
}

export async function signIn(email: string): Promise<{ user: User }> {
  if (!email) {
    throw new Error("Email is required");
  }

  // TODO: replace with real auth
  return {
    user: { id: "dev-user", email, createdAt: new Date().toISOString() },
  };
}

export async function requestMagicLink(email: string): Promise<void> {
  if (!email) {
    throw new Error("Email is required");
  }

  const response = await fetch(`${API_BASE_URL}/auth/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error("Unable to send sign-in link");
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const response = await fetch(`${API_BASE_URL}/me`, {
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Unable to load user");
  }

  return response.json();
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to log out");
  }
}

export async function startDevicePairing(
  payload: DevicePairStartRequest = {}
): Promise<DevicePairStartResponse> {
  const response = await fetch(`${API_BASE_URL}/devices/pair/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Unable to start pairing");
  }

  return response.json();
}

export async function completeDevicePairing(
  payload: DevicePairCompleteRequest
): Promise<DevicePairCompleteResponse> {
  const response = await fetch(`${API_BASE_URL}/devices/pair/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      errorBody && typeof errorBody.error === "string"
        ? errorBody.error
        : "Unable to complete pairing";
    throw new Error(message);
  }

  return response.json();
}
