import { useEffect, useState } from "react";

import {
    getNotifications,
    getUnreadNotificationsCount,
    markAllNotificationsAsRead,
    markNotificationAsRead
} from "../../../api/notifications";
import type { Notification } from "../../../types/notifications";
import "./NotificationBell.css";

function NotificationBell(){
    const [notifications,setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const loadUnreadCount = async () =>{
        try{
            const count = await getUnreadNotificationsCount();
            setUnreadCount(count);
        }catch(error){
            console.error("Не вдалося отримати кількість непрочитаних повідомлень", error);
        }
    };
    const loadNotification = async () => {
        try{
            setLoading(true);
            const response = await getNotifications(1,5);
            setNotifications(response.items);
        }catch(error){
            console.error("Не вдалося отримати повідомлення:", error);
        }finally{
            setLoading(false);
        }
    }
    useEffect(()=>{
        void loadUnreadCount;
    },[]);
    useEffect(()=>{
        if(!isOpen){
            return;
        }
        void loadNotification();
    }, [isOpen]);
    const handleToogle = () =>{
        setIsOpen((previous)=> !previous);
    };
    const handleNotificationClick = async (
        notification: Notification
    )=>{
        if(notification.isRead){
            return;
        }
        try{
            await markNotificationAsRead(notification.id);
            setNotifications((previous)=>previous.map((item)=> item.id === notification.id
            ? {...item, isRead: true} : item
        ));
        setUnreadCount((previous)=>Math.max(0, previous -1));
        }catch(error){
            console.error("Не вдалося позначити повідомлення як прочитане:", error);
        }
    }
    const handleMarkAllAsRead = async () =>{
        if(unreadCount === 0){
            return;
        }
        try{
            await markAllNotificationsAsRead();
            setNotifications((previous)=>previous.map((notification)=>({
                    ...notification,
                    isRead: true,
                }))
            );
            setUnreadCount(0);
        }catch(error){
            console.error("Не вдалося позначити повідомлення як прочитані:", error);
        }
    }
    const handleOpenAll = () =>{
        window.location.href = "/notifications";
    }
    return (
        <div className="notification-bell-wrapper">
            <button type="button"
                className="notification-bell-button"
                onClick={handleToogle}
                aria-label="Повідомлення"
                aria-expanded = {isOpen}
                >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    >
                    <path
                        d="M18 9.5C18 6.46 15.76 4 12 4C8.24 4 6 6.46 6 9.5C6 14 4 16 3 17H21C20 16 18 14 18 9.5Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    <path
                        d="M10 20H14"
                        stroke="currentColor"
                        strokeWidth="1.7"
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
                            <strong>Повідомлення</strong>
                            <button type="button"
                                onClick={handleMarkAllAsRead}
                                disabled={unreadCount === 0}
                                >
                                    Прочитати все
                                </button>
                        </div>
                        <div className="notification-dropdown-list">
                            {loading ? (
                                <div className="notification-dropdown-empty">
                                    Завантаження...
                                </div>
                            ): (
                                notifications.map((notification) => (
                                    <button type="button"
                                        className={`notification-dropdown-list ${notification.isRead ? "is-read" : "is-unread"}`}
                                        key={notification.id}
                                        onClick={()=>handleNotificationClick(notification)}
                                        >
                                            <span className="notification-dropdown-icon">
                                                {notification.type === "FriendRequest"
                                                    ? "👥" : notification.type === "FriendRequestAccepted" ? "✓"
                                                        : notification.type ===
                                                            "FriendRequestRejected" ? "✕"
                                                            : notification.type === "ProfileComment"
                                                            ? "💬" : notification.type === "BigSale"
                                                                ? "🏷️" : notification.type === "WishlistDiscount"
                                                                    ? "❤️" : notification.type === "ChatMessage"
                                                                        ? "✉️" : "🔔"
                                                }
                                            </span>
                                            <span className="notification-dropdown-content">
                                                <span className="notification-dropdown-message">
                                                    {notification.message}
                                                </span>
                                                <span className="notification-dropdown-date">
                                                    {new Date(notification.createdAt).toLocaleString("uk-UA",{
                                                        day: "numeric",
                                                        month: "short",
                                                        hour:"2-digit",
                                                        minute:"2-digit",
                                                    })}
                                                </span>
                                            </span>
                                            {!notification.isRead && (
                                                <span className="notification-dropdown-dot"/>
                                            )}
                                        </button>
                                ))
                            )}
                        </div>
                        <button type="button"
                            className="notification-dropdown-footer"
                            onClick={handleOpenAll}
                        >Усі повідомлення →</button>
                    </div>
                )}
        </div>
    )
}
export default NotificationBell;