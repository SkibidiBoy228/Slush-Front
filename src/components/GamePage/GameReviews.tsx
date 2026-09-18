import type { GameReview } from "../../types/game";

interface GameReviewsProps {
  reviews: GameReview[];
  averageRating: number;
}

function GameReviews({
  reviews,
  averageRating,
}: GameReviewsProps) {
  return (
    <section className="game-reviews-section">
      <div className="section-title-row">
        <h2>Відгуки</h2>

        <button className="outline-button">
          Написати рецензію
        </button>
      </div>

      <div className="reviews-toolbar">
        <span>
          Середній рейтинг:{" "}
          <strong>{averageRating.toFixed(1)}</strong>
        </span>

        <button className="review-sort">
          Сортування: Спочатку популярні ▾
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="empty-reviews">
          Поки що немає відгуків про цю гру.
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

                <button className="review-more">•••</button>
              </div>

              <p className="review-text">
                {review.text || "Користувач не залишив текстового відгуку."}
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
          Показати більше⌄
        </button>
      )}
    </section>
  );
}

export default GameReviews;