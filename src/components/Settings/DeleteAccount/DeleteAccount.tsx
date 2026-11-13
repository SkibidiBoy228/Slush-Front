
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { deleteAccount } from "../../../api/settings";
import { logout } from "../../../api/client";

import "./DeleteAccount.css";

function DeleteAccount() {
  const { t } = useTranslation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [showConfirmation, setShowConfirmation] = useState(false);

  async function handleDelete() {
    setError("");

    if (!password) {
      setError(t("deleteAccount.passwordRequired"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("deleteAccount.passwordMismatch"));
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
        setError(t("deleteAccount.deleteError"));
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="delete-account">
      <div className="delete-account-header">
        <h1>{t("deleteAccount.title")}</h1>
      </div>

      <div className="delete-account-card">
        <div className="delete-account-warning">
          <h2>{t("deleteAccount.warning")}</h2>

          <p>
            {t("deleteAccount.warningDescription")}
          </p>

          <p>
            {t("deleteAccount.warningIrreversible")}
          </p>
        </div>

        <div className="delete-account-form">
          <div className="delete-account-field">
            <label htmlFor="delete-password">
              {t("deleteAccount.password")}
            </label>

            <input
              id="delete-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={deleting}
            />
          </div>

          <div className="delete-account-field">
            <label htmlFor="delete-confirm-password">
              {t("deleteAccount.confirmPassword")}
            </label>

            <input
              id="delete-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
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
              {t("deleteAccount.deleteButton")}
            </button>
          </div>
        ) : (
          <div className="delete-account-confirmation">
            <p>
              {t("deleteAccount.confirmationQuestion")}
            </p>

            <div className="delete-account-confirmation-actions">
              <button
                type="button"
                className="delete-account-cancel"
                onClick={() => setShowConfirmation(false)}
                disabled={deleting}
              >
                {t("deleteAccount.cancel")}
              </button>

              <button
                type="button"
                className="delete-account-confirm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting
                  ? t("deleteAccount.deleting")
                  : t("deleteAccount.confirmDelete")}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default DeleteAccount;
