import type { FriendUser } from "../../../types/friends";
import "./FriendCard.css";

interface FriendCardProps {
  friend: FriendUser;
  onClick?: (friend: FriendUser) => void;
  onRemove?: (friend: FriendUser) => void;
  showRemoveButton?: boolean;
}

function FriendCard({
  friend,
  onClick,
  onRemove,
  showRemoveButton = false,
}: FriendCardProps) {
  const openProfile = () => {
    if (onClick) {
      onClick(friend);
      return;
    }

    window.location.href = `/profile/${encodeURIComponent(
      friend.username
    )}`;
  };

  return (
    <article className="friend-card">
      <button
        type="button"
        className="friend-card-main"
        onClick={openProfile}
      >
        <div className="friend-card-avatar-wrapper">
          {friend.avatarUrl ? (
            <img
              className="friend-card-avatar"
              src={friend.avatarUrl}
              alt={friend.username}
            />
          ) : (
            <div className="friend-card-avatar friend-card-avatar-placeholder">
              {friend.username.charAt(0).toUpperCase()}
            </div>
          )}

          <span
            className={`friend-card-online-dot ${
              friend.isOnline ? "online" : "offline"
            }`}
          />
        </div>

        <div className="friend-card-info">
          <strong>{friend.username}</strong>

          <span>
            {friend.isOnline
              ? "В мережі"
              : friend.lastSeenAt
                ? `Був у мережі ${new Date(
                    friend.lastSeenAt
                  ).toLocaleString("uk-UA", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Не в мережі"}
          </span>
        </div>
      </button>

      {showRemoveButton && (
        <button
          type="button"
          className="friend-card-remove"
          onClick={() => onRemove?.(friend)}
          aria-label={`Видалити ${friend.username} з друзів`}
          title="Видалити з друзів"
        >
          ⋯
        </button>
      )}
    </article>
  );
}

export default FriendCard;