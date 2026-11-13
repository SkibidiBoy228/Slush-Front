
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { getGames } from "../../api/games";
import type { CatalogGame } from "../../types/catalog";

import { formatPrice } from "../../utils/price";

import "./GameSearch.css";

function normalizeSearchQuery(query: string): string {
  const normalized = query
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  const aliases: Record<string, string> = {
    "кс 2": "Counter-Strike 2",
    "кс2": "Counter-Strike 2",
    "cs 2": "Counter-Strike 2",
    cs2: "Counter-Strike 2",
    "дота 2": "Dota 2",
    "дота2": "Dota 2",
    dota2: "Dota 2",
  };

  return aliases[normalized] ?? query.trim();
}

function GameSearch() {
  const { t } = useTranslation();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      setLoading(false);
      return;
    }

    const timeout = setTimeout(async () => {
      const requestId = ++requestIdRef.current;

      try {
        setLoading(true);

        const response = await getGames({
          query: normalizeSearchQuery(trimmedQuery),
          page: 1,
          pageSize: 7,
        });

        if (requestId !== requestIdRef.current) return;

        setResults(response.items.slice(0, 7));
        setIsOpen(true);
      } catch (error) {
        if (requestId !== requestIdRef.current) return;

        console.error("Не вдалося виконати пошук:", error);
        setResults([]);
        setIsOpen(true);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function openGame(game: CatalogGame) {
    setIsOpen(false);
    window.location.href = `/game/${encodeURIComponent(game.id)}`;
  }

  function handleSearchSubmit() {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      window.location.href = "/catalog";
      return;
    }

    window.location.href = `/catalog?query=${encodeURIComponent(
      trimmedQuery
    )}`;
  }

  return (
    <div className="game-search-container">
      <div className="store-panel">
        <div className="store-search-wrapper" ref={searchRef}>
          <div className="store-search">
            <input
              type="text"
              value={query}
              placeholder={t("gameSearch.placeholder")}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => {
                if (results.length > 0) {
                  setIsOpen(true);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearchSubmit();
                }

                if (event.key === "Escape") {
                  setIsOpen(false);
                }
              }}
            />

            <button
              type="button"
              className="search-button"
              aria-label={t("gameSearch.search")}
              onClick={handleSearchSubmit}
            >
              <svg
                viewBox="0 0 24 24"
                width="17"
                height="17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="10.8"
                  cy="10.8"
                  r="6.3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M15.5 15.5L20 20"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {isOpen && (
            <div className="search-results">
              {loading && (
                <div className="search-message">
                  {t("gameSearch.loading")}
                </div>
              )}

              {!loading && results.length === 0 && (
                <div className="search-message">
                  {t("gameSearch.noResults")}
                </div>
              )}

              {!loading &&
                results.map((game) => (
                  <button
                    type="button"
                    key={`${game.source}-${game.id}`}
                    className="search-result"
                    onClick={() => openGame(game)}
                  >
                    <img
                      src={game.thumbnail}
                      alt={game.title}
                    />

                    <span className="search-result-info">
                      <strong>{game.title}</strong>

                      <span>
                        {game.price > 0
                          ? formatPrice(game.price)
                          : t("common.free")}
                      </span>
                    </span>
                  </button>
                ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="store-link"
          onClick={() => {
            window.location.href = "/catalog";
          }}
        >
          {t("gameSearch.catalog")}
        </button>

        <button
          type="button"
          className="store-link"
          onClick={() => {
            window.location.href = "/news";
          }}
        >
          {t("gameSearch.news")}
        </button>

        <div className="store-actions">
          <button
            type="button"
            className="store-circle"
            aria-label={t("gameSearch.wishlist")}
            onClick={() => {
              window.location.href = "/wishlist";
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
            </svg>
          </button>

          <button
            type="button"
            className="store-circle"
            aria-label={t("gameSearch.cart")}
            onClick={() => {
              window.location.href = "/cart";
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameSearch;
