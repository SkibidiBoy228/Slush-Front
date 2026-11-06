
import { useEffect, useState } from "react";

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

function GameGallery({ game }: GameGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [game.id]);

  const videos: GalleryItem[] = (game.videos ?? [])
    .filter(
      (video) =>
        video.videoUrlMp4 || video.videoUrlWebm
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

  const items: GalleryItem[] = [
    ...videos,
    ...screenshots,
  ];

  if (items.length === 0 && game.thumbnail) {
    items.push({
      type: "image",
      key: "fallback-thumbnail",
      id: 0,
      image: game.thumbnail,
    });
  }

  if (items.length === 0) {
    return null;
  }

  const currentIndex = activeIndex % items.length;
  const currentItem = items[currentIndex];

  const nextImage = () => {
    setActiveIndex((current) => (current + 1) % items.length);
  };

  const previousImage = () => {
    setActiveIndex(
      (current) => (current - 1 + items.length) % items.length
    );
  };

  return (
    <section className="game-gallery">
      <div className="game-main-image-wrapper">
        {currentItem.type === "video" ? (
          <video
            key={currentItem.key}
            className="game-main-video"
            controls
            playsInline
            preload="metadata"
            poster={currentItem.thumbnail || undefined}
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

            Ваш браузер не підтримує відтворення відео.
          </video>
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
          aria-label="Попередній слайд"
          type="button"
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
              onClick={() => setActiveIndex(index)}
              aria-label={
                item.type === "video"
                  ? `Трейлер ${index + 1}`
                  : `Скріншот ${index + 1}`
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
                    ? item.name || "Трейлер"
                    : `${game.title} screenshot ${index + 1}`
                }
                loading="lazy"
              />

              {item.type === "video" && (
                <span className="gallery-video-badge">
                  ▶
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          className="gallery-arrow"
          onClick={nextImage}
          aria-label="Наступний слайд"
          type="button"
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
