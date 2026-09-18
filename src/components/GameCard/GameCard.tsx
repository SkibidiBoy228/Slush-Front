import "./GameCard.css";

export interface Game {
  id: string;
  title: string;
  image: string;
  price: string;
  oldPrice?: string;
  discount?: string;
}

interface GameCardProps {
  game: Game;
  variant?: "wide" | "vertical" | "small";
}

function GameCard({
  game,
  variant = "wide",
}: GameCardProps) {
  return (
    <article className={`game-card game-card-${variant}`}>
      <div className="game-image-wrapper">
        <img
          className="game-image"
          src={game.image}
          alt={game.title}
        />

        {game.discount && (
          <span className="discount">
            {game.discount}
          </span>
        )}
      </div>

      <div className="game-info">
        <h3>{game.title}</h3>

        <div className="price-row">
          <span className="game-price">
            {game.price}
          </span>

          {game.oldPrice && (
            <span className="old-price">
              {game.oldPrice}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default GameCard;