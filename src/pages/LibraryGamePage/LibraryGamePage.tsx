import { useEffect, useState } from "react";
import LibraryLayout from "../../components/Library/layout/LibraryLayout";
import GamePlayer from "../../components/Library/GamePlayer/GamePlayer";
import LibraryNewsCard from "../../components/Library/Home/LibraryNewsCard";

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

function formatDate(value: string | null | undefined): string {
  if (!value) return "Ще не запускалася";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("uk-UA");
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
                    У мережі
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
          setError("Гру не знайдено у вашій бібліотеці.");
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
        console.error("Не вдалося завантажити сторінку гри:", err);

        if (active) {
          setError("Не вдалося завантажити інформацію про гру.");
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
  }, [gameId]);

  async function handleStartGame() {
    if (isStarting || session) return;

    try {
      setIsStarting(true);
      setPlayError(null);

      const newSession = await startGameSession(gameId);

      if (!newSession.isPlaying || !newSession.playUrl) {
        throw new Error("Backend не повернув активну ігрову сесію.");
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
      console.error("Не вдалося запустити гру:", err);
      setPlayError("Не вдалося запустити гру. Спробуйте ще раз.");
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
      console.error("Не вдалося змінити обране:", err);
      setError("Не вдалося змінити статус обраного.");
    } finally {
      setIsFavoriteLoading(false);
    }
  }

  async function handleSaveReview() {
    if (!game || isReviewLoading) return;

    if (!reviewText.trim()) {
      setReviewError("Напишіть текст відгуку.");
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
      console.error("Не вдалося зберегти відгук:", err);
      setReviewError("Не вдалося зберегти відгук. Спробуйте ще раз.");
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
      console.error("Не вдалося видалити відгук:", err);
      setReviewError("Не вдалося видалити відгук.");
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
            Завантаження гри...
          </div>
        ) : error && !game ? (
          <div className="library-game__error">
            <p>{error}</p>
            <a href="/library">Повернутися до бібліотеки</a>
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
                  ← Моя бібліотека
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
                        {isStarting ? "Запуск..." : "Грати"}
                      </button>

                      <span className="library-game__playtime">
                        {game.playtimeFormatted || "0 хв."}
                        <small>Загальний час гри</small>
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
                          ? "Прибрати з обраного"
                          : "Додати до обраного"
                      }
                      title="Обране"
                    >
                      {context?.isFavorite ? "♥" : "♡"}
                    </button>

                    <button
                      type="button"
                      className="library-game__icon-button"
                      onClick={() => scrollToSection("library-game-review")}
                      aria-label="Відгук"
                      title="Відгук"
                    >
                      ★
                    </button>

                    <button
                      type="button"
                      className="library-game__icon-button"
                      onClick={() => scrollToSection("library-game-community")}
                      aria-label="Спільнота"
                      title="Спільнота"
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
                Сторінка бібліотеки
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("library-game-news")}
              >
                Що нового
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("library-game-community")}
              >
                Спільнота
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
                  <h2>Мій прогрес</h2>

                  <div className="library-game__stats">
                    <div className="library-game__stat">
                      <span>Загальний час гри</span>
                      <strong>{game.playtimeFormatted || "0 хв."}</strong>
                    </div>

                    <div className="library-game__stat">
                      <span>Останній запуск</span>
                      <strong>{formatDate(game.lastPlayedAt)}</strong>
                    </div>

                    <div className="library-game__stat">
                      <span>Придбано</span>
                      <strong>{formatDate(game.acquiredAt)}</strong>
                    </div>

                    <div className="library-game__stat">
                      <span>Статус</span>
                      <strong>
                        {game.isCurrentlyPlaying
                          ? "Зараз граєте"
                          : game.isInstalled === true
                            ? "Встановлена"
                            : game.isInstalled === false
                              ? "Не встановлена"
                              : "Не визначено"}
                      </strong>
                    </div>
                  </div>
                </section>

                <section
                  id="library-game-review"
                  className="library-game__section"
                >
                  <div className="library-game__section-heading">
                    <h2>Моя рецензія</h2>

                    {review && (
                      <span className="library-game__review-status">
                        Ваш відгук
                      </span>
                    )}
                  </div>

                  {review ? (
                    <div className="library-game__existing-review">
                      <div className="library-game__review-author">
                        <strong>{review.username}</strong>
                        <span>{formatDate(review.createdAt)}</span>
                      </div>

                      <div className="library-game__review-score">
                        {review.score}/10
                      </div>

                      <p>{review.text}</p>
                    </div>
                  ) : null}

                  <div className="library-game__review-form">
                    <label htmlFor="library-review-score">
                      Ваша оцінка
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
                      Текст рецензії
                    </label>

                    <textarea
                      id="library-review-text"
                      value={reviewText}
                      onChange={(event) => setReviewText(event.target.value)}
                      placeholder="Поділіться своїми враженнями від гри..."
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
                          ? "Збереження..."
                          : review
                            ? "Оновити рецензію"
                            : "Написати рецензію"}
                      </button>

                      {review && (
                        <button
                          type="button"
                          className="library-game__delete-review"
                          onClick={handleDeleteReview}
                          disabled={isReviewLoading}
                        >
                          Видалити
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
                    <h2>Що нового</h2>
                    <a href="/library/feed">Усі новини ›</a>
                  </div>

                  {home?.latestNews.length ? (
                    <div className="library-game__news-list">
                      {home.latestNews.slice(0, 3).map((post) => (
                        <LibraryNewsCard key={post.id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <p className="library-game__empty">
                      Новин поки немає.
                    </p>
                  )}
                </section>
              </main>

              <aside className="library-game__sidebar">
                {context && (
                  <>
                    <FriendList
                      title="Друзі бажають цю гру"
                      friends={context.friendsWhoWant}
                      emptyText="Поки ніхто з друзів не додав гру до бажаного."
                    />

                    <FriendList
                      title="Друзі мають цю гру"
                      friends={context.friendsWhoOwn}
                      emptyText="Поки ніхто з друзів не має цієї гри."
                    />
                  </>
                )}

                <div className="library-game__sidebar-info">
                  <h3>Інформація</h3>

                  <div>
                    <span>Розробник</span>
                    <strong>{game.developer || "Невідомо"}</strong>
                  </div>

                  <div>
                    <span>Дата придбання</span>
                    <strong>{formatDate(game.acquiredAt)}</strong>
                  </div>

                  <div>
                    <span>Розмір</span>
                    <strong>{game.diskSize || "Невідомо"}</strong>
                  </div>
                </div>
              </aside>
            </div>

            <section
              id="library-game-community"
              className="library-game__section library-game__community"
            >
              <div className="library-game__section-heading">
                <h2>Цікаве від Спільноти</h2>
                <a href="/library/feed">Моя стрічка ›</a>
              </div>

              {home?.communityHighlights.length ? (
                <div className="library-game__community-grid">
                  {home.communityHighlights.slice(0, 6).map((post) => (
                    <LibraryNewsCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <p className="library-game__empty">
                  Публікацій поки немає.
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