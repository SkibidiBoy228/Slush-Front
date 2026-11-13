
import { useTranslation } from "react-i18next";
import type { FriendRequest } from "../../../types/friends";
import "./FriendRequestCard.css";

interface FriendRequestCardProps {
  request: FriendRequest;
  type: "incoming" | "outgoing";
  loading?: boolean;
  onAccept?: (request: FriendRequest) => void;
  onReject?: (request: FriendRequest) => void;
  onCancel?: (request: FriendRequest) => void;
}

function FriendRequestCard({
  request,
  type,
  loading = false,
  onAccept,
  onReject,
  onCancel,
}: FriendRequestCardProps) {
  const { t } = useTranslation();

  const username = request.user.username;
  const avatarUrl = request.user.avatarUrl;
  const level = request.user.level;

  const openProfile = () => {
    window.location.href = `/profile/${encodeURIComponent(username)}`;
  };

  return (
    <article className="friend-request-card">
      <button
        type="button"
        className="friend-request-user"
        onClick={openProfile}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username}
            className="friend-request-avatar"
          />
        ) : (
          <span className="friend-request-avatar friend-request-avatar-placeholder">
            {username?.charAt(0).toUpperCase() || "?"}
          </span>
        )}

        <span className="friend-request-user-info">
          <span className="friend-request-name-line">
            <strong>{username}</strong>

            {typeof level === "number" && (
              <span className="friend-request-level">
                {t("friendRequestCard.level", { level })}
              </span>
            )}
          </span>

          <span>
            {type === "incoming"
              ? t("friendRequestCard.incomingDescription")
              : t("friendRequestCard.outgoingDescription")}
          </span>
        </span>
      </button>

      {type === "incoming" ? (
        <div className="friend-request-actions">
          <button
            type="button"
            className="friend-request-accept"
            disabled={loading}
            onClick={() => onAccept?.(request)}
          >
            {t("friendRequestCard.accept")}
          </button>

          <button
            type="button"
            className="friend-request-reject"
            disabled={loading}
            onClick={() => onReject?.(request)}
          >
            {t("friendRequestCard.reject")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="friend-request-cancel"
          disabled={loading}
          onClick={() => onCancel?.(request)}
        >
          {t("friendRequestCard.cancel")}
        </button>
      )}
    </article>
  );
}

export default FriendRequestCard;
