
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  getUserProfile,
  getProfileVideos,
} from "../../api/profile";

import { getCurrentUsername } from "../../api/client";

import ProfileSidebar from "../../components/ProfileSidebar/ProfileSidebar";

import type {
  UserProfile,
  ProfileVideo,
} from "../../types/profile";

import "./ProfileVideos.css";

interface ProfileVideosProps {
  username: string;
}

const ProfileVideos = ({ username }: ProfileVideosProps) => {
  const { t, i18n } = useTranslation();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [videos, setVideos] = useState<ProfileVideo[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedGame, setSelectedGame] = useState("all");
  const [sort, setSort] = useState<"Newest" | "Oldest">("Newest");

  const [selectedVideo, setSelectedVideo] = useState<ProfileVideo | null>(null);

  const currentUsername = getCurrentUsername();

  const isOwnProfile =
    currentUsername?.toLowerCase() === username.toLowerCase();

  // Загрузка профиля и видео
  const loadData = useCallback(async (signal: { cancelled: boolean }) => {
    try {
      setIsLoading(true);
      setError("");

      const [profileData, videosData] = await Promise.all([
        getUserProfile(username),
        getProfileVideos(username),
      ]);

      if (signal.cancelled) return;

      setProfile(profileData);
      setVideos(videosData.items ?? []);
    } catch (err) {
      if (signal.cancelled) return;

      setError(
        err instanceof Error
          ? err.message
          : t("profileVideos.loadError")
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

  // Список игр для фильтра
  const games = useMemo(() => {
    return Array.from(
      new Set(
        videos
          .map((video) => video.gameTitle)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, i18n.language));
  }, [videos, i18n.language]);

  // Поиск, фильтрация и сортировка
  const filteredVideos = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = videos.filter((video) => {
      const matchesSearch =
        !query ||
        video.gameTitle.toLowerCase().includes(query) ||
        video.title.toLowerCase().includes(query);

      const matchesGame =
        selectedGame === "all" || video.gameTitle === selectedGame;

      return matchesSearch && matchesGame;
    });

    return [...result].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      return sort === "Newest" ? dateB - dateA : dateA - dateB;
    });
  }, [videos, search, selectedGame, sort]);

  const openProfile = () => {
    window.location.href = `/profile/${encodeURIComponent(username)}`;
  };

  const closePlayer = () => {
    setSelectedVideo(null);
  };

  // Закрытие плеера клавишей Escape
  useEffect(() => {
    if (!selectedVideo) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePlayer();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedVideo]);

  if (isLoading) {
    return (
      <div className="profile-videos-page">
        <main className="profile-videos-container">
          <div className="profile-videos-message">
            {t("profileVideos.loading")}
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-videos-page">
        <main className="profile-videos-container">
          <div className="profile-videos-message">
            {error || t("profileVideos.profileNotFound")}

            <button onClick={openProfile}>
              {t("profileVideos.backToProfile")}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="profile-videos-page">
      <main className="profile-videos-container">
        {/* Profile header */}
        <section className="profile-videos-header">
          <div
            className="profile-videos-cover"
            style={{
              backgroundImage: profile.coverUrl
                ? `url("${profile.coverUrl}")`
                : undefined,
            }}
          />

          <div className="profile-videos-user-info">
            <img
              className="profile-videos-avatar"
              src={profile.avatarUrl}
              alt={profile.username}
            />

            <div className="profile-videos-user-details">
              <h1>{profile.username}</h1>

              <span
                className={
                  profile.isOnline
                    ? "profile-videos-online"
                    : "profile-videos-offline"
                }
              >
                <span />
                {profile.isOnline
                  ? t("profileVideos.online")
                  : t("profileVideos.offline")}
              </span>

              <p>{profile.bio}</p>
            </div>

            <button
              className="profile-videos-view-profile"
              onClick={openProfile}
            >
              {t("profileVideos.viewProfile")}
            </button>
          </div>
        </section>

        {/* Main content */}
        <div className="profile-videos-layout">
          <section className="profile-videos-main">
            <div className="profile-videos-gallery">
              <div className="profile-videos-toolbar">
                <div className="profile-videos-search">
                  <span>⌕</span>

                  <input
                    type="search"
                    placeholder={t("profileVideos.searchPlaceholder")}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <div className="profile-videos-filters">
                  <label>
                    <span>{t("profileVideos.sorting")}:</span>

                    <select
                      value={sort}
                      onChange={(event) =>
                        setSort(event.target.value as "Newest" | "Oldest")
                      }
                    >
                      <option value="Newest">
                        {t("profileVideos.newest")}
                      </option>
                      <option value="Oldest">
                        {t("profileVideos.oldest")}
                      </option>
                    </select>
                  </label>

                  <select
                    value={selectedGame}
                    onChange={(event) => setSelectedGame(event.target.value)}
                    aria-label={t("profileVideos.gameFilter")}
                  >
                    <option value="all">
                      {t("profileVideos.allGames")}
                    </option>

                    {games.map((game) => (
                      <option key={game} value={game}>
                        {game}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Videos grid */}
              <div className="profile-videos-grid">
                {filteredVideos.map((video) => (
                  <button
                    className="profile-video-card"
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    title={video.title}
                  >
                    <video
                      className="profile-video-thumbnail"
                      src={video.videoUrl}
                      muted
                      playsInline
                      preload="metadata"
                      onLoadedMetadata={(event) => {
                        const videoElement = event.currentTarget;

                        if (videoElement.duration > 1) {
                          videoElement.currentTime = 1;
                        }
                      }}
                    />

                    <span className="profile-video-overlay">
                      <span className="profile-video-play">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8 5.5L19 12L8 18.5V5.5Z" />
                        </svg>
                      </span>
                    </span>

                    <span className="profile-video-title">
                      {video.title || video.gameTitle}
                    </span>
                  </button>
                ))}
              </div>

              {filteredVideos.length === 0 && (
                <div className="profile-videos-empty">
                  <span>▶</span>

                  <h3>
                    {search || selectedGame !== "all"
                      ? t("profileVideos.noVideosFound")
                      : t("profileVideos.emptyTitle")}
                  </h3>

                  <p>
                    {search || selectedGame !== "all"
                      ? t("profileVideos.changeSearch")
                      : isOwnProfile
                        ? t("profileVideos.emptyOwnDescription")
                        : t("profileVideos.emptyOtherDescription")}
                  </p>
                </div>
              )}
            </div>
          </section>

          <ProfileSidebar
            profile={profile}
            username={username}
            activeSection="videos"
            className="profile-videos-sidebar"
          />
        </div>
      </main>

      {/* Video player */}
      {selectedVideo && (
        <div
          className="profile-videos-player-backdrop"
          onClick={closePlayer}
          role="presentation"
        >
          <button
            className="profile-videos-player-close"
            onClick={closePlayer}
            aria-label={t("profileVideos.close")}
          >
            ×
          </button>

          <div
            className="profile-videos-player-content"
            onClick={(event) => event.stopPropagation()}
          >
            <video
              key={selectedVideo.id}
              src={selectedVideo.videoUrl}
              poster={selectedVideo.thumbnailUrl}
              controls
              autoPlay
              playsInline
            >
              {t("profileVideos.videoUnsupported")}
            </video>

            <div className="profile-videos-player-caption">
              <h3>{selectedVideo.title || selectedVideo.gameTitle}</h3>
              <span>{selectedVideo.gameTitle}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileVideos;
