
import { useTranslation } from "react-i18next";
import "./CommunityGamebar.css";

export interface CommunityGamebarPost {
  id: string;
  title: string;
  description?: string | null;
  mediaUrl?: string | null;
  postType?: string;
  likesCount: number;
  commentsCount: number;
}

interface CommunityGamebarProps {
  gameId: string;
  gameTitle: string;
  subscribersCount: number;
  recommendationsTitle: string;
  recommendations: CommunityGamebarPost[];
  onCreatePost: () => void;
}

function CommunityGamebar({
  gameId,
  gameTitle,
  subscribersCount,
  recommendationsTitle,
  recommendations,
  onCreatePost,
}: CommunityGamebarProps) {
  const { t, i18n } = useTranslation();

  const numberLocale: Record<string, string> = {
    uk: "uk-UA",
    en: "en-US",
    sk: "sk-SK",
    ru: "ru-RU",
  };

  const locale = numberLocale[i18n.language] || "uk-UA";

  const postTypeLabels: Record<string, string> = {
    Discussion: t("communityGamebar.types.discussion"),
    Screenshot: t("communityGamebar.types.screenshot"),
    Video: t("communityGamebar.types.video"),
    Guide: t("communityGamebar.types.guide"),
    News: t("communityGamebar.types.news"),
  };

  return (
    <aside className="community-gamebar">
      <section className="community-gamebar-info">
        <div className="community-gamebar-heading">
          <h2>{gameTitle}</h2>

          <div className="community-gamebar-subscribers">
            <span className="community-gamebar-status-dot" />
            <span>
              {t("communityGamebar.subscribers", {
                count: subscribersCount,
                formattedCount: subscribersCount.toLocaleString(locale),
              })}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="community-gamebar-create"
          onClick={onCreatePost}
        >
          <span aria-hidden="true">+</span>
          {t("communityGamebar.createPost")}
        </button>

        <div className="community-gamebar-actions">
          <button
            type="button"
            className="community-gamebar-icon-button"
            aria-label={t("communityGamebar.notifications")}
            title={t("communityGamebar.notifications")}
            disabled
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>
          </button>

          <button
            type="button"
            className="community-gamebar-icon-button"
            aria-label={t("communityGamebar.moreActions")}
            title={t("communityGamebar.moreActions")}
            disabled
          >
            ⋯
          </button>
        </div>
      </section>

      <section className="community-gamebar-recommendations">
        <h3>{recommendationsTitle}</h3>

        {recommendations.length === 0 ? (
          <div className="community-gamebar-empty">
            {t("communityGamebar.empty")}
          </div>
        ) : (
          <div className="community-gamebar-list">
            {recommendations.map((post) => (
              <article className="community-gamebar-post" key={post.id}>
                <button
                  type="button"
                  className="community-gamebar-post-open"
                  onClick={() => {
                    window.location.href =
                      `/game/${encodeURIComponent(gameId)}` +
                      `/community/post/${encodeURIComponent(post.id)}`;
                  }}
                >
                  {post.mediaUrl && (
                    <div className="community-gamebar-post-media">
                      {post.postType === "Video" ? (
                        <video
                          src={post.mediaUrl}
                          muted
                          autoPlay
                          loop
                          playsInline
                          preload="auto"
                        />
                      ) : (
                        <img
                          src={post.mediaUrl}
                          alt={
                            post.title ||
                            t("communityGamebar.postPreview")
                          }
                          loading="lazy"
                        />
                      )}

                      {post.postType === "Video" && (
                        <span className="community-gamebar-play">
                          ▶
                        </span>
                      )}
                    </div>
                  )}

                  <div className="community-gamebar-post-info">
                    {post.postType && (
                      <span className="community-gamebar-post-type">
                        {postTypeLabels[post.postType] ?? post.postType}
                      </span>
                    )}

                    <h4>
                      {post.title ||
                        t("communityGamebar.communityPost")}
                    </h4>

                    {post.description && <p>{post.description}</p>}
                  </div>
                </button>

                <div className="community-gamebar-post-stats">
                  <span>
                    ♡ {post.likesCount.toLocaleString(locale)}
                  </span>
                  <span>
                    ▢ {post.commentsCount.toLocaleString(locale)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}

export default CommunityGamebar;
