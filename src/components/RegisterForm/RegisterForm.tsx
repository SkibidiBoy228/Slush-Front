
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { register } from "../../api/auth";

import "./RegisterForm.css";

function RegisterForm() {
  const { t } = useTranslation();

  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [agree, setAgree] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!login.trim()) {
      setError(t("register.loginRequired"));
      return;
    }

    if (!email.trim()) {
      setError(t("register.emailRequired"));
      return;
    }

    if (!password) {
      setError(t("register.passwordRequired"));
      return;
    }

    if (!repeatPassword) {
      setError(t("register.repeatPasswordRequired"));
      return;
    }

    if (password !== repeatPassword) {
      setError(t("register.passwordMismatch"));
      return;
    }

    if (!agree) {
      setError(t("register.termsRequired"));
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
        setError(t("register.registrationError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="register-card">
      <h1>{t("register.title")}</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="login">{t("register.login")}</label>

          <input
            id="login"
            type="text"
            placeholder={t("register.loginPlaceholder")}
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
            placeholder={t("register.emailPlaceholder")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">{t("register.password")}</label>

          <input
            id="password"
            type="password"
            placeholder={t("register.passwordPlaceholder")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="repeat-password">
            {t("register.repeatPassword")}
          </label>

          <input
            id="repeat-password"
            type="password"
            placeholder={t("register.repeatPasswordPlaceholder")}
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
            {t("register.termsAgreement")}{" "}
            <a href="/terms">{t("register.termsLink")}</a>
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
          {loading ? t("register.loading") : t("register.continue")}
        </button>
      </form>

      <div className="login-link">
        {t("register.haveAccount")}{" "}
        <a href="/login">{t("register.loginLink")}</a>
      </div>
    </section>
  );
}

export default RegisterForm;
