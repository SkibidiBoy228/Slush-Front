
import { useEffect, useMemo, useState } from "react";
import { getUserProfile } from "../../api/profile";
import { getCurrentUsername } from "../../api/client";

import type { UserProfile, Badge } from "../../types/profile";

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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortType, setSortType] = useState<SortType>("date");

  const currentUsername = getCurrentUsername();

  const isOwnProfile =
    currentUsername?.toLowerCase() === username.toLowerCase();

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
              : "Не вдалося завантажити значки"
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
  }, [username]);

  const sortedBadges = useMemo(() => {
    if (!profile) return [];

    const badges = [...profile.badges];

    switch (sortType) {
      case "points":
        return badges.sort((a, b) => b.points - a.points);

      case "name":
        return badges.sort((a, b) =>
          a.title.localeCompare(b.title, "uk")
        );

      case "date":
      default:
        return badges.sort(
          (a, b) =>
            getEarnedDate(b.earnedAt) -
            getEarnedDate(a.earnedAt)
        );
    }
  }, [profile, sortType]);

  const xpProgress = profile
    ? Math.min(
        100,
        Math.max(
          0,
          (profile.currentXp / Math.max(profile.maxXp, 1)) * 100
        )
      )
    : 0;

  const openProfile = () => {
    window.location.href = `/profile/${encodeURIComponent(username)}`;
  };

  if (isLoading) {
    return (
      <div className="badges-page">
        <main className="badges-container">
          <div className="badges-message">
            Завантаження значків...
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="badges-page">

        <main className="badges-container">
          <div className="badges-message badges-error">
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
                {profile.isOnline ? "В мережі" : "Не в мережі"}
              </span>

              <p>{profile.bio}</p>
            </div>

            <button
              className="badges-profile-button"
              onClick={openProfile}
            >
              Переглянути профіль
            </button>
          </div>
        </section>

        <div className="badges-layout">
          <section className="badges-main">
            <div className="badges-section">
              <div className="badges-heading">
                <div>
                  <h2>Колекція значків</h2>
                  <p>
                    Досягнення користувача {profile.username}
                  </p>
                </div>

                <span className="badges-total">
                {profile.badges.length}
                </span>
              </div>

              <div className="badges-toolbar">
                <div className="badges-earned-count">
                  <strong>{profile.badges.length}</strong>
                  <span>Отримано значків</span>
                </div>

                <label className="badges-sort">
                  <span>Сортування:</span>

                  <select
                    value={sortType}
                    onChange={(e) =>
                      setSortType(e.target.value as SortType)
                    }
                  >
                    <option value="date">За датою отримання</option>
                    <option value="points">За кількістю очок</option>
                    <option value="name">За назвою</option>
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
                            ✦ {badge.points} очок
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

                  <h3>Досягнень поки немає</h3>

                  <p>
                    {isOwnProfile
                      ? "Виконуй завдання, грай та отримуй нові значки!"
                      : "Цей користувач ще не отримав жодного значка."}
                  </p>
                </div>
              )}
            </div>
          </section>

          <aside className="badges-sidebar">
            <section className="badges-sidebar-card badges-level-card">
              <div className="badges-sidebar-title">
                <h2>Рівень</h2>
                <span className="badges-level-number">
                  {profile.level}
                </span>
              </div>

              <div className="badges-xp-progress">
                <div style={{ width: `${xpProgress}%` }} />
              </div>

              <div className="badges-xp-labels">
                <span>{profile.currentXp} очок</span>
                <span>{profile.maxXp} очок</span>
              </div>

              <div className="badges-sidebar-divider" />

              <h3>Статистика</h3>

              <div className="badges-stat-list">
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
                  <span>Скріншоти</span>
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

              <button
                className="badges-back-button"
                onClick={openProfile}
              >
                Головна профілю
              </button>
            </section>

            <section className="badges-sidebar-card">
              <div className="badges-sidebar-title">
                <h2>Друзі</h2>
                <span>{profile.counters.friends}</span>
              </div>

              {profile.friends.length > 0 ? (
                <div className="badges-friends-list">
                  {profile.friends.map((friend) => (
                    <button
                      className="badges-friend"
                      key={friend.id}
                      onClick={() => {
                        window.location.href =
                          `/profile/${encodeURIComponent(friend.username)}`;
                      }}
                    >
                      <img
                        src={friend.avatarUrl}
                        alt={friend.username}
                      />

                      <span>{friend.username}</span>

                      <strong>{friend.level}</strong>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="badges-no-friends">
                  Друзів поки немає
                </p>
              )}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Badges;
