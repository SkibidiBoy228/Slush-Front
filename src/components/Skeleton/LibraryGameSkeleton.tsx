
import "./LibraryGameSkeleton.css";

const LibraryGameSkeleton = () => {
  return (
    <div className="library-game-skeleton">
      {/* Game hero */}
      <section className="library-game-skeleton__hero">
        <div className="library-game-skeleton__hero-top">
          <div className="library-game-skeleton__line library-game-skeleton__back" />
        </div>

        <div className="library-game-skeleton__hero-bottom">
          <div className="library-game-skeleton__main-info">
            <div className="library-game-skeleton__line library-game-skeleton__title" />

            <div className="library-game-skeleton__quick-info">
              <div className="library-game-skeleton__line" />
              <div className="library-game-skeleton__line" />
              <div className="library-game-skeleton__line" />
            </div>

            <div className="library-game-skeleton__actions">
              <div className="library-game-skeleton__play-button" />
              <div className="library-game-skeleton__playtime">
                <div className="library-game-skeleton__line" />
                <div className="library-game-skeleton__line short" />
              </div>
            </div>
          </div>

          <div className="library-game-skeleton__tools">
            <div />
            <div />
            <div />
          </div>
        </div>
      </section>

      {/* Navigation */}
      <nav className="library-game-skeleton__tabs">
        <div className="library-game-skeleton__line" />
        <div className="library-game-skeleton__line" />
        <div className="library-game-skeleton__line" />
      </nav>

      {/* Main columns */}
      <div className="library-game-skeleton__columns">
        <main className="library-game-skeleton__main-column">
          {/* Progress */}
          <section className="library-game-skeleton__section">
            <div className="library-game-skeleton__line section-title" />

            <div className="library-game-skeleton__stats">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="library-game-skeleton__stat" key={index}>
                  <div className="library-game-skeleton__line" />
                  <div className="library-game-skeleton__line value" />
                </div>
              ))}
            </div>
          </section>

          {/* Review */}
          <section className="library-game-skeleton__section">
            <div className="library-game-skeleton__section-heading">
              <div className="library-game-skeleton__line section-title" />
              <div className="library-game-skeleton__line review-status" />
            </div>

            <div className="library-game-skeleton__review-form">
              <div className="library-game-skeleton__line label" />
              <div className="library-game-skeleton__line select" />

              <div className="library-game-skeleton__line label" />
              <div className="library-game-skeleton__line textarea" />

              <div className="library-game-skeleton__review-actions">
                <div />
                <div />
              </div>
            </div>
          </section>

          {/* News */}
          <section className="library-game-skeleton__section">
            <div className="library-game-skeleton__section-heading">
              <div className="library-game-skeleton__line section-title" />
              <div className="library-game-skeleton__line section-link" />
            </div>

            <div className="library-game-skeleton__news-list">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="library-game-skeleton__news-card" key={index}>
                  <div className="library-game-skeleton__news-image" />

                  <div className="library-game-skeleton__news-content">
                    <div className="library-game-skeleton__line news-title" />
                    <div className="library-game-skeleton__line" />
                    <div className="library-game-skeleton__line short" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Sidebar */}
        <aside className="library-game-skeleton__sidebar">
          {Array.from({ length: 2 }).map((_, cardIndex) => (
            <section className="library-game-skeleton__sidebar-card" key={cardIndex}>
              <div className="library-game-skeleton__line sidebar-title" />

              {Array.from({ length: 3 }).map((_, index) => (
                <div className="library-game-skeleton__friend" key={index}>
                  <div className="library-game-skeleton__avatar" />
                  <div className="library-game-skeleton__line" />
                </div>
              ))}
            </section>
          ))}

          <section className="library-game-skeleton__sidebar-card">
            <div className="library-game-skeleton__line sidebar-title" />

            {Array.from({ length: 3 }).map((_, index) => (
              <div className="library-game-skeleton__info-row" key={index}>
                <div className="library-game-skeleton__line" />
                <div className="library-game-skeleton__line value" />
              </div>
            ))}
          </section>
        </aside>
      </div>

      {/* Community */}
      <section className="library-game-skeleton__community">
        <div className="library-game-skeleton__section-heading">
          <div className="library-game-skeleton__line section-title" />
          <div className="library-game-skeleton__line section-link" />
        </div>

        <div className="library-game-skeleton__community-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <article className="library-game-skeleton__community-card" key={index}>
              <div className="library-game-skeleton__community-user">
                <div className="library-game-skeleton__avatar" />
                <div className="library-game-skeleton__line" />
              </div>

              <div className="library-game-skeleton__line community-title" />
              <div className="library-game-skeleton__line" />
              <div className="library-game-skeleton__line short" />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LibraryGameSkeleton;
