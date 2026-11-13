
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
    getProfileSettings,
    updateProfileSettings,
} from "../../../api/settings";

import { uploadBanner, uploadAvatar } from "../../../api/profile";

import type { ProfileSettings } from "../../../types/settings";

import i18n, { LANGUAGE_STORAGE_KEY } from "../../../i18n";

import "./GeneralSettings.css";

const supportedLanguages = ["uk", "en", "sk", "ru"] as const;

function GeneralSettings() {
    const { t } = useTranslation();

    const [profile, setProfile] = useState<ProfileSettings | null>(null);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [language, setLanguage] = useState("uk");

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const avatarInputRef = useRef<HTMLInputElement | null>(null);
    const bannerInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        loadProfile();
    }, []);

    useEffect(() => {
        return () => {
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }

            if (bannerPreview) {
                URL.revokeObjectURL(bannerPreview);
            }
        };
    }, [avatarPreview, bannerPreview]);

    async function loadProfile() {
        try {
            setLoading(true);
            setError("");

            const data = await getProfileSettings();

            const savedLanguage = supportedLanguages.includes(
                data.language as (typeof supportedLanguages)[number]
            )
                ? data.language
                : "uk";

            setProfile(data);
            setUsername(data.username);
            setEmail(data.email);
            setBio(data.bio);
            setLanguage(savedLanguage);

            await i18n.changeLanguage(savedLanguage);
            localStorage.setItem(LANGUAGE_STORAGE_KEY, savedLanguage);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(t("settings.loadError"));
            }
        } finally {
            setLoading(false);
        }
    }

    function handleAvatarChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = event.target.files?.[0];

        if (!file) return;

        if (avatarPreview) {
            URL.revokeObjectURL(avatarPreview);
        }

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        setMessage("");
        setError("");
    }

    function handleBannerChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = event.target.files?.[0];

        if (!file) return;

        if (bannerPreview) {
            URL.revokeObjectURL(bannerPreview);
        }

        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
        setMessage("");
        setError("");
    }

    async function handleSave() {
        try {
            setSaving(true);
            setMessage("");
            setError("");

            if (!username.trim()) {
                setError(t("settings.usernameRequired"));
                return;
            }

            if (!email.trim()) {
                setError(t("settings.emailRequired"));
                return;
            }

            if (bio.length > 100) {
                setError(t("settings.bioTooLong"));
                return;
            }

            if (!supportedLanguages.includes(
                language as (typeof supportedLanguages)[number]
            )) {
                setError(t("settings.loadError"));
                return;
            }

            if (avatarFile) {
                await uploadAvatar(avatarFile);
            }

            if (bannerFile) {
                await uploadBanner(bannerFile);
            }

            await updateProfileSettings({
                username: username.trim(),
                email: email.trim(),
                bio,
                language,
            });

            await i18n.changeLanguage(language);
            localStorage.setItem(LANGUAGE_STORAGE_KEY, language);

            const updatedProfile: ProfileSettings = {
                username: username.trim(),
                email: email.trim(),
                bio,
                language,
                avatarUrl: avatarPreview ?? profile?.avatarUrl ?? "",
                coverUrl: bannerPreview ?? profile?.coverUrl ?? "",
            };

            setProfile(updatedProfile);
            setAvatarFile(null);
            setBannerFile(null);

            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
                setAvatarPreview(null);
            }

            if (bannerPreview) {
                URL.revokeObjectURL(bannerPreview);
                setBannerPreview(null);
            }

            if (avatarInputRef.current) {
                avatarInputRef.current.value = "";
            }

            if (bannerInputRef.current) {
                bannerInputRef.current.value = "";
            }

            setMessage(t("settings.saved"));
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(t("settings.saveError"));
            }
        } finally {
            setSaving(false);
        }
    }

    function handleCancel() {
        if (!profile) return;

        setUsername(profile.username);
        setEmail(profile.email);
        setBio(profile.bio);
        setLanguage(profile.language);

        setAvatarFile(null);
        setBannerFile(null);

        if (avatarPreview) {
            URL.revokeObjectURL(avatarPreview);
            setAvatarPreview(null);
        }

        if (bannerPreview) {
            URL.revokeObjectURL(bannerPreview);
            setBannerPreview(null);
        }

        if (avatarInputRef.current) {
            avatarInputRef.current.value = "";
        }

        if (bannerInputRef.current) {
            bannerInputRef.current.value = "";
        }

        setMessage("");
        setError("");
    }

    if (loading) {
        return (
            <section className="general-settings">
                <div className="general-settings-loading">
                    {t("settings.loading")}
                </div>
            </section>
        );
    }

    if (!profile) {
        return (
            <section className="general-settings">
                <div className="general-settings-error">
                    {error || t("settings.loadError")}
                </div>
            </section>
        );
    }

    const currentAvatar = avatarPreview || profile.avatarUrl || "";
    const currentBanner = bannerPreview || profile.coverUrl || "";

    return (
        <section className="general-settings">
            <div className="general-settings-header">
                <h1>{t("settings.general")}</h1>
                <p>{t("settings.description")}</p>
            </div>

            <div className="general-settings-profile">
                <div className="general-settings-banner">
                    {currentBanner ? (
                        <img
                            src={currentBanner}
                            alt={t("settings.changeCover")}
                        />
                    ) : (
                        <div className="general-settings-banner-empty" />
                    )}

                    <button
                        type="button"
                        className="general-settings-image-button general-settings-banner-button"
                        onClick={() => bannerInputRef.current?.click()}
                        aria-label={t("settings.changeCover")}
                        title={t("settings.changeCover")}
                    >
                        {t("settings.changeCover")}
                    </button>

                    <input
                        ref={bannerInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleBannerChange}
                        hidden
                    />
                </div>

                <div className="general-settings-avatar-wrapper">
                    <div className="general-settings-avatar">
                        {currentAvatar ? (
                            <img
                                src={currentAvatar}
                                alt={username}
                            />
                        ) : (
                            <span>
                                {username.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        className="general-settings-image-button"
                        onClick={() => avatarInputRef.current?.click()}
                        aria-label={t("settings.changeAvatar")}
                        title={t("settings.changeAvatar")}
                    >
                        {t("settings.changeAvatar")}
                    </button>

                    <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        hidden
                    />
                </div>

                <div className="general-settings-form">
                    <div className="general-settings-field">
                        <label htmlFor="settings-username">
                            {t("settings.nickname")}
                        </label>

                        <input
                            id="settings-username"
                            type="text"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            disabled={saving}
                        />
                    </div>

                    <div className="general-settings-field">
                        <label htmlFor="settings-email">
                            {t("settings.email")}
                        </label>

                        <input
                            id="settings-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            disabled={saving}
                        />
                    </div>

                    <div className="general-settings-field">
                        <div className="general-settings-label-row">
                            <label htmlFor="settings-bio">
                                {t("settings.about")}
                            </label>

                            <span>{bio.length}/100</span>
                        </div>

                        <textarea
                            id="settings-bio"
                            value={bio}
                            maxLength={100}
                            onChange={(event) => setBio(event.target.value)}
                            disabled={saving}
                            rows={4}
                        />
                    </div>

                    <div className="general-settings-field">
                        <label htmlFor="settings-language">
                            {t("settings.language")}
                        </label>

                        <select
                            id="settings-language"
                            value={language}
                            onChange={(event) => setLanguage(event.target.value)}
                            disabled={saving}
                        >
                            <option value="uk">🇺🇦 Українська</option>
                            <option value="en">English</option>
                            <option value="sk">Slovenčina</option>
                            <option value="ru">Русский</option>
                        </select>
                    </div>
                </div>

                {(message || error) && (
                    <div
                        className={
                            error
                                ? "general-settings-message general-settings-message-error"
                                : "general-settings-message general-settings-message-success"
                        }
                    >
                        {error || message}
                    </div>
                )}

                <div className="general-settings-actions">
                    <button
                        type="button"
                        className="general-settings-cancel"
                        onClick={handleCancel}
                        disabled={saving}
                    >
                        {t("settings.cancel")}
                    </button>

                    <button
                        type="button"
                        className="general-settings-save"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving
                            ? t("settings.saving")
                            : t("settings.save")}
                    </button>
                </div>
            </div>
        </section>
    );
}

export default GeneralSettings;
