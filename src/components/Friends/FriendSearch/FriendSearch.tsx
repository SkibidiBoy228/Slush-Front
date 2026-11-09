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
  return (
    <div className="friend-search-group">
      <label className="friend-search">
        <SearchIcon />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Пошук за нікнеймом..."
          aria-label="Пошук за нікнеймом"
        />
      </label>

      {onGameIdChange && (
        <label className="friend-search friend-search-game">
          <SearchIcon />
          <input
            type="search"
            value={gameId}
            onChange={(event) => onGameIdChange(event.target.value)}
            placeholder="Пошук за грою..."
            aria-label="Пошук за грою"
          />
        </label>
      )}
    </div>
  );
}

export default FriendSearch;