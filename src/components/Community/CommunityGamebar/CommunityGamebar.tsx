
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

const postTypeLabels: Record<string, string> = {
  Discussion: "Обговорення",
  Screenshot: "Скріншот",
  Video: "Відео",
  Guide: "Гайд",
  News: "Новини",
};

function CommunityGamebar({
  gameId,
  gameTitle,
  subscribersCount,
  recommendationsTitle,
  recommendations,
  onCreatePost,
}: CommunityGamebarProps) {
  return (
    <aside className="community-gamebar">
      <section className="community-gamebar-info">
        <div className="community-gamebar-heading">
          <h2>{gameTitle}</h2>

          <div className="community-gamebar-subscribers">
            <span className="community-gamebar-status-dot" />
            <span>
              {subscribersCount.toLocaleString("uk-UA")} підписників
            </span>
          </div>
        </div>

        <button
          type="button"
          className="community-gamebar-create"
          onClick={onCreatePost}
        >
          <span aria-hidden="true">+</span>
          Створити пост
        </button>

        <div className="community-gamebar-actions">
          <button
            type="button"
            className="community-gamebar-icon-button"
            aria-label="Сповіщення"
            title="Сповіщення"
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
            aria-label="Додаткові дії"
            title="Додаткові дії"
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
            Інших публікацій поки немає.
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
                        alt={post.title || "Прев'ю публікації"}
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

                    <h4>{post.title || "Публікація спільноти"}</h4>

                    {post.description && <p>{post.description}</p>}
                  </div>
                </button>

                <div className="community-gamebar-post-stats">
                  <span>♡ {post.likesCount.toLocaleString("uk-UA")}</span>
                  <span>▢ {post.commentsCount.toLocaleString("uk-UA")}</span>
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
