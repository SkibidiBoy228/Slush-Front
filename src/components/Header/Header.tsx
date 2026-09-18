import "./Header.css";

const Header = () => {
  const isAuthorized = Boolean(
    localStorage.getItem("token"),
  );

  return (
    <header className="header">
      <div className="header-container">
        <a href="/" className="logo">
          SLUSH
        </a>

        <nav className="navigation">
          <a href="/shop">Крамниця</a>
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
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;