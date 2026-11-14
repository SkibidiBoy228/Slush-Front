
import "./ProfileVideosSkeleton.css";

const SkeletonBlock = ({ className = "" }: { className?: string }) => (
  <div className={`profile-videos-skeleton-block ${className}`} />
);

const ProfileVideosSkeleton = () => {
  return (
    <div className="profile-videos-page">
      <main className="profile-videos-container">
        <section className="profile-videos-skeleton-header">
          <SkeletonBlock className="skeleton-cover" />

          <div className="profile-videos-skeleton-user-info">
            <SkeletonBlock className="skeleton-avatar" />

            <div className="skeleton-user-details">
              <SkeletonBlock className="skeleton-username" />
              <SkeletonBlock className="skeleton-status" />
              <SkeletonBlock className="skeleton-bio" />
            </div>

            <SkeletonBlock className="skeleton-profile-button" />
          </div>
        </section>

        <div className="profile-videos-layout">
          <section className="profile-videos-main">
            <div className="profile-videos-gallery">
              <div className="profile-videos-skeleton-toolbar">
                <SkeletonBlock className="skeleton-search" />

                <div className="skeleton-filters">
                  <SkeletonBlock className="skeleton-filter" />
                  <SkeletonBlock className="skeleton-filter game-filter" />
                </div>
              </div>

              <div className="profile-videos-skeleton-grid">
                {Array.from({ length: 9 }).map((_, index) => (
                  <div className="skeleton-video-card" key={index}>
                    <SkeletonBlock className="skeleton-video-thumbnail" />

                    <div className="skeleton-video-play">
                      <span />
                    </div>

                    <SkeletonBlock className="skeleton-video-title" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="profile-videos-skeleton-sidebar">
            <SkeletonBlock className="sidebar-title" />

            <div className="sidebar-user">
              <SkeletonBlock className="sidebar-avatar" />

              <div>
                <SkeletonBlock className="sidebar-name" />
                <SkeletonBlock className="sidebar-description" />
              </div>
            </div>

            {Array.from({ length: 7 }).map((_, index) => (
              <SkeletonBlock key={index} className="sidebar-item" />
            ))}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ProfileVideosSkeleton;
