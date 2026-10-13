
import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import type { CommunityPostType } from "../../../types/community";
import { uploadScreenshot, uploadVideo } from "../../../api/media";
import "./CommunityPostCreator.css";

interface CommunityPostCreatorProps {
  onSubmit: (data: {
    postType: CommunityPostType;
    title: string;
    content: string;
    shortDescription: string;
    mediaUrl: string | null;
  }) => void | Promise<void>;
}

const POST_TYPES: {
  value: CommunityPostType;
  label: string;
}[] = [
  { value: "Discussion", label: "Обговорення" },
  { value: "Screenshot", label: "Скріншот" },
  { value: "Video", label: "Відео" },
  { value: "Guide", label: "Гайд" },
];

function CommunityPostCreator({ onSubmit }: CommunityPostCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [postType, setPostType] =
    useState<CommunityPostType>("Discussion");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isMediaPost =
    postType === "Screenshot" || postType === "Video";

  const resetFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const changeType = (type: CommunityPostType) => {
    resetFile();
    setPostType(type);
    setError("");
  };

  const selectFile = (file: File | null) => {
    if (!file) {
      resetFile();
      return;
    }

    if (postType === "Screenshot" || postType === "Guide") {
      if (!file.type.startsWith("image/")) {
        setError("Оберіть файл зображення.");
        return;
      }
    } else if (postType === "Video") {
      if (!file.type.startsWith("video/")) {
        setError("Оберіть відеофайл.");
        return;
      }
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (isMediaPost && !selectedFile) {
      setError("Спочатку додайте файл.");
      return;
    }

    if (
      postType === "Guide" &&
      (!title.trim() || !content.trim())
    ) {
      setError("Вкажіть заголовок і текст гайда.");
      return;
    }

    if (
      postType === "Discussion" &&
      (!title.trim() || !content.trim())
    ) {
      setError("Вкажіть заголовок і текст обговорення.");
      return;
    }

    if (
      postType === "News" &&
      !title.trim() &&
      !content.trim()
    ) {
      setError("Додайте заголовок або текст.");
      return;
    }

    try {
      setUploading(true);

      let mediaUrl: string | null = null;

      if (selectedFile) {
        if (postType === "Video") {
          mediaUrl = await uploadVideo(selectedFile);
        } else {
          mediaUrl = await uploadScreenshot(selectedFile);
        }
      }

      await onSubmit({
        postType,
        title: title.trim(),
        content: content.trim(),
        shortDescription: shortDescription.trim(),
        mediaUrl,
      });

      resetFile();
      setTitle("");
      setContent("");
      setShortDescription("");
      setPostType("Discussion");
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to create community post:", err);
      setError("Не вдалося створити публікацію. Спробуйте ще раз.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="community-post-creator">
      {!isOpen ? (
        <button
          type="button"
          className="community-create-button"
          onClick={() => setIsOpen(true)}
        >
          <span className="community-create-icon">+</span>
          <span>Створити пост</span>
        </button>
      ) : (
        <form
          className="community-post-creator-form"
          onSubmit={handleSubmit}
        >
          <div className="community-post-creator-header">
            <h2>Створення поста</h2>

            <button
              type="button"
              className="community-post-creator-close"
              onClick={() => setIsOpen(false)}
              aria-label="Закрити"
            >
              ×
            </button>
          </div>

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

          {postType === "Screenshot" && (
            <div className="community-post-field">
              <label>Скріншот</label>

              <label
                className="community-upload-zone"
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
                    : "Перетягніть файл сюди"}
                </strong>
                <span>або натисніть, щоб завантажити</span>
              </label>

              {previewUrl && (
                <div className="community-media-preview">
                  <img src={previewUrl} alt="Попередній перегляд" />
                </div>
              )}
            </div>
          )}

          {postType === "Video" && (
            <div className="community-post-field">
              <label>Відео</label>

              <label
                className="community-upload-zone"
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
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
                  <video src={previewUrl} controls />
                </div>
              )}
            </div>
          )}

          {postType === "Guide" && (
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
                <span>
                  {selectedFile
                    ? selectedFile.name
                    : "Перетягніть файл сюди або натисніть «Завантажити»"}
                </span>
              </label>

              {previewUrl && (
                <div className="community-media-preview">
                  <img src={previewUrl} alt="Обкладинка гайда" />
                </div>
              )}
            </div>
          )}

          {(postType === "Discussion" ||
            postType === "Guide" ||
            postType === "News") && (
            <div className="community-post-field">
              <label htmlFor="community-post-title">
                Заголовок
              </label>
              <input
                id="community-post-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={
                  postType === "Guide"
                    ? "Про що ваш гайд?"
                    : postType === "News"
                      ? "Заголовок новини"
                      : "Тема вашого обговорення..."
                }
                maxLength={160}
                disabled={uploading}
              />
              <span className="community-character-count">
                {title.length}/160
              </span>
            </div>
          )}

          {postType === "Screenshot" && (
            <div className="community-post-field">
              <label htmlFor="community-post-description">
                Опис
              </label>
              <textarea
                id="community-post-description"
                value={shortDescription}
                onChange={(event) =>
                  setShortDescription(event.target.value)
                }
                placeholder="Додайте опис скріншота..."
                rows={3}
                maxLength={300}
                disabled={uploading}
              />
              <span className="community-character-count">
                {shortDescription.length}/300
              </span>
            </div>
          )}

          {postType === "Guide" && (
            <div className="community-post-field">
              <label htmlFor="community-post-description">
                Опис
              </label>
              <textarea
                id="community-post-description"
                value={shortDescription}
                onChange={(event) =>
                  setShortDescription(event.target.value)
                }
                placeholder="Опишіть тему детальніше..."
                rows={3}
                maxLength={300}
                disabled={uploading}
              />
              <span className="community-character-count">
                {shortDescription.length}/300
              </span>
            </div>
          )}

          {(postType === "Discussion" ||
            postType === "Guide" ||
            postType === "News") && (
            <div className="community-post-field">
              <label htmlFor="community-post-content">
                {postType === "Guide" ? "Основний текст" : "Текст"}
              </label>
              <textarea
                id="community-post-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={
                  postType === "Guide"
                    ? "Опишіть тему детальніше..."
                    : postType === "News"
                      ? "Текст новини..."
                      : "Що ви хочете обговорити?"
                }
                rows={6}
                disabled={uploading}
              />
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
              onClick={() => {
                resetFile();
                setIsOpen(false);
                setError("");
              }}
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
      )}
    </section>
  );
}

export default CommunityPostCreator;
