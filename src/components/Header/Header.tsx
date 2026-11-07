
import { useEffect, useState } from "react";

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
            Крамниця
          </a>

          <a
            href="/library"
            className={path === "/library" ? "active" : ""}
          >
            Бібліотека
          </a>

          <a
            href="/chat"
            className={path === "/chat" ? "active" : ""}
          >
            Чат
          </a>
        </nav>

        {!isAuthorized ? (
          <div className="header-actions">
            <a href="/login" className="header-login-button">
              Увійти
            </a>
          </div>
        ) : (
          <div className="header-actions">
            <a
              href="/settings"
              className="header-icon-button"
              aria-label="Налаштування"
              title="Налаштування"
            >
              <svg
                className="header-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M19.4 13.5a7.8 7.8 0 0 0 0-3l-1.7-.4a6 6 0 0 0-.6-1.1l.9-1.5a8 8 0 0 0-2.1-2.1l-1.5.9a6 6 0 0 0-1.1-.6l-.4-1.7a7.8 7.8 0 0 0-3 0l-.4 1.7a6 6 0 0 0-1.1.6l-1.5-.9a8 8 0 0 0-2.1 2.1l.9 1.5a6 6 0 0 0-.6 1.1l-1.7.4a7.8 7.8 0 0 0 0 3l1.7.4a6 6 0 0 0 .6 1.1l-.9 1.5a8 8 0 0 0 2.1 2.1l1.5-.9a6 6 0 0 0 1.1.6l.4 1.7a7.8 7.8 0 0 0 3 0l.4-1.7a6 6 0 0 0 1.1-.6l1.5.9a8 8 0 0 0 2.1-2.1l-.9-1.5a6 6 0 0 0 .6-1.1l1.7-.4Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>

            <div className="header-notification">
              <NotificationBell />
            </div>

            <a
              href={profileUrl}
              className="header-avatar-link"
              aria-label="Відкрити профіль"
              title="Профіль"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Аватар пользователя"
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
              Вийти
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
