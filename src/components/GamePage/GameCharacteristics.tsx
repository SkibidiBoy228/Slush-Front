
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";

import type { GameDetails } from "../../types/game";

interface GameCharacteristicsProps {
  game: GameDetails;
}

function GameCharacteristics({
  game,
}: GameCharacteristicsProps) {
  const { t } = useTranslation();

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
          <h2>{t("gameCharacteristics.minimum")}</h2>

          {minimum ? (
            <div
              className="requirements-content"
              dangerouslySetInnerHTML={{
                __html: minimum,
              }}
            />
          ) : (
            <p className="empty-requirements">
              {t("gameCharacteristics.minimumUnavailable")}
            </p>
          )}
        </section>

        <section className="requirements-column">
          <h2>{t("gameCharacteristics.recommended")}</h2>

          {recommended ? (
            <div
              className="requirements-content"
              dangerouslySetInnerHTML={{
                __html: recommended,
              }}
            />
          ) : (
            <p className="empty-requirements">
              {t("gameCharacteristics.recommendedUnavailable")}
            </p>
          )}
        </section>
      </div>
    </section>
  );
}

export default GameCharacteristics;
