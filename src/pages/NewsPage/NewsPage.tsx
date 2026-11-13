
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getAggregatedNews } from "../../api/news";
import type { SteamNewsItem } from "../../types/news";

import "./NewsPage.css";

const PAGE_SIZE = 12;

function getNewsDate(
  news: SteamNewsItem,
  locale: string
): string {
  if (news.dateFormatted) {
    return news.dateFormatted;
  }

  const date = new Date(news.date);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function cleanContents(contents: string): string {
  return contents
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?p>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function NewsPage() {
  const { t, i18n } = useTranslation();

  const [news, setNews] = useState<SteamNewsItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const localeMap: Record<string, string> = {
    uk: "uk-UA",
    en: "en-US",
    sk: "sk-SK",
    ru: "ru-RU",
  };

  const locale =
    localeMap[i18n.resolvedLanguage ?? "uk"] ?? "uk-UA";

  useEffect(() => {
    let isActive = true;

    async function loadNews() {
      setLoading(true);
      setError("");

      try {
        const response = await getAggregatedNews({
          page,
          pageSize: PAGE_SIZE,
        });

        if (!isActive) return;

        setNews(response.items ?? []);
        setTotalCount(response.totalCount ?? 0);
      } catch (err) {
        if (!isActive) return;

        setError(
          err instanceof Error
            ? err.message
            : t("news.loadError")
        );
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadNews();

    return () => {
      isActive = false;
    };
  }, [page, t]);

  function changePage(nextPage: number) {
    if (
      nextPage < 1 ||
      nextPage > totalPages ||
      nextPage === page
    ) {
      return;
    }

    setPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div className="news-page">
      <main>
        <div className="news-container">
          <section className="news-heading">
            <div className="news-heading-label">
              <span className="news-heading-line" />
              <span>SLUSH COMMUNITY</span>
            </div>

            <h1>
              {t("news.headingFirst")}{" "}
              <span>{t("news.headingSecond")}</span>
            </h1>

            <p>{t("news.description")}</p>
          </section>

          <div className="news-section-heading">
            <div>
              <h2>{t("news.latest")}</h2>

              <span className="news-section-subtitle">
                {t("news.subtitle")}
              </span>
            </div>

            {!loading && !error && (
              <span className="news-count">
                {t("news.publications", {
                  count: totalCount,
                })}
              </span>
            )}
          </div>

          {loading ? (
            <div className="news-message">
              <div className="news-loader" />
              <span>{t("news.loading")}</span>
            </div>
          ) : error ? (
            <div className="news-message error">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setPage((current) => current)}
              >
                {t("news.retry")}
              </button>
            </div>
          ) : news.length === 0 ? (
            <div className="news-message">
              {t("news.empty")}
            </div>
          ) : (
            <>
              <section className="news-grid">
                {news.map((item) => (
                  <article className="news-card" key={item.id}>
                    <div className="news-card-image">
                      {item.gameImage ? (
                        <img
                          src={item.gameImage}
                          alt={item.gameTitle || "Game"}
                          loading="lazy"
                        />
                      ) : (
                        <div className="news-image-placeholder">
                          SLUSH
                        </div>
                      )}

                      <span className="news-game-label">
                        {item.gameTitle || "Gaming"}
                      </span>
                    </div>

                    <div className="news-card-content">
                      <div className="news-card-meta">
                        <span>{getNewsDate(item, locale)}</span>

                        {item.feedLabel && (
                          <>
                            <span className="news-meta-dot">•</span>
                            <span>{item.feedLabel}</span>
                          </>
                        )}
                      </div>

                      <h3>{item.title}</h3>

                      <p className="news-card-description">
                        {cleanContents(item.contents) ||
                          t("news.readForDetails")}
                      </p>

                      <div className="news-card-footer">
                        <span className="news-author">
                          {item.author || item.gameTitle}
                        </span>

                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="news-read-more"
                          >
                            {t("news.read")}
                            <span>↗</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </section>

              {totalPages > 1 && (
                <nav
                  className="news-pagination"
                  aria-label={t("news.pagination")}
                >
                  <button
                    type="button"
                    className="news-page-arrow"
                    disabled={page === 1}
                    onClick={() => changePage(page - 1)}
                    aria-label={t("news.previousPage")}
                  >
                    ←
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  )
                    .filter((pageNumber) => {
                      return (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        Math.abs(pageNumber - page) <= 1
                      );
                    })
                    .map((pageNumber, index, pages) => (
                      <span
                        className="news-page-item"
                        key={pageNumber}
                      >
                        {index > 0 &&
                          pageNumber - pages[index - 1] > 1 && (
                            <span className="news-page-dots">
                              ...
                            </span>
                          )}

                        <button
                          type="button"
                          className={
                            pageNumber === page
                              ? "active"
                              : ""
                          }
                          aria-current={
                            pageNumber === page
                              ? "page"
                              : undefined
                          }
                          onClick={() => changePage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </span>
                    ))}

                  <button
                    type="button"
                    className="news-page-arrow"
                    disabled={page === totalPages}
                    onClick={() => changePage(page + 1)}
                    aria-label={t("news.nextPage")}
                  >
                    →
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default NewsPage;
