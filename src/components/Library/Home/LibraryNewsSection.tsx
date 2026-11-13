
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import type { SteamNewsItem } from "../../../types/news";
import LibraryNewsCard from "./LibraryNewsCard";

import "./LibraryNewsSection.css";

interface LibraryNewsSectionProps {
  news: SteamNewsItem[];
  onViewAll?: () => void;
}

function LibraryNewsSection({
  news,
  onViewAll,
}: LibraryNewsSectionProps) {
  const { t } = useTranslation();

  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    if (!trackRef.current) return;

    trackRef.current.scrollBy({
      left:
        direction === "left"
          ? -trackRef.current.clientWidth
          : trackRef.current.clientWidth,
      behavior: "smooth",
    });
  }

  return (
    <section className="library-home-section">
      <div className="library-home-section__header">
        <h2>{t("libraryNewsSection.title")}</h2>

        {onViewAll && (
          <button
            type="button"
            className="library-home-section__link"
            onClick={onViewAll}
          >
            {t("libraryNewsSection.viewAll")}{" "}
            <span aria-hidden="true">›</span>
          </button>
        )}
      </div>

      {news.length === 0 ? (
        <p className="library-home-section__empty">
          {t("libraryNewsSection.empty")}
        </p>
      ) : (
        <div className="library-home-section__carousel">
          {news.length > 3 && (
            <button
              type="button"
              className="library-home-section__arrow library-home-section__arrow--left"
              onClick={() => scroll("left")}
              aria-label={t("libraryNewsSection.previous")}
            >
              ‹
            </button>
          )}

          <div className="library-news-grid" ref={trackRef}>
            {news.map((item) => (
              <LibraryNewsCard key={item.id} post={item} />
            ))}
          </div>

          {news.length > 3 && (
            <button
              type="button"
              className="library-home-section__arrow library-home-section__arrow--right"
              onClick={() => scroll("right")}
              aria-label={t("libraryNewsSection.next")}
            >
              ›
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export default LibraryNewsSection;
