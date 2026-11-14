
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { login } from "../../api/auth";

import "./LoginForm.css";

function getRoleFromToken(token: string): string | null {
  try {
    const payloadBase64 = token.split(".")[1];

    if (!payloadBase64) {
      return null;
    }

    const normalizedBase64 = payloadBase64
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const payload = JSON.parse(
      decodeURIComponent(
        atob(normalizedBase64)
          .split("")
          .map(
            (char) =>
              "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2)
          )
          .join("")
      )
    );

    const roleClaim =
      payload[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ] ||
      payload.role ||
      payload.roles;

    if (Array.isArray(roleClaim)) {
      return roleClaim[0] ?? null;
    }

    return typeof roleClaim === "string" ? roleClaim : null;
  } catch (error) {
    console.error("Не удалось извлечь роль из JWT:", error);
    return null;
  }
}

function LoginForm() {
  const { t } = useTranslation();

  const [loginOrEmail, setLoginOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    if (!loginOrEmail.trim()) {
      setError(t("loginForm.loginRequired"));
      return;
    }

    if (!password) {
      setError(t("loginForm.passwordRequired"));
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
      const anotherStorage = rememberMe ? sessionStorage : localStorage;

      storage.setItem("accessToken", response.accessToken);
      storage.setItem("refreshToken", response.refreshToken);

      anotherStorage.removeItem("accessToken");
      anotherStorage.removeItem("refreshToken");

      window.dispatchEvent(new Event("auth-changed"));

      const role = getRoleFromToken(response.accessToken);
      const normalizedRole = role?.trim().toLowerCase();

      const adminBase = (
        (import.meta.env.VITE_ADMIN_URL as string | undefined) ?? ""
      ).replace(/\/+$/, "");

      const adminDoors: Record<string, string> = {
        superadmin: "/superadmin",
        admin: "/admin",
        moderator: "/moderator",
        analyst: "/analyst",
      };

      const adminDoor = normalizedRole
        ? adminDoors[normalizedRole]
        : undefined;

      if (adminDoor) {
        window.location.href = `${adminBase}${adminDoor}#access_token=${response.accessToken}`;
      } else {
        window.location.href = "/mainPage";
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(t("loginForm.loginError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-card">
      <h1>{t("loginForm.title")}</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="loginOrEmail">
            {t("loginForm.loginOrEmail")}
          </label>

          <input
            id="loginOrEmail"
            type="text"
            placeholder={t("loginForm.loginPlaceholder")}
            value={loginOrEmail}
            onChange={(event) => setLoginOrEmail(event.target.value)}
            disabled={loading}
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">{t("loginForm.password")}</label>

          <input
            id="password"
            type="password"
            placeholder={t("loginForm.passwordPlaceholder")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading}
            autoComplete="current-password"
          />
        </div>

        <div className="login-options">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              disabled={loading}
            />

            <span>{t("loginForm.rememberMe")}</span>
          </label>

          <a href="/forgot-password" className="forgot-password">
            {t("loginForm.forgotPassword")}
          </a>
        </div>

        {error && (
          <div className="form-message form-error">{error}</div>
        )}

        <button className="login-button" type="submit" disabled={loading}>
          {loading ? t("loginForm.loading") : t("loginForm.continue")}
        </button>
      </form>

      <div className="register-link">
        {t("loginForm.noAccount")}{" "}
        <a href="/register">{t("loginForm.register")}</a>
      </div>
    </section>
  );
}

export default LoginForm;
