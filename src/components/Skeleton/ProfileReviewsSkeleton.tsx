import "./ProfileReviewsSkeleton.css";

const ReviewCardSkeleton = () => {
  return (
    <article className="profile-review-skeleton-card">
      <div className="skeleton-block profile-review-skeleton-banner" />

      <div className="profile-review-skeleton-body">
        <div className="profile-review-skeleton-heading">
          <div className="skeleton-block profile-review-skeleton-title" />
          <div className="skeleton-block profile-review-skeleton-more" />
        </div>

        <div className="profile-review-skeleton-rating">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="skeleton-block profile-review-skeleton-star"
            />
          ))}
        </div>

        <div className="profile-review-skeleton-text">
          <div className="skeleton-block" />
          <div className="skeleton-block" />
          <div className="skeleton-block" />
          <div className="skeleton-block short" />
        </div>

        <div className="profile-review-skeleton-footer">
          <div className="profile-review-skeleton-stats">
            <div className="skeleton-block profile-review-skeleton-stat" />
            <div className="skeleton-block profile-review-skeleton-stat" />
          </div>

          <div className="skeleton-block profile-review-skeleton-date" />
        </div>
      </div>
    </article>
  );
};

const ProfileReviewsSkeleton = () => {
  return (
    <div className="profile-reviews-page">
      <main className="profile-reviews-container">
        <section className="profile-reviews-header profile-review-skeleton-header">
          <div className="skeleton-block profile-review-skeleton-cover" />

          <div className="profile-reviews-user-info">
            <div className="skeleton-block profile-review-skeleton-avatar" />

            <div className="profile-review-skeleton-user-details">
              <div className="skeleton-block profile-review-skeleton-username" />
              <div className="skeleton-block profile-review-skeleton-status" />
              <div className="skeleton-block profile-review-skeleton-bio" />
            </div>

            <div className="skeleton-block profile-review-skeleton-button" />
          </div>
        </section>

        <div className="profile-reviews-layout">
          <section className="profile-reviews-main">
            <div className="profile-reviews-list">
              <div className="profile-reviews-toolbar">
                <div className="skeleton-block profile-review-skeleton-search" />

                <div className="profile-review-skeleton-filters">
                  <div className="skeleton-block profile-review-skeleton-sort" />
                  <div className="skeleton-block profile-review-skeleton-filter" />
                </div>
              </div>

              <div className="profile-reviews-items">
                {Array.from({ length: 3 }).map((_, index) => (
                  <ReviewCardSkeleton key={index} />
                ))}
              </div>
            </div>
          </section>

          <aside className="profile-reviews-sidebar profile-review-skeleton-sidebar">
            <div className="skeleton-block profile-review-skeleton-sidebar-title" />

            <div className="profile-review-skeleton-sidebar-user">
              <div className="skeleton-block profile-review-skeleton-sidebar-avatar" />

              <div className="profile-review-skeleton-sidebar-user-info">
                <div className="skeleton-block" />
                <div className="skeleton-block short" />
              </div>
            </div>

            <div className="profile-review-skeleton-sidebar-stats">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="skeleton-block profile-review-skeleton-sidebar-stat"
                />
              ))}
            </div>

            <div className="profile-review-skeleton-sidebar-links">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="skeleton-block profile-review-skeleton-sidebar-link"
                />
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ProfileReviewsSkeleton;