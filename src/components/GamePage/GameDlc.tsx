
import { useTranslation } from "react-i18next";
import type { GameExtra } from "../../types/game";
import { formatPrice } from "../../utils/price";

interface GameDlcProps {
  dlcs: GameExtra[];
  gameId: string;
}

function GameDlc({
  dlcs,
  gameId,
}: GameDlcProps) {
  const { t } = useTranslation();

  if (!dlcs.length) {
    return null;
  }

  return (
    <section className="game-extra-section">
      <div className="section-title-row">
        <h2>{t("gameDlc.title")}</h2>

        <button
          className="more-link"
          onClick={() => {
            window.location.href = `/game/${gameId}/dlc`;
          }}
        >
          {t("gameDlc.allDlc")} →
        </button>
      </div>

      <div className="dlc-list">
        {dlcs.map((dlc) => (
          <button
            className="dlc-row"
            key={dlc.id}
            onClick={() => {
              window.location.href =
                `/game/${gameId}/dlc/${dlc.id}`;
            }}
          >
            <img
              src={dlc.image}
              alt={dlc.title}
              className="dlc-image"
            />

            <div className="dlc-info">
              <strong>{dlc.title}</strong>
              <span>{dlc.description}</span>
            </div>

            <span className="dlc-price">
              {dlc.price > 0
                ? formatPrice(dlc.price)
                : t("common.free")}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default GameDlc;
