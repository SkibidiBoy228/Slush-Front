
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import "./SettingsSidebar.css";

export type SettingsSection =
  | "general"
  | "notifications"
  | "password"
  | "wallet"
  | "delete-account";

type Theme = "dark" | "light";

interface SettingsSidebarProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

interface SettingsMenuItem {
  id: SettingsSection;
  labelKey: string;
  icon: string;
}

const menuItems: SettingsMenuItem[] = [
  {
    id: "general",
    labelKey: "settingsSidebar.general",
    icon: "♙",
  },
  {
    id: "notifications",
    labelKey: "settingsSidebar.notifications",
    icon: "♧",
  },
  {
    id: "password",
    labelKey: "settingsSidebar.password",
    icon: "♙",
  },
  {
    id: "wallet",
    labelKey: "settingsSidebar.wallet",
    icon: "▣",
  },
  {
    id: "delete-account",
    labelKey: "settingsSidebar.deleteAccount",
    icon: "♧",
  },
];

const THEME_STORAGE_KEY = "slush_theme";

function getInitialTheme(): Theme {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    return savedTheme === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function SettingsSidebar({
  activeSection,
  onSectionChange,
}: SettingsSidebarProps) {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Тема продолжит работать до перезагрузки страницы.
    }
  }, [theme]);

  const filteredItems = menuItems.filter((item) =>
    t(item.labelKey)
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  const toggleTheme = () => {
    setTheme((current) =>
      current === "dark" ? "light" : "dark"
    );
  };

  return (
    <aside className="settings-sidebar">
      <input
        className="settings-sidebar-search"
        type="text"
        placeholder={t("settingsSidebar.search")}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label={t("settingsSidebar.search")}
      />

      <div className="settings-sidebar-theme">
        <span className="settings-sidebar-theme-label">
          <span className="settings-sidebar-theme-icon">
            {theme === "dark" ? "☾" : "☀"}
          </span>

          {theme === "dark"
            ? t("settingsSidebar.darkTheme")
            : t("settingsSidebar.lightTheme")}
        </span>

        <button
          type="button"
          className={`settings-sidebar-theme-switch ${
            theme === "light"
              ? "settings-sidebar-theme-switch-active"
              : ""
          }`}
          onClick={toggleTheme}
          role="switch"
          aria-checked={theme === "light"}
          aria-label={t("settingsSidebar.toggleTheme")}
          title={t("settingsSidebar.toggleTheme")}
        >
          <span className="settings-sidebar-theme-thumb" />
        </button>
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
              {t(item.labelKey)}
            </span>
          </button>
        ))}

        {filteredItems.length === 0 && (
          <p className="settings-sidebar-empty">
            {t("settingsSidebar.noResults")}
          </p>
        )}
      </nav>
    </aside>
  );
}

export default SettingsSidebar;
