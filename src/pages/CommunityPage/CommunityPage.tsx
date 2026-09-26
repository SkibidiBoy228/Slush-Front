import { useCallback, useEffect, useMemo, useState } from "react";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
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

import {
  getCommunityPosts,
  getCommunityTabCounts,
  toggleCommunitySubscription,
  togglePostLike,
  getPostComments,
  addPostComment,
  createCommunityPost,
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

  const [posts, setPosts] = useState<CommunityPostData[]>([]);

  const [counts, setCounts] =
    useState<CommunityTabCounts>({
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

  const [sort, setSort] =
    useState<CommunitySort>("newest");

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
      console.error(
        "Failed to load game:",
        error
      );
    } finally {
      setGameLoading(false);
    }
  }, [gameId]);

  const loadCounts = useCallback(async () => {
    try {
      const data =
        await getCommunityTabCounts(gameId);

      setCounts(data);
    } catch (error) {
      console.error(
        "Failed to load community counts:",
        error
      );
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

  const getBackendSort = (
    value: CommunitySort
  ) => {
    return value === "popular"
      ? "ByRating"
      : "Newest";
  };

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCommunityPosts(
        gameId,
        {
          type: getBackendType(activeFilter),
          sort: getBackendSort(sort),
          page: 1,
          pageSize: 10,
        }
      );

      setPosts(data.items);
    } catch (error) {
      console.error(
        "Failed to load community posts:",
        error
      );

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Не вдалося завантажити публікації"
        );
      }
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
      console.error(
        "Failed to toggle subscription:",
        error
      );
    }
  };

  const handleLike = async (
    postId: string
  ) => {
    try {
      await togglePostLike(postId);

      setPosts((currentPosts) =>
        currentPosts.map((post) => {
          if (post.id !== postId) {
            return post;
          }

          return {
            ...post,
            isLiked: !post.isLiked,
            likesCount: post.isLiked
              ? post.likesCount - 1
              : post.likesCount + 1,
          };
        })
      );
    } catch (error) {
      console.error(
        "Failed to toggle like:",
        error
      );
    }
  };

  const handleLoadComments = useCallback(
    async (postId: string) => {
      try {
        setCommentsLoading((current) => ({
          ...current,
          [postId]: true,
        }));

        const result =
          await getPostComments(
            postId,
            1,
            20
          );

        setComments((current) => ({
          ...current,
          [postId]: result.items,
        }));
      } catch (error) {
        console.error(
          "Failed to load comments:",
          error
        );
      } finally {
        setCommentsLoading((current) => ({
          ...current,
          [postId]: false,
        }));
      }
    },
    []
  );

  const handleToggleComments = (
    postId: string
  ) => {
    const willOpen =
      !openComments[postId];

    setOpenComments((current) => ({
      ...current,
      [postId]: willOpen,
    }));

    if (
      willOpen &&
      !comments[postId]
    ) {
      handleLoadComments(postId);
    }
  };

  const handleSubmitComment = async (
    postId: string,
    content: string,
    parentCommentId?: string | null
  ) => {
    const comment =
      await addPostComment(
        postId,
        {
          content,
          parentCommentId:
            parentCommentId ?? null,
        }
      );

    setComments((current) => ({
      ...current,
      [postId]: [
        ...(current[postId] ?? []),
        comment,
      ],
    }));

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              commentsCount:
                post.commentsCount + 1,
            }
          : post
      )
    );
  };

  const handleCreatePost = async (
    data: {
      postType: CommunityPostType;
      title: string;
      content: string;
      shortDescription: string;
      mediaUrl: string | null;
    }
  ) => {
    try {
      const createdPost =
        await createCommunityPost({
          gameId,
          postType: data.postType,
          title:
            data.title || undefined,
          content:
            data.content || undefined,
          shortDescription:
            data.shortDescription ||
            undefined,
          mediaUrl: data.mediaUrl || undefined,
        });

      setPosts((currentPosts) => [
        createdPost,
        ...currentPosts,
      ]);

      await loadCounts();
    } catch (error) {
      console.error(
        "Failed to create post:",
        error
      );

      alert(
        "Не вдалося створити публікацію"
      );
    }
  };

  const filteredPosts = useMemo(() => {
    const search =
      searchValue.trim().toLowerCase();

    if (!search) {
      return posts;
    }

    return posts.filter((post) => {
      const title =
        post.title?.toLowerCase() ?? "";

      const content =
        post.content?.toLowerCase() ?? "";

      const description =
        post.shortDescription
          ?.toLowerCase() ?? "";

      const author =
        post.authorUsername
          ?.toLowerCase() ?? "";

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
        <Header />

        <div className="community-state-content">
          Завантаження спільноти...
        </div>
      </div>
    );
  }

  return (
    <div className="community-page">
      <Header />

      <main className="community-page-content">
        <div className="community-page-search">
          <GameSearch />
        </div>

        <CommunityHeader
          gameTitle={gameTitle}
          subscribersCount={
            counts.subscribersCount
          }
          isSubscribed={
            counts.isSubscribed
          }
          onSubscribe={handleSubscribe}
        />

        <CommunityTabs
          activeTab="community"
          onTabChange={(tab) => {
            if (tab === "about") {
              window.location.href =
                `/game/${gameId}`;
            }

            if (
              tab === "characteristics"
            ) {
              window.location.href =
                `/game/${gameId}/characteristics`;
            }
          }}
        />

        <div className="community-layout">
          <section className="community-main">
            <CommunityPostCreator
              onSubmit={handleCreatePost}
            />

            <div className="community-feed">
              {loading ? (
                <div className="community-feed-state">
                  Завантаження публікацій...
                </div>
              ) : error ? (
                <div className="community-feed-state community-feed-error">
                  {error}
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="community-feed-state">
                  Публікацій не знайдено.
                </div>
              ) : (
                filteredPosts.map(
                  (post) => (
                    <div
                      className="community-post-wrapper"
                      key={post.id}
                    >
                      <CommunityPost
                        post={post}
                        onLike={handleLike}
                        onComments={
                          handleToggleComments
                        }
                      />

                      {openComments[
                        post.id
                      ] && (
                        <CommunityComments
                          postId={post.id}
                          comments={
                            comments[
                              post.id
                            ] ?? []
                          }
                          loading={
                            commentsLoading[
                              post.id
                            ] ?? false
                          }
                          onLoad={
                            handleLoadComments
                          }
                          onSubmit={
                            handleSubmitComment
                          }
                        />
                      )}
                    </div>
                  )
                )
              )}
            </div>
          </section>

          <CommunitySidebar
            activeFilter={
              activeFilter
            }
            sort={sort}
            counts={{
              all: counts.all,
              discussions:
                counts.discussions,
              screenshots:
                counts.screenshots,
              videos: counts.videos,
              guides: counts.guides,
              news: counts.news,
            }}
            onFilterChange={
              setActiveFilter
            }
            onSortChange={setSort}
            searchValue={searchValue}
            onSearchChange={
              setSearchValue
            }
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CommunityPage;