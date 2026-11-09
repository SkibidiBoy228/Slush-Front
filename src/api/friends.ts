
import { apiRequest } from "./client";

import type {
  BlockedUser,
  FriendActivityResponse,
  FriendFilter,
  FriendRequestsResponse,
  FriendStatusResponse,
  FriendUser,
  UserSearchResult,
} from "../types/friends";


export async function getFriends(
  filter: FriendFilter = "all",
): Promise<FriendUser[]> {
  return apiRequest<FriendUser[]>(
    `/api/Friends?filter=${filter}`,
    {
      method: "GET",
    },
  );
}

export async function getFriendRequests(): Promise<FriendRequestsResponse> {
  return apiRequest<FriendRequestsResponse>(
    "/api/Friends/requests",
    {
      method: "GET",
    },
  );
}

export async function getBlockedUsers(): Promise<BlockedUser[]> {
  return apiRequest<BlockedUser[]>(
    "/api/Friends/blocked",
    {
      method: "GET",
    },
  );
}


export async function searchUsers(
  query?: string,
  gameId?: string,
): Promise<UserSearchResult[]> {
  const params = new URLSearchParams();

  if (query?.trim()) {
    params.set("query", query.trim());
  }

  if (gameId) {
    params.set("gameId", gameId);
  }

  return apiRequest<UserSearchResult[]>(
    `/api/Users/search?${params.toString()}`,
    {
      method: "GET",
    },
  );
}


export async function sendFriendRequest(
  targetUserId: string,
): Promise<void> {
  await apiRequest<void>(
    `/api/Friends/requests/${encodeURIComponent(targetUserId)}`,
    {
      method: "POST",
    },
  );
}


export async function acceptFriendRequest(
  requestId: string,
): Promise<void> {
  await apiRequest<void>(
    `/api/Friends/requests/${encodeURIComponent(requestId)}/accept`,
    {
      method: "PUT",
    },
  );
}


export async function rejectFriendRequest(
  requestId: string,
): Promise<void> {
  await apiRequest<void>(
    `/api/Friends/requests/${encodeURIComponent(requestId)}`,
    {
      method: "DELETE",
    },
  );
}

export const cancelFriendRequest = rejectFriendRequest;


export async function removeFriend(
  friendUserId: string,
): Promise<void> {
  await apiRequest<void>(
    `/api/Friends/${encodeURIComponent(friendUserId)}`,
    {
      method: "DELETE",
    },
  );
}


export async function blockUser(
  userId: string,
): Promise<void> {
  await apiRequest<void>(
    `/api/Friends/${encodeURIComponent(userId)}/block`,
    {
      method: "POST",
    },
  );
}

export async function unblockUser(
  userId: string,
): Promise<void> {
  await apiRequest<void>(
    `/api/Friends/${encodeURIComponent(userId)}/unblock`,
    {
      method: "POST",
    },
  );
}


export async function getFriendsActivity(
  page = 1,
  pageSize = 20,
): Promise<FriendActivityResponse> {
  return apiRequest<FriendActivityResponse>(
    `/api/Friends/activity?page=${page}&pageSize=${pageSize}`,
    {
      method: "GET",
    },
  );
}


export async function getFriendStatus(
  targetUserId: string,
): Promise<FriendStatusResponse> {
  return apiRequest<FriendStatusResponse>(
    `/api/Friends/status/${encodeURIComponent(targetUserId)}`,
    {
      method: "GET",
    },
  );
}
