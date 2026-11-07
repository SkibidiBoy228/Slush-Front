import { useRef } from "react";
import type { CommunityPost } from "../../../types/library";
import LibraryNewsCard from "./LibraryNewsCard";
import "./CommunityHighlights.css";

interface CommunityHighlightsProps {
  posts: CommunityPost[];
  onViewAll?: () => void;
}

function CommunityHighlights({
  posts,
  onViewAll,
}: CommunityHighlightsProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    if (!trackRef.current) return;

    trackRef.current.scrollBy({
      left: direction === "left" ? -trackRef.current.clientWidth : trackRef.current.clientWidth,
      behavior: "smooth",
    });
  }

  return (
    <section className="community-highlights">
      <div className="community-highlights__header">
        <h2>Цікаве від спільноти</h2>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="community-highlights__link"
          >
            Моя стрічка <span aria-hidden="true">›</span>
          </button>
        )}
      </div>

      {posts.length === 0 ? (
        <p className="community-highlights__empty">
          Публікацій поки немає.
        </p>
      ) : (
        <div className="community-highlights__carousel">
          {posts.length > 3 && (
            <button
              type="button"
              className="community-highlights__arrow community-highlights__arrow--left"
              onClick={() => scroll("left")}
              aria-label="Попередні публікації"
            >
              ‹
            </button>
          )}

          <div
            className="community-highlights__grid"
            ref={trackRef}
          >
            {posts.map((post) => (
              <LibraryNewsCard
                key={post.id}
                post={post}
              />
            ))}
          </div>

          {posts.length > 3 && (
            <button
              type="button"
              className="community-highlights__arrow community-highlights__arrow--right"
              onClick={() => scroll("right")}
              aria-label="Наступні публікації"
            >
              ›
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export default CommunityHighlights;