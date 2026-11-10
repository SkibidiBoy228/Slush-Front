
import { useEffect, useMemo, useState } from "react";

import { getUserProfile, getProfileGames } from "../../api/profile";
import { getCurrentUsername } from "../../api/client";
import ProfileSidebar from "../../components/ProfileSidebar/ProfileSidebar";

import type {
  UserProfile,
  ProfileGame,
} from "../../types/profile";
import "./ProfileGames.css";

interface ProfileGamesProps {
  username: string;
}

type SortType = "name" | "price";

const ProfileGames = ({ username }: ProfileGamesProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [games, setGames] = useState<ProfileGame[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState<SortType>("name");
  const [priceFilter, setPriceFilter] = useState("all");

  const currentUsername = getCurrentUsername();

  const isOwnProfile =
    currentUsername?.toLowerCase() === username.toLowerCase();

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [profileData, gamesData] = await Promise.all([
          getUserProfile(username),
          getProfileGames(username),
        ]);

        if (cancelled) return;

        setProfile(profileData);
        setGames(gamesData.items || []);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Не вдалося завантажити ігри"
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [username]);

  const filteredGames = useMemo(() => {
    let result = [...games];

    if (search.trim()) {
      result = result.filter((game) =>
        game.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (priceFilter === "free") {
      result = result.filter((game) => game.price <= 0);
    }

    if (priceFilter === "paid") {
      result = result.filter((game) => game.price > 0);
    }

    if (sortType === "name") {
      result.sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    } else {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [games, search, sortType, priceFilter]);

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
    window.location.href =
      `/profile/${encodeURIComponent(username)}`;
  };

  const openFriendProfile = (friendUsername: string) => {
    window.location.href =
      `/profile/${encodeURIComponent(friendUsername)}`;
  };

  const openGame = (gameId: string) => {
    window.location.href = `/game/${encodeURIComponent(gameId)}`;
  };

  const formatPrice = (price: number) => {
    if (price <= 0) return "Безкоштовно";
    return `${price.toFixed(2)} ₴`;
  };

  if (isLoading) {
    return (
      <div className="profile-games-page">
        <main className="profile-games-container">
          <div className="profile-games-message">
            Завантаження ігор...
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-games-page">
        <main className="profile-games-container">
          <div className="profile-games-message">
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
    <div className="profile-games-page">
      <main className="profile-games-container">

        {/* Profile header */}

        <section className="profile-games-header">
          <div
            className="profile-games-cover"
            style={{
              backgroundImage: profile.coverUrl
                ? `url("${profile.coverUrl}")`
                : undefined,
            }}
          />

          <div className="profile-games-user-info">
            <img
              className="profile-games-avatar"
              src={profile.avatarUrl}
              alt={profile.username}
            />

            <div className="profile-games-user-details">
              <h1>{profile.username}</h1>

              <span
                className={
                  profile.isOnline
                    ? "profile-games-online"
                    : "profile-games-offline"
                }
              >
                <span />
                {profile.isOnline ? "В мережі" : "Не в мережі"}
              </span>

              <p>{profile.bio}</p>
            </div>

            <button
              className="profile-games-view-profile"
              onClick={openProfile}
            >
              Переглянути профіль
            </button>
          </div>
        </section>

        {/* Main layout */}

        <div className="profile-games-layout">

          {/* Games */}

          <section className="profile-games-main">
            <div className="profile-games-section">

              <div className="profile-games-heading">
                <div>
                  <h2>Ігри</h2>
                  <p>
                    Колекція ігор користувача {profile.username}
                  </p>
                </div>

                <span>{profile.counters.games}</span>
              </div>

              <div className="profile-games-toolbar">

                <div className="profile-games-search">
                  <span>⌕</span>

                  <input
                    type="search"
                    placeholder="Пошук ігор..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                >
                  <option value="all">Усі ігри</option>
                  <option value="free">Безкоштовні</option>
                  <option value="paid">Платні</option>
                </select>

                <select
                  value={sortType}
                  onChange={(e) =>
                    setSortType(e.target.value as SortType)
                  }
                >
                  <option value="name">За назвою</option>
                  <option value="price">За ціною</option>
                </select>

              </div>

              <div className="profile-games-list-heading">
                <span>⌄</span>
                Колекція
                <span className="profile-games-list-count">
                  {filteredGames.length} ігор
                </span>
              </div>

              {filteredGames.length > 0 ? (
                <div className="profile-games-list">
                  {filteredGames.map((game) => (
                    <article
                      className="profile-game-card"
                      key={game.id}
                      onClick={() => openGame(game.id)}
                    >
                      <div className="profile-game-image">
                        <img
                          src={game.imageUrl}
                          alt={game.title}
                          loading="lazy"
                        />
                      </div>

                      <div className="profile-game-content">
                        <h3>{game.title}</h3>

                        <span className="profile-game-price">
                          {formatPrice(game.price)}
                        </span>
                      </div>

                      <button
                        className="profile-game-open"
                        onClick={(e) => {
                          e.stopPropagation();
                          openGame(game.id);
                        }}
                      >
                        Переглянути
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="profile-games-empty">
                  <span>🎮</span>

                  <h3>
                    {search
                      ? "Ігор не знайдено"
                      : "Колекція поки порожня"}
                  </h3>

                  <p>
                    {search
                      ? "Спробуй змінити пошуковий запит."
                      : isOwnProfile
                        ? "Придбай свою першу гру та вона з'явиться тут."
                        : "Цей користувач ще не додав ігор до колекції."}
                  </p>
                </div>
              )}

            </div>
          </section>


            <ProfileSidebar
            profile={profile}
            username={username}
            activeSection="games"
            className="profile-games-sidebar"
            />
        </div>
      </main>
    </div>
  );
};

export default ProfileGames;
