import type { GameExtra } from "../../types/game";

interface GameBundleProps {
  bundles: GameExtra[];
}

function GameBundles({ bundles }: GameBundleProps) {
  if (!bundles.length) {
    return null;
  }

  return (
    <section className="game-extra-section">
      <div className="title-row">
        <h2>Комплекти</h2>
      </div>

      <div className="bundles-list">
        {bundles.map((bundle) => (
          <article className="bundle-card" key={bundle.id}>
            <img
              src={bundle.image}
              alt={bundle.title}
              className="bundle-image"
            />

            <div className="bundle-info">
              <h3>{bundle.title}</h3>

              <p>{bundle.description}</p>

              <strong>
                {bundle.price.toLocaleString("uk-UA")} ₴
              </strong>
            </div>

            <button className="cart-button">
              У кошик
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default GameBundles;