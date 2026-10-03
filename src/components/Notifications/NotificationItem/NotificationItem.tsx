import type { Notification } from "../../../types/notifications";
import "./NotificationItem.css";

interface NotificationItemProps {
  notification: Notification;
  onRead?: (notification: Notification) => void;
}

function NotificationItem({
  notification,
  onRead,
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.isRead) {
      onRead?.(notification);
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case "FriendRequest":
        return "👥";

      case "FriendRequestAccepted":
        return "✓";

      case "FriendRequestRejected":
        return "✕";

      case "ProfileComment":
        return "💬";

      case "BigSale":
        return "🏷️";

      case "WishlistDiscount":
        return "❤️";

      case "ChatMessage":
        return "✉️";

      default:
        return "🔔";
    }
  };

  const formatDate = (date: string) => {
    const notificationDate = new Date(date);

    if (Number.isNaN(notificationDate.getTime())) {
      return date;
    }

    return notificationDate.toLocaleString("uk-UA", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <article
      className={`notification-item ${
        notification.isRead ? "is-read" : "is-unread"
      }`}
      onClick={handleClick}
    >
      <div className="notification-icon" aria-hidden="true">
        {getIcon()}
      </div>

      <div className="notification-content">
        <p className="notification-message">
          {notification.message}
        </p>

        <span className="notification-date">
          {formatDate(notification.createdAt)}
        </span>
      </div>

      {!notification.isRead && (
        <span
          className="notification-unread-dot"
          aria-label="Непрочитане"
        />
      )}
    </article>
  );
}

export default NotificationItem;