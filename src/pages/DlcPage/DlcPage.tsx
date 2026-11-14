
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";

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
  const { t } = useTranslation();

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
            : t("dlcPage.loadError")
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [appId, dlcId, t]);

  if (loading) {
    return (
      <div className="game-page-state">
        <div className="state-content">
          {t("dlcPage.loading")}
        </div>
      </div>
    );
  }

  if (error || !baseGame) {
    return (
      <div className="game-page-state">
        <div className="state-content error-state">
          {error || t("dlcPage.gameNotFound")}
        </div>
      </div>
    );
  }

  const parentGame = baseGame;

  function openBaseGame() {
    window.location.href = `/game/${parentGame.id}`;
  }

  function openDlc(dlc: GameExtra) {
    window.location.href =
      `/game/${parentGame.id}/dlc/${dlc.id}`;
  }

  // ALL DLC PAGE
  if (!dlcId) {
    return (
      <div className="game-page">
        <main className="game-page-content">
          <div className="game-page-search">
            <GameSearch />
          </div>

          <nav className="game-tabs">
            <button onClick={openBaseGame}>
              {t("dlcPage.aboutGame")}
            </button>

            <button
              onClick={() => {
                window.location.href =
                  `/game/${parentGame.id}/characteristics`;
              }}
            >
              {t("dlcPage.characteristics")}
            </button>

            <button
              onClick={() => {
                alert(t("dlcPage.communityDeveloping"));
              }}
            >
              {t("dlcPage.community")}
            </button>
          </nav>

          <div className="dlc-catalog-heading">
            <div>
              <span className="dlc-badge">DLC</span>
              <h1>{t("dlcPage.allDlcs")}</h1>
              <p>{parentGame.title}</p>
            </div>

            <button
              className="dlc-back-button"
              onClick={openBaseGame}
            >
              ← {t("dlcPage.aboutGame")}
            </button>
          </div>

          <section className="dlc-catalog">
            <div className="dlc-catalog-header">
              <h2>{t("dlcPage.allDlcs")}</h2>
              <span>
                {parentGame.dLcs.length} DLC
              </span>
            </div>

            {parentGame.dLcs.length === 0 ? (
              <div className="dlc-catalog-empty">
                {t("dlcPage.noOtherDlcs")}
              </div>
            ) : (
              <div className="dlc-catalog-grid">
                {parentGame.dLcs.map((dlc, index) => (
                  <article
                    className="dlc-catalog-card"
                    key={dlc.id}
                  >
                    <div className="dlc-catalog-card-top">
                      <span className="dlc-catalog-number">
                        DLC #{index + 1}
                      </span>

                      <span className="dlc-catalog-label">
                        DLC
                      </span>
                    </div>

                    <div className="dlc-catalog-card-content">
                      <h3>{dlc.title}</h3>

                      <div className="dlc-catalog-card-footer">
                        <strong>
                          {dlc.price > 0
                            ? formatPrice(dlc.price)
                            : t("common.free")}
                        </strong>

                        <button
                          onClick={() => openDlc(dlc)}
                        >
                          {t("dlcPage.goToGame")} →
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  // SINGLE DLC PAGE
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

  return (
    <div className="game-page">
      <main className="game-page-content">
        <div className="game-page-search">
          <GameSearch />
        </div>

        <nav className="game-tabs">
          <button onClick={openBaseGame}>
            {t("dlcPage.aboutGame")}
          </button>

          <button
            onClick={() => {
              window.location.href =
                `/game/${parentGame.id}/characteristics`;
            }}
          >
            {t("dlcPage.characteristics")}
          </button>

          <button
            onClick={() => {
              alert(t("dlcPage.communityDeveloping"));
            }}
          >
            {t("dlcPage.community")}
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
                  {t("dlcPage.baseGame")}
                </span>

                <strong>{parentGame.title}</strong>
              </div>

              <span className="base-game-price">
                {parentGame.price > 0
                  ? formatPrice(parentGame.price)
                  : t("common.free")}
              </span>

              <button
                className="base-game-button"
                onClick={openBaseGame}
              >
                {t("dlcPage.goToGame")}
              </button>
            </section>

            <section className="other-dlc-section">
              <div className="section-title-row">
                <h2>{t("dlcPage.otherDlcs")}</h2>

                <button
                  className="more-link"
                  onClick={() => {
                    window.location.href =
                      `/game/${parentGame.id}/dlc`;
                  }}
                >
                  {t("dlcPage.allDlcs")} →
                </button>
              </div>

              {otherDlcs.length === 0 ? (
                <p className="empty-dlc-text">
                  {t("dlcPage.noOtherDlcs")}
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
                          : t("common.free")}
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
    </div>
  );
}

export default DlcPage;
