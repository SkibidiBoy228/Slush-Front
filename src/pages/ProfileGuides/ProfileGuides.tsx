import { useCallback, useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";

import {
  getUserProfile,
  getProfileGuides,
} from "../../api/profile";

import { getCurrentUsername } from "../../api/client";

import ProfileSidebar from "../../components/ProfileSidebar/ProfileSidebar";
import ProfileGuidesSkeleton from "../../components/Skeleton/ProfileGuidesSkeleton";

import type {
  UserProfile,
  ProfileGuide,
} from "../../types/profile";

import "./ProfileGuides.css";

interface ProfileGuidesProps {
  username: string;
}

type GuideSort = "Newest" | "Oldest" | "ByRating";

const ProfileGuides = ({ username }: ProfileGuidesProps) => {
  const { t, i18n } = useTranslation();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [guides, setGuides] = useState<ProfileGuide[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<GuideSort>("Newest");

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
          : t("profileGuides.loadError")
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

  const openCommunityPost = (gameId: string, postId: string) => {
    if (!gameId || !postId) {
      console.error(
        "Cannot open community post: missing gameId or postId."
      );
      return;
    }

    window.location.href =
      `/game/${encodeURIComponent(gameId)}/community/post/${encodeURIComponent(postId)}`;
  };

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    const localeMap: Record<string, string> = {
      uk: "uk-UA",
      en: "en-US",
      sk: "sk-SK",
      ru: "ru-RU",
    };

    return parsedDate.toLocaleDateString(
      localeMap[i18n.language] || "uk-UA",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  if (isLoading) {
    return <ProfileGuidesSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="profile-guides-page">
        <main className="profile-guides-container">
          <div className="profile-guides-message">
            {error || t("profileGuides.profileNotFound")}

            <button onClick={openProfile}>
              {t("profileGuides.backToProfile")}
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
                {profile.isOnline
                  ? t("profileGuides.online")
                  : t("profileGuides.offline")}
              </span>

              <p>{profile.bio}</p>
            </div>

            <button
              className="profile-guides-view-profile"
              onClick={openProfile}
            >
              {t("profileGuides.viewProfile")}
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
                    placeholder={t("profileGuides.searchPlaceholder")}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <div className="profile-guides-filters">
                  <label>
                    <span>{t("profileGuides.sorting")}:</span>

                    <select
                      value={sort}
                      onChange={(event) =>
                        setSort(event.target.value as GuideSort)
                      }
                    >
                      <option value="Newest">
                        {t("profileGuides.newest")}
                      </option>

                      <option value="Oldest">
                        {t("profileGuides.oldest")}
                      </option>

                      <option value="ByRating">
                        {t("profileGuides.popular")}
                      </option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="profile-guides-items">
                {filteredGuides.map((guide, index) => (
                  <article
                    className="profile-guide-card profile-clickable-card"
                    key={`${guide.gameTitle}-${guide.guideTitle}-${guide.createdAt}-${index}`}
                    role="link"
                    tabIndex={0}
                    aria-label={guide.guideTitle}
                    onClick={() =>
                      openCommunityPost(guide.gameId, guide.id)
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();
                        openCommunityPost(guide.gameId, guide.id);
                      }
                    }}
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
                        title={t("profileGuides.moreActions")}
                        aria-label={t("profileGuides.moreActions")}
                        disabled
                      >
                        •••
                      </button>
                    </div>

                    <div className="profile-guide-content">
                      {guide.mediaUrl && (
                        <img
                          className="profile-guide-card-image"
                          src={guide.mediaUrl}
                          alt={guide.guideTitle}
                        />
                      )}

                      <div className="profile-guide-info">
                        <h3>{guide.guideTitle}</h3>
                        <p>{guide.textSnippet}</p>
                      </div>
                    </div>

                    <div className="profile-guide-actions">
                      <span
                        className="profile-guide-stat"
                        title={t("profileGuides.likesCount")}
                      >
                        <span className="profile-guide-heart">♡</span>
                        {guide.likesCount}
                      </span>

                      <span
                        className="profile-guide-stat"
                        title={t("profileGuides.commentsCount")}
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
                      ? t("profileGuides.notFound")
                      : t("profileGuides.emptyTitle")}
                  </h3>

                  <p>
                    {search
                      ? t("profileGuides.changeSearch")
                      : isOwnProfile
                        ? t("profileGuides.emptyOwnDescription")
                        : t("profileGuides.emptyOtherDescription")}
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