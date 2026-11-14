
import "./CommunityPostDetailsSkeleton.css";

const CommunityPostDetailsSkeleton = () => {
  return (
    <div className="community-post-skeleton">
      {/* Post meta */}
      <div className="community-post-skeleton__meta">
        <div className="community-post-skeleton__line meta-game" />
        <div className="community-post-skeleton__line meta-separator" />
        <div className="community-post-skeleton__line meta-date" />
      </div>

      {/* Main post */}
      <article className="community-post-skeleton__card">
        <div className="community-post-skeleton__author">
          <div className="community-post-skeleton__avatar" />

          <div className="community-post-skeleton__author-info">
            <div className="community-post-skeleton__line author-name" />
            <div className="community-post-skeleton__line author-date" />
          </div>

          <div className="community-post-skeleton__more" />
        </div>

        <div className="community-post-skeleton__title" />

        <div className="community-post-skeleton__text">
          <div className="community-post-skeleton__line" />
          <div className="community-post-skeleton__line" />
          <div className="community-post-skeleton__line medium" />
          <div className="community-post-skeleton__line" />
          <div className="community-post-skeleton__line short" />
        </div>

        <div className="community-post-skeleton__media" />

        <div className="community-post-skeleton__footer">
          <div className="community-post-skeleton__footer-item" />
          <div className="community-post-skeleton__footer-item" />
          <div className="community-post-skeleton__footer-item" />
        </div>
      </article>

      {/* Comments */}
      <section className="community-post-skeleton__comments">
        <div className="community-post-skeleton__comments-heading">
          <div className="community-post-skeleton__line comments-title" />
          <div className="community-post-skeleton__line comments-sort" />
        </div>

        <div className="community-post-skeleton__comment-form">
          <div className="community-post-skeleton__avatar" />
          <div className="community-post-skeleton__comment-input" />
        </div>

        <div className="community-post-skeleton__comment-list">
          {Array.from({ length: 4 }).map((_, index) => (
            <article
              className="community-post-skeleton__comment"
              key={index}
            >
              <div className="community-post-skeleton__avatar" />

              <div className="community-post-skeleton__comment-content">
                <div className="community-post-skeleton__comment-author">
                  <div className="community-post-skeleton__line comment-name" />
                  <div className="community-post-skeleton__line comment-date" />
                </div>

                <div className="community-post-skeleton__line" />
                <div className="community-post-skeleton__line medium" />

                <div className="community-post-skeleton__comment-actions">
                  <div className="community-post-skeleton__line" />
                  <div className="community-post-skeleton__line" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CommunityPostDetailsSkeleton;
