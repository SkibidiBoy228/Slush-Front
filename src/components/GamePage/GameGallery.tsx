
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";

import type { GameDetails } from "../../types/game";

interface GameGalleryProps {
  game: GameDetails;
}

type GalleryItem =
  | {
      type: "video";
      key: string;
      id: number;
      name: string;
      thumbnail: string;
      mp4: string;
      webm: string;
    }
  | {
      type: "image";
      key: string;
      id: number;
      image: string;
    };

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function GameGallery({ game }: GameGalleryProps) {
  const { t } = useTranslation();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const videos: GalleryItem[] = (game.videos ?? [])
    .filter(
      (video) => video.videoUrlMp4 || video.videoUrlWebm
    )
    .map((video) => ({
      type: "video",
      key: `video-${video.id}`,
      id: video.id,
      name: video.name,
      thumbnail: video.thumbnailUrl || game.thumbnail,
      mp4: video.videoUrlMp4,
      webm: video.videoUrlWebm,
    }));

  const screenshots: GalleryItem[] = (
    game.screenshots ?? []
  )
    .filter((screenshot) => screenshot.image)
    .map((screenshot) => ({
      type: "image",
      key: `image-${screenshot.id}`,
      id: screenshot.id,
      image: screenshot.image,
    }));

  const items: GalleryItem[] = [...videos, ...screenshots];

  if (items.length === 0 && game.thumbnail) {
    items.push({
      type: "image",
      key: "fallback-thumbnail",
      id: 0,
      image: game.thumbnail,
    });
  }

  const currentIndex =
    items.length > 0 ? activeIndex % items.length : 0;

  const currentItem = items[currentIndex];

  // Сбрасываем галерею при смене игры.
  useEffect(() => {
    setActiveIndex(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [game.id]);

  // Синхронизируем звук с текущим видео.
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, currentItem?.key]);

  // Автоматически запускаем выбранный трейлер.
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    if (!currentItem || currentItem.type !== "video") {
      return;
    }

    const video = videoRef.current;

    if (!video) return;

    video.muted = isMuted;

    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentItem?.key]);

  const selectSlide = (index: number) => {
    setActiveIndex(index);
    setCurrentTime(0);
    setDuration(0);
  };

  const nextImage = () => {
    if (items.length <= 1) return;

    setActiveIndex((current) => (current + 1) % items.length);
  };

  const previousImage = () => {
    if (items.length <= 1) return;

    setActiveIndex(
      (current) => (current - 1 + items.length) % items.length
    );
  };

  const togglePlay = async () => {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
      } catch (error) {
        console.error("Video playback error:", error);
      }
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    setIsMuted((current) => !current);
  };

  const handleSeek = (value: number) => {
    const video = videoRef.current;

    if (!video || !Number.isFinite(video.duration)) return;

    video.currentTime = value;
    setCurrentTime(value);
  };

  const toggleFullscreen = async () => {
    const player = playerRef.current;

    if (!player) return;

    try {
      if (!document.fullscreenElement) {
        await player.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  if (items.length === 0 || !currentItem) {
    return null;
  }

  return (
    <section className="game-gallery">
      <div className="game-main-image-wrapper">
        {currentItem.type === "video" ? (
          <div
            className="game-video-player"
            ref={playerRef}
            key={currentItem.key}
          >
            <video
              ref={videoRef}
              className="game-main-video"
              autoPlay
              muted={isMuted}
              playsInline
              preload="auto"
              poster={currentItem.thumbnail || undefined}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={(event) =>
                setCurrentTime(event.currentTarget.currentTime)
              }
              onLoadedMetadata={(event) =>
                setDuration(event.currentTarget.duration || 0)
              }
              onDurationChange={(event) =>
                setDuration(event.currentTarget.duration || 0)
              }
              onEnded={() => setIsPlaying(false)}
            >
              {currentItem.mp4 && (
                <source
                  src={currentItem.mp4}
                  type="video/mp4"
                />
              )}

              {currentItem.webm && (
                <source
                  src={currentItem.webm}
                  type="video/webm"
                />
              )}

              {t("gameGallery.videoUnsupported")}
            </video>

            <div className="game-video-controls">
              <button
                type="button"
                className="game-video-play"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? "Ⅱ" : "▶"}
              </button>

              <div className="game-video-timeline">
                <span className="game-video-time">
                  {formatTime(currentTime)}
                </span>

                <input
                  className="game-video-progress"
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={Math.min(currentTime, duration || 0)}
                  onChange={(event) =>
                    handleSeek(Number(event.target.value))
                  }
                  aria-label="Video progress"
                  style={
                    {
                      "--video-progress": `${
                        duration > 0
                          ? (currentTime / duration) * 100
                          : 0
                      }%`,
                    } as CSSProperties
                  }
                />

                <span className="game-video-time">
                  {formatTime(duration)}
                </span>
              </div>

              <button
                type="button"
                className="game-video-icon"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? "🔇" : "🔊"}
              </button>

              <button
                type="button"
                className="game-video-icon"
                onClick={toggleFullscreen}
                aria-label="Fullscreen"
              >
                ⛶
              </button>
            </div>
          </div>
        ) : (
          <img
            key={currentItem.key}
            className="game-main-image"
            src={currentItem.image}
            alt={game.title}
          />
        )}
      </div>

      <div className="gallery-controls">
        <button
          className="gallery-arrow"
          onClick={previousImage}
          aria-label={t("gameGallery.previousSlide")}
          type="button"
          disabled={items.length <= 1}
        >
          ‹
        </button>

        <div className="gallery-thumbnails">
          {items.map((item, index) => (
            <button
              key={item.key}
              type="button"
              className={`gallery-thumbnail ${
                index === currentIndex ? "active" : ""
              }`}
              onClick={() => selectSlide(index)}
              aria-label={
                item.type === "video"
                  ? t("gameGallery.trailer", { number: index + 1 })
                  : t("gameGallery.screenshot", { number: index + 1 })
              }
              aria-current={
                index === currentIndex ? "true" : undefined
              }
            >
              <img
                src={
                  item.type === "video"
                    ? item.thumbnail || game.thumbnail
                    : item.image
                }
                alt={
                  item.type === "video"
                    ? item.name || t("gameGallery.trailerFallback")
                    : t("gameGallery.gameScreenshot", {
                        title: game.title,
                        number: index + 1,
                      })
                }
                loading="lazy"
              />

              {item.type === "video" && (
                <span className="gallery-video-badge">▶</span>
              )}
            </button>
          ))}
        </div>

        <button
          className="gallery-arrow"
          onClick={nextImage}
          aria-label={t("gameGallery.nextSlide")}
          type="button"
          disabled={items.length <= 1}
        >
          ›
        </button>
      </div>

      <div className="gallery-progress">
        <span
          style={{
            width: `${((currentIndex + 1) / items.length) * 100}%`,
          }}
        />
      </div>
    </section>
  );
}

export default GameGallery;
