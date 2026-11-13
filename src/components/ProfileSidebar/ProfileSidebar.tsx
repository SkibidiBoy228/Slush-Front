
import { useTranslation } from "react-i18next";

import type { UserProfile } from "../../types/profile";
import "./ProfileSidebar.css";

export type ProfileSection =
  | "home"
  | "badges"
  | "games"
  | "wishlist"
  | "discussions"
  | "screenshots"
  | "videos"
  | "guides"
  | "reviews";

interface ProfileSidebarProps {
  profile: UserProfile;
  username: string;
  activeSection: ProfileSection;
  className?: string;
}

const ProfileSidebar = ({
  profile,
  username,
  activeSection,
  className,
}: ProfileSidebarProps) => {
  const { t } = useTranslation();

  const basePath = `/profile/${encodeURIComponent(username)}`;

  const navigationItems = [
    {
      label: t("profileSidebar.home"),
      path: "",
      section: "home",
      count: null,
    },
    {
      label: t("profileSidebar.badges"),
      path: "badges",
      section: "badges",
      count: profile.counters.badges,
    },
    {
      label: t("profileSidebar.games"),
      path: "games",
      section: "games",
      count: profile.counters.games,
    },
    {
      label: t("profileSidebar.wishlist"),
      path: "wishlist",
      section: "wishlist",
      count: profile.counters.wishlist,
    },
    {
      label: t("profileSidebar.discussions"),
      path: "discussions",
      section: "discussions",
      count: profile.counters.discussions,
    },
    {
      label: t("profileSidebar.screenshots"),
      path: "screenshots",
      section: "screenshots",
      count: profile.counters.screenshots,
    },
    {
      label: t("profileSidebar.videos"),
      path: "videos",
      section: "videos",
      count: profile.counters.videos,
    },
    {
      label: t("profileSidebar.guides"),
      path: "guides",
      section: "guides",
      count: profile.counters.guides,
    },
    {
      label: t("profileSidebar.reviews"),
      path: "reviews",
      section: "reviews",
      count: profile.counters.reviews,
    },
  ] as const;

  return (
    <aside className={`profile-sidebar ${className ?? ""}`}>
      <section className="profile-sidebar-card profile-sidebar-navigation">
        <div className="profile-sidebar-level">
          <h2>{t("profileSidebar.level")}</h2>

          <div className="profile-sidebar-level-badge">
            <span>{profile.level}</span>
          </div>
        </div>

        <nav className="profile-sidebar-nav">
          {navigationItems.map((item) => {
            const href = item.path
              ? `${basePath}/${item.path}`
              : basePath;

            const isActive = activeSection === item.section;

            return (
              <a
                key={item.section}
                href={href}
                className={`profile-sidebar-nav-item ${
                  isActive ? "active" : ""
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span>{item.label}</span>

                {item.count !== null && (
                  <span className="profile-sidebar-count">
                    {item.count}
                  </span>
                )}
              </a>
            );
          })}
        </nav>
      </section>

      <section className="profile-sidebar-card profile-sidebar-friends">
        <div className="profile-sidebar-friends-heading">
          <div className="profile-sidebar-friends-title">
            <h2>{t("profileSidebar.friends")}</h2>

            <span>{profile.counters.friends}</span>
          </div>

          <a href="/friends" className="profile-sidebar-see-all">
            {t("profileSidebar.seeAll")} →
          </a>
        </div>

        {profile.friends.length > 0 ? (
          <div className="profile-sidebar-friends-list">
            {profile.friends.map((friend) => (
              <a
                href={`/profile/${encodeURIComponent(friend.username)}`}
                className="profile-sidebar-friend"
                key={friend.id}
              >
                <div className="profile-sidebar-friend-avatar-wrapper">
                  <img
                    src={friend.avatarUrl}
                    alt={friend.username}
                    className="profile-sidebar-friend-avatar"
                  />

                  <span
                    className={`profile-sidebar-friend-status ${
                      friend.isOnline ? "online" : "offline"
                    }`}
                  />
                </div>

                <div className="profile-sidebar-friend-info">
                  <strong>{friend.username}</strong>
                </div>

                <div className="profile-sidebar-friend-level">
                  <span>{friend.level}</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="profile-sidebar-empty">
            {t("profileSidebar.noFriends")}
          </p>
        )}
      </section>
    </aside>
  );
};

export default ProfileSidebar;
