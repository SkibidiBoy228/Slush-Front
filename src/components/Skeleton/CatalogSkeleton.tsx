import {SkeletonGameCard } from "./Skeleton";
import "./Skeleton.css";
import "./PageSkeletons.css";

interface CatalogSkeletonProps {
  viewMode?: "grid" | "list";
}

function CatalogSkeleton({
  viewMode = "grid",
}: CatalogSkeletonProps) {
  return (
    <div
      className={`catalog-skeleton ${
        viewMode === "list" ? "catalog-skeleton--list" : ""
      }`}
      aria-label="Loading"
    >
      {Array.from({ length: 12 }).map((_, index) => (
        <SkeletonGameCard
          key={index}
          variant={viewMode === "list" ? "small" : "vertical"}
        />
      ))}
    </div>
  );
}

export default CatalogSkeleton;