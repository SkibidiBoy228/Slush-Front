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
    <header
      className={`header ${
        isAuthPage ? "header-auth" : "header-wide"
      }`}
    >
      <div className="header-container">
        <a href="/" className="logo">
          SLUSH
        </a>

        <nav className="navigation">
          <a href="/mainPage">Крамниця</a>
          <a href="/news">Новини</a>
          <a href="/about">Про нас</a>
        </nav>

        {!isAuthorized ? (
          <a href="/login" className="header-login-button">
            Увійти
          </a>
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
                    d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <path
                    d="M19.4 15C19.55 14.67 19.67 14.33 19.75 14L21.1 12.95L19.9 10.85L18.25 11.3C17.77 10.83 17.2 10.45 16.58 10.2L16.35 8.5L13.95 8.1L13.2 9.65C12.8 9.6 12.4 9.6 12 9.65L10.8 8.3L8.6 9.35L9.05 11C8.58 11.47 8.2 12.04 7.95 12.65L6.25 12.9L5.85 15.3L7.4 16.5C7.35 16.9 7.35 17.3 7.4 17.7L6.05 18.9L7.1 21.1L8.75 20.65C9.22 21.12 9.79 21.5 10.4 21.75L10.65 23.45L13.05 23.85L14.25 22.3C14.65 22.35 15.05 22.35 15.45 22.3L16.65 23.65L18.85 22.6L18.4 20.95C18.87 20.48 19.25 19.91 19.5 19.3L21.2 19.05L21.6 16.65L20.05 15.45C20 15.3 19.7 15.1 19.4 15Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>


            <NotificationBell/>

            <a
              href={profileUrl}
              className="header-avatar-link"
              aria-label="Відкрити профіль"
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