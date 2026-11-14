
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getUserProfile } from "../../api/profile";
import { getCurrentUsername } from "../../api/client";

import type { UserProfile, Badge } from "../../types/profile";
import ProfileSidebar from "../../components/ProfileSidebar/ProfileSidebar";
import BadgesSkeleton from "../../components/Skeleton/BadgesSkeleton";

import "./Badges.css";

interface BadgesProps {
  username: string;
}

type SortType = "date" | "points" | "name";

const getEarnedDate = (value: string): number => {
  if (!value) return 0;

  const parts = value.split(".");

  if (parts.length === 3) {
    return new Date(
      Number(parts[2]),
      Number(parts[1]) - 1,
      Number(parts[0])
    ).getTime();
  }

  return new Date(value).getTime() || 0;
};

const Badges = ({ username }: BadgesProps) => {
  const { t, i18n } = useTranslation();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortType, setSortType] = useState<SortType>("date");

  const currentUsername = getCurrentUsername();

  const isOwnProfile =
    currentUsername?.toLowerCase() === username.toLowerCase();

  const localeMap: Record<string, string> = {
    uk: "uk",
    en: "en",
    sk: "sk",
    ru: "ru",
  };

  const locale = localeMap[i18n.language] || "uk";

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getUserProfile(username);

        if (!cancelled) {
          setProfile(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : t("badges.loadError")
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [username, t]);

  const sortedBadges = useMemo(() => {
    if (!profile) return [];

    const badges = [...profile.badges];

    switch (sortType) {
      case "points":
        return badges.sort((a, b) => b.points - a.points);

      case "name":
        return badges.sort((a, b) =>
          a.title.localeCompare(b.title, locale)
        );

      case "date":
      default:
        return badges.sort(
          (a, b) =>
            getEarnedDate(b.earnedAt) -
            getEarnedDate(a.earnedAt)
        );
    }
  }, [profile, sortType, locale]);

  const openProfile = () => {
    window.location.href = `/profile/${encodeURIComponent(username)}`;
  };

  if (isLoading) {
    return <BadgesSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="badges-page">
        <main className="badges-container">
          <div className="badges-message badges-error">
            {error || t("badges.profileNotFound")}
            <button onClick={openProfile}>
              {t("badges.backToProfile")}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="badges-page">
      <main className="badges-container">
        <section className="badges-profile-header">
          <div
            className="badges-cover"
            style={{
              backgroundImage: profile.coverUrl
                ? `url("${profile.coverUrl}")`
                : undefined,
            }}
          />

          <div className="badges-profile-info">
            <img
              className="badges-avatar"
              src={profile.avatarUrl}
              alt={profile.username}
            />

            <div className="badges-user-details">
              <h1>{profile.username}</h1>

              <span
                className={
                  profile.isOnline
                    ? "badges-online"
                    : "badges-offline"
                }
              >
                <span />
                {profile.isOnline
                  ? t("badges.online")
                  : t("badges.offline")}
              </span>

              <p>{profile.bio}</p>
            </div>

            <button
              className="badges-profile-button"
              onClick={openProfile}
            >
              {t("badges.viewProfile")}
            </button>
          </div>
        </section>

        <div className="badges-layout">
          <section className="badges-main">
            <div className="badges-section">
              <div className="badges-heading">
                <div>
                  <h2>{t("badges.collectionTitle")}</h2>
                  <p>
                    {t("badges.userAchievements", {
                      username: profile.username,
                    })}
                  </p>
                </div>

                <span className="badges-total">
                  {profile.badges.length}
                </span>
              </div>

              <div className="badges-toolbar">
                <div className="badges-earned-count">
                  <strong>{profile.badges.length}</strong>
                  <span>{t("badges.earnedCount")}</span>
                </div>

                <label className="badges-sort">
                  <span>{t("badges.sorting")}</span>

                  <select
                    value={sortType}
                    onChange={(e) =>
                      setSortType(e.target.value as SortType)
                    }
                  >
                    <option value="date">
                      {t("badges.sortByDate")}
                    </option>
                    <option value="points">
                      {t("badges.sortByPoints")}
                    </option>
                    <option value="name">
                      {t("badges.sortByName")}
                    </option>
                  </select>
                </label>
              </div>

              {sortedBadges.length > 0 ? (
                <div className="badges-grid">
                  {sortedBadges.map((badge: Badge) => (
                    <article
                      className="badges-card"
                      key={badge.id}
                    >
                      <div className="badges-card-image">
                        {badge.imageUrl ? (
                          <img
                            src={badge.imageUrl}
                            alt={badge.title}
                          />
                        ) : (
                          <span>🏆</span>
                        )}
                      </div>

                      <div className="badges-card-content">
                        <h3>{badge.title}</h3>

                        <p>{badge.description}</p>

                        <div className="badges-card-footer">
                          <span className="badges-points">
                            ✦ {badge.points} {t("badges.points")}
                          </span>

                          <span className="badges-date">
                            {badge.earnedAt}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="badges-empty">
                  <div>🏆</div>

                  <h3>{t("badges.noAchievements")}</h3>

                  <p>
                    {isOwnProfile
                      ? t("badges.noAchievementsOwn")
                      : t("badges.noAchievementsOther")}
                  </p>
                </div>
              )}
            </div>
          </section>

          <ProfileSidebar
            profile={profile}
            username={username}
            activeSection="badges"
            className="badges-sidebar"
          />
        </div>
      </main>
    </div>
  );
};

export default Badges;
