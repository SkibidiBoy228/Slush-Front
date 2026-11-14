
import "./CharacteristicsSkeleton.css";

const CharacteristicsSkeleton = () => {
  return (
    <div className="game-page characteristics-skeleton">
      <main className="game-page-content">
        <div className="game-page-search">
          <div className="characteristics-skeleton__search" />
        </div>

        <nav className="game-tabs characteristics-skeleton__tabs">
          <div />
          <div />
          <div />
        </nav>

        <div className="game-layout">
          <section className="game-main-content">
            <div className="characteristics-skeleton__title" />

            <div className="game-characteristics">
              <div className="characteristics-skeleton__platform" />

              <div className="requirements-grid">
                {["minimum", "recommended"].map((column) => (
                  <div
                    className="requirements-column"
                    key={column}
                  >
                    <div className="characteristics-skeleton__heading" />

                    <div className="characteristics-skeleton__requirements">
                      {Array.from({ length: 8 }).map((_, index) => (
                        <div
                          className="characteristics-skeleton__requirement"
                          key={index}
                        >
                          <div className="characteristics-skeleton__line characteristics-skeleton__label" />
                          <div
                            className={`characteristics-skeleton__line ${
                              index % 3 === 0
                                ? "wide"
                                : index % 3 === 1
                                  ? "medium"
                                  : "short"
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="game-sidebar characteristics-skeleton__sidebar">
            <div className="characteristics-skeleton__rating">
              <div />
              <div />
            </div>

            <div className="characteristics-skeleton__cover" />

            <div className="characteristics-skeleton__price" />

            <div className="characteristics-skeleton__button" />
            <div className="characteristics-skeleton__button secondary" />

            <div className="characteristics-skeleton__actions">
              <div />
              <div />
              <div />
            </div>

            <div className="characteristics-skeleton__metadata">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index}>
                  <div className="characteristics-skeleton__line short" />
                  <div className="characteristics-skeleton__line wide" />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CharacteristicsSkeleton;
