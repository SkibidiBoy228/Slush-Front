import type { CommunityPost as CommunityPostData } from "../../../types/community";

import "./CommunityPost.css";

interface CommunityPostProps {
  post: CommunityPostData;
  onLike: (postId: string) => void;
  onComments: (postId: string) => void;
}

function CommunityPost({
  post,
  onLike,
  onComments,
}: CommunityPostProps) {
  const renderMedia = () => {
    if (!post.mediaUrl) {
      return null;
    }

    if (post.postType === "Screenshot" && post.mediaUrl) {
      return (
        <div className="community-post-media">
          <img
            src={post.mediaUrl}
            alt={post.title || "Скріншот"}
          />
        </div>
      );
    }

    if (post.postType === "Video" && post.mediaUrl) {
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
              <img
                src={post.authorAvatarUrl}
                alt={post.authorUsername}
              />
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

          <span className="community-post-date">
            {post.createdAt}
          </span>
        </div>
      </div>

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

      <div className="community-post-actions">
        <button
          className={`community-post-action like-action ${
            post.isLiked ? "liked" : ""
          }`}
          onClick={() => onLike(post.id)}
        >
          <span className="community-post-action-icon">
            {post.isLiked ? "♥" : "♡"}
          </span>

          <span>{post.likesCount}</span>
        </button>

        <button
          className="community-post-action"
          onClick={() => onComments(post.id)}
        >
          <span className="community-post-action-icon">
            💬
          </span>

          <span>{post.commentsCount}</span>
        </button>

        <button
          className="community-post-action community-post-share"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title:
                  post.title ||
                  "Публікація спільноти",
                text: post.content || "",
                url: window.location.href,
              });
            } else {
              navigator.clipboard.writeText(
                window.location.href
              );
            }
          }}
        >
          <span className="community-post-action-icon">
            ↗
          </span>

          <span>Поділитися</span>
        </button>
      </div>
    </article>
  );
}

export default CommunityPost;