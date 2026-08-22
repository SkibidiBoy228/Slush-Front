import { useState } from "react";

import { register } from "../../api/auth";

import "./RegisterForm.css";

function RegisterForm() {
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [agree, setAgree] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!login.trim()) {
      setError("Введіть логін");
      return;
    }

    if (!email.trim()) {
      setError("Введіть e-mail");
      return;
    }

    if (!password) {
      setError("Введіть пароль");
      return;
    }

    if (!repeatPassword) {
      setError("Повторіть пароль");
      return;
    }

    if (password !== repeatPassword) {
      setError("Паролі не співпадають");
      return;
    }

    if (!agree) {
      setError("Потрібно погодитися з умовами використання");
      return;
    }

    try {
      setLoading(true);

    await register({
      username: login.trim(),
      email: email.trim(),
      password,
      confirmPassword: repeatPassword,
    });

    window.location.href = `/verify-email?email=${encodeURIComponent(
      email.trim()
    )}`;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Не вдалося створити акаунт");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="register-card">
      <h1>Створіть новий акаунт</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="login">Логін</label>

          <input
            id="login"
            type="text"
            placeholder="Придумайте новий логін..."
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">E-mail</label>

          <input
            id="email"
            type="email"
            placeholder="Введіть ваш e-mail..."
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Пароль</label>

          <input
            id="password"
            type="password"
            placeholder="Придумайте новий пароль..."
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="repeat-password">
            Повторіть пароль
          </label>

          <input
            id="repeat-password"
            type="password"
            placeholder="Напишіть пароль ще раз..."
            value={repeatPassword}
            onChange={(event) => setRepeatPassword(event.target.value)}
            disabled={loading}
          />
        </div>

        <label className="terms">
          <input
            type="checkbox"
            checked={agree}
            onChange={(event) => setAgree(event.target.checked)}
            disabled={loading}
          />

          <span>
            Я погоджуюсь з{" "}
            <a href="/terms">
              Умовами використання
            </a>
          </span>
        </label>

        {error && (
          <div className="form-message form-error">
            {error}
          </div>
        )}

        {success && (
          <div className="form-message form-success">
            {success}
          </div>
        )}

        <button
          className="register-button"
          type="submit"
          disabled={!agree || loading}
        >
          {loading ? "Завантаження..." : "Продовжити"}
        </button>
      </form>

      <div className="login-link">
        Маєте акаунт?{" "}
        <a href="/login">
          Авторизуйтесь
        </a>
      </div>
    </section>
  );
}

export default RegisterForm;