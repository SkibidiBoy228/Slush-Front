
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { apiRequest } from "../../../api/client";
import type { CommunityPost } from "../../../types/library";

import "./FeedPostCard.css";

interface FeedPostCardProps {
  post: CommunityPost;
}

function formatPostDate(value: string, locale: string): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function FeedPostCard({ post }: FeedPostCardProps) {
  const { t, i18n } = useTranslation();

  const title = post.title?.trim() || t("feedPostCard.untitled");

  const description =
    post.shortDescription?.trim() ||
    post.content?.trim() ||
    "";

  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const dateLocales: Record<string, string> = {
    uk: "uk-UA",
    en: "en-US",
    sk: "sk-SK",
    ru: "ru-RU",
  };

  const currentLocale =
    dateLocales[i18n.language.split("-")[0]] || "uk-UA";

  const formattedDate = formatPostDate(post.createdAt, currentLocale);

  const postTypeLabels: Record<string, string> = {
    Discussion: t("feedPostCard.types.discussion"),
    Screenshot: t("feedPostCard.types.screenshot"),
    Video: t("feedPostCard.types.video"),
    Guide: t("feedPostCard.types.guide"),
    News: t("feedPostCard.types.news"),
  };

  const displayedPostType = post.postType
    ? postTypeLabels[post.postType] || post.postType
    : "";

  async function handleLike() {
    if (isLikeLoading) return;

    const previousLiked = isLiked;
    const previousCount = likesCount;

    setIsLiked(!previousLiked);
    setLikesCount(
      Math.max(0, previousCount + (previousLiked ? -1 : 1))
    );
    setIsLikeLoading(true);

    try {
      await apiRequest<void>(
        `/api/Community/${encodeURIComponent(post.id)}/like`,
        { method: "POST" }
      );
    } catch (error) {
      console.error("Не вдалося змінити вподобання:", error);

      setIsLiked(previousLiked);
      setLikesCount(previousCount);
    } finally {
      setIsLikeLoading(false);
    }
  }

  async function handleShare() {
    const shareData = `${title}\n\n${description}`;

    try {
      await navigator.clipboard.writeText(shareData);
      setShareMessage(t("feedPostCard.copied"));
    } catch (error) {
      console.error("Не вдалося скопіювати публікацію:", error);
      setShareMessage(t("feedPostCard.copyError"));
    }

    window.setTimeout(() => {
      setShareMessage("");
    }, 2000);
  }

  return (
    <article className="feed-post">
      {post.mediaUrl && (
        <div className="feed-post__banner">
          {post.postType === "Video" ? (
            <video
              src={post.mediaUrl}
              controls
              playsInline
              preload="metadata"
              className="feed-post__video"
            >
              {t("feedPostCard.videoUnsupported")}
            </video>
          ) : (
            <img
              src={post.mediaUrl}
              alt={title}
              loading="lazy"
            />
          )}
        </div>
      )}

      <div className="feed-post__content">
        <header className="feed-post__header">
          <div className="feed-post__author">
            {post.authorAvatarUrl ? (
              <img
                className="feed-post__avatar"
                src={post.authorAvatarUrl}
                alt=""
                loading="lazy"
              />
            ) : (
              <span className="feed-post__avatar feed-post__avatar--fallback">
                {post.authorUsername?.charAt(0).toUpperCase() || "?"}
              </span>
            )}

            <span className="feed-post__username">
              {post.authorUsername || t("feedPostCard.user")}
            </span>

            <time
              className="feed-post__date"
              dateTime={post.createdAt}
              title={formattedDate}
            >
              {formattedDate}
            </time>
          </div>

          <button
            className="feed-post__more"
            type="button"
            aria-label={t("feedPostCard.moreActions")}
            title={t("feedPostCard.moreActions")}
            disabled
          >
            ···
          </button>
        </header>

        <div className="feed-post__main">
          {displayedPostType && (
            <span className="feed-post__type">
              {displayedPostType}
            </span>
          )}

          <h2 className="feed-post__title">{title}</h2>

          {description && (
            <p className="feed-post__description">
              {description}
            </p>
          )}
        </div>

        <footer className="feed-post__actions">
          <button
            className={`feed-post__action ${
              isLiked ? "feed-post__action--liked" : ""
            }`}
            type="button"
            title={
              isLiked
                ? t("feedPostCard.unlike")
                : t("feedPostCard.like")
            }
            aria-label={t("feedPostCard.likes", {
              count: likesCount,
            })}
            aria-pressed={isLiked}
            disabled={isLikeLoading}
            onClick={() => void handleLike()}
          >
            <span className="feed-post__heart">
              {isLiked ? "♥" : "♡"}
            </span>
            <span>{likesCount}</span>
          </button>

          <button
            className="feed-post__action"
            type="button"
            title={t("feedPostCard.comments")}
            aria-label={t("feedPostCard.commentsCount", {
              count: post.commentsCount,
            })}
            onClick={() => {
              // Підключимо відкриття коментарів пізніше.
            }}
          >
            <span className="feed-post__comment">▢</span>
            <span>{post.commentsCount}</span>
          </button>

          <button
            className="feed-post__action feed-post__share"
            type="button"
            onClick={() => void handleShare()}
          >
            <span className="feed-post__share-icon">↥</span>
            <span>
              {shareMessage || t("feedPostCard.share")}
            </span>
          </button>
        </footer>
      </div>
    </article>
  );
}

export default FeedPostCard;
