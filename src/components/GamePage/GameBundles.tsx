
import { useTranslation } from "react-i18next";
import type { GameExtra } from "../../types/game";
import { formatPrice } from "../../utils/price";

interface GameBundleProps {
  bundles: GameExtra[];
  fallbackImage: string;
}

function GameBundles({
  bundles,
  fallbackImage,
}: GameBundleProps) {
  const { t } = useTranslation();

  if (!bundles.length) {
    return null;
  }

  return (
    <section className="game-extra-section">
      <div className="title-row">
        <h2>{t("gameBundles.title")}</h2>
      </div>

      <div className="bundles-list">
        {bundles.map((bundle) => (
          <article className="bundle-card" key={bundle.id}>
            <img
              src={bundle.image || fallbackImage}
              alt={bundle.title}
              className="bundle-image"
            />

            <div className="bundle-info">
              <h3>{bundle.title}</h3>

              <p>{bundle.description}</p>

              <strong className="bundle-price">
                {formatPrice(bundle.price)}
              </strong>
            </div>

            <button className="cart-button">
              {t("gameBundles.addToCart")}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default GameBundles;
