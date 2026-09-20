import { useEffect, useState } from "react";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import GameSection from "../../components/GameSection/GameSection";
import HeroSlider from "../../components/HeroSlider/HeroSlider";
import GameCard, {
  type Game,
} from "../../components/GameCard/GameCard";

import { getGames, getGameDetails } from "../../api/games";
import type { CatalogGame } from "../../types/catalog";
import type { GameDetails } from "../../types/game";
import { formatPrice, USD_TO_UAH } from "../../utils/price";

import "./Home.css";

type ActualGame = CatalogGame & {
  details: GameDetails;
};

function convertGame(game: ActualGame): Game {
  const details = game.details;

  const price = details.price;
  const oldPrice = details.oldPrice;
  const discountPercent = details.discountPercent;

  return {
    id: game.id,
    title: details.title || game.title,
    image: details.thumbnail || game.thumbnail,

    price: formatPrice(price),

    oldPrice:
      oldPrice > price && price > 0
        ? formatPrice(oldPrice)
        : undefined,

    discount:
      discountPercent > 0
        ? `-${discountPercent}%`
        : undefined,
  };
}

function Home() {
  const [catalogGames, setCatalogGames] = useState<ActualGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadGames() {
      try {
        setLoading(true);
        setError("");

        const response = await getGames({
          page: 1,
          pageSize: 50,
        });

        const actualGames = await Promise.all(
          response.items.map(async (game) => {
            try {
              const details = await getGameDetails(game.id);

              return {
                ...game,
                details,
              };
            } catch (error) {
              console.error(
                `Не вдалося завантажити дані гри ${game.id}:`,
                error
              );

              return null;
            }
          })
        );

        const validGames = actualGames.filter(
          (game): game is ActualGame => game !== null
        );

        if (!isCancelled) {
          setCatalogGames(validGames);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Не вдалося завантажити ігри"
          );
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadGames();

    return () => {
      isCancelled = true;
    };
  }, []);

  const specialOffers = catalogGames
    .filter(
      (game) =>
        game.details.price > 0 &&
        game.details.discountPercent > 0
    )
    .slice(0, 3)
    .map(convertGame);

  const recommendedGames = catalogGames
    .filter((game) => game.details.price > 0)
    .slice(0, 8)
    .map(convertGame);

  const budgetGames = catalogGames
    .filter(
      (game) =>
        game.details.price > 0 &&
        game.details.price <= 100 / USD_TO_UAH
    )
    .slice(0, 8)
    .map(convertGame);

  const popularGames = catalogGames
    .filter((game) => game.details.price > 0)
    .slice(0, 3)
    .map(convertGame);

  const newReleases = catalogGames
    .filter((game) => game.details.price > 0)
    .slice(3, 6)
    .map(convertGame);

  const freeGames = catalogGames
    .filter((game) => game.details.price <= 0)
    .slice(0, 3)
    .map(convertGame);

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