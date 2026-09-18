interface GameDlcProps {
  dlcs: unknown[];
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
        {dlcs.map((_, index) => (
          <div className="dlc-row" key={index}>
            <div>
              <strong>DLC #{index + 1}</strong>
              <span>Додатковий контент</span>
            </div>

            <span className="dlc-price">Деталі</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default GameDlc;