
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

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
  const { t, i18n } = useTranslation();

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
              : t("profileGames.loadError")
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
  }, [username, t]);

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
        a.title.localeCompare(b.title, i18n.language)
      );
    } else {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [games, search, sortType, priceFilter, i18n.language]);

  const openProfile = () => {
    window.location.href =
      `/profile/${encodeURIComponent(username)}`;
  };

  const openGame = (gameId: string) => {
    window.location.href = `/game/${encodeURIComponent(gameId)}`;
  };

  const formatPrice = (price: number) => {
    if (price <= 0) return t("common.free");
    return `${price.toFixed(2)} ₴`;
  };

  if (isLoading) {
    return (
      <div className="profile-games-page">
        <main className="profile-games-container">
          <div className="profile-games-message">
            {t("profileGames.loading")}
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
            {error || t("profileGames.profileNotFound")}

            <button onClick={openProfile}>
              {t("profileGames.backToProfile")}
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
                {profile.isOnline
                  ? t("profileGames.online")
                  : t("profileGames.offline")}
              </span>

              <p>{profile.bio}</p>
            </div>

            <button
              className="profile-games-view-profile"
              onClick={openProfile}
            >
              {t("profileGames.viewProfile")}
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
                  <h2>{t("profileGames.title")}</h2>
                  <p>
                    {t("profileGames.collectionDescription", {
                      username: profile.username,
                    })}
                  </p>
                </div>

                <span>{profile.counters.games}</span>
              </div>

              <div className="profile-games-toolbar">

                <div className="profile-games-search">
                  <span>⌕</span>

                  <input
                    type="search"
                    placeholder={t("profileGames.searchPlaceholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                >
                  <option value="all">
                    {t("profileGames.filterAll")}
                  </option>
                  <option value="free">
                    {t("profileGames.filterFree")}
                  </option>
                  <option value="paid">
                    {t("profileGames.filterPaid")}
                  </option>
                </select>

                <select
                  value={sortType}
                  onChange={(e) =>
                    setSortType(e.target.value as SortType)
                  }
                >
                  <option value="name">
                    {t("profileGames.sortName")}
                  </option>
                  <option value="price">
                    {t("profileGames.sortPrice")}
                  </option>
                </select>

              </div>

              <div className="profile-games-list-heading">
                <span>⌄</span>
                {t("profileGames.collection")}
                <span className="profile-games-list-count">
                  {t("profileGames.gamesCount", {
                    count: filteredGames.length,
                  })}
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
                        {t("profileGames.viewGame")}
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="profile-games-empty">
                  <span>🎮</span>

                  <h3>
                    {search
                      ? t("profileGames.notFound")
                      : t("profileGames.emptyTitle")}
                  </h3>

                  <p>
                    {search
                      ? t("profileGames.changeSearch")
                      : isOwnProfile
                        ? t("profileGames.emptyOwnDescription")
                        : t("profileGames.emptyOtherDescription")}
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
