import { useEffect, useState } from "react";

import { getGames, getGameDetails } from "../../api/games";
import type { CatalogGame } from "../../types/catalog";

import { formatPrice } from "../../utils/price";

import GameSearch from "../GameSearch/GameSearch";

import "./HeroSlider.css";

interface HeroSlide {
  id: string;
  title: string;
  description: string;
  image: string;
  price: string;
  oldPrice?: string;
  discount?: string;
}

function convertGameToSlide(game: CatalogGame): HeroSlide {
  return {
    id: game.id,
    title: game.title,
    description: "",
    image: game.thumbnail,
    price: formatPrice(game.price),
    oldPrice:
      game.oldPrice > game.price && game.price > 0
        ? formatPrice(game.oldPrice)
        : undefined,
    discount:
      game.discountPercent > 0
        ? `-${game.discountPercent}%`
        : undefined,
  };
}

function HeroSlider() {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSlides() {
      try {
        const response = await getGames({
          page: 1,
          pageSize: 10,
        });

        const slides = response.items.map(convertGameToSlide);

        setHeroSlides(slides);
      } catch (error) {
        console.error("Не вдалося завантажити слайдер:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSlides();
  }, []);

  const activeGame = heroSlides[activeSlide];

  useEffect(() => {
    if (!activeGame) {
      return;
    }

    async function loadDescription() {
      try {
        const details = await getGameDetails(activeGame.id);

        setHeroSlides((currentSlides) =>
          currentSlides.map((slide) =>
            slide.id === activeGame.id
              ? {
                  ...slide,
                  description: details.description
                    ? details.description.replace(/<[^>]*>/g, "")
                    : "",
                }
              : slide
          )
        );
      } catch (error) {
        console.error("Не вдалося завантажити опис гри:", error);
      }
    }

    loadDescription();
  }, [activeGame?.id]);

  if (loading) {
    return (
      <section className="hero-slider-container">
        <div className="hero-section" />
      </section>
    );
  }

  if (!heroSlides.length) {
    return null;
  }

  const slide = heroSlides[activeSlide];

  const previous = () => {
    setActiveSlide((prev) =>
      prev === 0 ? heroSlides.length - 1 : prev - 1
    );
  };

  const next = () => {
    setActiveSlide((prev) =>
      prev === heroSlides.length - 1 ? 0 : prev + 1
    );
  };

  const openGame = () => {
    window.location.href = `/game/${slide.id}`;
  };

  return (
    <section className="hero-slider-container">
      <div
        className="hero-section"
        onClick={openGame}
        role="link"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            openGame();
          }
        }}
      >
        <img
          className="hero-background"
          src={slide.image}
          alt={slide.title}
        />

        <div className="hero-dark-overlay" />

        <GameSearch />

        <div className="hero-title-background">
          {slide.title}
        </div>

        <div className="hero-content">
          <div className="hero-sale">
            {slide.discount && (
              <span className="hero-discount">
                {slide.discount}
              </span>
            )}

            <div className="hero-price">
              <strong>{slide.price}</strong>

              {slide.oldPrice && (
                <del>{slide.oldPrice}</del>
              )}
            </div>
          </div>

          <h1>{slide.title}</h1>

          {slide.description && (
            <p>{slide.description}</p>
          )}
        </div>

        <button
          className="hero-arrow hero-arrow-left"
          onClick={(event) => {
            event.stopPropagation();
            previous();
          }}
          aria-label="Попередній слайд"
        >
          ‹
        </button>

        <button
          className="hero-arrow hero-arrow-right"
          onClick={(event) => {
            event.stopPropagation();
            next();
          }}
          aria-label="Наступний слайд"
        >
          ›
        </button>
      </div>

      <div className="thumbnail-section">
        <div className="thumbnail-list">
          {heroSlides.map((item, index) => (
            <button
              key={item.id}
              className={`thumbnail ${
                index === activeSlide ? "selected" : ""
              }`}
              onClick={() => setActiveSlide(index)}
            >
              <img
                src={item.image}
                alt={item.title}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroSlider;