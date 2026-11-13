
import { useTranslation } from "react-i18next";

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

function FeedFilters({
  type,
  sort,
  onTypeChange,
  onSortChange,
}: FeedFiltersProps) {
  const { t } = useTranslation();

  const sections: { label: string; value: FeedType }[] = [
    { label: t("feedFilters.all"), value: "all" },
    { label: t("feedFilters.discussions"), value: "discussions" },
    { label: t("feedFilters.screenshots"), value: "screenshots" },
    { label: t("feedFilters.videos"), value: "videos" },
    { label: t("feedFilters.guides"), value: "guides" },
    { label: t("feedFilters.news"), value: "news" },
  ];

  return (
    <aside className="feed-filters">
      <label className="feed-filters__sort">
        <span>{t("feedFilters.sorting")}</span>

        <select
          value={sort}
          onChange={(event) =>
            onSortChange(event.target.value as FeedSort)
          }
        >
          <option value="popular">
            {t("feedFilters.popular")}
          </option>
          <option value="newest">
            {t("feedFilters.newest")}
          </option>
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
