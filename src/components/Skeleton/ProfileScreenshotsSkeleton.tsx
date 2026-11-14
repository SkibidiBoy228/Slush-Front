
import "./ProfileDiscussionsSkeleton.css";
import "./ProfileScreenshotsSkeleton.css";

const SkeletonBlock = ({ className = "" }: { className?: string }) => (
  <div className={`profile-screenshots-skeleton-block ${className}`} />
);

const ProfileScreenshotsSkeleton = () => {
  return (
    <div className="profile-screenshots-page">
      <main className="profile-screenshots-container">
        <section className="profile-screenshots-skeleton-header">
          <SkeletonBlock className="skeleton-cover" />

          <div className="profile-screenshots-skeleton-user-info">
            <SkeletonBlock className="skeleton-avatar" />

            <div className="skeleton-user-details">
              <SkeletonBlock className="skeleton-username" />
              <SkeletonBlock className="skeleton-status" />
              <SkeletonBlock className="skeleton-bio" />
            </div>

            <SkeletonBlock className="skeleton-profile-button" />
          </div>
        </section>

        <div className="profile-screenshots-layout">
          <section className="profile-screenshots-main">
            <div className="profile-screenshots-gallery">
              <div className="profile-screenshots-skeleton-toolbar">
                <SkeletonBlock className="skeleton-search" />

                <div className="skeleton-filters">
                  <SkeletonBlock className="skeleton-filter" />
                  <SkeletonBlock className="skeleton-filter game-filter" />
                </div>
              </div>

              <div className="profile-screenshots-skeleton-grid">
                {Array.from({ length: 9 }).map((_, index) => (
                  <SkeletonBlock
                    key={index}
                    className="skeleton-screenshot"
                  />
                ))}
              </div>
            </div>
          </section>

          <aside className="profile-screenshots-skeleton-sidebar">
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

export default ProfileScreenshotsSkeleton;
