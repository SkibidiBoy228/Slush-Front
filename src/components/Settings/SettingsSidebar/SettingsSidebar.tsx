import "./SettingsSidebar.css";

export type SettingsSection = 
 | "general"
 | "notifications"
 | "password"
 | "wallet"
 | "delete-account";

interface SettingsSidebarProps {
    activeSection : SettingsSection;
    onSectionChange : (section : SettingsSection) => void;
}
interface SettingsMenuItem {
    id: SettingsSection;
    label: string;
    icon : string;
}

const menuItems: SettingsMenuItem[] = [
    {
        id: "general",
        label: "Загальні налаштування",
        icon: "⚙",
    },
    {
        id: "notifications",
        label: "Сповіщення",
        icon : "🔔"
    },
    {
        id: "password",
        label: "Пароль",
        icon: "🔒",
    },
    {
        id: "wallet",
        label: "Гаманець",
        icon : "💳",
    },
    {
        id: "delete-account",
        label: "Видалення акаунта",
        icon: "🗑",
    },
];

function SettingsSidebar({activeSection, onSectionChange,} : SettingsSidebarProps){
    return (
        <aside className="settings-sidebar">
            <div className="settings-sidebar-header">
                <h2>налаштування</h2>
            </div>
            <nav className="settings-sidebar-menu">
                {menuItems.map((item)=>(
                    <button key = {item.id}
                        type="button"
                        className={`settings-sidebar-item ${activeSection === item.id ? "settings-sidebar-item-active" : ""} `}
                        onClick={()=>onSectionChange(item.id)}>
                            <span className="settings-sidebar-icon">{item.icon}</span>

                            <span className="settings-sidebar-label">
                                {item.label}
                            </span>
                        </button>
                ))}
            </nav>
        </aside>
    )
}

export default SettingsSidebar;