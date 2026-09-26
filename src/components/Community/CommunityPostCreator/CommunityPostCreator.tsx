import { useState } from "react";
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
  }) => void;
}

function CommunityPostCreator({
  onSubmit,
}: CommunityPostCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [postType, setPostType] =
    useState<CommunityPostType>("Discussion");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!title.trim() && !content.trim()) {
      return;
    }

    try {
      setUploading(true);

      let mediaUrl: string | null = null;

      if (selectedFile) {
        if (postType === "Screenshot") {
          mediaUrl = await uploadScreenshot(selectedFile);
        }

        if (postType === "Video") {
          mediaUrl = await uploadVideo(selectedFile);
        }
      }

      await onSubmit({
        postType,
        title: title.trim(),
        content: content.trim(),
        shortDescription: shortDescription.trim(),
        mediaUrl,
      });

      setTitle("");
      setContent("");
      setShortDescription("");
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(null);
      setPostType("Discussion");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to upload media:", error);
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
          <span>Створити публікацію</span>
        </button>
      ) : (
        <form
          className="community-post-creator-form"
          onSubmit={handleSubmit}
        >
          <div className="community-post-creator-header">
            <h2>Створити публікацію</h2>

            <button
              type="button"
              className="community-post-creator-close"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="community-post-type">
            <label htmlFor="community-post-type">
              Тип публікації
            </label>

            <select
              id="community-post-type"
              value={postType}
              onChange={(event)=>{
                const newType = event.target.value as CommunityPostType;
                setPostType(newType);
                if(newType !== "Screenshot" && newType !== "Video"){
                  if(previewUrl){
                    URL.revokeObjectURL(previewUrl);
                  }
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }
              }}
            >
              <option value="Discussion">Обговорення</option>
              <option value="Screenshot">Скріншот</option>
              <option value="Video">Відео</option>
              <option value="Guide">Посібник</option>
              <option value="News">Новини</option>
            </select>
          </div>
          {(postType === "Screenshot" || postType === "Video") &&(
            <div className="community-post-field">
              <label htmlFor="community-post-media">
                {postType==="Screenshot" ? "Скріншот" : "Відео"}
              </label>
              <input id="community-post-media"
                type="file"
                accept={postType === "Screenshot" ? "image/*" : "video/*"}
                onChange={(event)=>{
                  const file = event.target.files?.[0] ?? null;
                  setSelectedFile(file);
                  if(previewUrl){
                    URL.revokeObjectURL(previewUrl);
                  }
                  if(file){
                    const url = URL.createObjectURL(file);
                    setPreviewUrl(url);
                  }else{
                    setPreviewUrl(null);
                  }
                }}
                />
                {previewUrl && (
                  <div className="community-media-preview">
                    {postType==="Screenshot" ? (
                      <img src ={previewUrl} alt="Попередній перегляд"/>
                    ): (
                      <video src = {previewUrl} controls/>
                    )}
                  </div>
                )}
                {selectedFile && (
                  <span className="community-selected-file">{selectedFile.name}</span>
                )}
            </div>
          )}

          <div className="community-post-field">
            <label htmlFor="community-post-title">
              Заголовок
            </label>

            <input
              id="community-post-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Заголовок публікації"
              maxLength={200}
            />
          </div>

          <div className="community-post-field">
            <label htmlFor="community-post-description">
              Короткий опис
            </label>

            <input
              id="community-post-description"
              type="text"
              value={shortDescription}
              onChange={(event) =>
                setShortDescription(event.target.value)
              }
              placeholder="Коротко про публікацію"
              maxLength={300}
            />
          </div>

          <div className="community-post-field">
            <label htmlFor="community-post-content">
              Текст
            </label>

            <textarea
              id="community-post-content"
              value={content}
              onChange={(event) =>
                setContent(event.target.value)
              }
              placeholder="Напишіть щось..."
              rows={6}
            />
          </div>

          <div className="community-post-creator-actions">
            <button
              type="button"
              className="community-post-cancel"
              onClick={() => setIsOpen(false)}
            >
              Скасувати
            </button>

              <button 
                type="submit"
                className="community-post-submit"
                disabled ={
                  uploading || (!title.trim() && !content.trim()) || ((postType==="Screenshot" || postType==="Video") && !selectedFile)
                }
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