
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  heartbeatGameSession,
  stopGameSession,
} from "../../../api/library";

import type { GameSession } from "../../../types/library";

import "./GamePlayer.css";

interface GamePlayerProps {
  session: GameSession;
  onExit: (updatedSession: GameSession | null) => void;
}

function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function GamePlayer({ session, onExit }: GamePlayerProps) {
  const { t } = useTranslation();

  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    if (!session.sessionStartedAt) return 0;

    const startedAt = new Date(session.sessionStartedAt).getTime();

    if (Number.isNaN(startedAt)) return 0;

    return Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  });

  const [isStopping, setIsStopping] = useState(false);
  const [stopError, setStopError] = useState<string | null>(null);

  const stopRequested = useRef(false);
  const heartbeatInProgress = useRef(false);

  useEffect(() => {
    if (!session.sessionStartedAt) return;

    const startedAt = new Date(session.sessionStartedAt).getTime();

    if (Number.isNaN(startedAt)) return;

    const updateTimer = () => {
      setElapsedSeconds(
        Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
      );
    };

    updateTimer();

    const timer = window.setInterval(updateTimer, 1000);

    return () => window.clearInterval(timer);
  }, [session.sessionStartedAt]);

  useEffect(() => {
    const heartbeat = window.setInterval(async () => {
      if (heartbeatInProgress.current || stopRequested.current) return;

      heartbeatInProgress.current = true;

      try {
        await heartbeatGameSession(session.gameId);
      } catch (error) {
        console.error("Не вдалося оновити ігрову сесію:", error);
      } finally {
        heartbeatInProgress.current = false;
      }
    }, 60_000);

    return () => window.clearInterval(heartbeat);
  }, [session.gameId]);

  async function handleExit() {
    if (stopRequested.current || isStopping) return;

    stopRequested.current = true;
    setIsStopping(true);
    setStopError(null);

    try {
      const updatedSession = await stopGameSession(session.gameId);
      onExit(updatedSession);
    } catch (error) {
      console.error("Не вдалося зупинити ігрову сесію:", error);

      setStopError(t("gamePlayer.stopError"));

      stopRequested.current = false;
      setIsStopping(false);
    }
  }

  return (
    <div className="game-player">
      <header className="game-player__header">
        <div className="game-player__game-info">
          <img
            src={session.coverImage}
            alt=""
            className="game-player__cover"
          />

          <div className="game-player__title">
            <strong>{session.gameTitle}</strong>

            <span>
              <span className="game-player__status-dot" />
              {t("gamePlayer.playing")}
            </span>
          </div>
        </div>

        <div className="game-player__controls">
          <div className="game-player__timer">
            {formatTime(elapsedSeconds)}
          </div>

          <button
            type="button"
            className="game-player__exit"
            onClick={handleExit}
            disabled={isStopping}
          >
            {isStopping
              ? t("gamePlayer.stopping")
              : t("gamePlayer.exit")}
          </button>
        </div>
      </header>

      {stopError && (
        <div className="game-player__error" role="alert">
          {stopError}
        </div>
      )}

      <main className="game-player__content">
        {session.canEmbedInIframe ? (
          <iframe
            className="game-player__iframe"
            src={session.playUrl}
            title={session.gameTitle}
            allow="fullscreen; autoplay; gamepad"
            allowFullScreen
          />
        ) : (
          <div className="game-player__unsupported">
            <h2>{t("gamePlayer.unsupportedTitle")}</h2>

            <p>{t("gamePlayer.unsupportedDescription")}</p>

            <a
              href={session.playUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("gamePlayer.openInNewTab")}
            </a>
          </div>
        )}
      </main>
    </div>
  );
}

export default GamePlayer;
