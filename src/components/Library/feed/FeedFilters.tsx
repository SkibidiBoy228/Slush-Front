
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
          <option value="rating">Популярні</option>
          <option value="newest">Нові</option>
        </select>
      </label>

      <label className="feed-filters__search">
        <span className="feed-filters__visually-hidden">
          Пошук розділів
        </span>
        <input
          type="search"
          placeholder="Пошук: Усі розділи"
          onChange={(event) => {
            const query = event.target.value.trim().toLocaleLowerCase();

            const matchingSection = sections.find((section) =>
              section.label.toLocaleLowerCase().includes(query)
            );

            if (query && matchingSection) {
              onTypeChange(matchingSection.value);
            } else if (!query) {
              onTypeChange("all");
            }
          }}
        />
      </label>

      <nav className="feed-filters__sections" aria-label="Розділи ленти">
        {sections.map((section) => (
          <button
            key={section.value}
            type="button"
            className={`feed-filters__section ${
              type === section.value
                ? "feed-filters__section--active"
                : ""
            }`}
            onClick={() => onTypeChange(section.value)}
          >
            {section.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default FeedFilters;
