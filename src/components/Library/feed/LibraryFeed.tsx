
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getLibraryFeed } from "../../../api/library";
import type { CommunityPost } from "../../../types/library";

import FeedFilters, {
  type FeedSort,
  type FeedType,
} from "./FeedFilters";

import FeedPostCard from "./FeedPostCard";
import "./LibraryFeed.css";

type FeedSource = "subscriptions" | "library" | "recommended";

function LibraryFeed() {
  const { t } = useTranslation();

  const tabs: { label: string; value: FeedSource }[] = [
    { label: t("libraryFeed.subscriptions"), value: "subscriptions" },
    { label: t("libraryFeed.library"), value: "library" },
    { label: t("libraryFeed.recommended"), value: "recommended" },
  ];

  const [source, setSource] = useState<FeedSource>("recommended");
  const [type, setType] = useState<FeedType>("all");
  const [sort, setSort] = useState<FeedSort>("popular");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getLibraryFeed({
        source,
        type,
        sort,
        page: 1,
        pageSize: 10,
      });

      setPosts(result.items);
    } catch (err) {
      console.error("Не вдалося завантажити стрічку:", err);
      setError(t("libraryFeed.loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [source, type, sort, t]);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  return (
    <section className="library-feed">
      <div className="library-feed__top">
        <nav
          className="library-feed__tabs"
          aria-label={t("libraryFeed.sourceLabel")}
        >
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`library-feed__tab ${
                source === tab.value ? "library-feed__tab--active" : ""
              }`}
              onClick={() => setSource(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="library-feed__grid">
        <div className="library-feed__posts" aria-live="polite">
          {isLoading ? (
            <p className="library-feed__message">
              {t("libraryFeed.loading")}
            </p>
          ) : error ? (
            <div className="library-feed__message library-feed__message--error">
              <p>{error}</p>
              <button type="button" onClick={() => void loadFeed()}>
                {t("libraryFeed.retry")}
              </button>
            </div>
          ) : posts.length === 0 ? (
            <p className="library-feed__message">
              {t("libraryFeed.empty")}
            </p>
          ) : (
            posts.map((post) => (
              <FeedPostCard key={post.id} post={post} />
            ))
          )}
        </div>

        <FeedFilters
          type={type}
          sort={sort}
          onTypeChange={setType}
          onSortChange={setSort}
        />
      </div>
    </section>
  );
}

export default LibraryFeed;
