
import type { CommunityPost } from "../../../types/library";

interface LibraryNewsCardProps {
  post: CommunityPost;
}

function LibraryNewsCard({ post }: LibraryNewsCardProps) {
  const title = post.title?.trim() || "Без назви";
  const description =
    post.shortDescription?.trim() ||
    post.content?.trim() ||
    "";

  return (
    <article className="library-news-card">
      {post.mediaUrl && (
        <a
          className="library-news-card__media"
          href={
            post.gameId
              ? `/game/${encodeURIComponent(post.gameId)}/community`
              : undefined
          }
          aria-label={title}
        >
          <img
            src={post.mediaUrl}
            alt=""
            loading="lazy"
          />
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

export default LibraryNewsCard;
