import { apiRequest } from "./client";

import type {
  CommunityPost as CommunityPostData,
  CommunityPostType,
  CommunitySortOption,
  CommunityTabCounts,
  CreateCommunityPostRequest,
  CreateCommentRequest,
  PostComment,
  PagedResult,
  UpdateCommentRequest,
  UpdateCommunityPostRequest,
} from "../types/community";

export async function getCommunityPosts(
  gameId: string,
  options: {
    type?: CommunityPostType;
    sort?: CommunitySortOption;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<PagedResult<CommunityPostData>> {
  const params = new URLSearchParams();

  if (options.type) {
    params.set("type", options.type);
  }

  if (options.sort) {
    params.set("sort", options.sort);
  }

  params.set("page", String(options.page ?? 1));
  params.set("pageSize", String(options.pageSize ?? 10));

  const query = params.toString();

  return apiRequest<PagedResult<CommunityPostData>>(
    `/api/Community/game/${encodeURIComponent(gameId)}?${query}`,
    {
      method: "GET",
    }
  );
}

export async function getCommunityTabCounts(
  gameId: string
): Promise<CommunityTabCounts> {
  return apiRequest<CommunityTabCounts>(
    `/api/Community/game/${encodeURIComponent(gameId)}/counts`,
    {
      method: "GET",
    }
  );
}

export async function toggleCommunitySubscription(
  gameId: string
): Promise<void> {
  await apiRequest(
    `/api/Community/game/${encodeURIComponent(gameId)}/subscribe`,
    {
      method: "POST",
    }
  );
}

export async function createCommunityPost(
  request: CreateCommunityPostRequest
): Promise<CommunityPostData> {
  return apiRequest<CommunityPostData>("/api/Community", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function togglePostLike(
  postId: string
): Promise<void> {
  await apiRequest(`/api/Community/${postId}/like`, {
    method: "POST",
  });
}

export async function getPostComments(
  postId: string,
  page = 1,
  pageSize = 20
): Promise<PagedResult<PostComment>> {
  return apiRequest<PagedResult<PostComment>>(
    `/api/Community/${postId}/comments?page=${page}&pageSize=${pageSize}`,
    {
      method: "GET",
    }
  );
}

export async function addPostComment(
  postId: string,
  request: CreateCommentRequest
): Promise<PostComment> {
  return apiRequest<PostComment>(
    `/api/Community/${postId}/comment`,
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );
}

export async function updateCommunityPost(
  postId: string,
  request: UpdateCommunityPostRequest
): Promise<void> {
  await apiRequest(`/api/Community/${postId}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export async function deleteCommunityPost(
  postId: string
): Promise<void> {
  await apiRequest(`/api/Community/${postId}`, {
    method: "DELETE",
  });
}

export async function updateComment(
  commentId: string,
  request: UpdateCommentRequest
): Promise<void> {
  await apiRequest(
    `/api/Community/comment/${commentId}`,
    {
      method: "PUT",
      body: JSON.stringify(request),
    }
  );
}

export async function deleteComment(
  commentId: string
): Promise<void> {
  await apiRequest(
    `/api/Community/comment/${commentId}`,
    {
      method: "DELETE",
    }
  );
}