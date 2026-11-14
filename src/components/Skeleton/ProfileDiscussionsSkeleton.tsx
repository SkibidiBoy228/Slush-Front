
import "./ProfileDiscussionsSkeleton.css";

const SkeletonBlock = ({
  className = "",
}: {
  className?: string;
}) => <div className={`profile-discussions-skeleton-block ${className}`} />;

const SkeletonPost = () => (
  <article className="profile-discussions-skeleton-post">
    <div className="profile-discussions-skeleton-post-author">
      <SkeletonBlock className="post-avatar" />
      <div className="profile-discussions-skeleton-post-author-info">
        <SkeletonBlock className="post-name" />
        <SkeletonBlock className="post-date" />
      </div>
    </div>

    <SkeletonBlock className="post-title" />
    <SkeletonBlock className="post-description" />
    <SkeletonBlock className="post-description short" />
    <SkeletonBlock className="post-media" />

    <div className="profile-discussions-skeleton-post-actions">
      <SkeletonBlock className="post-action" />
      <SkeletonBlock className="post-action" />
      <SkeletonBlock className="post-action" />
    </div>
  </article>
);

const ProfileDiscussionsSkeleton = () => {
  return (
    <div className="profile-discussions-page">
      <main className="profile-discussions-container">
        <section className="profile-discussions-skeleton-header">
          <SkeletonBlock className="profile-cover" />

          <div className="profile-discussions-skeleton-user-info">
            <SkeletonBlock className="profile-avatar" />

            <div className="profile-discussions-skeleton-user-details">
              <SkeletonBlock className="profile-username" />
              <SkeletonBlock className="profile-status" />
              <SkeletonBlock className="profile-bio" />
            </div>

            <SkeletonBlock className="profile-button" />
          </div>
        </section>

        <div className="profile-discussions-layout">
          <section className="profile-discussions-main">
            <div className="profile-discussions-section">
              <div className="profile-discussions-skeleton-heading">
                <div>
                  <SkeletonBlock className="heading-title" />
                  <SkeletonBlock className="heading-description" />
                </div>
                <SkeletonBlock className="heading-counter" />
              </div>

              <div className="profile-discussions-skeleton-toolbar">
                <SkeletonBlock className="toolbar-search" />
                <SkeletonBlock className="toolbar-select" />
              </div>

              <div className="profile-discussions-skeleton-list-heading">
                <SkeletonBlock className="list-heading-text" />
                <SkeletonBlock className="list-heading-counter" />
              </div>

              <div className="profile-discussions-skeleton-list">
                <SkeletonPost />
                <SkeletonPost />
                <SkeletonPost />
              </div>
            </div>
          </section>

          <aside className="profile-discussions-skeleton-sidebar">
            <SkeletonBlock className="sidebar-title" />

            <div className="profile-discussions-skeleton-sidebar-user">
              <SkeletonBlock className="sidebar-avatar" />
              <div>
                <SkeletonBlock className="sidebar-name" />
                <SkeletonBlock className="sidebar-description" />
              </div>
            </div>

            <SkeletonBlock className="sidebar-item" />
            <SkeletonBlock className="sidebar-item" />
            <SkeletonBlock className="sidebar-item" />
            <SkeletonBlock className="sidebar-item" />
            <SkeletonBlock className="sidebar-item" />
            <SkeletonBlock className="sidebar-item" />
            <SkeletonBlock className="sidebar-item" />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ProfileDiscussionsSkeleton;
