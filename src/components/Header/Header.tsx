
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  getAccessToken,
  getCurrentUsername,
  logout,
} from "../../api/client";

import { getUserProfile } from "../../api/profile";

import NotificationBell from "../../components/Notifications/NotificationBell/NotificationBell";

import "./Header.css";

const AUTH_PAGES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

const Header = () => {
  const { t } = useTranslation();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const path = window.location.pathname;
  const isAuthPage = AUTH_PAGES.includes(path);

  const updateAuthState = async () => {
    const token = getAccessToken();
    const currentUsername = token ? getCurrentUsername() : null;

    setIsAuthorized(Boolean(token));
    setUsername(currentUsername);
    setAvatarUrl(null);

    if (currentUsername) {
      try {
        const profile = await getUserProfile(currentUsername);
        setAvatarUrl(profile.avatarUrl || null);
      } catch (error) {
        console.error("Не удалось загрузить аватар:", error);
      }
    }
  };

  useEffect(() => {
    updateAuthState();

    window.addEventListener("auth-changed", updateAuthState);
    window.addEventListener("storage", updateAuthState);

    return () => {
      window.removeEventListener("auth-changed", updateAuthState);
      window.removeEventListener("storage", updateAuthState);
    };
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = "/mainPage";
  };

  const profileUrl = username
    ? `/profile/${encodeURIComponent(username)}`
    : "/login";

  return (
    <header className={`header ${isAuthPage ? "header-auth" : "header-wide"}`}>
      <div className="header-container">
        <a href="/" className="logo">
          <span>SL</span>
          <span className="logo-accent">U</span>
          <span>SH</span>
        </a>

        <nav className="navigation">
          <a
            href="/mainPage"
            className={path === "/mainPage" ? "active" : ""}
          >
            {t("header.store")}
          </a>

          <a
            href="/library"
            className={path === "/library" ? "active" : ""}
          >
            {t("header.library")}
          </a>

          <a
            href="/chat"
            className={path === "/chat" ? "active" : ""}
          >
            {t("header.chat")}
          </a>
        </nav>

        {!isAuthorized ? (
          <div className="header-actions">
            <a href="/login" className="header-login-button">
              {t("header.login")}
            </a>
          </div>
        ) : (
          <div className="header-actions">
            <a
              href="/settings"
              className="header-icon-button"
              aria-label={t("header.settings")}
              title={t("header.settings")}
            >
              <svg
                className="header-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M10.2 2.8h3.6l.55 2.15c.55.17 1.07.39 1.55.65l2.02-1.02 2.55 2.55-1.02 2.02c.26.48.48 1 .65 1.55l2.15.55v3.6l-2.15.55a7.4 7.4 0 0 1-.65 1.55l1.02 2.02-2.55 2.55-2.02-1.02a7.4 7.4 0 0 1-1.55.65l-.55 2.15h-3.6l-.55-2.15a7.4 7.4 0 0 1-1.55-.65l-2.02 1.02-2.55-2.55 1.02-2.02a7.4 7.4 0 0 1-.65-1.55L1.75 14.5v-3.6l2.15-.55c.17-.55.39-1.07.65-1.55L3.53 6.78l2.55-2.55L8.1 5.25c.48-.26 1-.48 1.55-.65L10.2 2.8Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="12.7"
                  r="3.2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
              </svg>
            </a>

            <div className="header-notification">
              <NotificationBell />
            </div>

            <a
              href={profileUrl}
              className="header-avatar-link"
              aria-label={t("header.openProfile")}
              title={t("header.profile")}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={t("header.avatarAlt")}
                  className="header-avatar-image"
                />
              ) : (
                <span className="header-avatar-fallback">
                  {username?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </a>

            <button
              type="button"
              className="header-logout-button"
              onClick={handleLogout}
            >
              {t("header.logout")}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
