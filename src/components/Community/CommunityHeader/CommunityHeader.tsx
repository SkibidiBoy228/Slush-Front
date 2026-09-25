import "./CommuntiyHeader.css"

interface CommuntiyHeaderProps{
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
} : CommuntiyHeaderProps){
    return(
        <section className="community-header">
            <div className="community-header-info">
                <h1>{gameTitle} - Спільнота</h1>
                <span>
                    {subscribersCount.toLocaleString("uk-UA")} підписників
                </span>
            </div>
            <button className={`community-subscribe-button ${isSubscribed ? "subscribed": ""}`} onClick={onSubscribe}>
                {isSubscribed ? "Ви підписані" : "Підписатися"}
            </button>
        </section>
    )
}
export default CommuntiyHeader;