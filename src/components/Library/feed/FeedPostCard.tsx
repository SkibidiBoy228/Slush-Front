import type { CommunityPost } from "../../../types/library";
import "./FeedPostCard.css";

interface FeedPostCardProps{
    post: CommunityPost;
}

function FeedPostCard({post}: FeedPostCardProps){
    const title = post.title?.trim() || "Без назви";
    const description = post.shortDescription?.trim() || post.content?.trim() || "";
    const formattedDate = post.createdAt || "";
    async function handleShare() {
        const shareData = `${title}\n${description}`;
        try{
            await navigator.clipboard.writeText(shareData);
        }catch(error){
            console.error("Не вдалося скопіювати публікацію:", error);
        }
    }
    return(
        <article className="feed-post">
            {post.mediaUrl && (
                <div className="feed-post_banner">
                    <img src={post.mediaUrl} alt=""  loading="lazy"/>
                </div>
            )}
            <div className="feed-post__content">
                <header className="feed-post__header">
                    <div className="feed-post__author">
                        {post.authorAvatarUrl ? (
                            <img className="feed-post__avatar"
                            src={post.authorAvatarUrl}
                            alt = ""
                            loading="lazy"
                            />
                        ) : (
                            <span className="feed-post__avatar feed-post__avatar--fallback">
                                {post.authorUsername?.charAt(0).toUpperCase() || "?"}
                            </span>
                        )}
                        <span className="feed-post__username">
                            {post.authorUsername}
                        </span>
                        <time className="feed-post__date">
                            {formattedDate}
                        </time>
                    </div>
                    <button className="feed-post__more"
                    type="button"
                    aria-label="Інші дії"
                    title="Інші дії">
                        ···
                    </button>
                </header>
                <h2 className="feed-post__title">{title}</h2>
                {description && (
                    <p className="feed-post__desctiption">{description}</p>
                )}
                <footer className="feed-post__actions">
                    <button className={`feed-post__action ${post.isLiked ? "feed-post__action--liked": ""}`}
                    type="button"
                    title="Вподобання"
                    aria-label={`Вподобання: ${post.likesCount}`}
                    >
                        <span className="feed-post__heart">♡</span>
                        <span>{post.likesCount}</span>
                    </button>
                    <button className="feed-post__action"
                    type="button"
                    title="Коментарі"
                    aria-label={`Коментарі: ${post.commentsCount}`}
                    >
                        <span className="feed-post__comment">▢</span>
                        <span>{post.commentsCount}</span>
                    </button>
                    <button className="feed-post__action"
                    type="button"
                    onClick={()=>void handleShare()}
                    >
                    <span>↥</span>
                    <span>Поділитись</span>
                    </button>
                </footer>
            </div>
        </article>
    )
}
export default FeedPostCard;