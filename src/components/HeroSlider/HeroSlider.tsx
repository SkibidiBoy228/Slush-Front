import { useEffect, useState } from "react";

import { getGames, getGameDetails } from "../../api/games";
import type { CatalogGame } from "../../types/catalog";
import type { GameDetails } from "../../types/game";

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

function convertGameToSlide(
  game: CatalogGame,
  details?: GameDetails
): HeroSlide {
  const price = details?.price ?? game.price;
  const oldPrice = details?.oldPrice ?? game.oldPrice;
  const discountPercent =
    details?.discountPercent ?? game.discountPercent;

  return {
    id: game.id,
    title: details?.title || game.title,
    description: details?.description
      ? details.description.replace(/<[^>]*>/g, "")
      : "",
    image: details?.thumbnail || game.thumbnail,
    price: formatPrice(price),

    oldPrice:
      oldPrice > price && price > 0
        ? formatPrice(oldPrice)
        : undefined,

    discount:
      discountPercent > 0
        ? `-${discountPercent}%`
        : undefined,
  };
}

function HeroSlider() {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadSlides() {
      try {
        setLoading(true);

        const response = await getGames({
          page: 1,
          pageSize: 10,
        });

        const paidGames = response.items.filter(
          (game) => game.price > 0
        );

        const slidesWithDetails = await Promise.all(
          paidGames.map(async (game) => {
            try {
              const details = await getGameDetails(game.id);

              // Дополнительная защита от бесплатных игр
              if (details.price <= 0) {
                return null;
              }

              return convertGameToSlide(game, details);
            } catch (error) {
              console.error(
                `Не вдалося завантажити дані гри ${game.id}:`,
                error
              );

              // Если детали не загрузились, используем данные каталога
              return game.price > 0
                ? convertGameToSlide(game)
                : null;
            }
          })
        );

        const validSlides = slidesWithDetails.filter(
          (slide): slide is HeroSlide => slide !== null
        );

        if (!isCancelled) {
          setHeroSlides(validSlides);
          setActiveSlide(0);
        }
      } catch (error) {
        console.error(
          "Не вдалося завантажити слайдер:",
          error
        );
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadSlides();

    return () => {
      isCancelled = true;
    };
  }, []);

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

        <div
          className="hero-search-container"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <GameSearch />
        </div>

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