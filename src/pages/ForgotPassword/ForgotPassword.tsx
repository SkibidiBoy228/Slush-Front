
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { forgotPassword } from "../../api/auth";

import "./ForgotPassword.css";

function ForgotPassword() {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError(t("forgotPassword.emailRequired"));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError(t("forgotPassword.emailInvalid"));
      return;
    }

    try {
      setLoading(true);

      const response = await forgotPassword({ email: trimmedEmail });

      setSuccess(
        response.message || t("forgotPassword.success"),
      );

      setTimeout(() => {
        window.location.href = `/reset-password?email=${encodeURIComponent(trimmedEmail)}`;
      }, 1000);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(t("forgotPassword.sendError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <main className="forgot-password-main">
        <section className="forgot-password-card">
          <h1>{t("forgotPassword.title")}</h1>

          <p className="forgot-password-description">
            {t("forgotPassword.description")}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="forgot-password-form-group">
              <label htmlFor="forgot-email">
                E-mail
              </label>

              <input
                id="forgot-email"
                type="email"
                placeholder={t("forgotPassword.emailPlaceholder")}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {error && (
              <div className="forgot-password-message forgot-password-error">
                {error}
              </div>
            )}

            {success && (
              <div className="forgot-password-message forgot-password-success">
                {success}
              </div>
            )}

            <button
              className="forgot-password-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? t("forgotPassword.sending")
                : t("forgotPassword.sendCode")}
            </button>
          </form>

          <div className="forgot-password-login-link">
            {t("forgotPassword.rememberPassword")}{" "}
            <a href="/login">{t("forgotPassword.login")}</a>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ForgotPassword;
