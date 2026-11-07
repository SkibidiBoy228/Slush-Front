import { useRef } from "react";
import type { CommunityPost } from "../../../types/library";
import LibraryNewsCard from "./LibraryNewsCard";
import "./LibraryNewsSection.css";

interface LibraryNewsSectionProps {
  news: CommunityPost[];
  onViewAll?: () => void;
}

function LibraryNewsSection({
  news,
  onViewAll,
}: LibraryNewsSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    if (!trackRef.current) return;

    trackRef.current.scrollBy({
      left: direction === "left" ? -trackRef.current.clientWidth : trackRef.current.clientWidth,
      behavior: "smooth",
    });
  }

  return (
    <section className="library-home-section">
      <div className="library-home-section__header">
        <h2>Новини</h2>

        {onViewAll && (
          <button
            type="button"
            className="library-home-section__link"
            onClick={onViewAll}
          >
            Усі новини <span aria-hidden="true">›</span>
          </button>
        )}
      </div>

      {news.length === 0 ? (
        <p className="library-home-section__empty">
          Новин поки немає
        </p>
      ) : (
        <div className="library-home-section__carousel">
          {news.length > 3 && (
            <button
              type="button"
              className="library-home-section__arrow library-home-section__arrow--left"
              onClick={() => scroll("left")}
              aria-label="Попередні новини"
            >
              ‹
            </button>
          )}

          <div
            className="library-news-grid"
            ref={trackRef}
          >
            {news.map((post) => (
              <LibraryNewsCard
                key={post.id}
                post={post}
              />
            ))}
          </div>

          {news.length > 3 && (
            <button
              type="button"
              className="library-home-section__arrow library-home-section__arrow--right"
              onClick={() => scroll("right")}
              aria-label="Наступні новини"
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