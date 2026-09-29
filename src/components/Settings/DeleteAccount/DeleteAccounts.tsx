import { useState } from "react";

import {
  deleteAccount,
} from "../../../api/settings";

import {
  logout,
} from "../../../api/client";

import "./DeleteAccount.css";

function DeleteAccount() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [showConfirmation, setShowConfirmation] =
    useState(false);

  async function handleDelete() {
    setError("");

    if (!password) {
      setError("Введіть пароль.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Паролі не співпадають.");
      return;
    }

    try {
      setDeleting(true);

      await deleteAccount({
        password,
        confirmPassword,
      });

      logout();

      window.location.href = "/login";
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Не вдалося видалити акаунт.");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="delete-account">
      <div className="delete-account-header">
        <h1>Видалення акаунта</h1>
      </div>

      <div className="delete-account-card">
        <div className="delete-account-warning">
          <h2>Увага</h2>

          <p>
            Натисніть «Видалити мій акаунт», щоб
            розпочати процес остаточного видалення
            вашого акаунта.
          </p>

          <p>
            Після видалення відновити акаунт буде
            неможливо.
          </p>
        </div>

        <div className="delete-account-form">
          <div className="delete-account-field">
            <label htmlFor="delete-password">
              Пароль
            </label>

            <input
              id="delete-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              disabled={deleting}
            />
          </div>

          <div className="delete-account-field">
            <label htmlFor="delete-confirm-password">
              Повторіть пароль
            </label>

            <input
              id="delete-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              disabled={deleting}
            />
          </div>
        </div>

        {error && (
          <div className="delete-account-error">
            {error}
          </div>
        )}

        {!showConfirmation ? (
          <div className="delete-account-actions">
            <button
              type="button"
              className="delete-account-button"
              onClick={() => setShowConfirmation(true)}
            >
              Видалити мій акаунт
            </button>
          </div>
        ) : (
          <div className="delete-account-confirmation">
            <p>
              Ви впевнені, що хочете остаточно
              видалити акаунт?
            </p>

            <div className="delete-account-confirmation-actions">
              <button
                type="button"
                className="delete-account-cancel"
                onClick={() =>
                  setShowConfirmation(false)
                }
                disabled={deleting}
              >
                Скасувати
              </button>

              <button
                type="button"
                className="delete-account-confirm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting
                  ? "Видалення..."
                  : "Так, видалити"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default DeleteAccount;