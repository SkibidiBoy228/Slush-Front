
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import type { CommunityPost } from "../../../types/library";
import CommunityPostCard from "./CommunityPostCard";

import "./CommunityHighlights.css";

interface CommunityHighlightsProps {
  posts: CommunityPost[];
  onViewAll?: () => void;
}

function CommunityHighlights({
  posts,
  onViewAll,
}: CommunityHighlightsProps) {
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
    <section className="community-highlights">
      <div className="community-highlights__header">
        <h2>{t("communityHighlights.title")}</h2>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="community-highlights__link"
          >
            {t("communityHighlights.myFeed")}{" "}
            <span aria-hidden="true">›</span>
          </button>
        )}
      </div>

      {posts.length === 0 ? (
        <p className="community-highlights__empty">
          {t("communityHighlights.empty")}
        </p>
      ) : (
        <div className="community-highlights__carousel">
          {posts.length > 3 && (
            <button
              type="button"
              className="community-highlights__arrow community-highlights__arrow--left"
              onClick={() => scroll("left")}
              aria-label={t("communityHighlights.previous")}
            >
              ‹
            </button>
          )}

          <div
            className="community-highlights__grid"
            ref={trackRef}
          >
            {posts.map((post) => (
              <CommunityPostCard
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
              aria-label={t("communityHighlights.next")}
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
