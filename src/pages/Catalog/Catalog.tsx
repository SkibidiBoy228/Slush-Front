
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import GameSearch from "../../components/GameSearch/GameSearch";
import GameCard, {
  type Game,
} from "../../components/GameCard/GameCard";

import {
  getGames,
  getGameDetails,
} from "../../api/games";

import {
  getLibrary,
  getLibraryCollections,
  addGameToCollections,
} from "../../api/library";

import type { CatalogGame } from "../../types/catalog";
import type { GameDetails } from "../../types/game";
import type {
  LibraryGame,
  LibraryCollection,
} from "../../types/library";

import { formatPrice, USD_TO_UAH } from "../../utils/price";

import "./Catalog.css";

type ActualGame = CatalogGame & {
  details: GameDetails;
};

type SortOption =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "discount"
  | "name";

type PriceFilter =
  | "all"
  | "free"
  | "100"
  | "300"
  | "600"
  | "900";

function Catalog() {
  const { t } = useTranslation();

  const [games, setGames] = useState<ActualGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("relevance");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [onlyDiscounts, setOnlyDiscounts] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [collections, setCollections] = useState<LibraryCollection[]>([]);
  const [libraryGames, setLibraryGames] = useState<LibraryGame[]>([]);
  const [openedGameId, setOpenedGameId] = useState<string | null>(null);
  const [addingGameId, setAddingGameId] = useState<string | null>(null);
  const [collectionMessage, setCollectionMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("query") ?? "");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadUserCollections() {
      try {
        const [collectionData, libraryData] = await Promise.all([
          getLibraryCollections(),
          getLibrary({
            sort: "recent",
            page: "1",
            pageSize: 100,
          }),
        ]);

        if (!cancelled) {
          setCollections(collectionData);
          setLibraryGames(libraryData.items);
        }
      } catch (err) {
        console.error(
          "Не вдалося завантажити колекції користувача:",
          err
        );
      }
    }

    void loadUserCollections();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadGames() {
      try {
        setLoading(true);
        setError("");

        const response = await getGames({
          query: query.trim() || undefined,
          page: 1,
          pageSize: 12,
        });

        const detailedGames: ActualGame[] = [];

        for (const game of response.items) {
          if (cancelled) return;

          try {
            const details = await getGameDetails(game.id);

            detailedGames.push({
              ...game,
              details,
            });
          } catch (detailsError) {
            console.warn(
              `Не вдалося завантажити деталі гри ${game.id}`,
              detailsError
            );
          }
        }

        if (!cancelled) {
          setGames(detailedGames);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : t("catalog.loadError")
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadGames();

    return () => {
      cancelled = true;
    };
  }, [query, t]);

  const libraryGameIds = useMemo(
    () => new Set(libraryGames.map((game) => game.gameId)),
    [libraryGames]
  );

  const filteredGames = useMemo(() => {
    let result = [...games];

    if (priceFilter === "free") {
      result = result.filter(
        (game) => game.details.price <= 0
      );
    }

    if (priceFilter !== "all" && priceFilter !== "free") {
      const maxPrice = Number(priceFilter) / USD_TO_UAH;

      result = result.filter(
        (game) =>
          game.details.price > 0 &&
          game.details.price <= maxPrice
      );
    }

    if (onlyDiscounts) {
      result = result.filter(
        (game) => game.details.discountPercent > 0
      );
    }

    switch (sort) {
      case "price-asc":
        result.sort(
          (a, b) => a.details.price - b.details.price
        );
        break;

      case "price-desc":
        result.sort(
          (a, b) => b.details.price - a.details.price
        );
        break;

      case "discount":
        result.sort(
          (a, b) =>
            b.details.discountPercent -
            a.details.discountPercent
        );
        break;

      case "name":
        result.sort((a, b) =>
          a.details.title.localeCompare(b.details.title)
        );
        break;

      default:
        break;
    }

    return result;
  }, [games, priceFilter, onlyDiscounts, sort]);

  function convertGame(game: ActualGame): Game {
    const { details } = game;

    const hasPrice = details.price > 0;

    const hasDiscount =
      hasPrice &&
      details.oldPrice > details.price &&
      details.discountPercent > 0;

    return {
      id: game.id,
      title: details.title || game.title,
      image: details.thumbnail || game.thumbnail,

      price: hasPrice
        ? formatPrice(details.price)
        : t("common.free"),

      oldPrice: hasDiscount
        ? formatPrice(details.oldPrice)
        : undefined,

      discount: details.discountPercent > 0
        ? `-${details.discountPercent}%`
        : undefined,
    };
  }

  function resetFilters() {
    setPriceFilter("all");
    setOnlyDiscounts(false);
    setSort("relevance");
  }

  async function handleAddToCollection(
    gameId: string,
    collectionId: string
  ) {
    try {
      setAddingGameId(gameId);
      setCollectionMessage("");

      await addGameToCollections(collectionId, gameId);

      const collectionName = collections.find(
        (collection) => collection.id === collectionId
      )?.name;

      setCollectionMessage(
        t("catalog.collectionSuccess", {
          name: collectionName ?? "",
        })
      );

      setOpenedGameId(null);
    } catch (err) {
      console.error(
        "Не вдалося додати гру до колекції:",
        err
      );

      setCollectionMessage(
        t("catalog.collectionError")
      );
    } finally {
      setAddingGameId(null);
    }
  }

  const priceOptions: { value: PriceFilter; label: string }[] = [
    { value: "all", label: t("catalog.priceAll") },
    { value: "free", label: t("catalog.priceFree") },
    { value: "100", label: t("catalog.price100") },
    { value: "300", label: t("catalog.price300") },
    { value: "600", label: t("catalog.price600") },
    { value: "900", label: t("catalog.price900") },
  ];

  const collapsedFilters = [
    t("catalog.type"),
    t("catalog.features"),
    t("catalog.platforms"),
    t("catalog.events"),
  ];

  return (
    <div className="catalog-page">
      <div className="search-section">
        <GameSearch />
      </div>

      <main className="catalog-main">
        <div className="catalog-container">
          <div className="catalog-topbar">
            <div className="catalog-sort">
              <span>{t("catalog.sorting")}</span>

              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as SortOption)
                }
              >
                <option value="relevance">
                  {t("catalog.sortRelevance")}
                </option>

                <option value="price-asc">
                  {t("catalog.sortPriceAsc")}
                </option>

                <option value="price-desc">
                  {t("catalog.sortPriceDesc")}
                </option>

                <option value="discount">
                  {t("catalog.sortDiscount")}
                </option>

                <option value="name">
                  {t("catalog.sortName")}
                </option>
              </select>
            </div>

            <div className="catalog-view-switcher">
              <button
                type="button"
                className={`view-button ${
                  viewMode === "grid" ? "active" : ""
                }`}
                aria-label={t("catalog.gridView")}
                aria-pressed={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
              >
                ▦
              </button>

              <button
                type="button"
                className={`view-button ${
                  viewMode === "list" ? "active" : ""
                }`}
                aria-label={t("catalog.listView")}
                aria-pressed={viewMode === "list"}
                onClick={() => setViewMode("list")}
              >
                ☷
              </button>
            </div>
          </div>

          <div className="catalog-layout">
            <aside className="catalog-filters">
              <div className="filters-heading">
                <h2>{t("catalog.filters")}</h2>

                <button
                  type="button"
                  onClick={resetFilters}
                >
                  {t("catalog.reset")}
                </button>
              </div>

              <input
                className="tag-search"
                type="text"
                placeholder={t("catalog.tagSearch")}
                disabled
              />

              <div className="filter-section">
                <h3>{t("catalog.genre")}</h3>

                <span className="filter-unavailable">
                  {t("catalog.genresUnavailable")}
                </span>
              </div>

              <div className="filter-section">
                <h3>{t("catalog.price")}</h3>

                {priceOptions.map(({ value, label }) => (
                  <label
                    className="radio-option"
                    key={value}
                  >
                    <input
                      type="radio"
                      name="price"
                      value={value}
                      checked={priceFilter === value}
                      onChange={() => setPriceFilter(value)}
                    />

                    <span>{label}</span>
                  </label>
                ))}
              </div>

              <div className="filter-section">
                <h3>{t("catalog.discounts")}</h3>

                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={onlyDiscounts}
                    onChange={(event) =>
                      setOnlyDiscounts(event.target.checked)
                    }
                  />

                  <span>{t("catalog.onlyDiscounted")}</span>
                </label>
              </div>

              {collapsedFilters.map((title) => (
                <div
                  className="filter-section collapsed"
                  key={title}
                >
                  <h3>{title}</h3>
                  <span>⌄</span>
                </div>
              ))}
            </aside>

            <section className="catalog-results">
              {collectionMessage && (
                <div className="catalog-collection-message">
                  {collectionMessage}
                </div>
              )}

              {loading && (
                <div className="catalog-message">
                  {t("catalog.loading")}
                </div>
              )}

              {error && (
                <div className="catalog-message error">
                  {error}
                </div>
              )}

              {!loading &&
                !error &&
                filteredGames.length === 0 && (
                  <div className="catalog-message">
                    {t("catalog.noGames")}
                  </div>
                )}

              {!loading && !error && (
                <div
                  className={`catalog-grid ${
                    viewMode === "list"
                      ? "catalog-grid--list"
                      : ""
                  }`}
                >
                  {filteredGames.map((game) => {
                    const isInLibrary = libraryGameIds.has(game.id);

                    return (
                      <div
                        className="catalog-game-wrapper"
                        key={`${game.source}-${game.id}`}
                      >
                        <GameCard
                          game={convertGame(game)}
                          variant={
                            viewMode === "list"
                              ? "small"
                              : "vertical"
                          }
                        />

                        {isInLibrary && (
                          <div className="catalog-add-collection">
                            <button
                              type="button"
                              className="catalog-add-collection-button"
                              disabled={
                                addingGameId === game.id ||
                                collections.length === 0
                              }
                              onClick={() =>
                                setOpenedGameId(
                                  openedGameId === game.id
                                    ? null
                                    : game.id
                                )
                              }
                            >
                              {addingGameId === game.id
                                ? t("catalog.adding")
                                : `＋ ${t("catalog.addToCollection")}`}
                            </button>

                            {openedGameId === game.id && (
                              <div className="catalog-collection-menu">
                                {collections.length > 0 ? (
                                  collections.map((collection) => (
                                    <button
                                      type="button"
                                      key={collection.id}
                                      disabled={addingGameId === game.id}
                                      onClick={() =>
                                        void handleAddToCollection(
                                          game.id,
                                          collection.id
                                        )
                                      }
                                    >
                                      {collection.name}
                                    </button>
                                  ))
                                ) : (
                                  <span>
                                    {t("catalog.createCollectionFirst")}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Catalog;
