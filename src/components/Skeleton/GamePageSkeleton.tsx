import { SkeletonBlock } from "./Skeleton";

import GameSearch from "../GameSearch/GameSearch";

import "./Skeleton.css";
import "./GamePageSkeleton.css";

function GamePageSkeleton() {
  return (
    <div className="game-page game-page-skeleton" aria-busy="true">
      <main className="game-page-content">
        <div className="game-page-search">
          <GameSearch />
        </div>

        <nav className="game-tabs game-tabs-skeleton">
          <SkeletonBlock width="95px" height="15px" />
          <SkeletonBlock width="120px" height="15px" />
          <SkeletonBlock width="90px" height="15px" />
        </nav>

        <div className="game-layout">
          <section className="game-main-content">
            <SkeletonBlock
              width="65%"
              height="38px"
              radius="6px"
            />

            {/* Галерея */}
            <div className="game-gallery-skeleton">
              <SkeletonBlock
                className="game-gallery-main-skeleton"
                height="390px"
                radius="10px"
              />

              <div className="game-gallery-thumbnails-skeleton">
                {Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonBlock
                    key={index}
                    height="75px"
                    radius="6px"
                  />
                ))}
              </div>
            </div>

            {/* Теги */}
            <div className="game-tags-skeleton">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonBlock
                  key={index}
                  width={`${65 + (index % 3) * 20}px`}
                  height="28px"
                  radius="4px"
                />
              ))}
            </div>

            {/* Описание */}
            <section className="game-description-skeleton">
              <SkeletonBlock width="190px" height="25px" />

              <div className="game-description-lines">
                <SkeletonBlock height="13px" />
                <SkeletonBlock width="96%" height="13px" />
                <SkeletonBlock width="89%" height="13px" />
                <SkeletonBlock width="94%" height="13px" />
                <SkeletonBlock width="72%" height="13px" />
              </div>

              <SkeletonBlock
                height="190px"
                radius="8px"
              />
            </section>

            {/* Наборы */}
            <section className="game-extra-skeleton">
              <SkeletonBlock width="160px" height="23px" />

              <div className="game-extra-grid-skeleton">
                {Array.from({ length: 2 }).map((_, index) => (
                  <SkeletonBlock
                    key={index}
                    height="125px"
                    radius="8px"
                  />
                ))}
              </div>
            </section>

            {/* DLC */}
            <section className="game-extra-skeleton">
              <SkeletonBlock width="100px" height="23px" />

              <div className="game-extra-grid-skeleton">
                {Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonBlock
                    key={index}
                    height="115px"
                    radius="8px"
                  />
                ))}
              </div>
            </section>

            {/* Отзывы */}
            <section className="game-extra-skeleton">
              <SkeletonBlock width="150px" height="23px" />

              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  className="game-review-skeleton"
                  key={index}
                >
                  <SkeletonBlock
                    width="42px"
                    height="42px"
                    radius="50%"
                  />

                  <div className="game-review-lines-skeleton">
                    <SkeletonBlock width="35%" height="13px" />
                    <SkeletonBlock height="12px" />
                    <SkeletonBlock width="80%" height="12px" />
                  </div>
                </div>
              ))}
            </section>
          </section>

          {/* Боковая панель */}
          <aside className="game-sidebar-skeleton">
            <SkeletonBlock height="170px" radius="9px" />

            <SkeletonBlock width="80%" height="22px" />

            <SkeletonBlock width="55%" height="14px" />

            <SkeletonBlock height="42px" radius="7px" />

            <div className="game-sidebar-lines-skeleton">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonBlock
                  key={index}
                  height="13px"
                  width={`${75 + (index % 3) * 8}%`}
                />
              ))}
            </div>

            <SkeletonBlock height="45px" radius="7px" />
          </aside>
        </div>
      </main>
    </div>
  );
}

export default GamePageSkeleton;