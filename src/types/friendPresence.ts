
export type FriendPresenceEventType =
  | "Online"
  | "Offline"
  | "InGame"
  | "StoppedPlaying";

export interface FriendPresenceToast {
  userId: string;
  username: string;
  avatarUrl: string | null;
  eventType: FriendPresenceEventType;
  gameId: string | null;
  gameTitle: string | null;
  gameCoverUrl: string | null;
  statusText: string;
  timestamp: string;
}
