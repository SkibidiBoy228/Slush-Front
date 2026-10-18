import type { CommunityPost } from "../../../types/library";
import LibraryNewsCard from "./LibraryNewsCard";
import "./CommunityHighlights.css";

interface CommunityHighlightsProps{
    posts: CommunityPost[];
    onViewAll?: ()=> void;
}
function CommunityHighlights({
    posts,
    onViewAll,
} : CommunityHighlightsProps){
    return(
        <section className="community-highlights">
            <div className="community-highlights__header">
                <h2>Цікаве від спільноти</h2>
                {onViewAll && (
                    <button type="button"
                    onClick={onViewAll}
                    className="community-highlights__link">
                        Моя стрічка <span aria-hidden="true">›</span>
                    </button>
                )}
            </div>
            {posts.length === 0 ? (
                <p className="community-highlights__empty">
                    Публікацій поки немає.
                </p>
            ): (
                <div className="community-highlights__grid">
                    {posts.map((post)=>(
                        <LibraryNewsCard
                            key={post.id}
                            post={post}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}
export default CommunityHighlights;