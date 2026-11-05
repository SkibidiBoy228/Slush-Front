import { useEffect,useRef,useState } from "react";
import { heartbeatGameSession, stopGameSession } from "../../../api/library";
import type { GameSession } from "../../../types/library";
import "./GamePlayer.css"

interface GamePlayerProps{
    session: GameSession;
    onExit: (updatedSession : GameSession | null) => void;
}

function formatTime(totalSeconds: number) : string{
    const hours = Math.floor(totalSeconds/3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds].map((value)=> String(value).padStart(2, "0"))
    .join(":");
}

function GamePlayer({ session, onExit }: GamePlayerProps) {
    const [elapsedSeconds, setElapsedSeconds] = useState(() => {
        if (!session.sessionStartedAt) return 0;

        return Math.max(
            0,
            Math.floor(
                (Date.now() - new Date(session.sessionStartedAt).getTime()) / 1000
            )
        );
    });
    const [isStopping, setIsStopping] = useState(false);
    const [stopError, setStopError] = useState<string | null>(null);
    const stopRequested = useRef(false);

    useEffect(()=>{
        const timer = window.setInterval(()=>{
            setElapsedSeconds((current)=>current+1);
        }, 1000);
        return () => window.clearInterval(timer);
    },[]);

    useEffect(()=>{
        const heartbeat = window.setInterval(async ()=>{
            try{
                await heartbeatGameSession(session.gameId);
            }catch(error){
                console.error("Не вдалося оновити ігрову сесію:", error);
            }
        }, 60_000);
        return ()=>window.clearInterval(heartbeat);
    }, [session.gameId]);

    async function handleExit() {
        if(stopRequested.current || isStopping) return;
        stopRequested.current = true;
        setIsStopping(true);
        setStopError(null);

        try{
            const updatedSession = await stopGameSession(session.gameId);
            onExit(updatedSession);
        }catch(error){
            console.error("Не вдалося зупинити ігрову сесію:", error);
            setStopError("Не вдалося завершити сесію. Спробуйте ще раз");
            stopRequested.current = false;
            setIsStopping(false);
        }
    }

    return (
        <div className="game-player">
            <header className="game-player__header">
                <div className="game-player__game-info">
                    <img
                        src = {session.coverImage}
                        alt = ""
                        className="game-player__cover"
                        />
                        <div className="game-player__title">
                            <strong>{session.gameTitle}</strong>
                            <span>
                                <span className="game-player__status-dot"/>
                                Зараз граєте
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
                            {isStopping ? "Заверщення...":"Вийти з гри"}
                        </button>
                </div>
            </header>
            {stopError && (
                <div className="game-player__error" role="alert">
                    {stopError}
                </div>
            )}
            <main className="game-player__content">
                {session.canEmbedInIframe? (
                    <iframe className="game-player__iframe"
                    src={session.playUrl}
                    title={session.gameTitle}
                    allow = "fullscreen; autoplay; gamepad"
                    allowFullScreen
                    />
                ): (
                    <div className="game-player__unsupported">
                        <h2>Гру неможливо відкрити у вбудованому плеєрі</h2>
                        <p>
                            Ця гра не підтримує запуск через iframe
                        </p>
                        <a href={session.playUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            >
                                Відкрити гру в новій вкладці
                            </a>
                    </div>
                )}
            </main>
        </div>
    );
}
export default GamePlayer;