import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";

import GameSearch from "../../GameSearch/GameSearch";
import CommunityTabs from "../CommunityTabs/CommunityTabs";

import { getGameDetails } from "../../../api/games";
import { getCommunityTabCounts, createCommunityPost } from "../../../api/community";
import { uploadScreenshot, uploadVideo } from "../../../api/media";

import type {
  CommunityPostType,
} from "../../../types/community";

import "./CommunityPostCreator.css";

interface CommunityPostCreatorProps {
  gameId: string;
}

const POST_TYPES: {
  value: CommunityPostType;
  slug: string;
  label: string;
}[] = [
  { value: "Discussion", slug: "discussion", label: "Обговорення" },
  { value: "Screenshot", slug: "screenshot", label: "Скріншот" },
  { value: "Video", slug: "video", label: "Відео" },
  { value: "Guide", slug: "guide", label: "Гайд" },
];

const getTypeFromPath = (): CommunityPostType => {
  const slug = window.location.pathname.split("/").filter(Boolean)[4];
  return POST_TYPES.find((item) => item.slug === slug)?.value ?? "Discussion";
};

function CommunityPostCreator({ gameId }: CommunityPostCreatorProps) {
  const [postType, setPostType] = useState<CommunityPostType>(getTypeFromPath);
  const [gameTitle, setGameTitle] = useState("");
  const [subscribersCount, setSubscribersCount] = useState(0);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [shortDescription, setShortDescription] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loadingPage, setLoadingPage] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDiscussion = postType === "Discussion";
  const isScreenshot = postType === "Screenshot";
  const isVideo = postType === "Video";
  const isGuide = postType === "Guide";

  useEffect(() => {
    let cancelled = false;

    const loadPage = async () => {
      try {
        const [game, counts] = await Promise.all([
          getGameDetails(gameId),
          getCommunityTabCounts(gameId),
        ]);

        if (cancelled) return;

        setGameTitle(game.title);
        setSubscribersCount(counts.subscribersCount);
      } catch (loadError) {
        console.error("Failed to load community creation page:", loadError);
        if (!cancelled) {
          setError("Не вдалося завантажити сторінку спільноти.");
        }
      } finally {
        if (!cancelled) setLoadingPage(false);
      }
    };

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [gameId]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const resetFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setPreviewUrl(null);
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const changeType = (type: CommunityPostType) => {
    const selectedType = POST_TYPES.find((item) => item.value === type);
    if (!selectedType) return;

    resetFile();
    setPostType(type);
    setError("");

    window.history.pushState(
      {},
      "",
      `/game/${encodeURIComponent(gameId)}/community/create/${selectedType.slug}`
    );
  };

  useEffect(() => {
    const handlePopState = () => {
      setPostType(getTypeFromPath());
      setError("");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const selectFile = (file: File | null) => {
    if (!file) {
      resetFile();
      return;
    }

    if ((isDiscussion || isScreenshot || isGuide) && !file.type.startsWith("image/")) {
      setError("Оберіть файл зображення.");
      return;
    }

    if (isVideo && !file.type.startsWith("video/")) {
      setError("Оберіть відеофайл.");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectFile(event.target.files?.[0] ?? null);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    selectFile(event.dataTransfer.files?.[0] ?? null);
  };

  const handleCancel = () => {
    window.location.href = `/game/${encodeURIComponent(gameId)}/community`;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (isDiscussion && (!title.trim() || !content.trim())) {
      setError("Вкажіть заголовок і текст обговорення.");
      return;
    }

    if (isScreenshot && !selectedFile) {
      setError("Додайте скріншот перед публікацією.");
      return;
    }

    if (isVideo && !selectedFile) {
      setError("Додайте відео перед публікацією.");
      return;
    }

    if (isGuide && (!title.trim() || !shortDescription.trim() || !content.trim())) {
      setError("Заповніть заголовок, опис і текст гайда.");
      return;
    }

    try {
      setUploading(true);

      let mediaUrl: string | null = null;

      if (selectedFile) {
        mediaUrl = isVideo
          ? await uploadVideo(selectedFile)
          : await uploadScreenshot(selectedFile);
      }

      const createdPost = await createCommunityPost({
        gameId,
        postType,
        title: title.trim() || undefined,
        content: content.trim() || undefined,
        shortDescription: shortDescription.trim() || undefined,
        mediaUrl: mediaUrl || undefined,
      });

      window.location.href =
        `/game/${encodeURIComponent(gameId)}/community/post/${encodeURIComponent(createdPost.id)}`;
    } catch (submitError) {
      console.error("Failed to create community post:", submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Не вдалося створити публікацію. Спробуйте ще раз."
      );
    } finally {
      setUploading(false);
    }
  };

  const uploadLabel = isVideo
    ? "Відео"
    : isGuide
      ? "Обкладинка"
      : isScreenshot
        ? "Скріншот"
        : "Зображення до обговорення";

  const uploadAccept = isVideo ? "video/*" : "image/*";

  if (loadingPage) {
    return (
      <div className="community-create-page">
        <div className="community-create-page-status">
          Завантаження...
        </div>
      </div>
    );
  }

  return (
    <div className="community-create-page">
      <main className="community-create-page-container">
        <div className="community-create-page-search">
          <GameSearch />
        </div>

        <CommunityTabs
          activeTab="community"
          onTabChange={(tab) => {
            if (tab === "about") {
              window.location.href = `/game/${encodeURIComponent(gameId)}`;
            } else if (tab === "characteristics") {
              window.location.href = `/game/${encodeURIComponent(gameId)}/characteristics`;
            } else {
              window.location.href = `/game/${encodeURIComponent(gameId)}/community`;
            }
          }}
        />

        <div className="community-create-page-layout">
          <section className="community-create-main">
            <h1 className="community-create-page-title">
              Створення поста
            </h1>

            <form
              className="community-post-creator-form"
              onSubmit={handleSubmit}
            >
              <div className="community-post-type-tabs">
                {POST_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    className={
                      postType === type.value
                        ? "community-post-type-tab active"
                        : "community-post-type-tab"
                    }
                    onClick={() => changeType(type.value)}
                    disabled={uploading}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {isGuide && (
                <div className="community-guide-top-fields">
                  <div className="community-post-field">
                    <label>Обкладинка</label>
                    <label
                      className="community-upload-zone community-upload-zone-compact"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                      <span className="community-upload-icon">↑</span>
                      <strong>
                        {selectedFile
                          ? selectedFile.name
                          : "Перетягніть файл сюди або натисніть «Завантажити»"}
                      </strong>
                    </label>
                    {previewUrl && (
                      <div className="community-media-preview">
                        <img src={previewUrl} alt="Обкладинка гайда" />
                      </div>
                    )}
                  </div>

                  <div className="community-guide-fields">
                    <div className="community-post-field">
                      <label htmlFor="community-post-title">Заголовок</label>
                      <input
                        id="community-post-title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Про що ваш гайд?"
                        maxLength={160}
                        disabled={uploading}
                      />
                      <span className="community-character-count">
                        {title.length}/160
                      </span>
                    </div>

                    <div className="community-post-field">
                      <label htmlFor="community-post-description">Опис</label>
                      <textarea
                        id="community-post-description"
                        value={shortDescription}
                        onChange={(event) => setShortDescription(event.target.value)}
                        placeholder="Опишіть тему детальніше..."
                        rows={5}
                        maxLength={300}
                        disabled={uploading}
                      />
                      <span className="community-character-count">
                        {shortDescription.length}/300
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {isDiscussion && (
                <>
                  <div className="community-post-field">
                    <label htmlFor="community-post-title">Заголовок</label>
                    <input
                      id="community-post-title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Тема вашого обговорення..."
                      maxLength={160}
                      disabled={uploading}
                    />
                    <span className="community-character-count">
                      {title.length}/160
                    </span>
                  </div>

                  <div className="community-post-field">
                    <label htmlFor="community-post-content">Текст</label>
                    <textarea
                      id="community-post-content"
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      placeholder="Що ви хочете обговорити?"
                      rows={6}
                      disabled={uploading}
                    />
                  </div>
                </>
              )}

              {isGuide && (
                <div className="community-post-field">
                  <label htmlFor="community-post-content">Текст</label>
                  <textarea
                    id="community-post-content"
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Текст вашого гайду..."
                    rows={7}
                    disabled={uploading}
                  />
                </div>
              )}

              {(isScreenshot || isVideo) && (
                <>
                  <div className="community-post-field">
                    <label>{uploadLabel}</label>
                    <label
                      className="community-upload-zone"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={uploadAccept}
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                      <span className="community-upload-icon">↑</span>
                      <strong>
                        {selectedFile
                          ? selectedFile.name
                          : "Перетягніть файл сюди"}
                      </strong>
                      <span>або натисніть, щоб завантажити</span>
                    </label>

                    {previewUrl && (
                      <div className="community-media-preview">
                        {isVideo ? (
                          <video src={previewUrl} controls />
                        ) : (
                          <img src={previewUrl} alt="Попередній перегляд" />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="community-post-field">
                    <label htmlFor="community-post-caption">Підпис</label>
                    <input
                      id="community-post-caption"
                      value={shortDescription}
                      onChange={(event) => setShortDescription(event.target.value)}
                      placeholder={
                        isVideo
                          ? "Ваш коментар до відео..."
                          : "Ваш коментар до скріншота..."
                      }
                      maxLength={300}
                      disabled={uploading}
                    />
                    <span className="community-character-count">
                      {shortDescription.length}/300
                    </span>
                  </div>
                </>
              )}

              {isDiscussion && (
                <div className="community-post-field">
                  <label>Зображення (необов'язково)</label>
                  <label
                    className="community-upload-zone community-upload-zone-compact"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                    <span className="community-upload-icon">↑</span>
                    <strong>
                      {selectedFile
                        ? selectedFile.name
                        : "Додайте зображення до обговорення"}
                    </strong>
                  </label>
                  {previewUrl && (
                    <div className="community-media-preview">
                      <img src={previewUrl} alt="Зображення обговорення" />
                    </div>
                  )}
                </div>
              )}

              {error && (
                <p className="community-post-error" role="alert">
                  {error}
                </p>
              )}

              <div className="community-post-creator-actions">
                <button
                  type="button"
                  className="community-post-cancel"
                  onClick={handleCancel}
                  disabled={uploading}
                >
                  Відхилити
                </button>

                <button
                  type="submit"
                  className="community-post-submit"
                  disabled={uploading}
                >
                  {uploading ? "Завантаження..." : "Опублікувати"}
                </button>
              </div>
            </form>
          </section>

          <aside className="community-create-sidebar">
            <div className="community-create-game-info">
              <h2>{gameTitle}</h2>
              <span>
                <i />
                {subscribersCount.toLocaleString("uk-UA")} підписників
              </span>
            </div>

            <div className="community-create-rules">
              <h3>Правила спільноти</h3>
              <ol>
                <li>Публікуйте тільки оригінальний контент.</li>
                <li>
                  Не допускайте образ та принижень на адресу інших гравців,
                  розробників чи груп.
                </li>
                <li>Не включайте погрози або заохочення до заподіяння шкоди.</li>
                <li>Не завантажуйте контент, на який у вас немає прав.</li>
                <li>Не рекламуйте комерційний контент.</li>
                <li>
                  Переконайтеся, що контент відповідає місцю, де він розміщується.
                </li>
              </ol>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default CommunityPostCreator;