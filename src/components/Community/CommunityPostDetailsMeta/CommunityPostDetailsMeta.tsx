
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();

  const localeMap: Record<string, string> = {
    uk: "uk-UA",
    en: "en-US",
    sk: "sk-SK",
    ru: "ru-RU",
  };

  const locale =
    localeMap[i18n.language.split("-")[0]] || "uk-UA";

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(locale)
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
        aria-label={t("communityPostDetailsMeta.back")}
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
