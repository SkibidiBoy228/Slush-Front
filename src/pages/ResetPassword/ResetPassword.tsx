
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { resetPassword } from "../../api/auth";

import "./ResetPassword.css";

function ResetPassword() {
  const { t } = useTranslation();

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
      setError(t("resetPassword.emailRequired"));
      return;
    }

    if (!code.trim()) {
      setError(t("resetPassword.codeRequired"));
      return;
    }

    if (!newPassword) {
      setError(t("resetPassword.passwordRequired"));
      return;
    }

    if (newPassword.length < 6) {
      setError(t("resetPassword.passwordTooShort"));
      return;
    }

    if (!confirmPassword) {
      setError(t("resetPassword.confirmRequired"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("resetPassword.passwordMismatch"));
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
          t("resetPassword.success")
      );

      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(t("resetPassword.changeError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <main className="reset-password-main">
        <section className="reset-password-card">
          <h1>{t("resetPassword.title")}</h1>

          <p className="reset-password-description">
            {t("resetPassword.description")}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="reset-password-form-group">
              <label htmlFor="reset-email">
                {t("resetPassword.email")}
              </label>

              <input
                id="reset-email"
                type="email"
                placeholder={t("resetPassword.emailPlaceholder")}
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
                {t("resetPassword.code")}
              </label>

              <input
                id="reset-code"
                type="text"
                placeholder={t("resetPassword.codePlaceholder")}
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
                {t("resetPassword.newPassword")}
              </label>

              <input
                id="new-password"
                type="password"
                placeholder={t("resetPassword.newPasswordPlaceholder")}
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
                {t("resetPassword.confirmPassword")}
              </label>

              <input
                id="confirm-password"
                type="password"
                placeholder={t("resetPassword.confirmPasswordPlaceholder")}
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
                ? t("resetPassword.saving")
                : t("resetPassword.changePassword")}
            </button>
          </form>

          <div className="reset-password-login-link">
            {t("resetPassword.rememberPassword")}{" "}
            <a href="/login">
              {t("resetPassword.login")}
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ResetPassword;
