
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  getUserProfile,
  getProfileScreenshots,
} from "../../api/profile";

import { getCurrentUsername } from "../../api/client";

import ProfileSidebar from "../../components/ProfileSidebar/ProfileSidebar";

import type {
  UserProfile,
  ProfileScreenshot,
} from "../../types/profile";

import "./ProfileScreenshot.css";

interface ProfileScreenshotsProps {
  username: string;
}

const ProfileScreenshots = ({ username }: ProfileScreenshotsProps) => {
  const { t, i18n } = useTranslation();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [screenshots, setScreenshots] = useState<ProfileScreenshot[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedGame, setSelectedGame] = useState("all");
  const [sort, setSort] = useState<"Newest" | "Oldest">("Newest");

  const [selectedScreenshot, setSelectedScreenshot] =
    useState<ProfileScreenshot | null>(null);

  const currentUsername = getCurrentUsername();

  const isOwnProfile =
    currentUsername?.toLowerCase() === username.toLowerCase();

  const loadData = useCallback(async (signal: { cancelled: boolean }) => {
    try {
      setIsLoading(true);
      setError("");

      const [profileData, screenshotsData] = await Promise.all([
        getUserProfile(username),
        getProfileScreenshots(username),
      ]);

      if (signal.cancelled) return;

      setProfile(profileData);
      setScreenshots(screenshotsData.items ?? []);
    } catch (err) {
      if (signal.cancelled) return;

      setError(
        err instanceof Error
          ? err.message
          : t("profileScreenshots.loadError")
      );
    } finally {
      if (!signal.cancelled) {
        setIsLoading(false);
      }
    }
  }, [username, t]);

  useEffect(() => {
    const signal = { cancelled: false };

    loadData(signal);

    return () => {
      signal.cancelled = true;
    };
  }, [loadData]);

  const games = useMemo(() => {
    return Array.from(
      new Set(
        screenshots
          .map((screenshot) => screenshot.gameTitle)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, i18n.language));
  }, [screenshots, i18n.language]);

  const filteredScreenshots = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = screenshots.filter((screenshot) => {
      const matchesSearch =
        !query || screenshot.gameTitle.toLowerCase().includes(query);

      const matchesGame =
        selectedGame === "all" || screenshot.gameTitle === selectedGame;

      return matchesSearch && matchesGame;
    });

    return [...result].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      return sort === "Newest" ? dateB - dateA : dateA - dateB;
    });
  }, [screenshots, search, selectedGame, sort]);

  const openProfile = () => {
    window.location.href = `/profile/${encodeURIComponent(username)}`;
  };

  const closeLightbox = () => {
    setSelectedScreenshot(null);
  };

  useEffect(() => {
    if (!selectedScreenshot) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedScreenshot]);

  if (isLoading) {
    return (
      <div className="profile-screenshots-page">
        <main className="profile-screenshots-container">
          <div className="profile-screenshots-message">
            {t("profileScreenshots.loading")}
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-screenshots-page">
        <main className="profile-screenshots-container">
          <div className="profile-screenshots-message">
            {error || t("profileScreenshots.profileNotFound")}

            <button onClick={openProfile}>
              {t("profileScreenshots.backToProfile")}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="profile-screenshots-page">
      <main className="profile-screenshots-container">
        <section className="profile-screenshots-header">
          <div
            className="profile-screenshots-cover"
            style={{
              backgroundImage: profile.coverUrl
                ? `url("${profile.coverUrl}")`
                : undefined,
            }}
          />

          <div className="profile-screenshots-user-info">
            <img
              className="profile-screenshots-avatar"
              src={profile.avatarUrl}
              alt={profile.username}
            />

            <div className="profile-screenshots-user-details">
              <h1>{profile.username}</h1>

              <span
                className={
                  profile.isOnline
                    ? "profile-screenshots-online"
                    : "profile-screenshots-offline"
                }
              >
                <span />
                {profile.isOnline
                  ? t("profileScreenshots.online")
                  : t("profileScreenshots.offline")}
              </span>

              <p>{profile.bio}</p>
            </div>

            <button
              className="profile-screenshots-view-profile"
              onClick={openProfile}
            >
              {t("profileScreenshots.viewProfile")}
            </button>
          </div>
        </section>

        <div className="profile-screenshots-layout">
          <section className="profile-screenshots-main">
            <div className="profile-screenshots-gallery">
              <div className="profile-screenshots-toolbar">
                <div className="profile-screenshots-search">
                  <span>⌕</span>
                  <input
                    type="search"
                    placeholder={t("profileScreenshots.searchPlaceholder")}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <div className="profile-screenshots-filters">
                  <label>
                    <span>{t("profileScreenshots.sorting")}:</span>
                    <select
                      value={sort}
                      onChange={(event) =>
                        setSort(event.target.value as "Newest" | "Oldest")
                      }
                    >
                      <option value="Newest">
                        {t("profileScreenshots.newest")}
                      </option>
                      <option value="Oldest">
                        {t("profileScreenshots.oldest")}
                      </option>
                    </select>
                  </label>

                  <select
                    value={selectedGame}
                    onChange={(event) => setSelectedGame(event.target.value)}
                    aria-label={t("profileScreenshots.gameFilter")}
                  >
                    <option value="all">
                      {t("profileScreenshots.allGames")}
                    </option>
                    {games.map((game) => (
                      <option key={game} value={game}>
                        {game}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="profile-screenshots-grid">
                {filteredScreenshots.map((screenshot) => (
                  <button
                    className="profile-screenshot-card"
                    key={screenshot.id}
                    onClick={() => setSelectedScreenshot(screenshot)}
                    title={screenshot.gameTitle}
                  >
                    <img
                      src={screenshot.imageUrl}
                      alt={screenshot.gameTitle}
                      loading="lazy"
                    />
                    <span className="profile-screenshot-overlay">
                      {screenshot.gameTitle}
                    </span>
                  </button>
                ))}
              </div>

              {filteredScreenshots.length === 0 && (
                <div className="profile-screenshots-empty">
                  <span>▧</span>
                  <h3>
                    {search || selectedGame !== "all"
                      ? t("profileScreenshots.notFound")
                      : t("profileScreenshots.emptyTitle")}
                  </h3>
                  <p>
                    {search || selectedGame !== "all"
                      ? t("profileScreenshots.changeSearch")
                      : isOwnProfile
                        ? t("profileScreenshots.emptyOwnDescription")
                        : t("profileScreenshots.emptyOtherDescription")}
                  </p>
                </div>
              )}
            </div>
          </section>

          <ProfileSidebar
            profile={profile}
            username={username}
            activeSection="screenshots"
            className="profile-screenshots-sidebar"
          />
        </div>
      </main>

      {selectedScreenshot && (
        <div
          className="profile-screenshots-lightbox"
          onClick={closeLightbox}
          role="presentation"
        >
          <button
            className="profile-screenshots-lightbox-close"
            onClick={closeLightbox}
            aria-label={t("profileScreenshots.close")}
          >
            ×
          </button>

          <div
            className="profile-screenshots-lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={selectedScreenshot.imageUrl}
              alt={selectedScreenshot.gameTitle}
            />
            <div className="profile-screenshots-lightbox-caption">
              {selectedScreenshot.gameTitle}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileScreenshots;
