
import type { CommunityPost as CommunityPostData } from "../../../types/community";
import "./CommunityPost.css";

interface CommunityPostProps {
  post: CommunityPostData;
  onLike: (postId: string) => void;
  onComments: (postId: string) => void;
}

function CommunityPost({ post, onLike, onComments }: CommunityPostProps) {
  const postTypeLabels: Record<string, string> = {
    Discussion: "Обговорення",
    Screenshot: "Скріншот",
    Video: "Відео",
    Guide: "Гайд",
    News: "Новини",
  };

  const authorInitial = post.authorUsername?.charAt(0).toUpperCase() || "?";

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title || "Публікація спільноти",
          text: post.content || post.shortDescription || "",
          url: window.location.href,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Share failed:", error);
      }
    }
  };

  const renderMedia = () => {
    if (!post.mediaUrl) return null;

    if (post.postType === "Screenshot" || post.postType === "Guide") {
      return (
        <div className="community-post-media">
          <img
            src={post.mediaUrl}
            alt={post.title || "Зображення публікації"}
            loading="lazy"
          />
        </div>
      );
    }

    if (post.postType === "Video") {
      return (
        <div className="community-post-media community-post-video">
          <video
            src={post.mediaUrl}
            controls
            preload="metadata"
          />
        </div>
      );
    }

    return null;
  };

  return (
    <article className="community-post">
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
      </header>

      <div className="community-post-content">
        {post.title && (
          <h2 className="community-post-title">
            {post.title}
          </h2>
        )}

        {post.shortDescription && (
          <p className="community-post-description">
            {post.shortDescription}
          </p>
        )}

        {post.content && (
          <p className="community-post-text">
            {post.content}
          </p>
        )}

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
