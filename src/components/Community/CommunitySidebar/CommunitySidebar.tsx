
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
  const filters = [
    { id: "all" as const, label: "Усі", count: counts.all },
    { id: "discussions" as const, label: "Форум", count: counts.discussions },
    { id: "screenshots" as const, label: "Скріншоти", count: counts.screenshots },
    { id: "videos" as const, label: "Відео", count: counts.videos },
    { id: "guides" as const, label: "Гайди", count: counts.guides },
    { id: "news" as const, label: "Новини", count: counts.news },
  ];

  return (
    <aside className="community-sidebar">
      <div className="community-sidebar-section">
        <h3>Сортування</h3>

        <div className="community-sort-list">
          <button
            type="button"
            className={sort === "newest" ? "active" : ""}
            onClick={() => onSortChange("newest")}
          >
            Нові
          </button>

          <button
            type="button"
            className={sort === "popular" ? "active" : ""}
            onClick={() => onSortChange("popular")}
          >
            Популярні
          </button>
        </div>
      </div>

      <div className="community-sidebar-search">
        <input
          type="text"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Пошук: Усі розділи"
        />
      </div>

      <div className="community-sidebar-section">
        <h3>Усі розділи</h3>

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
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default CommunitySidebar;
