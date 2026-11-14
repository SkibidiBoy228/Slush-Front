
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type React from "react";
import { useTranslation } from "react-i18next";

import {
  getCommunityPostById,
  getCommunityPosts,
  getCommunityTabCounts,
  togglePostLike,
  getPostComments,
  addPostComment,
  deleteComment,
  updateComment,
} from "../../api/community";

import { getGameDetails } from "../../api/games";
import { getCurrentUsername } from "../../api/client";

import type {
  CommunityPost as CommunityPostData,
  PostComment,
  CommunityTabCounts,
} from "../../types/community";

import CommunityPostDetailsCard from "../../components/Community/CommunityPostDetailsCard/CommunityPostDetailsCard";
import CommunityComments from "../../components/Community/CommunityComments/CommunityComments";
import CommunityPostDetailsLayout from "../CommunityPostDetailsLayout/CommunityPostDetailsLayout";
import CommunityPostDetailsMeta from "../../components/Community/CommunityPostDetailsMeta/CommunityPostDetailsMeta";
import CommunityPostDetailsSkeleton from "../../components/Skeleton/CommunityPostDetailsSkeleton";

import "./CommunityPostDetails.css";

interface CommunityPostDetailsProps {
  gameId: string;
  postId: string;
}

function CommunityPostDetails({
  gameId,
  postId,
}: CommunityPostDetailsProps) {
  const { t } = useTranslation();

  const [gameTitle, setGameTitle] = useState("");
  const [post, setPost] = useState<CommunityPostData | null>(null);

  const [recommendations, setRecommendations] = useState<
    CommunityPostData[]
  >([]);

  const [comments, setComments] = useState<PostComment[]>([]);

  const [commentSort, setCommentSort] = useState<"newest" | "oldest">(
    "newest"
  );

  const [counts, setCounts] = useState<CommunityTabCounts>({
    all: 0,
    discussions: 0,
    screenshots: 0,
    videos: 0,
    guides: 0,
    news: 0,
    isSubscribed: false,
    subscribersCount: 0,
  });

  const sortedComments = [...comments].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();

    return commentSort === "newest"
      ? dateB - dateA
      : dateA - dateB;
  });

  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState("");

  const commentsRef = useRef<HTMLElement | null>(null);

  const currentUsername = getCurrentUsername();

  const loadPage = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        game,
        currentPost,
        communityCounts,
        postsResult,
      ] = await Promise.all([
        getGameDetails(gameId),
        getCommunityPostById(postId),
        getCommunityTabCounts(gameId),
        getCommunityPosts(gameId, {
          page: 1,
          pageSize: 10,
          sort: "Newest",
        }),
      ]);

      setGameTitle(game.title);
      setPost(currentPost);
      setCounts(communityCounts);

      setRecommendations(
        postsResult.items.filter((item) => item.id !== postId)
      );
    } catch (error) {
      console.error("Failed to load community post:", error);

      setError(
        error instanceof Error
          ? error.message
          : t("communityPostDetails.loadError")
      );
    } finally {
      setLoading(false);
    }
  }, [gameId, postId, t]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const handleLoadComments = useCallback(
    async (targetPostId: string) => {
      try {
        setCommentsLoading(true);

        const result = await getPostComments(
          targetPostId,
          1,
          20
        );

        setComments(result.items);
      } catch (error) {
        console.error("Failed to load comments:", error);
      } finally {
        setCommentsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    handleLoadComments(postId);
  }, [postId, handleLoadComments]);

  const handleLike = async (targetPostId: string) => {
    if (!post || post.id !== targetPostId) return;

    const previousPost = post;

    setPost({
      ...post,
      isLiked: !post.isLiked,
      likesCount: post.isLiked
        ? Math.max(0, post.likesCount - 1)
        : post.likesCount + 1,
    });

    try {
      await togglePostLike(targetPostId);
    } catch (error) {
      console.error("Failed to toggle post like:", error);
      setPost(previousPost);
    }
  };

  const handleSubmitComment = async (
    targetPostId: string,
    content: string,
    parentCommentId?: string | null
  ) => {
    const newComment = await addPostComment(targetPostId, {
      content,
      parentCommentId: parentCommentId ?? null,
    });

    setComments((current) => {
      if (!parentCommentId) {
        return [...current, newComment];
      }

      return current.map((comment) =>
        comment.id === parentCommentId
          ? {
              ...comment,
              replies: [
                ...(comment.replies ?? []),
                newComment,
              ],
            }
          : comment
      );
    });

    setPost((current) =>
      current
        ? {
            ...current,
            commentsCount: current.commentsCount + 1,
          }
        : current
    );
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);

    setComments((current) =>
      current
        .filter((comment) => comment.id !== commentId)
        .map((comment) => ({
          ...comment,
          replies: (comment.replies ?? []).filter(
            (reply) => reply.id !== commentId
          ),
        }))
    );

    setPost((current) =>
      current
        ? {
            ...current,
            commentsCount: Math.max(
              0,
              current.commentsCount - 1
            ),
          }
        : current
    );
  };

  const handleUpdateComment = async (
    commentId: string,
    content: string
  ) => {
    await updateComment(commentId, { content });

    const updateTree = (
      items: PostComment[]
    ): PostComment[] =>
      items.map((comment) => {
        if (comment.id === commentId) {
          return { ...comment, content };
        }

        return {
          ...comment,
          replies: updateTree(comment.replies ?? []),
        };
      });

    setComments((current) => updateTree(current));
  };

  const handleScrollToComments = () => {
    commentsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (loading) {
    return (
      <CommunityPostDetailsLayout
        gameId={gameId}
        gameTitle={gameTitle}
        subscribersCount={counts.subscribersCount}
        activeTab="community"
        recommendationsTitle={t("communityPostDetails.otherDiscussions")}
        recommendations={[]}
        onCreatePost={() => {
          window.location.href =
            `/game/${encodeURIComponent(gameId)}/community/create/discussion`;
        }}
        onTabChange={(tab) => {
          if (tab === "community") {
            window.location.href =
              `/game/${encodeURIComponent(gameId)}/community`;
          }
        }}
      >
        <div className="community-details-post-area">
          <CommunityPostDetailsSkeleton />
        </div>
      </CommunityPostDetailsLayout>
    );
  }

  if (error || !post) {
    return (
      <div className="community-details-status community-details-error">
        {error || t("communityPostDetails.postNotFound")}
      </div>
    );
  }

  return (
    <CommunityPostDetailsLayout
      gameId={gameId}
      gameTitle={gameTitle}
      subscribersCount={counts.subscribersCount}
      activeTab="community"
      recommendationsTitle={t("communityPostDetails.otherDiscussions")}
      recommendations={recommendations.map((item) => ({
        id: item.id,
        title: item.title ?? "",
        description: item.shortDescription ?? item.content,
        mediaUrl: item.mediaUrl,
        postType: item.postType,
        likesCount: item.likesCount,
        commentsCount: item.commentsCount,
      }))}
      onCreatePost={() => {
        window.location.href =
          `/game/${encodeURIComponent(gameId)}/community/create/discussion`;
      }}
      onTabChange={(tab) => {
        if (tab === "community") {
          window.location.href = `/game/${encodeURIComponent(
            gameId
          )}/community`;
        }
      }}
    >
      <div className="community-details-post-area">
        <CommunityPostDetailsMeta
          gameId={gameId}
          gameTitle={gameTitle}
          createdAt={post.createdAt}
        />

        <CommunityPostDetailsCard
          post={post}
          onLike={handleLike}
          onComments={handleScrollToComments}
        />

        <div
          className="community-details-comments"
          ref={commentsRef as React.RefObject<HTMLDivElement>}
        >
          <div className="community-details-sort">
            <span>{t("communityPostDetails.sorting")}:</span>

            <select
              value={commentSort}
              onChange={(event) =>
                setCommentSort(
                  event.target.value as "newest" | "oldest"
                )
              }
              aria-label={t("communityPostDetails.sortComments")}
            >
              <option value="newest">
                {t("communityPostDetails.newestFirst")}
              </option>
              <option value="oldest">
                {t("communityPostDetails.oldestFirst")}
              </option>
            </select>
          </div>

          <CommunityComments
            postId={post.id}
            comments={sortedComments}
            loading={commentsLoading}
            onLoad={handleLoadComments}
            onSubmit={handleSubmitComment}
            onDelete={handleDeleteComment}
            onUpdate={handleUpdateComment}
            currentUsername={currentUsername}
            variant="details"
          />
        </div>
      </div>
    </CommunityPostDetailsLayout>
  );
}

export default CommunityPostDetails;
