
import "./CommunityTabs.css";

interface CommunityTabsProps{
    activeTab: "about" | "characteristics" | "community";
    onTabChange:(tab: "about" | "characteristics" | "community") => void;
}

function CommunityTabs({
    activeTab,
    onTabChange,
}: CommunityTabsProps){
    return(
        <nav className="community-tabs">
            <button className={activeTab === "about" ? "active": ""} onClick={()=>onTabChange("about")}>
                Про гру
            </button>
            <button className={activeTab === "characteristics" ? "active" : ""} onClick={()=>onTabChange("characteristics")}>
                Характеристики
            </button>
            <button className={activeTab === "community" ? "active" : ""} onClick={()=> onTabChange("community")}>
                Спільнота
            </button>
        </nav>
    )
}
export default CommunityTabs;