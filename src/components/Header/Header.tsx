import { useEffect, useState } from "react";

import "./Header.css";

const Header = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;

    const isAuthPage =
      path === "/login" ||
      path === "/register" ||
      path === "/forgot-password" ||
      path === "/reset-password" ||
      path === "/verify-email";

    if (isAuthPage) {
      setIsAuthorized(false);
      return;
    }

    const accessToken =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    setIsAuthorized(Boolean(accessToken));
  }, []);

  return (
    <header className="header">
      <div className="header-container">
        <a href="/" className="logo">
          SLUSH
        </a>

        <nav className="navigation">
          <a href="/mainPage">Крамниця</a>
          <a href="/library">Бібліотека</a>
          <a href="/chat">Чат</a>
        </nav>

        {!isAuthorized ? (
          <a
            href="/login"
            className="header-login-button"
          >
            Увійти
          </a>
        ) : (
          <div className="header-actions">
            <button
              className="header-icon-button"
              aria-label="Уведомления"
              title="Уведомления"
            >
              🔔
            </button>

            <button
              className="header-icon-button"
              aria-label="Настройки"
              title="Настройки"
            >
              ⚙
            </button>

            <button
              className="header-avatar"
              aria-label="Профиль"
              title="Профиль"
            >
              👤
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;