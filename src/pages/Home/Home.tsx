import { useEffect, useState } from "react";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import GameSection from "../../components/GameSection/GameSection";
import HeroSlider from "../../components/HeroSlider/HeroSlider";
import GameCard, {
  type Game,
} from "../../components/GameCard/GameCard";

import { getGames } from "../../api/games";
import type { CatalogGame } from "../../types/catalog";

import "./Home.css";

function formatPrice(price: number): string {
  if (price <= 0) {
    return "Безкоштовно";
  }

  return `${price.toLocaleString("uk-UA")}₴`;
}

function convertGame(game: CatalogGame): Game {
  return {
    id: game.id,
    title: game.title,
    image: game.thumbnail,
    price: formatPrice(game.price),
    oldPrice:
      game.oldPrice > game.price && game.price > 0
        ? formatPrice(game.oldPrice)
        : undefined,
    discount:
      game.discountPercent > 0
        ? `-${game.discountPercent}%`
        : undefined,
  };
}

function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGames() {
      try {
        setLoading(true);
        setError("");

        const response = await getGames({
          page: 1,
          pageSize: 50,
        });

        const convertedGames = response.items.map(convertGame);

        setGames(convertedGames);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Не вдалося завантажити ігри"
        );
      } finally {
        setLoading(false);
      }
    }

    loadGames();
  }, []);

  /*
   * Поки API повертає один загальний каталог,
   * распределяем игры по секциям на основе данных API.
   */

  const specialOffers = games
    .filter((game) => game.discount)
    .slice(0, 3);

  const recommendedGames = games.slice(0, 4);

  const budgetGames = games
    .filter((game) => {
      const price = Number(
        game.price.replace(/[^\d.,]/g, "").replace(",", ".")
      );

      return game.price === "Безкоштовно" || price <= 100;
    })
    .slice(0, 4);

  const popularGames = games.slice(0, 3);

  const newReleases = games.slice(3, 6);

  const freeGames = games
    .filter((game) => game.price === "Безкоштовно")
    .slice(0, 3);

  return (
    <div className="home-page">
      <Header />

      <main>
        <HeroSlider />

        <div className="content-container">
          {loading && (
            <div className="catalog-message">
              Завантаження ігор...
            </div>
          )}

          {error && (
            <div className="catalog-message">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <GameSection
                title="Особливі пропозиції"
                games={specialOffers}
                variant="wide"
              />

              <GameSection
                title="Рекомендовані вам"
                games={recommendedGames}
                variant="vertical"
              />

              <GameSection
                title="До 100₴"
                games={budgetGames}
                variant="vertical"
              />

              <section className="three-columns">
                <div className="game-column">
                  <div className="column-heading">
                    <h2>Хіти продажу</h2>

                    <button
                      className="column-arrow"
                      aria-label="Наступні"
                    >
                      ›
                    </button>
                  </div>

                  <div className="column-games">
                    {popularGames.map((game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        variant="small"
                      />
                    ))}
                  </div>
                </div>

                <div className="game-column">
                  <div className="column-heading">
                    <h2>Нові релізи</h2>

                    <button
                      className="column-arrow"
                      aria-label="Наступні"
                    >
                      ›
                    </button>
                  </div>

                  <div className="column-games">
                    {newReleases.map((game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        variant="small"
                      />
                    ))}
                  </div>
                </div>

                <div className="game-column">
                  <div className="column-heading">
                    <h2>Безкоштовні</h2>

                    <button
                      className="column-arrow"
                      aria-label="Наступні"
                    >
                      ›
                    </button>
                  </div>

                  <div className="column-games">
                    {freeGames.map((game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        variant="small"
                      />
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Home;