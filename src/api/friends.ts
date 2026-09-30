import { apiRequest } from "./client";

import type{
    FriendRequestsResponse,
    FriendsResponse,
    FriendStatusResponse,
    UserSearchResult,
} from "../types/friends"

export async function getFriends(page = 1, pageSize = 20): Promise<FriendsResponse> {
    return apiRequest<FriendsResponse>(
        `/api/Friends?page=${page}&pageSize=${pageSize}`,{
            method: "GET",
        }
    );
}
export async function getIncomingFriendRequest(page = 1, pageSize = 20) : Promise<FriendRequestsResponse> {
    return apiRequest<FriendRequestsResponse>(
        `/api/Friends/requests/incoming?page=${page}&pageSize=${pageSize}`,{
            method: "GET",
        }
    );
}
export async function getOutgoingFriendRequests(page = 1, pageSize = 20):Promise<FriendRequestsResponse> {
    return apiRequest<FriendRequestsResponse>(
        `/api/Friends/requests/outgoing?page=${page}&pageSize=${pageSize}`,{
            method: "GET",
        }
    );
}
export async function getFriendStatus(targetUserId: string) : Promise<FriendStatusResponse> {
    return apiRequest<FriendStatusResponse>(
        `/api/Friends/status/${encodeURIComponent(targetUserId)}`,{
            method: "GET",
        }
    )
}
export async function searchUsers(query: string, page = 1, pageSize = 20) : Promise<{
    items: UserSearchResult[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages?: number;
}> {
    return apiRequest(
        `/api/Friends/search?query=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`,{
            method: "GET",
        }
    )
}
export async function sendFriendRequest(targetUserId: string) : Promise<void>{
    return apiRequest(
        `/api/Friends/request/${encodeURIComponent(targetUserId)}`,{
            method: "POST",
        }
    );
}
export async function acceptFriendRequest(requestId: string) : Promise<void>{
    await apiRequest(`/api/Friends/requests/${encodeURIComponent(requestId)}/accept`,{
        method: "POST",
        }
    );
}
export async function rejectFriendRequest(requestId: string) : Promise<void>{
    await apiRequest(
        `/api/Friends/requests/${encodeURIComponent(requestId)}/reject`,{
            method: "POST",
        }
    )
}
export async function cancelFriendRequest(requestId: string) : Promise<void>{
    await apiRequest(
        `/api/Friends/requests/${encodeURIComponent(requestId)}`,{
            method: "DELETE"
        }
    )
}
export async function removeFriend(friendUserId:string) : Promise<void> {
    await apiRequest(
        `/api/Friends/${encodeURIComponent(friendUserId)}`,{
            method: "DELETE",
        }
    )
}