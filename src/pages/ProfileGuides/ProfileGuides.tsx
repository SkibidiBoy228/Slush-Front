
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getUserProfile,
  getProfileGuides,
} from "../../api/profile";

import { getCurrentUsername } from "../../api/client";

import ProfileSidebar from "../../components/ProfileSidebar/ProfileSidebar";

import type {
  UserProfile,
  ProfileGuide,
} from "../../types/profile";

import "./ProfileGuides.css";

interface ProfileGuidesProps {
  username: string;
}

const ProfileGuides = ({ username }: ProfileGuidesProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [guides, setGuides] = useState<ProfileGuide[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"Newest" | "Oldest" | "ByRating">("Newest");

  const currentUsername = getCurrentUsername();

  const isOwnProfile =
    currentUsername?.toLowerCase() === username.toLowerCase();

  const loadData = useCallback(async (signal: { cancelled: boolean }) => {
    try {
      setIsLoading(true);
      setError("");

      const [profileData, guidesData] = await Promise.all([
        getUserProfile(username),
        getProfileGuides(username),
      ]);

      if (signal.cancelled) return;

      setProfile(profileData);
      setGuides(guidesData.items ?? []);
    } catch (err) {
      if (signal.cancelled) return;

      setError(
        err instanceof Error
          ? err.message
          : "Не вдалося завантажити гайди"
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

  const filteredGuides = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = guides.filter((guide) => {
      return (
        !query ||
        guide.guideTitle.toLowerCase().includes(query) ||
        guide.gameTitle.toLowerCase().includes(query) ||
        guide.textSnippet.toLowerCase().includes(query)
      );
    });

    return [...result].sort((a, b) => {
      if (sort === "ByRating") {
        return (
          b.likesCount + b.commentsCount -
          (a.likesCount + a.commentsCount)
        );
      }

      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      return sort === "Newest" ? dateB - dateA : dateA - dateB;
    });
  }, [guides, search, sort]);

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

  if (isLoading) {
    return (
      <div className="profile-guides-page">
        <main className="profile-guides-container">
          <div className="profile-guides-message">
            Завантаження гайдів...
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-guides-page">
        <main className="profile-guides-container">
          <div className="profile-guides-message">
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
    <div className="profile-guides-page">
      <main className="profile-guides-container">
        <section className="profile-guides-header">
          <div
            className="profile-guides-cover"
            style={{
              backgroundImage: profile.coverUrl
                ? `url("${profile.coverUrl}")`
                : undefined,
            }}
          />

          <div className="profile-guides-user-info">
            <img
              className="profile-guides-avatar"
              src={profile.avatarUrl}
              alt={profile.username}
            />

            <div className="profile-guides-user-details">
              <h1>{profile.username}</h1>

              <span
                className={
                  profile.isOnline
                    ? "profile-guides-online"
                    : "profile-guides-offline"
                }
              >
                <span />
                {profile.isOnline ? "онлайн" : "не в мережі"}
              </span>

              <p>{profile.bio}</p>
            </div>

            <button
              className="profile-guides-view-profile"
              onClick={openProfile}
            >
              Переглянути профіль
            </button>
          </div>
        </section>
        <div className="profile-guides-layout">
          <section className="profile-guides-main">
            <div className="profile-guides-list">
              {/* Toolbar */}
              <div className="profile-guides-toolbar">
                <div className="profile-guides-search">
                  <span>⌕</span>

                  <input
                    type="search"
                    placeholder="Пошук гайдів..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <div className="profile-guides-filters">
                  <label>
                    <span>Сортування:</span>

                    <select
                      value={sort}
                      onChange={(event) =>
                        setSort(
                          event.target.value as
                            | "Newest"
                            | "Oldest"
                            | "ByRating"
                        )
                      }
                    >
                      <option value="Newest">Спочатку нові</option>
                      <option value="Oldest">Спочатку старі</option>
                      <option value="ByRating">Популярні</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className="profile-guides-items">
                {filteredGuides.map((guide, index) => (
                  <article
                    className="profile-guide-card"
                    key={`${guide.gameTitle}-${guide.guideTitle}-${guide.createdAt}-${index}`}
                  >
                    <div className="profile-guide-top">
                      <div className="profile-guide-game">
                        <span className="profile-guide-game-icon">
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M7.5 7h9a5.5 5.5 0 0 1 5.4 6.5l-.5 2.4a2.5 2.5 0 0 1-4.2 1.3l-2.1-2H8.9l-2.1 2a2.5 2.5 0 0 1-4.2-1.3l-.5-2.4A5.5 5.5 0 0 1 7.5 7Zm-.5 3v2H5v2h2v2h2v-2h2v-2H9v-2H7Zm9 1.2a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm2.5 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
                          </svg>
                        </span>

                        <span>{guide.gameTitle}</span>
                      </div>

                      <time>{formatDate(guide.createdAt)}</time>

                      <button
                        className="profile-guide-more"
                        type="button"
                        title="Додаткові дії"
                        aria-label="Додаткові дії"
                        disabled
                      >
                        •••
                      </button>
                    </div>

                    <div className="profile-guide-content">
                      <div className="profile-guide-placeholder">
                        <svg viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M24 5 43 16v16L24 43 5 32V16L24 5Z" />
                          <path d="m5 16 19 11 19-11M24 27v16M15 10l19 11" />
                        </svg>
                      </div>

                      <div className="profile-guide-info">
                        <h3>{guide.guideTitle}</h3>
                        <p>{guide.textSnippet}</p>
                      </div>
                    </div>

                    <div className="profile-guide-actions">
                      <span
                        className="profile-guide-stat"
                        title="Кількість вподобань"
                      >
                        <span className="profile-guide-heart">♡</span>
                        {guide.likesCount}
                      </span>

                      <span
                        className="profile-guide-stat"
                        title="Кількість коментарів"
                      >
                        <svg viewBox="0 0 20 20" aria-hidden="true">
                          <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h11A1.5 1.5 0 0 1 17 4.5v8a1.5 1.5 0 0 1-1.5 1.5H9l-4 3v-3.1a1.5 1.5 0 0 1-2-1.4v-8Z" />
                        </svg>
                        {guide.commentsCount}
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              {filteredGuides.length === 0 && (
                <div className="profile-guides-empty">
                  <span>▤</span>

                  <h3>
                    {search
                      ? "Гайди не знайдено"
                      : "Гайдів поки немає"}
                  </h3>

                  <p>
                    {search
                      ? "Спробуй змінити пошуковий запит."
                      : isOwnProfile
                        ? "Твої гайди з'являться тут."
                        : "Цей користувач ще не публікував гайди."}
                  </p>
                </div>
              )}
            </div>
          </section>

          <ProfileSidebar
            profile={profile}
            username={username}
            activeSection="guides"
            className="profile-guides-sidebar"
          />
        </div>
      </main>
    </div>
  );
};

export default ProfileGuides;
