
import { useTranslation } from "react-i18next";
import "./CommunityTabs.css";

interface CommunityTabsProps {
  activeTab: "about" | "characteristics" | "community";
  onTabChange: (
    tab: "about" | "characteristics" | "community"
  ) => void;
}

function CommunityTabs({
  activeTab,
  onTabChange,
}: CommunityTabsProps) {
  const { t } = useTranslation();

  return (
    <nav className="community-tabs">
      <button
        className={activeTab === "about" ? "active" : ""}
        onClick={() => onTabChange("about")}
      >
        {t("communityTabs.about")}
      </button>

      <button
        className={
          activeTab === "characteristics" ? "active" : ""
        }
        onClick={() => onTabChange("characteristics")}
      >
        {t("communityTabs.characteristics")}
      </button>

      <button
        className={activeTab === "community" ? "active" : ""}
        onClick={() => onTabChange("community")}
      >
        {t("communityTabs.community")}
      </button>
    </nav>
  );
}

export default CommunityTabs;
