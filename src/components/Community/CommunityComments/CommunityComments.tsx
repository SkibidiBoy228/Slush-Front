import { useEffect,useState } from "react";

import type { PostComment } from "../../../types/community";
import "./CommunityComments.css"

interface CommunityCommentsProps{
    postId: string;
    comments: PostComment[];
    loading?: boolean;
    onLoad: (postId: string) => void;
    onSubmit: (
        postId: string,
        content: string,
        parentCommentId?: string | null,
    ) => Promise<void>;
}

function CommunityComments({
    postId,
    comments,
    loading = false,
    onLoad,
    onSubmit,
}: CommunityCommentsProps){
    const [content, setContent] = useState("");
    const [replyTo, setReplyTo] = useState<PostComment | null>(null);
    const [submitting, setSubmitting] = useState(false);
    useEffect(()=>{
        onLoad(postId);
    }, [postId,onLoad]);

    const handleSumbit = async(
        event: React.FormEvent<HTMLFormElement>
    )=>{
        event.preventDefault();
        const text = content.trim();
        if(!text  || submitting){
            return;
        }
        try{
            setSubmitting(true);
            await onSubmit(
                postId,
                text,
                replyTo?.id ?? null
            );
            setContent("");
            setReplyTo(null);
        }finally {
            setSubmitting(false);
        }
    };
    const renderComment = (
        comment: PostComment,
        isReply = false,
    )=>{
        return(
            <div key={comment.id}
            className={`community-comment ${isReply ? "community-comment-reply" : ""}`}>
                <button
                    type="button"
                    className="community-comment-author-link"
                    onClick={() => {
                        window.location.href = `/profile/${encodeURIComponent(
                            comment.authorUsername
                        )}`;
                    }}
                >
                    <div className="community-comment-avatar">
                        {comment.authorAvatarUrl ? (
                            <img
                                src={comment.authorAvatarUrl}
                                alt={comment.authorUsername}
                            />
                        ) : (
                            <span>
                                {comment.authorUsername.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                </button>
                <div className="community-comment-body">
                    <div className="community-comment-header">
                        <button
                            type="button"
                            className="community-comment-author community-comment-author-name"
                            onClick={() => {
                                window.location.href = `/profile/${encodeURIComponent(
                                    comment.authorUsername
                                )}`;
                            }}
                        >
                            {comment.authorUsername}
                        </button>
                        <span className="community-comment-date">
                            {comment.createdAt}
                        </span>
                    </div>
                    <p className="community-comment-content">
                        {comment.content}
                    </p>
                    <button type ="button"
                        className="community-comment-reply-button"
                        onClick={()=>setReplyTo(comment)}
                        >
                            Відповісти
                        </button>
                        {comment.replies?.length > 0 && (
                            <div className="community-comment-replies">
                                {comment.replies.map((reply)=>renderComment(reply,true

                                ))}
                            </div>
                        )}
                </div>
            </div>
        );
    };
    return(
        <section className="community-comments">
            <div className="community-comments-title">
                <h3>Коментарі</h3>
            </div>
            {replyTo && (
                <div className="community-reply-indicator">
                    <span>
                        Відповідь для {""}
                        <strong>{replyTo.authorUsername}</strong>
                    </span>
                    <button type="button" onClick={()=> setReplyTo(null)}>
                        Скасувати
                    </button>
                </div>
            )}
            <form className="community-comment-form" onSubmit={handleSumbit}>
                <textarea value = {content}
                    onChange={(event)=>setContent(event.target.value)}
                    placeholder={
                        replyTo ? `Відповісти ${replyTo.authorUsername}...` : "Напишіть коментар..."
                    }
                    rows = {3}
                    disabled = {submitting}/>
                    <div className="community-comment-form-actions">
                        <button type = "submit"
                        disabled={!content.trim() || submitting}>
                            {submitting ? "Надсилання..." : "Надіслати"}
                        </button>
                    </div>
            </form>
            <div className="community-comments-list">
                {loading ? (
                    <div className="community-comments-state">
                        Завантаження коментарів...
                    </div>
                ):comments.length === 0 ? (
                    <div className="community-comments-state">
                        Поки що немає коментарів.
                    </div>
                ):(
                    comments.map((comment) => renderComment(comment))
                )}
            </div>
        </section>
    )
}
export default CommunityComments;