
import { useTranslation } from "react-i18next";
import "./CommuntiyHeader.css";

interface CommuntiyHeaderProps {
  gameTitle: string;
  subscribersCount: number;
  isSubscribed: boolean;
  onSubscribe: () => void;
}

function CommuntiyHeader({
  gameTitle,
  subscribersCount,
  isSubscribed,
  onSubscribe,
}: CommuntiyHeaderProps) {
  const { t, i18n } = useTranslation();

  const numberLocale: Record<string, string> = {
    uk: "uk-UA",
    en: "en-US",
    sk: "sk-SK",
    ru: "ru-RU",
  };

  const locale = numberLocale[i18n.language] || "uk-UA";

  return (
    <section className="community-header">
      <div className="community-header-info">
        <h1>{t("communityHeader.title", { gameTitle })}</h1>
        <span>
          {t("communityHeader.subscribers", {
            count: subscribersCount,
            formattedCount: subscribersCount.toLocaleString(locale),
          })}
        </span>
      </div>

      <button
        className={`community-subscribe-button ${
          isSubscribed ? "subscribed" : ""
        }`}
        onClick={onSubscribe}
      >
        {isSubscribed
          ? t("communityHeader.subscribed")
          : t("communityHeader.subscribe")}
      </button>
    </section>
  );
}

export default CommuntiyHeader;
