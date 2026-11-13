
import { useEffect, useRef, useState } from "react";
import type React from "react";
import { useTranslation } from "react-i18next";

import {
  getUserProfile,
  updateProfile,
  uploadAvatar,
  uploadBanner,
  uploadUserVideo,
  uploadUserScreenshot,
} from "../../api/profile";

import { getAccessToken } from "../../api/client";

import "./EditProfile.css";

function EditProfile() {
  const { t } = useTranslation();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoGameId, setVideoGameId] = useState("");
  const [videoGameTitle, setVideoGameTitle] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoMessage, setVideoMessage] = useState("");
  const [videoError, setVideoError] = useState("");

  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreviewUrl, setScreenshotPreviewUrl] = useState<string | null>(null);
  const [screenshotGameId, setScreenshotGameId] = useState("");
  const [screenshotGameTitle, setScreenshotGameTitle] = useState("");
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [screenshotMessage, setScreenshotMessage] = useState("");
  const [screenshotError, setScreenshotError] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = getAccessToken();

        if (!token) {
          setError(t("editProfile.notAuthorized"));
          return;
        }

        const tokenPayload = JSON.parse(atob(token.split(".")[1]));

        const currentUsername =
          tokenPayload.unique_name ||
          tokenPayload.name ||
          tokenPayload.sub;

        if (!currentUsername) {
          setError(t("editProfile.userNotFound"));
          return;
        }

        const profile = await getUserProfile(currentUsername);

        setUsername(profile.username);
        setBio(profile.bio === "No bio yet." ? "" : profile.bio ?? "");
        setAvatarUrl(profile.avatarUrl ?? "");
        setBannerUrl(profile.coverUrl ?? "");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : t("editProfile.loadError")
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [t]);

  const handleAvatarChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  };

  const handleBannerChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBannerFile(file);
    setBannerUrl(URL.createObjectURL(file));
  };

  const handleVideoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);

    setVideoFile(file);
    setVideoPreviewUrl(previewUrl);
    setVideoMessage("");
    setVideoError("");
  };

  const handleScreenshotChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (screenshotPreviewUrl) {
      URL.revokeObjectURL(screenshotPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);

    setScreenshotFile(file);
    setScreenshotPreviewUrl(previewUrl);
    setScreenshotMessage("");
    setScreenshotError("");
  };

  const handleVideoUpload = async () => {
    setVideoMessage("");
    setVideoError("");

    if (!videoFile) {
      setVideoError(t("editProfile.videoRequired"));
      return;
    }

    if (!videoTitle.trim()) {
      setVideoError(t("editProfile.videoTitleRequired"));
      return;
    }

    if (!videoGameId.trim()) {
      setVideoError(t("editProfile.gameIdRequired"));
      return;
    }

    if (!videoGameTitle.trim()) {
      setVideoError(t("editProfile.gameTitleRequired"));
      return;
    }

    setUploadingVideo(true);

    try {
      await uploadUserVideo({
        file: videoFile,
        title: videoTitle.trim(),
        gameId: videoGameId.trim(),
        gameTitle: videoGameTitle.trim(),
      });

      setVideoFile(null);
      setVideoTitle("");
      setVideoGameId("");
      setVideoGameTitle("");

      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
      setVideoPreviewUrl(null);

      if (videoInputRef.current) {
        videoInputRef.current.value = "";
      }

      setVideoMessage(t("editProfile.videoSuccess"));
    } catch (err) {
      setVideoError(
        err instanceof Error
          ? err.message
          : t("editProfile.videoUploadError")
      );
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleScreenshotUpload = async () => {
    setScreenshotMessage("");
    setScreenshotError("");

    if (!screenshotFile) {
      setScreenshotError(t("editProfile.screenshotRequired"));
      return;
    }

    if (!screenshotGameId.trim()) {
      setScreenshotError(t("editProfile.gameIdRequired"));
      return;
    }

    if (!screenshotGameTitle.trim()) {
      setScreenshotError(t("editProfile.gameTitleRequired"));
      return;
    }

    setUploadingScreenshot(true);

    try {
      await uploadUserScreenshot({
        file: screenshotFile,
        gameId: screenshotGameId.trim(),
        gameTitle: screenshotGameTitle.trim(),
      });

      setScreenshotFile(null);
      setScreenshotGameId("");
      setScreenshotGameTitle("");

      if (screenshotPreviewUrl) {
        URL.revokeObjectURL(screenshotPreviewUrl);
      }
      setScreenshotPreviewUrl(null);

      if (screenshotInputRef.current) {
        screenshotInputRef.current.value = "";
      }

      setScreenshotMessage(t("editProfile.screenshotSuccess"));
    } catch (err) {
      setScreenshotError(
        err instanceof Error
          ? err.message
          : t("editProfile.screenshotUploadError")
      );
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (avatarFile) {
        const result = await uploadAvatar(avatarFile);
        setAvatarUrl(result.url);
      }

      if (bannerFile) {
        const result = await uploadBanner(bannerFile);
        setBannerUrl(result.url);
      }

      const updatedProfile = await updateProfile({
        username: username.trim(),
        bio: bio.trim(),
      });

      setAvatarFile(null);
      setBannerFile(null);

      setMessage(t("editProfile.profileSuccess"));

      const updatedUsername = updatedProfile.username || username.trim();

      setTimeout(() => {
        window.location.href = `/profile/${encodeURIComponent(
          updatedUsername
        )}`;
      }, 500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("editProfile.saveError")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <main className="edit-profile-page">
        <div className="edit-profile-card">
          <p className="edit-profile-loading">
            {t("editProfile.loading")}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="edit-profile-page">
      <div className="edit-profile-card">
        <div className="edit-profile-heading">
          <h1>{t("editProfile.title")}</h1>
          <p>{t("editProfile.description")}</p>
        </div>

        <div
          className={`profile-banner-preview ${
            !bannerUrl ? "empty-banner" : ""
          }`}
          style={
            bannerUrl
              ? { backgroundImage: `url(${bannerUrl})` }
              : undefined
          }
        >
          {!bannerUrl && t("editProfile.bannerPlaceholder")}
        </div>

        <button
          type="button"
          className="change-banner-button"
          onClick={() => bannerInputRef.current?.click()}
        >
          {t("editProfile.changeBanner")}
        </button>

        <input
          ref={bannerInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={handleBannerChange}
        />

        <div className="avatar-section">
          <div className="avatar-wrapper">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={t("editProfile.avatarAlt")}
              />
            ) : (
              <div className="empty-avatar">?</div>
            )}
          </div>

          <div className="avatar-info">
            <h2>{t("editProfile.avatarTitle")}</h2>

            <p>{t("editProfile.avatarDescription")}</p>

            <button
              type="button"
              className="secondary-button"
              onClick={() => avatarInputRef.current?.click()}
            >
              {t("editProfile.changeAvatar")}
            </button>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        <div className="form-section">
          <label htmlFor="username">
            {t("editProfile.username")}
          </label>

          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder={t("editProfile.usernamePlaceholder")}
            minLength={3}
            required
          />
        </div>

        <div className="form-section">
          <label htmlFor="bio">{t("editProfile.bio")}</label>

          <textarea
            id="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder={t("editProfile.bioPlaceholder")}
            rows={5}
            maxLength={500}
          />

          <span className="character-counter">
            {bio.length}/500
          </span>
        </div>

        <div className="media-section">
          <div className="section-title">
            <h2>{t("editProfile.mediaTitle")}</h2>
            <p>{t("editProfile.mediaDescription")}</p>
          </div>

          <div className="video-upload-form">
            <h3>{t("editProfile.addVideo")}</h3>

            <div className="video-form-field">
              <label htmlFor="video-title">
                {t("editProfile.videoTitle")}
              </label>

              <input
                id="video-title"
                type="text"
                value={videoTitle}
                onChange={(event) => setVideoTitle(event.target.value)}
                placeholder={t("editProfile.videoTitlePlaceholder")}
                maxLength={150}
              />
            </div>

            <div className="video-form-field">
              <label htmlFor="video-game-id">
                {t("editProfile.gameId")}
              </label>

              <input
                id="video-game-id"
                type="text"
                value={videoGameId}
                onChange={(event) => setVideoGameId(event.target.value)}
                placeholder={t("editProfile.gameIdPlaceholder")}
              />
            </div>

            <div className="video-form-field">
              <label htmlFor="video-game-title">
                {t("editProfile.gameTitle")}
              </label>

              <input
                id="video-game-title"
                type="text"
                value={videoGameTitle}
                onChange={(event) =>
                  setVideoGameTitle(event.target.value)
                }
                placeholder={t("editProfile.gameTitlePlaceholder")}
              />
            </div>

            <div className="video-form-field">
              <label htmlFor="video-file">
                {t("editProfile.videoFile")}
              </label>

              <input
                ref={videoInputRef}
                id="video-file"
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
              />

              {videoPreviewUrl && (
                <div className="edit-profile-media-preview">
                  <video
                    src={videoPreviewUrl}
                    controls
                    preload="metadata"
                  />
                </div>
              )}

              {videoFile && (
                <span className="selected-file">
                  {t("editProfile.selectedFile")}: {videoFile.name}
                </span>
              )}
            </div>

            {videoMessage && (
              <p className="success-message">{videoMessage}</p>
            )}

            {videoError && (
              <p className="error-message">{videoError}</p>
            )}

            <button
              type="button"
              className="media-button upload-video-button"
              disabled={uploadingVideo}
              onClick={handleVideoUpload}
            >
              {uploadingVideo
                ? t("editProfile.uploadingVideo")
                : t("editProfile.uploadVideo")}
            </button>
          </div>

          <div className="video-upload-form">
            <h3>{t("editProfile.addScreenshot")}</h3>

            <div className="video-form-field">
              <label htmlFor="screenshot-game-id">
                {t("editProfile.gameId")}
              </label>

              <input
                id="screenshot-game-id"
                type="text"
                value={screenshotGameId}
                onChange={(event) =>
                  setScreenshotGameId(event.target.value)
                }
                placeholder={t("editProfile.gameIdPlaceholder")}
              />
            </div>

            <div className="video-form-field">
              <label htmlFor="screenshot-game-title">
                {t("editProfile.gameTitle")}
              </label>

              <input
                id="screenshot-game-title"
                type="text"
                value={screenshotGameTitle}
                onChange={(event) =>
                  setScreenshotGameTitle(event.target.value)
                }
                placeholder={t("editProfile.gameTitlePlaceholder")}
              />
            </div>

            <div className="video-form-field">
              <label htmlFor="screenshot-file">
                {t("editProfile.screenshotFile")}
              </label>

              <input
                ref={screenshotInputRef}
                id="screenshot-file"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleScreenshotChange}
              />

              {screenshotPreviewUrl && (
                <div className="edit-profile-media-preview">
                  <img
                    src={screenshotPreviewUrl}
                    alt={t("editProfile.screenshotPreviewAlt")}
                  />
                </div>
              )}

              {screenshotFile && (
                <span className="selected-file">
                  {t("editProfile.selectedFile")}: {screenshotFile.name}
                </span>
              )}
            </div>

            {screenshotMessage && (
              <p className="success-message">
                {screenshotMessage}
              </p>
            )}

            {screenshotError && (
              <p className="error-message">{screenshotError}</p>
            )}

            <button
              type="button"
              className="media-button upload-video-button"
              disabled={uploadingScreenshot}
              onClick={handleScreenshotUpload}
            >
              {uploadingScreenshot
                ? t("editProfile.uploadingScreenshot")
                : t("editProfile.uploadScreenshot")}
            </button>
          </div>
        </div>

        {message && (
          <p className="success-message">{message}</p>
        )}

        {error && <p className="error-message">{error}</p>}

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={handleCancel}
          >
            {t("editProfile.cancel")}
          </button>

          <button
            type="button"
            className="save-button"
            disabled={saving}
            onClick={handleSubmit}
          >
            {saving
              ? t("editProfile.saving")
              : t("editProfile.save")}
          </button>
        </div>
      </div>
    </main>
  );
}

export default EditProfile;
