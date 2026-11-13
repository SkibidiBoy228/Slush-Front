
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
    getNotificationSettings,
    updateNotificationSettings,
} from "../../../api/settings";

import type {
    NotificationSettings as NotificationSettingsData,
} from "../../../types/settings";

import "./NotificationSettings.css";

interface NotificationItemProps {
    title: string;
    checked: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
}

function NotificationItem({
    title,
    checked,
    onChange,
    disabled = false,
}: NotificationItemProps) {
    return (
        <div className="notification-settings-item">
            <span>{title}</span>

            <button
                type="button"
                className={`notification-switch ${
                    checked ? "notification-switch-active" : ""
                }`}
                onClick={() => onChange(!checked)}
                aria-pressed={checked}
                disabled={disabled}
                aria-label={title}
            >
                <span className="notification-switch-thumb" />
            </button>
        </div>
    );
}

function NotificationSettings() {
    const { t } = useTranslation();

    const [settings, setSettings] =
        useState<NotificationSettingsData | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        try {
            setLoading(true);
            setError("");

            const data = await getNotificationSettings();
            setSettings(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(t("notificationSettings.loadError"));
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleChange(
        key: keyof NotificationSettingsData,
        value: boolean
    ) {
        if (!settings || saving) return;

        const previousSettings = settings;

        const updated = {
            ...settings,
            [key]: value,
        };

        setSettings(updated);
        setMessage("");
        setError("");

        try {
            setSaving(true);

            await updateNotificationSettings(updated);

            setMessage(t("notificationSettings.saved"));
        } catch {
            setSettings(previousSettings);
            setError(t("notificationSettings.saveError"));
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <section className="notification-settings">
                <div className="notification-settings-loading">
                    {t("notificationSettings.loading")}
                </div>
            </section>
        );
    }

    if (!settings) {
        return (
            <section className="notification-settings">
                <div className="notification-settings-error">
                    {error || t("notificationSettings.loadError")}
                </div>
            </section>
        );
    }

    return (
        <section className="notification-settings">
            <div className="notification-settings-header">
                <h1>{t("notificationSettings.title")}</h1>
                <p>{t("notificationSettings.description")}</p>
            </div>

            <div className="notification-settings-panel">
                <div className="notification-settings-silent">
                    <h2>{t("notificationSettings.silentTitle")}</h2>

                    <NotificationItem
                        title={t("notificationSettings.bigSale")}
                        checked={settings.bigSale}
                        onChange={(value) =>
                            handleChange("bigSale", value)
                        }
                        disabled={saving}
                    />

                    <NotificationItem
                        title={t("notificationSettings.wishlistDiscount")}
                        checked={settings.wishlistDiscount}
                        onChange={(value) =>
                            handleChange("wishlistDiscount", value)
                        }
                        disabled={saving}
                    />

                    <NotificationItem
                        title={t("notificationSettings.profileComment")}
                        checked={settings.profileComment}
                        onChange={(value) =>
                            handleChange("profileComment", value)
                        }
                        disabled={saving}
                    />

                    <NotificationItem
                        title={t("notificationSettings.friendRequest")}
                        checked={settings.friendRequest}
                        onChange={(value) =>
                            handleChange("friendRequest", value)
                        }
                        disabled={saving}
                    />

                    <NotificationItem
                        title={t("notificationSettings.friendRequestAccepted")}
                        checked={settings.friendRequestAccepted}
                        onChange={(value) =>
                            handleChange("friendRequestAccepted", value)
                        }
                        disabled={saving}
                    />

                    <NotificationItem
                        title={t("notificationSettings.friendRequestRejected")}
                        checked={settings.friendRequestRejected}
                        onChange={(value) =>
                            handleChange("friendRequestRejected", value)
                        }
                        disabled={saving}
                    />
                </div>

                <div className="notification-settings-chat">
                    <h2>{t("notificationSettings.chatTitle")}</h2>

                    <div className="notification-settings-chat-header">
                        <span />
                        <span>{t("notificationSettings.notifications")}</span>
                        <span>{t("notificationSettings.sound")}</span>
                    </div>

                    <div className="notification-settings-chat-row">
                        <span>
                            {t("notificationSettings.newChatMessage")}
                        </span>

                        <button
                            type="button"
                            disabled={saving}
                            className={`notification-switch ${
                                settings.chatMessageNotification
                                    ? "notification-switch-active"
                                    : ""
                            }`}
                            onClick={() =>
                                handleChange(
                                    "chatMessageNotification",
                                    !settings.chatMessageNotification
                                )
                            }
                            aria-pressed={settings.chatMessageNotification}
                            aria-label={t(
                                "notificationSettings.newMessageNotification"
                            )}
                        >
                            <span className="notification-switch-thumb" />
                        </button>

                        <button
                            type="button"
                            disabled={saving}
                            className={`notification-switch ${
                                settings.chatMessageSound
                                    ? "notification-switch-active"
                                    : ""
                            }`}
                            onClick={() =>
                                handleChange(
                                    "chatMessageSound",
                                    !settings.chatMessageSound
                                )
                            }
                            aria-pressed={settings.chatMessageSound}
                            aria-label={t(
                                "notificationSettings.newMessageSound"
                            )}
                        >
                            <span className="notification-switch-thumb" />
                        </button>
                    </div>
                </div>

                {(message || error) && (
                    <div
                        className={
                            error
                                ? "notification-settings-message notification-settings-message-error"
                                : "notification-settings-message notification-settings-message-success"
                        }
                    >
                        {error || message}
                    </div>
                )}
            </div>
        </section>
    );
}

export default NotificationSettings;
