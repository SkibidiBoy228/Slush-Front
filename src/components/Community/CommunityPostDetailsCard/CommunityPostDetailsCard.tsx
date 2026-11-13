
import { useTranslation } from "react-i18next";
import type { CommunityPost as CommunityPostData } from "../../../types/community";
import "./CommunityPostDetailsCard.css";

interface CommunityPostDetailsCardProps {
  post: CommunityPostData;
  onLike: (postId: string) => void;
  onComments: (postId: string) => void;
}

function CommunityPostDetailsCard({
  post,
  onLike,
  onComments,
}: CommunityPostDetailsCardProps) {
  const { t, i18n } = useTranslation();

  const localeMap: Record<string, string> = {
    uk: "uk-UA",
    en: "en-US",
    sk: "sk-SK",
    ru: "ru-RU",
  };

  const locale =
    localeMap[i18n.language.split("-")[0]] || "uk-UA";

  const postTypeLabels: Record<string, string> = {
    Discussion: t("communityPostDetailsCard.types.discussion"),
    Screenshot: t("communityPostDetailsCard.types.screenshot"),
    Video: t("communityPostDetailsCard.types.video"),
    Guide: t("communityPostDetailsCard.types.guide"),
    News: t("communityPostDetailsCard.types.news"),
  };

  const authorInitial =
    post.authorUsername?.charAt(0).toUpperCase() || "?";

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString(locale)
    : "";

  const renderMedia = () => {
    if (!post.mediaUrl) return null;

    if (
      post.postType === "Screenshot" ||
      post.postType === "Guide" ||
      post.postType === "News" ||
      post.postType === "Discussion"
    ) {
      return (
        <div className="community-details-card-media">
          <img
            src={post.mediaUrl}
            alt={
              post.title ||
              t("communityPostDetailsCard.postImage")
            }
          />
        </div>
      );
    }

    if (post.postType === "Video") {
      return (
        <div className="community-details-card-media community-details-card-video">
          <video
            src={post.mediaUrl}
            controls
            preload="metadata"
            playsInline
          />
        </div>
      );
    }

    return null;
  };

  const renderText = () => (
    <div className="community-details-card-text">
      {post.title && (
        <h1 className="community-details-card-title">
          {post.title}
        </h1>
      )}

      {post.shortDescription && (
        <p className="community-details-card-description">
          {post.shortDescription}
        </p>
      )}

      {post.content && (
        <p className="community-details-card-content">
          {post.content}
        </p>
      )}
    </div>
  );

  const isMediaFirst =
    post.postType === "Screenshot" ||
    post.postType === "Video" ||
    post.postType === "Guide" ||
    post.postType === "News";

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title:
            post.title ||
            t("communityPostDetailsCard.communityPost"),
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

  return (
    <article className="community-details-card">
      <header className="community-details-card-author">
        <button
          type="button"
          className="community-details-card-author-link"
          onClick={() => {
            window.location.href = `/profile/${encodeURIComponent(
              post.authorUsername
            )}`;
          }}
        >
          <span className="community-details-card-avatar">
            {post.authorAvatarUrl ? (
              <img
                src={post.authorAvatarUrl}
                alt={post.authorUsername}
              />
            ) : (
              authorInitial
            )}
          </span>

          <span className="community-details-card-author-name">
            {post.authorUsername}
          </span>
        </button>

        <span className="community-details-card-date">
          {formattedDate}
        </span>

        <span className="community-details-card-type">
          {postTypeLabels[post.postType] ?? post.postType}
        </span>
      </header>

      <div
        className={`community-details-card-body ${
          isMediaFirst ? "media-first" : "text-first"
        }`}
      >
        {isMediaFirst ? (
          <>
            {renderMedia()}
            {renderText()}
          </>
        ) : (
          <>
            {renderText()}
            {renderMedia()}
          </>
        )}
      </div>

      <footer className="community-details-card-actions">
        <button
          type="button"
          className={`community-details-card-action community-details-card-like ${
            post.isLiked ? "liked" : ""
          }`}
          onClick={() => onLike(post.id)}
          aria-label={t("communityPostDetailsCard.like")}
          aria-pressed={post.isLiked}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
          </svg>

          <span>
            {post.likesCount.toLocaleString(locale)}
          </span>
        </button>

        <button
          type="button"
          className="community-details-card-action"
          onClick={() => onComments(post.id)}
          aria-label={t("communityPostDetailsCard.comments")}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
          </svg>

          <span>
            {post.commentsCount.toLocaleString(locale)}
          </span>
        </button>

        <button
          type="button"
          className="community-details-card-action community-details-card-share"
          onClick={handleShare}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 16V3m-5 5 5-5 5 5" />
            <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
          </svg>

          <span>{t("communityPostDetailsCard.share")}</span>
        </button>
      </footer>
    </article>
  );
}

export default CommunityPostDetailsCard;
