import GameCard, {
  type Game,
} from "../GameCard/GameCard";

import "./GameSection.css";

interface GameSectionProps {
  title: string;
  games: Game[];
  variant: "wide" | "vertical";
}

function GameSection({
  title,
  games,
  variant,
}: GameSectionProps) {
  return (
    <section className={`game-section game-section-${variant}`}>
      <div className="section-heading">
        <h2>{title}</h2>

        <button className="more-button">
          Дивитись більше <span>›</span>
        </button>
      </div>

      <div className="games-row">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            variant={variant}
          />
        ))}
      </div>
    </section>
  );
}

export default GameSection;