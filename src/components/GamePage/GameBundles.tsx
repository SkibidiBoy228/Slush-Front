interface GameBundleProps {
  bundles: unknown[];
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
        {bundles.map((_, index) => (
          <article className="bundle-card" key={index}>
            <div>
              <h3>Комплект {index + 1}</h3>
              <p></p>
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