import "./BadgesSkeleton.css";

const BadgeCardSkeleton = () => {
  return (
    <article className="badge-skeleton-card">
      <div className="skeleton-block badge-skeleton-image" />

      <div className="badge-skeleton-content">
        <div className="skeleton-block badge-skeleton-title" />

        <div className="badge-skeleton-description">
          <div className="skeleton-block" />
          <div className="skeleton-block short" />
        </div>

        <div className="badge-skeleton-footer">
          <div className="skeleton-block badge-skeleton-points" />
          <div className="skeleton-block badge-skeleton-date" />
        </div>
      </div>
    </article>
  );
};

const BadgesSkeleton = () => {
  return (
    <div className="badges-page">
      <main className="badges-container">
        {/* Profile header */}
        <section className="badges-profile-header">
          <div className="skeleton-block badge-skeleton-cover" />

          <div className="badges-profile-info">
            <div className="skeleton-block badge-skeleton-avatar" />

            <div className="badge-skeleton-user-details">
              <div className="skeleton-block badge-skeleton-username" />
              <div className="skeleton-block badge-skeleton-status" />
              <div className="skeleton-block badge-skeleton-bio" />
            </div>

            <div className="skeleton-block badge-skeleton-profile-button" />
          </div>
        </section>

        {/* Main layout */}
        <div className="badges-layout">
          <section className="badges-main">
            <div className="badges-section">
              {/* Heading */}
              <div className="badges-heading">
                <div className="badge-skeleton-heading-content">
                  <div className="skeleton-block badge-skeleton-heading-title" />
                  <div className="skeleton-block badge-skeleton-heading-description" />
                </div>

                <div className="skeleton-block badge-skeleton-total" />
              </div>

              {/* Toolbar */}
              <div className="badges-toolbar">
                <div className="badge-skeleton-earned">
                  <div className="skeleton-block badge-skeleton-earned-number" />
                  <div className="skeleton-block badge-skeleton-earned-label" />
                </div>

                <div className="badge-skeleton-sort">
                  <div className="skeleton-block badge-skeleton-sort-label" />
                  <div className="skeleton-block badge-skeleton-sort-select" />
                </div>
              </div>

              {/* Badge grid */}
              <div className="badges-page badge-skeleton-grid">
                {Array.from({ length: 6 }).map((_, index) => (
                  <BadgeCardSkeleton key={index} />
                ))}
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="badges-sidebar badge-skeleton-sidebar">
            <div className="badges-sidebar-card">
              <div className="badges-sidebar-title">
                <div className="skeleton-block badge-skeleton-sidebar-title" />
                <div className="skeleton-block badge-skeleton-level" />
              </div>

              <div className="skeleton-block badge-skeleton-progress" />

              <div className="badge-skeleton-xp-labels">
                <div className="skeleton-block" />
                <div className="skeleton-block" />
              </div>

              <div className="badge-skeleton-divider" />

              <div className="skeleton-block badge-skeleton-sidebar-subtitle" />

              <div className="badge-skeleton-stats">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="badge-skeleton-stat">
                    <div className="skeleton-block" />
                    <div className="skeleton-block value" />
                  </div>
                ))}
              </div>
            </div>

            <div className="badges-sidebar-card">
              <div className="skeleton-block badge-skeleton-sidebar-title" />

              <div className="badge-skeleton-friends">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div className="badge-skeleton-friend" key={index}>
                    <div className="skeleton-block badge-skeleton-friend-avatar" />

                    <div className="badge-skeleton-friend-info">
                      <div className="skeleton-block" />
                    </div>

                    <div className="skeleton-block badge-skeleton-friend-level" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default BadgesSkeleton;