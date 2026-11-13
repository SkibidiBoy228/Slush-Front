
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { changePassword } from "../../../api/settings";

import "./PasswordSettings.css";

function PasswordSettings() {
    const { t } = useTranslation();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setMessage("");
        setError("");

        if (!currentPassword) {
            setError(t("passwordSettings.currentRequired"));
            return;
        }

        if (!newPassword) {
            setError(t("passwordSettings.newRequired"));
            return;
        }

        if (newPassword.length < 7) {
            setError(t("passwordSettings.minLength"));
            return;
        }

        if (!/[A-Za-zА-Яа-яІіЇїЄєҐґ]/.test(newPassword)) {
            setError(t("passwordSettings.letterRequired"));
            return;
        }

        if (!/\d/.test(newPassword)) {
            setError(t("passwordSettings.digitRequired"));
            return;
        }

        if (/\s/.test(newPassword)) {
            setError(t("passwordSettings.noSpaces"));
            return;
        }

        if (newPassword !== confirmPassword) {
            setError(t("passwordSettings.passwordMismatch"));
            return;
        }

        try {
            setSaving(true);

            await changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setMessage(t("passwordSettings.success"));
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(t("passwordSettings.changeError"));
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="password-settings">
            <div className="password-settings-card">
                <div className="password-settings-header">
                    <h1>{t("passwordSettings.title")}</h1>
                </div>

                <div className="password-settings-rules">
                    <ul>
                        <li>{t("passwordSettings.ruleHistory")}</li>
                        <li>{t("passwordSettings.ruleLength")}</li>
                        <li>{t("passwordSettings.ruleLetter")}</li>
                        <li>{t("passwordSettings.ruleDigit")}</li>
                        <li>{t("passwordSettings.ruleSpaces")}</li>
                    </ul>
                </div>

                <form
                    className="password-settings-form"
                    onSubmit={handleSubmit}
                >
                    <div className="password-settings-field">
                        <label htmlFor="current-password">
                            {t("passwordSettings.currentPassword")}
                        </label>

                        <input
                            id="current-password"
                            type="password"
                            placeholder={t("passwordSettings.currentPlaceholder")}
                            value={currentPassword}
                            onChange={(event) =>
                                setCurrentPassword(event.target.value)
                            }
                            disabled={saving}
                            autoComplete="current-password"
                        />
                    </div>

                    <div className="password-settings-field">
                        <label htmlFor="new-password">
                            {t("passwordSettings.newPassword")}
                        </label>

                        <input
                            id="new-password"
                            type="password"
                            placeholder={t("passwordSettings.newPlaceholder")}
                            value={newPassword}
                            onChange={(event) =>
                                setNewPassword(event.target.value)
                            }
                            disabled={saving}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="password-settings-field">
                        <label htmlFor="confirm-password">
                            {t("passwordSettings.confirmPassword")}
                        </label>

                        <input
                            id="confirm-password"
                            type="password"
                            placeholder={t("passwordSettings.confirmPlaceholder")}
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                            disabled={saving}
                            autoComplete="new-password"
                        />
                    </div>

                    {(message || error) && (
                        <div
                            className={
                                error
                                    ? "password-settings-message password-settings-message-error"
                                    : "password-settings-message password-settings-message-success"
                            }
                        >
                            {error || message}
                        </div>
                    )}

                    <div className="password-settings-actions">
                        <button type="submit" disabled={saving}>
                            {saving
                                ? t("passwordSettings.saving")
                                : t("passwordSettings.save")}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}

export default PasswordSettings;
