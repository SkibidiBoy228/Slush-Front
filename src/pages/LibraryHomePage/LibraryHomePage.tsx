import { useCallback, useEffect, useMemo, useState } from "react";
import LibraryLayout from "../../components/Library/layout/LibraryLayout";
import LibraryNewsSection from "../../components/Library/Home/LibraryNewsSection";
import CommunityHighlights from "../../components/Library/Home/CommunityHighlights";
import {
  getLibrary,
  getLibraryHome,
  getFavoriteGames,
  getLibraryCollections,
  getCollectionGames,
  createLibraryCollection,
} from "../../api/library";
import type {
  LibraryGame,
  LibraryHome,
  LibraryCollection,
} from "../../types/library";
import "./LibraryHomePage.css";

type LibraryTab = "all" | "favorites" | "collections";
type LibraryView = "grid" | "list";

function LibraryHomePage() {
  const [home, setHome] = useState<LibraryHome | null>(null);
  const [games, setGames] = useState<LibraryGame[]>([]);
  const [favorites, setFavorites] = useState<LibraryGame[]>([]);
  const [collections, setCollections] = useState<LibraryCollection[]>([]);
  const [collectionGames, setCollectionGames] = useState<LibraryGame[]>([]);

  const [activeTab, setActiveTab] = useState<LibraryTab>("all");
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [view, setView] = useState<LibraryView>("grid");

  const [isLoading, setIsLoading] = useState(true);
  const [isCollectionLoading, setIsCollectionLoading] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collectionError, setCollectionError] = useState<string | null>(null);

  const loadLibrary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [homeData, libraryData, favoriteData, collectionData] =
        await Promise.all([
          getLibraryHome(),
          getLibrary({
            sort: "recent",
            page: "1",
            pageSize: 100,
          }),
          getFavoriteGames(),
          getLibraryCollections(),
        ]);

      setHome(homeData);
      setGames(libraryData.items);
      setFavorites(favoriteData);
      setCollections(collectionData);

      setSelectedCollection((current) => {
        if (
          current &&
          collectionData.some((collection) => collection.id === current)
        ) {
          return current;
        }

        return collectionData[0]?.id ?? null;
      });
    } catch (err) {
      console.error("Не вдалося завантажити бібліотеку:", err);
      setError("Не вдалося завантажити дані бібліотеки.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLibrary();
  }, [loadLibrary]);

  useEffect(() => {
    if (activeTab !== "collections" || !selectedCollection) {
      setCollectionGames([]);
      return;
    }

    const collectionId = selectedCollection;
    let active = true;

    async function loadSelectedCollection() {
      try {
        setIsCollectionLoading(true);
        setCollectionError(null);

        const result = await getCollectionGames(collectionId);

        if (active) {
          setCollectionGames(result);
        }
      } catch (err) {
        console.error("Не вдалося завантажити колекцію:", err);

        if (active) {
          setCollectionError("Не вдалося завантажити ігри колекції.");
        }
      } finally {
        if (active) {
          setIsCollectionLoading(false);
        }
      }
    }

    void loadSelectedCollection();

    return () => {
      active = false;
    };
  }, [activeTab, selectedCollection]);

  const visibleGames = useMemo(() => {
    let source: LibraryGame[] = [];

    if (activeTab === "all") {
      source = games;
    } else if (activeTab === "favorites") {
      source = favorites;
    } else {
      source = collectionGames;
    }

    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return source;
    }

    return source.filter((game) =>
      game.title.toLowerCase().includes(normalizedSearch),
    );
  }, [activeTab, games, favorites, collectionGames, search]);

  async function handleCreateCollection() {
    const name = window.prompt("Введіть назву нової колекції:");

    if (!name?.trim()) {
      return;
    }

    try {
      setIsCreatingCollection(true);

      const created = await createLibraryCollection({
        name: name.trim(),
      });

      setCollections((current) => [...current, created]);
      setSelectedCollection(created.id);
      setActiveTab("collections");
      setCollectionGames([]);
    } catch (err) {
      console.error("Не вдалося створити колекцію:", err);
      window.alert("Не вдалося створити колекцію. Спробуйте ще раз.");
    } finally {
      setIsCreatingCollection(false);
    }
  }

  function renderGames() {
    if (isLoading) {
      return (
        <p className="library-home__message">
          Завантаження ігор...
        </p>
      );
    }

    if (activeTab === "collections" && isCollectionLoading) {
      return (
        <p className="library-home__message">
          Завантаження колекції...
        </p>
      );
    }

    if (activeTab === "collections" && collectionError) {
      return (
        <div className="library-home__message library-home__message--error">
          {collectionError}
        </div>
      );
    }

    if (activeTab === "collections" && !selectedCollection) {
      return (
        <div className="library-home__empty">
          <h3>У вас ще немає колекцій</h3>
          <p>Створіть колекцію, щоб упорядкувати свої ігри.</p>
          <button
            type="button"
            onClick={handleCreateCollection}
            disabled={isCreatingCollection}
          >
            {isCreatingCollection ? "Створення..." : "Створити колекцію"}
          </button>
        </div>
      );
    }

    if (visibleGames.length === 0) {
      return (
        <p className="library-home__message">
          {search
            ? "За вашим запитом нічого не знайдено."
            : activeTab === "favorites"
              ? "У вас поки немає обраних ігор."
              : activeTab === "collections"
                ? "У цій колекції поки немає ігор."
                : "Ваша бібліотека поки порожня."}
        </p>
      );
    }

    return (
      <div
        className={`library-home__games library-home__games--${view}`}
      >
        {visibleGames.map((game) => (
          <a
            key={game.gameId}
            className="library-home__game"
            href={`/library/game/${encodeURIComponent(game.gameId)}`}
            title={game.title}
          >
            <div className="library-home__game-cover">
              <img
                src={game.coverImage}
                alt={game.title}
                loading="lazy"
              />

              {game.isCurrentlyPlaying && (
                <span className="library-home__playing">
                  Зараз граєте
                </span>
              )}

              {game.isFavorite && (
                <span
                  className="library-home__favorite"
                  title="В обраному"
                >
                  ♥
                </span>
              )}
            </div>

            <div className="library-home__game-info">
              <span className="library-home__game-title">
                {game.title}
              </span>

              {view === "list" && (
                <span className="library-home__game-meta">
                  {game.playtimeFormatted || "0 хв."}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    );
  }

  return (
    <LibraryLayout>
      <div className="library-home">
        <div className="library-home__toolbar">
          <label className="library-home__search">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Пошук у бібліотеці..."
              aria-label="Пошук у бібліотеці"
            />
            <span aria-hidden="true">⌕</span>
          </label>

          <div className="library-home__view">
            <span>Вид:</span>

            <button
              type="button"
              className={view === "grid" ? "is-active" : ""}
              onClick={() => setView("grid")}
              aria-label="Сітка"
              title="Сітка"
              aria-pressed={view === "grid"}
            >
              ▦
            </button>

            <button
              type="button"
              className={view === "list" ? "is-active" : ""}
              onClick={() => setView("list")}
              aria-label="Список"
              title="Список"
              aria-pressed={view === "list"}
            >
              ☰
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="library-home__message">
            Завантаження бібліотеки...
          </p>
        ) : error ? (
          <div className="library-home__error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => void loadLibrary()}>
              Спробувати ще раз
            </button>
          </div>
        ) : (
          <>
            {activeTab === "all" && !search && home && (
              <>
                <LibraryNewsSection
                  news={home.latestNews}
                  onViewAll={() => {
                    window.location.href = "/library/feed";
                  }}
                />

                <CommunityHighlights
                  posts={home.communityHighlights}
                  onViewAll={() => {
                    window.location.href = "/library/feed";
                  }}
                />
              </>
            )}

            <section className="library-home__library-section">
              <div className="library-home__tabs">
                <button
                  type="button"
                  className={
                    activeTab === "all"
                      ? "library-home__tab is-active"
                      : "library-home__tab"
                  }
                  onClick={() => setActiveTab("all")}
                >
                  Усі ігри
                </button>

                <button
                  type="button"
                  className={
                    activeTab === "favorites"
                      ? "library-home__tab is-active"
                      : "library-home__tab"
                  }
                  onClick={() => setActiveTab("favorites")}
                >
                  Обране
                </button>

                <button
                  type="button"
                  className={
                    activeTab === "collections"
                      ? "library-home__tab is-active"
                      : "library-home__tab"
                  }
                  onClick={() => setActiveTab("collections")}
                >
                  Моя колекція
                </button>

                <button
                  type="button"
                  className="library-home__add-collection"
                  onClick={handleCreateCollection}
                  disabled={isCreatingCollection}
                  title="Створити колекцію"
                  aria-label="Створити колекцію"
                >
                  +
                </button>
              </div>

              {activeTab === "collections" && collections.length > 0 && (
                <div className="library-home__collections">
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      type="button"
                      className={
                        selectedCollection === collection.id
                          ? "library-home__collection is-active"
                          : "library-home__collection"
                      }
                      onClick={() => setSelectedCollection(collection.id)}
                    >
                      <span>{collection.name}</span>
                      <small>{collection.gamesCount}</small>
                    </button>
                  ))}
                </div>
              )}

              {renderGames()}
            </section>
          </>
        )}
      </div>
    </LibraryLayout>
  );
}

export default LibraryHomePage;