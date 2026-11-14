
import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";

import type { CommunityPost } from "../../../types/library";
import "./LibraryNewsCard.css";

interface CommunityPostCardProps {
  post: CommunityPost;
}

function CommunityPostCard({ post }: CommunityPostCardProps) {
  const [mediaError, setMediaError] = useState(false);

  const title = post.title?.trim() || "Без назви";

  const description =
    post.shortDescription?.trim() ||
    post.content?.trim() ||
    "";

  const mediaUrl = post.mediaUrl?.trim() || "";

  // Определяем видео по расширению или пути Cloudinary.
  const isVideo =
    /\.(mp4|webm|mov|m4v)(\?.*)?($|#)/i.test(mediaUrl) ||
    /\/video\/upload\//i.test(mediaUrl);

  useEffect(() => {
    setMediaError(false);
  }, [mediaUrl]);

  const handleVideoLoaded = (
    event: SyntheticEvent<HTMLVideoElement>
  ) => {
    const video = event.currentTarget;

    if (Number.isFinite(video.duration) && video.duration > 0) {
      video.currentTime = Math.min(1, video.duration);
    }
  };

  const handleVideoSeeked = (
    event: SyntheticEvent<HTMLVideoElement>
  ) => {
    event.currentTarget.pause();
  };

  return (
    <article className="library-news-card">
      {mediaUrl && (
        <a
          className="library-news-card__media"
          href={
            post.gameId
              ? `/game/${encodeURIComponent(post.gameId)}/community`
              : undefined
          }
          aria-label={title}
        >
          {!mediaError ? (
            isVideo ? (
              <video
                src={mediaUrl}
                muted
                playsInline
                preload="metadata"
                onLoadedMetadata={handleVideoLoaded}
                onSeeked={handleVideoSeeked}
                onError={() => setMediaError(true)}
              />
            ) : (
              <img
                src={mediaUrl}
                alt={title}
                loading="lazy"
                onError={() => setMediaError(true)}
              />
            )
          ) : (
            <div className="library-news-card__media-fallback">
              <span>SLUSH</span>
            </div>
          )}
        </a>
      )}

      <div className="library-news-card__body">
        <div className="library-news-card__author">
          {post.authorAvatarUrl ? (
            <img
              src={post.authorAvatarUrl}
              alt=""
              className="library-news-card__avatar"
              loading="lazy"
            />
          ) : (
            <span className="library-news-card__avatar library-news-card__avatar--fallback">
              {post.authorUsername.charAt(0).toUpperCase()}
            </span>
          )}

          <span className="library-news-card__username">
            {post.authorUsername}
          </span>

          <span className="library-news-card__date">
            {post.createdAt}
          </span>
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
          <span title="Вподобання">
            <span className="library-news-card__heart">♡</span>
            {post.likesCount}
          </span>

          <span title="Коментарі">
            <span className="library-news-card__comment-icon">
              ▢
            </span>
            {post.commentsCount}
          </span>
        </div>
      </div>
    </article>
  );
}

export default CommunityPostCard;
