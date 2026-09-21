import { apiRequest } from "./client";

export interface HeartbeatResponse {
  isOnline: boolean;
  lastSeenAt: string;
}

export function sendHeartbeat() {
  return apiRequest<HeartbeatResponse>("/api/Presence/heartbeat", {
    method: "POST",
  });
}