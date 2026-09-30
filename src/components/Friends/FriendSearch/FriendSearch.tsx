import "./FriendSearch.css";

interface FriendSearchProps {
  value: string;
  onChange: (value: string) => void;
}

function FriendSearch({
  value,
  onChange,
}: FriendSearchProps) {
  return (
    <div className="friend-search">
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

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Пошук за нікнеймом..."
      />
    </div>
  );
}

export default FriendSearch;