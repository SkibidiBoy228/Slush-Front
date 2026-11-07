
import { useState } from "react";
import { apiRequest } from "../../../api/client";
import type { CommunityPost } from "../../../types/library";
import "./FeedPostCard.css";

interface FeedPostCardProps {
  post: CommunityPost;
}

function formatPostDate(value: string): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function FeedPostCard({ post }: FeedPostCardProps) {
  const title = post.title?.trim() || "Без назви";

  const description =
    post.shortDescription?.trim() ||
    post.content?.trim() ||
    "";

  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const formattedDate = formatPostDate(post.createdAt);

  async function handleLike() {
    if (isLikeLoading) return;

    const previousLiked = isLiked;
    const previousCount = likesCount;

    setIsLiked(!previousLiked);
    setLikesCount(
      Math.max(0, previousCount + (previousLiked ? -1 : 1)),
    );
    setIsLikeLoading(true);

    try {
      await apiRequest<void>(
        `/api/Community/${encodeURIComponent(post.id)}/like`,
        { method: "POST" },
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
      setShareMessage("Скопійовано");
    } catch (error) {
      console.error("Не вдалося скопіювати публікацію:", error);
      setShareMessage("Не вдалося скопіювати");
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
              Твій браузер не підтримує відтворення відео.
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
              {post.authorUsername || "Користувач"}
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
            aria-label="Інші дії"
            title="Інші дії"
            disabled
          >
            ···
          </button>
        </header>

        <div className="feed-post__main">
          {post.postType && (
            <span className="feed-post__type">
              {post.postType}
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
            title={isLiked ? "Прибрати вподобання" : "Вподобати"}
            aria-label={`Вподобання: ${likesCount}`}
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
            title="Коментарі"
            aria-label={`Коментарі: ${post.commentsCount}`}
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
            <span>{shareMessage || "Поділитись"}</span>
          </button>
        </footer>
      </div>
    </article>
  );
}

export default FeedPostCard;
