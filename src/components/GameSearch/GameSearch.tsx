import { useEffect, useRef, useState } from "react";

import { getGames } from "../../api/games";
import type { CatalogGame } from "../../types/catalog";

import { formatPrice } from "../../utils/price";

import "./GameSearch.css";

function GameSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const trimmedQuery = query.trim();

      if (trimmedQuery.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      try {
        setLoading(true);

        const response = await getGames({
          query: trimmedQuery,
          page: 1,
          pageSize: 8,
        });

        setResults(response.items);
        setIsOpen(true);
      } catch (error) {
        console.error("Не вдалося виконати пошук:", error);
        setResults([]);
      } finally {
        setLoading(false);
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
    window.location.href = `/game/${game.id}`;
  }

  function handleSearchSubmit() {
    if (query.trim().length >= 2 && results.length > 0) {
      openGame(results[0]);
    }
  }

  return (
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
            }}
          />

          <button
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
                  key={game.id}
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
        className="store-link"
        onClick={() => {
          window.location.href = "/catalog";
        }}
      >
        Каталог
      </button>

      <button
        className="store-link"
        onClick={() => {
          window.location.href = "/news";
        }}
      >
        Новини
      </button>

      <div className="store-actions">
        <button
          className="store-circle"
          aria-label="Обране"
          onClick={() => {
            window.location.href = "/wishlist";
          }}
        >
          ♡
        </button>

        <button
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
  );
}

export default GameSearch;