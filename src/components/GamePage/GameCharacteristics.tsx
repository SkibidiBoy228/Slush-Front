import DOMPurify from "dompurify";

import type { GameDetails } from "../../types/game";

interface GameCharacteristicsProps {
  game: GameDetails;
}

function GameCharacteristics({
  game,
}: GameCharacteristicsProps) {
  const minimum = DOMPurify.sanitize(
    game.pcRequirements?.minimum ?? ""
  );

  const recommended = DOMPurify.sanitize(
    game.pcRequirements?.recommended ?? ""
  );

  return (
    <section className="game-characteristics">
      <div className="platform-selector">
        <span className="platform-icon">▣</span>
        <strong>Windows</strong>
        <span className="platform-arrow">⌄</span>
      </div>

      <div className="requirements-grid">
        <section className="requirements-column">
          <h2>Мінімальні налаштування</h2>

          {minimum ? (
            <div
              className="requirements-content"
              dangerouslySetInnerHTML={{
                __html: minimum,
              }}
            />
          ) : (
            <p className="empty-requirements">
              Мінімальні вимоги відсутні.
            </p>
          )}
        </section>

        <section className="requirements-column">
          <h2>Рекомендовані налаштування</h2>

          {recommended ? (
            <div
              className="requirements-content"
              dangerouslySetInnerHTML={{
                __html: recommended,
              }}
            />
          ) : (
            <p className="empty-requirements">
              Рекомендовані вимоги відсутні.
            </p>
          )}
        </section>
      </div>
    </section>
  );
}

export default GameCharacteristics;