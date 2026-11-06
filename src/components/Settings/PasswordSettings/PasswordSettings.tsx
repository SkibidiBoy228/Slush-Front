
import { useState } from "react";
import { changePassword } from "../../../api/settings";
import "./PasswordSettings.css";

function PasswordSettings() {
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
            setError("Введіть старий пароль.");
            return;
        }

        if (!newPassword) {
            setError("Введіть новий пароль.");
            return;
        }

        if (newPassword.length < 7) {
            setError("Новий пароль повинен містити щонайменше 7 символів.");
            return;
        }

        if (!/[A-Za-zА-Яа-яІіЇїЄєҐґ]/.test(newPassword)) {
            setError("Пароль повинен містити принаймні одну літеру.");
            return;
        }

        if (!/\d/.test(newPassword)) {
            setError("Пароль повинен містити принаймні одну цифру.");
            return;
        }

        if (/\s/.test(newPassword)) {
            setError("Пароль не повинен містити пробілів.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Паролі не співпадають.");
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

            setMessage("Пароль успішно змінено.");
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Не вдалося змінити пароль.");
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="password-settings">
            <div className="password-settings-card">
                <div className="password-settings-header">
                    <h1>Зміна паролю</h1>
                </div>

                <div className="password-settings-rules">
                    <ul>
                        <li>Не використовуйте жодного з останніх 5 паролів</li>
                        <li>Використовуйте 7+ символів</li>
                        <li>Використовуйте принаймні 1 літеру</li>
                        <li>Використовуйте принаймні 1 цифру</li>
                        <li>Без пробілів</li>
                    </ul>
                </div>

                <form
                    className="password-settings-form"
                    onSubmit={handleSubmit}
                >
                    <div className="password-settings-field">
                        <label htmlFor="current-password">
                            Старий пароль
                        </label>

                        <input
                            id="current-password"
                            type="password"
                            placeholder="Введіть ваш поточний пароль..."
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
                            disabled={saving}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="password-settings-field">
                        <input
                            id="confirm-password"
                            type="password"
                            aria-label="Повторіть новий пароль"
                            placeholder="Повторіть новий пароль..."
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
                            {saving ? "Збереження..." : "Зберегти"}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}

export default PasswordSettings;
