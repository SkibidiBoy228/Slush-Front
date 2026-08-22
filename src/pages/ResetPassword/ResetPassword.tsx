import { useState } from "react";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { resetPassword } from "../../api/auth";

import "./ResetPassword.css";

function ResetPassword() {
  const params = new URLSearchParams(window.location.search);

  const emailFromUrl = params.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Введіть e-mail");
      return;
    }

    if (!code.trim()) {
      setError("Введіть код підтвердження");
      return;
    }

    if (!newPassword) {
      setError("Введіть новий пароль");
      return;
    }

    if (newPassword.length < 6) {
      setError("Пароль повинен містити щонайменше 6 символів");
      return;
    }

    if (!confirmPassword) {
      setError("Підтвердіть новий пароль");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Паролі не співпадають");
      return;
    }

    try {
      setLoading(true);

      const response = await resetPassword({
        email: email.trim(),
        code: code.trim(),
        newPassword,
        confirmPassword,
      });

      setSuccess(
        response.message ||
          "Пароль успішно змінено."
      );

      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Не вдалося змінити пароль");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <Header />

      <main className="reset-password-main">
        <section className="reset-password-card">
          <h1>Новий пароль</h1>

          <p className="reset-password-description">
            Введіть код, який ми надіслали на вашу
            електронну пошту, та придумайте новий пароль.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="reset-password-form-group">
              <label htmlFor="reset-email">
                E-mail
              </label>

              <input
                id="reset-email"
                type="email"
                placeholder="Введіть ваш e-mail..."
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="reset-password-form-group">
              <label htmlFor="reset-code">
                Код підтвердження
              </label>

              <input
                id="reset-code"
                type="text"
                placeholder="Введіть код з e-mail..."
                value={code}
                onChange={(event) =>
                  setCode(event.target.value)
                }
                disabled={loading}
                autoComplete="one-time-code"
              />
            </div>

            <div className="reset-password-form-group">
              <label htmlFor="new-password">
                Новий пароль
              </label>

              <input
                id="new-password"
                type="password"
                placeholder="Введіть новий пароль..."
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <div className="reset-password-form-group">
              <label htmlFor="confirm-password">
                Підтвердження пароля
              </label>

              <input
                id="confirm-password"
                type="password"
                placeholder="Повторіть новий пароль..."
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="reset-password-message reset-password-error">
                {error}
              </div>
            )}

            {success && (
              <div className="reset-password-message reset-password-success">
                {success}
              </div>
            )}

            <button
              className="reset-password-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Збереження..."
                : "Змінити пароль"}
            </button>
          </form>

          <div className="reset-password-login-link">
            Згадали пароль?{" "}
            <a href="/login">Увійти</a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default ResetPassword;