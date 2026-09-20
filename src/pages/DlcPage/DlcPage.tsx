import { useEffect, useState } from "react";
import DOMPurify from "dompurify";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import GameSearch from "../../components/GameSearch/GameSearch";
import GameGallery from "../../components/GamePage/GameGallery";
import GameSidebar from "../../components/GamePage/GameSidebar";
import GameReviews from "../../components/GamePage/GameReviews";

import { getGameDetails } from "../../api/games";
import type { GameDetails, GameExtra } from "../../types/game";
import { formatPrice } from "../../utils/price";

import "../../components/GamePage/GamePageComponents.css";
import "../GamePage/GamePage.css";
import "./DlcPage.css";

interface DlcPageProps {
  appId: string;
  dlcId?: string;
}

function DlcPage({ appId, dlcId }: DlcPageProps) {
  const [baseGame, setBaseGame] = useState<GameDetails | null>(null);
  const [dlcGame, setDlcGame] = useState<GameDetails | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const parentGame = await getGameDetails(appId);
        setBaseGame(parentGame);

        if (dlcId) {
          const selectedDlc = await getGameDetails(dlcId);
          setDlcGame(selectedDlc);
        } else {
          setDlcGame(null);
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Не вдалося завантажити DLC"
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [appId, dlcId]);

  if (loading) {
    return (
      <div className="game-page-state">
        <Header />

        <div className="state-content">
          Завантаження DLC...
        </div>
      </div>
    );
  }

  if (error || !baseGame) {
    return (
      <div className="game-page-state">
        <Header />

        <div className="state-content error-state">
          {error || "Гру не знайдено"}
        </div>
      </div>
    );
  }

  const parentGame = baseGame;
  const currentGame = dlcGame ?? parentGame;

  const safeDescription = DOMPurify.sanitize(
    currentGame.description ?? "",
    {
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
    }
  );

  const otherDlcs = parentGame.dLcs.filter(
    (dlc) => dlc.id !== dlcId
  );

  function openBaseGame() {
    window.location.href = `/game/${parentGame.id}`;
  }

  function openDlc(dlc: GameExtra) {
    window.location.href = `/game/${parentGame.id}/dlc/${dlc.id}`;
  }

  return (
    <div className="game-page">
      <Header />

      <main className="game-page-content">
        <div className="game-page-search">
          <GameSearch />
        </div>

        <nav className="game-tabs">
          <button onClick={openBaseGame}>
            Про гру
          </button>

          <button
            onClick={() => {
              window.location.href =
                `/game/${parentGame.id}/characteristics`;
            }}
          >
            Характеристики
          </button>

          <button
            onClick={() => {
              alert("Розділ спільноти поки що в розробці");
            }}
          >
            Спільнота
          </button>
        </nav>

        <div className="dlc-page-heading">
          <span className="dlc-badge">DLC</span>

          <h1>{currentGame.title}</h1>
        </div>

        <div className="game-layout">
          <section className="game-main-content">
            <GameGallery game={currentGame} />

            <div className="game-tags">
              {currentGame.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <section className="dlc-description">
              <div
                className="steam-description"
                dangerouslySetInnerHTML={{
                  __html: safeDescription,
                }}
              />
            </section>

            <section className="base-game-card">
              <div className="base-game-info">
                <span className="base-game-badge">
                  Базова гра
                </span>

                <strong>{parentGame.title}</strong>
              </div>

              <span className="base-game-price">
                {parentGame.price > 0
                  ? formatPrice(parentGame.price)
                  : "Безкоштовно"}
              </span>

              <button
                className="base-game-button"
                onClick={openBaseGame}
              >
                До гри
              </button>
            </section>

            <section className="other-dlc-section">
              <div className="section-title-row">
                <h2>Інші DLC</h2>

                <button
                  className="more-link"
                  onClick={() => {
                    window.location.href =
                      `/game/${parentGame.id}/dlc`;
                  }}
                >
                  Усі DLC →
                </button>
              </div>

              {otherDlcs.length === 0 ? (
                <p className="empty-dlc-text">
                  Інших DLC не знайдено.
                </p>
              ) : (
                <div className="other-dlc-list">
                  {otherDlcs.map((dlc) => (
                    <button
                      key={dlc.id}
                      className="other-dlc-row"
                      onClick={() => openDlc(dlc)}
                    >
                      <span>{dlc.title}</span>

                      <strong>
                        {dlc.price > 0
                          ? formatPrice(dlc.price)
                          : "Безкоштовно"}
                      </strong>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <GameReviews
              reviews={currentGame.reviews}
              averageRating={currentGame.averageRating}
            />
          </section>

          <GameSidebar game={currentGame} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default DlcPage;