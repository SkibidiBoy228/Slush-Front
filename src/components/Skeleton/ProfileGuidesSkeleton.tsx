
import "./ProfileGuidesSkeleton.css";

const SkeletonBlock = ({ className = "" }: { className?: string }) => (
  <div className={`profile-guides-skeleton-block ${className}`} />
);

const SkeletonGuideCard = () => (
  <article className="profile-guides-skeleton-card">
    <div className="skeleton-guide-top">
      <SkeletonBlock className="skeleton-game" />
      <SkeletonBlock className="skeleton-date" />
      <SkeletonBlock className="skeleton-more" />
    </div>

    <div className="skeleton-guide-content">
      <SkeletonBlock className="skeleton-guide-image" />

      <div className="skeleton-guide-info">
        <SkeletonBlock className="skeleton-guide-title" />
        <SkeletonBlock className="skeleton-guide-description" />
        <SkeletonBlock className="skeleton-guide-description" />
        <SkeletonBlock className="skeleton-guide-description short" />
      </div>
    </div>

    <div className="skeleton-guide-actions">
      <SkeletonBlock className="skeleton-guide-stat" />
      <SkeletonBlock className="skeleton-guide-stat" />
    </div>
  </article>
);

const ProfileGuidesSkeleton = () => {
  return (
    <div className="profile-guides-page">
      <main className="profile-guides-container">
        <section className="profile-guides-skeleton-header">
          <SkeletonBlock className="skeleton-cover" />

          <div className="profile-guides-skeleton-user-info">
            <SkeletonBlock className="skeleton-avatar" />

            <div className="skeleton-user-details">
              <SkeletonBlock className="skeleton-username" />
              <SkeletonBlock className="skeleton-status" />
              <SkeletonBlock className="skeleton-bio" />
            </div>

            <SkeletonBlock className="skeleton-profile-button" />
          </div>
        </section>

        <div className="profile-guides-layout">
          <section className="profile-guides-main">
            <div className="profile-guides-list">
              <div className="profile-guides-skeleton-toolbar">
                <SkeletonBlock className="skeleton-search" />
                <SkeletonBlock className="skeleton-filter" />
              </div>

              <div className="profile-guides-skeleton-items">
                <SkeletonGuideCard />
                <SkeletonGuideCard />
                <SkeletonGuideCard />
                <SkeletonGuideCard />
              </div>
            </div>
          </section>

          <aside className="profile-guides-skeleton-sidebar">
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

export default ProfileGuidesSkeleton;
