
import { apiRequest } from "./client";

import type {
  BlockedUser,
  FriendActivityResponse,
  FriendFilter,
  FriendRequestsResponse,
  FriendStatusResponse,
  FriendUser,
  UserSearchResult,
  FriendRequest,
  PagedResult,
} from "../types/friends";

export async function getFriends(
  filter: FriendFilter = "all",
): Promise<FriendUser[]> {
  const params = new URLSearchParams({
    filter,
    page: "1",
    pageSize: "100",
  });

  const response = await apiRequest<PagedResult<FriendUser>>(
    `/api/Friends?${params.toString()}`,
    {
      method: "GET",
    },
  );

  return response.items;
}

export async function getFriendRequests(): Promise<FriendRequestsResponse> {
  const [incomingResponse, outgoingResponse] = await Promise.all([
    apiRequest<PagedResult<FriendRequest>>(
      "/api/Friends/requests/incoming?page=1&pageSize=100",
      {
        method: "GET",
      },
    ),

    apiRequest<PagedResult<FriendRequest>>(
      "/api/Friends/requests/outgoing?page=1&pageSize=100",
      {
        method: "GET",
      },
    ),
  ]);

  return {
    incoming: incomingResponse.items,
    outgoing: outgoingResponse.items,
  };
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
  const params = new URLSearchParams({
    page: "1",
    pageSize: "20",
  });

  if (query?.trim()) {
    params.set("query", query.trim());
  }

  if (gameId?.trim()) {
    params.set("gameId", gameId.trim());
  }

  const response = await apiRequest<PagedResult<UserSearchResult>>(
    `/api/Friends/search?${params.toString()}`,
    {
      method: "GET",
    },
  );

  return response.items;
}

export async function sendFriendRequest(
  targetUserId: string,
): Promise<void> {
  await apiRequest<void>(
    `/api/Friends/request/${encodeURIComponent(targetUserId)}`,
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
      method: "POST",
    },
  );
}

export async function rejectFriendRequest(
  requestId: string,
): Promise<void> {
  await apiRequest<void>(
    `/api/Friends/requests/${encodeURIComponent(requestId)}/reject`,
    {
      method: "POST",
    },
  );
}

export async function cancelFriendRequest(
  requestId: string,
): Promise<void> {
  await apiRequest<void>(
    `/api/Friends/requests/${encodeURIComponent(requestId)}`,
    {
      method: "DELETE",
    },
  );
}

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

export async function blockUser(userId: string): Promise<void> {
  await apiRequest<void>(
    `/api/Friends/${encodeURIComponent(userId)}/block`,
    {
      method: "POST",
    },
  );
}

export async function unblockUser(userId: string): Promise<void> {
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
