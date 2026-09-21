import { useEffect, useRef, useState } from "react";
import type React from "react";

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
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoGameId, setVideoGameId] = useState("");
  const [videoGameTitle, setVideoGameTitle] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoMessage, setVideoMessage] = useState("");
  const [videoError, setVideoError] = useState("");

  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
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
          setError("Пользователь не авторизован");
          return;
        }

        const tokenPayload = JSON.parse(atob(token.split(".")[1]));

        const currentUsername =
          tokenPayload.unique_name ||
          tokenPayload.name ||
          tokenPayload.sub;

        if (!currentUsername) {
          setError("Не удалось определить пользователя");
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
            : "Не удалось загрузить профиль"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

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

    setVideoFile(file);
    setVideoMessage("");
    setVideoError("");
  };

  const handleScreenshotChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setScreenshotFile(file);
    setScreenshotMessage("");
    setScreenshotError("");
  };

  const handleVideoUpload = async () => {
    setVideoMessage("");
    setVideoError("");

    if (!videoFile) {
      setVideoError("Выберите видеофайл");
      return;
    }

    if (!videoTitle.trim()) {
      setVideoError("Введите название видео");
      return;
    }

    if (!videoGameId.trim()) {
      setVideoError("Введите ID игры");
      return;
    }

    if (!videoGameTitle.trim()) {
      setVideoError("Введите название игры");
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

      if (videoInputRef.current) {
        videoInputRef.current.value = "";
      }

      setVideoMessage("Видео успешно загружено");
    } catch (err) {
      setVideoError(
        err instanceof Error
          ? err.message
          : "Не удалось загрузить видео"
      );
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleScreenshotUpload = async () => {
    setScreenshotMessage("");
    setScreenshotError("");

    if (!screenshotFile) {
      setScreenshotError("Выберите изображение");
      return;
    }

    if (!screenshotGameId.trim()) {
      setScreenshotError("Введите ID игры");
      return;
    }

    if (!screenshotGameTitle.trim()) {
      setScreenshotError("Введите название игры");
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

      if (screenshotInputRef.current) {
        screenshotInputRef.current.value = "";
      }

      setScreenshotMessage("Скриншот успешно загружен");
    } catch (err) {
      setScreenshotError(
        err instanceof Error
          ? err.message
          : "Не удалось загрузить скриншот"
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

      setMessage("Профиль успешно обновлён");

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
          : "Не удалось сохранить изменения"
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
            Загрузка профиля...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="edit-profile-page">
      <div className="edit-profile-card">
        <div className="edit-profile-heading">
          <h1>Редактировать профиль</h1>
          <p>
            Настройте внешний вид и информацию о своём профиле
          </p>
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
          {!bannerUrl && "Баннер профиля"}
        </div>

        <button
          type="button"
          className="change-banner-button"
          onClick={() => bannerInputRef.current?.click()}
        >
          Изменить баннер
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
              <img src={avatarUrl} alt="Аватар профиля" />
            ) : (
              <div className="empty-avatar">?</div>
            )}
          </div>

          <div className="avatar-info">
            <h2>Аватар профиля</h2>

            <p>
              PNG, JPG или WEBP. Рекомендуемый размер — 512×512.
            </p>

            <button
              type="button"
              className="secondary-button"
              onClick={() => avatarInputRef.current?.click()}
            >
              Изменить аватар
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
          <label htmlFor="username">Имя пользователя</label>

          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Введите имя пользователя"
            minLength={3}
            required
          />
        </div>

        <div className="form-section">
          <label htmlFor="bio">О себе</label>

          <textarea
            id="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Расскажите немного о себе..."
            rows={5}
            maxLength={500}
          />

          <span className="character-counter">
            {bio.length}/500
          </span>
        </div>

        <div className="media-section">
          <div className="section-title">
            <h2>Мои материалы</h2>

            <p>
              Здесь будут храниться ваши скриншоты и видео из игр.
            </p>
          </div>

          <div className="video-upload-form">
            <h3>Добавить видео</h3>

            <div className="video-form-field">
              <label htmlFor="video-title">Название видео</label>

              <input
                id="video-title"
                type="text"
                value={videoTitle}
                onChange={(event) => setVideoTitle(event.target.value)}
                placeholder="Например: Мой лучший момент"
                maxLength={150}
              />
            </div>

            <div className="video-form-field">
              <label htmlFor="video-game-id">ID игры</label>

              <input
                id="video-game-id"
                type="text"
                value={videoGameId}
                onChange={(event) => setVideoGameId(event.target.value)}
                placeholder="Например: 730"
              />
            </div>

            <div className="video-form-field">
              <label htmlFor="video-game-title">Название игры</label>

              <input
                id="video-game-title"
                type="text"
                value={videoGameTitle}
                onChange={(event) =>
                  setVideoGameTitle(event.target.value)
                }
                placeholder="Например: Counter-Strike 2"
              />
            </div>

            <div className="video-form-field">
              <label htmlFor="video-file">Видео-файл</label>

              <input
                ref={videoInputRef}
                id="video-file"
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
              />

              {videoFile && (
                <span className="selected-file">
                  Выбран файл: {videoFile.name}
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
                ? "Загрузка видео..."
                : "Загрузить видео"}
            </button>
          </div>

          <div className="video-upload-form">
            <h3>Добавить скриншот</h3>

            <div className="video-form-field">
              <label htmlFor="screenshot-game-id">
                ID игры
              </label>

              <input
                id="screenshot-game-id"
                type="text"
                value={screenshotGameId}
                onChange={(event) =>
                  setScreenshotGameId(event.target.value)
                }
                placeholder="Например: 730"
              />
            </div>

            <div className="video-form-field">
              <label htmlFor="screenshot-game-title">
                Название игры
              </label>

              <input
                id="screenshot-game-title"
                type="text"
                value={screenshotGameTitle}
                onChange={(event) =>
                  setScreenshotGameTitle(event.target.value)
                }
                placeholder="Например: Counter-Strike 2"
              />
            </div>

            <div className="video-form-field">
              <label htmlFor="screenshot-file">
                Изображение
              </label>

              <input
                ref={screenshotInputRef}
                id="screenshot-file"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleScreenshotChange}
              />

              {screenshotFile && (
                <span className="selected-file">
                  Выбран файл: {screenshotFile.name}
                </span>
              )}
            </div>

            {screenshotMessage && (
              <p className="success-message">
                {screenshotMessage}
              </p>
            )}

            {screenshotError && (
              <p className="error-message">
                {screenshotError}
              </p>
            )}

            <button
              type="button"
              className="media-button upload-video-button"
              disabled={uploadingScreenshot}
              onClick={handleScreenshotUpload}
            >
              {uploadingScreenshot
                ? "Загрузка скриншота..."
                : "Загрузить скриншот"}
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
            Отмена
          </button>

          <button
            type="button"
            className="save-button"
            disabled={saving}
            onClick={handleSubmit}
          >
            {saving ? "Сохранение..." : "Сохранить изменения"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default EditProfile;