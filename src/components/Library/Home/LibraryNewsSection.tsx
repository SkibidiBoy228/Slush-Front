import type { CommunityPost } from "../../../types/library";
import LibraryNewsCard from "./LibraryNewsCard";
import "./LibraryNewsSection.css";

interface LibraryNewsSectionProps{
    news: CommunityPost[];
    onViewAll?: () => void;
}
function LibraryNewsSection({news, onViewAll}: LibraryNewsSectionProps){
    return(
        <section className="library-home-section">
            <div className="library-home-section__header">
                <h2>Новини</h2>
                {onViewAll && (
                    <button type="button"
                    className="library-home-section__link"
                    onClick={onViewAll}>
                        Усі новини <span aria-hidden = "true">›</span>
                    </button>
                )}
            </div>
            {news.length === 0 ? (
                <p className="library-home-section__empty">
                    Новин поки немає
                </p>
            ) : (
                <div className="library-news-grid">
                    {news.map((post)=> (
                        <LibraryNewsCard key={post.id}
                        post={post}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
export default LibraryNewsSection