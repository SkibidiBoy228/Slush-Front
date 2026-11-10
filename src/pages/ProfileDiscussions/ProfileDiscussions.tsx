
import { useCallback, useEffect, useState } from "react";

import {
  getUserProfile,
  getProfileDiscussions,
} from "../../api/profile";

import {
  togglePostLike,
  getPostComments,
} from "../../api/community";

import { getCurrentUsername } from "../../api/client";

import ProfileSidebar from "../../components/ProfileSidebar/ProfileSidebar";
import CommunityPost from "../../components/Community/CommunityPost/CommunityPost";

import type { UserProfile } from "../../types/profile";
import type {
  CommunityPost as CommunityPostData,
  CommunitySortOption,
  PostComment,
} from "../../types/community";

import "./ProfileDiscussions.css";

interface ProfileDiscussionsProps {
  username: string;
}

const ProfileDiscussions = ({ username }: ProfileDiscussionsProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<CommunityPostData[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<CommunitySortOption>("Newest");

  const [commentsPostId, setCommentsPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const currentUsername = getCurrentUsername();

  const isOwnProfile =
    currentUsername?.toLowerCase() === username.toLowerCase();


  const loadData = useCallback(async (signal: { cancelled: boolean }) => {
    try {
      setIsLoading(true);
      setError("");

      const [profileData, postsData] = await Promise.all([
        getUserProfile(username),
        getProfileDiscussions(username, {
          sort,
          page: 1,
          pageSize: 20,
        }),
      ]);

      if (signal.cancelled) return;

      setProfile(profileData);
      setPosts(postsData.items ?? []);
    } catch (err) {
      if (signal.cancelled) return;

      setError(
        err instanceof Error
          ? err.message
          : "Не вдалося завантажити обговорення"
      );
    } finally {
      if (!signal.cancelled) {
        setIsLoading(false);
      }
    }
  }, [username, sort]);

  useEffect(() => {
    const signal = { cancelled: false };

    loadData(signal);

    return () => {
      signal.cancelled = true;
    };
  }, [loadData]);

  const handleLike = async (postId: string) => {
    const previousPosts = posts;

    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likesCount: post.likesCount + (post.isLiked ? -1 : 1),
            }
          : post
      )
    );

    try {
      await togglePostLike(postId);
    } catch {
      setPosts(previousPosts);
    }
  };

  const handleComments = async (postId: string) => {
    if (commentsPostId === postId) {
      setCommentsPostId(null);
      setComments([]);
      return;
    }

    setCommentsPostId(postId);
    setComments([]);
    setCommentsLoading(true);

    try {
      const result = await getPostComments(postId, 1, 20);
      setComments(result.items ?? []);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      post.title?.toLowerCase().includes(query) ||
      post.content?.toLowerCase().includes(query) ||
      post.shortDescription?.toLowerCase().includes(query)
    );
  });

  const openProfile = () => {
    window.location.href = `/profile/${encodeURIComponent(username)}`;
  };

  if (isLoading) {
    return (
      <div className="profile-discussions-page">
        <main className="profile-discussions-container">
          <div className="profile-discussions-message">
            Завантаження обговорень...
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-discussions-page">
        <main className="profile-discussions-container">
          <div className="profile-discussions-message">
            {error || "Профіль не знайдено"}

            <button onClick={openProfile}>
              Повернутися до профілю
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="profile-discussions-page">
      <main className="profile-discussions-container">
        <section className="profile-discussions-header">
          <div
            className="profile-discussions-cover"
            style={{
              backgroundImage: profile.coverUrl
                ? `url("${profile.coverUrl}")`
                : undefined,
            }}
          />

          <div className="profile-discussions-user-info">
            <img
              className="profile-discussions-avatar"
              src={profile.avatarUrl}
              alt={profile.username}
            />

            <div className="profile-discussions-user-details">
              <h1>{profile.username}</h1>

              <span
                className={
                  profile.isOnline
                    ? "profile-discussions-online"
                    : "profile-discussions-offline"
                }
              >
                <span />
                {profile.isOnline ? "В мережі" : "Не в мережі"}
              </span>

              <p>{profile.bio}</p>
            </div>

            <button
              className="profile-discussions-view-profile"
              onClick={openProfile}
            >
              Переглянути профіль
            </button>
          </div>
        </section>

        <div className="profile-discussions-layout">
          <section className="profile-discussions-main">
            <div className="profile-discussions-section">
              <div className="profile-discussions-heading">
                <div>
                  <h2>Обговорення</h2>
                  <p>
                    {isOwnProfile
                      ? "Твої обговорення"
                      : `Обговорення користувача ${profile.username}`}
                  </p>
                </div>

                <span>{profile.counters.discussions}</span>
              </div>

              <div className="profile-discussions-toolbar">
                <div className="profile-discussions-search">
                  <span>⌕</span>

                  <input
                    type="search"
                    placeholder="Пошук обговорень..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as CommunitySortOption)
                  }
                >
                  <option value="Newest">Спочатку нові</option>
                  <option value="ByRating">За рейтингом</option>
                </select>
              </div>

              <div className="profile-discussions-list-heading">
                <span>⌄</span>
                Усі обговорення
                <span className="profile-discussions-count">
                  {filteredPosts.length}
                </span>
              </div>

              {filteredPosts.length > 0 ? (
                <div className="profile-discussions-list">
                  {filteredPosts.map((post) => (
                    <div key={post.id}>
                      <CommunityPost
                        post={post}
                        onLike={handleLike}
                        onComments={handleComments}
                      />

                      {commentsPostId === post.id && (
                        <div className="profile-discussions-comments">
                          <h3>Коментарі</h3>

                          {commentsLoading ? (
                            <p>Завантаження коментарів...</p>
                          ) : comments.length > 0 ? (
                            comments.map((comment) => (
                              <div
                                className="profile-discussions-comment"
                                key={comment.id}
                              >
                                <img
                                  src={comment.authorAvatarUrl}
                                  alt={comment.authorUsername}
                                />

                                <div>
                                  <strong>{comment.authorUsername}</strong>
                                  <p>{comment.content}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p>Коментарів поки немає</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="profile-discussions-empty">
                  <span>💬</span>

                  <h3>
                    {search
                      ? "Обговорень не знайдено"
                      : "Обговорень поки немає"}
                  </h3>

                  <p>
                    {search
                      ? "Спробуй змінити пошуковий запит."
                      : isOwnProfile
                        ? "Створи перше обговорення, щоб почати спілкування зі спільнотою."
                        : "Цей користувач ще не створював обговорень."}
                  </p>
                </div>
              )}
            </div>
          </section>

          <ProfileSidebar
            profile={profile}
            username={username}
            activeSection="discussions"
            className="profile-discussions-sidebar"
          />
        </div>
      </main>
    </div>
  );
};

export default ProfileDiscussions;
