import { useEffect, useRef, useState } from "react";

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

        if (requestId !== requestIdRef.current) {
          return;
        }

        setResults(response.items.slice(0, 7));
        setIsOpen(true);
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        console.error("Не вдалося виконати пошук:", error);
        setResults([]);
        setIsOpen(true);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, 400);

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
              placeholder="Пошук у Крамниці..."
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
              aria-label="Пошук"
              onClick={handleSearchSubmit}
            >
              ⌕
            </button>
          </div>

          {isOpen && (
            <div className="search-results">
              {loading && (
                <div className="search-message">
                  Пошук...
                </div>
              )}

              {!loading && results.length === 0 && (
                <div className="search-message">
                  Ігор не знайдено
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
                          : "Безкоштовно"}
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
          Каталог
        </button>

        <button
          type="button"
          className="store-link"
          onClick={() => {
            window.location.href = "/news";
          }}
        >
          Новини
        </button>

        <div className="store-actions">
          <button
            type="button"
            className="store-circle"
            aria-label="Обране"
            onClick={() => {
              window.location.href = "/wishlist";
            }}
          >
            ♡
          </button>

          <button
            type="button"
            className="store-circle"
            aria-label="Кошик"
            onClick={() => {
              window.location.href = "/cart";
            }}
          >
            🛒
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameSearch;