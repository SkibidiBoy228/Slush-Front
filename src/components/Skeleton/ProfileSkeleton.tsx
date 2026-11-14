import { SkeletonBlock } from "./Skeleton";

import "./Skeleton.css";
import "./ProfileSkeleton.css";

function SkeletonSection({
  titleWidth = "150px",
  children,
}: {
  titleWidth?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="profile-section profile-skeleton-section">
      <div className="section-title-row">
        <SkeletonBlock width={titleWidth} height="14px" />
        <SkeletonBlock width="25px" height="12px" />
      </div>

      {children}
    </section>
  );
}

function SkeletonContentCard() {
  return (
    <div className="profile-skeleton-content-card">
      <div className="profile-skeleton-content-author">
        <SkeletonBlock width="30px" height="30px" radius="50%" />
        <div>
          <SkeletonBlock width="105px" height="10px" />
          <SkeletonBlock width="70px" height="8px" />
        </div>
      </div>

      <SkeletonBlock width="65%" height="13px" />
      <SkeletonBlock width="100%" height="9px" />
      <SkeletonBlock width="82%" height="9px" />

      <SkeletonBlock
        width="100%"
        height="125px"
        radius="7px"
      />

      <div className="profile-skeleton-card-footer">
        <SkeletonBlock width="45px" height="9px" />
        <SkeletonBlock width="50px" height="9px" />
      </div>
    </div>
  );
}

function ProfileSkeletonSidebar() {
  return (
    <aside className="profile-sidebar profile-skeleton-sidebar">
      <div className="sidebar-card">
        <div className="profile-skeleton-level">
          <SkeletonBlock width="44px" height="48px" radius="8px" />
          <div>
            <SkeletonBlock width="90px" height="15px" />
            <SkeletonBlock width="65px" height="9px" />
          </div>
        </div>

        <SkeletonBlock width="100%" height="7px" radius="8px" />
        <SkeletonBlock width="75%" height="9px" />
      </div>

      <div className="sidebar-card">
        <SkeletonBlock width="110px" height="15px" />

        <div className="profile-skeleton-navigation">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index}>
              <SkeletonBlock width="100%" height="32px" radius="8px" />
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-card">
        <SkeletonBlock width="115px" height="15px" />

        <div className="profile-skeleton-friends">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="profile-skeleton-friend">
              <SkeletonBlock width="36px" height="36px" radius="50%" />
              <div>
                <SkeletonBlock width="85px" height="10px" />
                <SkeletonBlock width="55px" height="8px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function ProfileSkeleton() {
  return (
    <div className="profile-page">
      <main className="profile-container">
        {/* Шапка профиля */}
        <section className="profile-top">
          <SkeletonBlock
            className="profile-skeleton-cover"
            width="100%"
            height="190px"
            radius="11px 11px 0 0"
          />

          <div className="profile-skeleton-main-info">
            <SkeletonBlock
              width="94px"
              height="94px"
              radius="50%"
            />

            <div className="profile-skeleton-user-info">
              <SkeletonBlock width="155px" height="20px" />
              <SkeletonBlock width="95px" height="10px" />
              <SkeletonBlock width="240px" height="9px" />
            </div>

            <SkeletonBlock
              width="110px"
              height="34px"
              radius="20px"
            />
          </div>
        </section>

        <div className="profile-layout">
          <div className="profile-main-column">
            {/* Галерея достижений */}
            <SkeletonSection titleWidth="145px">
              <div className="profile-skeleton-badges">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index}>
                    <SkeletonBlock
                      width="100%"
                      height="74px"
                      radius="8px"
                    />
                  </div>
                ))}
              </div>
            </SkeletonSection>

            {/* Коллекция игр */}
            <SkeletonSection titleWidth="130px">
              <div className="profile-skeleton-stats">
                {Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonBlock
                    key={index}
                    width="100%"
                    height="60px"
                    radius="8px"
                  />
                ))}
              </div>

              <div className="profile-skeleton-games">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index}>
                    <SkeletonBlock
                      width="100%"
                      height="85px"
                      radius="7px"
                    />
                    <SkeletonBlock
                      width="85%"
                      height="9px"
                    />
                    <SkeletonBlock
                      width="45%"
                      height="8px"
                    />
                  </div>
                ))}
              </div>
            </SkeletonSection>

            {/* Обсуждения */}
            <SkeletonSection titleWidth="155px">
              <div className="profile-skeleton-content-list">
                <SkeletonContentCard />
                <SkeletonContentCard />
              </div>
            </SkeletonSection>

            {/* Скриншоты */}
            <SkeletonSection titleWidth="145px">
              <div className="profile-skeleton-media">
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonBlock
                    key={index}
                    width="100%"
                    height="105px"
                    radius="7px"
                  />
                ))}
              </div>
            </SkeletonSection>

            {/* Видео */}
            <SkeletonSection titleWidth="105px">
              <div className="profile-skeleton-media">
                {Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonBlock
                    key={index}
                    width="100%"
                    height="105px"
                    radius="7px"
                  />
                ))}
              </div>
            </SkeletonSection>

            {/* Отзывы */}
            <SkeletonSection titleWidth="105px">
              <div className="profile-skeleton-reviews">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index}>
                    <SkeletonBlock
                      width="125px"
                      height="70px"
                      radius="6px"
                    />
                    <div>
                      <SkeletonBlock width="120px" height="12px" />
                      <SkeletonBlock width="75px" height="9px" />
                      <SkeletonBlock width="100%" height="9px" />
                    </div>
                  </div>
                ))}
              </div>
            </SkeletonSection>

            {/* Руководства */}
            <SkeletonSection titleWidth="125px">
              <SkeletonContentCard />
              <SkeletonContentCard />
            </SkeletonSection>

            {/* Комментарии */}
            <SkeletonSection titleWidth="115px">
              <SkeletonBlock
                width="100%"
                height="40px"
                radius="18px"
              />
              <div className="profile-skeleton-comments">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index}>
                    <SkeletonBlock
                      width="30px"
                      height="30px"
                      radius="50%"
                    />
                    <div>
                      <SkeletonBlock width="100px" height="10px" />
                      <SkeletonBlock width="100%" height="9px" />
                    </div>
                  </div>
                ))}
              </div>
            </SkeletonSection>
          </div>

          <ProfileSkeletonSidebar />
        </div>
      </main>
    </div>
  );
}

export default ProfileSkeleton;