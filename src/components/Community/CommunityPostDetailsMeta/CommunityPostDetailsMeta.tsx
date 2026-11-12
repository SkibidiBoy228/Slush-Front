import "./CommunityPostDetailsMeta.css";

interface CommunityPostDetailsMetaProps {
  gameId: string;
  gameTitle: string;
  createdAt: string;
}

function CommunityPostDetailsMeta({
  gameId,
  gameTitle,
  createdAt,
}: CommunityPostDetailsMetaProps) {
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("uk-UA")
    : "";

  return (
    <div className="community-details-meta">
      <button
        type="button"
        className="community-details-meta-back"
        onClick={() => {
          window.location.href = `/game/${encodeURIComponent(
            gameId
          )}/community`;
        }}
        aria-label="Повернутися до спільноти"
      >
        ←
      </button>

      <div className="community-details-meta-game-icon">
        {gameTitle.charAt(0).toUpperCase()}
      </div>

      <div className="community-details-meta-info">
        <span className="community-details-meta-game-title">
          {gameTitle}
        </span>

        <span className="community-details-meta-date">
          {formattedDate}
        </span>
      </div>
    </div>
  );
}

export default CommunityPostDetailsMeta;