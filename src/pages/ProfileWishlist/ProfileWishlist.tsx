
import { useEffect, useMemo, useState } from "react";

import { getUserProfile } from "../../api/profile";
import { getCurrentUsername } from "../../api/client";
import {
  getUserWishlist,
  removeFromWishlist,
  addToCart,
  type StoreItem,
} from "../../api/store";

import ProfileSidebar from "../../components/ProfileSidebar/ProfileSidebar";

import type { UserProfile } from "../../types/profile";

import "./ProfileWishlist.css";

interface ProfileWishlistProps {
  username: string;
}

type SortType = "newest" | "name" | "price" | "discount";
type FilterType = "all" | "discount" | "free" | "paid";

const ProfileWishlist = ({ username }: ProfileWishlistProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [games, setGames] = useState<StoreItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState<SortType>("newest");
  const [filterType, setFilterType] = useState<FilterType>("all");

  const [removingGame, setRemovingGame] = useState<string | null>(null);
  const [addingGame, setAddingGame] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const currentUsername = getCurrentUsername();

  const isOwnProfile =
    currentUsername?.toLowerCase() === username.toLowerCase();

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [profileData, wishlistData] = await Promise.all([
          getUserProfile(username),
          getUserWishlist(username),
        ]);

        if (cancelled) return;

        setProfile(profileData);
        setGames(wishlistData || []);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Не вдалося завантажити бажане"
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
      const query = search.trim().toLowerCase();

      result = result.filter((game) =>
        game.title.toLowerCase().includes(query)
      );
    }

    if (filterType === "discount") {
      result = result.filter((game) => game.discountPercent > 0);
    }

    if (filterType === "free") {
      result = result.filter((game) => game.price <= 0);
    }

    if (filterType === "paid") {
      result = result.filter((game) => game.price > 0);
    }

    switch (sortType) {
      case "name":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;

      case "price":
        result.sort((a, b) => a.price - b.price);
        break;

      case "discount":
        result.sort(
          (a, b) => b.discountPercent - a.discountPercent
        );
        break;

      case "newest":
      default:
        result.sort(
          (a, b) =>
            new Date(b.addedAt).getTime() -
            new Date(a.addedAt).getTime()
        );
        break;
    }

    return result;
  }, [games, search, sortType, filterType]);

  const openProfile = () => {
    window.location.href =
      `/profile/${encodeURIComponent(username)}`;
  };

  const openGame = (gameId: string) => {
    window.location.href =
      `/game/${encodeURIComponent(gameId)}`;
  };

  const formatPrice = (price: number) => {
    if (price <= 0) return "Безкоштовно";
    return `${price.toFixed(2)} ₴`;
  };

  const handleRemove = async (gameId: string) => {
    if (!isOwnProfile || removingGame) return;

    try {
      setRemovingGame(gameId);
      setNotice("");

      await removeFromWishlist(gameId);

      setGames((current) =>
        current.filter((game) => game.gameId !== gameId)
      );

      setProfile((current) =>
        current
          ? {
              ...current,
              counters: {
                ...current.counters,
                wishlist: Math.max(0, current.counters.wishlist - 1),
              },
            }
          : current
      );

      setNotice("Гру видалено з бажаного");
    } catch (err) {
      setNotice(
        err instanceof Error
          ? err.message
          : "Не вдалося видалити гру"
      );
    } finally {
      setRemovingGame(null);
    }
  };

  const handleAddToCart = async (game: StoreItem) => {
    if (addingGame) return;

    try {
      setAddingGame(game.gameId);
      setNotice("");

      await addToCart({
        gameId: game.gameId,
        title: game.title,
        imageUrl: game.imageUrl,
        price: game.price,
        oldPrice: game.oldPrice,
        discountPercent: game.discountPercent,
      });

      setNotice(`${game.title} додано до кошика`);
    } catch (err) {
      setNotice(
        err instanceof Error
          ? err.message
          : "Не вдалося додати гру до кошика"
      );
    } finally {
      setAddingGame(null);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-wishlist-page">
        <main className="profile-wishlist-container">
          <div className="profile-wishlist-message">
            Завантаження бажаного...
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-wishlist-page">
        <main className="profile-wishlist-container">
          <div className="profile-wishlist-message">
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
    <div className="profile-wishlist-page">
      <main className="profile-wishlist-container">

        <section className="profile-wishlist-header">
          <div
            className="profile-wishlist-cover"
            style={{
              backgroundImage: profile.coverUrl
                ? `url("${profile.coverUrl}")`
                : undefined,
            }}
          />

          <div className="profile-wishlist-user-info">
            <img
              className="profile-wishlist-avatar"
              src={profile.avatarUrl}
              alt={profile.username}
            />

            <div className="profile-wishlist-user-details">
              <h1>{profile.username}</h1>

              <span
                className={
                  profile.isOnline
                    ? "profile-wishlist-online"
                    : "profile-wishlist-offline"
                }
              >
                <span />
                {profile.isOnline ? "В мережі" : "Не в мережі"}
              </span>

              <p>{profile.bio}</p>
            </div>

            <button
              className="profile-wishlist-view-profile"
              onClick={openProfile}
            >
              Переглянути профіль
            </button>
          </div>
        </section>

        <div className="profile-wishlist-layout">

          <section className="profile-wishlist-main">
            <div className="profile-wishlist-section">

              <div className="profile-wishlist-heading">
                <div>
                  <h2>
                    {isOwnProfile ? "Моє бажане" : "Бажане"}
                  </h2>

                  <p>
                    Ігри, які {isOwnProfile
                      ? "ти хочеш придбати"
                      : `хоче придбати ${profile.username}`}
                  </p>
                </div>

                <span>{games.length}</span>
              </div>

              <div className="profile-wishlist-toolbar">
                <div className="profile-wishlist-search">
                  <span>⌕</span>

                  <input
                    type="search"
                    placeholder="Пошук за назвою гри..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <select
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(e.target.value as FilterType)
                  }
                >
                  <option value="all">Усі ігри</option>
                  <option value="discount">Зі знижкою</option>
                  <option value="paid">Платні</option>
                  <option value="free">Безкоштовні</option>
                </select>

                <select
                  value={sortType}
                  onChange={(e) =>
                    setSortType(e.target.value as SortType)
                  }
                >
                  <option value="newest">Спочатку додані</option>
                  <option value="name">За назвою</option>
                  <option value="price">За ціною</option>
                  <option value="discount">За знижкою</option>
                </select>
              </div>

              <div className="profile-wishlist-list-heading">
                <span>⌄</span>
                Бажане

                <span className="profile-wishlist-list-count">
                  {filteredGames.length} ігор
                </span>
              </div>

              {notice && (
                <div className="profile-wishlist-notice">
                  {notice}
                </div>
              )}

              {filteredGames.length > 0 ? (
                <div className="profile-wishlist-list">
                  {filteredGames.map((game) => (
                    <article
                      className="profile-wishlist-game"
                      key={game.gameId}
                    >
                      <button
                        type="button"
                        className="profile-wishlist-game-image"
                        onClick={() => openGame(game.gameId)}
                      >
                        <img
                          src={game.imageUrl}
                          alt={game.title}
                          loading="lazy"
                        />
                      </button>

                      <div className="profile-wishlist-game-content">
                        <button
                          type="button"
                          className="profile-wishlist-game-title"
                          onClick={() => openGame(game.gameId)}
                        >
                          {game.title}
                        </button>

                        <div className="profile-wishlist-game-tags">
                          <span>У бажаному</span>

                          {game.discountPercent > 0 && (
                            <span className="discount-tag">
                              -{game.discountPercent}%
                            </span>
                          )}
                        </div>

                        <div className="profile-wishlist-game-prices">
                          {game.discountPercent > 0 &&
                            game.oldPrice > game.price && (
                              <span className="old-price">
                                {formatPrice(game.oldPrice)}
                              </span>
                            )}

                          <strong>{formatPrice(game.price)}</strong>
                        </div>
                      </div>

                      <div className="profile-wishlist-game-actions">
                        <button
                          type="button"
                          className="profile-wishlist-cart"
                          onClick={() => handleAddToCart(game)}
                          disabled={addingGame === game.gameId}
                        >
                          {addingGame === game.gameId
                            ? "Додавання..."
                            : "У кошик"}
                        </button>

                        {isOwnProfile && (
                          <button
                            type="button"
                            className="profile-wishlist-remove"
                            onClick={() => handleRemove(game.gameId)}
                            disabled={removingGame === game.gameId}
                            title="Видалити з бажаного"
                          >
                            {removingGame === game.gameId ? "..." : "♥"}
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="profile-wishlist-empty">
                  <span>♡</span>

                  <h3>
                    {search || filterType !== "all"
                      ? "Ігор не знайдено"
                      : "Список бажаного порожній"}
                  </h3>

                  <p>
                    {search || filterType !== "all"
                      ? "Спробуй змінити пошук або фільтри."
                      : isOwnProfile
                        ? "Додавай ігри до бажаного, щоб не загубити їх."
                        : "Цей користувач поки не додав ігор до бажаного."}
                  </p>
                </div>
              )}

            </div>
          </section>

          <ProfileSidebar
            profile={profile}
            username={username}
            activeSection="wishlist"
            className="profile-wishlist-sidebar"
          />

        </div>
      </main>
    </div>
  );
};

export default ProfileWishlist;
