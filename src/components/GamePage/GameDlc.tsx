import type { GameExtra } from "../../types/game";
import { formatPrice } from "../../utils/price";

interface GameDlcProps {
  dlcs: GameExtra[];
}

function GameDlc({ dlcs }: GameDlcProps) {
  if (!dlcs.length) {
    return null;
  }

  return (
    <section className="game-extra-section">
      <div className="section-title-row">
        <h2>Інший контент</h2>

        <button className="more-link">
          Усі DLC →
        </button>
      </div>

      <div className="dlc-list">
        {dlcs.map((dlc) => (
          <article className="dlc-row" key={dlc.id}>
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
              {formatPrice(dlc.price)}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default GameDlc;