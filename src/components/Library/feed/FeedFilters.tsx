import "./FeedFilters.css";

export type FeedType =
  | "all"
  | "discussions"
  | "screenshots"
  | "videos"
  | "guides"
  | "news";

export type FeedSort = "newest" | "popular";

interface FeedFiltersProps {
  type: FeedType;
  sort: FeedSort;
  onTypeChange: (type: FeedType) => void;
  onSortChange: (sort: FeedSort) => void;
}

const sections: { label: string; value: FeedType }[] = [
  { label: "Усі розділи", value: "all" },
  { label: "Форум", value: "discussions" },
  { label: "Скріншоти", value: "screenshots" },
  { label: "Відео", value: "videos" },
  { label: "Гайди", value: "guides" },
  { label: "Новини", value: "news" },
];

function FeedFilters({
  type,
  sort,
  onTypeChange,
  onSortChange,
}: FeedFiltersProps) {
  return (
    <aside className="feed-filters">
      <label className="feed-filters__sort">
        <span>Сортування:</span>

        <select
          value={sort}
          onChange={(event) =>
            onSortChange(event.target.value as FeedSort)
          }
        >
          <option value="popular">Популярні</option>
          <option value="newest">Нові</option>
        </select>
      </label>

      <div className="feed-filters__sections">
        {sections.map((section) => (
          <button
            key={section.value}
            type="button"
            className={
              type === section.value
                ? "feed-filters__section feed-filters__section--active"
                : "feed-filters__section"
            }
            onClick={() => onTypeChange(section.value)}
            aria-pressed={type === section.value}
          >
            {section.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

export default FeedFilters;