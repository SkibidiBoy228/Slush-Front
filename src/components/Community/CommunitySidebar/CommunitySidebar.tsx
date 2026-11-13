
import { useTranslation } from "react-i18next";
import "./CommunitySidebar.css";

export type CommunityFilter =
  | "all"
  | "discussions"
  | "screenshots"
  | "videos"
  | "guides"
  | "news";

export type CommunitySort = "newest" | "popular";

interface CommunitySidebarProps {
  activeFilter: CommunityFilter;
  sort: CommunitySort;
  counts: {
    all: number;
    discussions: number;
    screenshots: number;
    videos: number;
    guides: number;
    news: number;
  };
  onFilterChange: (filter: CommunityFilter) => void;
  onSortChange: (sort: CommunitySort) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

function CommunitySidebar({
  activeFilter,
  sort,
  counts,
  onFilterChange,
  onSortChange,
  searchValue,
  onSearchChange,
}: CommunitySidebarProps) {
  const { t, i18n } = useTranslation();

  const localeMap: Record<string, string> = {
    uk: "uk-UA",
    en: "en-US",
    sk: "sk-SK",
    ru: "ru-RU",
  };

  const locale =
    localeMap[i18n.language.split("-")[0]] || "uk-UA";

  const filters = [
    { id: "all" as const, label: t("communitySidebar.all"), count: counts.all },
    { id: "discussions" as const, label: t("communitySidebar.discussions"), count: counts.discussions },
    { id: "screenshots" as const, label: t("communitySidebar.screenshots"), count: counts.screenshots },
    { id: "videos" as const, label: t("communitySidebar.videos"), count: counts.videos },
    { id: "guides" as const, label: t("communitySidebar.guides"), count: counts.guides },
    { id: "news" as const, label: t("communitySidebar.news"), count: counts.news },
  ];

  return (
    <aside className="community-sidebar">
      <div className="community-sidebar-top">
        <label className="community-sidebar-sort-label">
          <span>{t("communitySidebar.sorting")}</span>

          <select
            value={sort}
            onChange={(event) =>
              onSortChange(event.target.value as CommunitySort)
            }
          >
            <option value="popular">
              {t("communitySidebar.popular")}
            </option>
            <option value="newest">
              {t("communitySidebar.newest")}
            </option>
          </select>
        </label>

        <div className="community-sidebar-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>

          <input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("communitySidebar.searchPlaceholder")}
          />
        </div>
      </div>

      <div className="community-sidebar-section">
        <h3>{t("communitySidebar.all")}</h3>

        <div className="community-filter-list">
          {filters.map((filter) => (
            <button
              type="button"
              key={filter.id}
              className={`community-filter-item ${
                activeFilter === filter.id ? "active" : ""
              }`}
              onClick={() => onFilterChange(filter.id)}
            >
              <span>{filter.label}</span>

              <span className="community-filter-count">
                {filter.count.toLocaleString(locale)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default CommunitySidebar;
