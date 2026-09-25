import { useEffect, useState } from "react";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
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
            : "Не вдалося завантажити гру"
        );
      } finally {
        setLoading(false);
      }
    }

    loadGame();
  }, [appId]);

  if (loading) {
    return (
      <div className="game-page-state">
        <Header />
        <div className="state-content">
          Завантаження гри...
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="game-page-state">
        <Header />
        <div className="state-content error-state">
          {error || "Гру не знайдено"}
        </div>
      </div>
    );
  }

  return (
    <div className="game-page">
      <Header />

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
            Про гру
          </button>

          <button className="active">
            Характеристики
          </button>

        <button
          onClick={() => {
            window.location.href = `/game/${game.id}/community`;
          }}
        >
          Спільнота
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

      <Footer />
    </div>
  );
}

export default CharacteristicsPage;