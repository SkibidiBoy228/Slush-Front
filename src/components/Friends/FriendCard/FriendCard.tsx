import { useEffect, useRef, useState } from "react";
import type { FriendUser } from "../../../types/friends";
import "./FriendCard.css";

interface FriendCardProps {
  friend: FriendUser;
  onClick?: (friend: FriendUser) => void;
  onRemove?: (friend: FriendUser) => void;
  onBlock?: (friend: FriendUser) => void;
  showRemoveButton?: boolean;
}

function FriendCard({
  friend,
  onClick,
  onRemove,
  onBlock,
  showRemoveButton = false,
}: FriendCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const openProfile = () => {
    if (onClick) {
      onClick(friend);
    } else {
      window.location.href = `/profile/${encodeURIComponent(friend.username)}`;
    }
  };

  return (
    <article className="friend-card">
      <button
        type="button"
        className="friend-card-main"
        onClick={openProfile}
      >
        <span className="friend-card-avatar-wrapper">
          {friend.avatarUrl ? (
            <img
              className="friend-card-avatar"
              src={friend.avatarUrl}
              alt={friend.username}
            />
          ) : (
            <span className="friend-card-avatar friend-card-avatar-placeholder">
              {friend.username?.charAt(0).toUpperCase() || "?"}
            </span>
          )}

          <span
            className={`friend-card-online-dot ${
              friend.isOnline ? "online" : "offline"
            }`}
          />
        </span>

        <span className="friend-card-info">
          <strong className="friend-card-name">
            {friend.username}
          </strong>
        </span>
      </button>

      <div className="friend-card-actions">
        {typeof friend.level === "number" && (
          <span
            className="friend-card-level"
            title={`Рівень ${friend.level}`}
          >
            <span>{friend.level}</span>
          </span>
        )}

        {showRemoveButton && (
          <div className="friend-card-menu-wrapper" ref={menuRef}>
            <button
              type="button"
              className="friend-card-remove"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Меню друга"
              aria-expanded={menuOpen}
            >
              ⋯
            </button>

            {menuOpen && (
              <div className="friend-card-menu">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    openProfile();
                  }}
                >
                  Відкрити профіль
                </button>

                {onBlock && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onBlock(friend);
                    }}
                  >
                    Заблокувати
                  </button>
                )}

                {onRemove && (
                  <button
                    type="button"
                    className="friend-card-menu-danger"
                    onClick={() => {
                      setMenuOpen(false);
                      onRemove(friend);
                    }}
                  >
                    Видалити з друзів
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default FriendCard;