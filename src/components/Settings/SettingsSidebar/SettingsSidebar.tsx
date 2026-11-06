
import { useState } from "react";
import "./SettingsSidebar.css";

export type SettingsSection =
  | "general"
  | "notifications"
  | "password"
  | "wallet"
  | "delete-account";

interface SettingsSidebarProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

interface SettingsMenuItem {
  id: SettingsSection;
  label: string;
  icon: string;
}

const menuItems: SettingsMenuItem[] = [
  {
    id: "general",
    label: "Загальні налаштування",
    icon: "♙",
  },
  {
    id: "notifications",
    label: "Сповіщення",
    icon: "♧",
  },
  {
    id: "password",
    label: "Пароль",
    icon: "♙",
  },
  {
    id: "wallet",
    label: "Гаманець",
    icon: "▣",
  },
  {
    id: "delete-account",
    label: "Видалення акаунта",
    icon: "♧",
  },
];

function SettingsSidebar({
  activeSection,
  onSectionChange,
}: SettingsSidebarProps) {
  const [search, setSearch] = useState("");

  const filteredItems = menuItems.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="settings-sidebar">
      <input
        className="settings-sidebar-search"
        type="text"
        placeholder="Пошук налаштувань..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="settings-sidebar-theme">
        <span className="settings-sidebar-theme-label">
          <span className="settings-sidebar-theme-icon">☾</span>
          Темна тема
        </span>

        <span className="settings-sidebar-theme-switch" />
      </div>

      <nav className="settings-sidebar-menu">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`settings-sidebar-item ${
              activeSection === item.id
                ? "settings-sidebar-item-active"
                : ""
            }`}
            onClick={() => onSectionChange(item.id)}
          >
            <span className="settings-sidebar-icon">
              {item.icon}
            </span>

            <span className="settings-sidebar-label">
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default SettingsSidebar;
