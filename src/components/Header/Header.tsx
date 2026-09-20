import { useEffect, useState } from "react";

import {
  getAccessToken,
  getCurrentUsername,
  logout,
} from "../../api/client";

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

  const path = window.location.pathname;
  const isAuthPage = AUTH_PAGES.includes(path);

  const updateAuthState = () => {
    const token = getAccessToken();

    setIsAuthorized(Boolean(token));
    setUsername(token ? getCurrentUsername() : null);
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
            <button type="button" aria-label="Обране">
              ♡
            </button>

            <button type="button" aria-label="Кошик">
              🛒
            </button>

            <a href={profileUrl} className="header-profile-button">
              {username || "Профіль"}
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