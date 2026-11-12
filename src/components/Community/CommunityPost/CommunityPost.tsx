import type { MouseEvent, KeyboardEvent } from "react";
import type { CommunityPost as CommunityPostData } from "../../../types/community";
import "./CommunityPost.css";

interface CommunityPostProps {
  gameId: string;
  post: CommunityPostData;
  onLike: (postId: string) => void;
  onComments: (postId: string) => void;
}

function CommunityPost({
  gameId,
  post,
  onLike,
  onComments,
}: CommunityPostProps) {
  const openPost = () => {
    window.location.href =
      `/game/${encodeURIComponent(gameId)}/community/post/${encodeURIComponent(post.id)}`;
  };

  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target;

    if (
      target instanceof Element &&
      target.closest("button, a, video")
    ) {
      return;
    }

    openPost();
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPost();
    }
  };

  const postTypeLabels: Record<string, string> = {
    Discussion: "Обговорення",
    Screenshot: "Скріншот",
    Video: "Відео",
    Guide: "Гайд",
    News: "Новини",
  };

  const authorInitial =
    post.authorUsername?.charAt(0).toUpperCase() || "?";

  const handleShare = async () => {
    try {
      const postUrl =
        `${window.location.origin}/game/${encodeURIComponent(gameId)}/community/post/${encodeURIComponent(post.id)}`;

      if (navigator.share) {
        await navigator.share({
          title: post.title || "Публікація спільноти",
          text: post.content || post.shortDescription || "",
          url: postUrl,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(postUrl);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Share failed:", error);
      }
    }
  };

  const renderMedia = () => {
    if (!post.mediaUrl) return null;

    if (post.postType === "Video") {
      return (
        <div className="community-post-media community-post-video">
          <video
            src={post.mediaUrl}
            preload="metadata"
            muted
            playsInline
            autoPlay
            loop
          />
          <span className="community-post-play" aria-hidden="true">
            ▶
          </span>
        </div>
      );
    }

    return (
      <div className="community-post-media">
        <img
          src={post.mediaUrl}
          alt={post.title || "Зображення публікації"}
          loading="lazy"
        />
      </div>
    );
  };

  return (
    <article
      className={`community-post community-post-${post.postType.toLowerCase()}`}
      role="link"
      tabIndex={0}
      aria-label={`Відкрити публікацію: ${post.title || "Публікація спільноти"}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      <header className="community-post-header">
        <button
          type="button"
          className="community-post-author-link"
          onClick={() => {
            window.location.href = `/profile/${encodeURIComponent(
              post.authorUsername
            )}`;
          }}
        >
          <div className="community-post-avatar">
            {post.authorAvatarUrl ? (
              <img
                src={post.authorAvatarUrl}
                alt={post.authorUsername}
              />
            ) : (
              <span>{authorInitial}</span>
            )}
          </div>

          <span className="community-post-author-name">
            {post.authorUsername}
          </span>
        </button>

        <div className="community-post-header-meta">
          <span className="community-post-type">
            {postTypeLabels[post.postType] ?? post.postType}
          </span>

          <span className="community-post-date">
            {post.createdAt}
          </span>
        </div>

        <span className="community-post-more" aria-hidden="true">
          •••
        </span>
      </header>

      <div className="community-post-content">
        <div className="community-post-copy">
          {post.title && (
            <h2 className="community-post-title">{post.title}</h2>
          )}

          {post.shortDescription && (
            <p className="community-post-description">
              {post.shortDescription}
            </p>
          )}

          {post.content && (
            <p className="community-post-text">{post.content}</p>
          )}
        </div>

        {renderMedia()}
      </div>

      <footer className="community-post-actions">
        <button
          type="button"
          className={`community-post-action like-action ${
            post.isLiked ? "liked" : ""
          }`}
          onClick={() => onLike(post.id)}
          aria-label="Подобається"
          aria-pressed={post.isLiked}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
          </svg>

          <span>{post.likesCount.toLocaleString("uk-UA")}</span>
        </button>

        <button
          type="button"
          className="community-post-action"
          onClick={() => onComments(post.id)}
          aria-label="Коментарі"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
          </svg>

          <span>{post.commentsCount.toLocaleString("uk-UA")}</span>
        </button>

        <button
          type="button"
          className="community-post-action community-post-share"
          onClick={handleShare}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 16V3m-5 5 5-5 5 5" />
            <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
          </svg>

          <span>Поділитися</span>
        </button>
      </footer>
    </article>
  );
}

export default CommunityPost;