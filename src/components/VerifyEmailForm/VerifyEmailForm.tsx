import { useRef, useState, type FormEvent, type ClipboardEvent, type KeyboardEvent } from "react";

import { verifyEmail } from "../../api/auth";

import "./VerifyEmailForm.css";

function VerifyEmailForm() {
  const params = new URLSearchParams(window.location.search);
  const email = params.get("email") || "";

  const [digits, setDigits] = useState(["", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join("");

  const updateDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    setDigits((current) => {
      const updated = [...current];
      updated[index] = digit;
      return updated;
    });

    setError("");

    if (digit && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (
      event.key === "Backspace" &&
      !digits[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pastedCode = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 5);

    if (!pastedCode) return;

    const updated = ["", "", "", "", ""];

    pastedCode.split("").forEach((digit, index) => {
      updated[index] = digit;
    });

    setDigits(updated);
    setError("");

    const nextIndex = Math.min(pastedCode.length, 4);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Не знайдено e-mail. Спробуйте пройти реєстрацію ще раз.");
      return;
    }

    if (code.length !== 5) {
      setError("Введіть усі 5 цифр коду");
      return;
    }

    try {
      setLoading(true);

      const response = await verifyEmail({
        email: email.trim(),
        code,
      });

      setSuccess(response.message || "E-mail успішно підтверджено.");

      window.setTimeout(() => {
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
      <h1>Введіть код</h1>

      <p className="verify-email-description">
        На ваше e-mail був надісланий 5-значний код
      </p>

      <form onSubmit={handleSubmit}>
        <div className="verify-email-code">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              className="verify-email-code-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              disabled={loading}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              aria-label={`Цифра ${index + 1} коду`}
              onChange={(event) => updateDigit(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              onPaste={handlePaste}
            />
          ))}
        </div>

        {error && (
          <div className="verify-email-message verify-email-error">
            {error}
          </div>
        )}

        {success && (
          <div className="verify-email-message verify-email-success">
            {success}
          </div>
        )}

        <button
          className="verify-email-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Перевірка..." : "Продовжити"}
        </button>
      </form>

      <button
        className="verify-email-resend"
        type="button"
        disabled
        title="Для повторного надсилання потрібен відповідний метод API"
      >
        Надіслати код ще раз
      </button>
    </section>
  );
}

export default VerifyEmailForm;