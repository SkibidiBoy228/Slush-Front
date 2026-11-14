
import "./ProfileGamesSkeleton.css";

const ProfileGamesSkeleton = () => {
  return (
    <div className="profile-games-page">
      <main className="profile-games-container">
        {/* Profile header */}
        <section className="profile-games-header">
          <div className="profile-games-cover pg-skeleton-cover" />

          <div className="profile-games-user-info">
            <div className="pg-skeleton-avatar" />

            <div className="profile-games-user-details pg-skeleton-user-details">
              <div className="pg-skeleton-line pg-skeleton-username" />
              <div className="pg-skeleton-line pg-skeleton-status" />
              <div className="pg-skeleton-line pg-skeleton-bio" />
            </div>

            <div className="pg-skeleton-button" />
          </div>
        </section>

        {/* Main layout */}
        <div className="profile-games-layout">
          <section className="profile-games-main">
            <div className="profile-games-section">
              {/* Heading */}
              <div className="pg-skeleton-heading">
                <div>
                  <div className="pg-skeleton-line pg-skeleton-title" />
                  <div className="pg-skeleton-line pg-skeleton-description" />
                </div>

                <div className="pg-skeleton-counter" />
              </div>

              {/* Toolbar */}
              <div className="profile-games-toolbar pg-skeleton-toolbar">
                <div className="pg-skeleton-search" />
                <div className="pg-skeleton-select" />
                <div className="pg-skeleton-select" />
              </div>

              {/* List heading */}
              <div className="profile-games-list-heading">
                <div className="pg-skeleton-line pg-skeleton-list-heading" />
                <div className="pg-skeleton-line pg-skeleton-list-count" />
              </div>

              {/* Games */}
              <div className="profile-games-list">
                {Array.from({ length: 5 }).map((_, index) => (
                  <article className="profile-game-card pg-skeleton-game" key={index}>
                    <div className="profile-game-image pg-skeleton-game-image" />

                    <div className="profile-game-content">
                      <div className="pg-skeleton-line pg-skeleton-game-title" />
                      <div className="pg-skeleton-line pg-skeleton-game-price" />
                    </div>

                    <div className="pg-skeleton-game-button" />
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="profile-games-sidebar">
            <section className="profile-games-sidebar-card">
              <div className="pg-skeleton-sidebar-title" />
              <div className="pg-skeleton-xp" />

              <div className="pg-skeleton-sidebar-labels">
                <div className="pg-skeleton-line" />
                <div className="pg-skeleton-line" />
              </div>

              <div className="profile-games-divider" />

              <div className="pg-skeleton-sidebar-subtitle" />

              <div className="pg-skeleton-stats">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index}>
                    <div className="pg-skeleton-line" />
                    <div className="pg-skeleton-line" />
                  </div>
                ))}
              </div>

              <div className="pg-skeleton-sidebar-button" />
            </section>

            <section className="profile-games-sidebar-card">
              <div className="pg-skeleton-sidebar-title" />

              <div className="pg-skeleton-friends">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div className="pg-skeleton-friend" key={index}>
                    <div className="pg-skeleton-friend-avatar" />
                    <div className="pg-skeleton-line" />
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ProfileGamesSkeleton;
