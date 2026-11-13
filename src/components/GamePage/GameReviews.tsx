
import { useTranslation } from "react-i18next";
import type { GameReview } from "../../types/game";

interface GameReviewsProps {
  reviews: GameReview[];
  averageRating: number;
}

function GameReviews({
  reviews,
  averageRating,
}: GameReviewsProps) {
  const { t } = useTranslation();

  return (
    <section className="game-reviews-section">
      <div className="section-title-row">
        <h2>{t("gameReviews.title")}</h2>

        <button className="outline-button">
          {t("gameReviews.writeReview")}
        </button>
      </div>

      <div className="reviews-toolbar">
        <span>
          {t("gameReviews.averageRating")}:{" "}
          <strong>{averageRating.toFixed(1)}</strong>
        </span>

        <button className="review-sort">
          {t("gameReviews.sorting")}: {t("gameReviews.popularFirst")} ▾
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="empty-reviews">
          {t("gameReviews.empty")}
        </div>
      ) : (
        <div className="reviews-grid">
          {reviews.map((review, index) => (
            <article
              className="review-card"
              key={`${review.username}-${index}`}
            >
              <div className="review-header">
                <div className="review-avatar">
                  {review.username.charAt(0).toUpperCase()}
                </div>

                <div className="review-author">
                  <strong>{review.username}</strong>

                  <div className="review-stars">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <span
                        key={starIndex}
                        className={
                          starIndex < review.score ? "filled" : ""
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  className="review-more"
                  aria-label={t("gameReviews.moreActions")}
                >
                  •••
                </button>
              </div>

              <p className="review-text">
                {review.text || t("gameReviews.noReviewText")}
              </p>

              <div className="review-footer">
                <div className="review-reactions">
                  <button>♡ 0</button>
                  <button>◌ 0</button>
                </div>

                <span>{review.date}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {reviews.length > 0 && (
        <button className="show-more-button">
          {t("gameReviews.showMore")}⌄
        </button>
      )}
    </section>
  );
}

export default GameReviews;
