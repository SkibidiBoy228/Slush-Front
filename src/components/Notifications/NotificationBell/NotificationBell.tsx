import { useEffect, useState } from "react";

import {
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../../api/notifications";

import type { Notification } from "../../../types/notifications";

import "./NotificationBell.css";

function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationsCount();
      setUnreadCount(count);
    } catch (error) {
      console.error(
        "Не удалось получить количество непрочитанных уведомлений:",
        error
      );
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const response = await getNotifications(1, 5);

      setNotifications(response.items);

      // На всякий случай синхронизируем счётчик
      // с актуальным API.
      await loadUnreadCount();
    } catch (error) {
      console.error(
        "Не удалось получить уведомления:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUnreadCount();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void loadNotifications();
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((previous) => !previous);
  };

  const handleNotificationClick = async (
    notification: Notification
  ) => {
    if (notification.isRead) {
      return;
    }

    try {
      await markNotificationAsRead(notification.id);

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id
            ? { ...item, isRead: true }
            : item
        )
      );

      setUnreadCount((previous) =>
        Math.max(0, previous - 1)
      );
    } catch (error) {
      console.error(
        "Не удалось отметить уведомление как прочитанное:",
        error
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      await markAllNotificationsAsRead();

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Не удалось отметить уведомления как прочитанные:",
        error
      );
    }
  };

  const handleOpenAll = () => {
    window.location.href = "/notifications";
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
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

  return (
    <div className="notification-bell-wrapper">
      <button
        type="button"
        className="notification-bell-button"
        onClick={handleToggle}
        aria-label="Уведомления"
        title="Уведомления"
        aria-expanded={isOpen}
      >
        <svg
          className="notification-bell-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M18 8C18 4.686 15.314 2 12 2C8.686 2 6 4.686 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M10 21H14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="notification-bell-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h3>Повідомлення</h3>

            <button
              type="button"
              className="notification-mark-all"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Прочитати все
            </button>
          </div>

          <div className="notification-dropdown-list">
            {loading ? (
              <div className="notification-dropdown-state">
                Завантаження...
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-dropdown-state">
                Повідомлень поки немає
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={`notification-dropdown-item ${
                    notification.isRead
                      ? "is-read"
                      : "is-unread"
                  }`}
                  onClick={() =>
                    void handleNotificationClick(notification)
                  }
                >
                  <span className="notification-dropdown-icon">
                    {getNotificationIcon(notification.type)}
                  </span>

                  <span className="notification-dropdown-content">
                    <span className="notification-dropdown-message">
                      {notification.message}
                    </span>

                    <span className="notification-dropdown-date">
                      {new Date(
                        notification.createdAt
                      ).toLocaleString("uk-UA", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </span>

                  {!notification.isRead && (
                    <span className="notification-dropdown-dot" />
                  )}
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            className="notification-dropdown-footer"
            onClick={handleOpenAll}
          >
            Усі повідомлення →
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;