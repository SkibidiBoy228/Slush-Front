
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LibraryLayout from "../../components/Library/layout/LibraryLayout";
import GamePlayer from "../../components/Library/GamePlayer/GamePlayer";
import LibraryNewsCard from "../../components/Library/Home/LibraryNewsCard";
import CommunityPostCard from "../../components/Library/Home/CommunityPostCard";

import {
  addFavoriteGame,
  createGameReview,
  deleteGameReview,
  getGameLibraryContext,
  getLibrary,
  getLibraryHome,
  removeFavoriteGame,
  startGameSession,
  updateGameReview,
} from "../../api/library";

import type {
  GameLibraryContext,
  GameSession,
  LibraryGame,
  LibraryFriend,
  LibraryHome,
  SaveGameReviewRequest,
  UserGameReview,
} from "../../types/library";

import "./LibraryGamePage.css";

interface LibraryGamePageProps {
  gameId: string;
}

const getDateLocale = (language: string) => {
  const locales: Record<string, string> = {
    uk: "uk-UA",
    en: "en-US",
    sk: "sk-SK",
    ru: "ru-RU",
  };

  return locales[language.split("-")[0]] ?? "uk-UA";
};

function formatDate(
  value: string | null | undefined,
  locale: string,
  notStartedText: string,
): string {
  if (!value) return notStartedText;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString(locale);
}

function FriendList({
  title,
  friends,
  emptyText,
}: {
  title: string;
  friends: LibraryFriend[];
  emptyText: string;
}) {
  const { t } = useTranslation();

  return (
    <section className="library-game__friends-card">
      <h3>
        {title} <span>{friends.length}</span>
      </h3>

      {friends.length === 0 ? (
        <p className="library-game__friends-empty">{emptyText}</p>
      ) : (
        <div className="library-game__friends-list">
          {friends.map((friend) => (
            <div className="library-game__friend" key={friend.userId}>
              <img
                src={friend.avatarUrl || ""}
                alt=""
                loading="lazy"
              />

              <div className="library-game__friend-info">
                <span>{friend.username}</span>

                {friend.isOnline && (
                  <small>
                    <span className="library-game__online-dot" />
                    {t("libraryGame.online")}
                  </small>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function LibraryGamePage({ gameId }: LibraryGamePageProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocale(i18n.language);

  const formatGameDate = (value: string | null | undefined) =>
    formatDate(value, dateLocale, t("libraryGame.notStarted"));

  const [game, setGame] = useState<LibraryGame | null>(null);
  const [context, setContext] = useState<GameLibraryContext | null>(null);
  const [home, setHome] = useState<LibraryHome | null>(null);

  const [session, setSession] = useState<GameSession | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [playError, setPlayError] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const [reviewScore, setReviewScore] = useState(10);
  const [reviewText, setReviewText] = useState("");
  const [review, setReview] = useState<UserGameReview | null>(null);

  useEffect(() => {
    let active = true;

    async function loadGamePage() {
      try {
        setIsLoading(true);
        setError(null);

        const [libraryResult, gameContext, homeData] = await Promise.all([
          getLibrary({
            page: "1",
            pageSize: 100,
          }),
          getGameLibraryContext(gameId),
          getLibraryHome(),
        ]);

        if (!active) return;

        const foundGame = libraryResult.items.find(
          (item) => item.gameId === gameId,
        );

        if (!foundGame) {
          setError(t("libraryGame.gameNotFound"));
          return;
        }

        setGame(foundGame);
        setContext(gameContext);
        setHome(homeData);

        setReview(gameContext.myReview);

        if (gameContext.myReview) {
          setReviewScore(gameContext.myReview.score);
          setReviewText(gameContext.myReview.text);
        } else {
          setReviewScore(10);
          setReviewText("");
        }
      } catch (err) {
        console.error("Failed to load game page:", err);

        if (active) {
          setError(t("libraryGame.loadError"));
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadGamePage();

    return () => {
      active = false;
    };
  }, [gameId, t]);

  async function handleStartGame() {
    if (isStarting || session) return;

    try {
      setIsStarting(true);
      setPlayError(null);

      const newSession = await startGameSession(gameId);

      if (!newSession.isPlaying || !newSession.playUrl) {
        throw new Error("Backend did not return an active game session.");
      }

      setSession(newSession);

      setGame((current) => {
        if (!current) return current;

        return {
          ...current,
          isCurrentlyPlaying: true,
          lastPlayedAt: newSession.sessionStartedAt,
          playtimeFormatted: newSession.playtimeFormatted,
          playtimeMinutes: newSession.totalPlaytimeMinutes,
          playtimeHours: newSession.totalPlaytimeHours,
        };
      });
    } catch (err) {
      console.error("Failed to start game:", err);
      setPlayError(t("libraryGame.startError"));
    } finally {
      setIsStarting(false);
    }
  }

  function handleGameExit(updatedSession: GameSession | null) {
    if (updatedSession) {
      setGame((current) => {
        if (!current) return current;

        return {
          ...current,
          isCurrentlyPlaying: false,
          playtimeFormatted: updatedSession.playtimeFormatted,
          playtimeMinutes: updatedSession.totalPlaytimeMinutes,
          playtimeHours: updatedSession.totalPlaytimeHours,
          lastPlayedAt:
            updatedSession.sessionStartedAt ?? current.lastPlayedAt,
        };
      });
    }

    setSession(null);
  }

  async function handleFavorite() {
    if (!context || isFavoriteLoading) return;

    try {
      setIsFavoriteLoading(true);

      if (context.isFavorite) {
        await removeFavoriteGame(gameId);
      } else {
        await addFavoriteGame(gameId);
      }

      setContext((current) =>
        current
          ? { ...current, isFavorite: !current.isFavorite }
          : current,
      );

      setGame((current) =>
        current
          ? { ...current, isFavorite: !current.isFavorite }
          : current,
      );
    } catch (err) {
      console.error("Failed to update favorites:", err);
      setError(t("libraryGame.favoriteError"));
    } finally {
      setIsFavoriteLoading(false);
    }
  }

  async function handleSaveReview() {
    if (!game || isReviewLoading) return;

    if (!reviewText.trim()) {
      setReviewError(t("libraryGame.reviewRequired"));
      return;
    }

    const request: SaveGameReviewRequest = {
      gameTitle: game.title,
      gameBannerUrl: game.headerImage || game.coverImage,
      score: reviewScore,
      text: reviewText.trim(),
    };

    try {
      setIsReviewLoading(true);
      setReviewError(null);

      const savedReview = review
        ? await updateGameReview(gameId, request)
        : await createGameReview(gameId, request);

      setReview(savedReview);
      setContext((current) =>
        current ? { ...current, myReview: savedReview } : current,
      );
    } catch (err) {
      console.error("Failed to save review:", err);
      setReviewError(t("libraryGame.reviewSaveError"));
    } finally {
      setIsReviewLoading(false);
    }
  }

  async function handleDeleteReview() {
    if (!review || isReviewLoading) return;

    try {
      setIsReviewLoading(true);
      setReviewError(null);

      await deleteGameReview(gameId);

      setReview(null);
      setReviewText("");
      setReviewScore(10);

      setContext((current) =>
        current ? { ...current, myReview: null } : current,
      );
    } catch (err) {
      console.error("Failed to delete review:", err);
      setReviewError(t("libraryGame.reviewDeleteError"));
    } finally {
      setIsReviewLoading(false);
    }
  }

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  if (session) {
    return (
      <GamePlayer
        session={session}
        onExit={handleGameExit}
      />
    );
  }

  return (
    <LibraryLayout>
      <div className="library-game">
        {isLoading ? (
          <div className="library-game__state">
            {t("libraryGame.loading")}
          </div>
        ) : error && !game ? (
          <div className="library-game__error">
            <p>{error}</p>
            <a href="/library">{t("libraryGame.backToLibrary")}</a>
          </div>
        ) : game ? (
          <>
            <section className="library-game__hero">
              <img
                className="library-game__hero-image"
                src={game.headerImage || game.coverImage}
                alt=""
              />

              <div className="library-game__hero-overlay" />

              <div className="library-game__hero-content">
                <a
                  href="/library"
                  className="library-game__back"
                >
                  ← {t("libraryGame.myLibrary")}
                </a>

                <div className="library-game__hero-bottom">
                  <div className="library-game__main-info">
                    <h1>{game.title}</h1>

                    <div className="library-game__quick-info">
                      {game.developer && <span>{game.developer}</span>}
                      {game.diskSize && <span>{game.diskSize}</span>}
                      {game.releaseDate && <span>{game.releaseDate}</span>}
                    </div>

                    <div className="library-game__actions">
                      <button
                        type="button"
                        className="library-game__play"
                        onClick={handleStartGame}
                        disabled={isStarting}
                      >
                        {isStarting
                          ? t("libraryGame.starting")
                          : t("libraryGame.play")}
                      </button>

                      <span className="library-game__playtime">
                        {game.playtimeFormatted || t("libraryGame.zeroMinutes")}
                        <small>{t("libraryGame.totalPlaytime")}</small>
                      </span>
                    </div>

                    {playError && (
                      <p className="library-game__play-error" role="alert">
                        {playError}
                      </p>
                    )}
                  </div>

                  <div className="library-game__hero-tools">
                    <button
                      type="button"
                      className={
                        context?.isFavorite
                          ? "library-game__icon-button library-game__icon-button--active"
                          : "library-game__icon-button"
                      }
                      onClick={handleFavorite}
                      disabled={isFavoriteLoading || !context}
                      aria-label={
                        context?.isFavorite
                          ? t("libraryGame.removeFavorite")
                          : t("libraryGame.addFavorite")
                      }
                      title={t("libraryGame.favorites")}
                    >
                      {context?.isFavorite ? "♥" : "♡"}
                    </button>

                    <button
                      type="button"
                      className="library-game__icon-button"
                      onClick={() => scrollToSection("library-game-review")}
                      aria-label={t("libraryGame.review")}
                      title={t("libraryGame.review")}
                    >
                      ★
                    </button>

                    <button
                      type="button"
                      className="library-game__icon-button"
                      onClick={() => scrollToSection("library-game-community")}
                      aria-label={t("libraryGame.community")}
                      title={t("libraryGame.community")}
                    >
                      ···
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <nav className="library-game__tabs">
              <button
                type="button"
                onClick={() => scrollToSection("library-game-overview")}
              >
                {t("libraryGame.libraryPage")}
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("library-game-news")}
              >
                {t("libraryGame.whatsNew")}
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("library-game-community")}
              >
                {t("libraryGame.community")}
              </button>
            </nav>

            {error && (
              <p className="library-game__notice" role="alert">
                {error}
              </p>
            )}

            <div className="library-game__columns">
              <main className="library-game__main-column">
                <section
                  id="library-game-overview"
                  className="library-game__section"
                >
                  <h2>{t("libraryGame.myProgress")}</h2>

                  <div className="library-game__stats">
                    <div className="library-game__stat">
                      <span>{t("libraryGame.totalPlaytime")}</span>
                      <strong>
                        {game.playtimeFormatted || t("libraryGame.zeroMinutes")}
                      </strong>
                    </div>

                    <div className="library-game__stat">
                      <span>{t("libraryGame.lastPlayed")}</span>
                      <strong>{formatGameDate(game.lastPlayedAt)}</strong>
                    </div>

                    <div className="library-game__stat">
                      <span>{t("libraryGame.acquired")}</span>
                      <strong>{formatGameDate(game.acquiredAt)}</strong>
                    </div>

                    <div className="library-game__stat">
                      <span>{t("libraryGame.status")}</span>
                      <strong>
                        {game.isCurrentlyPlaying
                          ? t("libraryGame.currentlyPlaying")
                          : game.isInstalled === true
                            ? t("libraryGame.installed")
                            : game.isInstalled === false
                              ? t("libraryGame.notInstalled")
                              : t("libraryGame.unknown")}
                      </strong>
                    </div>
                  </div>
                </section>

                <section
                  id="library-game-review"
                  className="library-game__section"
                >
                  <div className="library-game__section-heading">
                    <h2>{t("libraryGame.myReview")}</h2>

                    {review && (
                      <span className="library-game__review-status">
                        {t("libraryGame.yourReview")}
                      </span>
                    )}
                  </div>

                  {review ? (
                    <div className="library-game__existing-review">
                      <div className="library-game__review-author">
                        <strong>{review.username}</strong>
                        <span>{formatGameDate(review.createdAt)}</span>
                      </div>

                      <div className="library-game__review-score">
                        {review.score}/10
                      </div>

                      <p>{review.text}</p>
                    </div>
                  ) : null}

                  <div className="library-game__review-form">
                    <label htmlFor="library-review-score">
                      {t("libraryGame.yourScore")}
                    </label>

                    <select
                      id="library-review-score"
                      value={reviewScore}
                      onChange={(event) =>
                        setReviewScore(Number(event.target.value))
                      }
                    >
                      {Array.from({ length: 10 }, (_, index) => index + 1)
                        .reverse()
                        .map((score) => (
                          <option key={score} value={score}>
                            {score}/10
                          </option>
                        ))}
                    </select>

                    <label htmlFor="library-review-text">
                      {t("libraryGame.reviewText")}
                    </label>

                    <textarea
                      id="library-review-text"
                      value={reviewText}
                      onChange={(event) => setReviewText(event.target.value)}
                      placeholder={t("libraryGame.reviewPlaceholder")}
                      rows={4}
                    />

                    {reviewError && (
                      <p className="library-game__review-error" role="alert">
                        {reviewError}
                      </p>
                    )}

                    <div className="library-game__review-actions">
                      <button
                        type="button"
                        onClick={handleSaveReview}
                        disabled={isReviewLoading}
                      >
                        {isReviewLoading
                          ? t("libraryGame.saving")
                          : review
                            ? t("libraryGame.updateReview")
                            : t("libraryGame.writeReview")}
                      </button>

                      {review && (
                        <button
                          type="button"
                          className="library-game__delete-review"
                          onClick={handleDeleteReview}
                          disabled={isReviewLoading}
                        >
                          {t("libraryGame.delete")}
                        </button>
                      )}
                    </div>
                  </div>
                </section>

                <section
                  id="library-game-news"
                  className="library-game__section"
                >
                  <div className="library-game__section-heading">
                    <h2>{t("libraryGame.whatsNew")}</h2>
                    <a href="/library/feed">
                      {t("libraryGame.allNews")} ›
                    </a>
                  </div>

                  {home?.latestNews.length ? (
                    <div className="library-game__news-list">
                      {home.latestNews.slice(0, 3).map((post) => (
                        <LibraryNewsCard key={post.id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <p className="library-game__empty">
                      {t("libraryGame.noNews")}
                    </p>
                  )}
                </section>
              </main>

              <aside className="library-game__sidebar">
                {context && (
                  <>
                    <FriendList
                      title={t("libraryGame.friendsWantGame")}
                      friends={context.friendsWhoWant}
                      emptyText={t("libraryGame.noFriendsWant")}
                    />

                    <FriendList
                      title={t("libraryGame.friendsOwnGame")}
                      friends={context.friendsWhoOwn}
                      emptyText={t("libraryGame.noFriendsOwn")}
                    />
                  </>
                )}

                <div className="library-game__sidebar-info">
                  <h3>{t("libraryGame.information")}</h3>

                  <div>
                    <span>{t("libraryGame.developer")}</span>
                    <strong>{game.developer || t("libraryGame.unknown")}</strong>
                  </div>

                  <div>
                    <span>{t("libraryGame.acquiredDate")}</span>
                    <strong>{formatGameDate(game.acquiredAt)}</strong>
                  </div>

                  <div>
                    <span>{t("libraryGame.size")}</span>
                    <strong>{game.diskSize || t("libraryGame.unknown")}</strong>
                  </div>
                </div>
              </aside>
            </div>

            <section
              id="library-game-community"
              className="library-game__section library-game__community"
            >
              <div className="library-game__section-heading">
                <h2>{t("libraryGame.communityHighlights")}</h2>
                <a href="/library/feed">
                  {t("libraryGame.myFeed")} ›
                </a>
              </div>

              {home?.communityHighlights.length ? (
                <div className="library-game__community-grid">
                  {home.communityHighlights.slice(0, 6).map((post) => (
                    <CommunityPostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <p className="library-game__empty">
                  {t("libraryGame.noPosts")}
                </p>
              )}
            </section>
          </>
        ) : null}
      </div>
    </LibraryLayout>
  );
}

export default LibraryGamePage;
