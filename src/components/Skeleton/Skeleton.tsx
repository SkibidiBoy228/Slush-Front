import type { CSSProperties } from "react";

interface SkeletonProps {
  width?: string;
  height?: string;
  radius?: string;
  className?: string;
}

export function SkeletonBlock({
  width = "100%",
  height = "16px",
  radius = "8px",
  className = "",
}: SkeletonProps) {
  const style: CSSProperties = {
    width,
    height,
    borderRadius: radius,
  };

  return (
    <div
      className={`slush-skeleton ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

export function SkeletonGameCard({
  variant = "vertical",
}: {
  variant?: "vertical" | "wide" | "small";
}) {
  return (
    <div className={`skeleton-game-card skeleton-game-card--${variant}`}>
      <SkeletonBlock
        className="skeleton-game-image"
        height={variant === "wide" ? "150px" : variant === "small" ? "76px" : "145px"}
        radius="8px"
      />

      <div className="skeleton-game-info">
        <SkeletonBlock width="78%" height="13px" />
        <SkeletonBlock width="45%" height="11px" />
      </div>
    </div>
  );
}