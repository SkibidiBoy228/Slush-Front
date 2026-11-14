
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import GameSection from "../../components/GameSection/GameSection";
import HeroSlider from "../../components/HeroSlider/HeroSlider";
import GameCard, {
  type Game,
} from "../../components/GameCard/GameCard";
import { mapWithConcurrency } from "../../utils/async";

import {
  getGames,
  getGameDetails,
} from "../../api/games";

import type { CatalogGame } from "../../types/catalog";
import type { GameDetails } from "../../types/game";

import { formatPrice, USD_TO_UAH } from "../../utils/price";
import HomeSkeleton from "../../components/Skeleton/HomeSkeleton";

import "./Home.css";

type ActualGame = CatalogGame & {
  details: GameDetails;
};

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

function Home() {
  const { t } = useTranslation();

  const [catalogGames, setCatalogGames] = useState<ActualGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    let isCancelled = false;

    async function loadGames() {
      try {
        setLoading(true);
        setError("");
        const [regularResponse, freeResponse] = await Promise.all([
          getGames({
            page: 1,
            pageSize: 18,
          }),

          getGames({
            isFree: true,
            page: 1,
            pageSize: 12,
          }),
        ]);

        if (isCancelled) return;
        const uniqueGames = Array.from(
          new Map(
            [...regularResponse.items, ...freeResponse.items].map(
              (game) => [game.id, game]
            )
          ).values()
        );

        const detailedGames = await mapWithConcurrency(
          uniqueGames,
          5,
          async (game) => {
            try {
              const details = await getGameDetails(game.id);

              return {
                ...game,
                details,
              };
            } catch (detailsError) {
              console.warn(
                `Не вдалося завантажити деталі гри ${game.id}`,
                detailsError
              );

              return null;
            }
          }
        );

        if (!isCancelled) {
          setCatalogGames(
            detailedGames.filter(
              (game): game is ActualGame => game !== null
            )
          );
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error
              ? err.message
              : t("home.loadError")
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
  }, [t]);


  const paidGames = catalogGames.filter(
    (game) => game.details.price > 0
  );

  const specialOffers = paidGames
    .filter((game) => game.details.discountPercent > 0)
    .slice(0, 3)
    .map(convertGame);

  const recommendedGames = paidGames
    .slice(0, 4)
    .map(convertGame);

  const budgetGames = paidGames
    .filter(
      (game) =>
        game.details.price > 0 &&
        game.details.price <= 100 / USD_TO_UAH
    )
    .slice(0, 4)
    .map(convertGame);

  const popularGames = paidGames
    .slice(0, 3)
    .map(convertGame);

  const newReleases = paidGames
    .slice(3, 6)
    .map(convertGame);

  const freeGames = catalogGames
    .filter((game) => game.details.price <= 0)
    .slice(0, 3)
    .map(convertGame);

  return (
    <div className="home-page">
      <main>
        <HeroSlider />

        <div className="content-container">
            {loading && <HomeSkeleton />}

          {error && (
            <div className="catalog-message error">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <GameSection
                title={t("home.specialOffers")}
                games={specialOffers}
                variant="wide"
              />

              <GameSection
                title={t("home.recommended")}
                games={recommendedGames}
                variant="vertical"
              />

              <GameSection
                title={t("home.budget")}
                games={budgetGames}
                variant="vertical"
              />

              <section className="three-columns">
                <div className="game-column">
                  <div className="column-heading">
                    <h2>{t("home.topSellers")}</h2>

                    <button
                      type="button"
                      className="column-arrow"
                      aria-label={t("home.next")}
                    >
                      ›
                    </button>
                  </div>

                  <div className="column-games">
                    {popularGames.map((game) => (
                      <GameCard
                        key={`popular-${game.id}`}
                        game={game}
                        variant="small"
                      />
                    ))}
                  </div>
                </div>

                <div className="game-column">
                  <div className="column-heading">
                    <h2>{t("home.newReleases")}</h2>

                    <button
                      type="button"
                      className="column-arrow"
                      aria-label={t("home.next")}
                    >
                      ›
                    </button>
                  </div>

                  <div className="column-games">
                    {newReleases.map((game) => (
                      <GameCard
                        key={`new-${game.id}`}
                        game={game}
                        variant="small"
                      />
                    ))}
                  </div>
                </div>

                <div className="game-column">
                  <div className="column-heading">
                    <h2>{t("home.freeGames")}</h2>

                    <button
                      type="button"
                      className="column-arrow"
                      aria-label={t("home.next")}
                    >
                      ›
                    </button>
                  </div>

                  <div className="column-games">
                    {freeGames.map((game) => (
                      <GameCard
                        key={`free-${game.id}`}
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
    </div>
  );
}

export default Home;
