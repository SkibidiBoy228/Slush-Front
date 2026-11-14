
import "./DlcPageSkeleton.css";

interface DlcPageSkeletonProps {
  isCatalog?: boolean;
}

function DlcPageSkeleton({
  isCatalog = false,
}: DlcPageSkeletonProps) {
  return (
    <div className="game-page dlc-skeleton-page">
      <main className="game-page-content">
        <div className="game-page-search dlc-skeleton-block" />

        <div className="dlc-skeleton-tabs">
          <span />
          <span />
          <span />
        </div>

        {isCatalog ? (
          <>
            <div className="dlc-skeleton-catalog-heading">
              <div>
                <span className="dlc-skeleton-block dlc-skeleton-badge" />
                <span className="dlc-skeleton-block dlc-skeleton-title" />
                <span className="dlc-skeleton-block dlc-skeleton-subtitle" />
              </div>
              <span className="dlc-skeleton-block dlc-skeleton-back" />
            </div>

            <div className="dlc-skeleton-section-title">
              <span />
              <span />
            </div>

            <div className="dlc-skeleton-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div className="dlc-skeleton-card" key={index}>
                  <div className="dlc-skeleton-card-top">
                    <span />
                    <span />
                  </div>
                  <div className="dlc-skeleton-card-content">
                    <span className="dlc-skeleton-card-title" />
                    <span className="dlc-skeleton-card-title short" />
                    <div className="dlc-skeleton-card-footer">
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="dlc-skeleton-single-heading">
              <span className="dlc-skeleton-block dlc-skeleton-badge" />
              <span className="dlc-skeleton-block dlc-skeleton-title" />
            </div>

            <div className="dlc-skeleton-layout">
              <section className="dlc-skeleton-main">
                <div className="dlc-skeleton-gallery" />

                <div className="dlc-skeleton-tags">
                  <span />
                  <span />
                  <span />
                </div>

                <div className="dlc-skeleton-description">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <div className="dlc-skeleton-base-game" />

                <div className="dlc-skeleton-other">
                  <span />
                  <span />
                  <span />
                </div>
              </section>

              <aside className="dlc-skeleton-sidebar">
                <span />
                <span />
                <span />
                <span />
                <span />
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default DlcPageSkeleton;
