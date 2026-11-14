import GameSearch from "../GameSearch/GameSearch";
import { SkeletonBlock } from "./Skeleton";

import "./Skeleton.css";
import "./CommunityPageSkeleton.css";

export function CommunityPostSkeleton()  {
  return (
    <div className="community-skeleton-post">
      <div className="community-skeleton-post-header">
        <SkeletonBlock width="38px" height="38px" radius="50%" />

        <div className="community-skeleton-author">
          <SkeletonBlock width="115px" height="12px" />
          <SkeletonBlock width="75px" height="9px" />
        </div>

        <SkeletonBlock width="55px" height="10px" />
      </div>

      <SkeletonBlock width="72%" height="16px" />

      <div className="community-skeleton-post-content">
        <SkeletonBlock width="100%" height="12px" />
        <SkeletonBlock width="94%" height="12px" />
        <SkeletonBlock width="62%" height="12px" />
      </div>

      <SkeletonBlock
        className="community-skeleton-post-media"
        width="100%"
        height="190px"
        radius="9px"
      />

      <div className="community-skeleton-post-footer">
        <SkeletonBlock width="58px" height="12px" />
        <SkeletonBlock width="75px" height="12px" />
        <SkeletonBlock width="65px" height="12px" />
      </div>
    </div>
  );
}

function CommunityPageSkeleton() {
  return (
    <div className="community-page">
      <main className="community-page-content">
        <div className="community-page-search">
          <GameSearch />
        </div>

        <section className="community-page-heading">
          <div className="community-page-heading-info">
            <SkeletonBlock width="230px" height="25px" />
            <div className="community-skeleton-stats">
              <SkeletonBlock width="85px" height="10px" />
              <SkeletonBlock width="4px" height="4px" radius="50%" />
              <SkeletonBlock width="105px" height="10px" />
            </div>
          </div>

          <div className="community-skeleton-heading-actions">
            <SkeletonBlock width="130px" height="34px" radius="18px" />
            <SkeletonBlock width="34px" height="34px" radius="50%" />
            <SkeletonBlock width="34px" height="34px" radius="50%" />
          </div>
        </section>

        <div className="community-skeleton-tabs">
          <SkeletonBlock width="85px" height="30px" radius="16px" />
          <SkeletonBlock width="95px" height="30px" radius="16px" />
          <SkeletonBlock width="110px" height="30px" radius="16px" />
        </div>

        <div className="community-layout">
          <section className="community-main">
            <div className="community-feed">
              <CommunityPostSkeleton />
              <CommunityPostSkeleton />
              <CommunityPostSkeleton />
            </div>
          </section>

          <aside className="community-sidebar-column">
            <div className="community-skeleton-sidebar">
              <SkeletonBlock width="115px" height="15px" />

              <SkeletonBlock width="100%" height="36px" />
              <SkeletonBlock width="100%" height="36px" />
              <SkeletonBlock width="100%" height="36px" />
              <SkeletonBlock width="100%" height="36px" />

              <SkeletonBlock
                width="100%"
                height="1px"
                radius="0"
              />

              <SkeletonBlock width="90px" height="13px" />
              <SkeletonBlock width="100%" height="34px" />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default CommunityPageSkeleton;