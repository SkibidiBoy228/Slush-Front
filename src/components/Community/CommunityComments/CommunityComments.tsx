
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { PostComment } from "../../../types/community";
import "./CommunityComments.css";

interface CommunityCommentsProps {
  postId: string;
  comments: PostComment[];
  loading?: boolean;
  onLoad: (postId: string) => void;
  onSubmit: (
    postId: string,
    content: string,
    parentCommentId?: string | null
  ) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onUpdate?: (
    commentId: string,
    content: string
  ) => Promise<void>;
  currentUsername?: string | null;
  variant?: "default" | "details";
}

function CommunityComments({
  postId,
  comments,
  loading = false,
  onLoad,
  onSubmit,
  onDelete,
  onUpdate,
  currentUsername,
  variant = "default",
}: CommunityCommentsProps) {
  const { t } = useTranslation();

  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<PostComment | null>(null);

  const [editingComment, setEditingComment] =
    useState<PostComment | null>(null);
  const [editContent, setEditContent] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] =
    useState<string | null>(null);
  const [updatingCommentId, setUpdatingCommentId] =
    useState<string | null>(null);

  const [activeMenuCommentId, setActiveMenuCommentId] =
    useState<string | null>(null);

  useEffect(() => {
    onLoad(postId);
  }, [postId, onLoad]);

  const canManageComment = (comment: PostComment) =>
    !!currentUsername &&
    comment.authorUsername.toLowerCase() ===
      currentUsername.toLowerCase();

  const handleCancelComposer = () => {
    setContent("");
    setReplyTo(null);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const text = content.trim();

    if (!text || submitting) return;

    try {
      setSubmitting(true);

      await onSubmit(postId, text, replyTo?.id ?? null);

      setContent("");
      setReplyTo(null);
    } catch (error) {
      console.error("Не вдалося надіслати коментар:", error);
      alert(t("communityComments.submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (comment: PostComment) => {
    const confirmed = window.confirm(
      t("communityComments.confirmDelete")
    );

    if (!confirmed || deletingCommentId) return;

    try {
      setDeletingCommentId(comment.id);

      if (replyTo?.id === comment.id) {
        setReplyTo(null);
      }

      if (editingComment?.id === comment.id) {
        setEditingComment(null);
        setEditContent("");
      }

      await onDelete(comment.id);
    } catch (error) {
      console.error("Не вдалося видалити коментар:", error);
      alert(t("communityComments.deleteError"));
    } finally {
      setDeletingCommentId(null);
    }
  };

  const startEditing = (comment: PostComment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
    setReplyTo(null);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent("");
  };

  const handleUpdate = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const text = editContent.trim();

    if (!editingComment || !text || !onUpdate || updatingCommentId) {
      return;
    }

    try {
      setUpdatingCommentId(editingComment.id);

      await onUpdate(editingComment.id, text);

      cancelEditing();
    } catch (error) {
      console.error("Не вдалося оновити коментар:", error);
      alert(t("communityComments.updateError"));
    } finally {
      setUpdatingCommentId(null);
    }
  };

  const renderComment = (
    comment: PostComment,
    isReply = false
  ) => {
    const canManage = canManageComment(comment);
    const isEditing = editingComment?.id === comment.id;
    const isDeleting = deletingCommentId === comment.id;
    const isUpdating = updatingCommentId === comment.id;

    return (
      <div
        key={comment.id}
        className={`community-comment ${
          isReply ? "community-comment-reply" : ""
        }`}
      >
        <button
          type="button"
          className="community-comment-avatar-link"
          onClick={() => {
            window.location.href = `/profile/${encodeURIComponent(
              comment.authorUsername
            )}`;
          }}
          aria-label={t("communityComments.profile", {
            username: comment.authorUsername,
          })}
        >
          <div className="community-comment-avatar">
            {comment.authorAvatarUrl ? (
              <img
                src={comment.authorAvatarUrl}
                alt={comment.authorUsername}
              />
            ) : (
              <span>
                {comment.authorUsername.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </button>

        <div className="community-comment-body">
          <div className="community-comment-header">
            <button
              type="button"
              className="community-comment-author"
              onClick={() => {
                window.location.href = `/profile/${encodeURIComponent(
                  comment.authorUsername
                )}`;
              }}
            >
              {comment.authorUsername}
            </button>

            <span className="community-comment-date">
              {comment.createdAt}
            </span>

            <div className="community-comment-menu">
              <button
                type="button"
                className="community-comment-menu-trigger"
                aria-label={t("communityComments.commentActions")}
                aria-expanded={activeMenuCommentId === comment.id}
                onClick={() =>
                  setActiveMenuCommentId((current) =>
                    current === comment.id ? null : comment.id
                  )
                }
              >
                ⋯
              </button>

              {activeMenuCommentId === comment.id && (
                <div className="community-comment-menu-dropdown">
                  <button
                    type="button"
                    onClick={() => {
                      setReplyTo(comment);
                      setEditingComment(null);
                      setEditContent("");
                      setActiveMenuCommentId(null);
                    }}
                  >
                    {t("communityComments.reply")}
                  </button>

                  {canManage && onUpdate && (
                    <button
                      type="button"
                      onClick={() => {
                        startEditing(comment);
                        setActiveMenuCommentId(null);
                      }}
                    >
                      {t("communityComments.edit")}
                    </button>
                  )}

                  {canManage && (
                    <button
                      type="button"
                      className="danger"
                      onClick={() => {
                        setActiveMenuCommentId(null);
                        void handleDelete(comment);
                      }}
                    >
                      {t("communityComments.delete")}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {isEditing ? (
            <form
              className="community-comment-edit-form"
              onSubmit={handleUpdate}
            >
              <textarea
                value={editContent}
                onChange={(event) =>
                  setEditContent(event.target.value)
                }
                rows={3}
                maxLength={2000}
                autoFocus
                disabled={isUpdating}
              />

              <div className="community-comment-edit-actions">
                <button
                  type="button"
                  className="community-comment-cancel"
                  onClick={cancelEditing}
                  disabled={isUpdating}
                >
                  {t("communityComments.cancel")}
                </button>

                <button
                  type="submit"
                  className="community-comment-save"
                  disabled={!editContent.trim() || isUpdating}
                >
                  {isUpdating
                    ? t("communityComments.saving")
                    : t("communityComments.save")}
                </button>
              </div>
            </form>
          ) : (
            <p className="community-comment-content">
              {comment.content}
            </p>
          )}

          {!isEditing && (
            <div className="community-comment-actions">
              <button
                type="button"
                className="community-comment-reply-button"
                onClick={() => {
                  setReplyTo(comment);
                  setEditingComment(null);
                  setEditContent("");
                  setActiveMenuCommentId(null);
                }}
              >
                {t("communityComments.reply")}
              </button>

              {canManage && onUpdate && (
                <button
                  type="button"
                  className="community-comment-edit-button"
                  onClick={() => startEditing(comment)}
                >
                  {t("communityComments.edit")}
                </button>
              )}

              {canManage && (
                <button
                  type="button"
                  className="community-comment-delete"
                  onClick={() => handleDelete(comment)}
                  disabled={isDeleting}
                >
                  {isDeleting
                    ? t("communityComments.deleting")
                    : t("communityComments.delete")}
                </button>
              )}
            </div>
          )}

          {comment.replies?.length > 0 && (
            <div className="community-comment-replies">
              {comment.replies.map((reply) =>
                renderComment(reply, true)
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section
      className={`community-comments ${
        variant === "details" ? "community-comments-details" : ""
      }`}
    >
      {variant !== "details" && (
        <div className="community-comments-title">
          <h3>{t("communityComments.title")}</h3>
          <span>{comments.length}</span>
        </div>
      )}

      {replyTo && (
        <div className="community-reply-indicator">
          <div>
            <span>{t("communityComments.replyTo")} </span>
            <strong>{replyTo.authorUsername}</strong>
          </div>

          <button
            type="button"
            onClick={() => setReplyTo(null)}
          >
            {t("communityComments.cancel")}
          </button>
        </div>
      )}

      <form
        className="community-comment-form"
        onSubmit={handleSubmit}
      >
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={
            replyTo
              ? t("communityComments.replyPlaceholder", {
                  username: replyTo.authorUsername,
                })
              : t("communityComments.placeholder")
          }
          rows={3}
          maxLength={2000}
          disabled={submitting}
        />

        <div className="community-comment-form-footer">
          <span>{content.length}/2000</span>

          <div className="community-comment-form-buttons">
            <button
              type="button"
              className="community-comment-cancel"
              onClick={handleCancelComposer}
              disabled={submitting}
            >
              {t("communityComments.discard")}
            </button>

            <button
              type="submit"
              disabled={!content.trim() || submitting}
            >
              {submitting
                ? t("communityComments.sending")
                : t("communityComments.send")}
            </button>
          </div>
        </div>
      </form>

      <div className="community-comments-list">
        {loading ? (
          <div className="community-comments-state">
            {t("communityComments.loading")}
          </div>
        ) : comments.length === 0 ? (
          <div className="community-comments-state">
            <span className="community-comments-empty-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p>{t("communityComments.empty")}</p>
            <span>{t("communityComments.firstComment")}</span>
          </div>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>
    </section>
  );
}

export default CommunityComments;
