import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import NotificationItem from "../../components/Notifications/NotificationItem/NotificationItem";
import{
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "../../api/notifications";
import type { Notification } from "../../types/notifications";
import './Notification.css';

function Notifications(){
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const loadNotifications = async () =>{
        try{
            setLoading(true);
            setError(null);
            const response = await getNotifications(1, 50);
            setNotifications(response.items);
        }catch(error){
            console.error("Не вдалося завантажити повідомлення:", error);
            setError("Не вдалося завантажити повідомлення.");
        }finally{
            setLoading(false);
        }
    };
    useEffect(()=>{
        void loadNotifications();
    }, []);
    const handleMarkAsRead = async (notification: Notification) =>{
        if(notification.isRead){
            return;
        }
        try{
            await markNotificationAsRead(notification.id);
            setNotifications((previous)=>previous.map((item)=>item.id === notification.id ? {...item, isRead: true} : item
                )
            );
        }catch(error){
            console.error("Не вдалося позначити повідомлення як прочитане:", error);
        }
    }
    const handleMarkAllAsRead = async () =>{
        const hasUnread = notifications.some(
            (notification) => !notification.isRead
        );
        if(!hasUnread || actionLoading){
            return;
        }
        try{
            setActionLoading(true);
            await markAllNotificationsAsRead();
            setNotifications((previous)=> previous.map((notification) =>({
                ...notification,
                isRead:true,
                }))
            );
        }catch(error){
            console.error("Не вдалося позначити всі повідомлення як прочитані:", error);
        }finally{
            setActionLoading(false);
        }
    }
    const unreadCount = notifications.filter((notification) => !notification.isRead).length;

    return(
        <>
            <Header/>
            <main className="notifications-page">
                <div className="notifications-container">
                    <div className="notifications-header">
                        <div>
                            <h1>Повідомлення</h1>
                            {unreadCount > 0 && (
                                <span>
                                    Непрочитанних: {unreadCount}
                                </span>
                            )}
                        </div>
                        <button type="button"
                            className="notifications-read-all"
                            onClick={handleMarkAllAsRead}
                            disabled={unreadCount === 0 || actionLoading}
                        >
                            Прочитати всі
                        </button>
                    </div>
                    <section className="notifications-list">
                        {loading ? (
                            <div className="notifications-state">
                                Завантаження повідомлення...
                            </div>
                        ): error ? (
                            <div className="notifications-state notifications-error">
                                {error}
                                <button type="button"
                                    onClick={()=>void loadNotifications()}
                                >
                                    Повторити
                                </button>
                            </div>
                        ): notifications.length === 0 ? (
                            <div className="notifications-state">
                                Повідомлень поки немає
                            </div>
                        ) : (
                            notifications.map((notification) =>(
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onRead={handleMarkAsRead}
                                />
                            ))
                        )} 
                    </section>
                </div>
            </main>
            <Footer/>
        </>
    )
}
export default Notifications;