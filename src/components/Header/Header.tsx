import { useEffect, useState } from "react";

import {
  getAccessToken,
  getCurrentUsername,
  logout,
} from "../../api/client";

import { getUserProfile } from "../../api/profile";

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
            <button
              type="button"
              className="header-icon-button"
              aria-label="Налаштування"
            >
              ⚙
            </button>

            <button
              type="button"
              className="header-icon-button"
              aria-label="Сповіщення"
            >
              ♧
            </button>

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