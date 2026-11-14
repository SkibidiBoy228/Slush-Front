import { SkeletonBlock, SkeletonGameCard } from "./Skeleton";
import "./Skeleton.css";
import "./PageSkeletons.css";

function HomeSkeleton() {
  return (
    <div className="page-skeleton home-skeleton" aria-label="Loading">
      <section className="home-skeleton-section">
        <SkeletonBlock width="210px" height="23px" />

        <div className="home-skeleton-wide-grid">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonGameCard key={index} variant="wide" />
          ))}
        </div>
      </section>

      <section className="home-skeleton-section">
        <SkeletonBlock width="190px" height="23px" />

        <div className="home-skeleton-game-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonGameCard key={index} />
          ))}
        </div>
      </section>

      <section className="home-skeleton-section">
        <SkeletonBlock width="160px" height="23px" />

        <div className="home-skeleton-game-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonGameCard key={index} />
          ))}
        </div>
      </section>

      <section className="home-skeleton-columns">
        {Array.from({ length: 3 }).map((_, columnIndex) => (
          <div className="home-skeleton-column" key={columnIndex}>
            <SkeletonBlock width="65%" height="20px" />

            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonGameCard
                key={index}
                variant="small"
              />
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}

export default HomeSkeleton;