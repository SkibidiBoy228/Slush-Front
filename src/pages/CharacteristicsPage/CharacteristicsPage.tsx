
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import GameSearch from "../../components/GameSearch/GameSearch";
import GameSidebar from "../../components/GamePage/GameSidebar";
import GameCharacteristics from "../../components/GamePage/GameCharacteristics";

import { getGameDetails } from "../../api/games";
import type { GameDetails } from "../../types/game";

import "../../components/GamePage/GamePageComponents.css";
import "../GamePage/GamePage.css";
import "./CharacteristicsPage.css";

interface CharacteristicsPageProps {
  appId: string;
}

function CharacteristicsPage({
  appId,
}: CharacteristicsPageProps) {
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
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : t("characteristicsPage.loadError")
        );
      } finally {
        setLoading(false);
      }
    }

    loadGame();
  }, [appId, t]);

  if (loading) {
    return (
      <div className="game-page-state">
        <div className="state-content">
          {t("characteristicsPage.loading")}
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="game-page-state">
        <div className="state-content error-state">
          {error || t("characteristicsPage.gameNotFound")}
        </div>
      </div>
    );
  }

  return (
    <div className="game-page">
      <main className="game-page-content">
        <div className="game-page-search">
          <GameSearch />
        </div>

        <nav className="game-tabs">
          <button
            onClick={() => {
              window.location.href = `/game/${game.id}`;
            }}
          >
            {t("characteristicsPage.aboutGame")}
          </button>

          <button className="active">
            {t("characteristicsPage.characteristics")}
          </button>

          <button
            onClick={() => {
              window.location.href = `/game/${game.id}/community`;
            }}
          >
            {t("characteristicsPage.community")}
          </button>
        </nav>

        <div className="game-layout">
          <section className="game-main-content">
            <h1>{game.title}</h1>

            <GameCharacteristics game={game} />
          </section>

          <GameSidebar game={game} />
        </div>
      </main>
    </div>
  );
}

export default CharacteristicsPage;
