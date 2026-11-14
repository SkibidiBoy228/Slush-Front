import {
  useEffect,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { useTranslation } from "react-i18next";

import {
  getProfileComments,
  addProfileComment,
  deleteProfileComment,
  getProfileGames,
  getProfileGuides,
  getProfilePosts,
  getProfileReviews,
  getProfileScreenshots,
  getProfileVideos,
  getUserProfile,
} from "../../api/profile";

import {
  getFriendStatus,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
} from "../../api/friends";

import type {
  UserProfile,
  ProfileComment,
  ProfileGame,
  ProfileGuide,
  ProfilePost,
  ProfileReview,
  ProfileScreenshot,
  ProfileVideo,
} from "../../types/profile";

import { useFriendPresence } from "../../hooks/useFriendPresence";

import { getCurrentUsername } from "../../api/client";

import ProfileSidebar from "../../components/ProfileSidebar/ProfileSidebar";

import "./Profile.css";
import ProfileSkeleton from "../../components/Skeleton/ProfileSkeleton";

interface ProfileProps {
  username: string;
}

const Profile = ({ username }: ProfileProps) => {
  const { t, i18n } = useTranslation();

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [games, setGames] = useState<ProfileGame[]>([]);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [screenshots, setScreenshots] = useState<ProfileScreenshot[]>([]);
  const [videos, setVideos] = useState<ProfileVideo[]>([]);
  const [reviews, setReviews] = useState<ProfileReview[]>([]);
  const [guides, setGuides] = useState<ProfileGuide[]>([]);
  const [comments, setComments] = useState<ProfileComment[]>([]);

  const [newComment, setNewComment] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentDeletingId, setCommentDeletingId] = useState<string | null>(null);
  const [commentError, setCommentError] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);

  const [friendStatus, setFriendStatus] = useState<
    "None" | "PendingSent" | "PendingReceived" | "Friends"
  >("None");

  const [friendRequestId, setFriendRequestId] = useState<string | null>(null);
  const [friendActionLoading, setFriendActionLoading] = useState(false);

  const { events } = useFriendPresence();

  const localeMap: Record<string, string> = {
    uk: "uk-UA",
    en: "en-US",
    sk: "sk-SK",
    ru: "ru-RU",
  };

  const locale = localeMap[i18n.language.split("-")[0]] || "uk-UA";

  const formatPrice = (price: number): string => {
    if (price <= 0) {
      return t("common.free");
    }

    return `${price.toFixed(2)} ₴`;
  };

  const formatLastSeen = (date: string): string => {
    return t("profile.lastSeen", {
      date: new Date(date).toLocaleString(locale, {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  };

  const openCommunityPost = (gameId: string, postId: string) => {
    if (!gameId || !postId) {
      console.error("Cannot open community post: missing gameId or postId.");
      return;
    }

    window.location.href =
      `/game/${encodeURIComponent(gameId)}/community/post/${encodeURIComponent(postId)}`;
  };

  const handlePostCardKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    gameId: string,
    postId: string
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openCommunityPost(gameId, postId);
    }
  };

  useEffect(() => {
    if (events.length === 0) return;

    const latestEvents = new Map(
      events.map((event) => [event.userId, event])
    );

    setProfile((currentProfile) => {
      if (!currentProfile) return currentProfile;

      let hasChanges = false;

      const updatedFriends = currentProfile.friends.map((friend) => {
        const latestEvent = latestEvents.get(friend.id);

        if (!latestEvent) return friend;

        const isPlaying = latestEvent.eventType === "InGame";

        const updatedFriend = {
          ...friend,
          isOnline: true,
          currentGameId: isPlaying ? latestEvent.gameId : null,
          currentGameTitle: isPlaying ? latestEvent.gameTitle : null,
        };

        if (
          friend.isOnline !== updatedFriend.isOnline ||
          friend.currentGameId !== updatedFriend.currentGameId ||
          friend.currentGameTitle !== updatedFriend.currentGameTitle
        ) {
          hasChanges = true;
          return updatedFriend;
        }

        return friend;
      });

      if (!hasChanges) return currentProfile;

      return {
        ...currentProfile,
        friends: updatedFriends,
      };
    });
  }, [events]);

  useEffect(() => {
    let isCancelled = false;

    async function loadProfile() {
      try {
        setIsLoading(true);
        setError("");

        const [
          profileData,
          gamesData,
          postsData,
          screenshotsData,
          videosData,
          reviewsData,
          guidesData,
          commentsData,
        ] = await Promise.all([
          getUserProfile(username),
          getProfileGames(username),
          getProfilePosts(username),
          getProfileScreenshots(username),
          getProfileVideos(username),
          getProfileReviews(username),
          getProfileGuides(username),
          getProfileComments(username),
        ]);

        if (isCancelled) return;

        setProfile(profileData);
        setGames(gamesData.items ?? []);
        setPosts(postsData.items ?? []);
        setScreenshots(screenshotsData.items ?? []);
        setVideos(videosData.items ?? []);
        setReviews(reviewsData.items ?? []);
        setGuides(guidesData.items ?? []);
        setComments(commentsData.items ?? []);
      } catch (requestError) {
        if (isCancelled) return;

        setError(
          requestError instanceof Error
            ? requestError.message
            : t("profile.loadError")
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isCancelled = true;
    };
  }, [username, t]);

  useEffect(() => {
    const interval = window.setInterval(async () => {
      try {
        const updatedProfile = await getUserProfile(username);
        setProfile(updatedProfile);
      } catch (error) {
        console.error("Не вдалося оновити статус:", error);
      }
    }, 30_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [username]);

  const currentUsername = getCurrentUsername();

  const isOwnProfile =
    currentUsername?.toLowerCase() === username.toLowerCase();

  useEffect(() => {
    if (isOwnProfile || !profile?.id) {
      return;
    }

    let isCancelled = false;

    getFriendStatus(profile.id)
      .then((response) => {
        if (isCancelled) return;

        setFriendStatus(response.status);
        setFriendRequestId(response.requestId);
      })
      .catch((error) => {
        console.error("Не вдалося отримати статус дружби:", error);
      });

    return () => {
      isCancelled = true;
    };
  }, [profile?.id, isOwnProfile]);

  const handleSendFriendRequest = async () => {
    if (!profile || friendActionLoading) return;

    try {
      setFriendActionLoading(true);

      await sendFriendRequest(profile.id);

      const status = await getFriendStatus(profile.id);

      setFriendStatus(status.status);
      setFriendRequestId(status.requestId);
    } catch (error) {
      console.error("Не вдалося надіслати запит", error);
    } finally {
      setFriendActionLoading(false);
    }
  };

  const handleCancelFriendRequest = async () => {
    const requestId = friendRequestId;

    if (!requestId || friendActionLoading) return;

    try {
      setFriendActionLoading(true);

      await cancelFriendRequest(requestId);

      setFriendStatus("None");
      setFriendRequestId(null);
    } catch (error) {
      console.error("Не вдалося скасувати запит:", error);
    } finally {
      setFriendActionLoading(false);
    }
  };

  const handleAcceptFriendRequest = async () => {
    const requestId = friendRequestId;

    if (!requestId || friendActionLoading) return;

    try {
      setFriendActionLoading(true);

      await acceptFriendRequest(requestId);

      setFriendStatus("Friends");
      setFriendRequestId(null);
    } catch (error) {
      console.error("Не вдалося прийняти запит:", error);
    } finally {
      setFriendActionLoading(false);
    }
  };

  const handleRejectFriendRequest = async () => {
    const requestId = friendRequestId;

    if (!requestId || friendActionLoading) return;

    try {
      setFriendActionLoading(true);

      await rejectFriendRequest(requestId);

      setFriendStatus("None");
      setFriendRequestId(null);
    } catch (error) {
      console.error("Не вдалося відхилити запит:", error);
    } finally {
      setFriendActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!profile || friendActionLoading) return;

    try {
      setFriendActionLoading(true);

      await removeFriend(profile.id);

      setFriendStatus("None");
    } catch (error) {
      console.error("Не вдалося видалити друга:", error);
    } finally {
      setFriendActionLoading(false);
    }
  };

  const handleAddComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = newComment.trim();

    if (!text || commentSubmitting) return;

    if (!currentUsername) {
      setCommentError(t("profile.commentLoginRequired"));
      return;
    }

    try {
      setCommentSubmitting(true);
      setCommentError("");

      const createdComment = await addProfileComment(username, text);

      setComments((current) => [createdComment, ...current]);
      setNewComment("");
    } catch (requestError) {
      setCommentError(
        requestError instanceof Error
          ? requestError.message
          : t("profile.commentSendError")
      );
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (commentDeletingId) return;

    if (!window.confirm(t("profile.confirmDeleteComment"))) return;

    try {
      setCommentDeletingId(commentId);
      setCommentError("");

      await deleteProfileComment(commentId);

      setComments((current) =>
        current.filter((comment) => comment.id !== commentId)
      );
    } catch (requestError) {
      setCommentError(
        requestError instanceof Error
          ? requestError.message
          : t("profile.commentDeleteError")
      );
    } finally {
      setCommentDeletingId(null);
    }
  };

  const getVideoThumbnail = (videoUrl: string) => {
    return videoUrl
      .replace("/video/upload/", "/video/upload/so_0/")
      .replace(/\.(mp4|webm|mov)(\?.*)?$/i, ".jpg");
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="profile-page">
        <main className="profile-container">
          <div className="profile-message profile-error">
            {error || t("profile.profileNotFound")}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <main className="profile-container">
        <section className="profile-top">
          <div
            className="profile-cover"
            style={{
              backgroundImage: profile.coverUrl
                ? `url("${profile.coverUrl}")`
                : undefined,
            }}
          />

          <div className="profile-main-info">
            <img
              className="profile-avatar"
              src={profile.avatarUrl}
              alt={profile.username}
            />

            <div className="profile-user-info">
              <h1>{profile.username}</h1>

              <span
                className={`profile-status ${
                  profile.isOnline ? "online" : "offline"
                }`}
              >
                <span className="profile-status-dot" />

                {profile.isOnline
                  ? t("profile.online")
                  : profile.lastSeenAt
                    ? formatLastSeen(profile.lastSeenAt)
                    : t("profile.offline")}
              </span>

              <p>{profile.bio}</p>
            </div>

            {isOwnProfile ? (
              <button
                type="button"
                className="profile-edit-button"
                onClick={() => {
                  window.location.href = "/edit-profile";
                }}
              >
                {t("profile.editProfile")}
              </button>
            ) : (
              <div className="profile-actions-wrapper">
                <button
                  type="button"
                  className="profile-message-button"
                  onClick={() => {
                    window.location.href =
                      `/chat?friendId=${encodeURIComponent(profile.id)}`;
                  }}
                >
                  {t("profile.sendMessage")}
                </button>

                <button
                  type="button"
                  className="profile-more-button"
                  onClick={() => setIsActionsMenuOpen((prev) => !prev)}
                  aria-label={t("profile.moreActions")}
                >
                  ⋯
                </button>

                {isActionsMenuOpen && (
                  <div className="profile-actions-menu">
                    <button type="button">
                      🏅 {t("profile.giveAward")}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        window.location.href =
                          `/profile/${encodeURIComponent(username)}/badges`;
                      }}
                    >
                      🏆 {t("profile.badgeCollection")}
                    </button>

                    <button type="button" disabled>
                      👥 {t("profile.inviteToGroup")}
                    </button>

                    {friendStatus === "None" && (
                      <button
                        type="button"
                        onClick={handleSendFriendRequest}
                        disabled={friendActionLoading}
                      >
                        ❤️ {t("profile.addFriend")}
                      </button>
                    )}

                    {friendStatus === "PendingSent" && (
                      <button
                        type="button"
                        onClick={handleCancelFriendRequest}
                        disabled={friendActionLoading}
                      >
                        ↩ {t("profile.cancelRequest")}
                      </button>
                    )}

                    {friendStatus === "PendingReceived" && (
                      <>
                        <button
                          type="button"
                          onClick={handleAcceptFriendRequest}
                          disabled={friendActionLoading}
                        >
                          ✓ {t("profile.acceptRequest")}
                        </button>

                        <button
                          type="button"
                          onClick={handleRejectFriendRequest}
                          disabled={friendActionLoading}
                        >
                          ✕ {t("profile.rejectRequest")}
                        </button>
                      </>
                    )}

                    {friendStatus === "Friends" && (
                      <button
                        type="button"
                        onClick={handleRemoveFriend}
                        disabled={friendActionLoading}
                      >
                        👥 {t("profile.removeFriend")}
                      </button>
                    )}

                    <button type="button">
                      🚫 {t("profile.block")}
                    </button>

                    <button type="button">
                      🚩 {t("profile.report")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <div className="profile-layout">
          <div className="profile-main-column">
            <section className="profile-section">
              <div className="section-title-row">
                <h2>{t("profile.badgeGallery")}</h2>

                <button
                  type="button"
                  className="badges-see-all"
                  onClick={() => {
                    window.location.href =
                      `/profile/${encodeURIComponent(username)}/badges`;
                  }}
                >
                  {t("profile.seeAll")} →
                </button>
              </div>

              <div className="badges-grid">
                <div className="badge-count">
                  <strong>{profile.counters.badges}</strong>
                  <span>{t("profile.badges")}</span>
                </div>

                {profile.badges.slice(0, 5).map((badge) => (
                  <div className="badge-card" key={badge.id}>
                    <img src={badge.imageUrl} alt={badge.title} />
                    <span>{badge.title}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="profile-section">
              <div className="section-title-row">
                <h2>{t("profile.gameCollection")}</h2>
                <span>{profile.counters.games}</span>
              </div>

              <div className="profile-stats">
                <div>
                  <strong>{profile.counters.games}</strong>
                  <span>{t("profile.games")}</span>
                </div>

                <div>
                  <strong>{profile.counters.wishlist}</strong>
                  <span>{t("profile.wishlist")}</span>
                </div>

                <div>
                  <strong>{profile.counters.badges}</strong>
                  <span>{t("profile.badges")}</span>
                </div>
              </div>

              <div className="games-grid">
                {games.map((game) => (
                  <article className="game-card" key={game.id}>
                    <img src={game.imageUrl} alt={game.title} />

                    <div className="game-card-info">
                      <h3>{game.title}</h3>
                      <span>{formatPrice(game.price)}</span>
                    </div>
                  </article>
                ))}
              </div>

              {!games.length && (
                <p className="empty-section">
                  {t("profile.noGames")}
                </p>
              )}
            </section>

            <section className="profile-section">
              <div className="section-title-row">
                <h2>{t("profile.discussionGallery")}</h2>
                <span>{posts.length}</span>
              </div>

              {posts.map((post) => (
                <article
                  className="content-card profile-clickable-card"
                  key={post.id}
                  role="link"
                  tabIndex={0}
                  aria-label={post.title || t("profile.discussionGallery")}
                  onClick={() => openCommunityPost(post.gameId, post.id)}
                  onKeyDown={(event) =>
                    handlePostCardKeyDown(event, post.gameId, post.id)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <div className="content-card-header">
                    <img
                      src={post.authorAvatarUrl}
                      alt={post.authorUsername}
                    />

                    <div>
                      <strong>{post.authorUsername}</strong>
                      <small>{post.createdAt}</small>
                    </div>
                  </div>

                  <h3>{post.title}</h3>

                  <p>{post.text}</p>

                  {(post.imageUrl || post.mediaUrl) && (
                    <img
                      className="content-image"
                      src={post.imageUrl || post.mediaUrl || ""}
                      alt={post.title}
                    />
                  )}

                  <div className="content-card-footer">
                    <span>♡ {post.likesCount}</span>
                    <span>◌ {post.commentsCount}</span>
                  </div>
                </article>
              ))}

              {!posts.length && (
                <p className="empty-section">
                  {t("profile.noDiscussions")}
                </p>
              )}
            </section>

            <section className="profile-section">
              <div className="section-title-row">
                <h2>{t("profile.screenshotGallery")}</h2>
                <span>{screenshots.length}</span>
              </div>

              <div className="media-grid">
                {screenshots.map((screenshot) => (
                  <article
                    className="media-card profile-clickable-card"
                    key={screenshot.id}
                    role="link"
                    tabIndex={0}
                    aria-label={screenshot.gameTitle}
                    onClick={() =>
                      openCommunityPost(screenshot.gameId, screenshot.id)
                    }
                    onKeyDown={(event) =>
                      handlePostCardKeyDown(
                        event,
                        screenshot.gameId,
                        screenshot.id
                      )
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={screenshot.imageUrl}
                      alt={screenshot.gameTitle}
                    />

                    <span>{screenshot.gameTitle}</span>
                  </article>
                ))}
              </div>

              {!screenshots.length && (
                <p className="empty-section">
                  {t("profile.noScreenshots")}
                </p>
              )}
            </section>

            <section className="profile-section">
              <div className="section-title-row">
                <h2>{t("profile.videoGallery")}</h2>
                <span>{videos.length}</span>
              </div>

              <div className="media-grid">
                {videos.map((video) => (
                  <article
                    className="media-card video-card profile-clickable-card"
                    key={video.id}
                  >
                    <video
                      src={video.videoUrl}
                      poster={
                        video.thumbnailUrl ||
                        getVideoThumbnail(video.videoUrl)
                      }
                      controls
                      preload="none"
                      playsInline
                    />

                    <span>{video.title}</span>

                    <button
                      type="button"
                      className="profile-publication-link"
                      onClick={() =>
                        openCommunityPost(video.gameId, video.id)
                      }
                    >
                      <span>{t("profile.openPublication")}</span>
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="profile-publication-link__icon"
                      >
                        <path
                          d="M7 17 17 7M7 7h10v10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </article>
                ))}
              </div>

              {!videos.length && (
                <p className="empty-section">
                  {t("profile.noVideos")}
                </p>
              )}
            </section>

            <section className="profile-section">
              <div className="section-title-row">
                <h2>{t("profile.reviewGallery")}</h2>
                <span>{reviews.length}</span>
              </div>

              {reviews.map((review, index) => (
                <article
                  className="review-card"
                  key={`${review.gameId}-${index}`}
                >
                  <img
                    src={review.gameBannerUrl}
                    alt={review.gameTitle}
                  />

                  <div>
                    <h3>{review.gameTitle}</h3>

                    <div className="review-rating">
                      {"★".repeat(
                        Math.max(0, Math.min(5, review.rating))
                      )}
                    </div>

                    <p>{review.text}</p>

                    <small>
                      ♡ {review.likesCount} ·{" "}
                      {t("profile.commentsLabel")}: {review.commentsCount}
                    </small>

                    <small>{review.createdAt}</small>
                  </div>
                </article>
              ))}

              {!reviews.length && (
                <p className="empty-section">
                  {t("profile.noReviews")}
                </p>
              )}
            </section>

            <section className="profile-section">
              <div className="section-title-row">
                <h2>{t("profile.guideGallery")}</h2>
                <span>{guides.length}</span>
              </div>

              {guides.map((guide) => (
                <article
                  className="guide-card profile-clickable-card"
                  key={guide.id}
                  role="link"
                  tabIndex={0}
                  aria-label={guide.guideTitle}
                  onClick={() => openCommunityPost(guide.gameId, guide.id)}
                  onKeyDown={(event) =>
                    handlePostCardKeyDown(event, guide.gameId, guide.id)
                  }
                  style={{ cursor: "pointer" }}
                >
                  {guide.mediaUrl && (
                    <img
                      className="guide-card-image"
                      src={guide.mediaUrl}
                      alt={guide.guideTitle}
                    />
                  )}

                  <h3>{guide.guideTitle}</h3>

                  <span>{guide.gameTitle}</span>

                  <p>{guide.textSnippet}</p>

                  <div className="content-card-footer">
                    <span>♡ {guide.likesCount}</span>
                    <span>◌ {guide.commentsCount}</span>
                    <small>{guide.createdAt}</small>
                  </div>
                </article>
              ))}

              {!guides.length && (
                <p className="empty-section">
                  {t("profile.noGuides")}
                </p>
              )}
            </section>

            <section className="profile-section">
              <div className="section-title-row">
                <h2>{t("profile.comments")}</h2>
                <span>{comments.length}</span>
              </div>

              {currentUsername ? (
                <form
                  className="comment-form"
                  onSubmit={handleAddComment}
                >
                  <input
                    type="text"
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                    placeholder={t("profile.leaveComment")}
                    disabled={commentSubmitting}
                    aria-label={t("profile.leaveComment")}
                  />

                  <button
                    type="submit"
                    disabled={!newComment.trim() || commentSubmitting}
                  >
                    {commentSubmitting
                      ? t("profile.commentSending")
                      : t("profile.commentSend")}
                  </button>
                </form>
              ) : (
                <p className="empty-section">
                  {t("profile.commentLoginRequired")}
                </p>
              )}

              {commentError && (
                <p className="profile-comment-error" role="alert">
                  {commentError}
                </p>
              )}

              <div className="profile-comments-list">
                {comments.map((comment) => {
                  const canDelete =
                    isOwnProfile ||
                    currentUsername?.toLowerCase() ===
                      comment.authorUsername.toLowerCase();

                  return (
                    <article className="comment-card" key={comment.id}>
                      <div className="content-card-header">
                        <img
                          src={comment.authorAvatarUrl}
                          alt={comment.authorUsername}
                        />

                        <div>
                          <strong>{comment.authorUsername}</strong>
                          <small>{comment.createdAt}</small>
                        </div>

                        {canDelete && (
                          <button
                            type="button"
                            className="profile-comment-delete"
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={commentDeletingId === comment.id}
                            aria-label={t("profile.deleteComment")}
                            title={t("profile.deleteComment")}
                          >
                            {commentDeletingId === comment.id ? "…" : "×"}
                          </button>
                        )}
                      </div>

                      <p>{comment.text}</p>
                    </article>
                  );
                })}
              </div>

              {!comments.length && (
                <p className="empty-section">
                  {t("profile.noComments")}
                </p>
              )}
            </section>
          </div>

          <ProfileSidebar
            profile={profile}
            username={username}
            activeSection="home"
          />
        </div>
      </main>
    </div>
  );
};

export default Profile;