
import { useTranslation } from "react-i18next";
import "./FriendSearch.css";

interface FriendSearchProps {
  value: string;
  onChange: (value: string) => void;
  gameId?: string;
  onGameIdChange?: (value: string) => void;
}

function SearchIcon() {
  return (
    <svg
      className="friend-search-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="6.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M16 16L21 21"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FriendSearch({
  value,
  onChange,
  gameId = "",
  onGameIdChange,
}: FriendSearchProps) {
  const { t } = useTranslation();

  return (
    <div className="friend-search-group">
      <label className="friend-search">
        <SearchIcon />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t("friendSearch.usernamePlaceholder")}
          aria-label={t("friendSearch.usernameLabel")}
        />
      </label>

      {onGameIdChange && (
        <label className="friend-search friend-search-game">
          <SearchIcon />
          <input
            type="search"
            value={gameId}
            onChange={(event) => onGameIdChange(event.target.value)}
            placeholder={t("friendSearch.gamePlaceholder")}
            aria-label={t("friendSearch.gameLabel")}
          />
        </label>
      )}
    </div>
  );
}

export default FriendSearch;
