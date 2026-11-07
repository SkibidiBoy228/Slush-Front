import type { CommunityPost as CommunityPostData } from "../../../types/community";
import "./CommunityPost.css";

interface CommunityPostProps {
  post: CommunityPostData;
  onLike: (postId: string) => void;
  onComments: (postId: string) => void;
}

function CommunityPost({ post, onLike, onComments }: CommunityPostProps) {
  const renderMedia = () => {
    if (!post.mediaUrl) return null;

    if (
      post.postType === "Screenshot" ||
      post.postType === "Guide"
    ) {
      return (
        <div className="community-post-media">
          <img
            src={post.mediaUrl}
            alt={post.title || "Зображення публікації"}
          />
        </div>
      );
    }

    if (post.postType === "Video") {
      return (
        <div className="community-post-media community-post-video">
          <video src={post.mediaUrl} controls preload="metadata" />
        </div>
      );
    }

    return null;
  };

  const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    </svg>
  );

  const CommentIcon = () => (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" />
    </svg>
  );

  const ShareIcon = () => (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 16V3m-5 5 5-5 5 5" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );

  const MoreIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );

  return (
    <article className="community-post">
      <div className="community-post-author">
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
              <img src={post.authorAvatarUrl} alt={post.authorUsername} />
            ) : (
              <span>
                {post.authorUsername.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </button>

        <div className="community-post-author-info">
          <button
            type="button"
            className="community-post-author-name community-post-author-name-button"
            onClick={() => {
              window.location.href = `/profile/${encodeURIComponent(
                post.authorUsername
              )}`;
            }}
          >
            {post.authorUsername}
          </button>

          <span className="community-post-date">{post.createdAt}</span>
        </div>
      </div>

      <button
        type="button"
        className="community-post-more"
        aria-label="Додаткові дії"
      >
        <MoreIcon />
      </button>

      <div className="community-post-content">
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

        {renderMedia()}
      </div>

      <div className="community-post-actions">
        <button
          className={`community-post-action like-action ${
            post.isLiked ? "liked" : ""
          }`}
          onClick={() => onLike(post.id)}
        >
          <span className="community-post-action-icon">
            <HeartIcon filled={post.isLiked} />
          </span>
          <span>{post.likesCount}</span>
        </button>

        <button
          className="community-post-action"
          onClick={() => onComments(post.id)}
        >
          <span className="community-post-action-icon">
            <CommentIcon />
          </span>
          <span>{post.commentsCount}</span>
        </button>

        <button
          className="community-post-action community-post-share"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: post.title || "Публікація спільноти",
                text: post.content || "",
                url: window.location.href,
              });
            } else {
              navigator.clipboard.writeText(window.location.href);
            }
          }}
        >
          <span className="community-post-action-icon">
            <ShareIcon />
          </span>
          <span>Поділитися</span>
        </button>
      </div>
    </article>
  );
}

export default CommunityPost;