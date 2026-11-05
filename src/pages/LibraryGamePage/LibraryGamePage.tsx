
import { useEffect, useState } from "react";
import LibraryLayout from "../../components/Library/layout/LibraryLayout";
import GamePlayer from "../../components/Library/GamePlayer/GamePlayer";
import {
    getLibrary,
    startGameSession,
} from "../../api/library";
import type { GameSession, LibraryGame } from "../../types/library";
import "./LibraryGamePage.css";

interface LibraryGamePageProps {
    gameId: string;
}

function LibraryGamePage({ gameId }: LibraryGamePageProps) {
    const [game, setGame] = useState<LibraryGame | null>(null);
    const [session, setSession] = useState<GameSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isStarting, setIsStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [playError, setPlayError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        async function loadGame() {
            try {
                setIsLoading(true);
                setError(null);

                const result = await getLibrary({
                    page: "1",
                    pageSize: 100,
                });

                const foundGame = result.items.find(
                    (item) => item.gameId === gameId
                );

                if (active) {
                    if (foundGame) {
                        setGame(foundGame);
                    } else {
                        setError("Гру не знайдено у вашій бібліотеці.");
                    }
                }
            } catch (err) {
                console.error("Не вдалося завантажити гру:", err);

                if (active) {
                    setError("Не вдалося завантажити інформацію про гру.");
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }

        void loadGame();

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
            setPlayError(
                "Не вдалося запустити гру. Спробуйте ще раз."
            );
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
                    lastPlayedAt: updatedSession.sessionStartedAt ?? current.lastPlayedAt,
                };
            });
        }

        setSession(null);
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
                    <p>Завантаження гри...</p>
                ) : error ? (
                    <div className="library-game__error">
                        <p>{error}</p>
                        <a href="/library">
                            Повернутися до бібліотеки
                        </a>
                    </div>
                ) : game ? (
                    <>
                        <a
                            className="library-game__back"
                            href="/library"
                        >
                            ← Моя бібліотека
                        </a>

                        <div className="library-game__banner">
                            <img
                                src={game.headerImage || game.coverImage}
                                alt={game.title}
                            />
                        </div>

                        <div className="library-game__content">
                            <div className="library-game__cover">
                                <img
                                    src={game.coverImage}
                                    alt={game.title}
                                />
                            </div>

                            <div className="library-game__info">
                                <h1>{game.title}</h1>

                                <p className="library-game__developer">
                                    {game.developer}
                                </p>

                                {game.isCurrentlyPlaying && (
                                    <span className="library-game__playing">
                                        Зараз граєте
                                    </span>
                                )}

                                <button
                                    type="button"
                                    className="library-game__play"
                                    onClick={handleStartGame}
                                    disabled={isStarting}
                                >
                                    {isStarting ? "Запуск..." : "Грати"}
                                </button>

                                {playError && (
                                    <p
                                        className="library-game__play-error"
                                        role="alert"
                                    >
                                        {playError}
                                    </p>
                                )}

                                <div className="library-game__stats">
                                    <div>
                                        <span>Загальний час гри</span>
                                        <strong>
                                            {game.playtimeFormatted}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Останній запуск</span>
                                        <strong>
                                            {game.lastPlayedAt
                                                ? new Date(
                                                    game.lastPlayedAt
                                                ).toLocaleString("uk-UA")
                                                : "Ще не запускалася"}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </LibraryLayout>
    );
}

export default LibraryGamePage;
