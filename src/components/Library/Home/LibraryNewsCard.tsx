
import { useTranslation } from "react-i18next";

import type { SteamNewsItem } from "../../../types/news";
import "./LibraryNewsCard.css";

interface LibraryNewsCardProps {
  post: SteamNewsItem;
}

function cleanContents(contents: string): string {
  return contents
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?p>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function LibraryNewsCard({ post }: LibraryNewsCardProps) {
  const { t } = useTranslation();

  const title = post.title?.trim() || t("libraryNewsCard.untitled");
  const description = cleanContents(post.contents || "");
  const date = post.dateFormatted || post.date || "";

  return (
    <article className="library-news-card">
      {post.gameImage && (
        <a
          className="library-news-card__media"
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={title}
        >
          <img
            src={post.gameImage}
            alt={post.gameTitle || ""}
            loading="lazy"
          />
        </a>
      )}

      <div className="library-news-card__body">
        <div className="library-news-card__author">
          <span className="library-news-card__username">
            {post.gameTitle || "Steam"}
          </span>

          {post.feedLabel && (
            <span className="library-news-card__date">
              {post.feedLabel}
            </span>
          )}

          {date && (
            <span className="library-news-card__date">
              {date}
            </span>
          )}
        </div>

        <h3 className="library-news-card__title">
          {title}
        </h3>

        {description && (
          <p className="library-news-card__description">
            {description}
          </p>
        )}

        <div className="library-news-card__footer">
          <span>{post.author || "Steam"}</span>

          <a
            className="library-news-read-link"
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("libraryNewsCard.readNews")} →
          </a>
        </div>
      </div>
    </article>
  );
}

export default LibraryNewsCard;
