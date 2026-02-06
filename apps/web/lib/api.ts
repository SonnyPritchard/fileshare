export type Device = {
  id: string;
  name: string;
  status: "Connected" | "Offline";
};

export type User = {
  id: string;
  email: string;
  createdAt: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export async function getDevices(): Promise<Device[]> {
  // TODO: wire to API
  return [
    { id: "device-1", name: "Office MacBook", status: "Connected" },
    { id: "device-2", name: "Home PC", status: "Offline" },
    { id: "device-3", name: "Studio Mini", status: "Connected" },
  ];
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
