import { useEffect, useMemo, useState } from "react";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import GameSearch from "../../components/GameSearch/GameSearch";
import GameCard, {
  type Game,
} from "../../components/GameCard/GameCard";

import {
  getGames,
  getGameDetails,
} from "../../api/games";

import type { CatalogGame } from "../../types/catalog";
import type { GameDetails } from "../../types/game";

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
      : "Безкоштовно",

    oldPrice: hasDiscount
      ? formatPrice(details.oldPrice)
      : undefined,

    discount: details.discountPercent > 0
      ? `-${details.discountPercent}%`
      : undefined,
  };
}

function Catalog() {
  const [games, setGames] = useState<ActualGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [sort, setSort] =
    useState<SortOption>("relevance");
  const [priceFilter, setPriceFilter] =
    useState<PriceFilter>("all");
  const [onlyDiscounts, setOnlyDiscounts] =
    useState(false);

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    setQuery(params.get("query") ?? "");
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
              : "Не вдалося завантажити ігри"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadGames();

    return () => {
      cancelled = true;
    };
  }, [query]);

  const filteredGames = useMemo(() => {
    let result = [...games];

    if (priceFilter === "free") {
      result = result.filter(
        (game) => game.details.price <= 0
      );
    }

    if (priceFilter !== "all" && priceFilter !== "free") {
      const maxPrice =
        Number(priceFilter) / USD_TO_UAH;

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
          a.details.title.localeCompare(
            b.details.title
          )
        );
        break;

      default:
        break;
    }

    return result;
  }, [games, priceFilter, onlyDiscounts, sort]);

  function resetFilters() {
    setPriceFilter("all");
    setOnlyDiscounts(false);
    setSort("relevance");
  }

  return (
    <div className="catalog-page">
      <Header />

      <div className="search-section">
        <GameSearch />
      </div>

      <main className="catalog-main">
        <div className="catalog-container">
          <div className="catalog-topbar">
            <div className="catalog-sort">
              <span>Сортування:</span>

              <select
                value={sort}
                onChange={(event) =>
                  setSort(
                    event.target.value as SortOption
                  )
                }
              >
                <option value="relevance">
                  За релевантністю
                </option>

                <option value="price-asc">
                  Спочатку дешевші
                </option>

                <option value="price-desc">
                  Спочатку дорожчі
                </option>

                <option value="discount">
                  За розміром знижки
                </option>

                <option value="name">
                  За назвою
                </option>
              </select>
            </div>

            <div className="catalog-view-switcher">
              <button
                type="button"
                className="view-button active"
                aria-label="Сітка"
              >
                ▦
              </button>

              <button
                type="button"
                className="view-button"
                aria-label="Список"
                disabled
              >
                ☷
              </button>
            </div>
          </div>

          <div className="catalog-layout">
            <aside className="catalog-filters">
              <div className="filters-heading">
                <h2>Фільтри</h2>

                <button
                  type="button"
                  onClick={resetFilters}
                >
                  Скинути
                </button>
              </div>

              <input
                className="tag-search"
                type="text"
                placeholder="Пошук тегів..."
                disabled
              />

              <div className="filter-section">
                <h3>Жанр</h3>

                <span className="filter-unavailable">
                  Дані про жанри поки недоступні
                </span>
              </div>

              <div className="filter-section">
                <h3>Ціна</h3>

                {[
                  ["all", "Без обмежень"],
                  ["free", "Безкоштовно"],
                  ["100", "До 100 гривень"],
                  ["300", "До 300 гривень"],
                  ["600", "До 600 гривень"],
                  ["900", "До 900 гривень"],
                ].map(([value, label]) => (
                  <label
                    className="radio-option"
                    key={value}
                  >
                    <input
                      type="radio"
                      name="price"
                      value={value}
                      checked={priceFilter === value}
                      onChange={() =>
                        setPriceFilter(
                          value as PriceFilter
                        )
                      }
                    />

                    <span>{label}</span>
                  </label>
                ))}
              </div>

              <div className="filter-section">
                <h3>Знижки</h3>

                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={onlyDiscounts}
                    onChange={(event) =>
                      setOnlyDiscounts(
                        event.target.checked
                      )
                    }
                  />

                  <span>Тільки зі знижкою</span>
                </label>
              </div>

              {[
                "Тип",
                "Особливості",
                "Платформи",
                "Івенти",
              ].map((title) => (
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
              {loading && (
                <div className="catalog-message">
                  Завантаження ігор...
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
                    Ігор не знайдено
                  </div>
                )}

              {!loading && !error && (
                <div className="catalog-grid">
                  {filteredGames.map((game) => (
                    <GameCard
                      key={`${game.source}-${game.id}`}
                      game={convertGame(game)}
                      variant="vertical"
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Catalog;