
export type FriendStatus =
  | "None"
  | "PendingSent"
  | "PendingReceived"
  | "Friends";

export type FriendFilter = "all" | "online";

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface FriendUser {
  userId: string;
  username: string;
  avatarUrl: string | null;
  level: number;
  lastSeenAt: string | null;
  isOnline: boolean;
  currentGameId: string | null;
  currentGameTitle: string | null;
}

export interface FriendRequest {
  id: string;
  user: FriendUser;
  createdAt: string;
}

export interface FriendStatusResponse {
  status: FriendStatus;
  requestId: string | null;
}

export interface UserSearchResult {
  userId: string;
  username: string;
  avatarUrl: string | null;
  friendStatus: FriendStatus;
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
  gameId: string | null;
  gameTitle: string | null;
  mediaUrl: string | null;
  createdAt: string;
}


export interface FriendRequestsResponse {
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
}

export interface FriendActivity {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  activityType: FriendActivityType;
  gameId: string | null;
  gameTitle: string | null;
  mediaUrl: string | null;
  createdAt: string;
}

export type FriendActivityResponse = PagedResult<FriendActivity>;
