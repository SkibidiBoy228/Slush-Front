import type { GameDetails } from "../../types/game";
import { formatPrice } from "../../utils/price";

interface GameSidebarProps {
  game: GameDetails;
}

function GameSideBar({ game }: GameSidebarProps) {
  const formattedPrice = formatPrice(game.price);
  const formattedOldPrice = formatPrice(game.oldPrice);

  return (
    <aside className="game-sidebar">
      <div className="game-rating">
        <strong>{game.averageRating.toFixed(1)}</strong>

        <div className="rating-stars">
          {Array.from({ length: 5 }).map((_, index) => (
            <span
              key={index}
              className={
                index < Math.round(game.averageRating)
                  ? "filled"
                  : ""
              }
            >
              ★
            </span>
          ))}
        </div>
      </div>

      <img
        className="sidebar-cover"
        src={game.thumbnail}
        alt={game.title}
      />

      <div className="sidebar-price">
        {game.discountPercent > 0 && (
          <span className="sidebar-discount">
            -{game.discountPercent}%
          </span>
        )}

        <strong>{formattedPrice}</strong>

        {game.oldPrice > game.price && (
          <del>{formattedOldPrice}</del>
        )}
      </div>

      <button className="buy-button">Купити</button>

      <div className="sidebar-actions">
        <button className="cart-button">
          {game.isInCart ? "У кошику" : "Додати в кошик"}
        </button>

        <button
          className="wishlist-button"
          aria-label="Додати в обране"
        >
          {game.isInWishlist ? "♥" : "♡"}
        </button>
      </div>

      <div className="game-secondary-actions">
        <button>↗ Репост</button>
        <button>⚑ Поскаржитись</button>
      </div>

      <div className="game-metadata">
        <div>
          <span>Дата виходу</span>
          <strong>{game.releaseDate || "Невідомо"}</strong>
        </div>

        <div>
          <span>Розробник</span>
          <strong>{game.developer || "Невідомо"}</strong>
        </div>

        <div>
          <span>Видавець</span>
          <strong>{game.publisher || "Невідомо"}</strong>
        </div>

        <div>
          <span>Платформи</span>
          <strong>Windows</strong>
        </div>
      </div>

      <div className="frined-block">
        <h3>Друзі грають</h3>

        {game.friendsPlaying.length > 0 ? (
          game.friendsPlaying.map((friend) => (
            <div
              className="friend-row"
              key={friend.username}
            >
              <div className="friend-avatar">
                {friend.username.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{friend.username}</strong>
                <span>{friend.status}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="empty-sidebar-text">
            Ніхто з друзів зараз не грає
          </p>
        )}
      </div>
    </aside>
  );
}

export default GameSideBar;