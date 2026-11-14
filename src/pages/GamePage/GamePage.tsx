import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";

import GameSearch from "../../components/GameSearch/GameSearch";

import GameGallery from "../../components/GamePage/GameGallery";
import GameSidebar from "../../components/GamePage/GameSidebar";
import GameReviews from "../../components/GamePage/GameReviews";
import GameBundles from "../../components/GamePage/GameBundles";
import GameDlc from "../../components/GamePage/GameDlc";
import GamePageSkeleton from "../../components/Skeleton/GamePageSkeleton";

import { getGameDetails } from "../../api/games";
import type { GameDetails } from "../../types/game";

import "../../components/GamePage/GamePageComponents.css";
import "./GamePage.css";

interface GamePageProps {
  appId: string;
}

function GamePage({ appId }: GamePageProps) {
  const { t } = useTranslation();

  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGame() {
      try {
        setLoading(true);
        setError("");

        const gameData = await getGameDetails(appId);
        setGame(gameData);

        console.log("GAME DATA:", gameData);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(t("gamePage.loadError"));
        }
      } finally {
        setLoading(false);
      }
    }

    loadGame();
  }, [appId, t]);

  if (loading) {
    return <GamePageSkeleton />;
  }

  if (error || !game) {
    return (
      <div className="game-page-state">
        <div className="state-content error-state">
          {error || t("gamePage.gameNotFound")}
        </div>
      </div>
    );
  }

  const safeDescription = DOMPurify.sanitize(game.description, {
    ADD_TAGS: ["video", "source"],
    ADD_ATTR: [
      "autoplay",
      "muted",
      "loop",
      "playsinline",
      "poster",
      "src",
      "type",
      "width",
      "height",
    ],
  });

  return (
    <div className="game-page">
      <main className="game-page-content">
        <div className="game-page-search">
          <GameSearch />
        </div>

        <nav className="game-tabs">
          <button className="active">
            {t("gamePage.aboutGame")}
          </button>

          <button
            onClick={() => {
              window.location.href = `/game/${game.id}/characteristics`;
            }}
          >
            {t("gamePage.characteristics")}
          </button>

          <button
            onClick={() => {
              window.location.href = `/game/${game.id}/community`;
            }}
          >
            {t("gamePage.community")}
          </button>
        </nav>

        <div className="game-layout">
          <section className="game-main-content">
            <h1>{game.title}</h1>

            <GameGallery game={game} />

            <div className="game-tags">
              {game.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <section className="game-description">
              <h2>{t("gamePage.aboutGame")}</h2>

              <div
                className="steam-description"
                dangerouslySetInnerHTML={{
                  __html: safeDescription,
                }}
              />
            </section>

            <GameBundles
              bundles={game.bundles}
              fallbackImage={game.thumbnail}
            />

            <GameDlc
              dlcs={game.dLcs}
              gameId={game.id}
            />

            <GameReviews
              reviews={game.reviews}
              averageRating={game.averageRating}
            />
          </section>

          <GameSidebar game={game} />
        </div>
      </main>
    </div>
  );
}

export default GamePage;