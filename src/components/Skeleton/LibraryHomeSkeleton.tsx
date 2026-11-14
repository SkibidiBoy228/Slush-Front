
import "./LibraryHomeSkeleton.css";

const LibraryHomeSkeleton = () => {
  return (
    <div className="library-home-skeleton">
      {/* News section */}
      <section className="library-skeleton-section">
        <div className="library-skeleton-section-heading">
          <div className="library-skeleton-line library-skeleton-heading-title" />
          <div className="library-skeleton-line library-skeleton-heading-link" />
        </div>

        <div className="library-skeleton-news-grid">
          <div className="library-skeleton-news-main">
            <div className="library-skeleton-news-image" />
            <div className="library-skeleton-line library-skeleton-news-title" />
            <div className="library-skeleton-line library-skeleton-news-text" />
            <div className="library-skeleton-line library-skeleton-news-text short" />
          </div>

          <div className="library-skeleton-news-side">
            {Array.from({ length: 2 }).map((_, index) => (
              <div className="library-skeleton-news-small" key={index}>
                <div className="library-skeleton-news-small-image" />
                <div className="library-skeleton-news-small-content">
                  <div className="library-skeleton-line" />
                  <div className="library-skeleton-line short" />
                  <div className="library-skeleton-line tiny" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community highlights */}
      <section className="library-skeleton-section">
        <div className="library-skeleton-section-heading">
          <div className="library-skeleton-line library-skeleton-heading-title" />
          <div className="library-skeleton-line library-skeleton-heading-link" />
        </div>

        <div className="library-skeleton-highlights">
          {Array.from({ length: 3 }).map((_, index) => (
            <article className="library-skeleton-highlight" key={index}>
              <div className="library-skeleton-highlight-user">
                <div className="library-skeleton-avatar" />
                <div className="library-skeleton-highlight-user-info">
                  <div className="library-skeleton-line" />
                  <div className="library-skeleton-line short" />
                </div>
              </div>

              <div className="library-skeleton-line library-skeleton-highlight-title" />
              <div className="library-skeleton-line" />
              <div className="library-skeleton-line short" />

              <div className="library-skeleton-highlight-footer">
                <div className="library-skeleton-line" />
                <div className="library-skeleton-line" />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Library section */}
      <section className="library-home__library-section library-skeleton-library">
        <div className="library-home__tabs">
          <div className="library-skeleton-tab active" />
          <div className="library-skeleton-tab" />
          <div className="library-skeleton-tab" />
          <div className="library-skeleton-add" />
        </div>

        <div className="library-home__games">
          {Array.from({ length: 12 }).map((_, index) => (
            <article className="library-skeleton-game" key={index}>
              <div className="library-skeleton-game-cover" />
              <div className="library-skeleton-line library-skeleton-game-title" />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LibraryHomeSkeleton;
