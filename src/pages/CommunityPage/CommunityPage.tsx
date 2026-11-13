
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import GameSearch from "../../components/GameSearch/GameSearch";
import CommunityTabs from "../../components/Community/CommunityTabs/CommunityTabs";
import CommunitySidebar, {
  type CommunityFilter,
  type CommunitySort,
} from "../../components/Community/CommunitySidebar/CommunitySidebar";
import CommunityPost from "../../components/Community/CommunityPost/CommunityPost";
import CommunityComments from "../../components/Community/CommunityComments/CommunityComments";

import { getGameDetails } from "../../api/games";
import { getCurrentUsername } from "../../api/client";

import {
  getCommunityPosts,
  getCommunityTabCounts,
  togglePostLike,
  getPostComments,
  addPostComment,
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
  const { t, i18n } = useTranslation();

  const localeMap: Record<string, string> = {
    uk: "uk-UA",
    en: "en-US",
    sk: "sk-SK",
    ru: "ru-RU",
  };

  const currentLocale =
    localeMap[i18n.language] ?? "uk-UA";

  const [gameTitle, setGameTitle] = useState("");
  const [gameLoading, setGameLoading] = useState(true);

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
          : t("communityPage.loadError")
      );
    } finally {
      setLoading(false);
    }
  }, [gameId, activeFilter, sort, t]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

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
          {t("communityPage.loadingCommunity")}
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

        <section className="community-page-heading">
          <div className="community-page-heading-info">
            <h1>{gameTitle}</h1>

            <div className="community-page-stats">
              <span>
                {counts.subscribersCount.toLocaleString(currentLocale)}{" "}
                {t("communityPage.subscribers")}
              </span>

              <span
                className="community-page-online-dot"
                aria-hidden="true"
              />

              <span>
                {counts.all.toLocaleString(currentLocale)}{" "}
                {t("communityPage.publications")}
              </span>
            </div>
          </div>

          <div className="community-page-heading-actions">
            <button
              type="button"
              className="community-create-button"
              onClick={() => {
                window.location.href =
                  `/game/${encodeURIComponent(gameId)}/community/create/discussion`;
              }}
            >
              <span className="community-create-icon">+</span>
              <span>{t("communityPage.createPost")}</span>
            </button>

            <div
              className="community-page-heading-tools"
              aria-label={t("communityPage.communityActions")}
            >
              <span
                className="community-page-heading-icon"
                role="img"
                aria-label={t("communityPage.notifications")}
                title={t("communityPage.notifications")}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>
              </span>

              <span
                className="community-page-heading-icon community-page-heading-more"
                role="img"
                aria-label={t("communityPage.moreActions")}
                title={t("communityPage.moreActions")}
              >
                <span aria-hidden="true">•••</span>
              </span>
            </div>
          </div>
        </section>

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
                  {t("communityPage.loadingPosts")}
                </div>
              ) : error ? (
                <div className="community-feed-state community-feed-error">
                  {error}

                  <button type="button" onClick={loadPosts}>
                    {t("communityPage.tryAgain")}
                  </button>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="community-feed-state">
                  {searchValue.trim()
                    ? t("communityPage.noSearchResults")
                    : t("communityPage.noPosts")}
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <div
                    className="community-post-wrapper"
                    key={post.id}
                  >
                    <CommunityPost
                      gameId={gameId}
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

          <aside className="community-sidebar-column">
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
          </aside>
        </div>
      </main>
    </div>
  );
}

export default CommunityPage;
