
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
                  d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 0 0 12 8.5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M19.4 13.5L21 14.7L19.5 17.3L17.6 16.7C17.1 17.1 16.6 17.4 16 17.6L15.7 19.6H12.7L12.3 17.7C11.7 17.6 11.1 17.3 10.6 17L8.8 17.8L6.8 15.6L7.9 13.9C7.7 13.3 7.6 12.7 7.6 12.1L6 10.8L7.5 8.2L9.4 8.8C9.9 8.4 10.4 8.1 11 7.9L11.3 6H14.3L14.7 7.9C15.3 8.1 15.9 8.4 16.4 8.8L18.2 8L20.2 10.2L19.1 11.9C19.3 12.4 19.4 13 19.4 13.5Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="translate(-1.1 -0.8)"
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
