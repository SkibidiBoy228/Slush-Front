
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
}

const ProfileSidebar = ({
  profile,
  username,
  activeSection,
}: ProfileSidebarProps) => {
  const basePath = `/profile/${encodeURIComponent(username)}`;

  const navigationItems = [
    {
      label: "Головна",
      path: "",
      section: "home",
      count: null,
    },
    {
      label: "Значки",
      path: "badges",
      section: "badges",
      count: profile.counters.badges,
    },
    {
      label: "Ігри",
      path: "games",
      section: "games",
      count: profile.counters.games,
    },
    {
      label: "Бажане",
      path: "wishlist",
      section: "wishlist",
      count: profile.counters.wishlist,
    },
    {
      label: "Обговорення",
      path: "discussions",
      section: "discussions",
      count: profile.counters.discussions,
    },
    {
      label: "Скриншоти",
      path: "screenshots",
      section: "screenshots",
      count: profile.counters.screenshots,
    },
    {
      label: "Відео",
      path: "videos",
      section: "videos",
      count: profile.counters.videos,
    },
    {
      label: "Гайди",
      path: "guides",
      section: "guides",
      count: profile.counters.guides,
    },
    {
      label: "Рецензії",
      path: "reviews",
      section: "reviews",
      count: profile.counters.reviews,
    },
  ] as const;

  return (
    <aside className="profile-sidebar">

      {/* Navigation */}

      <section className="profile-sidebar-card profile-sidebar-navigation">

        <div className="profile-sidebar-level">
          <h2>Рівень</h2>

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

      {/* Friends */}

      <section className="profile-sidebar-card profile-sidebar-friends">

        <div className="profile-sidebar-friends-heading">
          <div className="profile-sidebar-friends-title">
            <h2>Друзі</h2>

            <span>{profile.counters.friends}</span>
          </div>

          <a href="/friends" className="profile-sidebar-see-all">
            Усі →
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
            Друзів поки немає
          </p>
        )}

      </section>

    </aside>
  );
};

export default ProfileSidebar;
