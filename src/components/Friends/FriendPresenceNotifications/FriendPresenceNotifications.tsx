
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useFriendPresence } from "../../../hooks/useFriendPresence";
import "./FriendPresenceNotifications.css";

function FriendPresenceNotifications() {
  const { t } = useTranslation();
  const { events, clearEvent } = useFriendPresence();

  useEffect(() => {
    if (events.length === 0) return;

    const timers = events.map((event) =>
      window.setTimeout(() => {
        clearEvent(event.timestamp);
      }, 5000)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [events, clearEvent]);

  if (events.length === 0) return null;

  return (
    <div className="friend-presence-notifications">
      {events.map((event, index) => (
        <div
          className="friend-presence-notification"
          key={`${event.userId}-${event.timestamp}-${index}`}
        >
          <div className="friend-presence-notification-avatar">
            {event.avatarUrl ? (
              <img src={event.avatarUrl} alt={event.username} />
            ) : (
              event.username.charAt(0).toUpperCase()
            )}
          </div>

          <div className="friend-presence-notification-content">
            <strong>{event.username}</strong>
            <span>{event.statusText}</span>
          </div>

          <button
            type="button"
            onClick={() => clearEvent(event.timestamp)}
            aria-label={t("friendPresenceNotifications.close")}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default FriendPresenceNotifications;
