
export type FriendStatus =
  | "None"
  | "PendingSent"
  | "PendingReceived"
  | "Friends";

export type FriendFilter = "all" | "online";

export interface FriendUser {
  userId: string;
  username: string;
  avatarUrl: string | null;
  level: number;
  isOnline: boolean;
  lastSeenAt: string | null;
  currentGameId: string | null;
  currentGameTitle: string | null;
}

export interface FriendRequest {
  requestId: string;
  senderId: string;
  username: string;
  avatarUrl: string | null;
  level: number;
  createdAt: string;
}

export interface FriendRequestsResponse {
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
}

export interface FriendStatusResponse {
  status: FriendStatus;
  requestId: string | null;
}

export interface UserSearchResult extends FriendUser {
  friendStatus?: FriendStatus;
}

export interface BlockedUser {
  userId: string;
  username: string;
  avatarUrl: string | null;
  blockedAt: string;
}

export type FriendActivityType =
  | "GamePurchased"
  | "WishlistAdded"
  | "ScreenshotPublished";

export interface FriendActivity {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  activityType: FriendActivityType;
  gameId: string;
  gameTitle: string;
  mediaUrl: string | null;
  createdAt: string;
}

export interface FriendActivityResponse {
  items: FriendActivity[];
  totalCount: number;
  page: number;
  pageSize: number;
}
