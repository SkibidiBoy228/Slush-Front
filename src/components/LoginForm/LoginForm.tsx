import { useState } from "react";

import { login } from "../../api/auth";

import "./LoginForm.css";

function LoginForm() {
  const [loginOrEmail, setLoginOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    if (!loginOrEmail.trim()) {
      setError("Введіть логін або e-mail");
      return;
    }

    if (!password) {
      setError("Введіть пароль");
      return;
    }

    try {
      setLoading(true);

      const response = await login({
        loginOrEmail: loginOrEmail.trim(),
        password,
        rememberMe,
      });

      const storage = rememberMe ? localStorage : sessionStorage;

      storage.setItem("accessToken", response.accessToken);
      storage.setItem("refreshToken", response.refreshToken);

      window.location.href = "/";
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Не вдалося виконати вхід");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-card">
      <h1>Авторизуйтесь, щоб продовжити</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="loginOrEmail">
            Логін або e-mail
          </label>

          <input
            id="loginOrEmail"
            type="text"
            placeholder="Введіть ваш логін або e-mail..."
            value={loginOrEmail}
            onChange={(event) =>
              setLoginOrEmail(event.target.value)
            }
            disabled={loading}
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">
            Пароль
          </label>

          <input
            id="password"
            type="password"
            placeholder="Введіть ваш пароль..."
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            disabled={loading}
            autoComplete="current-password"
          />
        </div>

        <div className="login-options">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) =>
                setRememberMe(event.target.checked)
              }
              disabled={loading}
            />

            <span>Запам'ятати мене</span>
          </label>

          <a
            href="/forgot-password"
            className="forgot-password"
          >
            Не пам'ятаю пароль
          </a>
        </div>

        {error && (
          <div className="form-message form-error">
            {error}
          </div>
        )}

        <button
          className="login-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Завантаження..." : "Продовжити"}
        </button>
      </form>

      <div className="register-link">
        Не маєте акаунту?{" "}
        <a href="/register">
          Зареєструйтесь
        </a>
      </div>
    </section>
  );
}

export default LoginForm;