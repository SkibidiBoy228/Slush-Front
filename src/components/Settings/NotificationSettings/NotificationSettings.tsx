import { useEffect, useState } from "react";

import { getNotificationSettings, updateNotificationSettings } from "../../../api/settings";

import type { NotificationSettings as NotificationSettingsData } from "../../../types/settings";

import "./NotificationSettings.css";
interface NotificationItemProps{
    title: string,
    checked : boolean,
    onChange: (value: boolean) =>void;
}
function NotificationItem({
    title,
    checked,
    onChange,
}: NotificationItemProps) {
    return (
        <div className="notification-settings-item">
            <span>{title}</span>
            <button type="button"
                className={`notification-switch ${checked ? "notification-switch-active" :""}`}
                onClick={()=>onChange(!checked)}
                aria-pressed={checked}
            >
                <span className="notification-switch-thumb"></span>
            </button>
        </div>
    )
}

function NotificationSettings(){
    const [settings, setSettings] = useState<NotificationSettingsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving,setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    useEffect(()=>{
        loadSettings();
    }, []);
    async function loadSettings() {
        try{
            setLoading(true);
            setError("");
            const data= await getNotificationSettings();
            setSettings(data);
        }catch(err){
            if(err instanceof Error){
                setError(err.message);
            }else{
                setError("Не вдалося завантажити налаштування")
            }
        }finally{
            setLoading(false);
        }
    }
    async function handleChange(key:keyof NotificationSettingsData, value: boolean) {
        if(!settings) return;
        const updated = {
            ...settings,
            [key]: value,
        };
        setSettings(updated);
        setMessage("");
        setError("");
        try{
            setSaving(true);
            await updateNotificationSettings(updated);
            setMessage("Налаштування збережено.");
        }catch{
            setError("Не вдалося зберегти налаштування.");
        }finally{
            setSaving(false);
        }
    }
    if(loading){
        return(
            <section className="notification-settings">
                <div className="notification-settings-loading">
                    Завантаження...
                </div>
            </section>
        );
    }
    if(!settings){
        return(
            <section className="notification-settings">
                <div className="notification-settings-error">
                    {error || "Не вдалося завантажити налаштування."}
                </div>
            </section>
        )
    }
    return (
        <section className="notification-settings">
            <div className="notification-settings-header">
                <h1>Сповіщення</h1>
                <p>Керуйте сповіщеннями та звуками</p>
            </div>
            <div className="motification-settings-card">
                <h2>Беззвучні сповіщення</h2>
                <NotificationItem
                    title = "Великий розпродаж"
                    checked = {settings.bigSale}
                    onChange={(value)=>handleChange("bigSale", value)}
                />
                <NotificationItem
                    title="Знижка на ігри з мого Бажаного"
                    checked = {settings.wishlistDiscount}
                    onChange={(value)=>handleChange("wishlistDiscount", value)}
                />
                <NotificationItem title = "Новий коментар під моїм профілем"
                    checked={settings.profileComment}
                    onChange={(value)=>handleChange("profileComment", value)}
                />
                <NotificationItem title="Новий запит на дружбу"
                    checked ={settings.friendRequest}
                    onChange={(value)=>handleChange("friendRequest", value)}
                />
                <NotificationItem
                title="Мій запит на дружбу прийнято"
                checked={settings.friendRequestAccepted}
                onChange={(value) =>
                    handleChange("friendRequestAccepted", value)
                }
                />

                <NotificationItem
                title="Мій запит на дружбу відхилено"
                checked={settings.friendRequestRejected}
                onChange={(value) =>
                    handleChange("friendRequestRejected", value)
                }
                />
            </div>
                <div className="notification-settings-card notification-settings-chat">
            <h2>Чат</h2>

            <div className="notification-settings-chat-header">
            <span />
            <span>Сповіщення</span>
            <span>Звук</span>
            </div>

            <div className="notification-settings-chat-row">
            <span>Нове повідомлення у чаті</span>

            <button
                type="button"
                disabled={saving}
                className={`notification-switch ${
                settings.chatMessageNotification
                    ? "notification-switch-active"
                    : ""
                }`}
                onClick={() =>
                handleChange(
                    "chatMessageNotification",
                    !settings.chatMessageNotification
                )
                }
            >
                <span className="notification-switch-thumb" />
            </button>

            <button
                type="button"
                disabled={saving}
                className={`notification-switch ${
                settings.chatMessageSound
                    ? "notification-switch-active"
                    : ""
                }`}
                onClick={() =>
                handleChange(
                    "chatMessageSound",
                    !settings.chatMessageSound
                )
                }
            >
                <span className="notification-switch-thumb" />
            </button>
            </div>
        </div>

        {(message || error) && (
            <div
            className={
                error
                ? "notification-settings-message notification-settings-message-error"
                : "notification-settings-message notification-settings-message-success"
            }
            >
            {error || message}
            </div>
        )}
        </section>
    )
}
export default NotificationSettings;