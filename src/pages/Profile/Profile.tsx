import { useEffect, useMemo, useState, type ChangeEvent } from "react";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import {
  getProfileComments,
  getProfileGames,
  getProfileGuides,
  getProfilePosts,
  getProfileReviews,
  getProfileScreenshots,
  getProfileVideos,
  getUserProfile,
  uploadAvatar,
  uploadBanner,
} from "../../api/profile";

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

import "./Profile.css";

interface ProfileProps {
  username: string;
}

const formatPrice = (price: number): string => {
  if (price <= 0) {
    return "Безкоштовно";
  }

  return `${price.toFixed(2)} $`;
};

const Profile = ({ username }: ProfileProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [games, setGames] = useState<ProfileGame[]>([]);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [screenshots, setScreenshots] = useState<ProfileScreenshot[]>([]);
  const [videos, setVideos] = useState<ProfileVideo[]>([]);
  const [reviews, setReviews] = useState<ProfileReview[]>([]);
  const [guides, setGuides] = useState<ProfileGuide[]>([]);
  const [comments, setComments] = useState<ProfileComment[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

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

        if (isCancelled) {
          return;
        }

        setProfile(profileData);
        setGames(gamesData.items ?? []);
        setPosts(postsData.items ?? []);
        setScreenshots(screenshotsData.items ?? []);
        setVideos(videosData.items ?? []);
        setReviews(reviewsData.items ?? []);
        setGuides(guidesData.items ?? []);
        setComments(commentsData.items ?? []);
      } catch (requestError) {
        if (isCancelled) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Не вдалося завантажити профіль"
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
  }, [username]);

  const xpProgress = useMemo(() => {
    if (!profile || profile.maxXp <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(0, (profile.currentXp / profile.maxXp) * 100)
    );
  }, [profile]);

    const handleAvatarUpload = async (
    event: ChangeEvent<HTMLInputElement>
    ) => {
    const file = event.target.files?.[0];

    if (!file || !profile) {
        return;
    }

    try {
        setIsUploading(true);
        setUploadError("");

        const response = await uploadAvatar(file);
        const avatarUrl = response.url;

        setProfile((previousProfile) =>
        previousProfile
            ? {
                ...previousProfile,
                avatarUrl,
            }
            : previousProfile
        );

        setIsEditModalOpen(false);
    } catch (uploadRequestError) {
        setUploadError(
        uploadRequestError instanceof Error
            ? uploadRequestError.message
            : "Не вдалося завантажити аватарку"
        );
    } finally {
        setIsUploading(false);
        event.target.value = "";
    }
    };

  const handleBannerUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file || !profile) {
      return;
    }

    try {
      setIsUploading(true);
      setUploadError("");

      const response = await uploadBanner(file);
      const coverUrl = response.url;

      setProfile((previousProfile) =>
        previousProfile
          ? {
              ...previousProfile,
              coverUrl,
            }
          : previousProfile
      );

      setIsEditModalOpen(false);
    } catch (uploadRequestError) {
      setUploadError(
        uploadRequestError instanceof Error
          ? uploadRequestError.message
          : "Не вдалося завантажити банер"
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const closeEditModal = () => {
    if (isUploading) {
      return;
    }

    setIsEditModalOpen(false);
    setUploadError("");
  };

  if (isLoading) {
    return (
      <div className="profile-page">
        <Header />

        <main className="profile-container">
          <div className="profile-message">
            Завантаження профілю...
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-page">
        <Header />

        <main className="profile-container">
          <div className="profile-message profile-error">
            {error || "Профіль не знайдено"}
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header />

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

              <span className={`profile-status ${profile.status}`}>
                {profile.status}
              </span>

              <p>{profile.bio}</p>
            </div>

            <button
              className="profile-edit-button"
              type="button"
              onClick={() => {
                setUploadError("");
                setIsEditModalOpen(true);
              }}
            >
              Редагувати профіль
            </button>
          </div>
        </section>

        <div className="profile-layout">
          <div className="profile-main-column">
            <section className="profile-section">
              <div className="section-title-row">
                <h2>Галерея значків</h2>
                <span>{profile.counters.badges}</span>
              </div>

              <div className="badges-grid">
                <div className="badge-count">
                  <strong>{profile.counters.badges}</strong>
                  <span>Значків</span>
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
                <h2>Колекція ігор</h2>
                <span>{profile.counters.games}</span>
              </div>

              <div className="profile-stats">
                <div>
                  <strong>{profile.counters.games}</strong>
                  <span>Ігор</span>
                </div>

                <div>
                  <strong>{profile.counters.wishlist}</strong>
                  <span>У бажаному</span>
                </div>

                <div>
                  <strong>{profile.counters.badges}</strong>
                  <span>Значків</span>
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
                  Ігор поки немає
                </p>
              )}
            </section>

            <section className="profile-section">
              <div className="section-title-row">
                <h2>Галерея обговорень</h2>
                <span>{posts.length}</span>
              </div>

              {posts.map((post) => (
                <article className="content-card" key={post.id}>
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

                  {post.imageUrl && (
                    <img
                      className="content-image"
                      src={post.imageUrl}
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
                  Обговорень поки немає
                </p>
              )}
            </section>

            <section className="profile-section">
              <div className="section-title-row">
                <h2>Галерея скриншотів</h2>
                <span>{screenshots.length}</span>
              </div>

              <div className="media-grid">
                {screenshots.map((screenshot) => (
                  <article
                    className="media-card"
                    key={screenshot.id}
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
                  Скриншотів поки немає
                </p>
              )}
            </section>

            <section className="profile-section">
              <div className="section-title-row">
                <h2>Галерея відео</h2>
                <span>{videos.length}</span>
              </div>

              <div className="media-grid">
                {videos.map((video) => (
                  <a
                    className="media-card video-card"
                    key={video.id}
                    href={video.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                    />

                    <span>{video.title}</span>
                  </a>
                ))}
              </div>

              {!videos.length && (
                <p className="empty-section">
                  Відео поки немає
                </p>
              )}
            </section>

            <section className="profile-section">
              <div className="section-title-row">
                <h2>Галерея рецензій</h2>
                <span>{reviews.length}</span>
              </div>

              {reviews.map((review, index) => (
                <article
                  className="review-card"
                  key={`${review.gameId}-${index}`}
                >
                  {review.gameBannerUrl && (
                    <img
                      src={review.gameBannerUrl}
                      alt={review.gameTitle}
                    />
                  )}

                  <div>
                    <h3>{review.gameTitle}</h3>

                    <div className="review-rating">
                      {"★".repeat(
                        Math.max(
                          0,
                          Math.min(5, review.rating)
                        )
                      )}
                    </div>

                    <p>{review.text}</p>
                    <small>{review.createdAt}</small>
                  </div>
                </article>
              ))}

              {!reviews.length && (
                <p className="empty-section">
                  Рецензій поки немає
                </p>
              )}
            </section>

            <section className="profile-section">
              <div className="section-title-row">
                <h2>Галерея гайдів</h2>
                <span>{guides.length}</span>
              </div>

              {guides.map((guide, index) => (
                <article
                  className="guide-card"
                  key={`${guide.guideTitle}-${index}`}
                >
                  <h3>{guide.guideTitle}</h3>
                  <span>{guide.gameTitle}</span>
                  <p>{guide.textSnippet}</p>
                  <small>{guide.createdAt}</small>
                </article>
              ))}

              {!guides.length && (
                <p className="empty-section">
                  Гайдів поки немає
                </p>
              )}
            </section>

            <section className="profile-section">
              <div className="section-title-row">
                <h2>Коментарі</h2>
                <span>{comments.length}</span>
              </div>

              <div className="comment-form">
                <input
                  placeholder="Залишити коментар..."
                  disabled
                />
              </div>

              {comments.map((comment) => (
                <article
                  className="comment-card"
                  key={comment.id}
                >
                  <div className="content-card-header">
                    <img
                      src={comment.authorAvatarUrl}
                      alt={comment.authorUsername}
                    />

                    <div>
                      <strong>{comment.authorUsername}</strong>
                      <small>{comment.createdAt}</small>
                    </div>
                  </div>

                  <p>{comment.text}</p>
                </article>
              ))}

              {!comments.length && (
                <p className="empty-section">
                  Коментарів поки немає
                </p>
              )}
            </section>
          </div>

          <aside className="profile-sidebar">
            <section className="sidebar-card">
              <div className="sidebar-title">
                <h2>Рівень</h2>
                <strong>{profile.level}</strong>
              </div>

              <div className="xp-progress">
                <div style={{ width: `${xpProgress}%` }} />
              </div>

              <p className="xp-text">
                {profile.currentXp} / {profile.maxXp} XP
              </p>

              <h3>Статистика</h3>

              <div className="counter-list">
                <div>
                  <span>Значки</span>
                  <strong>{profile.counters.badges}</strong>
                </div>

                <div>
                  <span>Ігри</span>
                  <strong>{profile.counters.games}</strong>
                </div>

                <div>
                  <span>У бажаному</span>
                  <strong>{profile.counters.wishlist}</strong>
                </div>

                <div>
                  <span>Обговорення</span>
                  <strong>{profile.counters.discussions}</strong>
                </div>

                <div>
                  <span>Скриншоти</span>
                  <strong>{profile.counters.screenshots}</strong>
                </div>

                <div>
                  <span>Відео</span>
                  <strong>{profile.counters.videos}</strong>
                </div>

                <div>
                  <span>Гайди</span>
                  <strong>{profile.counters.guides}</strong>
                </div>

                <div>
                  <span>Рецензії</span>
                  <strong>{profile.counters.reviews}</strong>
                </div>
              </div>
            </section>

            <section className="sidebar-card">
              <div className="sidebar-title">
                <h2>Друзі</h2>
                <strong>{profile.counters.friends}</strong>
              </div>

              <div className="friends-list">
                {profile.friends.map((friend) => (
                  <a
                    href={`/profile/${encodeURIComponent(
                      friend.username
                    )}`}
                    className="friend-item"
                    key={friend.id}
                  >
                    <img
                      src={friend.avatarUrl}
                      alt={friend.username}
                    />

                    <div>
                      <strong>{friend.username}</strong>
                      <span>Рівень {friend.level}</span>
                    </div>
                  </a>
                ))}
              </div>

              {!profile.friends.length && (
                <p className="empty-section">
                  Друзів поки немає
                </p>
              )}
            </section>
          </aside>
        </div>
      </main>

      {isEditModalOpen && (
        <div
          className="profile-edit-overlay"
          onClick={closeEditModal}
        >
          <div
            className="profile-edit-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="profile-edit-modal-header">
              <h2>Редагування профілю</h2>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={isUploading}
              >
                ×
              </button>
            </div>

            <div className="profile-edit-options">
              <label className="profile-upload-option">
                <span>Змінити аватарку</span>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </label>

              <label className="profile-upload-option">
                <span>Змінити банер</span>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleBannerUpload}
                  disabled={isUploading}
                />
              </label>
            </div>

            {isUploading && (
              <p className="profile-upload-status">
                Завантаження файлу...
              </p>
            )}

            {uploadError && (
              <p className="profile-upload-error">
                {uploadError}
              </p>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Profile;