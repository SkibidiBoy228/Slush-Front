export type FriendStatus =  
    | "None"
    | "PendingSent"
    | "PendingReceived"
    | "Friends";

export interface FriendUser {
    userId: string;
    username: string;
    avatarUrl: string;
    lastSeenAt: string | null;
    isOnline: boolean;
}

export interface FriendRequest {
    id: string;
    user: FriendUser;
    createdAt: string;
}

export interface FriendStatusResponse{
    status: FriendStatus;
    requestId: string | null;
}

export interface UserSearchResult {
    userId: string;
    username: string;
    avatarUrl: string;
    friendStatus: FriendStatus;
}
export interface FriendsResponse{
    items: FriendUser[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages?: number;
}

export interface FriendRequestsResponse{
    items: FriendRequest[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages?: number;
}