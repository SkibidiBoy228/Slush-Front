import { useState } from "react";

import { verifyEmail } from "../../api/auth";

import "./VerifyEmailForm.css";

function VerifyEmailForm() {
  const params = new URLSearchParams(window.location.search);
  const initialEmail = params.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");

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
      setError("Введіть код з листа");
      return;
    }

    try {
      setLoading(true);

      const response = await verifyEmail({
        email: email.trim(),
        code: code.trim(),
      });

      setSuccess(
        response.message || "E-mail успішно підтверджено."
      );

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Не вдалося підтвердити e-mail");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="verify-email-card">
      <h1>Підтвердіть e-mail</h1>

      <p className="verify-email-description">
        Ми надіслали код підтвердження на вашу електронну пошту.
        Введіть його нижче, щоб завершити реєстрацію.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">
            E-mail
          </label>

          <input
            id="email"
            type="email"
            placeholder="Введіть ваш e-mail..."
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="code">
            Код підтвердження
          </label>

          <input
            id="code"
            type="text"
            placeholder="Введіть код з листа..."
            value={code}
            onChange={(event) => setCode(event.target.value)}
            disabled={loading}
            autoComplete="one-time-code"
            maxLength={10}
          />
        </div>

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
          className="verify-email-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Перевірка..." : "Підтвердити"}
        </button>
      </form>

      <div className="verify-email-login">
        Вже маєте підтверджений e-mail?{" "}
        <a href="/login">
          Авторизуйтесь
        </a>
      </div>
    </section>
  );
}

export default VerifyEmailForm;