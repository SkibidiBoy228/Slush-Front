
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getUserProfile,
  getProfileReviews,
} from "../../api/profile";

import { getCurrentUsername } from "../../api/client";

import ProfileSidebar from "../../components/ProfileSidebar/ProfileSidebar";

import type {
  UserProfile,
  ProfileReview,
} from "../../types/profile";

import "./ProfileReviews.css";

interface ProfileReviewsProps {
  username: string;
}

type ReviewSort = "Newest" | "Oldest" | "ByRating";

const ProfileReviews = ({ username }: ProfileReviewsProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<ProfileReview[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ReviewSort>("Newest");

  const currentUsername = getCurrentUsername();

  const isOwnProfile =
    currentUsername?.toLowerCase() === username.toLowerCase();

  const loadData = useCallback(async (signal: { cancelled: boolean }) => {
    try {
      setIsLoading(true);
      setError("");

      const [profileData, reviewsData] = await Promise.all([
        getUserProfile(username),
        getProfileReviews(username),
      ]);

      if (signal.cancelled) return;

      setProfile(profileData);
      setReviews(reviewsData.items ?? []);
    } catch (err) {
      if (signal.cancelled) return;

      setError(
        err instanceof Error
          ? err.message
          : "Не вдалося завантажити рецензії"
      );
    } finally {
      if (!signal.cancelled) {
        setIsLoading(false);
      }
    }
  }, [username]);

  useEffect(() => {
    const signal = { cancelled: false };

    loadData(signal);

    return () => {
      signal.cancelled = true;
    };
  }, [loadData]);

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = reviews.filter((review) => {
      return (
        !query ||
        review.gameTitle.toLowerCase().includes(query) ||
        review.text.toLowerCase().includes(query)
      );
    });

    return [...result].sort((a, b) => {
      if (sort === "ByRating") {
        return b.rating - a.rating;
      }

      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      return sort === "Newest" ? dateB - dateA : dateA - dateB;
    });
  }, [reviews, search, sort]);

  const openProfile = () => {
    window.location.href = `/profile/${encodeURIComponent(username)}`;
  };

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderRating = (rating: number) => {
    const normalizedRating = Math.max(0, Math.min(5, rating));

    return (
      <div
        className="profile-review-rating"
        aria-label={`Оцінка: ${normalizedRating} з 5`}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className={
              index < Math.round(normalizedRating)
                ? "profile-review-star active"
                : "profile-review-star"
            }
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="profile-reviews-page">
        <main className="profile-reviews-container">
          <div className="profile-reviews-message">
            Завантаження рецензій...
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-reviews-page">
        <main className="profile-reviews-container">
          <div className="profile-reviews-message">
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
    <div className="profile-reviews-page">
      <main className="profile-reviews-container">
        {/* Profile header */}
        <section className="profile-reviews-header">
          <div
            className="profile-reviews-cover"
            style={{
              backgroundImage: profile.coverUrl
                ? `url("${profile.coverUrl}")`
                : undefined,
            }}
          />

          <div className="profile-reviews-user-info">
            <img
              className="profile-reviews-avatar"
              src={profile.avatarUrl}
              alt={profile.username}
            />

            <div className="profile-reviews-user-details">
              <h1>{profile.username}</h1>

              <span
                className={
                  profile.isOnline
                    ? "profile-reviews-online"
                    : "profile-reviews-offline"
                }
              >
                <span />
                {profile.isOnline ? "онлайн" : "не в мережі"}
              </span>

              <p>{profile.bio}</p>
            </div>

            <button
              className="profile-reviews-view-profile"
              onClick={openProfile}
            >
              Переглянути профіль
            </button>
          </div>
        </section>

        {/* Main content */}
        <div className="profile-reviews-layout">
          <section className="profile-reviews-main">
            <div className="profile-reviews-list">
              {/* Toolbar */}
              <div className="profile-reviews-toolbar">
                <div className="profile-reviews-search">
                  <span>⌕</span>

                  <input
                    type="search"
                    placeholder="Пошук за назвою гри..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <div className="profile-reviews-filters">
                  <label>
                    <span>Сортування:</span>

                    <select
                      value={sort}
                      onChange={(event) =>
                        setSort(event.target.value as ReviewSort)
                      }
                    >
                      <option value="Newest">Спочатку нові</option>
                      <option value="ByRating">За оцінкою</option>
                      <option value="Oldest">Спочатку старі</option>
                    </select>
                  </label>

                  <span className="profile-reviews-filter-label">
                    Усі ігри
                  </span>
                </div>
              </div>

              {/* Reviews */}
              <div className="profile-reviews-items">
                {filteredReviews.map((review, index) => (
                  <article
                    className="profile-review-card"
                    key={`${review.gameTitle}-${review.createdAt}-${index}`}
                  >
                    <div className="profile-review-banner">
                      {review.gameBannerUrl ? (
                        <img
                          src={review.gameBannerUrl}
                          alt={review.gameTitle}
                          loading="lazy"
                        />
                      ) : (
                        <div className="profile-review-banner-placeholder">
                          {review.gameTitle}
                        </div>
                      )}
                    </div>

                    <div className="profile-review-body">
                      <div className="profile-review-heading">
                        <h2>{review.gameTitle}</h2>

                        <button
                          className="profile-review-more"
                          type="button"
                          title="Додаткові дії"
                          aria-label="Додаткові дії"
                          disabled
                        >
                          •••
                        </button>
                      </div>

                      {renderRating(review.rating)}

                      <p className="profile-review-text">
                        {review.text}
                      </p>

                      <div className="profile-review-footer">
                        <div className="profile-review-stats">
                          <span
                            className="profile-review-stat"
                            title="Кількість вподобань"
                          >
                            <span className="profile-review-heart">♡</span>
                            {review.likesCount}
                          </span>

                          <span
                            className="profile-review-stat"
                            title="Кількість коментарів"
                          >
                            <svg viewBox="0 0 20 20" aria-hidden="true">
                              <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h11A1.5 1.5 0 0 1 17 4.5v8a1.5 1.5 0 0 1-1.5 1.5H9l-4 3v-3.1a1.5 1.5 0 0 1-2-1.4v-8Z" />
                            </svg>
                            {review.commentsCount}
                          </span>
                        </div>

                        <time>{formatDate(review.createdAt)}</time>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {filteredReviews.length === 0 && (
                <div className="profile-reviews-empty">
                  <span>★</span>

                  <h3>
                    {search
                      ? "Рецензій не знайдено"
                      : "Рецензій поки немає"}
                  </h3>

                  <p>
                    {search
                      ? "Спробуй змінити пошуковий запит."
                      : isOwnProfile
                        ? "Твої рецензії з'являться тут."
                        : "Цей користувач ще не публікував рецензії."}
                  </p>
                </div>
              )}
            </div>
          </section>

          <ProfileSidebar
            profile={profile}
            username={username}
            activeSection="reviews"
            className="profile-reviews-sidebar"
          />
        </div>
      </main>
    </div>
  );
};

export default ProfileReviews;
