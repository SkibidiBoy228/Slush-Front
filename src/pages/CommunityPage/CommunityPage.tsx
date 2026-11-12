
import { useCallback, useEffect, useMemo, useState } from "react";

import GameSearch from "../../components/GameSearch/GameSearch";
import CommunityHeader from "../../components/Community/CommunityHeader/CommunityHeader";
import CommunityTabs from "../../components/Community/CommunityTabs/CommunityTabs";
import CommunitySidebar, {
  type CommunityFilter,
  type CommunitySort,
} from "../../components/Community/CommunitySidebar/CommunitySidebar";
import CommunityPost from "../../components/Community/CommunityPost/CommunityPost";
import CommunityPostCreator from "../../components/Community/CommunityPostCreator/CommunityPostCreator";
import CommunityComments from "../../components/Community/CommunityComments/CommunityComments";

import { getGameDetails } from "../../api/games";
import { getCurrentUsername } from "../../api/client";

import {
  getCommunityPosts,
  getCommunityTabCounts,
  toggleCommunitySubscription,
  togglePostLike,
  getPostComments,
  addPostComment,
  createCommunityPost,
  deleteComment,
  updateComment,
} from "../../api/community";

import type {
  CommunityPost as CommunityPostData,
  CommunityPostType,
  CommunityTabCounts,
  PostComment,
} from "../../types/community";

import "./CommunityPage.css";

interface CommunityPageProps {
  gameId: string;
}

function CommunityPage({ gameId }: CommunityPageProps) {
  const [gameTitle, setGameTitle] = useState("");
  const [gameLoading, setGameLoading] = useState(true);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  const [posts, setPosts] = useState<CommunityPostData[]>([]);

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

  const [activeFilter, setActiveFilter] =
    useState<CommunityFilter>("all");

  const [sort, setSort] = useState<CommunitySort>("newest");
  const [searchValue, setSearchValue] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [comments, setComments] = useState<
    Record<string, PostComment[]>
  >({});

  const [commentsLoading, setCommentsLoading] =
    useState<Record<string, boolean>>({});

  const [openComments, setOpenComments] =
    useState<Record<string, boolean>>({});

  const loadGame = useCallback(async () => {
    try {
      setGameLoading(true);

      const game = await getGameDetails(gameId);
      setGameTitle(game.title);
    } catch (error) {
      console.error("Failed to load game:", error);
    } finally {
      setGameLoading(false);
    }
  }, [gameId]);

  const loadCounts = useCallback(async () => {
    try {
      const data = await getCommunityTabCounts(gameId);
      setCounts(data);
    } catch (error) {
      console.error("Failed to load community counts:", error);
    }
  }, [gameId]);

  const getBackendType = (
    filter: CommunityFilter
  ): CommunityPostType | undefined => {
    switch (filter) {
      case "discussions":
        return "Discussion";
      case "screenshots":
        return "Screenshot";
      case "videos":
        return "Video";
      case "guides":
        return "Guide";
      case "news":
        return "News";
      default:
        return undefined;
    }
  };

  const getBackendSort = (value: CommunitySort) =>
    value === "popular" ? "ByRating" : "Newest";

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCommunityPosts(gameId, {
        type: getBackendType(activeFilter),
        sort: getBackendSort(sort),
        page: 1,
        pageSize: 10,
      });

      setPosts(data.items);
    } catch (error) {
      console.error("Failed to load community posts:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Не вдалося завантажити публікації"
      );
    } finally {
      setLoading(false);
    }
  }, [gameId, activeFilter, sort]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleSubscribe = async () => {
    try {
      await toggleCommunitySubscription(gameId);
      await loadCounts();
    } catch (error) {
      console.error("Failed to toggle subscription:", error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await togglePostLike(postId);

      setPosts((currentPosts) =>
        currentPosts.map((post) => {
          if (post.id !== postId) return post;

          return {
            ...post,
            isLiked: !post.isLiked,
            likesCount: post.isLiked
              ? Math.max(0, post.likesCount - 1)
              : post.likesCount + 1,
          };
        })
      );
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleLoadComments = useCallback(async (postId: string) => {
    try {
      setCommentsLoading((current) => ({
        ...current,
        [postId]: true,
      }));

      const result = await getPostComments(postId, 1, 20);

      setComments((current) => ({
        ...current,
        [postId]: result.items,
      }));
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setCommentsLoading((current) => ({
        ...current,
        [postId]: false,
      }));
    }
  }, []);

  const handleToggleComments = (postId: string) => {
    const willOpen = !openComments[postId];

    setOpenComments((current) => ({
      ...current,
      [postId]: willOpen,
    }));
  };

  const handleSubmitComment = async (
    postId: string,
    content: string,
    parentCommentId?: string | null
  ) => {
    const comment = await addPostComment(postId, {
      content,
      parentCommentId: parentCommentId ?? null,
    });

    setComments((current) => {
      const currentComments = current[postId] ?? [];

      if (!parentCommentId) {
        return {
          ...current,
          [postId]: [...currentComments, comment],
        };
      }

      return {
        ...current,
        [postId]: currentComments.map((item) =>
          item.id === parentCommentId
            ? {
                ...item,
                replies: [...(item.replies ?? []), comment],
              }
            : item
        ),
      };
    });

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              commentsCount: post.commentsCount + 1,
            }
          : post
      )
    );
  };

  const handleUpdateComment = async (
    commentId: string,
    content: string
  ) => {
    await updateComment(commentId, { content });

    const updateCommentInTree = (
      items: PostComment[]
    ): PostComment[] =>
      items.map((item) => {
        if (item.id === commentId) {
          return {
            ...item,
            content,
          };
        }

        return {
          ...item,
          replies: updateCommentInTree(item.replies ?? []),
        };
      });

    setComments((current) => {
      const updated = { ...current };

      Object.keys(updated).forEach((postId) => {
        updated[postId] = updateCommentInTree(updated[postId]);
      });

      return updated;
    });
  };

  const handleDeleteComment = async (
    postId: string,
    commentId: string
  ) => {
    try {
      const currentComments = comments[postId] ?? [];

      const targetComment = currentComments.find(
        (comment) => comment.id === commentId
      );

      const removedCount = targetComment
        ? 1 + (targetComment.replies?.length ?? 0)
        : 1;

      await deleteComment(commentId);

      setComments((current) => {
        const currentPostComments = current[postId] ?? [];

        return {
          ...current,
          [postId]: currentPostComments
            .filter((comment) => comment.id !== commentId)
            .map((comment) => ({
              ...comment,
              replies: (comment.replies ?? []).filter(
                (reply) => reply.id !== commentId
              ),
            })),
        };
      });

      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                commentsCount: Math.max(
                  0,
                  post.commentsCount - removedCount
                ),
              }
            : post
        )
      );
    } catch (error) {
      console.error("Failed to delete comment:", error);
      throw error;
    }
  };

  const handleCreatePost = async (data: {
    postType: CommunityPostType;
    title: string;
    content: string;
    shortDescription: string;
    mediaUrl: string | null;
  }) => {
    try {
      const createdPost = await createCommunityPost({
        gameId,
        postType: data.postType,
        title: data.title || undefined,
        content: data.content || undefined,
        shortDescription: data.shortDescription || undefined,
        mediaUrl: data.mediaUrl || undefined,
      });

      setPosts((currentPosts) => [
        createdPost,
        ...currentPosts,
      ]);

      setIsCreatingPost(false);

      await loadCounts();
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("Не вдалося створити публікацію");
      throw error;
    }
  };

  const filteredPosts = useMemo(() => {
    const search = searchValue.trim().toLowerCase();

    if (!search) return posts;

    return posts.filter((post) => {
      const title = post.title?.toLowerCase() ?? "";
      const content = post.content?.toLowerCase() ?? "";
      const description =
        post.shortDescription?.toLowerCase() ?? "";
      const author = post.authorUsername?.toLowerCase() ?? "";

      return (
        title.includes(search) ||
        content.includes(search) ||
        description.includes(search) ||
        author.includes(search)
      );
    });
  }, [posts, searchValue]);

  if (gameLoading) {
    return (
      <div className="community-page-state">
        <div className="community-state-content">
          Завантаження спільноти...
        </div>
      </div>
    );
  }

  return (
    <div className="community-page">
      <main className="community-page-content">
        <div className="community-page-search">
          <GameSearch />
        </div>

        <CommunityHeader
          gameTitle={gameTitle}
          subscribersCount={counts.subscribersCount}
          isSubscribed={counts.isSubscribed}
          onSubscribe={handleSubscribe}
        />

        <CommunityTabs
          activeTab="community"
          onTabChange={(tab) => {
            if (tab === "about") {
              window.location.href = `/game/${gameId}`;
            }

            if (tab === "characteristics") {
              window.location.href = `/game/${gameId}/characteristics`;
            }
          }}
        />

        <div className="community-layout">
          <section className="community-main">
            <div className="community-feed">
              {loading ? (
                <div className="community-feed-state">
                  Завантаження публікацій...
                </div>
              ) : error ? (
                <div className="community-feed-state community-feed-error">
                  {error}
                  <button type="button" onClick={loadPosts}>
                    Спробувати ще раз
                  </button>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="community-feed-state">
                  {searchValue.trim()
                    ? "За вашим запитом нічого не знайдено."
                    : "Публікацій поки немає."}
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <div
                    className="community-post-wrapper"
                    key={post.id}
                  >
                    <CommunityPost
                      post={post}
                      onLike={handleLike}
                      onComments={handleToggleComments}
                    />

                    {openComments[post.id] && (
                      <CommunityComments
                        postId={post.id}
                        comments={comments[post.id] ?? []}
                        loading={commentsLoading[post.id] ?? false}
                        onLoad={handleLoadComments}
                        onSubmit={handleSubmitComment}
                        onDelete={(commentId) =>
                          handleDeleteComment(post.id, commentId)
                        }
                        onUpdate={handleUpdateComment}
                        currentUsername={getCurrentUsername()}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <aside className="community-sidebar">
            <div className="community-sidebar-creator">
              <CommunityPostCreator
                onSubmit={handleCreatePost}
                onOpenChange={setIsCreatingPost}
              />
            </div>

            {isCreatingPost ? (
              <div className="community-rules">
                <h3>Правила спільноти</h3>

                <ul>
                  <li>
                    Публікуйте тільки оригінальний контент.
                  </li>

                  <li>
                    Не допускайте образ та принижень на адресу інших
                    гравців, розробників чи груп.
                  </li>

                  <li>
                    Не включайте погрози або образливий контент.
                  </li>
                </ul>
              </div>
            ) : (
              <CommunitySidebar
                activeFilter={activeFilter}
                sort={sort}
                counts={{
                  all: counts.all,
                  discussions: counts.discussions,
                  screenshots: counts.screenshots,
                  videos: counts.videos,
                  guides: counts.guides,
                  news: counts.news,
                }}
                onFilterChange={setActiveFilter}
                onSortChange={setSort}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
              />
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

export default CommunityPage;
