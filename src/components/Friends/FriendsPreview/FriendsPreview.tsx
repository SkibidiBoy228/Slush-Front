import { useEffect, useState } from "react";
import { getFriends } from "../../../api/friends";
import type { FriendUser } from "../../../types/friends";
import { useFriendPresence } from "../../../hooks/useFriendPresence";
import "./FriendsPreview.css";

interface FriendsPreviewProps {
  username: string;
}

type PresenceEvent = {
  userId: string;
  eventType: "Online" | "Offline" | "InGame" | "StoppedPlaying";
  timestamp?: string;
  gameId?: string | null;
  gameTitle?: string | null;
};

function applyPresence(
  friends: FriendUser[],
  event: PresenceEvent
): FriendUser[] {
  return friends.map((friend) => {
    if (friend.userId !== event.userId) {
      return friend;
    }

    switch (event.eventType) {
      case "Online":
        return {
          ...friend,
          isOnline: true,
          lastSeenAt: null,
        };

      case "Offline":
        return {
          ...friend,
          isOnline: false,
          lastSeenAt:
            event.timestamp ?? friend.lastSeenAt ?? null,
          currentGameId: null,
          currentGameTitle: null,
        };

      case "InGame":
        return {
          ...friend,
          isOnline: true,
          lastSeenAt: null,
          currentGameId: event.gameId ?? null,
          currentGameTitle: event.gameTitle ?? null,
        };

      case "StoppedPlaying":
        return {
          ...friend,
          isOnline: true,
          lastSeenAt: null,
          currentGameId: null,
          currentGameTitle: null,
        };

      default:
        return friend;
    }
  });
}

function FriendsPreview({ username }: FriendsPreviewProps) {
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [loading, setLoading] = useState(true);

  const { events } = useFriendPresence();

  useEffect(() => {
    if (!events.length) return;

    setFriends((current) =>
      events.reduce(
        (list, event) => applyPresence(list, event),
        current
      )
    );
  }, [events]);

  useEffect(() => {
    let cancelled = false;

    async function loadFriends() {
      try {
        setLoading(true);

        // Новый endpoint возвращает обычный массив FriendUser[].
        const response = await getFriends("all");

        if (!cancelled) {
          setFriends(response.slice(0, 6));
        }
      } catch (error) {
        console.error("Не вдалося завантажити друзів", error);

        if (!cancelled) {
          setFriends([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadFriends();

    return () => {
      cancelled = true;
    };
  }, [username]);

  const openProfile = (friendUsername: string) => {
    window.location.href = `/profile/${encodeURIComponent(
      friendUsername
    )}`;
  };

  return (
    <section className="friends-preview">
      <div className="friends-preview-header">
        <h2>Друзі</h2>

        <button
          type="button"
          className="friends-preview-all"
          onClick={() => {
            window.location.href = "/friends";
          }}
        >
          Усі
        </button>
      </div>

      {loading ? (
        <div className="friends-preview-loading">
          Завантаження...
        </div>
      ) : friends.length === 0 ? (
        <div className="friends-preview-empty">
          У користувача поки немає друзів
        </div>
      ) : (
        <div className="friends-preview-grid">
          {friends.map((friend) => (
            <button
              key={friend.userId}
              type="button"
              className="friend-preview-card"
              onClick={() => openProfile(friend.username)}
            >
              <span className="friend-preview-avatar-wrapper">
                {friend.avatarUrl ? (
                  <img
                    src={friend.avatarUrl}
                    alt={friend.username}
                    className="friend-preview-avatar"
                  />
                ) : (
                  <span className="friend-preview-avatar friend-preview-avatar-placeholder">
                    {friend.username?.charAt(0).toUpperCase() || "?"}
                  </span>
                )}

                <span
                  className={`friend-preview-status ${
                    friend.isOnline ? "online" : "offline"
                  }`}
                />
              </span>

              <span className="friend-preview-name">
                {friend.username}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default FriendsPreview;