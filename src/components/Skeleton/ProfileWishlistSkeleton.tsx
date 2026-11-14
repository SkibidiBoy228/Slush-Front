import "./ProfileWishlistSkeleton.css";

const WishlistGameSkeleton = () => {
  return (
    <article className="profile-wishlist-game-skeleton">
      <div className="skeleton-block wishlist-skeleton-image" />

      <div className="wishlist-skeleton-content">
        <div className="skeleton-block wishlist-skeleton-title" />

        <div className="wishlist-skeleton-tags">
          <div className="skeleton-block wishlist-skeleton-tag" />
          <div className="skeleton-block wishlist-skeleton-discount" />
        </div>

        <div className="wishlist-skeleton-prices">
          <div className="skeleton-block wishlist-skeleton-old-price" />
          <div className="skeleton-block wishlist-skeleton-price" />
        </div>
      </div>

      <div className="wishlist-skeleton-actions">
        <div className="skeleton-block wishlist-skeleton-cart" />
        <div className="skeleton-block wishlist-skeleton-remove" />
      </div>
    </article>
  );
};

const ProfileWishlistSkeleton = () => {
  return (
    <div className="profile-wishlist-page">
      <main className="profile-wishlist-container">
        {/* Profile header */}
        <section className="profile-wishlist-header wishlist-skeleton-header">
          <div className="skeleton-block wishlist-skeleton-cover" />

          <div className="profile-wishlist-user-info">
            <div className="skeleton-block wishlist-skeleton-avatar" />

            <div className="wishlist-skeleton-user-details">
              <div className="skeleton-block wishlist-skeleton-username" />
              <div className="skeleton-block wishlist-skeleton-status" />
              <div className="skeleton-block wishlist-skeleton-bio" />
            </div>

            <div className="skeleton-block wishlist-skeleton-profile-button" />
          </div>
        </section>

        {/* Main content */}
        <div className="profile-wishlist-layout">
          <section className="profile-wishlist-main">
            <div className="profile-wishlist-section">
              {/* Heading */}
              <div className="wishlist-skeleton-heading">
                <div>
                  <div className="skeleton-block wishlist-skeleton-heading-title" />
                  <div className="skeleton-block wishlist-skeleton-description" />
                </div>

                <div className="skeleton-block wishlist-skeleton-count" />
              </div>

              {/* Toolbar */}
              <div className="profile-wishlist-toolbar">
                <div className="skeleton-block wishlist-skeleton-search" />
                <div className="skeleton-block wishlist-skeleton-select" />
                <div className="skeleton-block wishlist-skeleton-select" />
              </div>

              {/* List heading */}
              <div className="wishlist-skeleton-list-heading">
                <div className="skeleton-block wishlist-skeleton-list-label" />
                <div className="skeleton-block wishlist-skeleton-list-count" />
              </div>

              {/* Games */}
              <div className="profile-wishlist-list">
                {Array.from({ length: 5 }).map((_, index) => (
                  <WishlistGameSkeleton key={index} />
                ))}
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="profile-wishlist-sidebar wishlist-skeleton-sidebar">
            <div className="skeleton-block wishlist-skeleton-sidebar-title" />

            <div className="wishlist-skeleton-sidebar-user">
              <div className="skeleton-block wishlist-skeleton-sidebar-avatar" />

              <div className="wishlist-skeleton-sidebar-user-info">
                <div className="skeleton-block" />
                <div className="skeleton-block short" />
              </div>
            </div>

            <div className="wishlist-skeleton-sidebar-stats">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="skeleton-block wishlist-skeleton-sidebar-stat"
                />
              ))}
            </div>

            <div className="wishlist-skeleton-sidebar-links">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="skeleton-block wishlist-skeleton-sidebar-link"
                />
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ProfileWishlistSkeleton;