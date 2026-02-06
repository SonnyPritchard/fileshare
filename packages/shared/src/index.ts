export type Device = {
  id: string;
  name: string;
  teamId: string;
  status: "online" | "offline" | "unknown";
  lastSeenAt?: string;
};

export type ControlPlanePeer = {
  deviceId: string;
  label: string;
};

export type ControlPlaneService = {
  id: string;
  deviceId: string;
  label: string;
};

export type ControlPlaneMetadata = {
  teamId: string;
  deviceId: string;
  peers: ControlPlanePeer[];
  services: ControlPlaneService[];
  transport?: {
    provider: string;
    authRef?: string;
  };
};
