import { useEffect, useState } from "react";
import "./Header.css";

const Header = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);

  const path = window.location.pathname;

  const isAuthPage =
    path === "/login" ||
    path === "/register" ||
    path === "/forgot-password" ||
    path === "/reset-password" ||
    path === "/verify-email";

  useEffect(() => {
    const authPages = [
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/verify-email",
    ];

    const isAuthPage = authPages.includes(window.location.pathname);

    if (isAuthPage) {
      setIsAuthorized(false);
      return;
    }

    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    setIsAuthorized(Boolean(token));
  }, []);

  return (
    <header className={`header ${isAuthPage ? "header-auth" : "header-wide"}`}>
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
            <button type="button">♡</button>
            <button type="button">🛒</button>
            <button type="button">Профіль</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;