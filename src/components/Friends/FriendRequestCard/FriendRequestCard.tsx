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
  const openProfile = () => {
    window.location.href = `/profile/${encodeURIComponent(
      request.user.username
    )}`;
  };

  return (
    <article className="friend-request-card">
      <button
        type="button"
        className="friend-request-user"
        onClick={openProfile}
      >
        {request.user.avatarUrl ? (
          <img
            src={request.user.avatarUrl}
            alt={request.user.username}
            className="friend-request-avatar"
          />
        ) : (
          <div className="friend-request-avatar friend-request-avatar-placeholder">
            {request.user.username.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="friend-request-user-info">
          <strong>{request.user.username}</strong>

          <span>
            {type === "incoming"
              ? "Хоче додати вас у друзі"
              : "Запит надіслано"}
          </span>
        </div>
      </button>

      {type === "incoming" ? (
        <div className="friend-request-actions">
          <button
            type="button"
            className="friend-request-accept"
            disabled={loading}
            onClick={() => onAccept?.(request)}
          >
            ✓ Прийняти
          </button>

          <button
            type="button"
            className="friend-request-reject"
            disabled={loading}
            onClick={() => onReject?.(request)}
          >
            ✕ Відхилити
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="friend-request-cancel"
          disabled={loading}
          onClick={() => onCancel?.(request)}
        >
          Скасувати
        </button>
      )}
    </article>
  );
}

export default FriendRequestCard;