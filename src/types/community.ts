export type CommunityPostType =
  | "Discussion"
  | "Screenshot"
  | "Video"
  | "Guide"
  | "News";

export type CommunitySortOption = "Newest" | "ByRating";

export interface CommunityPost {
  id: string;

  authorUsername: string;
  authorAvatarUrl: string;

  postType: CommunityPostType;
  isLiked: boolean;

  title?: string | null;
  content?: string | null;
  shortDescription?: string | null;
  mediaUrl?: string | null;

  likesCount: number;
  commentsCount: number;

  createdAt: string;
}

export interface CommunityTabCounts {
  all: number;
  discussions: number;
  screenshots: number;
  videos: number;
  guides: number;
  news: number;

  isSubscribed: boolean;
  subscribersCount: number;
}

export interface PostComment {
  id: string;

  authorUsername: string;
  authorAvatarUrl: string;

  content: string;
  createdAt: string;

  replies: PostComment[];
}

export interface CreateCommunityPostRequest {
  gameId: string;
  postType: CommunityPostType;

  title?: string;
  content?: string;
  shortDescription?: string;
  mediaUrl?: string;
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: string | null;
}

export interface UpdateCommunityPostRequest {
  title?: string;
  content?: string;
  shortDescription?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}